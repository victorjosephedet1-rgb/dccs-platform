import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, MapPin, Calendar, ExternalLink, Play, Eye, DollarSign, Users, Image as ImageIcon, Video, TrendingUp } from 'lucide-react';
import AudioPlayer from '../components/AudioPlayer';
import LazyImage from '../components/LazyImage';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar_url: string;
  profile_slug: string;
  headline: string;
  location: string;
  is_profile_public: boolean;
}

interface ProfileStats {
  total_tracks: number;
  total_licenses: number;
  total_plays: number;
  total_revenue: number;
  total_supporters: number;
  top_genre: string;
  total_gallery_items: number;
  total_videos: number;
  profile_views: number;
}

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
     
  description: string;
  is_featured: boolean;
}

interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  description: string;
  video_type: string;
  view_count: number;
  is_featured: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_verified: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  price: number;
  audio_url: string;
  play_count: number;
  license_count: number;
  is_featured: boolean;
}

export default function ArtistProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'music' | 'gallery' | 'videos' | 'about'>('music');

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_slug', slug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        navigate('/');
        return;
      }

      if (!profileData.is_profile_public) {
        navigate('/');
        return;
      }

      setProfile(profileData);

      const [statsRes, galleryRes, videosRes, socialRes, tracksRes] = await Promise.all([
        supabase.from('profile_stats').select('*').eq('profile_id', profileData.id).maybeSingle(),
        supabase.from('profile_galleries').select('*').eq('profile_id', profileData.id).order('display_order', { ascending: true }),
        supabase.from('profile_videos').select('*').eq('profile_id', profileData.id).order('created_at', { ascending: false }),
        supabase.from('profile_social_links').select('*').eq('profile_id', profileData.id).order('display_order', { ascending: true }),
        supabase.from('audio_snippets').select('*').eq('artist_id', profileData.id).order('created_at', { ascending: false })
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (videosRes.data) setVideos(videosRes.data);
      if (socialRes.data) setSocialLinks(socialRes.data);
      if (tracksRes.data) setTracks(tracksRes.data);

      await supabase.rpc('increment', {
        table_name: 'profiles',
        row_id: profileData.id,
        column_name: 'profile_views'
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    return <ExternalLink className="w-5 h-5" />;
  };

  const extractVideoId = (url: string): { platform: string; id: string } | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      return match ? { platform: 'youtube', id: match[1] } : null;
    }
    if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? { platform: 'vimeo', id: match[1] } : null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
              <div className="relative">
                {profile.avatar_url ? (
                  <LazyImage
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Music className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                {profile.headline && (
                  <p className="text-lg text-gray-600 mt-1">{profile.headline}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                      title={link.platform}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Music className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_tracks}</div>
              <div className="text-sm text-gray-600">Tracks</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_plays.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Plays</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_licenses}</div>
              <div className="text-sm text-gray-600">Licenses</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_supporters}</div>
              <div className="text-sm text-gray-600">Supporters</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-pink-600 mb-1">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_gallery_items}</div>
              <div className="text-sm text-gray-600">Photos</div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Video className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_videos}</div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              {['music', 'gallery', 'videos', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'music' && (
              <div className="space-y-4">
                {tracks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tracks available yet</p>
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div key={track.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <AudioPlayer
                        title={track.title}
                        artist={track.artist}
                        audioUrl={track.audio_url}
                        price={track.price}
                        genre={track.genre}
                        onPurchase={() => navigate(`/marketplace`)}
                      />
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {track.play_count} plays
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {track.license_count} licenses
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No gallery items yet</p>
                  </div>
                ) : (
                  gallery.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg">
                      <LazyImage
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      {item.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                          <div>
                            <h3 className="text-white font-semibold">{item.title}</h3>
                            {item.description && (
                              <p className="text-white/80 text-sm mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No videos yet</p>
                  </div>
                ) : (
                  videos.map((video) => {
                    const videoInfo = extractVideoId(video.video_url);
                    return (
                      <div key={video.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-md">
                        {videoInfo?.platform === 'youtube' && (
                          <iframe
                            className="w-full aspect-video"
                            src={`https://www.youtube.com/embed/${videoInfo.id}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                        {videoInfo?.platform === 'vimeo' && (
                          <iframe
                            className="w-full aspect-video"
                            src={`https://player.vimeo.com/video/${videoInfo.id}`}
                            title={video.title}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                        {!videoInfo && video.thumbnail_url && (
                          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                            <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Watch Video
                            </a>
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-gray-600 mt-2">{video.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <Eye className="w-4 h-4" />
                            {video.view_count.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="prose max-w-none">
                {profile.bio ? (
                  <div className="text-gray-700 whitespace-pre-wrap">{profile.bio}</div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No bio available yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
