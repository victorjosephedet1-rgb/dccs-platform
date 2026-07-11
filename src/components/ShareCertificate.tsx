import { useState } from 'react';
import { Share2, Copy, CheckCircle, Twitter, ExternalLink, X } from 'lucide-react';
import { SystemLogger } from '../lib/monitoring/SystemLogger';

interface ShareCertificateProps {
  dccsCode:    string;
  fileName?:   string;
  assetType?:  string;
  userId?:     string;
  compact?:    boolean;
}

const BASE_URL = 'https://dccsverify.com';

export default function ShareCertificate({
  dccsCode,
  fileName,
  assetType = 'asset',
  userId,
  compact = false,
}: ShareCertificateProps) {
  const [open,       setOpen]       = useState(false);
  const [copied,     setCopied]     = useState<'link' | 'code' | null>(null);

  const verifyUrl = `${BASE_URL}/verify?code=${encodeURIComponent(dccsCode)}`;
  const tweetText = `I just protected my ${assetType} with DCCS — the Digital Creative Copyright System.\n\nVerify it: ${verifyUrl}\n\n#DCCS #DigitalOwnership #CreatorRights`;

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2200);
      SystemLogger.info('share_code', 'Code copied to clipboard', userId, { dccsCode, type });
    } catch {
      // Clipboard access denied — fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(null), 2200);
    }
  };

  const handleNativeShare = async () => {
    SystemLogger.info('share_code', 'Native share triggered', userId, { dccsCode });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DCCS Verified: ${fileName ?? assetType}`,
          text:  `I protected my ${assetType} with DCCS — Digital Creative Copyright System.`,
          url:   verifyUrl,
        });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to modal
      }
    }
    setOpen(true);
  };

  const triggerButton = compact ? (
    <button
      onClick={handleNativeShare}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-colors"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      title="Share your certificate"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span>Share</span>
    </button>
  ) : (
    <button
      onClick={handleNativeShare}
      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
      style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9' }}
    >
      <Share2 className="w-4 h-4" />
      <span>Share Certificate</span>
    </button>
  );

  return (
    <>
      {triggerButton}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: 'rgba(12,18,32,0.99)', border: '1px solid rgba(148,163,184,0.12)' }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-neutral-700 rounded-full" />
            </div>

            <div className="px-6 py-5 sm:py-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)' }}
                  >
                    <Share2 className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Share Certificate</p>
                    <p className="text-white/35 text-xs">Prove your ownership publicly</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verification URL */}
              <div
                className="rounded-xl px-4 py-3 mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-white/35 text-xs mb-1">Verification link</p>
                <div className="flex items-center gap-2">
                  <p className="text-sky-300 text-xs font-mono flex-1 truncate">{verifyUrl}</p>
                  <button
                    onClick={() => copyToClipboard(verifyUrl, 'link')}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: copied === 'link' ? '#22c55e' : 'rgba(148,163,184,0.5)' }}
                  >
                    {copied === 'link'
                      ? <CheckCircle className="w-4 h-4" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* DCCS code */}
              <div
                className="rounded-xl px-4 py-3 mb-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-white/35 text-xs mb-1">DCCS Ownership Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-xs flex-1 break-all">{dccsCode}</p>
                  <button
                    onClick={() => copyToClipboard(dccsCode, 'code')}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: copied === 'code' ? '#22c55e' : 'rgba(148,163,184,0.5)' }}
                  >
                    {copied === 'code'
                      ? <CheckCircle className="w-4 h-4" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Share actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => SystemLogger.info('share_code', 'Shared to Twitter', userId, { dccsCode })}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'rgba(29,155,240,0.12)', border: '1px solid rgba(29,155,240,0.25)', color: '#1d9bf0' }}
                >
                  <Twitter className="w-4 h-4" />
                  <span>Post on X</span>
                </a>
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Page</span>
                </a>
              </div>

              <p className="text-white/20 text-xs text-center mt-4">
                Anyone with this link can verify your ownership — no login required.
              </p>
            </div>

            <div className="sm:hidden h-4" />
          </div>
        </div>
      )}
    </>
  );
}
