/**
 * SystemEventBus
 *
 * Structured, auditable event system for the DCCS clearance pipeline.
 * Every major pipeline action emits a typed event that is:
 *   1. Dispatched locally to in-process subscribers (synchronous, never fails)
 *   2. Persisted to the system_events table via Supabase (async, with explicit
 *      error logging — failures are never swallowed silently)
 *
 * Design contract:
 *   - emit() NEVER throws. The pipeline must never be blocked by event failures.
 *   - Persistence failures are logged as errors (not warnings) so they surface
 *     in production monitoring.
 *   - Local dispatch runs first and is guaranteed to complete before the async
 *     persistence is kicked off.
 */

import { supabase } from '../supabase';
import { logger }   from '../../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PipelineStage =
  | 'INGESTED'
  | 'FINGERPRINTED'
  | 'BOUND_TO_CREATOR'
  | 'CODE_ISSUED'
  | 'VERIFIED'
  | 'LOCKED'
  | 'DISTRIBUTED';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SystemEvent {
  stage:    PipelineStage | string;
  severity: EventSeverity;
  context:  {
    uploadId?:      string;
    userId?:        string;
    certificateId?: string;
    [key: string]:  unknown;
  };
}

export interface EmittedEvent extends SystemEvent {
  id:         string;
  emittedAt:  string;
}

export type EventHandler = (event: EmittedEvent) => void;

// ─── Bus ─────────────────────────────────────────────────────────────────────

class SystemEventBusClass {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  /**
   * Emit a structured system event.
   *
   * Local dispatch is synchronous and guaranteed.
   * DB persistence is async and fires in the background.
   * A persistence failure is always logged as an error — never swallowed.
   */
  async emit(event: SystemEvent): Promise<void> {
    const id        = crypto.randomUUID();
    const emittedAt = new Date().toISOString();
    const emitted: EmittedEvent = { ...event, id, emittedAt };

    // 1. Local dispatch — synchronous, zero latency, never throws
    this.dispatch(event.stage, emitted);
    this.dispatch('*', emitted);

    logger.info(
      `[EventBus] ${event.severity.toUpperCase()} | ${event.stage}`,
      event.context
    );

    // 2. Remote persistence — async, non-blocking
    //    Failures are logged as errors so they appear in production monitoring.
    this.persistToDatabase(emitted).catch((persistErr) => {
      logger.error(
        '[EventBus] CRITICAL: Failed to persist system event to database.',
        {
          eventStage:    event.stage,
          eventSeverity: event.severity,
          uploadId:      event.context.uploadId,
          persistError:  persistErr instanceof Error ? persistErr.message : String(persistErr),
        }
      );
    });
  }

  /**
   * Subscribe to events for a specific stage, or '*' for all events.
   * Returns an unsubscribe function.
   */
  on(stage: PipelineStage | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(stage)) {
      this.handlers.set(stage, new Set());
    }
    this.handlers.get(stage)!.add(handler);
    return () => this.handlers.get(stage)?.delete(handler);
  }

  private dispatch(stage: string, event: EmittedEvent): void {
    this.handlers.get(stage)?.forEach((handler) => {
      try {
        handler(event);
      } catch (handlerErr) {
        // A subscriber throwing must never kill the pipeline.
        logger.error('[EventBus] Event handler threw an unhandled error:', handlerErr);
      }
    });
  }

  private async persistToDatabase(event: EmittedEvent): Promise<void> {
    const { error } = await supabase.from('system_events').insert({
      stage:          event.stage,
      severity:       event.severity,
      actor_id:       event.context.userId   ?? null,
      upload_id:      event.context.uploadId ?? null,
      certificate_id: event.context.certificateId ?? null,
      context:        event.context,
    });

    if (error) {
      // Throw so the .catch() in emit() can log it as an error.
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
  }
}

export const SystemEventBus = new SystemEventBusClass();
