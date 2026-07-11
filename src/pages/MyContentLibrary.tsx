import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Shield, Copy, CheckCircle, ExternalLink,
  FileAudio, FileVideo, FileImage, File, Fingerprint,
  HardDrive, Search, Grid3x3, List, Upload, TrendingUp,
  Archive, RotateCcw, AlertTriangle, Clock, Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import { formatFileSize } from '../lib/fileValidator';
import { getBucketForCategory } from '../lib/phase1UploadManager';
import { logger } from '../utils/logger';
import AssetActionMenu from '../components/AssetActionMenu';
import DeleteConfirmModal, { type DeletionTarget } from '../components/DeleteConfirmModal';
import ShareCertificate from '../components/ShareCertificate';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadRow {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_category: string;
  file_url: string;
  storage_path: string;
  upload_status: string;
  created_at: string;
  archived_at: string | null;
  archive_reason: string | null;
  dccs_ownership_code: string | null;
  dccs_owner_tag: string | null;
  dccs_certificates?: {
    id: string;
    audio_fingerprint: string;
    clearance_code: string;
    creation_timestamp: string;
  }[];
}

interface Stats {
  total_uploads: number;
  total_dccs_codes: number;
  total_storage_used: number;
  protected_content: number;
  archived_count: number;
}

type LibraryTab = 'active' | 'archived';
type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'audio' | 'video' | 'image' | 'document';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileIcon(category: string) {
  switch (category) {
    case 'audio':    return FileAudio;
    case 'video':    return FileVideo;
    case 'image':    return FileImage;
    default:         return File;
  }
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Archive Confirm Modal ────────────────────────────────────────────────────

function ArchiveConfirmModal({
  upload,
  onClose,
  onConfirm,
}: {
  upload: UploadRow;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15, 23, 42, 0.99)', border: '1px solid rgba(148, 163, 184, 0.12)' }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-700 rounded-full" />
        </div>

        <div className="px-6 py-5 sm:py-6">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Move to Archive</h2>
              <p className="text-neutral-500 text-xs">You can restore this anytime</p>
            </div>
          </div>

          {/* What this means */}
          <div
            className="rounded-xl p-4 mb-5 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200/80 text-sm leading-relaxed">
              This file will be removed from your active library but{' '}
              <strong className="text-amber-200">not deleted</strong>. It will appear in your
              Archived tab and can be restored or permanently deleted from there.
            </p>
          </div>

          {/* Asset preview */}
          <div
            className="rounded-xl px-4 py-3 mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.1)' }}
          >
            <p className="text-xs text-neutral-600 mb-1">File to archive</p>
            <p className="text-white font-medium text-sm truncate">{upload.file_name}</p>
            {upload.dccs_certificates?.[0] && (
              <p className="text-neutral-600 text-xs font-mono mt-0.5 truncate">
                {upload.dccs_certificates[0].clearance_code}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white transition-colors min-h-[48px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all min-h-[48px] flex items-center justify-center gap-2"
              style={{ background: '#d97706', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#fff' }} /><span>Archiving...</span></>
                : <><Archive className="w-4 h-4" /><span>Move to Archive</span></>
              }
            </button>
          </div>
        </div>

        {/* Mobile bottom padding */}
        <div className="sm:hidden h-4" />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, iconColor = '#FF5A1F' }: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  iconColor?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.1)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="h-6 w-6 sm:h-7 sm:h-7" style={{ color: iconColor, width: '1.625rem', height: '1.625rem' }} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-neutral-500">{label}</div>
    </div>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────

function GridCard({
  upload, isArchived, copiedCode,
  onCopy, onDownload, onArchive, onRestore, onDelete,
}: {
  upload: UploadRow;
  isArchived: boolean;
  copiedCode: string | null;
  onCopy: (code: string) => void;
  onDownload: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const FileIcon = getFileIcon(upload.file_category);
  const dccsCode = upload.dccs_certificates?.[0];

  return (
    <div
      className="group rounded-xl p-4 sm:p-5 transition-all duration-200 flex flex-col"
      style={{
        background: isArchived ? 'rgba(11, 15, 23, 0.7)' : 'rgba(15, 23, 42, 0.65)',
        border: isArchived ? '1px solid rgba(148,163,184,0.07)' : '1px solid rgba(148,163,184,0.1)',
      }}
      onMouseEnter={(e) => {
        if (!isArchived) e.currentTarget.style.borderColor = 'rgba(255, 90, 31, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isArchived
          ? 'rgba(148,163,184,0.07)'
          : 'rgba(148,163,184,0.1)';
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3.5">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isArchived ? 'rgba(148,163,184,0.08)' : 'rgba(255, 90, 31, 0.12)',
          }}
        >
          <FileIcon
            className="h-5 w-5"
            style={{ color: isArchived ? 'rgba(148,163,184,0.5)' : '#FF5A1F' }}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {dccsCode && !isArchived && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <Shield className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">DCCS</span>
            </div>
          )}
          {isArchived && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Archive className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-amber-500 font-medium">Archived</span>
            </div>
          )}

          <AssetActionMenu
            fileName={upload.file_name}
            dccsCode={dccsCode?.clearance_code}
            isArchived={isArchived}
            onView={dccsCode ? () => window.open(`/verify-dccs-code?code=${dccsCode.clearance_code}`, '_blank') : undefined}
            onCopy={dccsCode ? () => onCopy(dccsCode.clearance_code) : undefined}
            onDownload={!isArchived ? onDownload : undefined}
            onArchive={!isArchived ? onArchive : undefined}
            onRestore={isArchived ? onRestore : undefined}
            onDelete={isArchived ? onDelete : undefined}
          />
        </div>
      </div>

      {/* File name */}
      <h3
        className="text-sm sm:text-base font-semibold truncate mb-1"
        style={{ color: isArchived ? 'rgba(255,255,255,0.5)' : '#fff' }}
        title={upload.file_name}
      >
        {upload.file_name}
      </h3>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-neutral-600 mb-3">
        <span>{formatFileSize(upload.file_size)}</span>
        <span>
          {isArchived && upload.archived_at
            ? `Archived ${new Date(upload.archived_at).toLocaleDateString()}`
            : new Date(upload.created_at).toLocaleDateString()
          }
        </span>
      </div>

      {/* DCCS ownership code — primary identifier */}
      {upload.dccs_ownership_code && !isArchived && (
        <div
          className="rounded-lg px-3 py-2.5 mb-2"
          style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)' }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(14,165,233,0.7)' }}>Ownership Code</span>
            <button
              onClick={() => onCopy(upload.dccs_ownership_code!)}
              className="transition-colors"
              style={{ color: copiedCode === upload.dccs_ownership_code ? '#22c55e' : 'rgba(14,165,233,0.6)' }}
              aria-label="Copy ownership code"
            >
              {copiedCode === upload.dccs_ownership_code
                ? <CheckCircle className="h-3 w-3" />
                : <Copy className="h-3 w-3" />
              }
            </button>
          </div>
          <p className="text-sky-300 font-mono text-xs font-bold break-all leading-relaxed">
            {upload.dccs_ownership_code}
          </p>
        </div>
      )}

      {/* DCCS clearance code block */}
      {dccsCode && !isArchived && (
        <div
          className="rounded-lg p-3 mb-3 flex-1"
          style={{ background: 'rgba(11,15,23,0.6)', border: '1px solid rgba(148,163,184,0.1)' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-600">Clearance Code</span>
            <button
              onClick={() => onCopy(dccsCode.clearance_code)}
              className="transition-colors"
              style={{ color: copiedCode === dccsCode.clearance_code ? '#22c55e' : '#FF5A1F' }}
              aria-label="Copy clearance code"
            >
              {copiedCode === dccsCode.clearance_code
                ? <CheckCircle className="h-3.5 w-3.5" />
                : <Copy className="h-3.5 w-3.5" />
              }
            </button>
          </div>
          <div className="text-white/60 font-mono text-xs break-all leading-relaxed">
            {dccsCode.clearance_code}
          </div>
          <Link
            to={`/verify-dccs-code?code=${dccsCode.clearance_code}`}
            className="flex items-center gap-1 text-xs mt-2 transition-colors"
            style={{ color: '#FF5A1F' }}
          >
            <span>Verify</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Primary action button */}
      {!isArchived ? (
        <div className="mt-auto space-y-2">
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] min-h-[44px]"
            style={{ background: '#FF5A1F' }}
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          {(upload.dccs_ownership_code || dccsCode) && (
            <ShareCertificate
              dccsCode={upload.dccs_ownership_code ?? dccsCode!.clearance_code}
              fileName={upload.file_name}
              assetType={upload.file_category}
              compact
            />
          )}
        </div>
      ) : (
        <button
          onClick={onRestore}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] min-h-[44px]"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(148,163,184,0.15)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Restore
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyContentLibrary() {
  const { user }             = useAuth();
  const { addNotification }  = useNotifications();

  const [uploads, setUploads]       = useState<UploadRow[]>([]);
  const [stats, setStats]           = useState<Stats>({
    total_uploads: 0, total_dccs_codes: 0,
    total_storage_used: 0, protected_content: 0, archived_count: 0,
  });
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<LibraryTab>('active');
  const [viewMode, setViewMode]     = useState<ViewMode>('grid');
  const [filterCat, setFilterCat]   = useState<FilterCategory>('all');
  const [searchQuery, setSearch]    = useState('');
  const [copiedCode, setCopied]     = useState<string | null>(null);

  // Modal state
  const [archiveTarget, setArchiveTarget]   = useState<UploadRow | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<DeletionTarget | null>(null);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadContent = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uploads')
        .select(`
          *,
          dccs_certificates (
            id, audio_fingerprint, clearance_code, creation_timestamp
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return;

      setUploads(data);

      const active   = data.filter((u) => !u.archived_at);
      const archived = data.filter((u) => !!u.archived_at);

      setStats({
        total_uploads:     active.length,
        total_dccs_codes:  active.reduce((s, u) => s + (u.dccs_certificates?.length ?? 0), 0),
        total_storage_used: active.reduce((s, u) => s + (u.file_size ?? 0), 0),
        protected_content:  active.filter((u) => (u.dccs_certificates?.length ?? 0) > 0).length,
        archived_count:    archived.length,
      });
    } catch (err) {
      logger.error('[Library] load failed:', err);
      addNotification({ type: 'error', title: 'Load Failed', message: 'Failed to load your library.' });
    } finally {
      setLoading(false);
    }
  }, [user, addNotification]);

  useEffect(() => { if (user) loadContent(); }, [user, loadContent]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleDownload = async (upload: UploadRow) => {
    try {
      let url = upload.file_url;
      if (!url?.trim()) {
        const bucket = getBucketForCategory(upload.file_category);
        const { data } = supabase.storage.from(bucket).getPublicUrl(upload.storage_path ?? '');
        url = data.publicUrl;
      }
      if (!url) throw new Error('Could not resolve download URL.');

      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
      const blob = await resp.blob();
      const obj  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: obj, download: upload.file_name });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(obj); document.body.removeChild(a); }, 1000);
      addNotification({ type: 'success', title: 'Download Complete', message: `Downloaded: ${upload.file_name}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed.';
      addNotification({ type: 'error', title: 'Download Failed', message: msg });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    addNotification({ type: 'success', title: 'Copied', message: `DCCS Code copied` });
    setTimeout(() => setCopied(null), 2000);
  };

  const archiveUpload = async (upload: UploadRow) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('uploads')
        .update({ archived_at: now })
        .eq('id', upload.id)
        .eq('user_id', user!.id);
      if (error) throw error;

      // Write archive event
      await supabase.from('asset_archive_events').insert({
        upload_id: upload.id,
        user_id:   user!.id,
        action:    'archived',
      });

      addNotification({ type: 'success', title: 'Archived', message: `"${upload.file_name}" moved to archive.` });
      setArchiveTarget(null);
      await loadContent();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not archive file.';
      addNotification({ type: 'error', title: 'Archive Failed', message: msg });
    }
  };

  const restoreUpload = async (upload: UploadRow) => {
    try {
      const { error } = await supabase
        .from('uploads')
        .update({ archived_at: null, archive_reason: null })
        .eq('id', upload.id)
        .eq('user_id', user!.id);
      if (error) throw error;

      await supabase.from('asset_archive_events').insert({
        upload_id: upload.id,
        user_id:   user!.id,
        action:    'restored',
      });

      addNotification({ type: 'success', title: 'Restored', message: `"${upload.file_name}" restored to your library.` });
      await loadContent();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not restore file.';
      addNotification({ type: 'error', title: 'Restore Failed', message: msg });
    }
  };

  // ─── Derived data ──────────────────────────────────────────────────────────

  const displayed = uploads
    .filter((u) => (tab === 'active' ? !u.archived_at : !!u.archived_at))
    .filter((u) => filterCat === 'all' || u.file_category === filterCat)
    .filter((u) => u.file_name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F17' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '2rem', height: '2rem' }} />
          <p className="text-neutral-400 text-sm">Loading your library...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0B0F17' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">My Content Library</h1>
            <p className="text-neutral-500 text-sm sm:text-base">All your uploads with DCCS protection codes</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 flex-shrink-0 min-h-[48px]"
            style={{ background: '#FF5A1F' }}
          >
            <Upload className="h-4 w-4" />
            Upload New
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard icon={Upload}      value={stats.total_uploads}                       label="Active Files" />
          <StatCard icon={Fingerprint} value={stats.total_dccs_codes}                    label="DCCS Codes" />
          <StatCard icon={HardDrive}   value={formatFileSize(stats.total_storage_used)}  label="Storage Used" />
          <StatCard icon={Shield}      value={stats.protected_content}                   label="Protected" iconColor="#22c55e" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-6" style={{ borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: '0' }}>
          {([
            { id: 'active',   label: 'Active Library', count: stats.total_uploads },
            { id: 'archived', label: 'Archived',        count: stats.archived_count, icon: Archive },
          ] as { id: LibraryTab; label: string; count: number; icon?: React.ElementType }[]).map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all
                border-b-2 -mb-px relative
                ${tab === id
                  ? 'text-white border-orange-500'
                  : 'text-neutral-500 border-transparent hover:text-neutral-300'
                }
              `}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {label}
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium ml-0.5"
                  style={{
                    background: tab === id ? 'rgba(255,90,31,0.15)' : 'rgba(148,163,184,0.1)',
                    color: tab === id ? '#FF5A1F' : 'rgba(148,163,184,0.6)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Archive hint ── */}
        {tab === 'archived' && stats.archived_count > 0 && (
          <div
            className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-400/80 text-sm leading-relaxed">
              Archived files are hidden from your active library but remain on the platform.
              You can <strong className="text-amber-400">restore</strong> them at any time, or{' '}
              <strong className="text-amber-400">permanently delete</strong> them from here.
            </p>
          </div>
        )}

        {/* ── Filter / search bar ── */}
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.1)' }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-900/60 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none min-h-[44px]"
                style={{ border: '1px solid rgba(148,163,184,0.12)' }}
                onFocus={(e) => (e.target.style.borderColor = '#FF5A1F')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(148,163,184,0.12)')}
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Category filter */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value as FilterCategory)}
                className="px-3 py-2.5 bg-neutral-900/60 rounded-lg text-white text-sm focus:outline-none min-h-[44px]"
                style={{ border: '1px solid rgba(148,163,184,0.12)' }}
              >
                <option value="all">All Types</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>

              {/* View toggle */}
              <div
                className="flex items-center gap-1 rounded-lg p-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.12)' }}
              >
                {([
                  { mode: 'grid' as ViewMode, icon: Grid3x3 },
                  { mode: 'list' as ViewMode, icon: List },
                ]).map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="p-2 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    style={{
                      background: viewMode === mode ? '#FF5A1F' : 'transparent',
                      color: viewMode === mode ? '#fff' : 'rgba(148,163,184,0.5)',
                    }}
                    aria-label={`${mode} view`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {displayed.length === 0 ? (
          <div
            className="rounded-xl p-12 sm:p-16 text-center"
            style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.08)' }}
          >
            {tab === 'archived' ? (
              <>
                <Archive className="h-12 w-12 mx-auto mb-4 text-neutral-700" />
                <h3 className="text-lg font-semibold text-white mb-2">No archived files</h3>
                <p className="text-neutral-600 text-sm max-w-xs mx-auto">
                  Files you archive will appear here. You can restore them anytime.
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-700" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery || filterCat !== 'all' ? 'No results' : 'No uploads yet'}
                </h3>
                <p className="text-neutral-600 text-sm mb-6 max-w-xs mx-auto">
                  {searchQuery || filterCat !== 'all'
                    ? 'Try adjusting your search or filter.'
                    : 'Upload your first file to get started with DCCS protection.'}
                </p>
                {!searchQuery && filterCat === 'all' && (
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm min-h-[48px]"
                    style={{ background: '#FF5A1F' }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Now
                  </Link>
                )}
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayed.map((upload) => (
              <GridCard
                key={upload.id}
                upload={upload}
                isArchived={tab === 'archived'}
                copiedCode={copiedCode}
                onCopy={copyCode}
                onDownload={() => handleDownload(upload)}
                onArchive={() => setArchiveTarget(upload)}
                onRestore={() => restoreUpload(upload)}
                onDelete={() => {
                  const dccs = upload.dccs_certificates?.[0];
                  setPendingDeletion({
                    type: 'upload',
                    id: upload.id,
                    ownerId: user!.id,
                    displayName: upload.file_name,
                    hasDCCSCode: !!dccs,
                    dccsCode: dccs?.clearance_code,
                  });
                }}
              />
            ))}
          </div>
        ) : (
          /* ── List view ── */
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(148,163,184,0.1)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">File</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">DCCS Code</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Size</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                      {tab === 'archived' ? 'Archived' : 'Uploaded'}
                    </th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((upload) => {
                    const FileIcon = getFileIcon(upload.file_category);
                    const dccs = upload.dccs_certificates?.[0];
                    const isArchived = tab === 'archived';

                    return (
                      <tr
                        key={upload.id}
                        className="group transition-colors"
                        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* File */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: isArchived ? 'rgba(148,163,184,0.06)' : 'rgba(255,90,31,0.12)' }}
                            >
                              <FileIcon className="h-4 w-4" style={{ color: isArchived ? 'rgba(148,163,184,0.4)' : '#FF5A1F' }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[180px]" style={{ color: isArchived ? 'rgba(255,255,255,0.45)' : '#fff' }}>
                                {upload.file_name}
                              </p>
                              <p className="text-xs text-neutral-600 capitalize">{categoryLabel(upload.file_category)}</p>
                            </div>
                          </div>
                        </td>

                        {/* DCCS — ownership code primary, clearance code secondary */}
                        <td className="px-5 py-4">
                          {upload.dccs_ownership_code ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <code className="text-xs font-mono font-bold max-w-[160px] truncate text-sky-300">
                                  {upload.dccs_ownership_code}
                                </code>
                                <button
                                  onClick={() => copyCode(upload.dccs_ownership_code!)}
                                  className="text-neutral-600 hover:text-sky-400 transition-colors flex-shrink-0"
                                  aria-label="Copy ownership code"
                                >
                                  {copiedCode === upload.dccs_ownership_code
                                    ? <CheckCircle className="h-3 w-3 text-green-400" />
                                    : <Copy className="h-3 w-3" />
                                  }
                                </button>
                              </div>
                              {dccs && (
                                <code className="text-xs font-mono max-w-[160px] truncate block" style={{ color: 'rgba(148,163,184,0.3)' }}>
                                  {dccs.clearance_code}
                                </code>
                              )}
                            </div>
                          ) : dccs ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono max-w-[140px] truncate" style={{ color: isArchived ? 'rgba(148,163,184,0.4)' : '#FF5A1F' }}>
                                {dccs.clearance_code}
                              </code>
                              <button
                                onClick={() => copyCode(dccs.clearance_code)}
                                className="text-neutral-600 hover:text-white transition-colors flex-shrink-0"
                                aria-label="Copy clearance code"
                              >
                                {copiedCode === dccs.clearance_code
                                  ? <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                                  : <Copy className="h-3.5 w-3.5" />
                                }
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-600 text-xs">Processing...</span>
                          )}
                        </td>

                        {/* Size */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-sm text-neutral-500">{formatFileSize(upload.file_size)}</span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-neutral-500">
                            {isArchived && upload.archived_at
                              ? new Date(upload.archived_at).toLocaleDateString()
                              : new Date(upload.created_at).toLocaleDateString()
                            }
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {!isArchived && (
                              <button
                                onClick={() => handleDownload(upload)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/8 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            {isArchived && (
                              <button
                                onClick={() => restoreUpload(upload)}
                                className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/8 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Restore"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                            )}
                            <AssetActionMenu
                              fileName={upload.file_name}
                              dccsCode={dccs?.clearance_code}
                              isArchived={isArchived}
                              onView={dccs ? () => window.open(`/verify-dccs-code?code=${dccs.clearance_code}`, '_blank') : undefined}
                              onCopy={dccs ? () => copyCode(dccs.clearance_code) : undefined}
                              onDownload={!isArchived ? () => handleDownload(upload) : undefined}
                              onArchive={!isArchived ? () => setArchiveTarget(upload) : undefined}
                              onRestore={isArchived ? () => restoreUpload(upload) : undefined}
                              onDelete={isArchived ? () => {
                                setPendingDeletion({
                                  type: 'upload',
                                  id: upload.id,
                                  ownerId: user!.id,
                                  displayName: upload.file_name,
                                  hasDCCSCode: !!dccs,
                                  dccsCode: dccs?.clearance_code,
                                });
                              } : undefined}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Deletion history note (archived tab) ── */}
        {tab === 'archived' && stats.archived_count > 0 && (
          <div className="mt-8 flex items-start gap-3">
            <Trash2 className="h-4 w-4 text-neutral-700 flex-shrink-0 mt-0.5" />
            <p className="text-neutral-700 text-xs leading-relaxed">
              Permanent deletions are logged in a GDPR-compliant audit record.
              Once permanently deleted, an asset cannot be recovered.
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {archiveTarget && (
        <ArchiveConfirmModal
          upload={archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={() => archiveUpload(archiveTarget)}
        />
      )}

      {pendingDeletion && (
        <DeleteConfirmModal
          target={pendingDeletion}
          onClose={() => setPendingDeletion(null)}
          onSuccess={() => {
            setPendingDeletion(null);
            loadContent();
          }}
        />
      )}
    </div>
  );
}
