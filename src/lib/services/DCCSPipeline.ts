/**
 * DCCSPipeline — Stages 2–5 of the DCCS Clearance Pipeline
 *
 * This is the single orchestration point for converting a raw stored file
 * into a verified, code-bearing DCCS asset. It is called by phase1UploadManager
 * immediately after the file lands in Supabase Storage (Stage 1 complete).
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Stage 1 │ File Ingestion       │ phase1UploadManager (caller)  │
 * │  Stage 2 │ Fingerprint Gen      │ FingerprintService            │
 * │  Stage 3 │ Creator Binding      │ OwnershipRecord               │
 * │  Stage 4 │ DCCS Code Generation │ ClearanceCodeGenerator        │
 * │  Stage 5 │ Verification Record  │ DCCSPipeline (this file)      │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Failure policy:
 *   - Pipeline failure is NON-BLOCKING for the upload.
 *   - If any stage throws, run() returns { success: false } and logs the
 *     error. The upload row is still marked 'completed' with its public URL.
 *   - A partial failure (e.g. fingerprint record inserted but certificate
 *     insert fails) is logged but does not attempt rollback — both tables
 *     are designed to tolerate orphaned rows without data corruption.
 *
 * Extensibility:
 *   - Phase 2: add blockchain anchoring between Stages 4 and 5.
 *   - Phase 3: add AI content detection before Stage 4.
 *   - The DCCSPipelineInput and DCCSPipelineResult interfaces are the
 *     stable contract — internal stage implementations can be swapped.
 */

import { supabase }                  from '../supabase';
import { ClearanceCodeGenerator }    from '../dccs/ClearanceCodeGenerator';
import { generateFingerprint }       from './FingerprintService';
import { createOwnershipRecord }     from './OwnershipRecord';
import { SystemEventBus }            from '../events/SystemEventBus';
import type { AssetMetadata }        from '../dccs/ClearanceCodeGenerator';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface DCCSPipelineInput {
  uploadId:     string;
  userId:       string;
  file:         File;
  fileCategory: string;
  fileName:     string;
  fileSize:     number;
  fileType:     string;
}

export interface DCCSPipelineResult {
  success:              boolean;
  clearanceCode:        string;
  certificateId:        string;
  fingerprintRecordId:  string;
  sha256Hash:           string;
  error?:               string;
}

// ---------------------------------------------------------------------------
// Category → DCCS asset type map
// Centralised here so pipeline and generator stay in sync.
// ---------------------------------------------------------------------------

const CATEGORY_TO_ASSET_TYPE: Record<string, AssetMetadata['assetType']> = {
  audio:    'audio',
  video:    'video',
  image:    'image',
  document: 'document',
};

// ---------------------------------------------------------------------------
// Stage 4 helper: generate collision-safe clearance code
// ---------------------------------------------------------------------------

async function generateClearanceCode(
  userId:       string,
  fileName:     string,
  fileCategory: string,
  sha256:       string,
  shortHash:    string
): Promise<{ clearanceCode: string; uniqueId: string }> {
  const assetType = CATEGORY_TO_ASSET_TYPE[fileCategory] ?? 'other';

  const assetMeta: AssetMetadata = {
    creatorId:   userId,
    assetTitle:  fileName,
    assetType,
    fingerprint: shortHash,
    fileHash:    sha256.substring(0, 6).toUpperCase(),
    timestamp:   new Date(),
  };

  const uniquenessCheck = async (code: string): Promise<boolean> => {
    const { data } = await supabase
      .from('dccs_certificates')
      .select('id')
      .eq('clearance_code', code)
      .limit(1)
      .maybeSingle();
    return data === null;
  };

  const generated = await ClearanceCodeGenerator.generateUniqueClearanceCode(
    assetMeta,
    uniquenessCheck
  );

  return { clearanceCode: generated.fullCode, uniqueId: generated.uniqueId };
}

// ---------------------------------------------------------------------------
// Stage 4 helper: derive deterministic hash strings for the certificate row
// ---------------------------------------------------------------------------

