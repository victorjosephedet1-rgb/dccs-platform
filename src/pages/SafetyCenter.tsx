import React, { useState, useEffect } from 'react';
import { Shield, Lock, Users, FileText, AlertTriangle, CheckCircle, Award, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PlatformSafetyInfo from '../components/PlatformSafetyInfo';
import SafetyBadges from '../components/SafetyBadges';
import DisputeResolutionModal from '../components/DisputeResolutionModal';

export default function SafetyCenter() {
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadVerificationData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading verification:', error);
      }

      setVerificationData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const safetyStats = [
    {
      icon: Shield,
      label: 'Email OTP Security',
      value: '100%',
      description: 'Enhanced login protection',
      color: 'text-green-400'
    },
    {
      icon: Lock,
      label: 'Escrow Transactions',
      value: '100%',
      description: 'All payments protected',
      color: 'text-cyan-400'
    },
    {
      icon: CheckCircle,
      label: 'Dispute Resolution',
      value: '5-7 days',
      description: 'With automatic notifications',
      color: 'text-purple-400'
    },
    {
      icon: Users,
      label: 'Verified Users',
      value: '10,000+',
      description: 'Trusted community',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-12 w-12 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Safety Center</h1>
          </div>
          <p className="text-xl text-gray-300">
            Your protection is our priority. Learn about our comprehensive safety features.
          </p>
        </div>

        {user && verificationData && (
          <div className="mb-12 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Safety Status</h2>
                <p className="text-gray-300">Account verification and trust level</p>
              </div>
              <SafetyBadges
                trustLevel={verificationData.trust_level}
                trustScore={verificationData.trust_score}
                emailVerified={verificationData.email_verified}
                phoneVerified={verificationData.phone_verified}
                identityVerified={verificationData.identity_verified}
                businessVerified={verificationData.business_verified}
                stripeVerified={verificationData.stripe_verified}
                successfulTransactions={verificationData.successful_transactions}
                showDetails={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Successful Transactions</span>
                    <span className="text-white font-semibold">{verificationData.successful_transactions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Disputed Transactions</span>
                    <span className="text-white font-semibold">{verificationData.disputed_transactions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Positive Reviews</span>
                    <span className="text-white font-semibold">{verificationData.positive_reviews || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Enhance Your Trust</h3>
                <div className="space-y-3">
                  {!verificationData.phone_verified && (
                    <button className="w-full text-left px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg transition-all">
                      <div className="text-white font-medium">Verify Phone Number</div>
                      <div className="text-cyan-300 text-sm">+10 trust score points</div>
                    </button>
                  )}
                  {!verificationData.identity_verified && (
                    <button className="w-full text-left px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg transition-all">
                      <div className="text-white font-medium">Verify Identity</div>
                      <div className="text-purple-300 text-sm">+15 trust score points</div>
                    </button>
                  )}
                  {!verificationData.business_verified && (
                    <button className="w-full text-left px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg transition-all">
                      <div className="text-white font-medium">Business Verification</div>
                      <div className="text-blue-300 text-sm">+10 trust score points</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {safetyStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </div>
              <div className="text-white font-semibold mb-1">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-10 w-10 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Email OTP Authentication</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Enhanced security with 6-digit verification codes sent directly to your email. No passwords to remember or steal.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Passwordless Login</div>
                  <div className="text-sm text-gray-400">Choose OTP for maximum security</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">60-Second Expiry</div>
                  <div className="text-sm text-gray-400">Codes expire quickly for security</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Phishing Protection</div>
                  <div className="text-sm text-gray-400">No password to compromise</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Flexible Options</div>
                  <div className="text-sm text-gray-400">Password login still available</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-10 w-10 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Automated Notifications</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Stay informed throughout every dispute process with professional email notifications sent automatically.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Instant Dispute Alerts</div>
                  <div className="text-sm text-gray-400">Notified immediately when dispute filed</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Status Updates</div>
                  <div className="text-sm text-gray-400">Track progress in real-time</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Resolution Summaries</div>
                  <div className="text-sm text-gray-400">Detailed outcome notifications</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Professional Templates</div>
                  <div className="text-sm text-gray-400">Clear, actionable information</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PlatformSafetyInfo />

        <div className="mt-12 bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Safety Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-left p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all"
            >
              <AlertTriangle className="h-8 w-8 text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">File a Dispute</h3>
              <p className="text-gray-400 text-sm mb-3">
                Having an issue with a transaction? Our dispute resolution team is here to help.
              </p>
              <div className="flex items-center space-x-2 text-xs text-purple-300">
                <Zap className="h-4 w-4" />
                <span>Automatic email notifications keep you updated</span>
              </div>
            </button>

            <a
              href="mailto:safety@dccsverify.com"
              className="text-left p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl hover:border-red-500/40 transition-all"
            >
              <FileText className="h-8 w-8 text-red-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Report Safety Issue</h3>
              <p className="text-gray-400 text-sm">
                Report serious safety concerns directly to our safety team.
              </p>
            </a>

            <div className="text-left p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Safety Guidelines</h3>
              <p className="text-gray-400 text-sm mb-3">
                Learn best practices for safe transactions and protecting your account.
              </p>
              <a href="#" className="text-green-400 hover:text-green-300 text-sm font-medium">
                Read Guidelines →
              </a>
            </div>

            <div className="text-left p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
              <Award className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Trust & Verification</h3>
              <p className="text-gray-400 text-sm mb-3">
                Increase your trust score and unlock platform benefits.
              </p>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                Learn More →
              </a>
            </div>
          </div>
        </div>

        {showDisputeModal && user && (
          <DisputeResolutionModal
            defendantId=""
            onClose={() => setShowDisputeModal(false)}
          />
        )}
      </div>
    </div>
  );
}
