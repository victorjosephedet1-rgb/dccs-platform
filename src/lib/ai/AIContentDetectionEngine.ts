/**
 * AI Content Detection Engine - Phase 1 Core Component
 * Engineer: ML/AI Specialist
 *
 * Purpose: AI-powered content moderation and copyright violation detection
 * Implements automated scanning, classification, and enforcement
 */

import { supabase } from '../supabase';

export interface ContentScanRequest {
  uploadId: string;
  contentUrl: string;
  contentType: 'audio' | 'video' | 'image';
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface ScanResult {
  scanId: string;
  status: 'approved' | 'flagged' | 'rejected';
  violationTypes: string[];
  confidence: number;
  details: {
    copyrightMatch?: {
      matchedContentId: string;
      similarity: number;
    };
    contentFlags?: string[];
    aiGenerated?: boolean;
  };
  recommendations: string[];
}

export interface AIRule {
  id: string;
  ruleName: string;
  ruleType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoEnforce: boolean;
  action: 'allow' | 'review' | 'warn' | 'reject' | 'ban';
}

export class AIContentDetectionEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly BATCH_SCAN_SIZE = 10;
  private rules: Map<string, AIRule> = new Map();

  async initialize(): Promise<void> {
    await this.loadRules();
  }

  async scanContent(request: ContentScanRequest): Promise<ScanResult> {
    try {
      const scanId = await this.createScanRecord(request);

      const copyrightResult = await this.checkCopyrightViolation(request);
      const contentAnalysis = await this.analyzeContentSafety(request);
      const aiDetection = await this.detectAIGenerated(request);

      const violationTypes: string[] = [];
      const recommendations: string[] = [];

      if (copyrightResult.isViolation) {
        violationTypes.push('copyright_theft');
        recommendations.push('Content matches existing copyrighted material');
      }

      if (contentAnalysis.hasViolations) {
        violationTypes.push(...contentAnalysis.violations);
        recommendations.push(...contentAnalysis.recommendations);
      }

      if (aiDetection.isAIGenerated && aiDetection.confidence > 0.8) {
        violationTypes.push('ai_generated_content');
        recommendations.push('Content appears to be AI-generated - review required');
      }

      const status = this.determineStatus(violationTypes);
      const confidence = this.calculateOverallConfidence([
        copyrightResult.confidence,
        contentAnalysis.confidence,
        aiDetection.confidence
      ]);

      await this.updateScanRecord(scanId, {
        status,
        violationTypes,
        confidence,
        copyrightMatch: copyrightResult.match,
        aiGenerated: aiDetection.isAIGenerated
      });

      if (status === 'rejected' || (status === 'flagged' && this.shouldAutoEnforce(violationTypes))) {
        await this.enforceViolation(request.uploadId, violationTypes, status);
      }

      return {
        scanId,
        status,
        violationTypes,
        confidence,
        details: {
          copyrightMatch: copyrightResult.match,
          contentFlags: contentAnalysis.violations,
          aiGenerated: aiDetection.isAIGenerated
        },
        recommendations
      };
    } catch (error) {
      console.error('Error scanning content:', error);
      throw error;
    }
  }

