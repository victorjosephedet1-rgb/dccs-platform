import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Globe, Lock, ArrowRight, Music, Mic } from 'lucide-react';
import { DCCSCodeDisplay } from './DCCSCodeDisplay';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface PlatformStats {
  total_uploads:  number;
  total_creators: number;
  total_codes:    number;
}

function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>({
    total_uploads:  0,
    total_creators: 0,
    total_codes:    0,
  });

  useEffect(() => {
    Promise.all([
      supabase.from('uploads').select('id', { count: 'exact', head: true }).eq('upload_status', 'completed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('dccs_certificates').select('id', { count: 'exact', head: true }),
    ]).then(([uploads, profiles, certs]) => {
      setStats({
        total_uploads:  uploads.count ?? 0,
        total_creators: profiles.count ?? 0,
        total_codes:    certs.count ?? 0,
      });
    }).catch(() => {});
  }, []);

  return stats;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return n > 0 ? `${n}+` : '0';
}

export const TrustProofSection: React.FC = () => {
  const [verifying, setVerifying] = useState(true);
  const stats = usePlatformStats();

  useEffect(() => {
    const t = setTimeout(() => setVerifying(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const sampleCode = 'DCCS-AUDIO-2026-A7B3X9';

  return (
    <div className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Live stats */}
        <div
          className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-20 rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {[
            { value: formatCount(stats.total_creators), label: 'Creators Protected' },
            { value: formatCount(stats.total_uploads),  label: 'Assets Registered'  },
            { value: formatCount(stats.total_codes),    label: 'DCCS Codes Issued'  },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-white mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
                {value}
              </p>
              <p className="text-white/40 text-xs sm:text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — verification demo */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">VERIFIED SYSTEM</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Every Asset.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Permanently Verified.
              </span>
            </h2>

            <p className="text-gray-400 mb-8 leading-relaxed">
              DCCS provides cryptographic proof of ownership that anyone can verify, anywhere in the world, at any time.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: CheckCircle, color: '#22c55e', title: 'Instant Verification',  body: 'Anyone can verify ownership in seconds using your DCCS code' },
                { icon: Globe,       color: '#0ea5e9', title: 'Global Registry',        body: 'Recognized worldwide as proof of original creation' },
                { icon: Lock,        color: '#f59e0b', title: 'Immutable Proof',        body: 'Timestamp and ownership locked in permanent ledger' },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{title}</h3>
                    <p className="text-gray-400 text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification demo */}
            <div
              className="relative rounded-3xl p-8 overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 pointer-events-none" />
              <div className="relative space-y-6">
                <div>
                  <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 block">
                    Sample DCCS Clearance Code
                  </label>
                  <DCCSCodeDisplay code={sampleCode} size="lg" showExplanation={true} />
                </div>

                <div className="border-t border-white/10 pt-6">
                  {verifying ? (
                    <div className="flex items-center gap-4 p-5 rounded-xl" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm">Verifying ownership...</p>
                        <p className="text-sky-300/70 text-xs">Checking global registry</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative rounded-xl p-6 overflow-hidden"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-green-500/15 p-3 rounded-xl border border-green-500/30">
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">VERIFIED</h3>
                          <p className="text-green-300/80 text-sm mb-3">Ownership confirmed in DCCS global registry</p>
                          <div className="space-y-1.5 text-sm">
                            <p className="text-gray-400">Type: <span className="text-white font-semibold">Audio Recording</span></p>
                            <p className="text-gray-400">Status: <span className="text-white font-semibold">Permanently Protected</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-500 text-xs text-center">
                  Publicly verifiable. Anyone can check. Anywhere. Any time.
                </p>
              </div>
            </div>
          </div>

          {/* Right — honest indie producer pitch */}
          <div className="space-y-5">
            <div
              className="rounded-2xl p-7"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <Music className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Built for Every Independent Creator</p>
                  <p className="text-white/40 text-xs">Producers, acts, artists, filmmakers, developers, writers.</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Whether you produce beats, paint digital art, shoot films, write code, or publish writing — DCCS Verify gives you the same ownership protection that major labels and studios pay lawyers for. For free. Permanently. For any digital work.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  problem: 'Someone claims your work is theirs',
                  solution: 'Your DCCS code is dated, locked, and public. They cannot dispute a timestamp.',
                },
                {
                  problem: 'A client or label wants proof you own the original',
                  solution: 'Share your clearance code. It verifies instantly worldwide — no solicitor required.',
                },
                {
                  problem: 'You release work across multiple platforms',
                  solution: 'One DCCS code covers the original upload. Every platform, every territory.',
                },
                {
                  problem: 'Your work is used without credit or payment',
                  solution: 'List it on the DCCS Marketplace. License it properly. Collect 80% of every sale.',
                },
              ].map(({ problem, solution }) => (
                <div
                  key={problem}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-white/45 text-xs mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    {problem}
                  </p>
                  <p className="text-gray-300 text-sm flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {solution}
                  </p>
                </div>
              ))}
            </div>

            {/* Marketplace CTA */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-4 h-4 text-blue-400" />
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">For All Independent Creators</p>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Register. Protect. Sell.</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Upload any digital work, get your DCCS code, then list it on the Marketplace. Buyers license directly from you — you keep 80% of every transaction.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Register a Work
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/6 hover:bg-white/10 border border-white/15 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div
              className="rounded-xl px-5 py-5 grid grid-cols-2 gap-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {[
                { label: '100% Free',   sub: 'No hidden fees, forever' },
                { label: 'Worldwide',   sub: '25+ languages supported' },
                { label: 'Instant',     sub: 'Code in seconds' },
                { label: 'Permanent',   sub: 'Records never deleted' },
              ].map(({ label, sub }) => (
                <div key={label} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-white/35 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
