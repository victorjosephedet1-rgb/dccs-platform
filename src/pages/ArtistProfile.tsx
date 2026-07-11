import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Music, MapPin, ExternalLink, Shield, CheckCircle, ShoppingBag,
  Package, FileText, Video, Image, Mic, Code, Tag, Loader2,
  Globe, Twitter, Instagram, Youtube, Github, Linkedin,
  Play, Eye, Clock, ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLATFORM_INFO } from '../utils/routes';
import SEOHead from '../components/SEOHead';

interface Profile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  profile_slug: string | null;
  is_verified: boolean;
  is_profile_public: boolean;
  headline: string | null;
  location: string | null;
  website_url: string | null;
  created_at: string;
  role: string;
}

interface Upload {
  id: string;
  file_name: string;
  file_category: string;
  description: string | null;
  thumbnail_url: string | null;
  dccs_ownership_code: string | null;
  upload_status: string;
  marketplace_status: string | null;
  price: number | null;
  created_at: string;
  dccs_certificates: Array<{ clearance_code: string }> | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  audio: Music, video: Video, image: Image, document: FileText,
  podcast: Mic, software: Code, other: Package,
};

const CATEGORY_COLORS: Record<string, string> = {
  audio: 'text-blue-400', video: 'text-purple-400', image: 'text-emerald-400',
  document: 'text-amber-400', podcast: 'text-rose-400', software: 'text-cyan-400',
  other: 'text-slate-400',
};

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  twitter: Twitter, instagram: Instagram, youtube: Youtube,
  github: Github, linkedin: Linkedin,
};

