import React, { useState, useEffect } from 'react';
import { User, CreditCard, Shield, CheckCircle, AlertCircle, Wallet, DollarSign, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import PayoutIdentityGuide from './PayoutIdentityGuide';

interface PayoutIdentity {
  id: string;
  legal_first_name: string;
  legal_last_name: string;
  legal_full_name: string;
  date_of_birth: string;
  country: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_method: string | null;
  stripe_account_id: string | null;
  crypto_wallet_address: string | null;
  crypto_wallet_verified: boolean;
}

interface BankAccount {
  id: string;
  account_type: 'stripe' | 'bank_transfer' | 'crypto' | 'paypal';
  bank_name: string | null;
  account_holder_name: string;
  last_four_digits: string | null;
  currency: string;
  is_primary: boolean;
  is_verified: boolean;
}

interface NameMatchingInfo {
  profile_name: string;
  legal_name: string;
  names_match: boolean;
  mismatch_acknowledged: boolean;
}

export default function PayoutIdentitySetup() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'check' | 'identity' | 'bank' | 'complete'>('check');
  const [showGuide, setShowGuide] = useState(false);
  const [identity, setIdentity] = useState<PayoutIdentity | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [nameMatching, setNameMatching] = useState<NameMatchingInfo | null>(null);
  const [profileName, setProfileName] = useState('');

  const [formData, setFormData] = useState({
    legal_first_name: '',
    legal_last_name: '',
    date_of_birth: '',
    country: 'US',
    account_type: 'stripe' as const,
    bank_name: '',
    crypto_wallet_address: ''
  });

  useEffect(() => {
    loadPayoutData();
  }, [user]);

  const loadPayoutData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      setProfileName(profile?.name || user.email || '');

      const { data: identityData } = await supabase
        .from('verified_payout_identities')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (identityData) {
        setIdentity(identityData);

        const { data: bankData } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('payout_identity_id', identityData.id)
          .order('is_primary', { ascending: false });

        setBankAccounts(bankData || []);

        const { data: matchingData } = await supabase
          .from('payout_name_matching')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setNameMatching(matchingData);

        if (identityData.verification_status === 'verified' && bankData && bankData.length > 0) {
          setStep('complete');
        } else if (identityData.verification_status === 'pending' && bankData && bankData.length > 0) {
          setStep('complete');
        } else if (identityData.id) {
          setStep('bank');
        }
      } else {
        setStep('identity');
      }
    } catch (error) {
      console.error('Error loading payout data:', error);
      addNotification({
        type: 'error',
        title: 'Load Error',
        message: 'Failed to load payout information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);

      const legal_full_name = `${formData.legal_first_name} ${formData.legal_last_name}`.trim();

      const { data, error } = await supabase
        .from('verified_payout_identities')
        .insert({
          user_id: user.id,
          legal_first_name: formData.legal_first_name,
          legal_last_name: formData.legal_last_name,
          legal_full_name,
          date_of_birth: formData.date_of_birth || null,
          country: formData.country,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setIdentity(data);
      setStep('bank');

      addNotification({
        type: 'success',
        title: 'Identity Saved',
        message: 'Your legal information has been saved securely'
      });
    } catch (error: any) {
      console.error('Error saving identity:', error);
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: error.message || 'Failed to save identity information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) return;

    try {
      setLoading(true);

      const accountData: any = {
        payout_identity_id: identity.id,
        account_type: formData.account_type,
        account_holder_name: identity.legal_full_name,
        currency: 'USD',
        is_primary: bankAccounts.length === 0,
        is_verified: false
      };

      if (formData.account_type === 'stripe') {
        accountData.bank_name = 'Stripe';
      } else if (formData.account_type === 'crypto') {
        accountData.bank_name = 'Crypto Wallet';
        accountData.last_four_digits = formData.crypto_wallet_address.slice(-4);
      } else {
        accountData.bank_name = formData.bank_name;
      }

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert(accountData)
        .select()
        .single();

      if (error) throw error;

      setBankAccounts([...bankAccounts, data]);
      setStep('complete');

      addNotification({
        type: 'success',
        title: 'Bank Account Added',
        message: 'Your payout method has been saved'
      });
    } catch (error: any) {
      console.error('Error saving bank account:', error);
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: error.message || 'Failed to save bank account'
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeNameMismatch = async () => {
    if (!user || !nameMatching) return;

    try {
      const { error } = await supabase
        .from('payout_name_matching')
        .update({ mismatch_acknowledged: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setNameMatching({ ...nameMatching, mismatch_acknowledged: true });

      addNotification({
        type: 'success',
        title: 'Acknowledged',
        message: 'Name difference noted. Payouts will use your legal name.'
      });
    } catch (error) {
      console.error('Error acknowledging mismatch:', error);
    }
  };

  if (loading && step === 'check') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payout information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 hover:bg-blue-500/20 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-5 w-5" />
          <span className="font-medium">How does the Payout Identity System work?</span>
        </div>
        <span className="text-sm">{showGuide ? 'Hide Guide' : 'Show Guide'}</span>
      </button>

      {showGuide && (
        <div className="animate-fadeIn">
          <PayoutIdentityGuide />
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Shield className="h-8 w-8 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Payout Identity</h3>
            <p className="text-gray-300 mb-4">
              Your legal name and banking information is stored separately from your public artist profile.
              This ensures smooth, instant payouts while you keep your creative identity.
            </p>
            {nameMatching && !nameMatching.names_match && !nameMatching.mismatch_acknowledged && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-yellow-200 font-medium mb-2">Stage Name vs Legal Name</p>
                    <p className="text-yellow-100/80 text-sm mb-3">
                      Your public profile shows <span className="font-semibold">"{nameMatching.profile_name}"</span> but
                      payouts will be sent to <span className="font-semibold">"{nameMatching.legal_name}"</span>
                    </p>
                    <button
                      onClick={acknowledgeNameMismatch}
                      className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg text-sm transition-colors"
                    >
                      I understand, use my legal name for payouts
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {step === 'complete' && identity && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Payout Identity Status</h3>
              {identity.verification_status === 'verified' ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Pending Verification</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Legal Name</label>
                <p className="text-white font-medium">{identity.legal_full_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Country</label>
                <p className="text-white font-medium">{identity.country}</p>
              </div>
            </div>

            {identity.verification_status === 'pending' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  Your identity is being verified. This typically takes 1-2 business days.
                  You'll receive a notification once verification is complete.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Payout Methods</h3>

            {bankAccounts.length > 0 ? (
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {account.account_type === 'crypto' ? (
                        <Wallet className="h-8 w-8 text-cyan-400" />
                      ) : (
                        <CreditCard className="h-8 w-8 text-cyan-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {account.bank_name || account.account_type.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {account.account_holder_name}
                          {account.last_four_digits && ` •••• ${account.last_four_digits}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {account.is_primary && (
                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                          Primary
                        </span>
                      )}
                      {account.is_verified ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No payout methods added yet</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <DollarSign className="h-8 w-8 text-green-400 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white mb-2">Ready for Instant Payouts!</h4>
                <p className="text-gray-300">
                  Your payout identity is set up. When you earn royalties, they'll be sent instantly to your verified account.
                  Keep your stage name for your fans, while payments go to your legal name automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'identity' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Legal Identity Information</h3>
          <p className="text-gray-400 mb-6">
            This information is private and only used for payouts and tax compliance.
          </p>

          <form onSubmit={handleIdentitySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Legal First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legal_first_name}
                  onChange={(e) => setFormData({ ...formData, legal_first_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="As it appears on your bank account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Legal Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legal_last_name}
                  onChange={(e) => setFormData({ ...formData, legal_last_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="As it appears on your bank account"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue to Payment Setup'}
            </button>
          </form>
        </div>
      )}

      {step === 'bank' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Add Payout Method</h3>
          <p className="text-gray-400 mb-6">
            Choose how you want to receive your royalty payments.
          </p>

          <form onSubmit={handleBankAccountSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Payout Method *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'stripe' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.account_type === 'stripe'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="h-6 w-6 text-cyan-400 mb-2" />
                  <p className="text-white font-medium">Stripe</p>
                  <p className="text-sm text-gray-400">Bank transfer via Stripe</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'crypto' })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.account_type === 'crypto'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Wallet className="h-6 w-6 text-cyan-400 mb-2" />
                  <p className="text-white font-medium">Crypto</p>
                  <p className="text-sm text-gray-400">Instant crypto payouts</p>
                </button>
              </div>
            </div>

            {formData.account_type === 'crypto' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.crypto_wallet_address}
                  onChange={(e) => setFormData({ ...formData, crypto_wallet_address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="0x..."
                />
              </div>
            )}

            {formData.account_type === 'stripe' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  You'll be redirected to Stripe to securely connect your bank account.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
