import React, { useEffect, useState } from 'react';
import {
  Shield,
  Fingerprint,
  TrendingUp,
  Activity,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { dccsIntegrationService } from '../lib/dccs/DCCSIntegrationService';
import SEOHead from '../components/SEOHead';

interface SystemStats {
  totalCertificates: number;
  enhancedCertificates: number;
  totalVerifications: number;
  verificationsLast24h: number;
  identifierStatistics: any;
}

export default function DCCSAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadStatistics();
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await dccsIntegrationService.getSystemStatistics();
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const enhancementRate = stats
    ? ((stats.enhancedCertificates / stats.totalCertificates) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="DCCS Admin Dashboard - System Monitoring"
        description="Monitor DCCS system performance, certificate registrations, and verification activity"
      />

      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                DCCS System Dashboard
              </h1>
              <p className="text-slate-600">
                Real-time monitoring of Digital Clearance Code System
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={loadStatistics}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh Now
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">
                Total Certificates
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalCertificates.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Fingerprint className="w-6 h-6 text-green-600" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">
                Enhanced Certificates
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.enhancedCertificates.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-slate-500 mt-1">{enhancementRate}% of total</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">
                Total Verifications
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.totalVerifications.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Last 24 Hours</h3>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.verificationsLast24h.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-slate-500 mt-1">Verifications</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Certificates by Media Type
              </h2>
              <div className="space-y-4">
                {stats?.identifierStatistics.byMediaType &&
                  Object.entries(stats.identifierStatistics.byMediaType).map(
                    ([type, count]) => {
                      const total = stats.totalCertificates;
                      const percentage = total > 0 ? ((count as number) / total) * 100 : 0;

                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              {type === 'AUD'
                                ? 'Audio'
                                : type === 'VID'
                                ? 'Video'
                                : type === 'IMG'
                                ? 'Image'
                                : 'Document'}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {count as number} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Registrations by Year
              </h2>
              <div className="space-y-4">
                {stats?.identifierStatistics.byYear &&
                  Object.entries(stats.identifierStatistics.byYear)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([year, count]) => {
                      const total = stats.totalCertificates;
                      const percentage = total > 0 ? ((count as number) / total) * 100 : 0;

                      return (
                        <div key={year}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">{year}</span>
                            <span className="text-sm font-semibold text-slate-900">
                              {count as number} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">System Health</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-blue-200">Database</p>
                  <p className="font-semibold">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-blue-200">Fingerprint Engine</p>
                  <p className="font-semibold">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-blue-200">Verification Service</p>
                  <p className="font-semibold">Operational</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Patent-Pending Technology
                </h3>
                <p className="text-sm text-blue-800">
                  The DCCS system represents a novel approach to digital media verification.
                  All metrics and system performance data support ongoing patent applications
                  for structured identifier systems, distortion-tolerant fingerprinting, and
                  multi-resolution verification technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
