import { DollarSign, Shield, Zap, Globe, Lock, Server } from 'lucide-react';
import { useState } from 'react';

export default function RevenueSplitExplainer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">You Keep 80%, We Take 20%</h3>
            <p className="text-sm text-slate-400">Fair pricing that supports the infrastructure protecting your work</p>
          </div>
        </div>
        <div className="text-slate-400">
          {isExpanded ? '−' : '+'}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 animate-fadeIn">
          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">How It Works</h4>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-green-400">80%</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Goes Directly to You</p>
                  <p className="text-sm text-slate-400">
                    When someone downloads your DCCS-protected content, 80% of the payment is instantly yours. No delays, no holding periods, no hidden deductions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-400">20%</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Maintains Your Protection</p>
                  <p className="text-sm text-slate-400">
                    This covers the infrastructure that proves you created your work first and protects your intellectual property for life.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">What Your 20% Platform Fee Covers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: Shield, title: 'Blockchain Proof', description: 'Permanent certificate storage on blockchain' },
                { icon: Server, title: 'Secure Storage', description: 'Encrypted file storage with backups' },
                { icon: Lock, title: 'DCCS Technology', description: 'Digital watermarking in every download' },
                { icon: Globe, title: 'Global Tracking', description: 'Monitor usage across all platforms' },
                { icon: Zap, title: 'AI Detection', description: 'Scan for unauthorized use & AI training' },
                { icon: DollarSign, title: 'Instant Payouts', description: 'Crypto & traditional payment processing' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Why This Is Fair
            </h4>
            <div className="text-sm text-slate-300 space-y-2">
              <p>
                Most platforms take <strong>30-50%</strong> of your earnings:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                <li>Apple & Google: 30% platform fee</li>
                <li>Some music platforms: 40-50% commission</li>
                <li>Traditional distribution: 15-30% + additional fees</li>
              </ul>
              <p className="mt-3 text-white">
                At <strong>20%</strong>, you keep significantly more while getting enterprise-level copyright protection that proves ownership globally.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-orange-500">
            <p className="text-sm text-slate-300">
              <strong className="text-white">Phase 1:</strong> Right now, the platform is <strong className="text-green-400">completely FREE</strong>. You're getting blockchain-verified proof of creation at no cost.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              The 80/20 split activates in Phase 2 & 3 when we launch the marketplace and global royalty tracking. When payments begin flowing from downloads and platform usage, you'll automatically receive your 80% share.
            </p>
          </div>

          <div className="flex items-center justify-center pt-4">
            <p className="text-xs text-slate-500 text-center max-w-2xl">
              This revenue model is transparent, locked in for life, and enforced by smart contracts. No surprise fees. No changing the deal later.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
