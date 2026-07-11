import { useState } from 'react';
import { Shield, Hash, Lock, Copy, CheckCircle, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DCCSOwnershipExplainerCardProps {
  ownershipCode?: string;
  compact?: boolean;
}

const CODE_FACTS = [
  { icon: Hash,         text: 'Automatically generated on every upload' },
  { icon: Shield,       text: 'Unique to your creator identity' },
  { icon: Lock,         text: 'Cannot be changed, transferred, or duplicated' },
  { icon: CheckCircle,  text: 'Embedded in every certificate and download' },
];

export function DCCSOwnershipExplainerCard({ ownershipCode, compact = false }: DCCSOwnershipExplainerCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const handleCopy = () => {
    if (!ownershipCode) return;
    navigator.clipboard.writeText(ownershipCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.15)' }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => compact && setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(14,165,233,0.12)' }}
          >
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Your DCCS Ownership Code</p>
            <p className="text-white/40 text-xs">Permanent creator identity marker</p>
          </div>
        </div>
        {compact && (
          <span className="text-white/30">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Live ownership code display */}
          {ownershipCode ? (
            <div
              className="flex items-center justify-between gap-3 rounded-lg px-4 py-3"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}
            >
              <p className="font-mono text-sky-300 font-bold text-sm tracking-wide truncate">{ownershipCode}</p>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-white/40 hover:text-sky-400 transition-colors"
                title="Copy ownership code"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <p className="text-white/30 text-xs font-mono">Generated automatically on your next upload</p>
            </div>
          )}

          {/* Facts grid */}
          <ul className="space-y-2.5">
            {CODE_FACTS.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="text-white/60 text-xs">{text}</span>
              </li>
            ))}
          </ul>

          {/* Format example */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1.5">Code format</p>
            <p className="font-mono text-white/50 text-xs">DCCS-<span className="text-sky-400/80">CreatorTag</span>-<span className="text-emerald-400/80">TYPE</span>-<span className="text-amber-400/80">HASH</span>-<span className="text-white/60">SEQ</span></p>
            <p className="font-mono text-white/30 text-xs mt-1">e.g. DCCS-VictorEdet-AUD-A91K-01</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline tooltip shown next to the upload button.
 * Dismissible per-session via local state.
 */
export function UploadTooltipBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('dccs-upload-tooltip-dismissed') === '1'; }
    catch { return false; }
  });

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('dccs-upload-tooltip-dismissed', '1'); } catch {}
  };

  if (dismissed) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-4"
      style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.18)' }}
    >
      <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
      <p className="text-white/60 text-xs leading-relaxed flex-1">
        <span className="text-sky-400 font-semibold">DCCS system:</span>{' '}
        We automatically generate a permanent ownership code for every file you upload.
        Your code is tied to your creator identity and cannot be changed.
      </p>
      <button onClick={dismiss} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
