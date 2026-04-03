/**
 * Security & Compliance Service - Phase 1 Core Component
 * Engineer: Security Specialist
 *
 * Purpose: Comprehensive security monitoring, audit logging, and compliance management
 * Implements GDPR compliance, data encryption, and security validation
 */

import { supabase } from '../supabase';

export interface SecurityAuditLog {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: any;
  timestamp: string;
}

export interface ComplianceReport {
  userId: string;
  dataExported: boolean;
  dataDeleted: boolean;
  consentRecords: ConsentRecord[];
  activityLog: SecurityAuditLog[];
}

export interface ConsentRecord {
  consentType: 'data_processing' | 'marketing' | 'ai_training' | 'third_party_sharing';
  granted: boolean;
  timestamp: string;
  ipAddress?: string;
}

export interface DataExportRequest {
  userId: string;
  format: 'json' | 'csv';
  includeUploads: boolean;
  includeCertificates: boolean;
  includeTransactions: boolean;
}

export class SecurityComplianceService {
  private readonly ENCRYPTION_ALGORITHM = 'AES-GCM';
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 900000;

  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  async logSecurityEvent(event: SecurityAuditLog): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: event.userId,
          action: event.action,
          resource_type: event.resourceType,
          resource_id: event.resourceId,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          success: event.success,
          details: event.details,
          created_at: event.timestamp
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async validateAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (this.isUserLockedOut(userId)) {
      return {
        allowed: false,
        reason: 'Account temporarily locked due to suspicious activity'
      };
    }

    const ownershipCheck = await this.verifyOwnership(userId, resourceType, resourceId);

    if (!ownershipCheck.isOwner && action === 'write') {
      await this.logSecurityEvent({
        userId,
        action: `unauthorized_${action}_attempt`,
        resourceType,
        resourceId,
        success: false,
        timestamp: new Date().toISOString()
      });

      this.recordFailedAttempt(userId);

      return {
        allowed: false,
        reason: 'Insufficient permissions'
      };
    }

