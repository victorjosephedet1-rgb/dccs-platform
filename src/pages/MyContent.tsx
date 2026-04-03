import React, { useState, useEffect } from 'react';
import { Plus, Filter, Grid3x3, List, Music, Video, Mic2, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import MediaGridShowcase from '../components/MediaGridShowcase';
import ProjectSubmissionForm from '../components/ProjectSubmissionForm';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: 'music' | 'video' | 'podcast' | 'image' | 'mixed';
  status: string;
  cover_image_url: string;
  created_at: string;
  metadata: any;
}

interface ContentStats {
  total_projects: number;
  total_uploads: number;
  total_plays: number;
  total_revenue: number;
}

export default function MyContent() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'music' | 'video' | 'podcast' | 'image'>('all');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      if (projectsData) setProjects(projectsData);

      const { data: uploadsData } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id);

      const totalUploads = uploadsData?.length || 0;

      setStats({
        total_projects: projectsData?.length || 0,
        total_uploads: totalUploads,
        total_plays: 0,
        total_revenue: 0
      });

    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p =>
    filterType === 'all' || p.project_type === filterType
  );

  const mediaItems = filteredProjects.map(project => ({
    id: project.id,
    title: project.title,
    subtitle: project.description || `${project.project_type} project`,
    coverUrl: project.cover_image_url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: project.project_type as any,
    metadata: {
      date: new Date(project.created_at).toLocaleDateString(),
      plays: 0,
    },
    onClick: () => navigate(`/project/${project.id}`)
  }));

  const filterOptions = [
    { value: 'all', label: 'All Content', icon: Filter },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'podcast', label: 'Podcasts', icon: Mic2 },
    { value: 'image', label: 'Gallery', icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Content</h1>
            <p className="text-slate-400">Manage all your uploads and projects</p>
          </div>

          <button
            onClick={() => setShowSubmissionForm(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Music className="h-8 w-8 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total_projects}</div>
              <div className="text-sm text-slate-400">Projects</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Video className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total_uploads}</div>
              <div className="text-sm text-slate-400">Files Uploaded</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.total_plays.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Total Plays</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">£</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                £{stats.total_revenue.toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Total Revenue</div>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = filterType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No content yet</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start uploading your music, videos, podcasts, or images to share with the world
            </p>
            <button
              onClick={() => setShowSubmissionForm(true)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <MediaGridShowcase
            items={mediaItems}
            columns={viewMode === 'grid' ? 4 : 2}
            showMetadata={true}
          />
        )}
      </div>

      {showSubmissionForm && (
        <ProjectSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false);
            loadContent();
          }}
        />
      )}
    </div>
  );
}
