import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Shield, ArrowRight, Download } from 'lucide-react';
import { NetworkAnimation } from '../components/NetworkAnimation';
import { AnimatedSystemFlow } from '../components/AnimatedSystemFlow';
import { CreatorEcosystem } from '../components/CreatorEcosystem';
import { TrustProofSection } from '../components/TrustProofSection';

export default function Phase1Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <NetworkAnimation />

        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

        <div
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: 1 - scrollY / 500
          }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-full px-5 py-2 mb-8 animate-fade-in">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Global Ownership Registry
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-none tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="block text-white mb-4">
              Protect and verify your digital creations instantly.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            DCCS (Digital Clearance Code System) powers a global copyright verification system for creators, brands, and digital assets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/upload"
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <Upload className="w-6 h-6" />
                <span>Start Upload</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/verify"
              className="px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <span>Verify Code</span>
              </div>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Free
              </div>
              <p className="text-gray-500 text-sm">Unlimited uploads</p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Instant
              </div>
              <p className="text-gray-500 text-sm">Immediate verification</p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
                Forever
              </div>
              <p className="text-gray-500 text-sm">Permanent registry</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      <AnimatedSystemFlow />

      <CreatorEcosystem />

      <TrustProofSection />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to protect your work?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands of creators securing their digital ownership with DCCS
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/upload"
              className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
            >
              <div className="relative flex items-center gap-3">
                <Upload className="w-7 h-7" />
                <span>Upload Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/library"
              className="px-12 py-6 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-2xl font-bold text-xl transition-all duration-300 hover:bg-white/10 hover:border-white/40"
            >
              <div className="flex items-center gap-3">
                <Download className="w-7 h-7" />
                <span>View Library</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="text-gray-400">
                DCCS Platform by <span className="text-white font-semibold">Victor360 Brand Limited</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/story" className="hover:text-white transition-colors">
                Platform Story
              </Link>
              <Link to="/safety" className="hover:text-white transition-colors">
                Safety Center
              </Link>
              <a href="/legal/privacy-policy.html" className="hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
