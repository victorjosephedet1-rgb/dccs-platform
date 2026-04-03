import React from 'react';
import { Zap, Shield, Globe, Database, Cloud, Cpu } from 'lucide-react';

export default function EnterpriseFeatures() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Performance',
      description: 'Millions of concurrent users, <50ms global latency, thousands of daily transactions',
      metrics: ['1M+ concurrent users', '<50ms latency', '100K+ daily transactions']
    },
    {
      icon: Globe,
      title: 'Global Infrastructure',
      description: '500+ edge locations, 195 countries, multi-cloud architecture',
      metrics: ['Global edge network', '195 countries', '6 continents']
    },
    {
      icon: Database,
      title: 'Enterprise Data',
      description: 'Distributed databases, real-time analytics, automatic scaling',
      metrics: ['Terabyte storage', 'Real-time analytics', 'Auto-scaling']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC2, GDPR, PCI-DSS compliant with industry-standard encryption',
      metrics: ['SOC2 compliant', 'AES-256 encryption', 'Zero-trust security']
    },
    {
      icon: Cloud,
      title: 'Multi-Cloud Resilience',
      description: 'AWS + Google Cloud + Azure for 99.99% uptime guarantee',
      metrics: ['99.99% uptime', 'Multi-cloud', 'Auto-failover']
    },
    {
      icon: Cpu,
      title: 'AI-Powered Optimization',
      description: 'Machine learning for performance, pricing, and user experience',
      metrics: ['AI optimization', 'Predictive scaling', 'Smart routing']
    }
  ];

  return (
    <div className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Built for Global Scale
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Enterprise-grade infrastructure designed to handle massive music licensing demands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-400">{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Performance Guarantees */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-8 border border-green-500/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Performance Guarantees</h3>
            <p className="text-gray-300">Enterprise SLAs backed by our global infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.99%</div>
              <div className="text-gray-400">Uptime SLA</div>
              <div className="text-sm text-white/60">4.38 minutes downtime/year</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{"<50ms"}</div>
              <div className="text-gray-400">Global Latency</div>
              <div className="text-sm text-white/60">Average worldwide</div>
            </div>
            <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-400">Active Users</div>
              <div className="text-sm text-white/60">Artists and creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">100K+</div>
              <div className="text-gray-400">Daily Transactions</div>
              <div className="text-sm text-white/60">Licenses processed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}