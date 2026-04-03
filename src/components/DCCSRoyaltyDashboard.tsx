import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Eye,
  ExternalLink,
  Coins,
  Wallet,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RoyaltySummary {
  artist_id: string;
  total_payments: number;
  total_gross_royalties: number;
  total_artist_share: number;
  total_platform_commission: number;
  amount_paid_out: number;
  amount_pending: number;
  amount_processing: number;
  amount_failed: number;
  total_net_payout: number;
  total_processing_fees: number;
  artist_percentage: number;
  first_payment_period: string;
  last_payment_period: string;
  query_date: string;
}

interface RoyaltyPayment {
  id: string;
  clearance_code: string;
  artist_id: string;
  artist_name: string;
  artist_email: string;
  period_start: string;
  period_end: string;
  total_views: number;
  total_plays: number;
  gross_royalties: number;
  artist_share: number;
  net_artist_payout: number;
  processing_fee: number;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: string | null;
  currency: string;
  paid_at: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
  updated_at: string;
  breakdown_by_platform: Record<string, any>;
  days_since_period_end: number;
  is_overdue: boolean;
}

interface DCCSRoyaltyDashboardProps {
  artistId: string;
}

export default function DCCSRoyaltyDashboard({ artistId }: DCCSRoyaltyDashboardProps) {
  const [summary, setSummary] = useState<RoyaltySummary | null>(null);
  const [payments, setPayments] = useState<RoyaltyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | 'year'>('all');
  const [selectedPayment, setSelectedPayment] = useState<RoyaltyPayment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [artistId, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      let startDate: string | null = null;
      const now = new Date();
      if (dateRange === '30d') {
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      } else if (dateRange === '90d') {
        startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
      } else if (dateRange === 'year') {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      }

      // Load summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_artist_royalty_summary', {
          p_artist_id: artistId,
          p_start_date: startDate,
          p_end_date: null
        });

      if (summaryError) throw summaryError;
      setSummary(summaryData as RoyaltySummary);

      // Load payments
      let query = supabase
        .from('artist_royalty_dashboard')
        .select('*')
        .eq('artist_id', artistId)
        .order('period_end', { ascending: false });

      if (startDate) {
        query = query.gte('period_start', startDate);
      }

      const { data: paymentsData, error: paymentsError } = await query;

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData as RoyaltyPayment[]);
    } catch (error) {
      console.error('Error loading royalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true;
    return payment.payout_status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading royalty data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Coins className="h-8 w-8 text-cyan-400" />
            <span>DCCS Royalty Earnings</span>
          </h2>
          <p className="text-gray-400 mt-1">Track your 80% artist share from ongoing royalties</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Your 80% Share</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.total_artist_share)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Gross: {formatCurrency(summary.total_gross_royalties)}</span>
              <span className="text-green-400 font-medium">80%</span>
            </div>
          </div>

          {/* Paid Out */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Paid Out</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.amount_paid_out)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Net: {formatCurrency(summary.total_net_payout)}</span>
              <span className="text-cyan-400 font-medium">✓ Complete</span>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.amount_pending)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Processing: {formatCurrency(summary.amount_processing)}</span>
              <span className="text-yellow-400 font-medium">⏳ Soon</span>
            </div>
          </div>

          {/* Total Payments */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-white">{summary.total_payments.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Failed: {formatCurrency(summary.amount_failed)}</span>
              <span className="text-purple-400 font-medium">View All</span>
            </div>
          </div>
        </div>
      )}

      {/* Platform Fee Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">DCCS 80/20 Lifetime Split</h3>
            <p className="text-gray-300 mb-3">
              You receive <span className="font-bold text-cyan-400">80%</span> of all ongoing royalties from licensed content.
              The platform takes <span className="font-bold text-blue-400">20%</span> to maintain infrastructure and handle payments.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-400">Your Share: 80%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Platform Fee: 20%</span>
              </div>
              {summary && (
                <div className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Processing Fees: {formatCurrency(summary.total_processing_fees)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            {['all', 'completed', 'pending', 'processing', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
            <p className="text-gray-400">
              {filterStatus === 'all'
                ? 'Royalty payments will appear here once your content generates revenue.'
                : `No ${filterStatus} payments found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Period</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Clearance Code</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Usage</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Gross</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Your Share (80%)</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Net Payout</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-white font-medium">{formatDate(payment.period_start)}</div>
                        <div className="text-gray-400">to {formatDate(payment.period_end)}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-cyan-400 font-mono">{payment.clearance_code}</div>
                        {payment.is_overdue && (
                          <div className="text-red-400 text-xs mt-1">⚠ Overdue</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-300">
                        <div>{payment.total_views.toLocaleString()} views</div>
                        <div className="text-gray-400">{payment.total_plays.toLocaleString()} plays</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white font-medium">
                      {formatCurrency(payment.gross_royalties)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-green-400 font-semibold">
                        {formatCurrency(payment.artist_share)}
                      </div>
                      <div className="text-xs text-gray-400">80% share</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-cyan-400 font-semibold">
                        {formatCurrency(payment.net_artist_payout)}
                      </div>
                      {payment.processing_fee > 0 && (
                        <div className="text-xs text-gray-400">
                          -{formatCurrency(payment.processing_fee)} fee
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(payment.payout_status)}`}>
                        {getStatusIcon(payment.payout_status)}
                        <span className="text-sm font-medium capitalize">{payment.payout_status}</span>
                      </div>
                      {payment.paid_at && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(payment.paid_at)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Payment Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Clearance Code</p>
                  <p className="text-white font-mono">{selectedPayment.clearance_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(selectedPayment.payout_status)}`}>
                    {getStatusIcon(selectedPayment.payout_status)}
                    <span className="text-sm font-medium capitalize">{selectedPayment.payout_status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Period Start</p>
                  <p className="text-white">{formatDate(selectedPayment.period_start)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Period End</p>
                  <p className="text-white">{formatDate(selectedPayment.period_end)}</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h4 className="text-lg font-semibold text-white mb-3">Financial Breakdown</h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gross Royalties</span>
                  <span className="text-white font-medium">{formatCurrency(selectedPayment.gross_royalties)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-gray-400">Your Share (80%)</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(selectedPayment.artist_share)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee (20%)</span>
                  <span className="text-blue-400 font-medium">{formatCurrency(selectedPayment.gross_royalties - selectedPayment.artist_share)}</span>
                </div>
                {selectedPayment.processing_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Fee</span>
                    <span className="text-orange-400 font-medium">-{formatCurrency(selectedPayment.processing_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white font-medium">Net Payout</span>
                  <span className="text-cyan-400 font-bold text-lg">{formatCurrency(selectedPayment.net_artist_payout)}</span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-white">{selectedPayment.total_views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Plays</p>
                    <p className="text-2xl font-bold text-white">{selectedPayment.total_plays.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Platform Breakdown */}
              {selectedPayment.breakdown_by_platform && Object.keys(selectedPayment.breakdown_by_platform).length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Platform Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedPayment.breakdown_by_platform).map(([platform, data]: [string, any]) => (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{platform}</span>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(data.amount || 0)}</div>
                          <div className="text-xs text-gray-400">
                            {(data.views || data.plays || 0).toLocaleString()} {data.views ? 'views' : 'plays'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {selectedPayment.payment_method && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Method</span>
                      <span className="text-white capitalize">{selectedPayment.payment_method}</span>
                    </div>
                    {selectedPayment.currency && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Currency</span>
                        <span className="text-white">{selectedPayment.currency}</span>
                      </div>
                    )}
                    {selectedPayment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Paid At</span>
                        <span className="text-white">{formatDate(selectedPayment.paid_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain Transaction */}
              {selectedPayment.blockchain_tx_hash && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <Coins className="h-5 w-5 text-cyan-400" />
                    <h4 className="text-lg font-semibold text-white">Blockchain Verified</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">This payment is recorded on the blockchain</p>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs text-cyan-400 font-mono bg-black/30 px-2 py-1 rounded flex-1 truncate">
                      {selectedPayment.blockchain_tx_hash}
                    </code>
                    <button className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
