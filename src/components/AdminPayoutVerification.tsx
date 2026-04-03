import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Shield, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationSystem';

interface PendingVerification {
  id: string;
  user_id: string;
  legal_first_name: string;
  legal_last_name: string;
  legal_full_name: string;
  date_of_birth: string;
  country: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  profile_name: string;
  profile_email: string;
}

export default function AdminPayoutVerification() {
  const { addNotification } = useNotifications();
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    loadVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('verified_payout_identities')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = (data || []).map((item: {
        id: string;
        user_id: string;
        legal_first_name: string;
        legal_last_name: string;
        legal_full_name: string;
        date_of_birth: string;
        country: string;
        verification_status: string;
        created_at: string;
        profiles?: { name?: string; email?: string } | null;
      }) => ({
        id: item.id,
        user_id: item.user_id,
        legal_first_name: item.legal_first_name,
        legal_last_name: item.legal_last_name,
        legal_full_name: item.legal_full_name,
        date_of_birth: item.date_of_birth,
        country: item.country,
        verification_status: item.verification_status,
        created_at: item.created_at,
        profile_name: item.profiles?.name || 'Unknown',
        profile_email: item.profiles?.email || 'Unknown'
      }));

      setPendingVerifications(formatted);
    } catch (error) {
      console.error('Error loading verifications:', error);
      addNotification({
        type: 'error',
        title: 'Load Error',
        message: 'Failed to load pending verifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (identityId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('verified_payout_identities')
        .update({
          verification_status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', identityId);

      if (error) throw error;

      addNotification({
        type: 'success',
        title: status === 'verified' ? 'Identity Verified' : 'Identity Rejected',
        message: `Payout identity has been ${status}`
      });

      loadVerifications();
    } catch (error: unknown) {
      console.error('Error updating verification:', error);
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: error instanceof Error ? error.message : 'Failed to update verification status'
      });
    }
  };

  const filteredVerifications = pendingVerifications.filter(v =>
    v.legal_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.profile_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.profile_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: pendingVerifications.filter(v => v.verification_status === 'pending').length,
    verified: pendingVerifications.filter(v => v.verification_status === 'verified').length,
    rejected: pendingVerifications.filter(v => v.verification_status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Payout Identity Verification</h2>
            <p className="text-gray-300">Review and approve artist payout identities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading verifications...</p>
            </div>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No verifications found</h3>
            <p className="text-gray-400">No identities match your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredVerifications.map((verification) => (
              <div key={verification.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-cyan-400" />
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Artist Profile Name</p>
                          <p className="text-white font-medium">{verification.profile_name}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Email</p>
                          <p className="text-white font-medium">{verification.profile_email}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Legal Name for Payouts</p>
                          <p className="text-white font-medium">{verification.legal_full_name}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Country</p>
                          <p className="text-white font-medium">{verification.country}</p>
                        </div>

                        {verification.date_of_birth && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                            <p className="text-white font-medium">
                              {new Date(verification.date_of_birth).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Submitted</p>
                          <p className="text-white font-medium">
                            {new Date(verification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {verification.profile_name !== verification.legal_full_name && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-yellow-200 text-sm font-medium">Name Mismatch</p>
                              <p className="text-yellow-100/80 text-xs">
                                Profile name differs from legal name - this is normal for stage names
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {verification.verification_status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerify(verification.id, 'verified')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleVerify(verification.id, 'rejected')}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {verification.verification_status === 'verified' && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 text-sm">Verified</span>
                      </div>
                    )}

                    {verification.verification_status === 'rejected' && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-300 text-sm">Rejected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
