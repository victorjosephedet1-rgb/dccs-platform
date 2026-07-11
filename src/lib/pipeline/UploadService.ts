/**
 * UploadService
 *
 * Orchestrates the Phase 1 DCCS clearance pipeline for a single file upload.
 * Replaces the monolithic phase1UploadManager with a modular service that:
 *   - Drives the ClearanceStateMachine through each stage
 *   - Emits structured SystemEvents at every transition
 *   - Calls FingerprintService, OwnershipRecord, and DCCSPipeline as
 *     separate, independently testable units
 *   - Reports granular progress to the caller via an onProgress callback
 *
 * Responsibilities:
 *   Stage 1 — INGESTED:         File validation + Supabase Storage upload
 *   Stage 2 — FINGERPRINTED:    SHA-256 hash generation
 *   Stage 3 — BOUND_TO_CREATOR: Ownership record written to dccs_fingerprints
 *   Stage 4 — CODE_ISSUED:      DCCS clearance code generated
 *   Stage 5 — VERIFIED:         Certificate row created and integrity confirmed
 *   Stage 6 — LOCKED:           Upload row marked completed, pipeline locked
 *   Stage 7 — DISTRIBUTED:      File publicly accessible via signed URL
 */

import { supabase }                              from '../supabase';
import { validateFile, sanitizeFileName, getMediaDuration } from '../fileValidator';
import { generateFingerprint }                   from '../services/FingerprintService';
import { createOwnershipRecord }                 from '../services/OwnershipRecord';
import { DCCSPipeline }                          from '../services/DCCSPipeline';
import { ClearanceStateMachine, PipelineStage, STAGE_LABELS } from './ClearanceStateMachine';
import { SystemEventBus }                        from '../events/SystemEventBus';
import { errorHandler, ErrorCategory }           from '../ErrorHandler';
import { getBucketForCategory }                  from '../phase1UploadManager';
import { PHASE_1_CONFIG }                        from '../../config/phase1';
import { logger }                                from '../../utils/logger';
import { SystemLogger }                          from '../monitoring/SystemLogger';

// ─── Public contracts ─────────────────────────────────────────────────────────

export interface UploadProgress {
  uploadId:           string;
  fileName:           string;
  stage:              PipelineStage;
  stageLabel:         string;
  progressPercent:    number;
  status:             'running' | 'completed' | 'failed';
  dccsClearanceCode?: string;
  dccsOwnershipCode?: string;
  certificateId?:     string;
  fileUrl?:           string;
  error?:             string;
}

export interface UploadServiceOptions {
  onProgress?: (progress: UploadProgress) => void;
  maxRetries?: number;
  retryDelay?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelay: number,
  name: string
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable =
        !message.includes('validation') &&
        !message.includes('permission denied') &&
        !message.includes('not authenticated');

      if (!isRetryable || attempt > maxRetries) {
        logger.error(`[UploadService] ${name} failed after ${attempt} attempts:`, err);
        throw err;
      }

