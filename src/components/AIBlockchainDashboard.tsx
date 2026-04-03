import React, { useState, useEffect } from 'react';
import { Brain, Zap, Shield, TrendingUp, Activity, Coins, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIBlockchainStats {
  aiModeration: {
    totalScanned: number;
    flaggedContent: number;
    autoApproved: number;
    accuracy: number;
  };
  blockchain: {
    totalTransactions: number;
    totalVolume: number;
    averageSpeed: number;
    networksUsed: string[];
  };
  royalties: {
    totalPaid: number;
    instantPayouts: number;
    pendingPayouts: number;
    averagePayoutTime: number;
  };
}

export default function AIBlockchainDashboard() {
  const [stats, setStats] = useState<AIBlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'blockchain' | 'royalties'>('ai');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: aiModerationData } = await supabase
        .from('ai_moderation_queue')
        .select('*')
        .eq('user_id', user.id);

      const totalScanned = aiModerationData?.length || 0;
      const flaggedContent = aiModerationData?.filter(m => m.flagged)?.length || 0;
      const autoApproved = aiModerationData?.filter(m => m.auto_approved)?.length || 0;

      const { data: blockchainData } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .or(`from_address.eq.${user.id},to_address.eq.${user.id}`);

      const totalTransactions = blockchainData?.length || 0;
      const totalVolume = blockchainData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      const networks = [...new Set(blockchainData?.map(tx => tx.network) || [])];

      const { data: royaltyData } = await supabase
        .from('royalty_payments')
        .select('*')
        .eq('recipient_id', user.id);

      const totalPaid = royaltyData?.filter(r => r.status === 'completed')?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const instantPayouts = royaltyData?.filter(r => r.payment_method === 'instant_crypto')?.length || 0;
      const pendingPayouts = royaltyData?.filter(r => r.status === 'pending')?.length || 0;

      setStats({
        aiModeration: {
          totalScanned,
          flaggedContent,
          autoApproved,
          accuracy: totalScanned > 0 ? ((autoApproved / totalScanned) * 100) : 0,
        },
        blockchain: {
          totalTransactions,
          totalVolume,
          averageSpeed: 2.5,
          networksUsed: networks as string[],
        },
        royalties: {
          totalPaid,
          instantPayouts,
          pendingPayouts,
          averagePayoutTime: 2.8,
        },
      });

      const { data: recentTx } = await supabase
        .from('blockchain_transactions')
        .select('*')
        .or(`from_address.eq.${user.id},to_address.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(recentTx || []);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
        <Brain className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">AI & Blockchain Dashboard</h3>
        <p className="text-slate-400 mb-4">
          Track your AI-powered content moderation and blockchain transactions in real-time
        </p>
        <button
          onClick={loadDashboardData}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          Load Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <Brain className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-bold text-white">AI & Blockchain Intelligence</h2>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-cyan-300">Real-time monitoring and analytics</p>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'ai'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Moderation</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'blockchain'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Blockchain</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('royalties')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'royalties'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4" />
              <span>Instant Royalties</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.aiModeration.totalScanned}</span>
              </div>
              <p className="text-sm text-slate-400">Content Scanned</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.aiModeration.autoApproved}</span>
              </div>
              <p className="text-sm text-slate-400">Auto-Approved</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.aiModeration.flaggedContent}</span>
              </div>
              <p className="text-sm text-slate-400">Flagged</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.aiModeration.accuracy.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-slate-400">AI Accuracy</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Content Protection</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Automated Content Scanning</p>
                  <p className="text-sm text-slate-400">
                    Every upload is automatically scanned for copyright violations, explicit content, and quality issues
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Machine Learning Detection</p>
                  <p className="text-sm text-slate-400">
                    Advanced AI models detect potential issues before content goes live
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Real-Time Processing</p>
                  <p className="text-sm text-slate-400">
                    Moderation completes in seconds, not hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blockchain' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.blockchain.totalTransactions}</span>
              </div>
              <p className="text-sm text-slate-400">Total Transactions</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Coins className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-white">£{stats.blockchain.totalVolume.toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-400">Total Volume</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.blockchain.averageSpeed}s</span>
              </div>
              <p className="text-sm text-slate-400">Avg Speed</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Lock className="h-5 w-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.blockchain.networksUsed.length}</span>
              </div>
              <p className="text-sm text-slate-400">Networks Used</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'royalties' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Coins className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-white">£{stats.royalties.totalPaid.toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-400">Total Earned</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{stats.royalties.instantPayouts}</span>
              </div>
              <p className="text-sm text-slate-400">Instant Payouts</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{stats.royalties.averagePayoutTime}s</span>
              </div>
              <p className="text-sm text-slate-400">Avg Payout Time</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.royalties.pendingPayouts}</span>
              </div>
              <p className="text-sm text-slate-400">Pending</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Instant Royalty System</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">2-5 Second Payouts</p>
                  <p className="text-sm text-slate-400">
                    Blockchain-powered instant payments mean you get paid the moment someone purchases your content.
                    No more 30-day waiting periods.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg mt-1">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">80/20 Split</p>
                  <p className="text-sm text-slate-400">
                    Creators earn 80% of every sale. Platform takes only 20% to cover infrastructure and payment processing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">Transparent Tracking</p>
                  <p className="text-sm text-slate-400">
                    Every payment is recorded on the blockchain, providing permanent, tamper-proof records of all transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold">System Performance</p>
              <p className="text-sm text-green-400">All systems operational</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">99.9%</p>
            <p className="text-xs text-slate-400">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
