/**
 * SystemLogger
 *
 * Lightweight, non-blocking append-only logger that writes to dccs_system_logs.
 * All writes are fire-and-forget — a logging failure never propagates to the
 * caller. Safe to call from anywhere in the upload pipeline.
 */

import { supabase } from '../supabase';
import { logger }   from '../../utils/logger';

export type LogEventType =
  // Upload pipeline
  | 'upload_start'
  | 'upload_success'
  | 'upload_fail'
  | 'code_success'
  | 'code_fail'
  | 'cert_success'
  | 'cert_fail'
  | 'download_start'
  | 'download_success'
  | 'download_fail'
  // User conversion funnel
  | 'page_view'
  | 'register_start'
  | 'register_success'
  | 'login_success'
  | 'onboarding_complete'
  | 'first_upload_complete'
  | 'verify_code_attempt'
  | 'verify_code_success'
  | 'share_code'
  | 'early_access_signup'
  // System
  | 'system_info';

export type LogSeverity = 'info' | 'warn' | 'error';

export interface SystemLogEntry {
  userId?:    string;
  eventType:  LogEventType;
  message:    string;
  metadata?:  Record<string, unknown>;
  severity?:  LogSeverity;
}

class SystemLoggerClass {
  /**
   * Write a log entry. Never throws — all failures are swallowed and printed
   * to the browser console only so the calling pipeline is never disrupted.
   */
  log(entry: SystemLogEntry): void {
    const row = {
      user_id:    entry.userId ?? null,
      event_type: entry.eventType,
      message:    entry.message,
      metadata:   entry.metadata ?? {},
      severity:   entry.severity ?? 'info',
    };

    supabase
      .from('dccs_system_logs')
      .insert(row)
      .then(({ error }) => {
        if (error) {
          logger.warn('[SystemLogger] Failed to persist log entry:', { error, row });
        }
      })
      .catch((err) => {
        logger.warn('[SystemLogger] Unexpected error persisting log:', err);
      });
  }

  info(eventType: LogEventType, message: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.log({ userId, eventType, message, metadata, severity: 'info' });
  }

  warn(eventType: LogEventType, message: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.log({ userId, eventType, message, metadata, severity: 'warn' });
  }

  error(eventType: LogEventType, message: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.log({ userId, eventType, message, metadata, severity: 'error' });
  }
}

export const SystemLogger = new SystemLoggerClass();
