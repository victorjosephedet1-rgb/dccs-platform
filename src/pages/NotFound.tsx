import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Upload, Library, Home, ArrowLeft,
  Search, HelpCircle, Mail, ExternalLink, ChevronRight,
  FileX, Link2Off, Lock,
} from 'lucide-react';
import { PLATFORM_INFO } from '../utils/routes';

// ─── Context detection ────────────────────────────────────────────────────────

type ErrorContext = 'broken_asset' | 'auth_required' | 'external_link' | 'wrong_route';

function detectContext(pathname: string): ErrorContext {
  const p = pathname.toLowerCase();

  // Paths that look like file/asset/certificate deep-links
  if (
    p.includes('/verify') ||
    p.includes('/certificate') ||
    p.includes('/asset') ||
    p.includes('/dccs-') ||
    p.includes('/download') ||
    p.includes('/file')
  ) {
    return 'broken_asset';
  }

  // Paths that look like they require login
  if (
    p.includes('/my-') ||
    p.includes('/dashboard') ||
    p.includes('/account') ||
    p.includes('/profile') ||
    p.includes('/admin')
  ) {
    return 'auth_required';
  }

  // Paths with external-style IDs or slugs that look shared
  if (/\/[a-z0-9]{8,}/i.test(p)) {
    return 'external_link';
  }

  return 'wrong_route';
}

const CONTEXT_CONFIG: Record<ErrorContext, {
  icon:    React.ElementType;
  color:   string;
  heading: string;
  detail:  string;
}> = {
  broken_asset: {
    icon:    FileX,
    color:   '#0ea5e9',
    heading: 'This file may require a valid DCCS ownership link.',
    detail:  'Asset links are only accessible with a valid DCCS code and authentication. The asset may have been moved or removed.',
  },
  auth_required: {
    icon:    Lock,
    color:   '#f59e0b',
    heading: 'This page requires you to be logged in.',
    detail:  'Sign in to access your dashboard, library, and protected assets.',
  },
  external_link: {
    icon:    Link2Off,
    color:   '#10b981',
    heading: 'This asset may be private or no longer available.',
    detail:  'Shared asset links expire or require login if the owner has restricted access.',
  },
  wrong_route: {
    icon:    Shield,
    color:   '#FF5A1F',
    heading: 'This page route does not exist or has changed.',
    detail:  'The URL you followed may be outdated. Use the links below to find what you need.',
  },
};

// ─── DCCS code search ─────────────────────────────────────────────────────────

const CODE_PATTERN = /^DCCS-[A-Za-z0-9]+-[A-Z]+-[A-Z0-9]+-\d+$/;

function DCCSCodeSearch() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const isValid = CODE_PATTERN.test(code.trim());

  const handleSearch = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    navigate(`/verify-dccs-code?code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-sky-400" />
        <p className="text-white font-semibold text-sm">Find your asset by ownership code</p>
      </div>
      <p className="text-white/40 text-xs mb-4 leading-relaxed">
        Enter your DCCS ownership code to locate and verify your asset directly.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="DCCS-VictorEdet-AUD-A91K-01"
          className="flex-1 bg-transparent rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-white/20 outline-none transition-colors"
          style={{ border: `1px solid ${isValid ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}` }}
        />
        <button
          onClick={handleSearch}
          disabled={!code.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30"
          style={{ background: isValid ? '#0ea5e9' : 'rgba(255,255,255,0.08)' }}
        >
          Verify
        </button>
      </div>

      <p className="text-white/25 text-xs mt-2 font-mono">
        Format: DCCS-{'{'}CreatorTag{'}'}-{'{'}TYPE{'}'}-{'{'}HASH{'}'}-{'{'}SEQ{'}'}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotFound() {
  const location = useLocation();
  const context  = useMemo(() => detectContext(location.pathname), [location.pathname]);
  const cfg      = CONTEXT_CONFIG[context];
  const ContextIcon = cfg.icon;

  const primaryActions = [
    { to: '/',        icon: Home,    label: 'Go to Homepage',   primary: true  },
    { to: '/upload',  icon: Upload,  label: 'Upload New Asset', primary: true  },
    { to: '/library', icon: Library, label: 'View My Library',  primary: false },
  ];

  const secondaryActions = [
    { to: '/dccs-system-info', icon: HelpCircle,     label: 'Learn what DCCS is' },
    { to: `mailto:${PLATFORM_INFO.SUPPORT_EMAIL}`, icon: Mail, label: 'Contact Support', external: true },
  ];

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #0B0F17 0%, #0c1520 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-20">

        {/* DCCS identity header */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,90,31,0.12)', border: '1px solid rgba(255,90,31,0.25)' }}
          >
            <Shield className="w-5 h-5" style={{ color: '#FF5A1F' }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">DCCS</p>
            <p className="text-white/30 text-xs">Digital Creative Copyright System</p>
          </div>
        </div>

        {/* Context icon + 404 heading */}
        <div className="mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}
          >
            <ContextIcon className="w-8 h-8" style={{ color: cfg.color }} />
          </div>

          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
          >
            404 — Page Not Found
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Page Not Found in DCCS
          </h1>
          <p className="text-white/50 leading-relaxed mb-1">
            This page may have moved, been removed, or the link may be incorrect.
          </p>
          {location.pathname && (
            <code
              className="inline-block text-xs font-mono px-2 py-1 rounded-lg mt-1"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
            >
              {location.pathname}
            </code>
          )}
        </div>

        {/* Context-specific explanation */}
        <div
          className="rounded-xl px-5 py-4 mb-8"
          style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: cfg.color }}>
            {cfg.heading}
          </p>
          <p className="text-white/50 text-sm leading-relaxed">{cfg.detail}</p>
        </div>

        {/* What DCCS is — brief education block */}
        <div
          className="rounded-xl px-5 py-4 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">About DCCS</p>
          <p className="text-white/60 text-sm leading-relaxed">
            <span className="text-white font-semibold">DCCS</span> protects and manages your digital assets
            using unique ownership codes. Every uploaded file receives a permanent, verifiable code
            that proves your creation — instantly and for free.
          </p>
          <p className="text-white/40 text-sm mt-1.5">
            If you were trying to access a file, it may require authentication or a valid ownership link.
          </p>
        </div>

        {/* Primary actions */}
        <div className="mb-4">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Where would you like to go?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {primaryActions.map(({ to, icon: Icon, label, primary }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] group"
                style={primary
                  ? { background: '#FF5A1F', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          {secondaryActions.map(({ to, icon: Icon, label, external }) =>
            external ? (
              <a
                key={to}
                href={to}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ) : (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            )
          )}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Ownership code search */}
        <DCCSCodeSearch />

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            {PLATFORM_INFO.COMPANY} &nbsp;&middot;&nbsp; dccsverify.com
          </p>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="text-white/20 hover:text-white/40 text-xs transition-colors">Safety</Link>
            <a href="/legal/privacy-policy.html" className="text-white/20 hover:text-white/40 text-xs transition-colors">Privacy</a>
            <a href="/legal/terms-of-service.html" className="text-white/20 hover:text-white/40 text-xs transition-colors">Terms</a>
          </div>
        </div>

      </div>
    </div>
  );
}