    return { allowed: true };
  }

  private async verifyOwnership(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<{ isOwner: boolean }> {
    const tableMap: Record<string, { table: string; ownerField: string }> = {
      certificate: { table: 'dccs_certificates', ownerField: 'creator_id' },
      upload: { table: 'uploads', ownerField: 'user_id' },
      profile: { table: 'profiles', ownerField: 'id' }
    };

    const config = tableMap[resourceType];
    if (!config) {
      return { isOwner: false };
    }

    const { data, error } = await supabase
      .from(config.table)
      .select(config.ownerField)
      .eq('id', resourceId)
      .single();

    if (error || !data) {
      return { isOwner: false };
    }

    return { isOwner: data[config.ownerField] === userId };
  }

  async encryptSensitiveData(data: string, purpose: string): Promise<{
    encrypted: string;
    iv: string;
    tag: string;
  }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    const key = await this.getEncryptionKey(purpose);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ENCRYPTION_ALGORITHM,
        iv
      },
      key,
      dataBuffer
    );

    const encrypted = this.bufferToBase64(encryptedBuffer);
    const ivBase64 = this.bufferToBase64(iv);
    const tagBase64 = '';

    await this.logSecurityEvent({
      userId: 'system',
      action: 'data_encryption',
      resourceType: 'sensitive_data',
      resourceId: purpose,
      success: true,
      timestamp: new Date().toISOString()
    });

    return {
      encrypted,
      iv: ivBase64,
      tag: tagBase64
    };
  }

  async decryptSensitiveData(
    encrypted: string,
    iv: string,
    purpose: string
  ): Promise<string> {
    const key = await this.getEncryptionKey(purpose);
    const encryptedBuffer = this.base64ToBuffer(encrypted);
    const ivBuffer = this.base64ToBuffer(iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ENCRYPTION_ALGORITHM,
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  private async getEncryptionKey(purpose: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(`dccs_key_${purpose}`),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('v3bmusic_salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ENCRYPTION_ALGORITHM, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async exportUserData(request: DataExportRequest): Promise<ComplianceReport> {
    const { userId, includeUploads, includeCertificates, includeTransactions } = request;

    const exportData: any = {
      profile: null,
      uploads: [],
      certificates: [],
      transactions: [],
      auditLogs: []
    };

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    exportData.profile = profile;

    if (includeUploads) {
      const { data: uploads } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', userId);

      exportData.uploads = uploads || [];
    }

    if (includeCertificates) {
      const { data: certificates } = await supabase
        .from('dccs_certificates')
        .select('*')
        .eq('creator_id', userId);

      exportData.certificates = certificates || [];
    }

    if (includeTransactions) {
      const { data: transactions } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('user_id', userId);

      exportData.transactions = transactions || [];
    }

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);

    exportData.auditLogs = auditLogs || [];

    await this.logSecurityEvent({
      userId,
      action: 'data_export',
      resourceType: 'user_data',
      resourceId: userId,
      success: true,
      details: { includeUploads, includeCertificates, includeTransactions },
      timestamp: new Date().toISOString()
    });

    return {
      userId,
      dataExported: true,
      dataDeleted: false,
      consentRecords: await this.getConsentRecords(userId),
      activityLog: exportData.auditLogs
    };
  }

  async deleteUserData(userId: string, verificationCode: string): Promise<{
    success: boolean;
    deletedRecords: number;
  }> {
    const isVerified = await this.verifyDeletionRequest(userId, verificationCode);

    if (!isVerified) {
      throw new Error('Invalid verification code');
    }

    let deletedRecords = 0;

    const tablesToClean = [
      'uploads',
      'dccs_certificates',
      'platform_usage_tracking',
      'notifications',
      'ai_content_scans'
    ];

    for (const table of tablesToClean) {
      const { count } = await supabase
        .from(table)
        .delete()
        .eq(table === 'uploads' ? 'user_id' : 'creator_id', userId);

      deletedRecords += count || 0;
    }

    await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${userId}@dccsverify.com`,
        name: 'Deleted User'
      })
      .eq('id', userId);

    await this.logSecurityEvent({
      userId,
      action: 'account_deletion',
      resourceType: 'user_account',
      resourceId: userId,
      success: true,
      details: { deletedRecords },
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      deletedRecords
    };
  }

  private async verifyDeletionRequest(userId: string, code: string): Promise<boolean> {
    return code.length > 0;
  }

  private async getConsentRecords(userId: string): Promise<ConsentRecord[]> {
    const { data } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId);

    if (!data) return [];

    return data.map(record => ({
      consentType: record.consent_type,
      granted: record.granted,
      timestamp: record.created_at,
      ipAddress: record.ip_address
    }));
  }

  async detectAnomalousActivity(userId: string): Promise<{
    isAnomalous: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    const { data: recentLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    if (!recentLogs) {
      return { isAnomalous: false, reasons: [], riskScore: 0 };
    }

    const failedAttempts = recentLogs.filter(log => !log.success).length;
    if (failedAttempts > 10) {
      reasons.push('High number of failed operations');
      riskScore += 30;
    }

    const uniqueIPs = new Set(recentLogs.map(log => log.ip_address)).size;
    if (uniqueIPs > 5) {
      reasons.push('Multiple IP addresses detected');
      riskScore += 40;
    }

    const rapidRequests = recentLogs.length > 100;
    if (rapidRequests) {
      reasons.push('Unusually high request rate');
      riskScore += 30;
    }

    return {
      isAnomalous: riskScore > 50,
      reasons,
      riskScore
    };
  }

  private isUserLockedOut(userId: string): boolean {
    const record = this.failedAttempts.get(userId);

    if (!record) return false;

    const timeSinceLastAttempt = Date.now() - record.lastAttempt;

    if (timeSinceLastAttempt > this.LOCKOUT_DURATION) {
      this.failedAttempts.delete(userId);
      return false;
    }

    return record.count >= this.MAX_FAILED_ATTEMPTS;
  }

  private recordFailedAttempt(userId: string): void {
    const record = this.failedAttempts.get(userId) || { count: 0, lastAttempt: 0 };

    record.count++;
    record.lastAttempt = Date.now();

    this.failedAttempts.set(userId, record);
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

export const securityComplianceService = new SecurityComplianceService();
