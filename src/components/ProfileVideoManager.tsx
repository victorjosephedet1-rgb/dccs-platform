import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Star, Video, Loader, AlertCircle, ExternalLink } from 'lucide-react';

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

interface ProfileVideoManagerProps {
  profileId: string;
}

const VIDEO_TYPES = [
  { value: 'music_video', label: 'Music Video' },
  { value: 'behind_scenes', label: 'Behind the Scenes' },
  { value: 'vlog', label: 'Video Blog' },
  { value: 'teaser', label: 'Teaser/Preview' },
  { value: 'performance', label: 'Live Performance' },
  { value: 'other', label: 'Other' }
];

export default function ProfileVideoManager({ profileId }: ProfileVideoManagerProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const [newVideo, setNewVideo] = useState({
    video_url: '',
    title: '',
    description: '',
    video_type: 'vlog'
  });

  useEffect(() => {
    loadVideos();
  }, [profileId]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_videos')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err: Record<string, unknown>) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');

      if (!newVideo.video_url || !newVideo.title) {
        setError('Please provide video URL and title');
        return;
      }

      const videoInfo = extractVideoId(newVideo.video_url);
      let thumbnailUrl = '';

      if (videoInfo?.platform === 'youtube') {
        thumbnailUrl = `https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`;
      }

      const { error: insertError } = await supabase
        .from('profile_videos')
        .insert({
          profile_id: profileId,
          video_url: newVideo.video_url,
          thumbnail_url: thumbnailUrl,
          title: newVideo.title,
          description: newVideo.description,
          video_type: newVideo.video_type
        });

      if (insertError) throw insertError;

      setNewVideo({ video_url: '', title: '', description: '', video_type: 'vlog' });
      setShowAddForm(false);
      await loadVideos();
    } catch (err: Record<string, unknown>) {
      setError(err.message);
    }
  };

  const updateVideo = async (id: string, updates: Partial<VideoItem>) => {
    try {
      const { error } = await supabase
        .from('profile_videos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadVideos();
    } catch (err: Record<string, unknown>) {
      setError(err.message);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profile_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadVideos();
    } catch (err: Record<string, unknown>) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Video Manager</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? 'Cancel' : 'Add Video'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddVideo} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (YouTube or Vimeo)
            </label>
            <input
              type="url"
              value={newVideo.video_url}
              onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              placeholder="Video title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newVideo.description}
              onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              placeholder="Tell your fans about this video"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
            <select
              value={newVideo.video_type}
              onChange={(e) => setNewVideo({ ...newVideo, video_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {VIDEO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Add Video
          </button>
        </form>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No videos added yet</p>
          <p className="text-sm text-gray-500 mt-1">Share your music videos, vlogs, and more</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => {
            const videoInfo = extractVideoId(video.video_url);
            return (
              <div key={video.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-video relative bg-gray-100">
                  {videoInfo?.platform === 'youtube' && (
                    <img
                      src={`https://img.youtube.com/vi/${videoInfo.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {videoInfo?.platform === 'vimeo' && video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateVideo(video.id, { is_featured: !video.is_featured })}
                      className={`p-2 rounded-lg transition ${
                        video.is_featured
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-yellow-50'
                      }`}
                      title={video.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className="w-5 h-5" fill={video.is_featured ? 'currentColor' : 'none'} />
                    </button>
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      title="Open video"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{video.title}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {VIDEO_TYPES.find(t => t.value === video.video_type)?.label}
                    </span>
                  </div>
                  {video.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    {video.view_count.toLocaleString()} views
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
