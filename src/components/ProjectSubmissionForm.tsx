import React, { useState } from 'react';
import { Music, Video, Mic2, Image as ImageIcon, Folder, X, CheckCircle, AlertCircle } from 'lucide-react';
import ProjectCoverUpload from './ProjectCoverUpload';
import ComprehensiveUploader from './ComprehensiveUploader';
import { supabase } from '../lib/supabase';
import { UploadProgress } from '../lib/uploadManager';

interface ProjectSubmissionFormProps {
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export default function ProjectSubmissionForm({ onClose, onSuccess }: ProjectSubmissionFormProps) {
  const [step, setStep] = useState<'details' | 'cover' | 'files'>('details');
  const [projectType, setProjectType] = useState<'music' | 'video' | 'podcast' | 'image'>('music');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const projectTypes = [
    {
      value: 'music',
      label: 'Music',
      icon: Music,
      description: 'Albums, singles, or tracks',
      color: 'text-cyan-400'
    },
    {
      value: 'video',
      label: 'Video',
      icon: Video,
      description: 'Music videos or visual content',
      color: 'text-red-400'
    },
    {
      value: 'podcast',
      label: 'Podcast',
      icon: Mic2,
      description: 'Episodes or series',
      color: 'text-purple-400'
    },
    {
      value: 'image',
      label: 'Gallery',
      icon: ImageIcon,
      description: 'Photo collections',
      color: 'text-green-400'
    },
  ];

  const createProject = async () => {
    if (!title.trim()) {
      setError('Please enter a project title');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          project_type: projectType,
          status: 'draft',
          cover_image_url: coverUrl || null,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!data) throw new Error('Failed to create project');

      setProjectId(data.id);
      setStep('files');
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadComplete = async (uploads: UploadProgress[]) => {
    const completedUploads = uploads.filter(u => u.status === 'completed');

    if (completedUploads.length > 0) {
      try {
        await supabase
          .from('projects')
          .update({ status: 'published' })
          .eq('id', projectId);

        setUploadComplete(true);
        setTimeout(() => {
          if (onSuccess) onSuccess(projectId);
          onClose();
        }, 2000);
      } catch (err) {
        console.error('Failed to update project:', err);
      }
    }
  };

  const handleNext = () => {
    if (step === 'details') {
      if (!title.trim()) {
        setError('Please enter a project title');
        return;
      }
      setStep('cover');
    } else if (step === 'cover') {
      createProject();
    }
  };

  const getAcceptedTypes = () => {
    switch (projectType) {
      case 'music': return 'audio/*';
      case 'video': return 'video/*';
      case 'podcast': return 'audio/*';
      case 'image': return 'image/*';
      default: return 'audio/*,video/*,image/*';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Submit New Project</h2>
            <p className="text-sm text-slate-400 mt-1">
              {step === 'details' && 'Project details and type'}
              {step === 'cover' && 'Add a cover image'}
              {step === 'files' && 'Upload your files'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {uploadComplete && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-sm text-green-300 font-medium">
                Project published successfully!
              </p>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Project Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {projectTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = projectType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setProjectType(type.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-cyan-400' : type.color}`} />
                          <div>
                            <div className="font-semibold text-white">{type.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Enter ${projectType} title...`}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your project..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {step === 'cover' && (
            <div className="space-y-6">
              <ProjectCoverUpload
                onCoverSelected={(url) => setCoverUrl(url)}
                projectType={projectType}
              />
              <p className="text-sm text-slate-400">
                A great cover image helps your project stand out. You can skip this step and add one later.
              </p>
            </div>
          )}

          {step === 'files' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Folder className="h-6 w-6 text-cyan-400" />
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-sm text-slate-400 capitalize">{projectType} project</p>
                  </div>
                </div>
                {coverUrl && (
                  <img src={coverUrl} alt="Cover" className="w-24 h-24 rounded-lg object-cover" />
                )}
              </div>

              <ComprehensiveUploader
                projectId={projectId}
                acceptedTypes={getAcceptedTypes()}
                maxFiles={20}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['details', 'cover', 'files'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  step === s ? 'bg-cyan-400' : i < ['details', 'cover', 'files'].indexOf(step) ? 'bg-cyan-600' : 'bg-slate-700'
                }`} />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {step !== 'details' && step !== 'files' && (
              <button
                onClick={() => setStep(step === 'cover' ? 'details' : 'cover')}
                className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                Back
              </button>
            )}

            {step === 'files' ? (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                Done
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={uploading || (step === 'details' && !title.trim())}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    {step === 'cover' ? 'Create & Upload Files' : 'Next'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
