import React, { useState, useEffect } from 'react';
import { Globe, Zap, Shield, Database, Cloud, Activity, Users, TrendingUp } from 'lucide-react';

interface InfrastructureMetrics {
  globalUsers: number;
  activeRegions: number;
  requestsPerSecond: number;
  averageLatency: number;
  uptime: number;
  dataProcessed: number;
}

export default function GlobalInfrastructure() {
  const [metrics, setMetrics] = useState<InfrastructureMetrics>({
    globalUsers: 0,
    activeRegions: 0,
    requestsPerSecond: 0,
    averageLatency: 0,
    uptime: 0,
    dataProcessed: 0
  });

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      setMetrics({
        globalUsers: Math.floor(Math.random() * 100000) + 1000000, // 1M+ users
        activeRegions: 195,
        requestsPerSecond: Math.floor(Math.random() * 10000) + 50000, // 50K+ RPS
        averageLatency: Math.floor(Math.random() * 20) + 25, // 25-45ms
        uptime: 99.99,
        dataProcessed: Math.floor(Math.random() * 100) + 5000 // 5TB+ daily
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Global Infrastructure</h2>
            <p className="text-gray-400">Enterprise-grade worldwide capacity</p>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="h-6 w-6 text-blue-400" />
              <span className="text-sm text-gray-400">Global Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.globalUsers.toLocaleString()}</div>
            <div className="text-sm text-blue-400">Active worldwide</div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="h-6 w-6 text-green-400" />
              <span className="text-sm text-gray-400">Requests/Second</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.requestsPerSecond.toLocaleString()}</div>
            <div className="text-sm text-green-400">Peak capacity: 1M RPS</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="h-6 w-6 text-purple-400" />
              <span className="text-sm text-gray-400">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.averageLatency}ms</div>
            <div className="text-sm text-purple-400">Global average</div>
          </div>
        </div>

        {/* Infrastructure Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Specs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Enterprise Performance</h3>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Uptime SLA</span>
                <span className="text-green-400 font-semibold">{metrics.uptime}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${metrics.uptime}%` }}></div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Global Coverage</span>
                <span className="text-blue-400 font-semibold">{metrics.activeRegions} Countries</span>
              </div>
              <div className="text-sm text-gray-400">500+ Edge locations worldwide</div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Data Processed Daily</span>
                <span className="text-purple-400 font-semibold">{metrics.dataProcessed}+ TB</span>
              </div>
              <div className="text-sm text-gray-400">Terabyte-scale processing</div>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Architecture Stack</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Cloud className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Multi-Cloud Infrastructure</div>
                  <div className="text-sm text-gray-400">AWS + Google Cloud + Azure</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Database className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Distributed Database</div>
                  <div className="text-sm text-gray-400">PostgreSQL with global read replicas</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Shield className="h-5 w-5 text-red-400" />
                <div>
                  <div className="text-white font-medium">Enterprise Security</div>
                  <div className="text-sm text-gray-400">SOC2 + GDPR + PCI-DSS compliant</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Auto-Scaling</div>
                  <div className="text-sm text-gray-400">Kubernetes with AI-powered scaling</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Regions Map */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Global Presence</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { region: 'North America', status: 'active', latency: '12ms' },
              { region: 'Europe', status: 'active', latency: '18ms' },
              { region: 'Asia Pacific', status: 'active', latency: '25ms' },
              { region: 'South America', status: 'active', latency: '35ms' },
              { region: 'Africa', status: 'active', latency: '42ms' },
              { region: 'Middle East', status: 'active', latency: '28ms' }
            ].map((region) => (
              <div key={region.region} className="text-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="text-sm text-white font-medium">{region.region}</div>
                <div className="text-xs text-gray-400">{region.latency}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}