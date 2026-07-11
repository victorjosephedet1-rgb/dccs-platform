/**
 * OwnershipRecord — Stage 3 of the DCCS Clearance Pipeline
 *
 * Writes the cryptographic fingerprint to the dccs_fingerprints table,
 * creating a permanent, append-only ownership proof record that is
 * independent of the dccs_certificates row.
 *
 * This separation matters: if the certificate layer ever changes format,
 * the raw fingerprint record remains as an immutable audit trail.
 *
 * RLS enforced by Supabase: only the owning user can insert or read rows.
 */

import { supabase } from '../supabase';
import type { FingerprintResult } from './FingerprintService';

export interface OwnershipRecordInput {
  uploadId:     string;
  userId:       string;
  fingerprint:  FingerprintResult;
  /** The clearance code generated in Stage 4 — stored here as the asset identity anchor */
  clearanceCode: string;
}

export interface OwnershipRecordOutput {
  fingerprintRecordId: string;
}

/**
 * Insert a fingerprint row into dccs_fingerprints.
 * Throws on insert failure — caller (DCCSPipeline) is responsible for
 * catching and deciding whether to surface the error.
 */
export async function createOwnershipRecord(
  input: OwnershipRecordInput
): Promise<OwnershipRecordOutput> {
  const { uploadId, userId, fingerprint, clearanceCode } = input;

  const { data, error } = await supabase
    .from('dccs_fingerprints')
    .insert({
      upload_id:     uploadId,
      user_id:       userId,
      sha256_hash:   fingerprint.sha256,
      file_size:     fingerprint.metadata.fileSize,
      file_type:     fingerprint.metadata.fileType,
      file_category: fingerprint.metadata.fileCategory,
      asset_id:      clearanceCode,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(
      `OwnershipRecord: dccs_fingerprints INSERT failed — ${error?.message ?? 'no data returned'}`
    );
  }

  return { fingerprintRecordId: data.id };
}