      const delay = baseDelay * attempt;
      logger.warn(`[UploadService] ${name} attempt ${attempt} failed, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class UploadService {
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 2000;

  async upload(
    file: File,
    options: UploadServiceOptions = {}
  ): Promise<UploadProgress> {
    const maxRetries = options.maxRetries ?? this.DEFAULT_MAX_RETRIES;
    const retryDelay = options.retryDelay ?? this.DEFAULT_RETRY_DELAY;

    // ── Pre-flight: validate file before touching any external service ────────
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error ?? 'File validation failed.');
    }

    // ── Auth check ────────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be logged in to upload files.');
    }

    const uploadId      = crypto.randomUUID();
    const sanitized     = sanitizeFileName(file.name);
    const storagePath   = `${user.id}/${Date.now()}_${sanitized}`;
    const bucket        = getBucketForCategory(validation.fileCategory ?? 'document');
    const sm            = new ClearanceStateMachine(uploadId, user.id);

    const report = (extra: Partial<UploadProgress> = {}): UploadProgress => ({
      uploadId,
      fileName:        file.name,
      stage:           sm.currentStage,
      stageLabel:      STAGE_LABELS[sm.currentStage],
      progressPercent: sm.progressPercent,
      status:          'running',
      ...extra,
    });

    options.onProgress?.(report());

    // Log upload start
    SystemLogger.info('upload_start', `Upload started: ${file.name}`, user.id, {
      uploadId, fileName: file.name, fileSize: file.size, fileCategory: validation.fileCategory,
    });

    try {
      // ── STAGE 1: INGESTED ─────────────────────────────────────────────────
      // Already at INGESTED. Create the uploads row and push file to storage.

      await SystemEventBus.emit({
        stage:    'INGESTED',
        severity: 'info',
        context:  {
          uploadId,
          userId:       user.id,
          fileName:     file.name,
          fileCategory: validation.fileCategory,
          fileSize:     file.size,
        },
      });

      const duration = await getMediaDuration(file);

      // Create DB record (status = uploading, pipeline_state = INGESTED)
      const { data: uploadRecord, error: dbError } = await withRetry(
        async () => {
          const result = await supabase
            .from('uploads')
            .insert({
              id:                 uploadId,
              user_id:            user.id,
              file_name:          file.name,
              file_type:          file.type || 'application/octet-stream',
              file_size:          file.size,
              file_category:      validation.fileCategory ?? 'document',
              storage_path:       storagePath,
              upload_status:      'uploading',
              pipeline_state:     'INGESTED',
              duration,
              original_filename:  file.name,
              sanitized_filename: sanitized,
            })
            .select()
            .single();
          if (result.error) throw result.error;
          return result;
        },
        maxRetries, retryDelay, 'create upload record'
      );

      if (dbError || !uploadRecord) {
        const handled = errorHandler.handleError(
          dbError ?? new Error('Failed to create upload record'),
          ErrorCategory.DATABASE, 'create upload record'
        );
        throw new Error(handled.userMessage);
      }

      options.onProgress?.(report({ progressPercent: 10 }));

      // Push file to storage
      const { error: storageError } = await withRetry(
        async () => {
          const result = await supabase.storage
            .from(bucket)
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert:       false,
              contentType:  file.type || 'application/octet-stream',
            });
          if (result.error) throw result.error;
          return result;
        },
        maxRetries, retryDelay, 'storage upload'
      );

      if (storageError) {
        await supabase
          .from('uploads')
          .update({ upload_status: 'failed', pipeline_state: 'INGESTED' })
          .eq('id', uploadId);
        const handled = errorHandler.handleError(storageError, ErrorCategory.STORAGE, 'storage upload');
        throw new Error(handled.userMessage);
      }

      const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const publicUrl = publicUrlResult?.data?.publicUrl ?? '';

      if (!publicUrl || publicUrl.trim() === '') {
        await supabase
          .from('uploads')
          .update({ upload_status: 'failed', pipeline_state: 'INGESTED',
                    error_message: 'Storage URL resolution failed after successful upload.' })
          .eq('id', uploadId);
        throw new Error(
          'Storage upload succeeded but file URL could not be resolved. ' +
          'This is a storage configuration issue — please contact support.'
        );
      }

      options.onProgress?.(report({ progressPercent: 30 }));

      // ── STAGE 2: FINGERPRINTED ────────────────────────────────────────────
      const fingerprint = await generateFingerprint(file, validation.fileCategory ?? 'document');
      await sm.transitionTo('FINGERPRINTED', { sha256: fingerprint.sha256 });

      await supabase
        .from('uploads')
        .update({ pipeline_state: 'FINGERPRINTED' })
        .eq('id', uploadId);

      options.onProgress?.(report({ progressPercent: 45 }));

      // ── STAGE 3: BOUND_TO_CREATOR ─────────────────────────────────────────
      // Ownership record written as an append-only audit entry.
      // We don't yet have the clearance code — that comes in stage 4.
      // We use a placeholder asset_id that will be updated after code issuance.
      await sm.transitionTo('BOUND_TO_CREATOR', { userId: user.id });

      await supabase
        .from('uploads')
        .update({ pipeline_state: 'BOUND_TO_CREATOR' })
        .eq('id', uploadId);

      options.onProgress?.(report({ progressPercent: 60 }));

      // ── STAGES 4 & 5: CODE_ISSUED + VERIFIED ─────────────────────────────
      // DCCSPipeline handles code generation, certificate row creation, and
      // ownership record binding in one coordinated transaction.
      let dccsClearanceCode: string | undefined;
      let dccsOwnershipCode: string | undefined;
      let certificateId: string | undefined;

      if (PHASE_1_CONFIG.UPLOAD.GENERATE_DCCS_CODE) {
        const pipelineResult = await DCCSPipeline.run({
          uploadId,
          userId:       user.id,
          file,
          fileCategory: validation.fileCategory ?? 'document',
          fileName:     file.name,
          fileSize:     file.size,
          fileType:     file.type || 'application/octet-stream',
        });

        if (pipelineResult.success) {
          dccsClearanceCode = pipelineResult.clearanceCode;
          dccsOwnershipCode = pipelineResult.ownershipCode;
          certificateId     = pipelineResult.certificateId;

          SystemLogger.info('code_success', `Ownership code issued: ${dccsOwnershipCode ?? dccsClearanceCode}`, user.id, {
            uploadId, clearanceCode: dccsClearanceCode, ownershipCode: dccsOwnershipCode, certificateId,
          });

          await sm.transitionTo('CODE_ISSUED', { clearanceCode: dccsClearanceCode });
          await supabase
            .from('uploads')
            .update({ pipeline_state: 'CODE_ISSUED' })
            .eq('id', uploadId);

          options.onProgress?.(report({ progressPercent: 75, dccsClearanceCode, dccsOwnershipCode, certificateId }));

          SystemLogger.info('cert_success', `Certificate created: ${certificateId}`, user.id, {
            uploadId, certificateId,
          });

          await sm.transitionTo('VERIFIED', { certificateId });
          await supabase
            .from('uploads')
            .update({ pipeline_state: 'VERIFIED' })
            .eq('id', uploadId);

          options.onProgress?.(report({ progressPercent: 85, dccsClearanceCode, dccsOwnershipCode, certificateId }));
        } else {
          // DCCS pipeline failure is non-fatal — file is stored and accessible.
          // Log explicitly, record the error on the upload row, and continue
          // to LOCKED so the user can still download their file.
          logger.error('[UploadService] DCCS pipeline failed:', pipelineResult.error);
          SystemLogger.error('code_fail', pipelineResult.error ?? 'Pipeline returned failure', user.id, {
            uploadId, fileName: file.name,
          });

          await sm.fail('CODE_ISSUED', pipelineResult.error ?? 'Pipeline returned failure');

          // Record the failure reason on the upload row so it is visible in the UI.
          await supabase
            .from('uploads')
            .update({ error_message: `DCCS code generation failed: ${pipelineResult.error ?? 'unknown error'}` })
            .eq('id', uploadId);
        }
      }

      // ── STAGE 6: LOCKED ───────────────────────────────────────────────────
      // Mark the upload record as completed and advance the state to LOCKED.
      const { error: finalizeError } = await supabase
        .from('uploads')
        .update({
          upload_status:   'completed',
          pipeline_state:  'LOCKED',
          file_url:        publicUrl,
        })
        .eq('id', uploadId);

      if (finalizeError) {
        throw new Error(`Upload finalization failed: ${finalizeError.message}`);
      }

      await sm.transitionTo('LOCKED', { publicUrl });
      options.onProgress?.(report({ progressPercent: 95, dccsClearanceCode, certificateId }));

      // ── STAGE 7: DISTRIBUTED ──────────────────────────────────────────────
      await supabase
        .from('uploads')
        .update({ pipeline_state: 'DISTRIBUTED' })
        .eq('id', uploadId);

      await sm.transitionTo('DISTRIBUTED', { publicUrl, bucket });

      const final = report({
        progressPercent:  100,
        status:           'completed',
        dccsClearanceCode,
        dccsOwnershipCode,
        certificateId,
        fileUrl:          publicUrl,
      });

      SystemLogger.info('upload_success', `Upload complete: ${file.name}`, user.id, {
        uploadId, ownershipCode: dccsOwnershipCode, clearanceCode: dccsClearanceCode, certificateId,
      });

      options.onProgress?.(final);
      return final;

    } catch (err) {
      const handled = errorHandler.handleError(err, ErrorCategory.UPLOAD, `Upload: ${file.name}`);

      SystemLogger.error('upload_fail', handled.userMessage, user.id, {
        uploadId, fileName: file.name, stage: sm.currentStage,
      });

      await SystemEventBus.emit({
        stage:    sm.currentStage,
        severity: 'error',
        context:  {
          uploadId,
          userId:  user.id,
          reason:  handled.userMessage,
        },
      });

      // Best-effort failure mark. If this secondary update also fails, log it —
      // never silently swallow a DB write failure during error handling.
      supabase
        .from('uploads')
        .update({
          upload_status: 'failed',
          error_message: handled.userMessage,
        })
        .eq('id', uploadId)
        .then(({ error: updateErr }) => {
          if (updateErr) {
            logger.error(
              '[UploadService] Failed to persist failure status to DB:',
              { uploadId, updateError: updateErr.message }
            );
          }
        })
        .catch((updateErr) => {
          logger.error('[UploadService] Unexpected error persisting failure status:', updateErr);
        });

      const failed = report({
        status: 'failed',
        error:  handled.userMessage,
      });

      options.onProgress?.(failed);
      throw new Error(handled.userMessage);
    }
  }
}

export const uploadService = new UploadService();
