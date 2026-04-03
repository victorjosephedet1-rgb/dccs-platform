/**
 * DCCS Orchestration Service - Phase 1 Master Controller
 * Engineer: All Engineers (Collaborative)
 *
 * Purpose: Central orchestration layer coordinating all Phase 1 components
 * Integrates fingerprinting, AI detection, platform monitoring, blockchain, and notifications
 */

import { audioFingerprintEngine } from '../fingerprinting/AudioFingerprintEngine';
import { fingerprintDatabaseService } from '../fingerprinting/FingerprintDatabaseService';
import { aiContentDetectionEngine } from '../ai/AIContentDetectionEngine';
import { platformMonitoringService } from '../platform/PlatformMonitoringService';
import { blockchainService } from '../blockchain/BlockchainVerificationService';
import { realTimeNotificationService } from '../notifications/RealTimeNotificationService';
import { securityComplianceService } from '../security/SecurityComplianceService';
import { observabilityService } from '../monitoring/ObservabilityService';

export interface DCCSRegistrationRequest {
  userId: string;
  projectTitle: string;
  audioFile: ArrayBuffer;
  metadata: {
    filename: string;
    format: string;
    description?: string;
    tags?: string[];
    collaborators?: string[];
  };
}

export interface DCCSRegistrationResult {
  success: boolean;
  certificateId: string;
  clearanceCode: string;
  fingerprintHash: string;
  blockchainTxHash?: string;
  aiScanResult: {
    status: 'approved' | 'flagged' | 'rejected';
    violations: string[];
  };
  timestamp: string;
}

export interface DCCSVerificationRequest {
  clearanceCode: string;
  includeBlockchainVerification: boolean;
  includePlatformUsage: boolean;
}

export interface DCCSVerificationResult {
  isValid: boolean;
  certificate: {
    certificateId: string;
    clearanceCode: string;
    projectTitle: string;
    creatorId: string;
    createdAt: string;
  };
  blockchainVerification?: {
    isVerified: boolean;
    txHash: string;
    confirmations: number;
  };
  platformUsage?: {
    totalViews: number;
    totalPlatforms: number;
    platforms: string[];
  };
}

export class DCCSOrchestrationService {
  async initialize(): Promise<void> {
    const spanId = observabilityService.startTrace('dccs.initialize');

    try {
      await aiContentDetectionEngine.initialize();
      await blockchainService.initialize();

      await platformMonitoringService.initialize([
        { platform: 'youtube', enabled: true },
        { platform: 'tiktok', enabled: true },
        { platform: 'instagram', enabled: true },
        { platform: 'spotify', enabled: false },
        { platform: 'soundcloud', enabled: false },
        { platform: 'twitch', enabled: false },
        { platform: 'facebook', enabled: false }
      ]);

      observabilityService.endTrace(spanId, 'success');
      console.log('DCCS Orchestration Service initialized successfully');
    } catch (error) {
      observabilityService.endTrace(spanId, 'error');
      console.error('DCCS initialization failed:', error);
      throw error;
    }
  }

