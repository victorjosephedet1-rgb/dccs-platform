/**
 * Phase 1 Upload Manager
 *
 * Simplified upload manager that wraps the full uploadManager
 * and disables all Phase 2+ features for Phase 1 compliance.
 *
 * Phase 1 Features Only:
 * - Basic file upload
 * - Immediate availability
 * - No payment required
 * - No DCCS code generation
 * - No AI detection
 * - No fingerprinting
 */

import { supabase } from './supabase';
import { validateFile, sanitizeFileName, getMediaDuration } from './fileValidator';
import { PHASE_1_CONFIG } from '../config/phase1';
import { errorHandler, ErrorCategory } from './ErrorHandler';

export interface Phase1UploadProgress {
  uploadId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  url?: string;
}

export interface Phase1UploadOptions {
  onProgress?: (progress: Phase1UploadProgress) => void;
  description?: string;
  maxRetries?: number;
  retryDelay?: number;
}

class Phase1UploadManager {
  private activeUploads: Map<string, AbortController> = new Map();
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 2000;

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    retryDelay: number,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[UPLOAD RETRY] Retrying ${operationName}, attempt ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[UPLOAD] ${operationName} failed, attempt ${attempt + 1}/${maxRetries + 1}:`, error);

        if (attempt === maxRetries) {
          break;
        }

        const isRetryable = !error.message?.includes('Invalid') &&
                           !error.message?.includes('validation') &&
                           !error.message?.includes('permission denied');

        if (!isRetryable) {
          throw error;
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${maxRetries} retries`);
  }

  async uploadFile(
    file: File,
    options: Phase1UploadOptions = {}
  ): Promise<Phase1UploadProgress> {
    const uploadId = crypto.randomUUID();
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    console.log('[UPLOAD] Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadId
    });

    const maxRetries = options.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const retryDelay = options.retryDelay ?? this.DEFAULT_RETRY_DELAY;

    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        const validationError = errorHandler.handleError(
          new Error(validation.error),
          ErrorCategory.VALIDATION,
          'File validation'
        );
        console.error('[UPLOAD ERROR] File validation failed:', {
          fileName: file.name,
          error: validation.error
        });
        throw new Error(validationError.userMessage);
      }

      console.log('[UPLOAD] File validation passed:', {
        category: validation.fileCategory,
        fileName: file.name
      });

      const progress: Phase1UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
      };

      options.onProgress?.(progress);

      const { data: { user }, error: authError } = await this.retryOperation(
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

      if (authError || !user) {
        const authErrorDetails = errorHandler.handleError(
          authError || new Error('User not authenticated'),
          ErrorCategory.AUTH,
          'Upload authentication check'
        );
        console.error('[UPLOAD ERROR] User authentication failed:', authErrorDetails);
        throw new Error(authErrorDetails.userMessage);
      }

      console.log('[UPLOAD] User authenticated:', { userId: user.id });

      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const storagePath = `${user.id}/${timestamp}_${sanitizedName}`;

      console.log('[UPLOAD] Storage path generated:', { storagePath });

      const duration = await getMediaDuration(file);

      progress.status = 'uploading';
      progress.progress = 10;
      options.onProgress?.(progress);

      console.log('[UPLOAD] Creating database record...');

      const { data: uploadRecord, error: dbError } = await this.retryOperation(
        async () => {
          const result = await supabase
            .from('uploads')
            .insert({
              user_id: user.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              file_category: validation.fileCategory,
              storage_path: storagePath,
              upload_status: 'uploading',
              duration,
              original_filename: file.name,
              sanitized_filename: sanitizedName,
            })
            .select()
            .single();

          if (result.error) {
            throw result.error;
          }

          return result;
        },
        maxRetries,
        retryDelay,
        'Database record creation'
      );

      if (dbError || !uploadRecord) {
        const dbErrorDetails = errorHandler.handleError(
          dbError || new Error('Failed to create upload record'),
          ErrorCategory.DATABASE,
          'Upload record creation'
        );
        console.error('[UPLOAD ERROR] Database record creation failed:', dbErrorDetails);
        throw new Error(dbErrorDetails.userMessage);
      }

      console.log('[UPLOAD] Database record created:', { uploadId: uploadRecord.id });

      progress.progress = 30;
      options.onProgress?.(progress);

      const bucket = validation.fileCategory === 'video' ? 'video-content' : 'audio-files';

      console.log('[UPLOAD] Uploading to storage bucket:', { bucket, storagePath });

      const { error: uploadError } = await this.retryOperation(
        async () => {
          const result = await supabase.storage
            .from(bucket)
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
              duplex: 'half',
            });

          if (result.error) {
            throw result.error;
          }

          return result;
        },
        maxRetries,
        retryDelay,
        'File storage upload'
      );

      if (uploadError) {
        const storageErrorDetails = errorHandler.handleError(
          uploadError,
          ErrorCategory.STORAGE,
          'Storage upload'
        );
        console.error('[UPLOAD ERROR] Storage upload failed:', storageErrorDetails);

        await supabase.from('uploads').update({ upload_status: 'failed' }).eq('id', uploadRecord.id);
        throw new Error(storageErrorDetails.userMessage);
      }

      console.log('[UPLOAD SUCCESS] File uploaded to storage successfully');

      progress.progress = 70;
      progress.status = 'processing';
      options.onProgress?.(progress);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      console.log('[UPLOAD] Public URL generated:', { publicUrl });

      progress.url = publicUrl;
      progress.progress = 90;
      options.onProgress?.(progress);

      const { error: updateError } = await supabase
        .from('uploads')
        .update({
          upload_status: 'completed',
          file_url: publicUrl,
        })
        .eq('id', uploadRecord.id);

      if (updateError) {
        console.error('[UPLOAD ERROR] Failed to update upload record:', updateError);
        throw new Error(`Update error: ${updateError.message}`);
      }

      console.log('[UPLOAD SUCCESS] Upload completed successfully:', {
        uploadId: uploadRecord.id,
        fileName: file.name,
        url: publicUrl
      });

      progress.status = 'completed';
      progress.progress = 100;
      options.onProgress?.(progress);

      return progress;
    } catch (error) {
      const uploadErrorDetails = errorHandler.handleError(
        error,
        ErrorCategory.UPLOAD,
        `Upload file: ${file.name}`
      );

      console.error('[UPLOAD ERROR] Upload failed with error:', {
        uploadId,
        fileName: file.name,
        errorCode: uploadErrorDetails.code,
        error: uploadErrorDetails.message,
        userMessage: uploadErrorDetails.userMessage,
        stack: error instanceof Error ? error.stack : undefined
      });

      const failedProgress: Phase1UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status: 'failed',
        error: uploadErrorDetails.userMessage,
      };

      options.onProgress?.(failedProgress);
      throw new Error(uploadErrorDetails.userMessage);
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
    this.activeUploads.forEach((controller) => controller.abort());
    this.activeUploads.clear();
  }
}

export const phase1UploadManager = new Phase1UploadManager();
