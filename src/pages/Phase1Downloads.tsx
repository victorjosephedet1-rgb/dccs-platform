import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileAudio, FileVideo, FileImage, FileText, File, Plus, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getBucketForCategory } from '../lib/phase1UploadManager';
import { useNotifications } from '../components/NotificationSystem';
import { logger } from '../utils/logger';

interface Upload {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_category: string;
  upload_status: string;
  storage_path: string;
  created_at: string;
  file_url?: string;
  dccs_certificate_id?: string;
}

interface DCCSCertificate {
  clearance_code: string;
  certificate_id: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function FileIcon({ category }: { category: string }) {
  const style = { color: '#FF5A1F' };
  if (category === 'video') return <FileVideo className="h-12 w-12" style={style} />;
  if (category === 'audio') return <FileAudio className="h-12 w-12" style={style} />;
  if (category === 'image') return <FileImage className="h-12 w-12" style={style} />;
  if (category === 'document') return <FileText className="h-12 w-12" style={style} />;
  return <File className="h-12 w-12" style={style} />;
}

export default function Phase1Downloads() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [certificates, setCertificates] = useState<Record<string, DCCSCertificate>>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('uploads')
        .select('id, file_name, file_type, file_size, file_category, upload_status, storage_path, created_at, file_url, dccs_certificate_id')
        .eq('user_id', user.id)
        .eq('upload_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUploads(data || []);

      const certIds = (data || []).map(u => u.dccs_certificate_id).filter(Boolean) as string[];
      if (certIds.length > 0) {
        const { data: certsData } = await supabase
          .from('dccs_certificates')
          .select('id, clearance_code, certificate_id')
          .in('id', certIds);

        if (certsData) {
          const certsMap: Record<string, DCCSCertificate> = {};
          certsData.forEach(cert => {
            certsMap[cert.id] = {
              clearance_code: cert.clearance_code,
              certificate_id: cert.certificate_id,
            };
          });
          setCertificates(certsMap);
        }
      }
    } catch (error) {
      logger.error('[Phase1Downloads] Failed to load uploads:', error);
      addNotification({ type: 'error', title: 'Load Failed', message: 'Failed to load your files. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (upload: Upload) => {
    if (downloading === upload.id) return;

    setDownloading(upload.id);

    try {
      // Use the stored public URL if available, otherwise derive it from bucket + path.
      // Both audio-files and video-content are public buckets — no signed URL needed.
      let downloadUrl = upload.file_url;

      if (!downloadUrl || downloadUrl.trim() === '') {
        const bucket = getBucketForCategory(upload.file_category);
        const { data } = supabase.storage.from(bucket).getPublicUrl(upload.storage_path);
        downloadUrl = data.publicUrl;
      }

      if (!downloadUrl) {
        throw new Error('Could not resolve download URL for this file.');
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = upload.file_name;
      document.body.appendChild(anchor);
      anchor.click();

      // Give the browser 1 second before cleanup — 100ms is too short on slow machines.
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(anchor);
      }, 1000);

      addNotification({ type: 'success', title: 'Download Complete', message: `${upload.file_name} downloaded successfully.` });
    } catch (error) {
      logger.error('[Phase1Downloads] Download failed:', error);
      const message = error instanceof Error ? error.message : 'Download failed. Please try again.';
      addNotification({ type: 'error', title: 'Download Failed', message });
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{ background: '#0B0F17' }}>
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid mb-4"
            style={{ borderColor: '#FF5A1F', borderRightColor: 'transparent' }}
          />
          <p className="text-slate-400">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-24 pb-16" style={{ background: '#0B0F17' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              My DCCS Files
              <Shield className="h-8 w-8" style={{ color: '#FF5A1F' }} />
            </h1>
            <p className="text-slate-400">
              Download your DCCS-imprinted files with embedded ownership proof
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all hover:opacity-90"
            style={{ background: '#FF5A1F', color: '#fff' }}
          >
            <Plus className="h-5 w-5" />
            <span>Upload More</span>
          </button>
        </div>

        {uploads.length === 0 ? (
          <div
            className="bg-black/40 rounded-xl p-12 text-center"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <FileAudio className="h-16 w-16 mx-auto mb-4" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <h3 className="text-xl font-semibold mb-2">No Files Yet</h3>
            <p className="text-slate-400 mb-6">Upload your first file to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ background: '#FF5A1F', color: '#fff' }}
            >
              <Plus className="h-5 w-5" />
              <span>Upload Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {uploads.map((upload) => {
              const cert = upload.dccs_certificate_id
                ? certificates[upload.dccs_certificate_id]
                : null;
              const isDownloading = downloading === upload.id;

              return (
                <div
                  key={upload.id}
                  className="bg-black/40 rounded-xl p-6 transition-all"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 90, 31, 0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <FileIcon category={upload.file_category} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate mb-1">{upload.file_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                          <span>{formatBytes(upload.file_size)}</span>
                          <span>{formatDate(upload.created_at)}</span>
                          <span className="capitalize">{upload.file_category}</span>
                        </div>
                        {cert && (
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#22C55E',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                          >
                            <Shield className="h-3 w-3" />
                            <span>DCCS: {cert.clearance_code}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(upload)}
                      disabled={isDownloading}
                      className="ml-4 inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all"
                      style={{
                        background: isDownloading ? 'rgba(255, 255, 255, 0.1)' : '#FF5A1F',
                        color: isDownloading ? 'rgba(255, 255, 255, 0.5)' : '#fff',
                        cursor: isDownloading ? 'wait' : 'pointer',
                        opacity: isDownloading ? 0.6 : 1,
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <div
                            className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
                          />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          className="mt-12 rounded-xl p-6"
          style={{ background: 'rgba(255, 90, 31, 0.1)', border: '1px solid rgba(255, 90, 31, 0.2)' }}
        >
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: '#FF5A1F' }} />
            <div>
              <h3 className="text-lg font-semibold mb-2">Your DCCS-Imprinted Files</h3>
              <p className="text-slate-300 mb-3">
                Each file you download has been processed with the Digital Clearance Code System (DCCS) and contains:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span style={{ color: '#FF5A1F' }}>•</span>
                  <span>Timestamped proof of when you created and registered it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#FF5A1F' }}>•</span>
                  <span>Embedded metadata linking the file to your ownership record</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#FF5A1F' }}>•</span>
                  <span>Digital fingerprint for verification and copyright protection</span>
                </li>
              </ul>
              <p className="text-slate-300 mt-3 font-semibold">
                Use these DCCS-imprinted files when publishing, distributing, or monetizing your work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
