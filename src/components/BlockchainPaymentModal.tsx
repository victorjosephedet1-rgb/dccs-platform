import React, { useState, useEffect } from 'react';
import { X, Zap, Lock, Shield, Check, Wallet, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlockchainPaymentProcessor, BlockchainNetwork } from '../lib/blockchainPayments';
import { useNotifications } from './NotificationSystem';
import MetaMaskGuide from './MetaMaskGuide';

// Ethereum provider type
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface BlockchainPaymentModalProps {
  snippet: {
    id: string;
    title: string;
    artist: string;
    artist_id: string;
    price: number;
    duration: number;
  };
  onClose: () => void;
}

export default function BlockchainPaymentModal({ snippet, onClose }: BlockchainPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork>(BlockchainNetwork.POLYGON);
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const artistEarning = snippet.price * 0.8;
  const platformFee = snippet.price * 0.2;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setShowMetaMaskGuide(true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        setError(null);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleBlockchainPayment = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to continue');
      }

      // Get artist wallet address
      const { data: artistProfile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', snippet.artist_id)
        .single();

      if (profileError || !artistProfile?.wallet_address) {
        throw new Error('Artist wallet not configured. Cannot process payment.');
      }

      addNotification({
        type: 'info',
        title: 'Processing Payment',
        message: 'Initiating blockchain transaction...'
      });

      // Process payment via blockchain
      const transaction = await BlockchainPaymentProcessor.processInstantPayment(
        artistProfile.wallet_address,
        artistEarning,
        'USD',
        {
          snippetId: snippet.id,
          licenseId: `license_${Date.now()}`,
          trackTitle: snippet.title,
          artistName: snippet.artist
        }
      );

      setTransactionHash(transaction.hash);
      setPaymentStatus('completed');

      // Create license record
      const { data: license, error: licenseError } = await supabase
        .from('licenses')
        .insert({
          snippet_id: snippet.id,
          buyer_id: session.user.id,
          license_type: 'Content Creator License',
          price: snippet.price,
          payment_method: 'blockchain',
          blockchain_transaction_hash: transaction.hash,
          blockchain_network: selectedNetwork,
          status: 'active'
        })
        .select()
        .single();

      if (licenseError) throw licenseError;

      // Record transaction
      await supabase
        .from('payment_transactions')
        .insert({
          snippet_id: snippet.id,
          buyer_id: session.user.id,
          amount: snippet.price,
          status: 'completed',
          payment_method: 'blockchain',
          blockchain_transaction_hash: transaction.hash
        });

      addNotification({
        type: 'success',
        title: 'Payment Successful!',
        message: `Transaction completed in ${selectedNetwork}. Artist received ${artistEarning.toFixed(2)} USD instantly.`
      });

      setTimeout(() => {
        navigate(`/license/${license.id}`);
      }, 2000);

    } catch (error) {
      console.error('Blockchain payment failed:', error);
      setPaymentStatus('failed');
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');

      addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: 'Blockchain transaction failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (network: BlockchainNetwork) => {
    switch (network) {
      case BlockchainNetwork.POLYGON: return 'Polygon (Fastest)';
      case BlockchainNetwork.ETHEREUM: return 'Ethereum (Most Secure)';
      case BlockchainNetwork.BASE: return 'Base (Balanced)';
      case BlockchainNetwork.BSC: return 'BSC (Low Fees)';
      default: return network;
    }
  };

  const getNetworkSpeed = (network: BlockchainNetwork) => {
    switch (network) {
      case BlockchainNetwork.POLYGON: return '2-3 seconds';
      case BlockchainNetwork.ETHEREUM: return '15 seconds';
      case BlockchainNetwork.BASE: return '3-5 seconds';
      case BlockchainNetwork.BSC: return '3-5 seconds';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-cyan-500/30 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Instant Blockchain Payment</h2>
              <p className="text-xs text-cyan-400">Powered by Ethereum Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Snippet Details */}
        <div className="p-6 border-b border-cyan-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">{snippet.title}</h3>
          <p className="text-gray-400 mb-4">by {snippet.artist}</p>

          <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Duration:</span>
              <span className="text-white">{snippet.duration} seconds</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 flex items-center">
                <Zap className="h-3 w-3 mr-1 text-green-400" />
                Sound Engineer receives instantly:
              </span>
              <span className="text-green-400 font-semibold">${artistEarning.toFixed(2)} (80%)</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Platform fee:</span>
              <span className="text-gray-400">${platformFee.toFixed(2)} (30%)</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ${snippet.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <p className="text-cyan-300 text-sm flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Instant payment via blockchain + Full commercial license
            </p>
          </div>
        </div>

        {/* Network Selection */}
        <div className="p-6 border-b border-cyan-500/20">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-cyan-400" />
            Select Blockchain Network
          </h3>
          <div className="space-y-2">
            {[
              BlockchainNetwork.POLYGON,
              BlockchainNetwork.BASE,
              BlockchainNetwork.ETHEREUM,
              BlockchainNetwork.BSC
            ].map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network)}
                className={`w-full p-3 rounded-lg border transition-all ${
                  selectedNetwork === network
                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{getNetworkName(network)}</span>
                  <span className="text-xs text-cyan-400">{getNetworkSpeed(network)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {paymentStatus === 'completed' && transactionHash && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="h-5 w-5 text-green-400" />
                <p className="text-green-300 font-semibold">Payment Successful!</p>
              </div>
              <p className="text-green-300 text-sm mb-2">
                Artist received ${artistEarning.toFixed(2)} instantly on {selectedNetwork}
              </p>
              <a
                href={`https://polygonscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>View on Blockchain Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <>
              <div className="mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Connected Wallet:</span>
                  <span className="text-white text-sm font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBlockchainPayment}
                disabled={loading || paymentStatus === 'completed'}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing on {selectedNetwork}...</span>
                  </>
                ) : paymentStatus === 'completed' ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Payment Completed</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Pay ${snippet.price.toFixed(2)} Instantly</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                <Lock className="h-3 w-3 inline mr-1" />
                Secured by blockchain smart contracts
              </p>
            </>
          )}
        </div>
      </div>

      {showMetaMaskGuide && <MetaMaskGuide onClose={() => setShowMetaMaskGuide(false)} />}
    </div>
  );
}
