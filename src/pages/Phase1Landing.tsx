import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Shield, ArrowRight, Download, CheckCircle, ShoppingBag, Music, Mic } from 'lucide-react';
import { NetworkAnimation } from '../components/NetworkAnimation';
import { AnimatedSystemFlow } from '../components/AnimatedSystemFlow';
import { CreatorEcosystem } from '../components/CreatorEcosystem';
import { TrustProofSection } from '../components/TrustProofSection';
import EarlyAccessCapture from '../components/EarlyAccessCapture';

const FEATURES = [
  {
    icon: CheckCircle,
    label: 'Free',
    sub: 'Unlimited uploads',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Music,
    label: 'Beats',
    sub: 'Tracks, stems, samples',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Mic,
    label: 'Vocals',
    sub: 'Records & masters',
    gradient: 'from-teal-500 to-blue-500',
  },
  {
    icon: Shield,
    label: 'Proof',
    sub: 'Timestamped ownership',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: ShoppingBag,
    label: 'Sell',
    sub: 'License on marketplace',
    gradient: 'from-indigo-500 to-blue-400',
  },
  {
    icon: ArrowRight,
    label: '80/20',
    sub: 'You keep 80% of sales',
    gradient: 'from-blue-400 to-cyan-400',
  },
];

export default function Phase1Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = Math.min(scrollY * 0.25, 120);
  const heroOpacity = Math.max(1 - scrollY / 600, 0);

  return (
    <div className="min-h-screen bg-black text-white" style={{ overflowX: 'hidden' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <NetworkAnimation />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

        <div
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16 sm:pt-24 sm:pb-20"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            opacity: heroOpacity,
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/25 rounded-full px-4 py-2 mb-6 sm:mb-8 animate-fade-in">
            <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Music · Art · Film · Code · Writing · All Digital Works
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-none tracking-tight mb-6 sm:mb-8 animate-fade-in"
            style={{
              fontSize: 'clamp(2.25rem, 7vw, 5.5rem)',
              letterSpacing: '-0.035em',
              animationDelay: '0.1s',
            }}
          >
            <span className="block text-white">
              Own your creation.
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Prove it. Sell it.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              animationDelay: '0.2s',
            }}
          >
            DCCS Verify® registers any digital work — music, art, film, software, writing — with a tamper-evident ownership code.
            Free for independent creators worldwide. No label. No lawyer. Just permanent proof that you created it first.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in mb-12 sm:mb-16"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              to="/upload"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 overflow-hidden min-h-[52px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <Upload className="w-5 h-5 relative z-10 flex-shrink-0" />
              <span className="relative z-10">Register Your Work</span>
              <ArrowRight className="w-4 h-4 relative z-10 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/marketplace"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/35 hover:scale-105 min-h-[52px]"
            >
              <ShoppingBag className="w-5 h-5 flex-shrink-0" />
              <span>Marketplace</span>
            </Link>

            <Link
              to="/verify"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/35 hover:scale-105 min-h-[52px]"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>Verify Code</span>
            </Link>
          </div>

          {/* Feature stats */}
          <div
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg sm:max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {FEATURES.map(({ label, sub, gradient }) => (
              <div key={label} className="text-center">
                <div
                  className={`font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
                >
                  {label}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-9 border-2 border-white/25 rounded-full p-1 flex justify-center">
            <div className="w-1 h-2.5 bg-white/40 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* ── System Flow ── */}
      <AnimatedSystemFlow />

      {/* ── Creator Ecosystem ── */}
      <CreatorEcosystem />

      {/* ── Trust Section ── */}
      <TrustProofSection />

      {/* ── CTA + Early Access Section ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/15 to-black pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main CTA */}
          <div className="text-center mb-16">
            <h2
              className="font-bold text-white mb-5 sm:mb-6"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', letterSpacing: '-0.025em' }}
            >
              Ready to protect your work?
            </h2>
            <p
              className="text-gray-400 mb-10 sm:mb-12 max-w-xl mx-auto"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
            >
              Join thousands of creators protecting their work with DCCS Verify
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <Link
                to="/upload"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 min-h-[56px]"
              >
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span>Upload Now</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/library"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/35 min-h-[56px]"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span>View Library</span>
              </Link>
            </div>
          </div>

          {/* Early access capture */}
          <div className="max-w-xl mx-auto">
            <EarlyAccessCapture
              source="landing_cta"
              heading="Help us improve"
              subhead="Upload your work, test the system, and tell us what breaks. Every complaint drives innovation."
            />
          </div>
        </div>
      </section>

      {/* ── Minimal landing footer ── */}
      <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-center md:text-left">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="text-gray-400 text-sm">
                DCCS Platform by{' '}
                <span className="text-white font-semibold">Victor360 Brand Limited</span>
              </span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
              <Link to="/story"   className="hover:text-white transition-colors">Platform Story</Link>
              <Link to="/safety"  className="hover:text-white transition-colors">Safety Center</Link>
              <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
              <a href="/legal/privacy-policy.html" className="hover:text-white transition-colors">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
