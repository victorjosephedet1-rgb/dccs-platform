import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead, { PAGE_SEO } from '../components/SEOHead';
import {
  Upload, X, CheckCircle, AlertCircle, ArrowRight,
  RefreshCw, Shield, Fingerprint, Lock, Send, Tag, Loader2, ShoppingBag,
} from 'lucide-react';
import { uploadService, UploadProgress } from '../lib/pipeline/UploadService';
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_DESCRIPTIONS } from '../lib/pipeline/ClearanceStateMachine';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../components/NotificationSystem';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { DCCSOwnershipExplainerCard, UploadTooltipBanner } from '../components/DCCSOwnershipExplainerCard';

const STAGE_ICONS: Record<string, React.ElementType> = {
  INGESTED:         Upload,
  FINGERPRINTED:    Fingerprint,
  BOUND_TO_CREATOR: Shield,
  CODE_ISSUED:      Shield,
  VERIFIED:         CheckCircle,
  LOCKED:           Lock,
  DISTRIBUTED:      Send,
};

interface UploadEntry {
  id:       string;
  file:     File;
  progress: UploadProgress | null;
  status:   'queued' | 'running' | 'completed' | 'failed';
  error?:   string;
}

function PipelineStageBadge({ stage, active }: { stage: string; active: boolean }) {
  const Icon = STAGE_ICONS[stage] ?? Shield;
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap"
      style={{
        background: active ? 'rgba(255, 90, 31, 0.15)' : 'rgba(255, 255, 255, 0.04)',
        color:      active ? '#FF5A1F' : 'rgba(255,255,255,0.3)',
        border:     `1px solid ${active ? 'rgba(255, 90, 31, 0.4)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="hidden sm:inline">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage}</span>
    </div>
  );
}

function ClearancePipelineTracker({ progress }: { progress: UploadProgress }) {
  const activeIdx = PIPELINE_STAGES.indexOf(progress.stage as typeof PIPELINE_STAGES[number]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PIPELINE_STAGES.map((s, i) => (
          <PipelineStageBadge key={s} stage={s} active={i <= activeIdx} />
        ))}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width:      `${progress.progressPercent}%`,
            background: 'linear-gradient(90deg, #FF5A1F, #FF8C5A)',
          }}
        />
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">
        {STAGE_DESCRIPTIONS[progress.stage as keyof typeof STAGE_DESCRIPTIONS] ?? ''}
      </p>
    </div>
  );
}

function UploadCard({ entry, onRemove, onRetry, onList, isOnline }: {
  entry:    UploadEntry;
  onRemove: () => void;
  onRetry:  () => void;
  onList:   (uploadId: string) => void;
  isOnline: boolean;
}) {
  const { progress } = entry;
  const [listing, setListing] = useState(false);
  const [listed, setListed] = useState(false);
  const sizeMB = (entry.file.size / 1024 / 1024).toFixed(1);

  return (
    <div
      className="rounded-xl p-4 sm:p-5 transition-all duration-200"
      style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white text-sm sm:text-base truncate">{entry.file.name}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{sizeMB} MB</p>
        </div>
        <button
          onClick={onRemove}
          aria-label="Remove file"
          className="text-neutral-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/8 flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {entry.status === 'queued' && (
        <p className="text-sm text-neutral-600">Queued — waiting to start...</p>
      )}

      {entry.status === 'running' && progress && (
        <ClearancePipelineTracker progress={progress} />
      )}

      {entry.status === 'completed' && progress && (
        <div className="space-y-3">
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-green-300 text-sm font-semibold">DCCS Pipeline Complete</p>
              {progress.dccsOwnershipCode && (
                <div className="mt-2">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-0.5">Ownership Code</p>
                  <p className="text-sky-300 text-xs font-mono font-bold break-all">{progress.dccsOwnershipCode}</p>
                </div>
              )}
              {progress.dccsClearanceCode && (
                <div className="mt-1.5">
                  <p className="text-white/20 text-xs uppercase tracking-widest mb-0.5">Clearance Code</p>
                  <p className="text-green-400/50 text-xs font-mono break-all leading-relaxed">{progress.dccsClearanceCode}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STAGES.map((s) => (
              <PipelineStageBadge key={s} stage={s} active={true} />
            ))}
          </div>
          {/* Marketplace quick-list */}
          {!listed ? (
            <button
              onClick={async () => {
                if (!progress?.uploadId) return;
                setListing(true);
                await onList(progress.uploadId);
                setListed(true);
                setListing(false);
              }}
              disabled={listing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa' }}
            >
              {listing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              List on Marketplace
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}
            >
              <ShoppingBag className="h-4 w-4" />
              Listed on Marketplace
            </div>
          )}
        </div>
      )}

      {entry.status === 'failed' && (
        <div className="space-y-3">
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm leading-relaxed">{entry.error ?? 'Upload failed. Please try again.'}</p>
          </div>
          <button
            onClick={onRetry}
            disabled={!isOnline}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            style={{ background: '#FF5A1F', color: '#fff' }}
          >
            <RefreshCw className="h-4 w-4" />
            {isOnline ? 'Retry Upload' : 'Waiting for connection...'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Phase1Upload() {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate            = useNavigate();
  const { isOnline }        = useNetworkStatus();

  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [isDragging, setDrag] = useState(false);
  const fileInputRef          = useRef<HTMLInputElement>(null);

  const updateEntry = useCallback(
    (id: string, patch: Partial<UploadEntry>) =>
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    []
  );

  const runUpload = useCallback(async (entryId: string, file: File) => {
    updateEntry(entryId, { status: 'running' });
    try {
      await uploadService.upload(file, {
        onProgress: (progress) => updateEntry(entryId, { progress }),
      });
      updateEntry(entryId, { status: 'completed' });
      addNotification({
        type:    'success',
        title:   'Upload Complete',
        message: `${file.name} has been registered on the DCCS clearance pipeline.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      updateEntry(entryId, { status: 'failed', error: message });
      addNotification({ type: 'error', title: 'Upload Failed', message });
    }
  }, [updateEntry, addNotification]);

  const enqueueFiles = useCallback(async (files: FileList) => {
    if (!isAuthenticated) {
      addNotification({ type: 'error', title: 'Login Required', message: 'Please log in to upload files.' });
      navigate('/login');
      return;
    }
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    const newEntries: UploadEntry[] = fileArray.map((file) => ({
      id: crypto.randomUUID(), file, progress: null, status: 'queued',
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    for (const entry of newEntries) await runUpload(entry.id, entry.file);
  }, [isAuthenticated, addNotification, navigate, runUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files.length > 0) enqueueFiles(e.dataTransfer.files);
  }, [enqueueFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) enqueueFiles(e.target.files);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const retryEntry  = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) { updateEntry(id, { status: 'queued', error: undefined, progress: null }); runUpload(id, entry.file); }
  };
  const handleListOnMarketplace = async (uploadId: string) => {
    await supabase
      .from('uploads')
      .update({ marketplace_status: 'listed' })
      .eq('id', uploadId);
  };

  const hasCompleted = entries.some((e) => e.status === 'completed');

  return (
    <>
    <SEOHead {...PAGE_SEO.UPLOAD} />
    <div className="min-h-screen text-white pt-20 sm:pt-24 pb-16" style={{ background: '#0B0F17' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="text-center mb-10 sm:mb-14">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: 'rgba(255, 90, 31, 0.12)', border: '1px solid rgba(255, 90, 31, 0.25)' }}
          >
            <Upload className="h-7 w-7" style={{ color: '#FF5A1F' }} />
          </div>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', letterSpacing: '-0.025em' }}
          >
            Upload Your Creative Work
          </h1>
          <p
            className="text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)' }}
          >
            Every file passes through the 7-stage DCCS clearance pipeline —
            fingerprinted, bound to you, and locked with a unique clearance code.
          </p>
        </div>

        {/* Pipeline overview strip */}
        <div
          className="rounded-xl p-3.5 sm:p-4 mb-8 overflow-x-auto"
          style={{ background: 'rgba(255, 90, 31, 0.05)', border: '1px solid rgba(255, 90, 31, 0.12)' }}
        >
          <div className="flex items-center gap-1.5 min-w-max">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = STAGE_ICONS[stage] ?? Shield;
              return (
                <React.Fragment key={stage}>
                  <div className="flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-neutral-700 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Upload tooltip banner */}
        <UploadTooltipBanner />

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
          className="relative border-2 border-dashed rounded-2xl text-center transition-all duration-300 cursor-pointer"
          style={{
            padding: 'clamp(2rem, 6vw, 4rem) 1rem',
            borderColor: isDragging ? '#FF5A1F' : 'rgba(255,255,255,0.1)',
            background:  isDragging ? 'rgba(255,90,31,0.06)' : 'rgba(0,0,0,0.4)',
            transform:   isDragging ? 'scale(1.01)' : 'scale(1)',
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload files — click or drag and drop"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: 'clamp(3.5rem, 8vw, 5rem)',
                height: 'clamp(3.5rem, 8vw, 5rem)',
                background: isDragging ? 'rgba(255, 90, 31, 0.25)' : 'rgba(255, 90, 31, 0.12)',
              }}
            >
              <Upload
                style={{ color: '#FF5A1F', width: 'clamp(1.5rem, 4vw, 2.25rem)', height: 'clamp(1.5rem, 4vw, 2.25rem)' }}
              />
            </div>

            <div className="max-w-xs sm:max-w-sm mx-auto">
              <h3 className="text-lg sm:text-2xl font-semibold text-white mb-2">
                {isDragging ? 'Drop to upload' : 'Drop your files here'}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Audio, video, images, documents, code, 3D models — any creative file
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="px-7 sm:px-8 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 min-h-[44px]"
              style={{ background: '#FF5A1F', color: '#fff' }}
            >
              Browse Files
            </button>

            <p className="text-xs text-neutral-700">Up to 500 MB per file &nbsp;&middot;&nbsp; Free unlimited uploads</p>
          </div>
        </div>

        {/* Upload list */}
        {entries.length > 0 && (
          <div className="mt-8 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Clearance Pipeline</h3>
              <span className="text-sm text-neutral-600">{entries.length} file{entries.length !== 1 ? 's' : ''}</span>
            </div>
            {entries.map((entry) => (
              <UploadCard
                key={entry.id}
                entry={entry}
                onRemove={() => removeEntry(entry.id)}
                onRetry={() => retryEntry(entry.id)}
                onList={handleListOnMarketplace}
                isOnline={isOnline}
              />
            ))}
          </div>
        )}

        {/* Success CTA */}
        {hasCompleted && (
          <div
            className="mt-8 rounded-xl p-5 sm:p-6"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1.5">Files Cleared and Ready</h4>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                  Your uploads are registered with unique DCCS clearance codes and available
                  in your library for download.
                </p>
                <button
                  onClick={() => navigate('/library')}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 min-h-[44px]"
                  style={{ background: '#FF5A1F', color: '#fff' }}
                >
                  <span>View My Library</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DCCS Ownership explainer card — persistent help */}
        <div className="mt-8">
          <DCCSOwnershipExplainerCard
            ownershipCode={entries.find(e => e.progress?.dccsOwnershipCode)?.progress?.dccsOwnershipCode}
            compact={hasCompleted}
          />
        </div>

        {/* Phase info */}
        <div
          className="mt-6 rounded-xl p-5 sm:p-6"
          style={{ background: 'rgba(255,90,31,0.06)', border: '1px solid rgba(255,90,31,0.12)' }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2.5">
            Phase 1 — Free Ownership Registration
          </h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            The DCCS clearance pipeline cryptographically binds every file to its creator.
            In Phase 1, all uploads are free and unlimited. Each file receives a timestamped,
            collision-checked clearance code that can be publicly verified on <strong className="text-neutral-300">dccsverify.com</strong>.
          </p>
        </div>

      </div>
    </div>
    </>
  );
}
