import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Upload, Shield, TrendingUp, Download, FileCheck, Clock,
  AlertTriangle, CheckCircle, Loader2, Plus, Tag, BarChart2,
  ShoppingBag, Layers, ArrowRight, RefreshCw, Settings,
  Music, Video, Image, FileText, Mic, Code, Package,
  Star, Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, PLATFORM_INFO } from '../utils/routes';
import SEOHead from '../components/SEOHead';
import ProtectedRoute from '../components/ProtectedRoute';

interface UploadRow {
  id: string;
  file_name: string;
  file_category: string;
  upload_status: string;
  pipeline_state: string;
  dccs_ownership_code: string | null;
  marketplace_status: string | null;
  price: number | null;
  download_count: number | null;
  created_at: string;
  dccs_certificates: { clearance_code: string | null }[] | null;
}

interface DashboardStats {
  totalUploads: number;
  completedUploads: number;
  dccsCodes: number;
  totalDownloads: number;
  totalEarnings: number;
  listedItems: number;
  pendingItems: number;
}

interface SaleRow {
  id: string;
  price_paid: number;
  license_type: string;
  created_at: string;
  status: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  audio: Music, video: Video, image: Image,
  document: FileText, podcast: Mic, software: Code, other: Package,
};

const PIPELINE_LABELS: Record<string, { label: string; color: string }> = {
  INGESTED:          { label: 'Received',      color: 'text-slate-400' },
  FINGERPRINTED:     { label: 'Fingerprinted', color: 'text-blue-400' },
  BOUND_TO_CREATOR:  { label: 'Bound',         color: 'text-indigo-400' },
  CODE_ISSUED:       { label: 'Code Issued',   color: 'text-emerald-400' },
  VERIFIED:          { label: 'Verified',      color: 'text-emerald-400' },
  LOCKED:            { label: 'Locked',        color: 'text-amber-400' },
  DISTRIBUTED:       { label: 'Distributed',  color: 'text-blue-400' },
};

