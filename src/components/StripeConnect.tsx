import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StripeConnectProps {
  artistId: string;
  onConnected: (accountId: string) => void;
}

interface PayoutData {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  snippetsSold: number;
}

export default function StripeConnect({ artistId, onConnected }: StripeConnectProps) {
  const [isConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // const [accountStatus, setAccountStatus] = useState<'incomplete' | 'pending' | 'complete'>('incomplete');
  
  // Mock payout data
  const payouts: PayoutData[] = [
    {
      id: '1',
      amount: 127.45,
      date: '2025-01-15',
      status: 'paid',
      snippetsSold: 156
    },
    {
      id: '2',
      amount: 89.32,
      date: '2025-01-08',
      status: 'paid',
      snippetsSold: 112
    },
    {
      id: '3',
      amount: 45.67,
      date: '2025-01-01',
      status: 'pending',
      snippetsSold: 67
    }
  ];

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'create_account' }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Stripe Connect error:', error);
      setIsConnecting(false);
      alert('Failed to start Stripe Connect. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Bank Account</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Connect with Stripe to receive automatic payouts when your snippets are licensed. 
            You'll earn 70% of each sale.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-300 mb-1">Why Stripe Connect?</h3>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Instant payouts via V3BMusic.Ai to your bank account</li>
                  <li>• Automatic tax reporting and 1099 forms</li>
                  <li>• Secure, industry-standard payment processing</li>
                  <li>• Real-time earnings tracking and analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full max-w-sm py-3 px-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Connect with Stripe</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Powered by Stripe. Your financial information is secure and encrypted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Stripe Account</h2>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-400 text-sm">Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">${pendingAmount.toFixed(2)}</div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Next Payout</span>
            </div>
            <div className="text-sm text-white">Every Friday</div>
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          <a 
            href="https://dashboard.stripe.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Stripe Dashboard</span>
          </a>
          <button 
            onClick={() => {
              console.log('Update bank info requested');
              alert('Bank information update would open here. This would redirect to Stripe Connect settings.');
            }}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Update Bank Info
          </button>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Payout History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Snippets Sold</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="py-3 px-6 text-gray-300">{payout.date}</td>
                  <td className="py-3 px-6 text-white font-semibold">${payout.amount.toFixed(2)}</td>
                  <td className="py-3 px-6 text-gray-300">{payout.snippetsSold}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payout Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payout Schedule
            </label>
            <select className="w-full max-w-xs px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="weekly">Weekly (Fridays)</option>
              <option value="monthly">Monthly (1st of month)</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Payout Amount
            </label>
            <select className="w-full max-w-xs px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option value="25">$25</option>
              <option value="50">$50</option>
              <option value="100">$100</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-300">Email notifications for payouts</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}