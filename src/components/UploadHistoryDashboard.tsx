import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  Video,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  TrendingUp,
  HardDrive,
} from 'lucide-react';
import { uploadManager } from '../lib/uploadManager';
import { formatFileSize } from '../lib/fileValidator';
import { supabase } from '../lib/supabase';

interface Upload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_category: 'audio' | 'video' | 'image' | 'document';
  upload_status: 'uploading' | 'processing' | 'completed' | 'failed';
  processing_progress: number;
  error_message?: string;
  created_at: string;
  duration?: number;
  dccs_certificates?: {
    id: string;
    certificate_id: string;
    clearance_code: string;
    audio_fingerprint: string;
    public_verification_url: string;
    licensing_status: string;
    lifetime_tracking_enabled: boolean;
  };
}

interface UploadStats {
  total_uploads: number;
  total_size: number;
  completed_uploads: number;
  failed_uploads: number;
  audio_files: number;
  video_files: number;
  image_files: number;
  total_projects: number;
}

export default function UploadHistoryDashboard() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uploadsData, statsData] = await Promise.all([
        uploadManager.getUserUploads(),
        uploadManager.getUploadStats(),
      ]);
      setUploads(uploadsData as any);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (upload: Upload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login to download files');
        return;
      }

      const bucketName = 'user-uploads';

      const { data: uploadRecord } = await supabase
        .from('uploads')
        .select('storage_path')
        .eq('id', upload.id)
        .single();

      if (!uploadRecord?.storage_path) {
        alert('File not found');
        return;
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(uploadRecord.storage_path);

      if (error) throw error;

      const dccsCode = upload.dccs_certificates?.clearance_code ||
                       upload.dccs_certificates?.certificate_id ||
                       'NO-DCCS-CODE';

      const fileName = upload.file_name.includes(dccsCode)
        ? upload.file_name
        : `${upload.file_name.split('.')[0]}_DCCS-${dccsCode}.${upload.file_name.split('.').pop()}`;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      await uploadManager.deleteUpload(uploadId);
      await loadData();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete upload');
    }
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'audio':
        return <Music className="h-5 w-5 text-purple-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-400" />;
      default:
        return <File className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full text-xs text-green-400">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-full text-xs text-yellow-400">
            <Clock className="h-3 w-3" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-full text-xs text-blue-400">
            <Clock className="h-3 w-3" />
            <span>Uploading</span>
          </span>
        );
    }
  };

  const filteredUploads = uploads.filter(upload => {
    if (filter === 'all') return true;
    if (filter === 'completed') return upload.upload_status === 'completed';
    if (filter === 'failed') return upload.upload_status === 'failed';
    return upload.file_category === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Instructions Banner */}
      <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/40 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              Download Your Files with DCCS Protection
            </h3>
            <p className="text-slate-300 mb-3">
              All completed uploads include a unique DCCS tracking code embedded in the filename.
              This code travels with your content globally, enabling automatic royalty collection (80% to you, 20% to platform)
              wherever your work is used.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Filename includes DCCS code</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Lifetime tracking enabled</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Instant royalty payouts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{stats.total_uploads}</span>
            </div>
            <p className="text-sm text-slate-300">Total Uploads</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.completed_uploads} completed • {stats.failed_uploads} failed
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{formatFileSize(stats.total_size)}</span>
            </div>
            <p className="text-sm text-slate-300">Storage Used</p>
            <p className="text-xs text-slate-400 mt-1">
              Across {stats.total_projects} projects
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Music className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.audio_files}</span>
            </div>
            <p className="text-sm text-slate-300">Audio Files</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.video_files} videos • {stats.image_files} images
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">{stats.completed_uploads}</span>
            </div>
            <p className="text-sm text-slate-300">DCCS Protected</p>
            <p className="text-xs text-slate-400 mt-1">
              Blockchain verified
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Files' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
            { value: 'audio', label: 'Audio' },
            { value: 'video', label: 'Video' },
            { value: 'image', label: 'Images' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Uploads List */}
      {filteredUploads.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <File className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No uploads found</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl divide-y divide-slate-700">
          {filteredUploads.map(upload => (
            <div key={upload.id} className="p-4 hover:bg-slate-800/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(upload.file_category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-white truncate">
                        {upload.file_name}
                      </h4>
                      {getStatusBadge(upload.upload_status)}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 mb-2">
                      <span>{formatFileSize(upload.file_size)}</span>
                      {upload.duration && <span>{Math.floor(upload.duration / 60)}:{(upload.duration % 60).toString().padStart(2, '0')}</span>}
                      <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* DCCS Tracking Code - Prominent Display */}
                    {upload.dccs_certificates && (
                      <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-3 mt-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Shield className="h-4 w-4 text-green-400" />
                              <span className="text-xs font-semibold text-green-400">DCCS TRACKING CODE</span>
                              <span className="text-xs text-cyan-400">• Travels with content globally</span>
                            </div>
                            <div className="font-mono text-sm text-white font-bold mb-1">
                              {upload.dccs_certificates.clearance_code || upload.dccs_certificates.certificate_id}
                            </div>
                            <p className="text-xs text-slate-400">
                              Downloads include this code in the filename. Re-download anytime with the same DCCS code.
                            </p>
                          </div>
                          {upload.dccs_certificates.public_verification_url && (
                            <Link
                              to={upload.dccs_certificates.public_verification_url}
                              className="ml-3 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-xs text-green-400 font-medium transition-colors flex items-center space-x-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Verify</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {upload.error_message && (
                      <p className="text-xs text-red-400 mt-1">{upload.error_message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {upload.upload_status === 'completed' && (
                    <button
                      onClick={() => handleDownload(upload)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 rounded-lg text-sm text-white font-bold transition-all shadow-lg hover:shadow-green-500/50 flex items-center space-x-2"
                      title="Download with unique DCCS code in filename"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download with DCCS</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
