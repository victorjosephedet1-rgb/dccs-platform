/**
 * FingerprintService — Stage 2 of the DCCS Clearance Pipeline
 *
 * Produces a deterministic, tamper-evident cryptographic fingerprint
 * from a raw File object. This stage is pure and stateless: no I/O,
 * no network calls. The same file always produces the same output.
 *
 * Algorithm:
 *   SHA-256(rawBytes) → 64-char hex string (full hash)
 *   First 12 chars    → shortHash (used as the DCCS code segment)
 *   Structured metadata extracted from File API
 *
 * Extensibility hooks:
 *   - Phase 2: replace computeSHA256 with a perceptual hash (pHash) for
 *     near-duplicate detection across re-encoded copies
 *   - Phase 3: plug in the AudioFingerprintEngine spectral pipeline
 *     without changing the FingerprintResult interface
 */

export interface FingerprintResult {
  /** Full 64-char hex SHA-256 of the file's raw bytes */
  sha256: string;
  /** Uppercase 12-char prefix of sha256 — used as the human-readable hash segment */
  shortHash: string;
  /** Structured metadata captured at fingerprint time */
  metadata: FingerprintMetadata;
}

export interface FingerprintMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileCategory: string;
  fingerprintedAt: string; // ISO-8601 UTC
}

/**
 * Compute SHA-256 over the entire file.
 * File.arrayBuffer() is safe to call multiple times — File is not a
 * consumed stream. The buffer is freshly allocated on each call.
 */
async function computeSHA256(file: File): Promise<string> {
  const buffer    = await file.arrayBuffer();
  const hashBuf   = await crypto.subtle.digest('SHA-256', buffer);
  const hashBytes = Array.from(new Uint8Array(hashBuf));
  return hashBytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a complete fingerprint record for a file.
 *
 * @param file         The File object (still in browser memory)
 * @param fileCategory Normalised category from fileValidator: audio|video|image|document
 */
export async function generateFingerprint(
  file: File,
  fileCategory: string
): Promise<FingerprintResult> {
  const sha256    = await computeSHA256(file);
  const shortHash = sha256.substring(0, 12).toUpperCase();

  return {
    sha256,
    shortHash,
    metadata: {
      fileName:        file.name,
      fileSize:        file.size,
      fileType:        file.type || 'application/octet-stream',
      fileCategory,
      fingerprintedAt: new Date().toISOString(),
    },
  };
}
