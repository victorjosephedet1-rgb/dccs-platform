/**
 * ClearanceStateMachine
 *
 * Enforces the 7-stage DCCS clearance lifecycle for every upload.
 * Transitions are validated — you cannot skip a stage or move backwards.
 * Each transition emits a structured SystemEvent.
 *
 * Stage order:
 *   INGESTED → FINGERPRINTED → BOUND_TO_CREATOR → CODE_ISSUED
 *            → VERIFIED → LOCKED → DISTRIBUTED
 */

import { SystemEventBus, PipelineStage } from '../events/SystemEventBus';

// ─── State definitions ────────────────────────────────────────────────────────

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  'INGESTED',
  'FINGERPRINTED',
  'BOUND_TO_CREATOR',
  'CODE_ISSUED',
  'VERIFIED',
  'LOCKED',
  'DISTRIBUTED',
] as const;

export const STAGE_LABELS: Record<PipelineStage, string> = {
  INGESTED:         'File Received',
  FINGERPRINTED:    'Fingerprint Generated',
  BOUND_TO_CREATOR: 'Bound to Creator',
  CODE_ISSUED:      'DCCS Code Issued',
  VERIFIED:         'Certificate Verified',
  LOCKED:           'Record Locked',
  DISTRIBUTED:      'Ready for Distribution',
};

export const STAGE_DESCRIPTIONS: Record<PipelineStage, string> = {
  INGESTED:         'File validated and stored securely.',
  FINGERPRINTED:    'SHA-256 fingerprint computed and stored.',
  BOUND_TO_CREATOR: 'Ownership claim attached to authenticated creator.',
  CODE_ISSUED:      'Unique DCCS clearance code generated and collision-checked.',
  VERIFIED:         'Certificate integrity confirmed — all hashes match.',
  LOCKED:           'Immutable record locked. Cannot be altered.',
  DISTRIBUTED:      'File available for download with embedded DCCS proof.',
};

// ─── Allowed forward transitions ─────────────────────────────────────────────

const TRANSITIONS: Record<PipelineStage, PipelineStage | null> = {
  INGESTED:         'FINGERPRINTED',
  FINGERPRINTED:    'BOUND_TO_CREATOR',
  BOUND_TO_CREATOR: 'CODE_ISSUED',
  CODE_ISSUED:      'VERIFIED',
  VERIFIED:         'LOCKED',
  LOCKED:           'DISTRIBUTED',
  DISTRIBUTED:      null,
};

// ─── State machine instance ───────────────────────────────────────────────────

export interface ClearanceState {
  uploadId:   string;
  userId:     string;
  stage:      PipelineStage;
  history:    { stage: PipelineStage; at: string }[];
  lockedAt:   string | null;
}

export class ClearanceStateMachine {
  private state: ClearanceState;

  constructor(uploadId: string, userId: string) {
    this.state = {
      uploadId,
      userId,
      stage:    'INGESTED',
      history:  [{ stage: 'INGESTED', at: new Date().toISOString() }],
      lockedAt: null,
    };
  }

  get currentStage(): PipelineStage {
    return this.state.stage;
  }

  get currentState(): Readonly<ClearanceState> {
    return { ...this.state, history: [...this.state.history] };
  }

  get stageIndex(): number {
    return PIPELINE_STAGES.indexOf(this.state.stage);
  }

  get isLocked(): boolean {
    return this.state.stage === 'LOCKED' || this.state.stage === 'DISTRIBUTED';
  }

  /**
   * Advance to the next stage.
   * Throws if the requested target is not the valid next stage.
   */
  async advance(
    context: Record<string, unknown> = {}
  ): Promise<PipelineStage> {
    const next = TRANSITIONS[this.state.stage];

    if (!next) {
      throw new Error(
        `[StateMachine] Upload ${this.state.uploadId} is already at terminal stage ${this.state.stage}.`
      );
    }

    return this.transitionTo(next, context);
  }

  /**
   * Advance directly to a named stage.
   * Validates that the target is the valid next stage in sequence.
   */
  async transitionTo(
    target: PipelineStage,
    context: Record<string, unknown> = {}
  ): Promise<PipelineStage> {
    const expected = TRANSITIONS[this.state.stage];

    if (target !== expected) {
      throw new Error(
        `[StateMachine] Invalid transition from ${this.state.stage} to ${target}. ` +
        `Expected next stage: ${expected ?? 'none (terminal)'}.`
      );
    }

    const now = new Date().toISOString();
    this.state.stage = target;
    this.state.history.push({ stage: target, at: now });

    if (target === 'LOCKED') {
      this.state.lockedAt = now;
    }

    await SystemEventBus.emit({
      stage:    target,
      severity: 'info',
      context:  {
        uploadId: this.state.uploadId,
        userId:   this.state.userId,
        label:    STAGE_LABELS[target],
        ...context,
      },
    });

    return target;
  }

  /**
   * Mark the pipeline as failed. Emits an error event but does not alter
   * the stage (caller decides how to handle the failure state).
   */
  async fail(
    stage: PipelineStage,
    reason: string,
    context: Record<string, unknown> = {}
  ): Promise<void> {
    await SystemEventBus.emit({
      stage,
      severity: 'error',
      context:  {
        uploadId: this.state.uploadId,
        userId:   this.state.userId,
        reason,
        ...context,
      },
    });
  }

  /** Human-readable progress (0–100) based on current stage index. */
  get progressPercent(): number {
    return Math.round(
      (this.stageIndex / (PIPELINE_STAGES.length - 1)) * 100
    );
  }
}
