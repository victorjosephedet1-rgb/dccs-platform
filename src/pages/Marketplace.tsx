import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Music, Video, FileText, Image, Mic, Code, Package,
  ShieldCheck, Star, Download, Tag, ChevronDown, X, Eye, Globe,
  CheckCircle, Lock, Loader2, AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PLATFORM_INFO } from '../utils/routes';
import SEOHead from '../components/SEOHead';
import LicensePurchaseModal from '../components/LicensePurchaseModal';

interface MarketplaceListing {
  upload_id: string;
  creator_id: string;
  file_name: string;
  file_category: string;
  description: string | null;
  price: number | null;
  marketplace_status: string;
  download_count: number | null;
  listed_at: string;
  thumbnail_url: string | null;
  clearance_code: string | null;
  project_title: string | null;
  project_type: string | null;
  creator_verified: boolean | null;
  creator_name: string | null;
  creator_avatar: string | null;
  creator_platform_verified: boolean | null;
  creator_slug: string | null;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  all:       { label: 'All Works',     icon: Globe,    color: 'text-slate-400' },
  audio:     { label: 'Music & Audio', icon: Music,    color: 'text-blue-400' },
  video:     { label: 'Video & Film',  icon: Video,    color: 'text-purple-400' },
  image:     { label: 'Art & Images',  icon: Image,    color: 'text-emerald-400' },
  document:  { label: 'Documents',     icon: FileText, color: 'text-amber-400' },
  podcast:   { label: 'Podcasts',      icon: Mic,      color: 'text-rose-400' },
  software:  { label: 'Software',      icon: Code,     color: 'text-cyan-400' },
  other:     { label: 'Other',         icon: Package,  color: 'text-slate-400' },
};

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular',  label: 'Most Downloaded' },
];

const LICENSE_TYPES = [
  { value: 'all',          label: 'All Licenses' },
  { value: 'personal',     label: 'Personal' },
  { value: 'commercial',   label: 'Commercial' },
  { value: 'exclusive',    label: 'Exclusive' },
  { value: 'educational',  label: 'Educational' },
];

export default function Marketplace() {
  const { user } = useAuth();

  const [listings, setListings]             = useState<MarketplaceListing[]>([]);
  const [filtered, setFiltered]             = useState<MarketplaceListing[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setCategory]     = useState('all');
  const [sortBy, setSortBy]                 = useState('newest');
  const [licenseFilter, setLicenseFilter]   = useState('all');
  const [showFilters, setShowFilters]       = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('marketplace_listings')
        .select('*');

      if (dbErr) throw dbErr;
      setListings(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load marketplace';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  useEffect(() => {
    let result = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.project_title?.toLowerCase().includes(q) ||
          l.file_name.toLowerCase().includes(q) ||
          l.creator_name?.toLowerCase().includes(q) ||
          l.clearance_code?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.file_category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest')     return new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime();
      if (sortBy === 'oldest')     return new Date(a.listed_at).getTime() - new Date(b.listed_at).getTime();
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'popular')    return (b.download_count ?? 0) - (a.download_count ?? 0);
      return 0;
    });

    setFiltered(result);
  }, [listings, searchQuery, selectedCategory, sortBy, licenseFilter]);

  const formatPrice = (price: number | null) =>
    price == null || price === 0
      ? 'Free'
      : `${PLATFORM_INFO.DEFAULT_CURRENCY}${price.toFixed(2)}`;

  return (
    <>
      <SEOHead
        title="Marketplace — DCCS Verify"
        description="License verified creative works from creators worldwide. Every asset is DCCS-certified with tamper-evident ownership proof."
      />

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                All works DCCS-verified
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                License Verified Creative Works
              </h1>
              <p className="text-lg text-slate-400 mb-8">
                Every asset carries a DCCS clearance code — tamper-evident proof of origin, timestamp, and ownership. License with confidence.
              </p>

              {/* Search */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, creator, DCCS code…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 flex-1">
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = selectedCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Sort + Filter Controls */}
            <div className="flex gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  showFilters
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">License Type</label>
                  <div className="flex flex-wrap gap-2">
                    {LICENSE_TYPES.map((lt) => (
                      <button
                        key={lt.value}
                        onClick={() => setLicenseFilter(lt.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          licenseFilter === lt.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              {loading ? 'Loading…' : `${filtered.length} work${filtered.length !== 1 ? 's' : ''} available`}
            </p>
            {!user && (
              <p className="text-slate-500 text-sm">
                <Link to="/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Sign in</Link> to purchase licenses
              </p>
            )}
          </div>

          {/* States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-slate-400">Loading marketplace…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-slate-300 font-medium">Could not load marketplace</p>
              <p className="text-slate-500 text-sm">{error}</p>
              <button
                onClick={fetchListings}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-semibold text-lg">No works found</p>
              <p className="text-slate-500 text-sm text-center max-w-sm">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'No works are listed in this category yet. Check back soon.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCategory('all'); }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.upload_id}
                  listing={listing}
                  onPurchase={() => setSelectedListing(listing)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <LicensePurchaseModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={() => {
            setSelectedListing(null);
            fetchListings();
          }}
        />
      )}
    </>
  );
}

function ListingCard({
  listing,
  onPurchase,
  currentUserId,
}: {
  listing: MarketplaceListing;
  onPurchase: () => void;
  currentUserId: string | undefined;
}) {
  const cfg = CATEGORY_CONFIG[listing.file_category] ?? CATEGORY_CONFIG.other;
  const Icon = cfg.icon;
  const isOwner = currentUserId === listing.creator_id;
  const title = listing.project_title ?? listing.file_name;

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-slate-800 overflow-hidden">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${cfg.color}`}>
            <Icon className="w-12 h-12 opacity-30" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-xs font-medium ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>
        {/* Verified badge */}
        {(listing.creator_verified || listing.creator_platform_verified) && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-5 h-5 text-blue-400 drop-shadow" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 mb-1" title={title}>
          {title}
        </h3>

        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-3">
          {listing.creator_avatar ? (
            <img src={listing.creator_avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-700" />
          )}
          <span className="text-xs text-slate-400 truncate">
            {listing.creator_name ?? 'Unknown Creator'}
          </span>
          {listing.creator_platform_verified && (
            <Star className="w-3 h-3 text-amber-400 shrink-0" />
          )}
        </div>

        {/* DCCS Code */}
        {listing.clearance_code && (
          <div className="flex items-center gap-1 mb-3 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-slate-300 truncate">{listing.clearance_code}</span>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{listing.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white">
              {listing.price == null || listing.price === 0
                ? 'Free'
                : `${PLATFORM_INFO.DEFAULT_CURRENCY}${listing.price.toFixed(2)}`}
            </span>
            {listing.download_count != null && listing.download_count > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <Download className="w-3 h-3" />
                {listing.download_count}
              </span>
            )}
          </div>

          {isOwner ? (
            <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded-md flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Yours
            </span>
          ) : (
            <button
              onClick={onPurchase}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Tag className="w-3 h-3" />
              License
            </button>
          )}
        </div>

        {/* View creator link */}
        {listing.creator_slug && (
          <Link
            to={`/artist/${listing.creator_slug}`}
            className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit"
          >
            <Eye className="w-3 h-3" />
            View creator
          </Link>
        )}
      </div>
    </div>
  );
}
