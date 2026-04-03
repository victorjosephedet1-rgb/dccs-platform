import React from 'react';
import { Wallet, Download, ExternalLink, Check } from 'lucide-react';

interface MetaMaskGuideProps {
  onClose: () => void;
}

export default function MetaMaskGuide({ onClose }: MetaMaskGuideProps) {
  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl">
              <Wallet className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            MetaMask Wallet Required
          </h2>

          <p className="text-gray-300 text-center mb-8">
            To make instant blockchain payments, you need a crypto wallet. MetaMask is the most popular and trusted option.
          </p>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Check className="h-5 w-5 text-cyan-400 mr-2" />
              Why MetaMask?
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Instant payments (2-5 seconds) directly to artists</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>No middlemen, lower fees than traditional payment processors</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Transparent, verifiable transactions on the blockchain</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>Trusted by over 30 million users worldwide</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Installation Steps:</h3>

            <div className="flex items-start space-x-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Install MetaMask Extension</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Available for Brave, and Edge browsers
                </p>
                <button
                  onClick={handleInstallMetaMask}
                  className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download MetaMask</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Create Your Wallet</h4>
                <p className="text-gray-400 text-sm">
                  Follow the setup wizard to create a new wallet. Make sure to save your secret recovery phrase in a secure location.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Add Funds</h4>
                <p className="text-gray-400 text-sm">
                  Purchase cryptocurrency (ETH, MATIC, etc.) through MetaMask or transfer from an exchange.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Connect & Pay</h4>
                <p className="text-gray-400 text-sm">
                  Return to V3BMusic and connect your wallet to make instant payments!
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleInstallMetaMask}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
            >
              <Download className="h-5 w-5" />
              <span>Install MetaMask Now</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already installed? Refresh this page to connect your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