const TABS = ['overview', 'uploads', 'earnings', 'marketplace'] as const;
type Tab = (typeof TABS)[number];

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'overview';

  const setTab = (tab: Tab) => setSearchParams({ tab });

  return (
    <ProtectedRoute>
      <SEOHead
        title="Creator Dashboard — DCCS Verify"
        description="Manage your protected works, track earnings, and list assets on the marketplace."
      />
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  Welcome back, <span className="text-slate-200">{user?.user_metadata?.name ?? user?.email}</span>
                </p>
              </div>
              <Link
                to={ROUTES.UPLOAD}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Upload Work
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-5 -mb-px">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-white bg-slate-800/50'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview'     && <OverviewTab />}
          {activeTab === 'uploads'      && <UploadsTab />}
          {activeTab === 'earnings'     && <EarningsTab />}
          {activeTab === 'marketplace'  && <MarketplaceTab />}
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* ─── Overview Tab ─────────────────────────────────────────────────────── */
function OverviewTab() {
  const { user } = useAuth();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [recent, setRecent]   = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [uploadsRes, salesRes] = await Promise.all([
        supabase
          .from('uploads')
          .select('id, upload_status, pipeline_state, dccs_ownership_code, marketplace_status, download_count, file_name, file_category, created_at, dccs_certificates(clearance_code)')
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('marketplace_license_purchases')
          .select('price_paid, status')
          .eq('creator_id', user.id)
          .eq('status', 'completed'),
      ]);

      const uploads = uploadsRes.data ?? [];
      const sales   = salesRes.data ?? [];

      setStats({
        totalUploads:    uploads.length,
        completedUploads: uploads.filter((u) => u.upload_status === 'completed').length,
        dccsCodes:       uploads.filter((u) => u.dccs_ownership_code).length,
        totalDownloads:  uploads.reduce((s, u) => s + (u.download_count ?? 0), 0),
        totalEarnings:   sales.reduce((s, sale) => s + (sale.price_paid ?? 0) * 0.8, 0),
        listedItems:     uploads.filter((u) => u.marketplace_status === 'listed').length,
        pendingItems:    uploads.filter((u) => u.upload_status === 'processing').length,
      });
      setRecent(uploads.slice(0, 5) as UploadRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <CenteredLoader />;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Upload}      label="Total Uploads"  value={stats?.totalUploads ?? 0}     color="blue"    />
        <StatCard icon={FileCheck}   label="DCCS Codes"     value={stats?.dccsCodes ?? 0}         color="emerald" />
        <StatCard icon={CheckCircle} label="Completed"      value={stats?.completedUploads ?? 0}  color="green"   />
        <StatCard icon={Download}    label="Downloads"      value={stats?.totalDownloads ?? 0}    color="indigo"  />
        <StatCard icon={ShoppingBag} label="Listed"         value={stats?.listedItems ?? 0}       color="amber"   />
        <StatCard
          icon={TrendingUp}
          label="Earnings"
          value={`${PLATFORM_INFO.DEFAULT_CURRENCY}${(stats?.totalEarnings ?? 0).toFixed(2)}`}
          color="emerald"
          large
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: ROUTES.UPLOAD,              icon: Upload,     label: 'Upload a Work',   desc: 'Protect your creation',         color: 'blue'    },
            { to: ROUTES.DCCS_REDOWNLOAD,     icon: Shield,     label: 'DCCS Register',   desc: 'Get a clearance code',           color: 'emerald' },
            { to: ROUTES.MARKETPLACE,         icon: Tag,        label: 'Marketplace',     desc: 'Browse & list works',           color: 'amber'   },
            { to: '/library',                 icon: Layers,     label: 'My Library',      desc: 'All your uploaded content',     color: 'indigo'  },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg bg-${action.color}-500/10 flex items-center justify-center mb-3`}>
                <action.icon className={`w-4 h-4 text-${action.color}-400`} />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
              <span className="text-xs text-slate-500 mt-0.5">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Uploads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Uploads</h2>
          <Link to="/library" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="No uploads yet"
            description="Upload your first creative work to get started."
            action={{ label: 'Upload Now', to: ROUTES.UPLOAD }}
          />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {recent.map((upload, i) => (
              <UploadRow key={upload.id} upload={upload} last={i === recent.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Uploads Tab ──────────────────────────────────────────────────────── */
function UploadsTab() {
  const { user }   = useAuth();
  const [uploads, setUploads]   = useState<UploadRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  const FILTERS = ['all', 'completed', 'processing', 'failed'];

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('uploads')
      .select('id, file_name, file_category, upload_status, pipeline_state, dccs_ownership_code, marketplace_status, price, download_count, created_at, dccs_certificates(clearance_code)')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUploads((data ?? []) as UploadRow[]);
        setLoading(false);
      });
  }, [user]);

  const visible = filter === 'all'
    ? uploads
    : uploads.filter((u) => u.upload_status === filter);

  if (loading) return <CenteredLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? `All (${uploads.length})` : f}
            </button>
          ))}
        </div>
        <Link to={ROUTES.UPLOAD} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Upload
        </Link>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Upload} title="No uploads" description="Your uploads will appear here." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {visible.map((upload, i) => (
            <UploadRow key={upload.id} upload={upload} last={i === visible.length - 1} showMarketplace />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Earnings Tab ─────────────────────────────────────────────────────── */
function EarningsTab() {
  const { user }   = useAuth();
  const [sales, setSales]       = useState<SaleRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [totalEarned, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('marketplace_license_purchases')
      .select('id, price_paid, license_type, created_at, status')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as SaleRow[];
        setSales(rows);
        setTotal(rows.filter((r) => r.status === 'completed').reduce((s, r) => s + r.price_paid * 0.8, 0));
        setLoading(false);
      });
  }, [user]);

  if (loading) return <CenteredLoader />;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Earned (80%)"
          value={`${PLATFORM_INFO.DEFAULT_CURRENCY}${totalEarned.toFixed(2)}`}
          sub="After platform fee"
          color="emerald"
          icon={TrendingUp}
        />
        <SummaryCard
          label="Total Sales"
          value={sales.filter((s) => s.status === 'completed').length}
          sub="Completed transactions"
          color="blue"
          icon={ShoppingBag}
        />
        <SummaryCard
          label="Gross Revenue"
          value={`${PLATFORM_INFO.DEFAULT_CURRENCY}${sales.filter((s) => s.status === 'completed').reduce((s, r) => s + r.price_paid, 0).toFixed(2)}`}
          sub="Before 20% platform fee"
          color="amber"
          icon={BarChart2}
        />
      </div>

      {/* Revenue split info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Revenue Split
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-emerald-400 font-medium">You (80%)</span>
              <span className="text-slate-500">Victor360 (20%)</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {sales.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No sales yet"
          description="List your works on the marketplace to start earning."
          action={{ label: 'Go to Marketplace', to: ROUTES.MARKETPLACE }}
        />
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Transactions</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <span>Date</span>
              <span>License Type</span>
              <span>Status</span>
              <span className="text-right">Your Earnings</span>
            </div>
            {sales.map((sale) => (
              <div key={sale.id} className="grid grid-cols-4 gap-4 px-5 py-3.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                <span className="text-sm text-slate-400">
                  {new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-sm text-slate-300 capitalize">{sale.license_type}</span>
                <span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    sale.status === 'completed'  ? 'bg-emerald-500/10 text-emerald-400' :
                    sale.status === 'pending'    ? 'bg-amber-500/10 text-amber-400'    :
                    sale.status === 'failed'     ? 'bg-rose-500/10 text-rose-400'      :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {sale.status}
                  </span>
                </span>
                <span className={`text-sm font-semibold text-right ${sale.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {sale.status === 'completed'
                    ? `${PLATFORM_INFO.DEFAULT_CURRENCY}${(sale.price_paid * 0.8).toFixed(2)}`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Marketplace Tab ──────────────────────────────────────────────────── */
function MarketplaceTab() {
  const { user }   = useAuth();
  const [uploads, setUploads]   = useState<UploadRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('uploads')
      .select('id, file_name, file_category, upload_status, pipeline_state, dccs_ownership_code, marketplace_status, price, download_count, created_at, dccs_certificates(clearance_code)')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .eq('upload_status', 'completed')
      .order('created_at', { ascending: false });
    setUploads((data ?? []) as UploadRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const toggleListing = async (upload: UploadRow, newStatus: string, price?: number) => {
    setUpdating(upload.id);
    await supabase
      .from('uploads')
      .update({
        marketplace_status: newStatus,
        is_marketplace_eligible: newStatus === 'listed',
        price: price ?? upload.price ?? 0,
      })
      .eq('id', upload.id)
      .eq('user_id', user?.id);
    await fetchUploads();
    setUpdating(null);
  };

  if (loading) return <CenteredLoader />;

  const listed    = uploads.filter((u) => u.marketplace_status === 'listed');
  const unlisted  = uploads.filter((u) => u.marketplace_status !== 'listed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Marketplace Listings</h2>
          <p className="text-slate-400 text-sm mt-0.5">{listed.length} of {uploads.length} works are listed</p>
        </div>
        <Link to={ROUTES.MARKETPLACE} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View Marketplace <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {uploads.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No completed uploads"
          description="Complete an upload first before listing on the marketplace."
          action={{ label: 'Upload Work', to: ROUTES.UPLOAD }}
        />
      ) : (
        <>
          {listed.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Listed ({listed.length})</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {listed.map((upload, i) => (
                  <MarketplaceRow
                    key={upload.id}
                    upload={upload}
                    last={i === listed.length - 1}
                    updating={updating === upload.id}
                    onToggle={(p) => toggleListing(upload, 'unlisted', p)}
                    isListed
                  />
                ))}
              </div>
            </section>
          )}

          {unlisted.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Not Listed ({unlisted.length})</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {unlisted.map((upload, i) => (
                  <MarketplaceRow
                    key={upload.id}
                    upload={upload}
                    last={i === unlisted.length - 1}
                    updating={updating === upload.id}
                    onToggle={(p) => toggleListing(upload, 'listed', p)}
                    isListed={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Shared Sub-components ────────────────────────────────────────────── */
function UploadRow({ upload, last, showMarketplace }: { upload: UploadRow; last: boolean; showMarketplace?: boolean }) {
  const Icon = FILE_ICONS[upload.file_category] ?? Package;
  const pipeline = PIPELINE_LABELS[upload.pipeline_state];
  const code = upload.dccs_ownership_code ?? upload.dccs_certificates?.[0]?.clearance_code;

  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-slate-800/50' : ''} hover:bg-slate-800/30 transition-colors`}>
      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{upload.file_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {code ? (
            <span className="text-xs font-mono text-emerald-400 truncate">{code}</span>
          ) : (
            <span className="text-xs text-slate-500">No DCCS code</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {pipeline && (
          <span className={`text-xs font-medium ${pipeline.color}`}>{pipeline.label}</span>
        )}
        {showMarketplace && upload.marketplace_status === 'listed' && (
          <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">Listed</span>
        )}
        <span className="text-xs text-slate-500">
          {new Date(upload.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

function MarketplaceRow({
  upload, last, updating, onToggle, isListed,
}: {
  upload: UploadRow;
  last: boolean;
  updating: boolean;
  onToggle: (price: number) => void;
  isListed: boolean;
}) {
  const [editPrice, setEditPrice] = useState(false);
  const [priceVal, setPriceVal]   = useState(String(upload.price ?? 0));
  const Icon = FILE_ICONS[upload.file_category] ?? Package;

  const handleToggle = () => {
    const price = parseFloat(priceVal) || 0;
    onToggle(price);
    setEditPrice(false);
  };

  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${!last ? 'border-b border-slate-800/50' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{upload.file_name}</p>
        <p className="text-xs text-slate-500 capitalize">{upload.file_category}</p>
      </div>

      {/* Price editor */}
      <div className="flex items-center gap-2 shrink-0">
        {editPrice ? (
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-sm">{PLATFORM_INFO.DEFAULT_CURRENCY}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleToggle(); if (e.key === 'Escape') setEditPrice(false); }}
              className="w-20 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setEditPrice(true)}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors min-w-[60px] text-right"
          >
            {upload.price == null || upload.price === 0
              ? <span className="text-slate-500 italic">Set price</span>
              : <span className="font-medium text-slate-200">{PLATFORM_INFO.DEFAULT_CURRENCY}{upload.price.toFixed(2)}</span>
            }
          </button>
        )}

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isListed
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          } disabled:opacity-50`}
        >
          {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : isListed ? 'Unlist' : 'List'}
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color, large,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  large?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`w-7 h-7 rounded-lg bg-${color}-500/10 flex items-center justify-center mb-3`}>
        <Icon className={`w-3.5 h-3.5 text-${color}-400`} />
      </div>
      <p className={`font-bold text-white ${large ? 'text-xl' : 'text-xl'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function SummaryCard({
  label, value, sub, color, icon: Icon,
}: {
  label: string;
  value: number | string;
  sub: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${color}-400`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>
      <p className="text-slate-200 font-semibold">{title}</p>
      <p className="text-slate-500 text-sm mt-1 max-w-xs">{description}</p>
      {action && (
        <Link
          to={action.to}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function CenteredLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
    </div>
  );
}