  async batchScanContent(requests: ContentScanRequest[]): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    for (let i = 0; i < requests.length; i += this.BATCH_SCAN_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SCAN_SIZE);
      const batchResults = await Promise.all(
        batch.map(request => this.scanContent(request))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async rescanContent(uploadId: string): Promise<ScanResult | null> {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('file_path, file_name, content_type, metadata')
        .eq('id', uploadId)
        .single();

      if (error || !data) {
        return null;
      }

      return await this.scanContent({
        uploadId,
        contentUrl: data.file_path,
        contentType: this.mapContentType(data.content_type),
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Error rescanning content:', error);
      return null;
    }
  }

  private async checkCopyrightViolation(request: ContentScanRequest): Promise<{
    isViolation: boolean;
    confidence: number;
    match?: {
      matchedContentId: string;
      similarity: number;
    };
  }> {
    try {
      const { data, error } = await supabase
        .rpc('check_copyright_match', {
          p_upload_id: request.uploadId
        });

      if (error || !data) {
        return { isViolation: false, confidence: 0 };
      }

      if (data.similarity > 0.95) {
        return {
          isViolation: true,
          confidence: data.similarity,
          match: {
            matchedContentId: data.matched_id,
            similarity: data.similarity
          }
        };
      }

      return { isViolation: false, confidence: 1 - data.similarity };
    } catch (error) {
      console.error('Copyright check error:', error);
      return { isViolation: false, confidence: 0 };
    }
  }

  private async analyzeContentSafety(request: ContentScanRequest): Promise<{
    hasViolations: boolean;
    violations: string[];
    confidence: number;
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    const textContent = [
      request.metadata.title || '',
      request.metadata.description || '',
      ...(request.metadata.tags || [])
    ].join(' ').toLowerCase();

    const hateSpeechPatterns = [
      'hate', 'racist', 'discriminat', 'slur', 'bigot'
    ];
    const violencePatterns = [
      'violence', 'murder', 'kill', 'torture', 'harm'
    ];
    const fraudPatterns = [
      'scam', 'fraud', 'fake', 'phishing', 'steal'
    ];

    if (hateSpeechPatterns.some(pattern => textContent.includes(pattern))) {
      violations.push('hate_speech');
      recommendations.push('Content contains potential hate speech');
    }

    if (violencePatterns.some(pattern => textContent.includes(pattern))) {
      violations.push('violence');
      recommendations.push('Content references violence');
    }

    if (fraudPatterns.some(pattern => textContent.includes(pattern))) {
      violations.push('fraud');
      recommendations.push('Content may be fraudulent');
    }

    const confidence = violations.length > 0 ? 0.7 : 0.9;

    return {
      hasViolations: violations.length > 0,
      violations,
      confidence,
      recommendations
    };
  }

  private async detectAIGenerated(request: ContentScanRequest): Promise<{
    isAIGenerated: boolean;
    confidence: number;
  }> {
    const aiIndicators = [
      'ai generated', 'artificial intelligence', 'machine learning',
      'ai-generated', 'computer generated', 'synthetic'
    ];

    const textContent = [
      request.metadata.title || '',
      request.metadata.description || '',
      ...(request.metadata.tags || [])
    ].join(' ').toLowerCase();

    const hasAIIndicator = aiIndicators.some(indicator => textContent.includes(indicator));

    if (hasAIIndicator) {
      return { isAIGenerated: true, confidence: 0.85 };
    }

    const metadataAnalysis = this.analyzeMetadataForAI(request.metadata);

    return {
      isAIGenerated: metadataAnalysis.isAI,
      confidence: metadataAnalysis.confidence
    };
  }

  private analyzeMetadataForAI(metadata: any): {
    isAI: boolean;
    confidence: number;
  } {
    const suspiciousPatterns = [
      'generated', 'synthetic', 'automated', 'ai', 'ml'
    ];

    const metadataString = JSON.stringify(metadata).toLowerCase();
    const matchCount = suspiciousPatterns.filter(pattern =>
      metadataString.includes(pattern)
    ).length;

    if (matchCount >= 2) {
      return { isAI: true, confidence: 0.75 };
    }

    return { isAI: false, confidence: 0.6 };
  }

  private determineStatus(
    violationTypes: string[]
  ): 'approved' | 'flagged' | 'rejected' {
    if (violationTypes.length === 0) {
      return 'approved';
    }

    const criticalViolations = [
      'copyright_theft',
      'child_exploitation',
      'terrorism',
      'malware'
    ];

    const hasCriticalViolation = violationTypes.some(vt =>
      criticalViolations.includes(vt)
    );

    if (hasCriticalViolation) {
      return 'rejected';
    }

    return 'flagged';
  }

  private calculateOverallConfidence(confidences: number[]): number {
    if (confidences.length === 0) return 0;
    const sum = confidences.reduce((a, b) => a + b, 0);
    return sum / confidences.length;
  }

  private shouldAutoEnforce(violationTypes: string[]): boolean {
    const autoEnforceTypes = [
      'copyright_theft',
      'child_exploitation',
      'terrorism',
      'malware'
    ];

    return violationTypes.some(vt => autoEnforceTypes.includes(vt));
  }

  private async createScanRecord(request: ContentScanRequest): Promise<string> {
    const { data, error } = await supabase
      .from('ai_content_scans')
      .insert({
        upload_id: request.uploadId,
        scan_status: 'pending',
        content_type: request.contentType,
        scan_initiated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error('Failed to create scan record');
    }

    return data.id;
  }

  private async updateScanRecord(scanId: string, result: {
    status: string;
    violationTypes: string[];
    confidence: number;
    copyrightMatch?: any;
    aiGenerated?: boolean;
  }): Promise<void> {
    await supabase
      .from('ai_content_scans')
      .update({
        scan_status: result.status,
        violations_detected: result.violationTypes,
        confidence_score: result.confidence,
        scan_results: {
          copyrightMatch: result.copyrightMatch,
          aiGenerated: result.aiGenerated
        },
        scan_completed_at: new Date().toISOString()
      })
      .eq('id', scanId);
  }

  private async enforceViolation(
    uploadId: string,
    violationTypes: string[],
    severity: string
  ): Promise<void> {
    const action = severity === 'rejected' ? 'content_removed' : 'warning';

    await supabase
      .from('platform_violations')
      .insert({
        upload_id: uploadId,
        violation_type: violationTypes[0],
        severity,
        action_taken: action,
        detected_at: new Date().toISOString()
      });

    if (action === 'content_removed') {
      await supabase
        .from('uploads')
        .update({
          upload_status: 'rejected',
          moderation_status: 'rejected'
        })
        .eq('id', uploadId);
    }
  }

  private async loadRules(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('ai_platform_rules')
        .select('*')
        .eq('is_active', true);

      if (error || !data) {
        return;
      }

      data.forEach(rule => {
        this.rules.set(rule.id, {
          id: rule.id,
          ruleName: rule.rule_name,
          ruleType: rule.rule_type,
          severity: rule.severity,
          autoEnforce: rule.auto_enforce,
          action: rule.action
        });
      });
    } catch (error) {
      console.error('Error loading AI rules:', error);
    }
  }

  private mapContentType(mimeType: string): 'audio' | 'video' | 'image' {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'image';
  }

  async getViolationHistory(uploadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('platform_violations')
      .select('*')
      .eq('upload_id', uploadId)
      .order('detected_at', { ascending: false });

    return data || [];
  }

  async getScanStats(): Promise<{
    totalScans: number;
    approvedCount: number;
    flaggedCount: number;
    rejectedCount: number;
    averageConfidence: number;
  }> {
    const { data, error } = await supabase
      .from('ai_content_scans')
      .select('scan_status, confidence_score');

    if (error || !data) {
      return {
        totalScans: 0,
        approvedCount: 0,
        flaggedCount: 0,
        rejectedCount: 0,
        averageConfidence: 0
      };
    }

    const stats = data.reduce((acc, scan) => {
      acc.totalScans++;
      if (scan.scan_status === 'approved') acc.approvedCount++;
      if (scan.scan_status === 'flagged') acc.flaggedCount++;
      if (scan.scan_status === 'rejected') acc.rejectedCount++;
      acc.confidenceSum += scan.confidence_score || 0;
      return acc;
    }, {
      totalScans: 0,
      approvedCount: 0,
      flaggedCount: 0,
      rejectedCount: 0,
      confidenceSum: 0
    });

    return {
      ...stats,
      averageConfidence: stats.totalScans > 0 ? stats.confidenceSum / stats.totalScans : 0
    };
  }
}

export const aiContentDetectionEngine = new AIContentDetectionEngine();
