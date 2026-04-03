import React from 'react';
import { Shield, Zap, Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionReadyBanner() {
  return (
    <div className="bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-blue-500/10 border-2 border-green-500/30 rounded-2xl p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-green-500/20 rounded-xl">
          <Shield className="h-8 w-8 text-green-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-2xl font-bold text-white">Agentic AI–Powered Platform</h3>
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-base text-gray-300 mb-1 font-medium">
            Upload → Register → Track → Earn (Fully Automated)
          </p>
          <p className="text-gray-300 mb-4">
            Our Agentic AI understands platform rules and automatically tracks your DCCS-registered content across YouTube, Instagram, Facebook, TikTok, and more. It monitors usage, calculates royalties under our transparent 80/20 creator revenue model (you keep 80%), collects payments, and splits revenue instantly — all within 2–5 seconds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-white">Agentic AI Tracking</span>
              </div>
              <p className="text-sm text-gray-400">
                AI scans YouTube, Instagram, Facebook, TikTok, Spotify + 40 more platforms using your DCCS fingerprint
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-white">2–5 Second Payouts</span>
              </div>
              <p className="text-sm text-gray-400">
                Instant blockchain payments — Fixed 80/20 Creator Revenue Model (you keep 80%) enforced by AI
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white">DCCS Protection</span>
              </div>
              <p className="text-sm text-gray-400">
                Every upload gets a permanent DCCS code — your proof of ownership recognized globally
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/demo"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <span>See Agentic AI Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
            >
              <Brain className="h-4 w-4" />
              <span>AI & Blockchain Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
