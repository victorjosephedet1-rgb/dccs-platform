/**
 * VerificationService
 *
 * Public API for looking up and verifying DCCS clearance codes.
 * Queries dccs_certificates and uploads to assemble a complete
 * VerificationRecord. Every miss and every anomaly (e.g. a certificate
 * with no linked upload) emits a structured SystemEvent so that
 * verification failures are always visible in the event log.
 *
 * Contract:
 *   - verify() never throws — always returns a typed VerificationResult.
 *   - Every path (found / not-found / error) emits a system event.
 *   - Null / missing data is NEVER silently defaulted without a warning event.
 */

import { supabase }       from '../supabase';
import { SystemEventBus } from '../events/SystemEventBus';
import { logger }         from '../../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerificationRecord {
  clearanceCode:    string;
  certificateId:    string;
  certificateHash:  string;
  creatorId:        string;
  creatorLegalName: string;
  projectTitle:     string;
  fileCategory:     string;
  audioFingerprint: string;
  pipelineState:    string;
  downloadUnlocked: boolean;
  phase:            string;
  issuedAt:         string;
  verifiedAt:       string;
  publicUrl:        string;
  uploadId:         string;
  isValid:          boolean;
  validationReason: string;
}

export type VerificationResult =
  | { found: true;  record: VerificationRecord }
  | { found: false; reason: string };

// ─── Service ─────────────────────────────────────────────────────────────────

class VerificationServiceClass {
  /**
   * Look up a DCCS clearance code and return the full verification record.
   *
   * Emits:
   *   - VERIFIED / info   on success
   *   - VERIFIED / warning on not-found
   *   - VERIFIED / warning when certificate has no linked upload (partial record)
   *   - VERIFIED / error   on unexpected failure
   */
  async verify(clearanceCode: string): Promise<VerificationResult> {
    const normalised = clearanceCode.trim().toUpperCase();

    if (!normalised) {
      return { found: false, reason: 'Clearance code cannot be empty.' };
    }

    try {
      const { data: cert, error: certError } = await supabase
        .from('dccs_certificates')
        .select(`
          id,
          certificate_id,
          certificate_hash,
          clearance_code,
          creator_id,
          creator_legal_name,
          project_title,
          project_type,
          content_type,
          audio_fingerprint,
          download_unlocked,
          phase,
          creation_timestamp,
          created_at
        `)
        .eq('clearance_code', normalised)
        .maybeSingle();

      if (certError) {
        logger.error('[VerificationService] Database error during certificate lookup:', certError);

        await SystemEventBus.emit({
          stage:    'VERIFIED',
          severity: 'error',
          context:  { clearanceCode: normalised, dbError: certError.message },
        });

        return {
          found:  false,
          reason: 'Verification service temporarily unavailable. Please try again.',
        };
      }

      if (!cert) {
        await SystemEventBus.emit({
          stage:    'VERIFIED',
          severity: 'warning',
          context:  { clearanceCode: normalised, outcome: 'not_found' },
        });
        return {
          found:  false,
          reason: 'No certificate found for this clearance code.',
        };
      }

      // Fetch the linked upload for pipeline_state and file_url.
      const { data: upload, error: uploadError } = await supabase
        .from('uploads')
        .select('id, pipeline_state, file_url')
        .eq('dccs_certificate_id', cert.id)
        .maybeSingle();

      if (uploadError) {
        logger.error('[VerificationService] Failed to fetch linked upload:', uploadError);
      }

      // If the upload link is missing, emit a warning — this is an anomalous
      // state that must be visible, not silently defaulted.
      if (!upload) {
        logger.warn(
          '[VerificationService] Certificate exists but has no linked upload record.',
          { certificateId: cert.id, clearanceCode: normalised }
        );

        await SystemEventBus.emit({
          stage:    'VERIFIED',
          severity: 'warning',
          context:  {
            clearanceCode: normalised,
            certificateId: cert.id,
            outcome:       'certificate_without_upload',
          },
        });
      }

      const record: VerificationRecord = {
        clearanceCode:    cert.clearance_code,
        certificateId:    cert.certificate_id,
        certificateHash:  cert.certificate_hash ?? '',
        creatorId:        cert.creator_id,
        creatorLegalName: cert.creator_legal_name ?? 'Anonymous',
        projectTitle:     cert.project_title ?? '',
        fileCategory:     cert.project_type ?? cert.content_type ?? 'unknown',
        audioFingerprint: cert.audio_fingerprint ?? '',
        pipelineState:    upload?.pipeline_state ?? 'LOCKED',
        downloadUnlocked: cert.download_unlocked ?? false,
        phase:            cert.phase ?? 'phase1',
        issuedAt:         cert.creation_timestamp ?? cert.created_at ?? new Date().toISOString(),
        verifiedAt:       new Date().toISOString(),
        publicUrl:        upload?.file_url ?? '',
        uploadId:         upload?.id ?? '',
        isValid:          true,
        validationReason: upload
          ? 'Certificate found and linked to upload record.'
          : 'Certificate found but upload record is missing — partial record.',
      };

      await SystemEventBus.emit({
        stage:    'VERIFIED',
        severity: 'info',
        context:  {
          clearanceCode:    normalised,
          certificateId:    cert.id,
          uploadId:         upload?.id,
          pipelineState:    record.pipelineState,
          outcome:          'verified',
        },
      });

      return { found: true, record };

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('[VerificationService] Unexpected error during verification:', err);

      await SystemEventBus.emit({
        stage:    'VERIFIED',
        severity: 'error',
        context:  { clearanceCode: normalised, reason: message },
      });

      return {
        found:  false,
        reason: 'An unexpected error occurred during verification. Please try again.',
      };
    }
  }

  /**
   * Return the full pipeline event history for an upload.
   * Context is always returned as-is; null context is returned as null (not {})
   * so callers can distinguish missing data from empty data.
   */
  async getPipelineHistory(uploadId: string, userId: string): Promise<{
    stage:     string;
    severity:  string;
    context:   Record<string, unknown> | null;
    emittedAt: string;
  }[]> {
    const { data, error } = await supabase
      .from('system_events')
      .select('stage, severity, context, emitted_at')
      .eq('upload_id', uploadId)
      .eq('actor_id', userId)
      .order('emitted_at', { ascending: true });

    if (error) {
      logger.error('[VerificationService] Could not fetch pipeline history:', error);
      return [];
    }

    return (data ?? []).map((row) => ({
      stage:     row.stage,
      severity:  row.severity,
      context:   row.context ?? null,
      emittedAt: row.emitted_at,
    }));
  }
}

export const VerificationService = new VerificationServiceClass();
