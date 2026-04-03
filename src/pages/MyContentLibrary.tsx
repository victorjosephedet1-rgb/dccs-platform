import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Shield, Copy, CheckCircle, ExternalLink, Play, FileAudio,
  FileVideo, FileImage, File, Music, Video, Image as ImageIcon, Fingerprint,
  Calendar, HardDrive, Search, Filter, Grid3x3, List, Upload, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import { formatFileSize } from '../lib/fileValidator';

interface Upload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_category: string;
  file_url: string;
  upload_status: string;
  created_at: string;
  dccs_certificates?: {
    id: string;
    fingerprint: string;
    certificate_code: string;
    issue_date: string;
    verification_url: string;
  }[];
}

interface Stats {
  total_uploads: number;
  total_dccs_codes: number;
  total_storage_used: number;
  protected_content: number;
}

export default function MyContentLibrary() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_uploads: 0,
    total_dccs_codes: 0,
    total_storage_used: 0,
    protected_content: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<'all' | 'audio' | 'video' | 'image' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadContent();
    }
  }, [user]);

  const loadContent = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select(`
          *,
          dccs_certificates (
            id,
            fingerprint,
            certificate_code,
            issue_date,
            verification_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (uploadsError) throw uploadsError;

      if (uploadsData) {
        setUploads(uploadsData);

        const totalStorage = uploadsData.reduce((sum, upload) => sum + (upload.file_size || 0), 0);
        const protectedCount = uploadsData.filter(u => u.dccs_certificates && u.dccs_certificates.length > 0).length;
        const totalCodes = uploadsData.reduce((sum, u) => sum + (u.dccs_certificates?.length || 0), 0);

        setStats({
          total_uploads: uploadsData.length,
          total_dccs_codes: totalCodes,
          total_storage_used: totalStorage,
          protected_content: protectedCount
        });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      addNotification('error', 'Failed to load your content library');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (upload: Upload) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .download(upload.file_url.replace('/storage/v1/object/public/user-uploads/', ''));

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification('success', `Downloaded: ${upload.file_name}`);
    } catch (error) {
      console.error('Download error:', error);
      addNotification('error', 'Failed to download file');
    }
  };

  const copyDCCSCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addNotification('success', `DCCS Code copied: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'audio': return FileAudio;
      case 'video': return FileVideo;
      case 'image': return FileImage;
      default: return File;
    }
  };

  const getFileColor = (category: string) => {
    return '#FF5A1F';
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesCategory = filterCategory === 'all' || upload.file_category === filterCategory;
    const matchesSearch = upload.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F17' }}>
        <div className="text-white text-xl">Loading your content library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#0B0F17' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Content Library</h1>
            <p className="text-slate-300">All your uploaded content with DCCS protection codes</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:opacity-90"
            style={{ background: '#FF5A1F' }}
          >
            <Upload className="h-5 w-5" />
            <span>Upload New</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <Upload className="h-8 w-8" style={{ color: '#FF5A1F' }} />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.total_uploads}</div>
            <div className="text-sm text-slate-400">Total Uploads</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <Fingerprint className="h-8 w-8" style={{ color: '#FF5A1F' }} />
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.total_dccs_codes}</div>
            <div className="text-sm text-slate-400">DCCS Codes Issued</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-8 w-8" style={{ color: '#FF5A1F' }} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatFileSize(stats.total_storage_used)}</div>
            <div className="text-sm text-slate-400">Storage Used</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-green-400" />
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.protected_content}</div>
            <div className="text-sm text-slate-400">Protected Files</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 mb-6" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4 flex-1 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 rounded-lg text-white placeholder-slate-400 focus:outline-none"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5A1F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-4 py-2 bg-slate-900/50 rounded-lg text-white focus:outline-none"
                style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                <option value="all">All Types</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>

              <div className="flex items-center space-x-2 bg-slate-900/50 rounded-lg p-1" style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 rounded transition-colors"
                  style={{
                    background: viewMode === 'grid' ? '#FF5A1F' : 'transparent',
                    color: viewMode === 'grid' ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 rounded transition-colors"
                  style={{
                    background: viewMode === 'list' ? '#FF5A1F' : 'transparent',
                    color: viewMode === 'list' ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredUploads.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-12 text-center" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Upload className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <h3 className="text-xl font-semibold text-white mb-2">No content yet</h3>
            <p className="text-slate-400 mb-6">Upload your first file to get started with DCCS protection</p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:opacity-90"
              style={{ background: '#FF5A1F' }}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Now</span>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map(upload => {
              const FileIcon = getFileIcon(upload.file_category);
              const color = getFileColor(upload.file_category);
              const dccsCode = upload.dccs_certificates?.[0];

              return (
                <div key={upload.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 transition-all duration-300" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF5A1F'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 90, 31, 0.2)' }}>
                      <FileIcon className="h-6 w-6" style={{ color: '#FF5A1F' }} />
                    </div>
                    {dccsCode && (
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <Shield className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">DCCS</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-white font-semibold mb-2 truncate" title={upload.file_name}>
                    {upload.file_name}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>{formatFileSize(upload.file_size)}</span>
                    <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                  </div>

                  {dccsCode && (
                    <div className="bg-slate-900/50 rounded-lg p-3 mb-4" style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">DCCS Code</span>
                        <button
                          onClick={() => copyDCCSCode(dccsCode.certificate_code)}
                          className="transition-colors"
                          style={{ color: '#FF5A1F' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {copiedCode === dccsCode.certificate_code ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-white font-mono text-sm">{dccsCode.certificate_code}</div>
                      <Link
                        to={`/verify-dccs-code?code=${dccsCode.certificate_code}`}
                        className="flex items-center space-x-1 text-xs mt-2 transition-colors"
                        style={{ color: '#FF5A1F' }}
                      >
                        <span>Verify Certificate</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(upload)}
                      className="flex-1 flex items-center justify-center space-x-2 text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
                      style={{ background: '#FF5A1F' }}
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">File</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">DCCS Code</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Size</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Date</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUploads.map(upload => {
                    const FileIcon = getFileIcon(upload.file_category);
                    const color = getFileColor(upload.file_category);
                    const dccsCode = upload.dccs_certificates?.[0];

                    return (
                      <tr key={upload.id} className="hover:bg-slate-900/30" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 90, 31, 0.2)' }}>
                              <FileIcon className="h-5 w-5" style={{ color: '#FF5A1F' }} />
                            </div>
                            <div>
                              <div className="text-white font-medium">{upload.file_name}</div>
                              <div className="text-xs text-slate-400 capitalize">{upload.file_category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {dccsCode ? (
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono" style={{ color: '#FF5A1F' }}>{dccsCode.certificate_code}</code>
                              <button
                                onClick={() => copyDCCSCode(dccsCode.certificate_code)}
                                className="text-slate-400 hover:text-white transition-colors"
                              >
                                {copiedCode === dccsCode.certificate_code ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">Processing...</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{formatFileSize(upload.file_size)}</td>
                        <td className="px-6 py-4 text-slate-300">{new Date(upload.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {dccsCode && (
                              <Link
                                to={`/verify-dccs-code?code=${dccsCode.certificate_code}`}
                                className="transition-colors"
                                style={{ color: '#FF5A1F' }}
                                title="Verify Certificate"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </Link>
                            )}
                            <button
                              onClick={() => handleDownload(upload)}
                              className="transition-colors"
                              style={{ color: '#FF5A1F' }}
                              title="Download"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
