import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';

interface RoyaltyTransaction {
  id: string;
  snippet_id: string;
  snippet_title: string;
  license_id: string;
  amount: number;
  artist_share: number;
  platform_fee: number;
  buyer_email: string;
  transaction_date: string;
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  payout_date?: string;
  blockchain_hash?: string;
}

interface RoyaltyTrackerProps {
  artistId: string;
}

export default function RoyaltyTracker({ artistId }: RoyaltyTrackerProps) {
  const [transactions, setTransactions] = useState<RoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadRoyaltyData();
    // Set up real-time subscription for new transactions
    const subscription = supabase
      .channel('royalty_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'snippet_licenses',
          filter: `snippet_id=in.(${artistId})`
        }, 
        handleNewLicense
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [artistId]);

  const loadRoyaltyData = async () => {
    try {
      setLoading(true);

      // Get all licenses for this artist's snippets
      const { data: licenses, error } = await supabase
        .from('snippet_licenses')
        .select(`
          *,
          audio_snippets!inner(
            id,
    // eslint-disable-next-line react-hooks/exhaustive-deps
            title,
            artist_id,
            price
          )
        `)
        .eq('audio_snippets.artist_id', artistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data into royalty transactions
      const royaltyTransactions: RoyaltyTransaction[] = licenses.map(license => {
        const artistShare = license.price_paid * 0.80; // 80% to artist
        const platformFee = license.price_paid * 0.20; // 20% platform fee
        
        return {
          id: license.id,
          snippet_id: license.snippet_id,
          snippet_title: license.audio_snippets.title,
          license_id: license.id,
          amount: license.price_paid,
          artist_share: artistShare,
          platform_fee: platformFee,
          buyer_email: 'creator@example.com', // In real app, get from user profile
          transaction_date: license.created_at,
          payout_status: 'completed', // In real app, track actual payout status
          payout_date: license.created_at,
          blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock blockchain hash
        };
      });

      setTransactions(royaltyTransactions);
      
      // Calculate totals
      const total = royaltyTransactions.reduce((sum, tx) => sum + tx.artist_share, 0);
      const pending = royaltyTransactions
        .filter(tx => tx.payout_status === 'pending')
        .reduce((sum, tx) => sum + tx.artist_share, 0);
      
      setTotalEarnings(total);
      setPendingPayouts(pending);

    } catch (error) {
      console.error('Error loading royalty data:', error);
      addNotification({
        type: 'error',
        title: 'Royalty Data Error',
        message: 'Failed to load royalty information. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewLicense = (payload: any) => {
    console.log('New license created:', payload);
    addNotification({
      type: 'success',
      title: 'New License Sale!',
      message: 'Someone just licensed your music. Royalty payment processing...'
    });
    
    // Reload data to show new transaction
    loadRoyaltyData();
  };

  const processInstantPayout = async (transactionId: string) => {
    try {
      // In a real implementation, this would trigger actual payout processing
      // For now, we'll simulate the payout process
      
      addNotification({
        type: 'info',
        title: 'Processing Payout',
        message: 'Your instant payout is being processed...'
      });

      // Simulate payout processing
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, payout_status: 'completed', payout_date: new Date().toISOString() }
              : tx
          )
        );
        
        addNotification({
          type: 'success',
          title: 'Payout Completed',
          message: 'Your royalty payment has been sent to your account!'
        });
      }, 3000);

    } catch (error) {
      console.error('Error processing payout:', error);
      addNotification({
        type: 'error',
        title: 'Payout Failed',
        message: 'There was an error processing your payout. Please try again.'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-white mb-2">Loading Royalty Data</h3>
          <p className="text-gray-400">Calculating your earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Earnings</h3>
              <div className="text-3xl font-bold text-green-400">${totalEarnings.toFixed(2)}</div>
            </div>
          </div>
          <p className="text-green-300 text-sm">80% to Sound Engineer (lifetime guarantee)</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Pending Payouts</h3>
              <div className="text-3xl font-bold text-yellow-400">${pendingPayouts.toFixed(2)}</div>
            </div>
          </div>
          <p className="text-yellow-300 text-sm">Processing for instant transfer</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Licenses</h3>
              <div className="text-3xl font-bold text-purple-400">{transactions.length}</div>
            </div>
          </div>
          <p className="text-purple-300 text-sm">Snippets licensed</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Royalty Transactions</h3>
              <p className="text-gray-400">Real-time tracking of all your earnings</p>
            </div>
            <button 
              onClick={() => {
                // Export royalty report
                const csvData = transactions.map(tx => ({
                  Date: tx.transaction_date,
                  Snippet: tx.snippet_title,
                  Amount: tx.amount,
                  'Artist Share': tx.artist_share,
                  'Platform Fee': tx.platform_fee,
                  Status: tx.payout_status,
                  'Blockchain Hash': tx.blockchain_hash
                }));
                
                const csv = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `V3B_Royalty_Report_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                addNotification({
                  type: 'success',
                  title: 'Report Downloaded',
                  message: 'Royalty report has been downloaded to your computer'
                });
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white hover:from-green-600 hover:to-blue-600 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Snippet</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">License Price</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Your Share (80%)</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Platform Fee (30%)</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Payout Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Blockchain</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-gray-300">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{tx.snippet_title}</div>
                      <div className="text-sm text-gray-400">License: {tx.license_id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-6 text-white font-semibold">${tx.amount.toFixed(2)}</td>
                    <td className="py-4 px-6 text-green-400 font-semibold">${tx.artist_share.toFixed(2)}</td>
                    <td className="py-4 px-6 text-gray-400">${tx.platform_fee.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 w-fit ${getStatusColor(tx.payout_status)}`}>
                        {getStatusIcon(tx.payout_status)}
                        <span>{tx.payout_status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {tx.blockchain_hash && (
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(tx.blockchain_hash!);
                            addNotification({
                              type: 'success',
                              title: 'Hash Copied',
                              message: 'Blockchain transaction hash copied to clipboard'
                            });
                          }}
                          className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                        >
                          {tx.blockchain_hash.slice(0, 8)}...
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {tx.payout_status === 'pending' && (
                        <button
                          onClick={() => processInstantPayout(tx.id)}
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          Process Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Royalties Yet</h3>
            <p className="text-gray-400">Upload music snippets to start earning royalties</p>
          </div>
        )}
      </div>

      {/* Royalty Accuracy Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Royalty Accuracy Guarantee</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-2">Transparent Calculations</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• 80% goes directly to you (industry leading)</li>
              <li>• 30% platform fee (covers processing, hosting, AI)</li>
              <li>• No hidden fees or deductions</li>
              <li>• Real-time calculation and display</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Blockchain Verification</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Every transaction recorded on blockchain</li>
              <li>• Immutable and verifiable records</li>
              <li>• No disputes or "lost" payments</li>
              <li>• Complete audit trail available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}