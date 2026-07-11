/**
 * Phase 1 Upload Manager
 *
 * Orchestrates Stage 1 (File Ingestion) of the DCCS Clearance Pipeline:
 *   1. Validate file type and size
 *   2. Create the uploads database record (status = uploading)
 *   3. Upload bytes to Supabase Storage
 *   4. Hand off to DCCSPipeline for Stages 2–5
 *   5. Mark the uploads record as completed with public URL
 *
 * The DCCSPipeline call is non-blocking for the upload — if it fails,
 * the file is still available but has no DCCS code assigned.
 */

import { supabase }                            from './supabase';
import { validateFile, sanitizeFileName, getMediaDuration } from './fileValidator';
import { PHASE_1_CONFIG }                      from '../config/phase1';
import { errorHandler, ErrorCategory }         from './ErrorHandler';
import { DCCSPipeline }                        from './services/DCCSPipeline';

// ---------------------------------------------------------------------------
// Canonical bucket router — single source of truth shared with Phase1Downloads
// ---------------------------------------------------------------------------

export function getBucketForCategory(category: string): string {
  if (category === 'video' || category === 'image') return 'video-content';
  return 'audio-files';
}

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface Phase1UploadProgress {
  uploadId:         string;
  fileName:         string;
  progress:         number;
  status:           'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?:           string;
  url?:             string;
  dccsClearanceCode?: string;
}

export interface Phase1UploadOptions {
  onProgress?: (progress: Phase1UploadProgress) => void;
  description?: string;
  maxRetries?:  number;
  retryDelay?:  number;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

class Phase1UploadManager {
  private activeUploads: Map<string, AbortController> = new Map();
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 2000;

  private async retryOperation<T>(
    operation:     () => Promise<T>,
    maxRetries:    number,
    retryDelay:    number,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
        return await operation();
      } catch (err) {
        lastError = err as Error;

        if (attempt === maxRetries) break;

        // Do not retry validation or permission errors — they will never succeed.
        const message = (err as Error).message ?? '';
        const isRetryable = !message.includes('Invalid') &&
                            !message.includes('validation') &&
                            !message.includes('permission denied');
        if (!isRetryable) throw err;
      }
    }