export default function ArtistProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'works' | 'about'>('works');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!slug) { navigate('/'); return; }
    loadProfile();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfile = async () => {
    if (!slug) return;
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, bio, avatar_url, profile_slug, is_verified, is_profile_public, headline, location, website_url, created_at, role')
        .eq('profile_slug', slug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData || !profileData.is_profile_public) {
        navigate('/');
        return;
      }

      setProfile(profileData);

      const [uploadsRes, socialRes] = await Promise.all([
        supabase
          .from('uploads')
          .select('id, file_name, file_category, description, thumbnail_url, dccs_ownership_code, upload_status, marketplace_status, price, created_at, dccs_certificates(clearance_code)')
          .eq('user_id', profileData.id)
          .eq('is_archived', false)
          .eq('upload_status', 'completed')
          .order('created_at', { ascending: false }),
        supabase
          .from('profile_social_links')
          .select('id, platform, url')
          .eq('profile_id', profileData.id)
          .order('display_order', { ascending: true }),
      ]);

      if (uploadsRes.data) setUploads(uploadsRes.data as Upload[]);
      if (socialRes.data) setSocialLinks(socialRes.data);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const categories = ['all', ...Array.from(new Set(uploads.map((u) => u.file_category)))];
  const filteredUploads = categoryFilter === 'all'
    ? uploads
    : uploads.filter((u) => u.file_category === categoryFilter);

  const listedWorks = uploads.filter((u) => u.marketplace_status === 'listed');
  const dccsWorks = uploads.filter((u) => u.dccs_certificates && u.dccs_certificates.length > 0);

  return (
    <>
      <SEOHead
        title={`${profile.name} — DCCS Verify`}
        description={profile.bio ?? `View ${profile.name}'s verified creative portfolio on DCCS Verify.`}
      />
      <div className="min-h-screen bg-slate-950 text-white">

        {/* Cover + Avatar */}
        <div className="relative h-52 sm:h-64 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 70% 50%, #06b6d4 0%, transparent 60%)' }}
          />
          <div className="absolute inset-0 border-b border-slate-800" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile header */}
          <div className="relative -mt-16 sm:-mt-20 pb-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-slate-950 overflow-hidden bg-slate-800 shadow-xl">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                </div>
                {profile.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 mt-2 sm:mt-0 sm:mb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.name}</h1>
                  {profile.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {dccsWorks.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                      <Shield className="w-3 h-3" /> DCCS Protected
                    </span>
                  )}
                </div>
                {profile.headline && (
                  <p className="text-slate-300 text-sm sm:text-base mb-2">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Globe className="w-3 h-3" /> Website
                    </a>
                  )}
                </div>
              </div>

              {/* Social links + actions */}
              <div className="flex items-center gap-2 shrink-0">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] ?? ExternalLink;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title={link.platform}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
                {listedWorks.length > 0 && (
                  <Link
                    to={`/marketplace`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    License Works
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800">
            {[
              { label: 'Works', value: uploads.length },
              { label: 'DCCS Certified', value: dccsWorks.length },
              { label: 'For License', value: listedWorks.length },
              ...(profile.location ? [] : []),
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-950 py-4 text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-800 py-2">
            {([['works', 'Works'], ['about', 'About']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === val
                    ? 'bg-white/8 text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="py-8">
            {activeTab === 'works' && (
              <div>
                {/* Category filter pills */}
                {categories.length > 2 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat] ?? Package;
                      const color = CATEGORY_COLORS[cat] ?? 'text-slate-400';
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                            categoryFilter === cat
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {cat !== 'all' && <Icon className={`w-3.5 h-3.5 ${categoryFilter === cat ? 'text-white' : color}`} />}
                          {cat === 'all' ? 'All Works' : cat}
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredUploads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Package className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">No works yet</p>
                    <p className="text-slate-600 text-sm mt-1">This creator hasn't published any works in this category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUploads.map((upload) => (
                      <WorkCard key={upload.id} upload={upload} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-2xl">
                {profile.bio ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Eye className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-slate-500 text-sm">No bio yet.</p>
                  </div>
                )}

                {dccsWorks.length > 0 && (
                  <div className="mt-8 p-5 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-slate-200">DCCS Ownership</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      {dccsWorks.length} of this creator's works are registered with the Digital Creative Copyright System, providing tamper-evident proof of ownership and timestamp.
                    </p>
                    <Link
                      to="/verify"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      Verify a DCCS code <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function WorkCard({ upload }: { upload: Upload }) {
  const Icon = CATEGORY_ICONS[upload.file_category] ?? Package;
  const color = CATEGORY_COLORS[upload.file_category] ?? 'text-slate-400';
  const clearanceCode = upload.dccs_certificates?.[0]?.clearance_code ?? upload.dccs_ownership_code;

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 hover:shadow-xl hover:shadow-black/40 transition-all duration-200">
      {/* Thumbnail */}
      <div className={`relative aspect-[4/3] bg-slate-800 overflow-hidden`}>
        {upload.thumbnail_url ? (
          <img
            src={upload.thumbnail_url}
            alt={upload.file_name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${color}`}>
            <Icon className="w-12 h-12 opacity-25" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-xs font-medium capitalize ${color}`}>
            <Icon className="w-3 h-3" />
            {upload.file_category}
          </span>
        </div>
        {upload.marketplace_status === 'listed' && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 backdrop-blur rounded-md text-xs font-medium text-amber-400">
              <Tag className="w-2.5 h-2.5" /> For License
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1" title={upload.file_name}>
          {upload.file_name}
        </h3>

        {upload.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{upload.description}</p>
        )}

        {clearanceCode && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-md border border-slate-700 mb-3">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-slate-300 truncate">{clearanceCode}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          {upload.price != null && upload.price > 0 ? (
            <span className="text-sm font-bold text-white">{PLATFORM_INFO.DEFAULT_CURRENCY}{upload.price.toFixed(2)}</span>
          ) : upload.marketplace_status === 'listed' ? (
            <span className="text-sm font-bold text-emerald-400">Free</span>
          ) : (
            <span className="text-xs text-slate-600">Private</span>
          )}

          {clearanceCode && (
            <Link
              to={`/verify?code=${encodeURIComponent(clearanceCode)}`}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Play className="w-3 h-3" />
              Verify
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
