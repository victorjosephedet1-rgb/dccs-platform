import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Upload, CheckCircle, XCircle, Shield,
  FileCheck, AlertTriangle, RefreshCw, Users, TrendingUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlatformStats {
  total_uploads:      number;
  successful_uploads: number;
  failed_uploads:     number;
  code_success:       number;
  code_fail:          number;
  cert_success:       number;
  cert_fail:          number;
  beta_user_uploads:  number;
  last_updated:       string;
}

interface LogEntry {
  id:          string;
  user_id:     string | null;
  event_type:  string;
  message:     string;
  metadata:    Record<string, unknown>;
  severity:    'info' | 'warn' | 'error';
  created_at:  string;
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '—';
  return `${Math.round((num / denom) * 100)}%`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-white/50 text-sm">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  error: { bg: 'rgba(239,68,68,0.08)',  text: 'text-red-400',    dot: 'bg-red-500'    },
  warn:  { bg: 'rgba(245,158,11,0.08)', text: 'text-amber-400',  dot: 'bg-amber-500'  },
  info:  { bg: 'rgba(14,165,233,0.06)', text: 'text-sky-400',    dot: 'bg-sky-500'    },
};

const EVENT_LABELS: Record<string, string> = {
  upload_start:        'Upload Started',
  upload_success:      'Upload Success',
  upload_fail:         'Upload Failed',
  code_success:        'Code Issued',
  code_fail:           'Code Failed',
  cert_success:        'Certificate Created',
  cert_fail:           'Certificate Failed',
  download_start:      'Download Started',
  download_success:    'Download Success',
  download_fail:       'Download Failed',
  onboarding_complete: 'Onboarding Complete',
  system_info:         'System Info',
};

export default function PilotDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats,      setStats]      = useState<PlatformStats | null>(null);
  const [logs,       setLogs]       = useState<LogEntry[]>([]);
  const [betaCount,  setBetaCount]  = useState<number>(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, logsRes, betaRes] = await Promise.all([
        supabase.rpc('get_platform_upload_stats'),
        supabase.rpc('get_recent_system_errors', { p_limit: 50 }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_beta_user', true),
      ]);

      if (statsRes.error) throw statsRes.error;
      if (logsRes.error)  throw logsRes.error;

      setStats(statsRes.data as PlatformStats);
      setLogs((logsRes.data as LogEntry[]) ?? []);
      setBetaCount(betaRes.count ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F17' }}>
        <p className="text-white/40">Not authenticated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-20 pb-16 px-4" style={{ background: '#0B0F17' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-sky-400" />
              <span className="text-sky-400 text-xs font-semibold uppercase tracking-widest">Admin Only</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Pilot Testing Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Upload success rates, ownership code generation, and error log</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(r => !r)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${autoRefresh ? 'text-emerald-300' : 'text-white/40'}`}
              style={{ background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${autoRefresh ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Live (15s)' : 'Auto-refresh'}
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl px-5 py-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium text-sm">Failed to load dashboard data</p>
              <p className="text-red-400/60 text-xs mt-0.5">{error} — Admin role required.</p>
            </div>
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-7 h-7 text-white/20 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Upload}     label="Total Uploads (30d)"  value={stats.total_uploads}      color="#FF5A1F" />
              <StatCard icon={CheckCircle} label="Successful Uploads"  value={stats.successful_uploads} color="#10b981"
                sub={`${pct(stats.successful_uploads, stats.total_uploads)} success rate`} />
              <StatCard icon={XCircle}    label="Failed Uploads"       value={stats.failed_uploads}     color="#ef4444" />
              <StatCard icon={Users}      label="Beta Users"           value={betaCount}                color="#0ea5e9" />
              <StatCard icon={Shield}     label="Ownership Codes OK"   value={stats.code_success}       color="#0ea5e9"
                sub={`${pct(stats.code_success, stats.code_success + stats.code_fail)} generation rate`} />
              <StatCard icon={AlertTriangle} label="Code Failures"     value={stats.code_fail}          color="#f59e0b" />
              <StatCard icon={FileCheck}  label="Certificates Created" value={stats.cert_success}       color="#10b981"
                sub={`${pct(stats.cert_success, stats.cert_success + stats.cert_fail)} cert rate`} />
              <StatCard icon={TrendingUp} label="Beta User Uploads"    value={stats.beta_user_uploads}  color="#a78bfa" />
            </div>

            {/* Rate summary bar */}
            <div
              className="rounded-xl p-5 mb-8"
              style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Pipeline Health (30-day window)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Upload Success Rate',   num: stats.successful_uploads, denom: stats.total_uploads,                      color: '#10b981' },
                  { label: 'Ownership Code Rate',   num: stats.code_success,       denom: stats.code_success + stats.code_fail,     color: '#0ea5e9' },
                  { label: 'Certificate Rate',      num: stats.cert_success,       denom: stats.cert_success + stats.cert_fail,     color: '#f59e0b' },
                ].map(({ label, num, denom, color }) => {
                  const p = denom === 0 ? 0 : Math.round((num / denom) * 100);
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/60 text-xs">{label}</span>
                        <span className="text-white font-semibold text-xs">{denom === 0 ? '—' : `${p}%`}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {/* Error log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Errors &amp; Warnings</h2>
            <span className="text-white/30 text-xs">{logs.length} entries</span>
          </div>

          {logs.length === 0 ? (
            <div
              className="rounded-xl px-6 py-10 text-center"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-300 font-semibold">No errors in the log</p>
              <p className="text-white/30 text-xs mt-1">The system is running cleanly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const style = SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.info;
                return (
                  <div
                    key={log.id}
                    className="rounded-xl px-4 py-3.5"
                    style={{ background: style.bg, border: `1px solid ${style.bg.replace('0.08', '0.2').replace('0.06', '0.18')}` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`text-xs font-semibold ${style.text}`}>
                            {EVENT_LABELS[log.event_type] ?? log.event_type}
                          </span>
                          <span className="text-white/20 text-xs">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed break-words">{log.message}</p>
                        {Object.keys(log.metadata).length > 0 && (
                          <p className="text-white/20 text-xs font-mono mt-1 break-all">
                            {JSON.stringify(log.metadata).substring(0, 200)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-white/5">
          <button
            onClick={() => navigate('/')}
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            Back to platform
          </button>
        </div>
      </div>
    </div>
  );
}
