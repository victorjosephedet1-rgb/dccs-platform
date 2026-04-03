import React, { useState, useEffect } from 'react';
import { Zap, DollarSign, Clock, CheckCircle, ArrowRight, CreditCard, Smartphone, Globe } from 'lucide-react';

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal' | 'crypto' | 'mobile';
  name: string;
  identifier: string;
  isDefault: boolean;
  processingTime: string;
  fees: string;
  supported: boolean;
}

interface PendingPayout {
  id: string;
  amount: number;
  currency: string;
  source: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed';
}

interface InstantPayoutSystemProps {
  artistId: string;
  balance: number;
}

export default function InstantPayoutSystem({ artistId, balance }: InstantPayoutSystemProps) {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);

  useEffect(() => {
    loadPayoutMethods();
    loadPendingPayouts();
  }, [artistId]);

  const loadPayoutMethods = () => {
    const mockMethods: PayoutMethod[] = [
      {
        id: '1',
        type: 'bank',
        name: 'Chase Bank',
        identifier: '****1234',
        isDefault: true,
        processingTime: 'Instant',
        fees: 'Free',
        supported: true
      },
      {
        id: '2',
        type: 'paypal',
        name: 'PayPal',
        identifier: 'artist@email.com',
        isDefault: false,
        processingTime: 'Instant',
        fees: '2.9%',
        supported: true
      },
      {
        id: '3',
        type: 'crypto',
        name: 'Bitcoin Wallet',
        identifier: '1A1z...Nx7B',
        isDefault: false,
        processingTime: '10 minutes',
        fees: '$2.50',
        supported: true
      },
      {
        id: '4',
        type: 'mobile',
        name: 'Cash App',
        identifier: '$artistname',
        isDefault: false,
        processingTime: 'Instant',
        fees: 'Free',
        supported: true
      }
    ];
    
    setPayoutMethods(mockMethods);
    setSelectedMethod(mockMethods.find(m => m.isDefault)?.id || '');
  };

  const loadPendingPayouts = () => {
    const mockPayouts: PendingPayout[] = [
      {
        id: '1',
        amount: 127.45,
        currency: 'USD',
        source: 'TikTok Licensing',
        timestamp: '2 minutes ago',
        status: 'processing'
      },
      {
        id: '2',
        amount: 89.32,
        currency: 'USD',
        source: 'Instagram Reels',
        timestamp: '1 hour ago',
        status: 'completed'
      },
      {
        id: '3',
        amount: 234.67,
        currency: 'USD',
        source: 'YouTube Shorts',
        timestamp: '3 hours ago',
        status: 'completed'
      }
    ];
    
    setPendingPayouts(mockPayouts);
  };

  const handleInstantPayout = async () => {
    if (!selectedMethod || !payoutAmount) return;
    
    setIsProcessing(true);
    
    // Simulate instant payout
    setTimeout(() => {
      const newPayout: PendingPayout = {
        id: Date.now().toString(),
        amount: parseFloat(payoutAmount),
        currency: 'USD',
        source: 'Manual Payout',
        timestamp: 'Just now',
        status: 'processing'
      };
      
      setPendingPayouts(prev => [newPayout, ...prev]);
      setPayoutAmount('');
      setIsProcessing(false);
      
      // Complete payout after 3 seconds
      setTimeout(() => {
        setPendingPayouts(prev => 
          prev.map(p => p.id === newPayout.id ? { ...p, status: 'completed' } : p)
        );
      }, 3000);
    }, 2000);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank': return <CreditCard className="h-5 w-5" />;
      case 'paypal': return <Globe className="h-5 w-5" />;
      case 'crypto': return <Zap className="h-5 w-5" />;
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance & Quick Payout */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Available Balance</h2>
            <div className="text-4xl font-bold text-green-400">${balance.toFixed(2)}</div>
            <p className="text-green-300 text-sm mt-1">Ready for instant payout</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-sm text-gray-400">Instant Transfer</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payout Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                max={balance}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setPayoutAmount((balance * 0.25).toFixed(2))}
                className="px-3 py-1 bg-white/10 text-gray-300 rounded text-sm hover:bg-white/20 transition-colors"
              >
                25%
              </button>
              <button
                onClick={() => setPayoutAmount((balance * 0.5).toFixed(2))}
                className="px-3 py-1 bg-white/10 text-gray-300 rounded text-sm hover:bg-white/20 transition-colors"
              >
                50%
              </button>
              <button
                onClick={() => setPayoutAmount(balance.toFixed(2))}
                className="px-3 py-1 bg-white/10 text-gray-300 rounded text-sm hover:bg-white/20 transition-colors"
              >
                All
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payout Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {payoutMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} ({method.identifier}) - {method.processingTime}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddMethod(true)}
              className="text-sm text-blue-400 hover:text-blue-300 mt-2"
            >
              + Add new payout method
            </button>
          </div>
        </div>

        <button
          onClick={handleInstantPayout}
          disabled={isProcessing || !payoutAmount || !selectedMethod}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Instant Payout...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Instant Payout</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Payout Methods */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Payout Methods</h3>
          <p className="text-gray-400">Manage your instant payout destinations</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payoutMethods.map((method) => (
              <div key={method.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                method.isDefault 
                  ? 'border-green-500/30 bg-green-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{method.name}</div>
                      <div className="text-sm text-gray-400">{method.identifier}</div>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      Default
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Processing Time</div>
                    <div className="text-white">{method.processingTime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fees</div>
                    <div className="text-white">{method.fees}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Payouts</h3>
          <p className="text-gray-400">Your latest instant transfers</p>
        </div>

        <div className="divide-y divide-white/10">
          {pendingPayouts.map((payout) => (
            <div key={payout.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      ${payout.amount.toFixed(2)} {payout.currency}
                    </div>
                    <div className="text-sm text-gray-400">
                      {payout.source} • {payout.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payout.status)}`}>
                    {payout.status === 'processing' && <Clock className="h-3 w-3 inline mr-1" />}
                    {payout.status === 'completed' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {payout.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Why V3B Instant Payouts Beat Traditional Systems</h3>
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Why V3BMusic.Ai Instant Payouts Beat Traditional Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Instant Transfer</h4>
            <p className="text-sm text-blue-200">Money in your account within seconds, not weeks like PRS UK</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">No Minimum</h4>
            <p className="text-sm text-blue-200">Withdraw any amount, no £100+ minimums like traditional societies</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6 text-cyan-400" />
            </div>
            <h4 className="font-semibold text-white mb-2">Global Methods</h4>
            <p className="text-sm text-blue-200">Bank, PayPal, crypto, mobile money - your choice, your way</p>
          </div>
        </div>
      </div>
    </div>
  );
}