import React from 'react';
import { Shield, Zap, Lock, CheckCircle, User, CreditCard } from 'lucide-react';

export default function PayoutIdentityGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Identity, Your Brand, Your Money</h2>
            <p className="text-gray-300 text-lg">
              Keep your stage name for the world, use your real name for the bank.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Public Profile</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your creative identity visible to fans and the world:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Stage name: "DJ CoolBeats" or any artist name</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Visible on all tracks and profiles</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Build your brand without limits</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Private Identity</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your legal information for secure payouts (completely private):
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Real name: "John Smith" for bank transfers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Only you and the system can see this</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ensures smooth, instant payouts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">How It Works - Simple 3-Step Process</h3>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-cyan-400 font-bold">1</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Verify Your Legal Identity (One Time)</h4>
              <p className="text-gray-300 mb-3">
                Enter your real name exactly as it appears on your bank account or ID. This stays private and secure.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200">
                Example: If your bank account is under "John Alexander Smith", enter that exactly.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-cyan-400 font-bold">2</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Connect Your Payout Method</h4>
              <p className="text-gray-300 mb-3">
                Choose how you want to receive money - bank account, crypto wallet, or payment app.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <CreditCard className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
                  <p className="text-white text-sm">Bank</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-white text-sm">Crypto</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <CreditCard className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-white text-sm">PayPal</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <CreditCard className="h-6 w-6 text-green-400 mx-auto mb-1" />
                  <p className="text-white text-sm">Stripe</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-400 font-bold">3</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Automatic Instant Payouts Forever</h4>
              <p className="text-gray-300 mb-3">
                Done! From now on, every time someone licenses your music, you get paid instantly to your verified account.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Swift Experience Guarantee</span>
                </div>
                <p className="text-green-200 text-sm">
                  No manual transfers, no waiting, no confusion. Money flows to your legal name automatically
                  while you keep your artistic identity intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Security & Privacy</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-1">Encrypted Storage</p>
              <p className="text-gray-400 text-sm">All legal information is encrypted and stored securely</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-1">Private by Default</p>
              <p className="text-gray-400 text-sm">Only you can see your banking information</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-1">One-Time Setup</p>
              <p className="text-gray-400 text-sm">Verify once, payouts work forever</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-1">Instant Processing</p>
              <p className="text-gray-400 text-sm">No delays, no manual reviews for verified users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
