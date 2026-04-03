/**
 * Fingerprint Database Service - Phase 1 Core Component
 * Engineer: Database Architect
 *
 * Purpose: Manage fingerprint storage, indexing, and similarity search
 * Integrates with Supabase for persistence and pgvector for similarity matching
 */

import { supabase } from '../supabase';
import type { AudioFingerprint, FingerprintMatch } from './AudioFingerprintEngine';

export interface StoredFingerprint {
  id: string;
  uploadId: string;
  dccsCode: string;
  fingerprintHash: string;
  spectralSignature: number[];
  chromaprintData: string;
  duration: number;
  sampleRate: number;
  confidence: number;
  algorithm: string;
  version: string;
  createdAt: string;
}

export interface FingerprintSearchResult {
  fingerprint: StoredFingerprint;
  match: FingerprintMatch;
}

export class FingerprintDatabaseService {
  private readonly BATCH_SIZE = 100;
  private readonly SIMILARITY_THRESHOLD = 0.85;

  async storeFingerprint(
    uploadId: string,
    dccsCode: string,
    fingerprint: AudioFingerprint
  ): Promise<string> {
    try {
      const chromaprintBase64 = this.encodeChromaprintToBase64(fingerprint.chromaprintData);

      const { data, error } = await supabase
        .from('content_fingerprints')
        .insert({
          upload_id: uploadId,
          clearance_code: dccsCode,
          fingerprint_hash: fingerprint.fingerprintHash,
          audio_signature: {
            spectral: fingerprint.spectralSignature,
            chroma: chromaprintBase64,
            duration: fingerprint.duration,
            sampleRate: fingerprint.sampleRate,
            confidence: fingerprint.confidence
          },
          algorithm: fingerprint.metadata.algorithm,
          version: fingerprint.metadata.version,
          blockchain_anchor: null
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to store fingerprint: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error storing fingerprint:', error);
      throw error;
    }
  }

  async getFingerprint(fingerprintId: string): Promise<StoredFingerprint | null> {
    try {
      const { data, error } = await supabase
        .from('content_fingerprints')
        .select('*')
        .eq('id', fingerprintId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToStoredFingerprint(data);
    } catch (error) {
      console.error('Error retrieving fingerprint:', error);
      return null;
    }
  }

  async getFingerprintByDCCSCode(dccsCode: string): Promise<StoredFingerprint | null> {
    try {
      const { data, error } = await supabase
        .from('content_fingerprints')
        .select('*')
        .eq('clearance_code', dccsCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return this.mapToStoredFingerprint(data);
    } catch (error) {
      console.error('Error retrieving fingerprint by DCCS code:', error);
      return null;
    }
  }

  async searchSimilarFingerprints(
    queryFingerprint: AudioFingerprint,
    limit: number = 10
  ): Promise<FingerprintSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('content_fingerprints')
        .select('*')
        .limit(1000);

      if (error) {
        throw new Error(`Failed to search fingerprints: ${error.message}`);
      }

      const candidates = data.map(fp => this.mapToStoredFingerprint(fp));
      const matches: FingerprintSearchResult[] = [];

      for (const candidate of candidates) {
        const candidateFingerprint = this.storedToAudioFingerprint(candidate);
        const similarity = this.computeSimilarity(queryFingerprint, candidateFingerprint);

        if (similarity >= this.SIMILARITY_THRESHOLD) {
          matches.push({
            fingerprint: candidate,
            match: {
              matchedFingerprintId: candidate.fingerprintHash,
              similarity,
              confidence: Math.min(queryFingerprint.confidence, candidate.confidence),
              matchType: this.determineMatchType(similarity)
            }
          });
        }
      }

      return matches
        .sort((a, b) => b.match.similarity - a.match.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching similar fingerprints:', error);
      return [];
    }
  }

  async batchStoreFingerprints(
    fingerprints: Array<{
      uploadId: string;
      dccsCode: string;
      fingerprint: AudioFingerprint;
    }>
  ): Promise<string[]> {
    const ids: string[] = [];

    for (let i = 0; i < fingerprints.length; i += this.BATCH_SIZE) {
      const batch = fingerprints.slice(i, i + this.BATCH_SIZE);

      const records = batch.map(fp => ({
        upload_id: fp.uploadId,
        clearance_code: fp.dccsCode,
        fingerprint_hash: fp.fingerprint.fingerprintHash,
        audio_signature: {
          spectral: fp.fingerprint.spectralSignature,
          chroma: this.encodeChromaprintToBase64(fp.fingerprint.chromaprintData),
          duration: fp.fingerprint.duration,
          sampleRate: fp.fingerprint.sampleRate,
          confidence: fp.fingerprint.confidence
        },
        algorithm: fp.fingerprint.metadata.algorithm,
        version: fp.fingerprint.metadata.version
      }));

      const { data, error } = await supabase
        .from('content_fingerprints')
        .insert(records)
        .select('id');

      if (error) {
        console.error('Batch insert error:', error);
        continue;
      }

      if (data) {
        ids.push(...data.map(d => d.id));
      }
    }

    return ids;
  }

  async updateBlockchainAnchor(
    fingerprintId: string,
    txHash: string,
    network: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_fingerprints')
        .update({
          blockchain_anchor: {
            tx_hash: txHash,
            network: network,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', fingerprintId);

      return !error;
    } catch (error) {
      console.error('Error updating blockchain anchor:', error);
      return false;
    }
  }

  async getFingerprintStats(): Promise<{
    totalFingerprints: number;
    averageConfidence: number;
    algorithmsUsed: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('content_fingerprints')
        .select('audio_signature, algorithm');

      if (error || !data) {
        return {
          totalFingerprints: 0,
          averageConfidence: 0,
          algorithmsUsed: {}
        };
      }

      const totalFingerprints = data.length;
      const confidenceSum = data.reduce((sum, fp) => {
        return sum + (fp.audio_signature?.confidence || 0);
      }, 0);

      const algorithmsUsed = data.reduce((acc, fp) => {
        const algo = fp.algorithm || 'unknown';
        acc[algo] = (acc[algo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalFingerprints,
        averageConfidence: totalFingerprints > 0 ? confidenceSum / totalFingerprints : 0,
        algorithmsUsed
      };
    } catch (error) {
      console.error('Error getting fingerprint stats:', error);
      return {
        totalFingerprints: 0,
        averageConfidence: 0,
        algorithmsUsed: {}
      };
    }
  }

  async deleteFingerprintsByUploadId(uploadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_fingerprints')
        .delete()
        .eq('upload_id', uploadId);

      return !error;
    } catch (error) {
      console.error('Error deleting fingerprints:', error);
      return false;
    }
  }

  private mapToStoredFingerprint(data: any): StoredFingerprint {
    return {
      id: data.id,
      uploadId: data.upload_id,
      dccsCode: data.clearance_code,
      fingerprintHash: data.fingerprint_hash,
      spectralSignature: data.audio_signature?.spectral || [],
      chromaprintData: data.audio_signature?.chroma || '',
      duration: data.audio_signature?.duration || 0,
      sampleRate: data.audio_signature?.sampleRate || 44100,
      confidence: data.audio_signature?.confidence || 0,
      algorithm: data.algorithm || 'unknown',
      version: data.version || '1.0.0',
      createdAt: data.created_at
    };
  }

  private storedToAudioFingerprint(stored: StoredFingerprint): AudioFingerprint {
    return {
      fingerprintHash: stored.fingerprintHash,
      spectralSignature: stored.spectralSignature,
      chromaprintData: this.decodeBase64ToChromaprint(stored.chromaprintData),
      duration: stored.duration,
      sampleRate: stored.sampleRate,
      confidence: stored.confidence,
      metadata: {
        algorithm: stored.algorithm,
        version: stored.version,
        timestamp: stored.createdAt
      }
    };
  }

  private encodeChromaprintToBase64(chromaprint: Uint8Array): string {
    const binary = Array.from(chromaprint)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(binary);
  }

  private decodeBase64ToChromaprint(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private computeSimilarity(fp1: AudioFingerprint, fp2: AudioFingerprint): number {
    const spectralSim = this.cosineSimilarity(fp1.spectralSignature, fp2.spectralSignature);
    const chromaSim = this.hammingDistance(fp1.chromaprintData, fp2.chromaprintData);

    return (spectralSim * 0.6) + (chromaSim * 0.4);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const minLength = Math.min(vec1.length, vec2.length);
    if (minLength === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < minLength; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  private hammingDistance(chroma1: Uint8Array, chroma2: Uint8Array): number {
    const minLength = Math.min(chroma1.length, chroma2.length);
    if (minLength === 0) return 0;

    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      const xor = chroma1[i] ^ chroma2[i];
      matches += 8 - this.popCount(xor);
    }

    return matches / (minLength * 8);
  }

  private popCount(byte: number): number {
    let count = 0;
    while (byte > 0) {
      count += byte & 1;
      byte >>= 1;
    }
    return count;
  }

  private determineMatchType(similarity: number): 'exact' | 'derivative' | 'partial' | 'remix' {
    if (similarity > 0.98) return 'exact';
    if (similarity > 0.90) return 'derivative';
    if (similarity > 0.80) return 'remix';
    return 'partial';
  }
}

export const fingerprintDatabaseService = new FingerprintDatabaseService();
