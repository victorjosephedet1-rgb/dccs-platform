import React from 'react';
import { Shield, CheckCircle, Star, Award, Lock, AlertTriangle } from 'lucide-react';

interface SafetyBadgesProps {
  trustLevel?: string;
  trustScore?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  businessVerified?: boolean;
  stripeVerified?: boolean;
  successfulTransactions?: number;
  showDetails?: boolean;
}

export default function SafetyBadges({
  trustLevel = 'new',
  trustScore = 50,
  emailVerified = false,
  phoneVerified = false,
  identityVerified = false,
  businessVerified = false,
  stripeVerified = false,
  successfulTransactions = 0,
  showDetails = false
}: SafetyBadgesProps) {
  const getTrustLevelInfo = (level: string) => {
    switch (level) {
      case 'verified':
        return { icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Verified Artist', border: 'border-cyan-400' };
      case 'platinum':
        return { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Platinum', border: 'border-purple-400' };
      case 'gold':
        return { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Gold', border: 'border-yellow-400' };
      case 'silver':
        return { icon: Shield, color: 'text-gray-300', bg: 'bg-gray-500/20', label: 'Silver', border: 'border-gray-400' };
      case 'bronze':
        return { icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Bronze', border: 'border-orange-400' };
      default:
        return { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-600/20', label: 'New', border: 'border-gray-500' };
    }
  };

  const trustInfo = getTrustLevelInfo(trustLevel);
  const TrustIcon = trustInfo.icon;

  const verificationCount = [
    emailVerified,
    phoneVerified,
    identityVerified,
    businessVerified,
    stripeVerified
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${trustInfo.bg} border ${trustInfo.border}`}>
        <TrustIcon className={`h-4 w-4 ${trustInfo.color}`} />
        <span className={`text-sm font-semibold ${trustInfo.color}`}>
          {trustInfo.label}
        </span>
        {trustScore >= 75 && (
          <CheckCircle className="h-4 w-4 text-green-400" />
        )}
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Trust Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    trustScore >= 75 ? 'bg-green-500' :
                    trustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
              <span className="text-white font-semibold">{trustScore}/100</span>
            </div>
          </div>

          {verificationCount > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-medium">Verifications</div>
              <div className="flex flex-wrap gap-2">
                {emailVerified && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Email</span>
                  </div>
                )}
                {phoneVerified && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Phone</span>
                  </div>
                )}
                {identityVerified && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>ID</span>
                  </div>
                )}
                {businessVerified && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Business</span>
                  </div>
                )}
                {stripeVerified && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>Payment</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {successfulTransactions > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Successful Sales</span>
              <span className="text-white font-semibold">{successfulTransactions}</span>
            </div>
          )}

          <div className="flex items-start space-x-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Lock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <div className="font-medium mb-1">V3BMusic.AI Protection</div>
              <div className="text-blue-300/80">
                All transactions protected by escrow, fraud detection, and dispute resolution
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SafetyWarning({ message, type = 'warning' }: { message: string; type?: 'warning' | 'danger' | 'info' }) {
  const config = {
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20'
    },
    danger: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    },
    info: {
      icon: Shield,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    }
  };

  const { icon: Icon, color, bg, border } = config[type];

  return (
    <div className={`flex items-start space-x-2 p-3 ${bg} border ${border} rounded-lg`}>
      <Icon className={`h-5 w-5 ${color} mt-0.5 flex-shrink-0`} />
      <p className={`text-sm ${color}`}>{message}</p>
    </div>
  );
}
