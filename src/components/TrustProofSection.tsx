import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Globe, Lock } from 'lucide-react';
import { DCCSCodeDisplay } from './DCCSCodeDisplay';

export const TrustProofSection: React.FC = () => {
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const sampleCode = 'DCCS-AUDIO-2026-A7B3X9';

  return (
    <div className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">VERIFIED SYSTEM</span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Every Asset.
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Permanently Verified.
              </span>
            </h2>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              DCCS provides cryptographic proof of ownership that anyone can verify, anywhere in the world, at any time.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Instant Verification</h3>
                  <p className="text-gray-400 text-sm">Anyone can verify ownership in seconds using your DCCS code</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Global Registry</h3>
                  <p className="text-gray-400 text-sm">Recognized worldwide as proof of original creation</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Immutable Proof</h3>
                  <p className="text-gray-400 text-sm">Timestamp and ownership locked in permanent ledger</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />

            <div className="relative bg-black/60 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-10 shadow-2xl">
              <div className="space-y-8">
                <div>
                  <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4 block">
                    Sample DCCS Clearance Code
                  </label>
                  <DCCSCodeDisplay code={sampleCode} size="lg" showExplanation={true} />
                </div>

                <div className="border-t border-white/10 pt-8">
                  {verifying ? (
                    <div className="flex items-center gap-4 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <p className="text-white font-semibold">Verifying ownership...</p>
                        <p className="text-blue-300 text-sm">Checking global registry</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-500/20 to-green-500/5 p-8">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl" />

                      <div className="relative flex items-start gap-5">
                        <div className="flex-shrink-0">
                          <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/50">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-white mb-2">VERIFIED</h3>
                          <p className="text-green-300 mb-4">Ownership confirmed in DCCS global registry</p>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Creator:</span>
                              <span className="text-white font-semibold">John Smith</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Registered:</span>
                              <span className="text-white font-semibold">January 15, 2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Type:</span>
                              <span className="text-white font-semibold">Audio Recording</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-500 text-sm">
                    This verification is publicly accessible and can be checked by anyone, anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