    throw lastError ?? new Error(`${operationName} failed after ${maxRetries} retries`);
  }

  async uploadFile(
    file:    File,
    options: Phase1UploadOptions = {}
  ): Promise<Phase1UploadProgress> {
    const uploadId        = crypto.randomUUID();
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    const maxRetries = options.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const retryDelay = options.retryDelay ?? this.DEFAULT_RETRY_DELAY;

    try {
      // ── Stage 1a: File validation ────────────────────────────────────────
      const validation = validateFile(file);
      if (!validation.valid) {
        const handled = errorHandler.handleError(
          new Error(validation.error),
          ErrorCategory.VALIDATION,
          'File validation'
        );
        throw new Error(handled.userMessage);
      }

      const progress: Phase1UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status:   'pending',
      };
      options.onProgress?.(progress);

      // ── Stage 1b: Auth check ─────────────────────────────────────────────
      const { data: { user } } = await this.retryOperation(
        async () => {
          const result = await supabase.auth.getUser();
          if (result.error || !result.data.user) {
            throw new Error('User not authenticated. Please log in again.');
          }
          return result;
        },
        maxRetries,
        retryDelay,
        'User authentication check'
      );

      if (!user) {
        throw new Error('Authentication failed. Please log in and try again.');
      }

      const sanitizedName = sanitizeFileName(file.name);
      const storagePath   = `${user.id}/${Date.now()}_${sanitizedName}`;
      const duration      = await getMediaDuration(file);

      progress.status   = 'uploading';
      progress.progress = 10;
      options.onProgress?.(progress);

      // ── Stage 1c: Create uploads row (status = uploading) ────────────────
      const { data: uploadRecord, error: dbError } = await this.retryOperation(
        async () => {
          const result = await supabase
            .from('uploads')
            .insert({
              user_id:           user.id,
              file_name:         file.name,
              file_type:         file.type,
              file_size:         file.size,
              file_category:     validation.fileCategory,
              storage_path:      storagePath,
              upload_status:     'uploading',
              duration,
              original_filename: file.name,
              sanitized_filename: sanitizedName,
            })
            .select()
            .single();

          if (result.error) throw result.error;
          return result;
        },
        maxRetries,
        retryDelay,
        'Database record creation'
      );

      if (dbError || !uploadRecord) {
        const handled = errorHandler.handleError(
          dbError ?? new Error('Failed to create upload record'),
          ErrorCategory.DATABASE,
          'Upload record creation'
        );
        throw new Error(handled.userMessage);
      }

      progress.progress = 30;
      options.onProgress?.(progress);

      // ── Stage 1d: Upload to Supabase Storage ─────────────────────────────
      const bucket = getBucketForCategory(validation.fileCategory);

      const { error: uploadError } = await this.retryOperation(
        async () => {
          const contentType = file.type || 'application/octet-stream';
          const result = await supabase.storage
            .from(bucket)
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert:       false,
              contentType,
            });

          if (result.error) throw result.error;
          return result;
        },
        maxRetries,
        retryDelay,
        'File storage upload'
      );

      if (uploadError) {
        const handled = errorHandler.handleError(uploadError, ErrorCategory.STORAGE, 'Storage upload');
        await supabase.from('uploads').update({ upload_status: 'failed' }).eq('id', uploadRecord.id);
        throw new Error(`Storage upload failed: ${handled.userMessage}`);
      }

      // Store the storage path in the DB; actual file access uses signed URLs at read time.
      const fileRef = storagePath;

      if (!fileRef || fileRef.trim() === '') {
        await supabase.from('uploads').update({ upload_status: 'failed' }).eq('id', uploadRecord.id);
        throw new Error('Storage upload succeeded but file path could not be resolved. Please try again.');
      }

      progress.url      = fileRef;
      progress.progress = 70;
      progress.status   = 'processing';
      options.onProgress?.(progress);

      // ── Stages 2–5: DCCS Clearance Pipeline ──────────────────────────────
      let dccsClearanceCode: string | undefined;

      if (PHASE_1_CONFIG.UPLOAD.GENERATE_DCCS_CODE) {
        const pipelineResult = await DCCSPipeline.run({
          uploadId:     uploadRecord.id,
          userId:       user.id,
          file,
          fileCategory: validation.fileCategory ?? 'document',
          fileName:     file.name,
          fileSize:     file.size,
          fileType:     file.type || 'application/octet-stream',
        });

        if (pipelineResult.success) {
          dccsClearanceCode = pipelineResult.clearanceCode;
        } else {
          // Non-fatal — upload still completes without a code
          console.warn('[UPLOAD] DCCS pipeline did not complete:', pipelineResult.error);
        }
      }

      progress.progress = 90;
      options.onProgress?.(progress);

      // ── Stage 1e: Mark upload completed ──────────────────────────────────
      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          upload_status: 'completed',
          file_url:      publicUrl,
        })
        .eq('id', uploadRecord.id);

      if (updateError) {
        console.error('[UPLOAD] Failed to mark upload completed:', updateError);
        throw new Error(`Upload finalization failed: ${updateError.message}`);
      }

      progress.status           = 'completed';
      progress.progress         = 100;
      progress.dccsClearanceCode = dccsClearanceCode;
      options.onProgress?.(progress);

      return progress;

    } catch (err) {
      const handled = errorHandler.handleError(
        err,
        ErrorCategory.UPLOAD,
        `Upload file: ${file.name}`
      );

      const failedProgress: Phase1UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status:   'failed',
        error:    handled.userMessage,
      };

      options.onProgress?.(failedProgress);
      throw new Error(handled.userMessage);
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  cancelUpload(uploadId: string): void {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
    }
  }

  cancelAllUploads(): void {
    this.activeUploads.forEach(c => c.abort());
    this.activeUploads.clear();
  }
}

export const phase1UploadManager = new Phase1UploadManager();
