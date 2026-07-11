/**
 * AssetActionMenu
 *
 * Kebab (⋯) menu for each asset card in the library.
 *
 * Desktop: floating dropdown anchored to the trigger button.
 * Mobile: bottom action sheet (slides up from bottom edge).
 *
 * Actions exposed:
 *   - View details (opens DCCS verification link)
 *   - Copy DCCS code
 *   - Download
 *   - Archive  (soft-delete → moves to Archived tab)
 *   - Delete permanently  (only visible inside the Archived tab)
 *   - Restore  (only visible inside the Archived tab)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MoreHorizontal, ExternalLink, Copy, Download, Archive,
  Trash2, RotateCcw, CheckCircle, X, Shield,
} from 'lucide-react';

export interface AssetAction {
  id: 'view' | 'copy' | 'download' | 'archive' | 'restore' | 'delete';
  label: string;
  icon: React.ElementType;
  variant?: 'default' | 'warning' | 'danger';
  disabled?: boolean;
}

interface AssetActionMenuProps {
  fileName: string;
  dccsCode?: string;
  isArchived?: boolean;
  onView?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

function buildActions({
  dccsCode, isArchived, onView, onCopy, onDownload, onArchive, onRestore, onDelete,
}: Omit<AssetActionMenuProps, 'fileName'>): AssetAction[] {
  const actions: AssetAction[] = [];

  if (dccsCode && onView) {
    actions.push({ id: 'view', label: 'View certificate', icon: ExternalLink });
  }
  if (dccsCode && onCopy) {
    actions.push({ id: 'copy', label: 'Copy DCCS code', icon: Copy });
  }
  if (!isArchived && onDownload) {
    actions.push({ id: 'download', label: 'Download', icon: Download });
  }

  if (isArchived) {
    if (onRestore) {
      actions.push({ id: 'restore', label: 'Restore to library', icon: RotateCcw });
    }
    if (onDelete) {
      actions.push({ id: 'delete', label: 'Delete permanently', icon: Trash2, variant: 'danger' });
    }
  } else {
    if (onArchive) {
      actions.push({ id: 'archive', label: 'Move to archive', icon: Archive, variant: 'warning' });
    }
  }

  return actions;
}

function ActionItem({
  action, onClick,
}: { action: AssetAction; onClick: () => void }) {
  const Icon = action.icon;
  const color =
    action.variant === 'danger'  ? 'text-red-400  hover:bg-red-500/10  hover:text-red-300'  :
    action.variant === 'warning' ? 'text-amber-400 hover:bg-amber-500/8 hover:text-amber-300' :
    'text-neutral-300 hover:bg-white/6 hover:text-white';

  return (
    <button
      onClick={onClick}
      disabled={action.disabled}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
        rounded-lg transition-colors duration-100 text-left min-h-[44px]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${color}
      `}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {action.label}
    </button>
  );
}

export default function AssetActionMenu(props: AssetActionMenuProps) {
  const {
    fileName, dccsCode, isArchived,
    onView, onCopy, onDownload, onArchive, onRestore, onDelete,
  } = props;

  const [open, setOpen]         = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef    = useRef<HTMLDivElement>(null);

  const actions = buildActions({ dccsCode, isArchived, onView, onCopy, onDownload, onArchive, onRestore, onDelete });

  // Detect mobile (pointer: coarse = touch)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const dispatch = (action: AssetAction) => {
    setOpen(false);
    switch (action.id) {
      case 'view':     onView?.();     break;
      case 'copy':     onCopy?.();     break;
      case 'download': onDownload?.(); break;
      case 'archive':  onArchive?.();  break;
      case 'restore':  onRestore?.();  break;
      case 'delete':   onDelete?.();   break;
    }
  };

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className="
          flex items-center justify-center w-9 h-9 rounded-lg
          text-neutral-500 hover:text-white hover:bg-white/8
          transition-colors duration-150 flex-shrink-0
        "
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Desktop dropdown */}
      {open && !isMobile && (
        <div
          ref={menuRef}
          role="menu"
          className="
            absolute right-0 top-full mt-1.5 z-50
            w-52 rounded-xl border shadow-xl py-1.5
            animate-slide-down
          "
          style={{
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 40px -8px rgba(0,0,0,0.6)',
          }}
        >
          <div className="px-4 pb-2 pt-1 border-b mb-1.5" style={{ borderColor: 'rgba(148,163,184,0.1)' }}>
            <p className="text-xs text-neutral-600 truncate">{fileName}</p>
          </div>
          <div className="px-1.5">
            {actions.map((action) => (
              <ActionItem key={action.id} action={action} onClick={() => dispatch(action)} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom action sheet */}
      {open && isMobile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="
              fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl
              pb-safe-bottom
            "
            style={{
              background: 'rgba(13, 17, 28, 0.99)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderBottom: 'none',
              animation: 'slideUpSheet 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-neutral-700 rounded-full" />
            </div>

            {/* Asset preview */}
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
              {dccsCode ? (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,90,31,0.12)' }}>
                  <Shield className="h-4 w-4" style={{ color: '#FF5A1F' }} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{fileName}</p>
                {dccsCode && <p className="text-xs text-neutral-600 font-mono truncate">{dccsCode}</p>}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-white/8 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-3 py-2 space-y-0.5">
              {actions.map((action) => (
                <ActionItem key={action.id} action={action} onClick={() => dispatch(action)} />
              ))}
            </div>

            {/* Bottom safe area padding */}
            <div className="h-4" />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
