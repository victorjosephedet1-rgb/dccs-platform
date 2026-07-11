import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock,
  GitBranch, Globe, Activity, Zap, Shield, ArrowRight,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeploymentRun {
  id: string;
  commit_sha: string;
  branch: string;
  status: string;
  triggered_by: string;
  created_at: string;
  health_confirmed_at: string | null;
  error_message: string | null;
  netlify_deploy_url: string | null;
}

interface PipelineAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
}

type PipelineStatus = 'healthy' | 'degraded' | 'unknown';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case 'healthy':         return 'text-green-400';
    case 'building':
    case 'deploying':
    case 'health_checking': return 'text-amber-400';
    case 'failed':
    case 'degraded':        return 'text-red-400';
    default:                return 'text-neutral-400';
  }
}

function statusBg(status: string) {
  switch (status) {
    case 'healthy':         return 'bg-green-500/10 border-green-500/20';
    case 'building':
    case 'deploying':
    case 'health_checking': return 'bg-amber-500/10 border-amber-500/20';
    case 'failed':
    case 'degraded':        return 'bg-red-500/10 border-red-500/20';
    default:                return 'bg-white/5 border-white/10';
  }
}

function StatusIcon({ status, className = 'w-4 h-4' }: { status: string; className?: string }) {
  if (status === 'healthy')                           return <CheckCircle className={`${className} text-green-400`} />;
  if (status === 'failed' || status === 'degraded')  return <XCircle     className={`${className} text-red-400`} />;
  if (['building','deploying','health_checking'].includes(status))
    return <RefreshCw className={`${className} text-amber-400 animate-spin`} />;
  return <Clock className={`${className} text-neutral-400`} />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sha7(sha: string) {
  return sha?.slice(0, 7) ?? '—';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeploymentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [runs, setRuns]             = useState<DeploymentRun[]>([]);
  const [alerts, setAlerts]         = useState<PipelineAlert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('unknown');

  const load = useCallback(async () => {
    try {
      const [runsRes, alertsRes] = await Promise.all([
        supabase
          .from('deployment_runs')
          .select('id, commit_sha, branch, status, triggered_by, created_at, health_confirmed_at, error_message, netlify_deploy_url')
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('pipeline_alerts')
          .select('id, alert_type, severity, message, created_at')
          .eq('resolved', false)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const runData = runsRes.data ?? [];
      const alertData = alertsRes.data ?? [];

      setRuns(runData);
      setAlerts(alertData);

      // Derive overall pipeline status
      const latest = runData[0];
      if (!latest)                              setPipelineStatus('unknown');
      else if (latest.status === 'healthy')     setPipelineStatus('healthy');
      else if (latest.status === 'failed' || latest.status === 'degraded') setPipelineStatus('degraded');
      else                                      setPipelineStatus('unknown');

    } catch (err) {
      console.error('DeploymentDashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    load();
    // Auto-refresh every 60s
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [user, navigate, load]);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  // ── Stat cards ──────────────────────────────────────────────────────────────

  const totalRuns   = runs.length;
  const healthyRuns = runs.filter(r => r.status === 'healthy').length;
  const failedRuns  = runs.filter(r => r.status === 'failed').length;
  const successRate = totalRuns ? Math.round((healthyRuns / totalRuns) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F17' }}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Loading pipeline status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: '#0B0F17' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-orange-400" />
              <h1 className="text-xl font-bold text-white">Deployment Pipeline</h1>
            </div>
            <p className="text-neutral-500 text-sm">
              GitHub → Netlify → dccsverify.com live status
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Pipeline status banner */}
        <div className={`rounded-xl border p-4 mb-6 flex items-center gap-3 ${
          pipelineStatus === 'healthy'  ? 'bg-green-500/8 border-green-500/20' :
          pipelineStatus === 'degraded' ? 'bg-red-500/8 border-red-500/20' :
          'bg-white/4 border-white/8'
        }`}>
          {pipelineStatus === 'healthy'  && <CheckCircle  className="w-5 h-5 text-green-400 shrink-0" />}
          {pipelineStatus === 'degraded' && <XCircle      className="w-5 h-5 text-red-400 shrink-0" />}
          {pipelineStatus === 'unknown'  && <Clock        className="w-5 h-5 text-neutral-400 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${
              pipelineStatus === 'healthy'  ? 'text-green-300' :
              pipelineStatus === 'degraded' ? 'text-red-300' :
              'text-neutral-300'
            }`}>
              {pipelineStatus === 'healthy'  ? 'All systems operational — latest commit is live' :
               pipelineStatus === 'degraded' ? 'Pipeline degraded — self-heal workflow has been triggered' :
               'Pipeline status unknown — no recent deployments recorded'}
            </p>
          </div>
          {alerts.length > 0 && (
            <span className="shrink-0 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 font-medium">
              {alerts.length} alert{alerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Deploys', value: totalRuns,      icon: Zap,          color: 'text-orange-400' },
            { label: 'Healthy',       value: healthyRuns,    icon: CheckCircle,  color: 'text-green-400' },
            { label: 'Failed',        value: failedRuns,     icon: XCircle,      color: 'text-red-400' },
            { label: 'Success Rate',  value: `${successRate}%`, icon: Shield,    color: 'text-sky-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-xl border border-white/8 p-4"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Unresolved alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Active Alerts
            </h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                    alert.severity === 'critical' ? 'bg-red-500/8 border-red-500/20' :
                    alert.severity === 'warning'  ? 'bg-amber-500/8 border-amber-500/20' :
                    'bg-sky-500/8 border-sky-500/20'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning'  ? 'text-amber-400' : 'text-sky-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{alert.message}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {alert.alert_type} · {timeAgo(alert.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deployment runs */}
        <div>
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Recent Deployments
          </h2>

          {runs.length === 0 ? (
            <div
              className="rounded-xl border border-white/8 p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <GitBranch className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No deployments recorded yet.</p>
              <p className="text-neutral-600 text-xs mt-1">
                Runs appear here once the GitHub Actions pipeline starts reporting.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map(run => {
                const isExpanded = expanded === run.id;
                return (
                  <div
                    key={run.id}
                    className={`rounded-xl border transition-colors ${statusBg(run.status)}`}
                  >
                    {/* Row */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      onClick={() => setExpanded(isExpanded ? null : run.id)}
                    >
                      <StatusIcon status={run.status} />

                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GitBranch className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span className="text-neutral-300 text-xs font-mono truncate">{sha7(run.commit_sha)}</span>
                          <span className="text-neutral-600 text-xs truncate hidden sm:inline">· {run.branch}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold capitalize ${statusColor(run.status)}`}>
                            {run.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-neutral-600 text-xs">via {run.triggered_by}</span>
                        </div>

                        <div className="text-neutral-500 text-xs">
                          {timeAgo(run.created_at)}
                        </div>
                      </div>

                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                      }
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div
                        className="px-4 pb-4 pt-1 border-t border-white/6 space-y-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-neutral-500">Full SHA</span>
                            <p className="text-neutral-200 font-mono mt-0.5 break-all">{run.commit_sha}</p>
                          </div>
                          {run.health_confirmed_at && (
                            <div>
                              <span className="text-neutral-500">Health confirmed</span>
                              <p className="text-green-300 mt-0.5">
                                {new Date(run.health_confirmed_at).toUTCString()}
                              </p>
                            </div>
                          )}
                          {run.error_message && (
                            <div className="sm:col-span-2">
                              <span className="text-neutral-500">Error</span>
                              <p className="text-red-300 mt-0.5 break-all">{run.error_message}</p>
                            </div>
                          )}
                        </div>

                        {run.netlify_deploy_url && (
                          <a
                            href={run.netlify_deploy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            View on Netlify
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline architecture note */}
        <div
          className="mt-8 rounded-xl border border-white/6 p-5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-sm font-semibold text-neutral-300 mb-3">Pipeline Architecture</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            {[
              { icon: GitBranch, label: 'Push to main' },
              { icon: Zap,       label: 'GitHub Actions build' },
              { icon: Globe,     label: 'Netlify deploy' },
              { icon: CheckCircle, label: 'Health verified' },
              { icon: Activity,  label: 'Live on dccsverify.com' },
            ].map(({ icon: Icon, label }, i, arr) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                  <span>{label}</span>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-neutral-700 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-neutral-600 text-xs mt-3">
            Self-heal workflow runs every 15 minutes. If GitHub SHA ≠ Netlify deployed SHA, or the site returns a non-200 response, a forced redeploy is triggered automatically.
          </p>
        </div>

      </div>
    </div>
  );
}
