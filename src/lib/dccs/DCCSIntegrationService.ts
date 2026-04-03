/**
 * DCCS Integration Service
 *
 * Orchestrates the complete DCCS workflow during upload:
 * 1. Generate audio fingerprint
 * 2. Create structured DCCS identifier
 * 3. Store enhanced fingerprint data
 * 4. Update certificate records
 *
 * This service ensures seamless integration with the existing upload
 * system while adding patent-ready DCCS functionality.
 */

import { supabase } from '../supabase';
import { DCCSIdentifierService } from './DCCSIdentifierService';
import { enhancedFingerprintService } from './EnhancedFingerprintService';
import { audioFingerprintEngine } from '../fingerprinting/AudioFingerprintEngine';

export interface DCCSRegistrationResult {
  success: boolean;
  certificateId: string;
  structuredCode: string;
  fingerprintId: string;
  processingTimeMs: number;
  error?: string;
}

export class DCCSIntegrationService {
  /**
   * Complete DCCS registration workflow for uploaded content
   */
  async registerContent(
    uploadId: string,
    userId: string,
    audioFile: File
  ): Promise<DCCSRegistrationResult> {
    const startTime = Date.now();

    try {
      const { data: upload } = await supabase
        .from('uploads')
        .select('id, file_type, file_url, storage_path, dccs_certificate_id')
        .eq('id', uploadId)
        .single();

      if (!upload) {
        throw new Error('Upload not found');
      }

      const arrayBuffer = await audioFile.arrayBuffer();

      const basicFingerprint = await audioFingerprintEngine.generateFingerprint(arrayBuffer, {
        filename: audioFile.name,
        originalFormat: audioFile.type,
      });

      let certificateId = upload.dccs_certificate_id;

      if (!certificateId) {
        const { data: certificate, error: certError } = await supabase
          .from('dccs_certificates')
          .insert({
            user_id: userId,
            content_fingerprint: basicFingerprint.fingerprintHash,
            fingerprint_version: 'v1',
            has_enhanced_fingerprint: false,
          })
          .select('id, clearance_code')
          .single();

        if (certError || !certificate) {
          throw new Error('Failed to create certificate');
        }

        certificateId = certificate.id;

        await supabase
          .from('uploads')
          .update({ dccs_certificate_id: certificateId })
          .eq('id', uploadId);
      }

      const structuredCode = await DCCSIdentifierService.createStructuredIdentifier(
        certificateId,
        upload.file_type,
        basicFingerprint.fingerprintHash
      );

      const enhancedFingerprint = await enhancedFingerprintService.generateStructuredFingerprint(
        audioFile,
        userId,
        structuredCode.fullCode
      );

      const { data: identifierData } = await supabase
        .from('dccs_structured_identifiers')
        .select('id')
        .eq('certificate_id', certificateId)
        .single();

      const fingerprintId = await enhancedFingerprintService.storeStructuredFingerprint(
        certificateId,
        identifierData?.id || '',
        enhancedFingerprint,
        basicFingerprint.duration,
        basicFingerprint.sampleRate,
        Date.now() - startTime
      );

      const processingTimeMs = Date.now() - startTime;

      return {
        success: true,
        certificateId,
        structuredCode: structuredCode.fullCode,
        fingerprintId,
        processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      console.error('DCCS registration failed:', error);

      return {
        success: false,
        certificateId: '',
        structuredCode: '',
        fingerprintId: '',
        processingTimeMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve complete DCCS information for a certificate
   */
  async getCertificateInfo(certificateId: string) {
    const { data: certificate } = await supabase
      .from('dccs_certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (!certificate) return null;

    const { data: structuredId } = await supabase
      .from('dccs_structured_identifiers')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    const { data: fingerprintData } = await supabase
      .from('dccs_fingerprint_data')
      .select('*')
      .eq('certificate_id', certificateId)
      .single();

    const { data: verifications } = await supabase
      .from('dccs_verification_matches')
      .select('*')
      .eq('target_certificate_id', certificateId)
      .order('verified_at', { ascending: false })
      .limit(10);

    return {
      certificate,
      structuredIdentifier: structuredId,
      fingerprintData,
      recentVerifications: verifications || [],
    };
  }

  /**
   * Check if a certificate has enhanced DCCS features
   */
  async hasEnhancedFeatures(certificateId: string): Promise<boolean> {
    const { data } = await supabase
      .from('dccs_certificates')
      .select('has_enhanced_fingerprint')
      .eq('id', certificateId)
      .single();

    return data?.has_enhanced_fingerprint || false;
  }

  /**
   * Upgrade an existing certificate to enhanced DCCS
   */
  async upgradeToEnhanced(
    certificateId: string,
    userId: string,
    audioFile: File
  ): Promise<DCCSRegistrationResult> {
    const startTime = Date.now();

    try {
      const { data: certificate } = await supabase
        .from('dccs_certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (certificate.has_enhanced_fingerprint) {
        throw new Error('Certificate already has enhanced features');
      }

      const { data: upload } = await supabase
        .from('uploads')
        .select('file_type')
        .eq('dccs_certificate_id', certificateId)
        .single();

      if (!upload) {
        throw new Error('Associated upload not found');
      }

      const structuredCode = await DCCSIdentifierService.createStructuredIdentifier(
        certificateId,
        upload.file_type,
        certificate.content_fingerprint
      );

      const enhancedFingerprint = await enhancedFingerprintService.generateStructuredFingerprint(
        audioFile,
        userId,
        structuredCode.fullCode
      );

      const { data: identifierData } = await supabase
        .from('dccs_structured_identifiers')
        .select('id')
        .eq('certificate_id', certificateId)
        .single();

      const arrayBuffer = await audioFile.arrayBuffer();
      const basicFingerprint = await audioFingerprintEngine.generateFingerprint(arrayBuffer, {
        filename: audioFile.name,
        originalFormat: audioFile.type,
      });

      const fingerprintId = await enhancedFingerprintService.storeStructuredFingerprint(
        certificateId,
        identifierData?.id || '',
        enhancedFingerprint,
        basicFingerprint.duration,
        basicFingerprint.sampleRate,
        Date.now() - startTime
      );

      const processingTimeMs = Date.now() - startTime;

      return {
        success: true,
        certificateId,
        structuredCode: structuredCode.fullCode,
        fingerprintId,
        processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      console.error('DCCS upgrade failed:', error);

      return {
        success: false,
        certificateId: '',
        structuredCode: '',
        fingerprintId: '',
        processingTimeMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get DCCS system statistics
   */
  async getSystemStatistics() {
    const { data: totalCertificates, count: certCount } = await supabase
      .from('dccs_certificates')
      .select('*', { count: 'exact', head: true });

    const { data: enhancedCertificates, count: enhancedCount } = await supabase
      .from('dccs_certificates')
      .select('*', { count: 'exact', head: true })
      .eq('has_enhanced_fingerprint', true);

    const { data: totalVerifications, count: verificationCount } = await supabase
      .from('dccs_verification_matches')
      .select('*', { count: 'exact', head: true });

    const { data: recentVerifications } = await supabase
      .from('dccs_verification_matches')
      .select('verified_at')
      .gte('verified_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const identifierStats = await DCCSIdentifierService.getStatistics();

    return {
      totalCertificates: certCount || 0,
      enhancedCertificates: enhancedCount || 0,
      totalVerifications: verificationCount || 0,
      verificationsLast24h: recentVerifications?.length || 0,
      identifierStatistics: identifierStats,
    };
  }
}

export const dccsIntegrationService = new DCCSIntegrationService();
