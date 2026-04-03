import React from 'react';
import { Shield, FileQuestion, FileX, Lock, CheckCircle, Download, Clock, AlertTriangle } from 'lucide-react';

interface StageIllustrationProps {
  stage: 'problem' | 'chaos' | 'solution' | 'protection' | 'verification' | 'freedom';
  className?: string;
}

export const DCCSStageIllustration: React.FC<StageIllustrationProps> = ({ stage, className = '' }) => {
  const illustrations = {
    problem: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-8 border border-red-500/30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">The Problem</h3>
            <p className="text-gray-300">Creators lose control the moment they share their work</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-red-500/20 rounded-lg p-4 mb-2">
                <FileX className="w-12 h-12 mx-auto text-red-400" />
              </div>
              <p className="text-sm text-gray-400">Work gets stolen</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500/20 rounded-lg p-4 mb-2">
                <FileQuestion className="w-12 h-12 mx-auto text-orange-400" />
              </div>
              <p className="text-sm text-gray-400">Can't prove ownership</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500/20 rounded-lg p-4 mb-2">
                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400">No protection</p>
            </div>
          </div>
        </div>
      </div>
    ),

    chaos: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-2xl p-8 border border-orange-500/30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">The Chaos</h3>
            <p className="text-gray-300">Traditional copyright systems are broken</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-orange-500/10 rounded-lg p-4">
              <Clock className="w-10 h-10 text-orange-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">6-Month Delays</p>
                <p className="text-sm text-gray-400">Wait half a year for royalty payments</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-yellow-500/10 rounded-lg p-4">
              <FileX className="w-10 h-10 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Complex Processes</p>
                <p className="text-sm text-gray-400">Paperwork, fees, and bureaucracy</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-red-500/10 rounded-lg p-4">
              <AlertTriangle className="w-10 h-10 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">No Real Protection</p>
                <p className="text-sm text-gray-400">Still can't prove instant ownership</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    solution: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Enter DCCS</h3>
            <p className="text-gray-300">Digital Clearance Code System - Instant ownership proof</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-blue-400 mb-2">
                DCCS-AUD-V360-82AF19-20260320
              </div>
              <p className="text-sm text-gray-400">Your unique ownership fingerprint</p>
            </div>
          </div>
        </div>
      </div>
    ),

    protection: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-500/30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">How It Works</h3>
            <p className="text-gray-300">Upload once, protected forever</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <p className="font-semibold text-white">Upload Your Asset</p>
                <p className="text-sm text-gray-400">Audio, video, image, or document</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <p className="font-semibold text-white">DCCS Generates Fingerprint</p>
                <p className="text-sm text-gray-400">Cryptographic SHA-256 hash created instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <p className="font-semibold text-white">Receive Clearance Code</p>
                <p className="text-sm text-gray-400">Unique DCCS code proves you uploaded it first</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
              <div>
                <p className="font-semibold text-white">Download DCCS-Imprinted File</p>
                <p className="text-sm text-gray-400">Original quality + embedded protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    verification: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Public Verification</h3>
            <p className="text-gray-300">Anyone can verify ownership, anytime, anywhere</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <p className="font-semibold text-white mb-2">Enter DCCS Code</p>
              <p className="text-sm text-gray-400">Instant verification of ownership and timestamp</p>
            </div>
            <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
              <p className="font-semibold text-white mb-2">Upload File to Check</p>
              <p className="text-sm text-gray-400">Compare fingerprint against our registry</p>
            </div>
          </div>
        </div>
      </div>
    ),

    freedom: (
      <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-8 border border-cyan-500/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-full mb-4">
              <Download className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your Freedom</h3>
            <p className="text-gray-300">Share confidently, knowing you have proof</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-cyan-500/20 rounded-lg p-4 mb-2">
                <Lock className="w-12 h-12 mx-auto text-cyan-400" />
              </div>
              <p className="text-sm font-semibold text-white">Protected</p>
              <p className="text-xs text-gray-400">Permanent record</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-lg p-4 mb-2">
                <CheckCircle className="w-12 h-12 mx-auto text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-white">Verified</p>
              <p className="text-xs text-gray-400">Publicly provable</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-500/20 rounded-lg p-4 mb-2">
                <Shield className="w-12 h-12 mx-auto text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white">Confident</p>
              <p className="text-xs text-gray-400">Share freely</p>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return illustrations[stage];
};

export const DCCSFullStoryVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-12 ${className}`}>
      <DCCSStageIllustration stage="problem" />
      <div className="flex justify-center">
        <div className="w-1 h-16 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
      </div>

      <DCCSStageIllustration stage="chaos" />
      <div className="flex justify-center">
        <div className="w-1 h-16 bg-gradient-to-b from-orange-500 to-blue-500 rounded-full" />
      </div>

      <DCCSStageIllustration stage="solution" />
      <div className="flex justify-center">
        <div className="w-1 h-16 bg-gradient-to-b from-blue-500 to-green-500 rounded-full" />
      </div>

      <DCCSStageIllustration stage="protection" />
      <div className="flex justify-center">
        <div className="w-1 h-16 bg-gradient-to-b from-green-500 to-purple-500 rounded-full" />
      </div>

      <DCCSStageIllustration stage="verification" />
      <div className="flex justify-center">
        <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
      </div>

      <DCCSStageIllustration stage="freedom" />
    </div>
  );
};
