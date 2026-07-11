import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon, Filter, Shield, Music, Video, Image, FileText,
  Mic, Code, Package, User, CheckCircle, X, Loader2, ChevronRight,
  ShoppingBag, Clock, Tag, AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLATFORM_INFO, ROUTES } from '../utils/routes';
import SEOHead from '../components/SEOHead';

type ResultType = 'asset' | 'creator' | 'certificate';

interface AssetResult {
  type: 'asset';
  id: string;
  title: string;
  category: string;
  creator_name: string;
  creator_slug: string | null;
  clearance_code: string | null;
  price: number | null;
  marketplace_status: string | null;
  created_at: string;
  thumbnail_url: string | null;
}

interface CreatorResult {
  type: 'creator';
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  profile_slug: string | null;
  is_verified: boolean;
  headline: string | null;
  location: string | null;
}

interface CertificateResult {
  type: 'certificate';
  id: string;
  clearance_code: string;
  project_title: string;
  project_type: string;
  creator_name: string;
  created_at: string;
  creator_verified: boolean;
}

type SearchResult = AssetResult | CreatorResult | CertificateResult;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  audio: Music, video: Video, image: Image, document: FileText,
  podcast: Mic, software: Code, other: Package,
};

const FILTER_TABS: { value: ResultType | 'all'; label: string }[] = [
  { value: 'all',         label: 'All Results'   },
  { value: 'asset',       label: 'Assets'        },
  { value: 'creator',     label: 'Creators'      },
  { value: 'certificate', label: 'DCCS Codes'    },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialFilter = (searchParams.get('type') as ResultType | 'all') ?? 'all';

  const [query, setQuery]         = useState(initialQuery);
  const [filter, setFilter]       = useState<ResultType | 'all'>(initialFilter);
  const [results, setResults]     = useState<SearchResult[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const term = q.trim().toLowerCase();
      const allResults: SearchResult[] = [];

      // Search assets (uploads joined with profiles and certificates)
      if (filter === 'all' || filter === 'asset') {
        const { data: assets } = await supabase
          .from('uploads')
          .select('id, file_name, file_category, marketplace_status, price, thumbnail_url, created_at, description, dccs_ownership_code, profiles(name, profile_slug), dccs_certificates(clearance_code)')
          .eq('is_archived', false)
          .eq('upload_status', 'completed')
          .or(`file_name.ilike.%${term}%,description.ilike.%${term}%,dccs_ownership_code.ilike.%${term}%`)
          .limit(20);

        (assets ?? []).forEach((a: any) => {
          allResults.push({
            type: 'asset',
            id: a.id,
            title: a.file_name,
            category: a.file_category,
            creator_name: a.profiles?.name ?? 'Unknown Creator',
            creator_slug: a.profiles?.profile_slug ?? null,
            clearance_code: a.dccs_certificates?.[0]?.clearance_code ?? a.dccs_ownership_code ?? null,
            price: a.price,
            marketplace_status: a.marketplace_status,
            created_at: a.created_at,
            thumbnail_url: a.thumbnail_url,
          });
        });
      }

      // Search creators
      if (filter === 'all' || filter === 'creator') {
        const { data: creators } = await supabase
          .from('profiles')
          .select('id, name, email, bio, avatar_url, profile_slug, is_verified, headline, location')
          .or(`name.ilike.%${term}%,bio.ilike.%${term}%,headline.ilike.%${term}%`)
          .neq('role', 'admin')
          .limit(15);

        (creators ?? []).forEach((c: any) => {
          allResults.push({
            type: 'creator',
            id: c.id,
            name: c.name ?? c.email,
            email: c.email,
            bio: c.bio,
            avatar_url: c.avatar_url,
            profile_slug: c.profile_slug,
            is_verified: c.is_verified ?? false,
            headline: c.headline,
            location: c.location,
          });
        });
      }

      // Search DCCS certificates
      if (filter === 'all' || filter === 'certificate') {
        const { data: certs } = await supabase
          .from('dccs_certificates')
          .select('id, clearance_code, project_title, project_type, creator_legal_name, created_at, creator_verified')
          .or(`clearance_code.ilike.%${term}%,project_title.ilike.%${term}%`)
          .limit(15);

        (certs ?? []).forEach((c: any) => {
          allResults.push({
            type: 'certificate',
            id: c.id,
            clearance_code: c.clearance_code,
            project_title: c.project_title ?? 'Untitled',
            project_type: c.project_type ?? 'document',
            creator_name: c.creator_legal_name ?? 'Unknown',
            created_at: c.created_at,
            creator_verified: c.creator_verified ?? false,
          });
        });
      }

      setResults(allResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Sync URL params with search
  useEffect(() => {
    if (query.trim()) {
      setSearchParams({ q: query, type: filter }, { replace: true });
    }
  }, [query, filter, setSearchParams]);

  // Run search when filter changes (if there's already a query)
  useEffect(() => {
    if (query.trim()) runSearch(query);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-run on initial load if URL has query
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    inputRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const filteredResults = filter === 'all'
    ? results
    : results.filter((r) => r.type === filter);

  const counts = {
    all: results.length,
    asset: results.filter((r) => r.type === 'asset').length,
    creator: results.filter((r) => r.type === 'creator').length,
    certificate: results.filter((r) => r.type === 'certificate').length,
  };

  return (
    <>
      <SEOHead
        title="Search — DCCS Verify"
        description="Search creators, assets, and DCCS certificates across the global digital rights registry."
      />
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Search header */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-white text-center mb-2">Search DCCS Registry</h1>
            <p className="text-slate-400 text-center mb-8">Find verified creators, assets, and ownership records</p>

            <form onSubmit={handleSubmit} className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by creator name, asset title, or DCCS code…"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-12 pr-32 py-4 text-white text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                    className="text-slate-400 hover:text-white p-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filter tabs — only show after first search */}
          {searched && (
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTER_TABS.map((tab) => {
                const count = counts[tab.value];
                const active = filter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-400/30 text-white' : 'bg-slate-700 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          {/* Empty initial state */}
          {!loading && !searched && !error && (
            <div className="py-16">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-1">Start searching</p>
                <p className="text-slate-500 text-sm">Search for creators, registered works, or DCCS verification codes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: User,    label: 'Find Creators',   desc: 'Search by creator name or location' },
                  { icon: Shield,  label: 'Verify DCCS Code', desc: 'Look up a clearance code instantly'  },
                  { icon: ShoppingBag, label: 'Browse Assets', desc: 'Discover licensable creative works' },
                ].map((hint) => (
                  <div key={hint.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                    <hint.icon className="w-6 h-6 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-200 font-medium text-sm mb-1">{hint.label}</p>
                    <p className="text-slate-500 text-xs">{hint.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!loading && searched && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <SearchIcon className="w-10 h-10 text-slate-500 mb-4" />
              <p className="text-slate-300 font-semibold mb-1">No results for "{query}"</p>
              <p className="text-slate-500 text-sm text-center max-w-sm">
                Try different keywords, or check if the DCCS code is correct.
              </p>
              <div className="flex gap-2 mt-4">
                <Link to={ROUTES.MARKETPLACE} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Browse Marketplace
                </Link>
                <Link to={ROUTES.VERIFY_DCCS ?? '/verify'} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
                  Verify a Code
                </Link>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && filteredResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for <strong className="text-slate-200">"{query}"</strong>
              </p>

              {filteredResults.map((result) => {
                if (result.type === 'asset')       return <AssetCard       key={result.id} result={result} />;
                if (result.type === 'creator')     return <CreatorCard     key={result.id} result={result} />;
                if (result.type === 'certificate') return <CertificateCard key={result.id} result={result} />;
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Result Cards ─────────────────────────────────────────────────────── */
function AssetCard({ result }: { result: AssetResult }) {
  const Icon = CATEGORY_ICONS[result.category] ?? Package;
  return (
    <Link
      to={`${ROUTES.MARKETPLACE}?q=${encodeURIComponent(result.title)}`}
      className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
        {result.thumbnail_url ? (
          <img src={result.thumbnail_url} alt="" className="w-full h-full rounded-lg object-cover" />
        ) : (
          <Icon className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-200 truncate">{result.title}</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded capitalize">{result.category}</span>
          {result.marketplace_status === 'listed' && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" /> For License
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">by {result.creator_name}</p>
        {result.clearance_code && (
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 truncate">{result.clearance_code}</span>
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-3">
        {result.price != null && result.price > 0 && (
          <span className="text-sm font-bold text-white">{PLATFORM_INFO.DEFAULT_CURRENCY}{result.price.toFixed(2)}</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>
    </Link>
  );
}

function CreatorCard({ result }: { result: CreatorResult }) {
  const to = result.profile_slug ? `/artist/${result.profile_slug}` : '#';
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 hover:bg-slate-800/50 transition-all group"
    >
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
        {result.avatar_url
          ? <img src={result.avatar_url} alt={result.name} className="w-full h-full object-cover" />
          : <User className="w-5 h-5 text-slate-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{result.name}</span>
          {result.is_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">Creator</span>
        </div>
        {result.headline && <p className="text-xs text-slate-400 mt-0.5 truncate">{result.headline}</p>}
        {result.location && (
          <p className="text-xs text-slate-600 mt-0.5">{result.location}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
    </Link>
  );
}

function CertificateCard({ result }: { result: CertificateResult }) {
  return (
    <Link
      to={`/verify?code=${encodeURIComponent(result.clearance_code)}`}
      className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-700/50 hover:bg-slate-800/50 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Shield className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-200 truncate">{result.project_title}</span>
          {result.creator_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
          <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">Verified</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">by {result.creator_name}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs font-mono text-emerald-400">{result.clearance_code}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(result.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>
    </Link>
  );
}