async function hashString(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buf     = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Stage 3 + 4: create the dccs_certificates row
// All 9 NOT NULL columns (no DB defaults) are explicitly supplied.
// ---------------------------------------------------------------------------

async function createCertificateRow(
  userId:        string,
  uploadId:      string,
  fileName:      string,
  fileCategory:  string,
  sha256:        string,
  shortHash:     string,
  clearanceCode: string,
  uniqueId:      string
): Promise<{ certificateId: string }> {
  const datePrefix    = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const certificateId = `DCCS-CERT-${datePrefix}-${uniqueId}`;

  const [metadataHash, certificateHash] = await Promise.all([
    hashString(JSON.stringify({ fileName, fileCategory, sha256, uploadId })),
    hashString(`${clearanceCode}:${userId}:${Date.now()}`),
  ]);

  const assetType = CATEGORY_TO_ASSET_TYPE[fileCategory] ?? 'other';

  const { data, error } = await supabase
    .from('dccs_certificates')
    .insert({
      // NOT NULL, no defaults — must all be supplied
      certificate_id:     certificateId,
      clearance_code:     clearanceCode,
      creator_id:         userId,
      creator_legal_name: userId,         // Phase 1: no legal name; userId as placeholder
      project_title:      fileName,
      audio_fingerprint:  sha256,
      audio_signature: {
        algorithm:  'SHA-256',
        short_hash: shortHash,
        asset_type: assetType,
        upload_id:  uploadId,
        version:    'phase1-v1',
      },
      metadata_hash:      metadataHash,
      certificate_hash:   certificateHash,
      // Optional but meaningful for Phase 1
      content_type:       fileCategory,
      project_type:       fileCategory,
      phase:              'phase_1',
      registration_purpose: 'ownership_proof',
      hash_fragment:      shortHash,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(
      `DCCSPipeline: dccs_certificates INSERT failed — ${error?.message ?? 'no data returned'}`
    );
  }

  return { certificateId: data.id };
}

// ---------------------------------------------------------------------------
// Stage 5: write the certificate UUID back to the uploads row
// ---------------------------------------------------------------------------

async function linkCertificateToUpload(
  uploadId:      string,
  certificateId: string
): Promise<void> {
  const { error } = await supabase
    .from('uploads')
    .update({ dccs_certificate_id: certificateId })
    .eq('id', uploadId);

  if (error) {
    throw new Error(
      `DCCSPipeline: uploads.dccs_certificate_id update failed — ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export const DCCSPipeline = {
  /**
   * Run Stages 2–5 for a file that has already been stored in Supabase Storage.
   *
   * Never throws — errors are captured and returned in the result object so
   * the upload is never failed by a pipeline issue.
   */
  async run(input: DCCSPipelineInput): Promise<DCCSPipelineResult> {
    const { uploadId, userId, file, fileCategory, fileName, fileSize, fileType } = input;

    const ctx = { uploadId, userId, fileName, fileCategory };

    try {
      // ── Stage 2: FINGERPRINTED ────────────────────────────────────────────
      const fingerprint = await generateFingerprint(file, fileCategory);
      const { sha256, shortHash } = fingerprint;

      await SystemEventBus.emit({
        stage:    'FINGERPRINTED',
        severity: 'info',
        context:  { ...ctx, sha256, shortHash },
      });

      // ── Stage 4: CODE_ISSUED (before creator binding so code is in record) ─
      const { clearanceCode, uniqueId } = await generateClearanceCode(
        userId, fileName, fileCategory, sha256, shortHash
      );

      await SystemEventBus.emit({
        stage:    'CODE_ISSUED',
        severity: 'info',
        context:  { ...ctx, clearanceCode },
      });

      // ── Stage 3: BOUND_TO_CREATOR ─────────────────────────────────────────
      const { certificateId } = await createCertificateRow(
        userId, uploadId, fileName, fileCategory, sha256, shortHash, clearanceCode, uniqueId
      );

      // Append-only fingerprint ownership record
      const { fingerprintRecordId } = await createOwnershipRecord({
        uploadId,
        userId,
        fingerprint,
        clearanceCode,
      });

      await SystemEventBus.emit({
        stage:    'BOUND_TO_CREATOR',
        severity: 'info',
        context:  { ...ctx, certificateId, fingerprintRecordId },
      });

      // ── Stage 5: VERIFIED ─────────────────────────────────────────────────
      await linkCertificateToUpload(uploadId, certificateId);

      await SystemEventBus.emit({
        stage:    'VERIFIED',
        severity: 'info',
        context:  { ...ctx, certificateId, outcome: 'certificate_linked' },
      });

      return {
        success:             true,
        clearanceCode,
        certificateId,
        fingerprintRecordId,
        sha256Hash:          sha256,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // emit() never throws by contract — no catch needed here.
      // Removing the .catch(() => {}) that was suppressing event bus errors.
      await SystemEventBus.emit({
        stage:    'CODE_ISSUED',
        severity: 'error',
        context:  { ...ctx, reason: message },
      });

      return {
        success:             false,
        clearanceCode:       '',
        certificateId:       '',
        fingerprintRecordId: '',
        sha256Hash:          '',
        error:               message,
      };
    }
  },
};