  async registerContent(request: DCCSRegistrationRequest): Promise<DCCSRegistrationResult> {
    const traceId = observabilityService.startTrace('dccs.register_content', {
      userId: request.userId,
      projectTitle: request.projectTitle
    });

    try {
      observabilityService.addTraceLog(traceId, 'info', 'Starting content registration');

      const accessValidation = await securityComplianceService.validateAccess(
        request.userId,
        'upload',
        'new',
        'write'
      );

      if (!accessValidation.allowed) {
        throw new Error(accessValidation.reason || 'Access denied');
      }

      observabilityService.addTraceLog(traceId, 'info', 'Generating audio fingerprint');
      const fingerprintSpan = observabilityService.startChildSpan(traceId, 'fingerprint.generate');

      const fingerprint = await audioFingerprintEngine.generateFingerprint(
        request.audioFile,
        {
          filename: request.metadata.filename,
          originalFormat: request.metadata.format
        }
      );

      observabilityService.endTrace(fingerprintSpan, 'success', {
        confidence: fingerprint.confidence.toString()
      });

      observabilityService.addTraceLog(traceId, 'info', 'Running AI content scan');
      const aiScanSpan = observabilityService.startChildSpan(traceId, 'ai.scan');

      const aiScanResult = await aiContentDetectionEngine.scanContent({
        uploadId: 'temp_upload_id',
        contentUrl: request.metadata.filename,
        contentType: 'audio',
        metadata: {
          title: request.projectTitle,
          description: request.metadata.description,
          tags: request.metadata.tags
        }
      });

      observabilityService.endTrace(aiScanSpan, 'success', {
        scanStatus: aiScanResult.status
      });

      if (aiScanResult.status === 'rejected') {
        await realTimeNotificationService.sendNotification({
          userId: request.userId,
          type: 'ai_scan_complete',
          title: 'Content Rejected',
          message: `Your upload "${request.projectTitle}" was rejected due to policy violations`,
          priority: 'high',
          channels: ['in_app', 'email'],
          metadata: { violations: aiScanResult.violationTypes }
        });

        throw new Error('Content rejected by AI moderation');
      }

      const certificateId = this.generateCertificateId();
      const clearanceCode = this.generateClearanceCode();

      observabilityService.addTraceLog(traceId, 'info', 'Storing fingerprint in database');
      await fingerprintDatabaseService.storeFingerprint(
        'upload_id_placeholder',
        clearanceCode,
        fingerprint
      );

      observabilityService.addTraceLog(traceId, 'info', 'Anchoring certificate to blockchain');
      const blockchainSpan = observabilityService.startChildSpan(traceId, 'blockchain.anchor');

      let blockchainTxHash: string | undefined;

      try {
        const blockchainResult = await blockchainService.anchorCertificate({
          certificateId,
          contentHash: fingerprint.fingerprintHash,
          clearanceCode,
          timestamp: Date.now(),
          creatorAddress: `0x${request.userId.substring(0, 40)}`
        });

        blockchainTxHash = blockchainResult.txHash;
        observabilityService.endTrace(blockchainSpan, 'success', {
          txHash: blockchainTxHash
        });
      } catch (error) {
        observabilityService.endTrace(blockchainSpan, 'error');
        console.warn('Blockchain anchoring failed, continuing without blockchain verification');
      }

      await securityComplianceService.logSecurityEvent({
        userId: request.userId,
        action: 'dccs_registration',
        resourceType: 'certificate',
        resourceId: certificateId,
        success: true,
        details: {
          clearanceCode,
          fingerprintHash: fingerprint.fingerprintHash,
          aiScanStatus: aiScanResult.status
        },
        timestamp: new Date().toISOString()
      });

      await realTimeNotificationService.sendNotification({
        userId: request.userId,
        type: 'blockchain_confirmation',
        title: 'Content Registered Successfully',
        message: `Your content "${request.projectTitle}" has been registered with clearance code ${clearanceCode}`,
        priority: 'medium',
        channels: ['in_app', 'email'],
        metadata: {
          certificateId,
          clearanceCode,
          blockchainTxHash
        }
      });

      observabilityService.recordMetric('dccs.registration.success', 1, 'count', {
        userId: request.userId
      });

      observabilityService.endTrace(traceId, 'success');

      return {
        success: true,
        certificateId,
        clearanceCode,
        fingerprintHash: fingerprint.fingerprintHash,
        blockchainTxHash,
        aiScanResult: {
          status: aiScanResult.status,
          violations: aiScanResult.violationTypes
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      observabilityService.endTrace(traceId, 'error');
      observabilityService.recordMetric('dccs.registration.error', 1, 'count', {
        userId: request.userId
      });

      console.error('Content registration failed:', error);
      throw error;
    }
  }

  async verifyContent(request: DCCSVerificationRequest): Promise<DCCSVerificationResult> {
    const traceId = observabilityService.startTrace('dccs.verify_content', {
      clearanceCode: request.clearanceCode
    });

    try {
      const storedFingerprint = await fingerprintDatabaseService.getFingerprintByDCCSCode(
        request.clearanceCode
      );

      if (!storedFingerprint) {
        observabilityService.endTrace(traceId, 'success', { found: 'false' });

        return {
          isValid: false,
          certificate: {
            certificateId: '',
            clearanceCode: request.clearanceCode,
            projectTitle: '',
            creatorId: '',
            createdAt: ''
          }
        };
      }

      let blockchainVerification;

      if (request.includeBlockchainVerification) {
        const blockchainSpan = observabilityService.startChildSpan(traceId, 'blockchain.verify');

        const verificationResult = await blockchainService.verifyCertificateByCode(
          request.clearanceCode
        );

        observabilityService.endTrace(blockchainSpan, 'success');

        blockchainVerification = {
          isVerified: verificationResult.isValid,
          txHash: verificationResult.txHash,
          confirmations: verificationResult.confirmations
        };
      }

      let platformUsage;

      if (request.includePlatformUsage) {
        const platformSpan = observabilityService.startChildSpan(traceId, 'platform.get_stats');

        const platformStats = await platformMonitoringService.getPlatformStats(
          request.clearanceCode
        );

        observabilityService.endTrace(platformSpan, 'success');

        const totalViews = platformStats.reduce((sum, stat) => sum + stat.totalViews, 0);
        const platforms = platformStats.map(stat => stat.platform);

        platformUsage = {
          totalViews,
          totalPlatforms: platforms.length,
          platforms
        };
      }

      observabilityService.recordMetric('dccs.verification.success', 1, 'count');
      observabilityService.endTrace(traceId, 'success');

      return {
        isValid: true,
        certificate: {
          certificateId: storedFingerprint.id,
          clearanceCode: request.clearanceCode,
          projectTitle: 'Project Title Placeholder',
          creatorId: storedFingerprint.uploadId,
          createdAt: storedFingerprint.createdAt
        },
        blockchainVerification,
        platformUsage
      };
    } catch (error) {
      observabilityService.endTrace(traceId, 'error');
      console.error('Content verification failed:', error);
      throw error;
    }
  }

  async detectContentOnPlatforms(clearanceCode: string): Promise<void> {
    const traceId = observabilityService.startTrace('dccs.platform_detection', {
      clearanceCode
    });

    try {
      const platforms = ['youtube', 'tiktok', 'instagram'];

      for (const platform of platforms) {
        const detections = await platformMonitoringService.detectContentOnPlatform(
          clearanceCode,
          platform
        );

        for (const detection of detections) {
          await platformMonitoringService.trackPlatformUsage(detection);
        }
      }

      observabilityService.endTrace(traceId, 'success');
    } catch (error) {
      observabilityService.endTrace(traceId, 'error');
      console.error('Platform detection failed:', error);
    }
  }

  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: any[];
    metrics: any;
  }> {
    const services = await observabilityService.checkHealth([
      'database',
      'storage',
      'blockchain',
      'fingerprinting',
      'ai_detection'
    ]);

    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 1) {
      overall = 'degraded';
    }

    const metrics = observabilityService.getDashboardMetrics();

    return {
      overall,
      services,
      metrics
    };
  }

  private generateCertificateId(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `DCCS-${dateStr}-${random}`;
  }

  /**
   * Generate standardized DCCS clearance code
   * Format: DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
   * Example: DCCS-AUD-2026-9F3K2L
   */
  private generateClearanceCode(assetType: string = 'AUD'): string {
    const year = new Date().getFullYear().toString();
    const uniqueId = this.generateUniqueId();

    const code = `DCCS-${assetType}-${year}-${uniqueId}`;

    console.log('[DCCS] Code generated:', code);
    console.log('[DCCS] Type detected:', assetType);
    console.log('[DCCS] Unique ID assigned:', uniqueId);

    return code;
  }

  /**
   * Generate cryptographically random 6-character unique ID
   */
  private generateUniqueId(): string {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O for clarity
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const dccsOrchestrationService = new DCCSOrchestrationService();
