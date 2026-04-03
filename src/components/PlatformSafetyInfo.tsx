import React from 'react';
import { Shield, Lock, CheckCircle, Users, FileText, AlertTriangle, Zap, Award } from 'lucide-react';

export default function PlatformSafetyInfo() {
  const safetyFeatures = [
    {
      icon: Lock,
      title: 'Payment Escrow',
      description: 'All payments held securely until license delivery is confirmed',
      color: 'text-green-400'
    },
    {
      icon: Shield,
      title: 'Fraud Detection',
      description: 'AI-powered fraud detection monitors all transactions in real-time',
      color: 'text-cyan-400'
    },
    {
      icon: Users,
      title: 'User Verification',
      description: 'Multi-level verification system with trust scores and badges',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      title: 'Legal Protection',
      description: 'Automated legal licensing and clearance documentation',
      color: 'text-blue-400'
    },
    {
      icon: AlertTriangle,
      title: 'Dispute Resolution',
      description: 'Fair dispute resolution process with evidence review',
      color: 'text-yellow-400'
    },
    {
      icon: CheckCircle,
      title: 'Content Moderation',
      description: 'Copyright detection and community reporting system',
      color: 'text-orange-400'
    }
  ];

  const protectionPolicies = [
    {
      title: 'For Artists',
      items: [
        'Copyright protection with automated detection',
        'Revenue tracking with blockchain transparency',
        'Instant payouts within 5 seconds of sale',
        'Dispute resolution with platform mediation',
        'Protection from fraudulent buyers'
      ]
    },
    {
      title: 'For Content Creators',
      items: [
        'Quality guarantees on all purchases',
        'Clear licensing terms and usage rights',
        'Refund protection for invalid licenses',
        'Escrow protection until delivery confirmed',
        '24/7 platform support'
      ]
    },
    {
      title: 'For Community',
      items: [
        'Fair marketplace with verified users',
        'Content moderation and quality standards',
        'Transparent trust scoring system',
        'Community reporting tools',
        'Safe and secure environment'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="h-12 w-12 text-cyan-400" />
          <h2 className="text-3xl font-bold text-white">Platform Safety</h2>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Built on trust & security for all users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safetyFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className={`${feature.color} mt-1`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {protectionPolicies.map((policy, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Award className="h-6 w-6 text-cyan-400" />
                <span>{policy.title}</span>
              </h3>
              <ul className="space-y-3">
                {policy.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Response System</h3>
            <p className="text-blue-300 mb-4">
              AI monitors transactions in real-time. Suspicious activity flagged instantly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-blue-200 font-semibold mb-1">Response Time</div>
                <div className="text-2xl font-bold text-blue-400">&lt;1 sec</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-blue-200 font-semibold mb-1">Fraud Detection</div>
                <div className="text-2xl font-bold text-blue-400">99.9%</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-blue-200 font-semibold mb-1">Uptime</div>
                <div className="text-2xl font-bold text-blue-400">99.99%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Questions about platform safety? Contact our support team at{' '}
          <a href="mailto:safety@dccsverify.com" className="text-cyan-400 hover:text-cyan-300">
            safety@dccsverify.com
          </a>
        </p>
      </div>
    </div>
  );
}
