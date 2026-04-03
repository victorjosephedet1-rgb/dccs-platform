import React, { useState } from 'react';
import { CheckCircle, XCircle, Shield, DollarSign, Music, Users, Globe, AlertTriangle, Lock, Zap } from 'lucide-react';

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: {
    dos: string[];
    donts: string[];
    tips?: string[];
  };
}

export default function UsageGuidelines() {
  const [activeSection, setActiveSection] = useState<string>('artists');

  const sections: GuidelineSection[] = [
    {
      id: 'artists',
      title: 'For Artists',
      icon: Music,
      content: {
        dos: [
          'Upload only original music that you own or have proper rights to',
          'Set competitive prices between $0.05 - $0.50 for maximum sales',
          'Use clear, descriptive titles and accurate genre tags',
          'Create snippets between 15-30 seconds for optimal engagement',
          'Connect your bank account or PayPal for instant payouts',
          'Monitor your copyright protection dashboard regularly',
          'Respond to licensing inquiries within 24 hours',
          'Keep your profile and contact information updated'
        ],
        donts: [
          'Upload copyrighted material you don\'t own',
          'Use misleading titles or incorrect metadata',
          'Set prices above $2.00 (reduces conversion rates)',
          'Upload low-quality audio files (minimum 320kbps)',
          'Share your account credentials with others',
          'Ignore copyright infringement notifications',
          'Upload explicit content without proper labeling',
          'Create duplicate accounts to manipulate rankings'
        ],
        tips: [
          'Use AI recommendations to optimize your pricing strategy',
          'Upload during peak hours (2-4 PM EST, Tuesday-Thursday) for better visibility',
          'Tag your music with trending moods and genres',
          'Enable automatic copyright protection for all uploads'
        ]
      }
    },
    {
      id: 'creators',
      title: 'For Content Creators',
      icon: Users,
      content: {
        dos: [
          'Always license music before using it in your content',
          'Read license terms carefully before purchasing',
          'Keep license receipts for your records',
          'Credit artists when required by the license',
          'Use music only within the licensed platforms and duration',
          'Report any copyright issues immediately',
          'Respect usage limits (views, posts, etc.)',
          'Download licensed content promptly after purchase'
        ],
        donts: [
          'Use unlicensed music in commercial content',
          'Share licensed music files with others',
          'Exceed the usage limits specified in your license',
          'Modify licensed music without permission',
          'Use expired licenses for new content',
          'Ignore DMCA takedown notices',
          'Purchase licenses with stolen payment methods',
          'Resell or redistribute licensed content'
        ],
        tips: [
          'Browse by mood and genre to find perfect matches',
          'Use the preview feature to test music with your content',
          'Consider bulk licensing for multiple projects',
          'Follow trending artists for fresh content'
        ]
      }
    },
    {
      id: 'security',
      title: 'Security & Safety',
      icon: Shield,
      content: {
        dos: [
          'Use strong, unique passwords for your account',
          'Enable two-factor authentication when available',
          'Log out from shared or public computers',
          'Verify payment confirmations via email',
          'Report suspicious activity immediately',
          'Keep your browser and devices updated',
          'Use secure internet connections for transactions',
          'Review your account activity regularly'
        ],
        donts: [
          'Share your login credentials with anyone',
          'Click suspicious links in emails claiming to be from V3B',
          'Use public Wi-Fi for financial transactions',
          'Ignore security warnings from your browser',
          'Save payment information on shared devices',
          'Respond to phishing emails or messages',
          'Use the same password across multiple platforms',
          'Ignore unusual account activity notifications'
        ],
        tips: [
          'V3B will never ask for your password via email or phone',
          'Always verify URLs start with https://www.V3BMusic.Ai',
          'Use a password manager for secure credential storage',
          'Contact support immediately if you suspect account compromise'
        ]
      }
    },
    {
      id: 'payments',
      title: 'Payments & Royalties',
      icon: DollarSign,
      content: {
        dos: [
          'Connect verified payment methods (bank, PayPal, crypto)',
          'Provide accurate tax information when required',
          'Keep records of all transactions and licenses',
          'Set up automatic payouts for convenience',
          'Monitor your earnings dashboard regularly',
          'Report payment discrepancies within 30 days',
          'Understand fee structures before transacting',
          'Use secure payment methods only'
        ],
        donts: [
          'Use fraudulent or stolen payment methods',
          'Attempt to manipulate payout systems',
          'Share financial account information publicly',
          'Ignore tax obligations in your jurisdiction',
          'Make payments through unofficial channels',
          'Dispute legitimate charges without cause',
          'Use expired or invalid payment methods',
          'Attempt to reverse completed transactions fraudulently'
        ],
        tips: [
          'AI-powered instant payouts (seconds, not months like traditional systems)',
          'You keep 70% of every sale - industry leading rates',
          'All transactions recorded on blockchain for complete transparency',
          'Multiple payout methods available globally'
        ]
      }
    },
    {
      id: 'global',
      title: 'Global Compliance',
      icon: Globe,
      content: {
        dos: [
          'Comply with local copyright laws in your country',
          'Understand regional licensing requirements',
          'Respect cultural sensitivities in global markets',
          'Provide accurate location information',
          'Follow local tax and business regulations',
          'Use appropriate content ratings and warnings',
          'Respect time zone differences in communications',
          'Honor international trade restrictions'
        ],
        donts: [
          'Upload content illegal in your jurisdiction',
          'Violate local censorship or content laws',
          'Misrepresent your location or identity',
          'Ignore regional licensing restrictions',
          'Use the platform for money laundering',
          'Violate international sanctions or embargoes',
          'Discriminate based on nationality or location',
          'Attempt to circumvent regional restrictions'
        ],
        tips: [
          'V3B Music operates in 195+ countries with AI-powered local compliance',
          'Royalty rates automatically adjust by region',
          'AI-optimized multi-currency support for global transactions',
          'Local customer support available in major markets'
        ]
      }
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];
  const Icon = currentSection.icon;

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Platform Usage Guidelines
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Essential guidelines for using V3B Music platform safely and effectively
          </p>

          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Zap className="h-8 w-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Revolutionary Platform by V3BMusic.AI</h2>
            </div>
            <p className="text-green-200 text-lg">
              The world's first AI-powered royalty solution - designed to solve decades-old problems in music royalty collection and distribution
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <SectionIcon className="h-5 w-5" />
                <span className="font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Icon className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentSection.title}</h2>
                <p className="text-gray-400">Guidelines for optimal platform usage</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Do's */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400">DO's - Best Practices</h3>
                </div>
                <div className="space-y-3">
                  {currentSection.content.dos.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Don'ts */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <XCircle className="h-6 w-6 text-red-400" />
                  <h3 className="text-xl font-bold text-red-400">DON'Ts - Avoid These</h3>
                </div>
                <div className="space-y-3">
                  {currentSection.content.donts.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips Section */}
            {currentSection.content.tips && (
              <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-400">Pro Tips</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSection.content.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-200">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Alert */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Security Notice</h3>
              <p className="text-yellow-200 mb-4">
                V3BMusic.Ai will NEVER ask for your password, payment details, or personal information via email, phone, or social media.
                Always verify communications by logging into your account directly.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-sm text-yellow-300">
                  <strong>Support Email:</strong> support@dccsverify.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-8 border border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Questions About These Guidelines?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            If you have a legacy royalty dispute not listed here,
            our AI system can analyze your case and provide a resolution path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@dccsverify.com?subject=Support Request - Usage Guidelines"
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
