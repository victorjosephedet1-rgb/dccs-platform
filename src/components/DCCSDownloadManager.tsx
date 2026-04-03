import { useState, useEffect } from 'react';
import { Download, Shield, CheckCircle, FileAudio, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DCCSRegisteredWork {
  id: string;
  file_name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  dccs_certificate_id: string;
  dccs_embedded: boolean;
  downloaded_at: string | null;
  download_count: number;
  created_at: string;
  storage_path: string;
  metadata: any;
  download_unlocked: boolean;
}

export default function DCCSDownloadManager() {
  const [registeredWorks, setRegisteredWorks] = useState<DCCSRegisteredWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegisteredWorks();
  }, []);

  const loadRegisteredWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: certificates, error: fetchError } = await supabase
        .from('dccs_certificates')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRegisteredWorks(certificates || []);
    } catch (err: any) {
      console.error('Error loading registered works:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadWork = async (work: DCCSRegisteredWork) => {
    try {
      setDownloading(work.id);
      setError(null);

      console.log('[DOWNLOAD] Starting download for work:', {
        workId: work.id,
        fileName: work.original_filename,
        certificateId: work.dccs_certificate_id
      });

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('[DOWNLOAD ERROR] Authentication failed:', sessionError);
        throw new Error('Not authenticated. Please log in again.');
      }

      console.log('[DOWNLOAD] Requesting download URL from Edge Function...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dccs-download-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            dccsId: work.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('[DOWNLOAD ERROR] Edge Function returned error:', {
          status: response.status,
          error: data.error,
          details: data
        });
        throw new Error(data.error || `Download failed with status ${response.status}`);
      }

      console.log('[DOWNLOAD] Download URL received:', {
        hasUrl: !!data.downloadUrl,
        fileName: work.original_filename
      });

      if (!data.downloadUrl) {
        console.error('[DOWNLOAD ERROR] No download URL in response:', data);
        throw new Error('No download URL received. Check storage bucket permissions.');
      }

      console.log('[DOWNLOAD] Initiating browser download...');

      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = work.project_title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('[DOWNLOAD SUCCESS] Download initiated successfully');

      await loadRegisteredWorks();

      alert('✅ Download successful! Your file includes DCCS protection and is tracked for lifetime royalties.');
    } catch (err: any) {
      console.error('[DOWNLOAD ERROR] Download failed:', {
        workId: work.id,
        error: err.message,
        stack: err.stack
      });
      setError(`Download failed: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-slate-600">Loading your DCCS-registered works...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Phase 1: FREE Download & Protection
            </h3>
            <p className="text-slate-600 mb-3">
              All works registered with DCCS get lifetime copyright protection and royalty tracking - completely FREE during our momentum-building phase.
              Download anytime, no payment required. Your works are fully protected and monitored by our Agentic AI.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>FREE Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>DCCS Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>AI Royalty Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>80/20 Royalty Split</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {registeredWorks.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No DCCS-Registered Works Yet
          </h3>
          <p className="text-slate-600 mb-4">
            Upload your creative work for DCCS registration to get lifetime copyright protection
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield className="w-5 h-5" />
            Register Your First Work
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {registeredWorks.map((work) => (
            <div
              key={work.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <FileAudio className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">
                        {work.project_title || work.certificate_id}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          DCCS: {work.clearance_code}
                        </span>
                        {work.content_type && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{work.content_type}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => downloadWork(work)}
                      disabled={downloading === work.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === work.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download FREE
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Registered: {formatDate(work.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">FREE Download Available</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-green-800">
                        <p className="font-semibold mb-1">Protected & Tracked for Life</p>
                        <p>
                          Our Agentic AI monitors this work globally for usage, automatically handles royalty
                          splitting (80% to you, 20% to platform), and processes payments according to our policy.
                          Your copyright is protected forever.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
