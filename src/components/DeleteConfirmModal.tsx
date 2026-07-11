/**
 * DeleteConfirmModal
 *
 * Two-step confirmation modal for permanent deletion.
 * Only reachable from the Archived tab — assets must be archived first.
 *
 * Step 1: Presents the consequence statement and asks for typed confirmation.
 * Step 2: Shows live deletion progress through each pipeline step.
 *
 * Dismissal is blocked while deletion is in progress to prevent partial-delete
 * states where the user thinks deletion succeeded but it hadn't finished.
 */

import React, { useState } from 'react';
import {
  AlertTriangle, Trash2, X, CheckCircle, XCircle,
  Loader2, ShieldOff, HardDrive, Database, Search, FileText,
  Archive,
} from 'lucide-react';
import { DCCSDeletionService, type DeletionTargetType, type DeletionJobRecord } from '../lib/deletion/DCCSDeletionService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeletionTarget {
  type:         DeletionTargetType;
  id:           string;
  ownerId:      string;
  displayName:  string;
  hasDCCSCode?: boolean;
  dccsCode?:    string;
}

interface DeleteConfirmModalProps {
  target:    DeletionTarget;
  onClose:   () => void;
  onSuccess: (jobId: string) => void;
}

type ModalPhase = 'confirm' | 'deleting' | 'success' | 'failed';

// ─── Step display config ──────────────────────────────────────────────────────

const STEP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  VALIDATE_OWNERSHIP:          { label: 'Verifying ownership',            icon: <ShieldOff className="w-4 h-4" /> },
  REVOKE_PUBLIC_ACCESS:        { label: 'Revoking public access',         icon: <ShieldOff className="w-4 h-4" /> },
  REMOVE_STORAGE_ASSETS:       { label: 'Removing stored files',          icon: <HardDrive className="w-4 h-4" /> },
  REMOVE_FINGERPRINTS:         { label: 'Deleting fingerprint data',      icon: <Database  className="w-4 h-4" /> },
  REMOVE_DCCS_IDENTIFIERS:     { label: 'Removing DCCS identifiers',      icon: <FileText  className="w-4 h-4" /> },
  REMOVE_VERIFICATION_RECORDS: { label: 'Removing verification records',  icon: <Search    className="w-4 h-4" /> },
  REMOVE_CERTIFICATES:         { label: 'Revoking certificates',          icon: <FileText  className="w-4 h-4" /> },
  REMOVE_UPLOAD_RECORD:        { label: 'Purging upload record',          icon: <Database  className="w-4 h-4" /> },
  CONSISTENCY_CHECK:           { label: 'Running consistency check',      icon: <Search    className="w-4 h-4" /> },
  WRITE_AUDIT_LOG:             { label: 'Writing GDPR audit log',         icon: <FileText  className="w-4 h-4" /> },
};

const ORDERED_STEPS = Object.keys(STEP_LABELS);

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeleteConfirmModal({ target, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [phase,       setPhase]       = useState<ModalPhase>('confirm');
  const [job,         setJob]         = useState<DeletionJobRecord | null>(null);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const isDeletingOrDone = phase === 'deleting' || phase === 'success' || phase === 'failed';
  const confirmRequired  = 'DELETE';
  const canDelete        = confirmText.trim().toUpperCase() === confirmRequired;

  const handleDelete = async () => {
    if (!canDelete) return;
    setPhase('deleting');
    setErrorMsg(null);

    const outcome = await DCCSDeletionService.requestDeletion({
      targetType: target.type,
      targetId:   target.id,
      ownerId:    target.ownerId,
      reason:     'Creator requested permanent deletion via UI',
    });

    if (outcome.ok) {
      setJob(outcome.job);
      setPhase('success');
      onSuccess(outcome.job.id);
    } else {
      setJob(outcome.jobId ? { id: outcome.jobId } as DeletionJobRecord : null);
      setErrorMsg(outcome.error);
      setPhase('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={isDeletingOrDone ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Permanent Deletion</h2>
              <p className="text-slate-400 text-xs">This cannot be undone</p>
            </div>
          </div>
          {!isDeletingOrDone && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">

          {/* ── Confirm phase ────────────────────────────────────────── */}
          {phase === 'confirm' && (
            <>
              {/* Archived-first notice */}
              <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4">
                <Archive className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-amber-300/80 text-xs">
                  This asset is in your archive. Permanent deletion cannot be reversed.
                  If you want to keep it, restore it first.
                </p>
              </div>

              {/* Warning banner */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-200 text-sm leading-relaxed">
                  This action <span className="font-bold">permanently deletes</span> the asset and
                  all associated DCCS verification records, fingerprints, and storage files.
                  {target.hasDCCSCode && (
                    <> The DCCS certificate{' '}
                    <span className="font-mono text-red-300">{target.dccsCode}</span> will
                    be revoked and cannot be recovered.</>
                  )}
                  {' '}<span className="font-bold">This cannot be undone.</span>
                </p>
              </div>

              {/* What gets deleted */}
              <div className="mb-5">
                <p className="text-slate-300 text-sm font-semibold mb-3">The following will be permanently removed:</p>
                <ul className="space-y-1.5">
                  {[
                    'Original file from storage',
                    'DCCS certificate and clearance code',
                    'Structured identifier record',
                    'Content fingerprint data',
                    'Verification index entries',
                    'All pipeline audit events',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-1 h-1 bg-red-400 rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Asset name */}
              <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-slate-400 mb-1">Asset to delete</p>
                <p className="text-white font-medium text-sm truncate">{target.displayName}</p>
              </div>

              {/* Confirm input */}
              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-2">
                  Type <span className="font-mono font-bold text-red-400">{confirmRequired}</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmRequired}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-400 font-mono text-sm transition-colors"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:text-white hover:border-slate-500 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete
                </button>
              </div>
            </>
          )}

          {/* ── Deleting phase ───────────────────────────────────────── */}
          {phase === 'deleting' && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                <div>
                  <p className="text-white font-semibold">Deleting permanently…</p>
                  <p className="text-slate-400 text-xs">Do not close this window</p>
                </div>
              </div>
              <div className="space-y-2">
                {ORDERED_STEPS.map((step) => (
                  <div key={step} className="flex items-center gap-3 text-slate-500 text-xs">
                    <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <span>{STEP_LABELS[step]?.label ?? step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Success phase ────────────────────────────────────────── */}
          {phase === 'success' && (
            <div className="py-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Deletion Complete</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                All data has been permanently removed from the DCCS platform.
                A GDPR-compliant audit record has been written.
              </p>
              {job && (
                <p className="text-xs text-slate-500 font-mono mb-6">
                  Job ID: {job.id}
                </p>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* ── Failed phase ─────────────────────────────────────────── */}
          {phase === 'failed' && (
            <div className="py-4 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Deletion Failed</h3>
              {errorMsg && (
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{errorMsg}</p>
              )}
              {job && (
                <p className="text-xs text-slate-500 font-mono mb-4">Job ID: {job.id}</p>
              )}
              <p className="text-xs text-slate-500 mb-6">
                Partial deletions may have occurred. The asset remains in your archive.
                Please retry or contact support with the Job ID above.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:text-white transition-all text-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
