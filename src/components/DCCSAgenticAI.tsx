import React, { useState } from 'react';
import { Brain, Globe, TrendingUp, Shield, Zap, Eye, DollarSign, AlertTriangle, CheckCircle, Activity, Target, Fingerprint } from 'lucide-react';

interface MonitoringStatus {
  platform: string;
  tracked: number;
  claims: number;
  revenue: number;
  status: 'active' | 'scanning' | 'claiming';
}

interface RoyaltyRule {
  rule: string;
  enforcement: string;
  status: 'enforced' | 'monitoring';
}

export default function DCCSAgenticAI() {
  const [monitoringData] = useState<MonitoringStatus[]>([
    { platform: 'YouTube', tracked: 1247, claims: 89, revenue: 4567.89, status: 'active' },
    { platform: 'TikTok', tracked: 3421, claims: 156, revenue: 8932.45, status: 'scanning' },
    { platform: 'Instagram', tracked: 892, claims: 34, revenue: 2134.67, status: 'active' },
    { platform: 'Facebook', tracked: 645, claims: 23, revenue: 1876.23, status: 'claiming' },
    { platform: 'Spotify', tracked: 2156, claims: 67, revenue: 5643.12, status: 'active' },
    { platform: 'Apple Music', tracked: 1834, claims: 45, revenue: 4321.89, status: 'active' },
    { platform: 'Twitter/X', tracked: 567, claims: 12, revenue: 987.45, status: 'scanning' },
    { platform: 'Twitch', tracked: 234, claims: 8, revenue: 654.32, status: 'active' },
  ]);

  const dccsRules: RoyaltyRule[] = [
    {
      rule: '80/20 Royalty Split',
      enforcement: '80% to creator, 20% to V3BMusic.AI on all revenue',
      status: 'enforced'
    },
    {
      rule: 'Perpetual Monitoring',
      enforcement: 'AI tracks content usage forever, across all platforms worldwide',
      status: 'enforced'
    },
    {
      rule: 'Automatic Claims',
      enforcement: 'File copyright claims within 24 hours of detection',
      status: 'enforced'
    },
    {
      rule: 'Instant Payouts',
      enforcement: 'Distribute royalties within 1 hour of collection',
      status: 'enforced'
    },
    {
      rule: 'Platform Licensing',
      enforcement: 'Platforms must license DCCS content or face takedown',
      status: 'enforced'
    },
    {
      rule: 'Global Protection',
      enforcement: 'Monitor and enforce in all countries, all languages',
      status: 'enforced'
    },
    {
      rule: 'Blockchain Ledger',
      enforcement: 'Record all transactions on immutable blockchain',
      status: 'enforced'
    },
    {
      rule: 'DMCA Enforcement',
      enforcement: 'Issue takedowns for non-compliant unauthorized usage',
      status: 'enforced'
    }
  ];

  const aiCapabilities = [
    {
      icon: Eye,
      title: 'Content Detection',
      description: 'Audio/video fingerprinting across 50+ platforms',
      metrics: '99.8% accuracy'
    },
    {
      icon: Target,
      title: 'Usage Tracking',
      description: 'Real-time monitoring of every DCCS-registered work',
      metrics: '24/7 global scan'
    },
    {
      icon: Shield,
      title: 'Rights Enforcement',
      description: 'Automated claims and takedown notices',
      metrics: '<24hr response'
    },
    {
      icon: DollarSign,
      title: 'Royalty Collection',
      description: 'Negotiate and collect from all platforms',
      metrics: '£28M+ collected'
    },
    {
      icon: Zap,
      title: 'Smart Distribution',
      description: 'Instant 80/20 split via blockchain',
      metrics: '<1hr payout'
    },
    {
      icon: Brain,
      title: 'Learning System',
      description: 'Improves detection and strategy over time',
      metrics: 'Self-optimizing'
    }
  ];

  const totalRevenue = monitoringData.reduce((sum, platform) => sum + platform.revenue, 0);
  const totalTracked = monitoringData.reduce((sum, platform) => sum + platform.tracked, 0);
  const totalClaims = monitoringData.reduce((sum, platform) => sum + platform.claims, 0);

  return (
    <div className="space-y-8">
      {/* AI Status Header */}
      <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">DCCS Agentic AI</h2>
              <p className="text-cyan-300 text-lg">Global Royalty Tracking & Collection System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">
                {isActive ? 'ACTIVE - MONITORING' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <div className="text-sm text-slate-400">Content Tracked</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalTracked.toLocaleString()}</div>
            <div className="text-xs text-cyan-400 mt-1">Across 50+ platforms</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <div className="text-sm text-slate-400">Active Claims</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalClaims}</div>
            <div className="text-xs text-blue-400 mt-1">Filed this month</div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <div className="text-sm text-slate-400">Revenue Collected</div>
            </div>
            <div className="text-3xl font-bold text-white">£{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="text-xs text-green-400 mt-1">This month</div>
          </div>
        </div>
      </div>

      {/* AI Capabilities Grid */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiCapabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div key={index} className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{capability.title}</h4>
                    <p className="text-sm text-slate-400 mb-3">{capability.description}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs font-semibold text-cyan-400">{capability.metrics}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Monitoring */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Platform Monitoring</h3>
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Platform</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tracked</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Claims Filed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {monitoringData.map((platform, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium text-white">{platform.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{platform.tracked.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">{platform.claims}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      £{platform.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        platform.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : platform.status === 'scanning'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {platform.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {platform.status === 'scanning' && <Eye className="w-3 h-3" />}
                        {platform.status === 'claiming' && <AlertTriangle className="w-3 h-3" />}
                        {platform.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DCCS Rules & Enforcement */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">DCCS Rules & Enforcement</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dccsRules.map((rule, index) => (
            <div key={index} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">{rule.rule}</h4>
                  <p className="text-sm text-slate-400 mb-3">{rule.enforcement}</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-semibold text-green-400">
                    <Shield className="w-3 h-3" />
                    {rule.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-blue-400" />
          How DCCS AI Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <h4 className="text-lg font-bold text-white">Content Registration</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                Artist uploads content and receives unique DCCS code with digital fingerprint
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <h4 className="text-lg font-bold text-white">AI Monitoring</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                AI scans YouTube, TikTok, Instagram, Facebook, Spotify, and 45+ other platforms 24/7
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <h4 className="text-lg font-bold text-white">Detection & Matching</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                When content is used anywhere, AI matches fingerprint to database within seconds
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <h4 className="text-lg font-bold text-white">Automated Claims</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                AI files copyright claim on behalf of V3BMusic.AI and creator
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                <h4 className="text-lg font-bold text-white">Platform Payment</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                Platform pays licensing fee to avoid takedown (or content is removed via DMCA)
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">6</div>
                <h4 className="text-lg font-bold text-white">Smart Contract Split</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                Blockchain smart contract automatically splits: 80% to creator, 20% to V3BMusic.AI
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">7</div>
                <h4 className="text-lg font-bold text-white">Instant Payout</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                Funds deposited to creator's crypto wallet within 1 hour (not months later)
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">8</div>
                <h4 className="text-lg font-bold text-white">Forever Monitoring</h4>
              </div>
              <p className="text-slate-400 text-sm pl-11">
                Process repeats infinitely. Every use generates royalties for life of copyright
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Why Platforms Pay</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Platforms like YouTube, TikTok, Instagram, and Facebook are legally required to license copyrighted content
                or remove it. DCCS provides blockchain-verified proof of ownership that platforms cannot dispute.
                Rather than face millions of DMCA takedowns and legal battles, platforms negotiate licensing agreements
                with V3BMusic.AI, making it cheaper for them to pay than to fight. As DCCS becomes the industry
                standard with millions of registered works, platforms will integrate DCCS verification directly into their systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
