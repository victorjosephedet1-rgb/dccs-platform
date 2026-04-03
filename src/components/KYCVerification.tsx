import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, Upload, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface KYCStatus {
  verification_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_documents';
  identity_verified: boolean;
  address_verified: boolean;
  verified_at: string | null;
  verification_notes: string | null;
}

export default function KYCVerification() {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    countryCode: '',
    documentType: 'passport' as 'passport' | 'drivers_license' | 'national_id'
  });

  useEffect(() => {
    if (user) {
      fetchKYCStatus();
    }
  }, [user]);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setKycStatus(data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('kyc_verifications')
        .upsert({
          user_id: user.id,
          verification_status: 'pending',
          date_of_birth: formData.dateOfBirth,
          country_code: formData.countryCode,
          document_type: formData.documentType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Create audit log
      await supabase.rpc('create_audit_log', {
        p_event_type: 'kyc_submission',
        p_event_category: 'legal',
        p_event_data: {
          country: formData.countryCode,
          document_type: formData.documentType
        }
      });

      await fetchKYCStatus();
      alert('KYC verification submitted successfully! Our team will review your information.');
    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert('Failed to submit KYC verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = () => {
    if (!kycStatus) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'Not Started',
        description: 'Complete KYC verification to enable instant payouts'
      };
    }

    switch (kycStatus.verification_status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          text: 'Verified',
          description: 'Your identity has been verified. Instant payouts enabled!'
        };
      case 'pending':
      case 'in_review':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'Under Review',
          description: 'Your verification is being reviewed by our team'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'Verification Failed',
          description: kycStatus.verification_notes || 'Please resubmit with correct documents'
        };
      case 'requires_documents':
        return {
          icon: Upload,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          text: 'Documents Required',
          description: 'Additional documents needed for verification'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Status Card */}
      <div className={`${status.bg} border ${status.border} rounded-xl p-6 mb-8`}>
        <div className="flex items-start space-x-4">
          <StatusIcon className={`h-8 w-8 ${status.color} flex-shrink-0`} />
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${status.color} mb-2`}>
              {status.text}
            </h3>
            <p className="text-gray-300">{status.description}</p>
            {kycStatus?.verified_at && (
              <p className="text-sm text-gray-400 mt-2">
                Verified on {new Date(kycStatus.verified_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KYC Form */}
      {(!kycStatus || kycStatus.verification_status === 'rejected' || kycStatus.verification_status === 'requires_documents') && (
        <div className="bg-slate-800/50 rounded-xl p-8 border border-white/10">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Identity Verification (KYC)</h2>
          </div>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Why KYC?</strong> To comply with financial regulations and prevent fraud, we need to verify your identity before enabling instant payouts. Your information is encrypted and secure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country of Residence
              </label>
              <select
                required
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="NG">Nigeria</option>
                <option value="ZA">South Africa</option>
                <option value="KE">Kenya</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Type
              </label>
              <select
                required
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID Card</option>
              </select>
            </div>

            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Next Steps:</h4>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Submit this form with your basic information</li>
                <li>Our team will review your submission (usually within 24-48 hours)</li>
                <li>If approved, you'll receive instant payout access</li>
                <li>If additional documents are needed, we'll contact you via email</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Your personal information is encrypted and stored securely. We comply with GDPR and global data protection regulations.
          </p>
        </div>
      )}

      {/* Verification Benefits */}
      {kycStatus?.verification_status === 'approved' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Instant Payouts</h3>
            <p className="text-sm text-gray-400">Receive earnings instantly via Stripe or crypto</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20">
            <Shield className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Higher Limits</h3>
            <p className="text-sm text-gray-400">Access increased transaction limits</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Platform Trust</h3>
            <p className="text-sm text-gray-400">Verified badge on your profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
