/**
 * DCCS Structured Identifier Service
 *
 * Generates patent-ready structured DCCS codes with embedded metadata.
 * Format: DCCS-VXB-[YEAR]-[MEDIA_TYPE]-[FINGERPRINT_REF]-[VERSION]
 *
 * This service implements a technically sophisticated identifier system
 * that encodes meaningful information into each segment, supporting
 * patent claims for a novel digital media verification system.
 */

import { supabase } from '../supabase';

export interface DCCSIdentifierComponents {
  prefix: 'DCCS';
  issuerCode: 'VXB';
  registrationYear: number;
  mediaTypeCode: 'AUD' | 'VID' | 'IMG' | 'DOC';
  fingerprintReference: string;
  versionIndicator: string;
}

export interface StructuredDCCSCode {
  fullCode: string;
  components: DCCSIdentifierComponents;
  metadata: {
    generatedAt: string;
    certificateId?: string;
  };
}

export class DCCSIdentifierService {
  private static readonly PREFIX = 'DCCS';
  private static readonly ISSUER_CODE = 'VXB';
  private static readonly VERSION = 'T1';

  /**
   * Map file MIME types to standardized media type codes
   */
  private static getMediaTypeCode(mimeType: string): 'AUD' | 'VID' | 'IMG' | 'DOC' {
    if (mimeType.startsWith('audio/')) return 'AUD';
    if (mimeType.startsWith('video/')) return 'VID';
    if (mimeType.startsWith('image/')) return 'IMG';
    return 'DOC';
  }

  /**
   * Generate a fingerprint reference from the full fingerprint hash
   * Uses first 8 characters for compact representation
   */
  private static generateFingerprintReference(fingerprintHash: string): string {
    return fingerprintHash.substring(0, 8).toUpperCase();
  }

  /**
   * Generate a structured DCCS code
   */
  static generateStructuredCode(
    mimeType: string,
    fingerprintHash: string,
    customYear?: number
  ): StructuredDCCSCode {
    const registrationYear = customYear || new Date().getFullYear();
    const mediaTypeCode = this.getMediaTypeCode(mimeType);
    const fingerprintReference = this.generateFingerprintReference(fingerprintHash);

    const components: DCCSIdentifierComponents = {
      prefix: this.PREFIX,
      issuerCode: this.ISSUER_CODE,
      registrationYear,
      mediaTypeCode,
      fingerprintReference,
      versionIndicator: this.VERSION,
    };

    const fullCode = `${components.prefix}-${components.issuerCode}-${components.registrationYear}-${components.mediaTypeCode}-${components.fingerprintReference}-${components.versionIndicator}`;

    return {
      fullCode,
      components,
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Parse a structured DCCS code into its components
   */
  static parseStructuredCode(code: string): DCCSIdentifierComponents | null {
    const pattern = /^DCCS-([A-Z]+)-(\d{4})-([A-Z]{3})-([A-F0-9]{8})-([A-Z0-9]+)$/;
    const match = code.match(pattern);

    if (!match) return null;

    return {
      prefix: 'DCCS',
      issuerCode: match[1] as 'VXB',
      registrationYear: parseInt(match[2], 10),
      mediaTypeCode: match[3] as 'AUD' | 'VID' | 'IMG' | 'DOC',
      fingerprintReference: match[4],
      versionIndicator: match[5],
    };
  }

  /**
   * Validate a structured DCCS code format
   */
  static validateStructuredCode(code: string): boolean {
    return this.parseStructuredCode(code) !== null;
  }

  /**
   * Create and store a structured identifier in the database
   */
  static async createStructuredIdentifier(
    certificateId: string,
    mimeType: string,
    fingerprintHash: string
  ): Promise<StructuredDCCSCode> {
    const structuredCode = this.generateStructuredCode(mimeType, fingerprintHash);

    const { data, error } = await supabase
      .from('dccs_structured_identifiers')
      .insert({
        certificate_id: certificateId,
        structured_code: structuredCode.fullCode,
        issuer_code: structuredCode.components.issuerCode,
        registration_year: structuredCode.components.registrationYear,
        media_type_code: structuredCode.components.mediaTypeCode,
        fingerprint_reference: structuredCode.components.fingerprintReference,
        version_indicator: structuredCode.components.versionIndicator,
        metadata: {
          mime_type: mimeType,
          fingerprint_hash_full: fingerprintHash,
        },
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create structured identifier: ${error.message}`);
    }

    await supabase
      .from('dccs_certificates')
      .update({
        structured_code: structuredCode.fullCode,
      })
      .eq('id', certificateId);

    return {
      ...structuredCode,
      metadata: {
        ...structuredCode.metadata,
        certificateId,
      },
    };
  }

  /**
   * Retrieve structured identifier by certificate ID
   */
  static async getStructuredIdentifier(certificateId: string): Promise<StructuredDCCSCode | null> {
    const { data, error } = await supabase
      .from('dccs_structured_identifiers')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    if (error || !data) return null;

    return {
      fullCode: data.structured_code,
      components: {
        prefix: 'DCCS',
        issuerCode: data.issuer_code as 'VXB',
        registrationYear: data.registration_year,
        mediaTypeCode: data.media_type_code as 'AUD' | 'VID' | 'IMG' | 'DOC',
        fingerprintReference: data.fingerprint_reference,
        versionIndicator: data.version_indicator,
      },
      metadata: {
        generatedAt: data.created_at,
        certificateId: data.certificate_id,
      },
    };
  }

  /**
   * Search for certificates by structured code
   */
  static async findByStructuredCode(code: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('dccs_structured_identifiers')
      .select('certificate_id')
      .eq('structured_code', code)
      .single();

    if (error || !data) return null;
    return data.certificate_id;
  }

  /**
   * Batch generate structured identifiers for existing certificates
   */
  static async backfillStructuredIdentifiers(limit: number = 100): Promise<number> {
    const { data: certificates, error } = await supabase
      .from('dccs_certificates')
      .select('id, content_fingerprint')
      .is('structured_code', null)
      .not('content_fingerprint', 'is', null)
      .limit(limit);

    if (error || !certificates) return 0;

    let successCount = 0;

    for (const cert of certificates) {
      try {
        const { data: upload } = await supabase
          .from('uploads')
          .select('file_type')
          .eq('dccs_certificate_id', cert.id)
          .single();

        if (upload?.file_type && cert.content_fingerprint) {
          await this.createStructuredIdentifier(
            cert.id,
            upload.file_type,
            cert.content_fingerprint
          );
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to backfill certificate ${cert.id}:`, err);
      }
    }

    return successCount;
  }

  /**
   * Get statistics about structured identifiers
   */
  static async getStatistics() {
    const { data: total } = await supabase
      .from('dccs_structured_identifiers')
      .select('id', { count: 'exact', head: true });

    const { data: byMediaType } = await supabase
      .from('dccs_structured_identifiers')
      .select('media_type_code');

    const { data: byYear } = await supabase
      .from('dccs_structured_identifiers')
      .select('registration_year');

    const mediaTypeCounts = byMediaType?.reduce((acc, row) => {
      acc[row.media_type_code] = (acc[row.media_type_code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const yearCounts = byYear?.reduce((acc, row) => {
      acc[row.registration_year] = (acc[row.registration_year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    return {
      total: total || 0,
      byMediaType: mediaTypeCounts,
      byYear: yearCounts,
    };
  }
}
