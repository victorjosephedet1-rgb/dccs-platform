import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Ban, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ModStat {
  total_scans: number;
  approved: number;
  rejected: number;
  flagged: number;
  total_violations: number;
  critical_violations: number;
  banned_users: number;
}

interface Violation {
  id: string;
  user_id: string;
  violation_type: string;
  severity: string;
  description: string;
  detected_by_ai: boolean;
  action_taken: string;
  detected_at: string;
  user_email?: string;
}

interface ContentScan {
  id: string;
  content_id: string;
  scan_status: string;
  ai_confidence: number;
  copyright_detected: boolean;
  prohibited_content: boolean;
  final_decision: string;
  created_at: string;
  uploaded_by: string;
  user_email?: string;
}

export function AdminModerationDashboard() {
  const [stats, setStats] = useState<ModStat | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [scans, setScans] = useState<ContentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'violations' | 'scans'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [scansData, violationsData] = await Promise.all([
        supabase.from('ai_content_scans').select('*, profiles!ai_content_scans_uploaded_by_fkey(email)').order('created_at', { ascending: false }).limit(20),
        supabase.from('platform_violations').select('*, profiles!platform_violations_user_id_fkey(email)').order('detected_at', { ascending: false }).limit(20)
      ]);

      if (scansData.data) {
        const scansList = scansData.data.map((scan: Record<string, unknown> & { profiles?: { email: string } }) => ({
          ...scan,
          user_email: scan.profiles?.email
        }));
        setScans(scansList as ContentScan[]);
      }

      if (violationsData.data) {
        const violationsList = violationsData.data.map((v: Record<string, unknown> & { profiles?: { email: string } }) => ({
          ...v,
          user_email: v.profiles?.email
        }));
        setViolations(violationsList as Violation[]);
      }

      const totalScans = scansData.data?.length || 0;
      const approved = scansData.data?.filter(s => s.scan_status === 'approved').length || 0;
      const rejected = scansData.data?.filter(s => s.scan_status === 'rejected').length || 0;
      const flagged = scansData.data?.filter(s => s.scan_status === 'flagged').length || 0;
      const totalViolations = violationsData.data?.length || 0;
      const criticalViolations = violationsData.data?.filter((v: Record<string, unknown> & { severity: string }) => v.severity === 'critical').length || 0;
      const bannedUsers = violationsData.data?.filter((v: Record<string, unknown> & { banned_permanently: boolean }) => v.banned_permanently).length || 0;

      setStats({
        total_scans: totalScans,
        approved,
        rejected,
        flagged,
        total_violations: totalViolations,
        critical_violations: criticalViolations,
        banned_users: bannedUsers
      });
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'severe': return 'text-orange-400 bg-orange-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'flagged': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Moderation Dashboard</h2>
          <p className="text-gray-400">Automated content moderation powered by AI</p>
        </div>
        <Shield className="h-12 w-12 text-purple-400" />
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">{stats.total_scans}</span>
            </div>
            <div className="text-sm text-gray-400">Total Scans</div>
            <div className="mt-2 text-xs text-blue-300">
              {stats.approved} approved • {stats.rejected} rejected
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.approved}</span>
            </div>
            <div className="text-sm text-gray-400">Approved</div>
            <div className="mt-2 text-xs text-green-300">
              {stats.total_scans > 0 ? ((stats.approved / stats.total_scans) * 100).toFixed(1) : 0}% approval rate
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <span className="text-2xl font-bold text-white">{stats.total_violations}</span>
            </div>
            <div className="text-sm text-gray-400">Violations</div>
            <div className="mt-2 text-xs text-red-300">
              {stats.critical_violations} critical
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Ban className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.banned_users}</span>
            </div>
            <div className="text-sm text-gray-400">Banned Users</div>
            <div className="mt-2 text-xs text-purple-300">
              Permanent bans
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-white/10">
        <button
          onClick={() => setTab('overview')}
          className={`pb-3 px-4 font-medium transition-colors ${
            tab === 'overview'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('violations')}
          className={`pb-3 px-4 font-medium transition-colors ${
            tab === 'violations'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Violations
        </button>
        <button
          onClick={() => setTab('scans')}
          className={`pb-3 px-4 font-medium transition-colors ${
            tab === 'scans'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Recent Scans
        </button>
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">AI Moderation</span>
              <span className="text-green-400 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Blockchain Verification</span>
              <span className="text-green-400 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Auto-Enforcement</span>
              <span className="text-green-400 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Copyright Database</span>
              <span className="text-green-400 font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Connected
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'violations' && (
        <div className="space-y-4">
          {violations.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">No violations detected</p>
            </div>
          ) : (
            violations.map(violation => (
              <div key={violation.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-semibold">{violation.violation_type}</h4>
                      <span className={`text-xs px-3 py-1 rounded-full ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                      {violation.detected_by_ai && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                          AI Detected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{violation.description}</p>
                    <div className="text-xs text-gray-500">
                      User: {violation.user_email || violation.user_id.substring(0, 8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-2">
                      {new Date(violation.detected_at).toLocaleString()}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      violation.action_taken === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {violation.action_taken}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'scans' && (
        <div className="space-y-4">
          {scans.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No recent scans</p>
            </div>
          ) : (
            scans.map(scan => (
              <div key={scan.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(scan.scan_status)}`}>
                        {scan.scan_status}
                      </span>
                      {scan.copyright_detected && (
                        <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                          Copyright Detected
                        </span>
                      )}
                      {scan.prohibited_content && (
                        <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                          Prohibited Content
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Content ID: {scan.content_id.substring(0, 12)}...
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      User: {scan.user_email || scan.uploaded_by.substring(0, 8)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold mb-1">
                      {scan.ai_confidence?.toFixed(1) || 'N/A'}% confidence
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(scan.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
