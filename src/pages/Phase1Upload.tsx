import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { phase1UploadManager, Phase1UploadProgress } from '../lib/phase1UploadManager';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import { ProgressIndicator } from '../components/SystemFlowVisualizer';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface UploadState extends Phase1UploadProgress {
  file?: File;
}

export default function Phase1Upload() {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!isAuthenticated) {
      addNotification('error', 'Please log in to upload files');
      navigate('/login');
      return;
    }

    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
      return;
    }

    const newUploads: UploadState[] = fileArray.map(file => ({
      uploadId: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'pending',
      file
    }));

    setUploads(prev => [...prev, ...newUploads]);

    for (const uploadState of newUploads) {
      if (!uploadState.file) continue;

      try {
        await phase1UploadManager.uploadFile(uploadState.file, {
          onProgress: (progress) => {
            setUploads(prev => prev.map(u =>
              u.uploadId === progress.uploadId ? { ...u, ...progress } : u
            ));
          }
        });

        addNotification('success', `${uploadState.fileName} uploaded successfully!`);
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        addNotification('error', errorMessage);

        setUploads(prev => prev.map(u =>
          u.uploadId === uploadState.uploadId
            ? { ...u, status: 'failed' as const, error: errorMessage }
            : u
        ));
      }
    }
  }, [isAuthenticated, addNotification, navigate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(u => u.uploadId !== uploadId));
  };

  const retryUpload = async (uploadId: string) => {
    const upload = uploads.find(u => u.uploadId === uploadId);
    if (!upload || !upload.file) return;

    console.log('[UPLOAD RETRY] User initiated retry for:', upload.fileName);

    setUploads(prev => prev.map(u =>
      u.uploadId === uploadId ? { ...u, status: 'pending' as const, error: undefined } : u
    ));

    try {
      await phase1UploadManager.uploadFile(upload.file, {
        onProgress: (progress) => {
          setUploads(prev => prev.map(u =>
            u.uploadId === progress.uploadId ? { ...u, ...progress } : u
          ));
        }
      });

      addNotification('success', `${upload.fileName} uploaded successfully!`);
    } catch (error) {
      console.error('[UPLOAD RETRY ERROR]', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      addNotification('error', errorMessage);

      setUploads(prev => prev.map(u =>
        u.uploadId === uploadId
          ? { ...u, status: 'failed' as const, error: errorMessage }
          : u
      ));
    }
  };

  return (
    <div className="min-h-screen text-white pt-24 pb-16" style={{ background: '#0B0F17' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Upload Your Creative Work
          </h1>
          <p className="text-xl text-slate-400">
            Free unlimited uploads - audio, video, images, documents, code, and more
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragging
              ? 'bg-orange-500/10 scale-105'
              : 'bg-black/40 hover:border-white/20'
            }
          `}
          style={{
            borderColor: isDragging ? '#FF5A1F' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,video/*,image/*,.pdf,.doc,.docx,.txt,.md,.zip,.rar,.psd,.ai,.fig,.blend,.obj,.fbx,.glb"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full" style={{ background: 'rgba(255, 90, 31, 0.2)' }}>
              <Upload className="h-12 w-12" style={{ color: '#FF5A1F' }} />
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Drop your files here
              </h3>
              <p className="text-slate-400 mb-4">
                or click to browse
              </p>
            </div>

            <button
              onClick={handleBrowseClick}
              className="px-8 py-3 rounded-full font-semibold transition-all hover:opacity-90"
              style={{ background: '#FF5A1F', color: '#fff' }}
            >
              Browse Files
            </button>

            <p className="text-sm text-gray-500">
              Supports all creative file types - audio, video, images, documents, 3D models, code, and more (up to 500MB)
            </p>
          </div>
        </div>

        {uploads.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Upload Progress</h3>

            {uploads.map((upload) => {
              const getStepIndex = () => {
                if (upload.status === 'completed') return 4;
                if (upload.status === 'processing') return 2;
                if (upload.status === 'uploading') return 1;
                return 0;
              };

              return (
                <div
                  key={upload.uploadId}
                  className="bg-black/40 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-white">{upload.fileName}</p>
                    </div>

                    <button
                      onClick={() => removeUpload(upload.uploadId)}
                      className="ml-4 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {upload.status === 'failed' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm flex-1">{upload.error || 'Upload failed'}</p>
                      </div>
                      <button
                        onClick={() => retryUpload(upload.uploadId)}
                        disabled={!isOnline}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#FF5A1F', color: '#fff' }}
                        onMouseEnter={(e) => isOnline && (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => isOnline && (e.currentTarget.style.opacity = '1')}
                      >
                        <RefreshCw className="h-4 w-4" />
                        {isOnline ? 'Retry Upload' : 'Waiting for connection...'}
                      </button>
                    </div>
                  ) : upload.status === 'completed' ? (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <p className="text-green-300 text-sm font-medium">Processing complete - DCCS registered</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ProgressIndicator
                        steps={['Preparing', 'Uploading', 'Processing', 'Finalizing']}
                        currentStep={getStepIndex()}
                        variant="detailed"
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cyan-400 font-medium">
                          {upload.status === 'uploading' && 'Uploading file...'}
                          {upload.status === 'processing' && 'Processing and generating DCCS code...'}
                          {upload.status === 'pending' && 'Preparing upload...'}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {upload.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {uploads.some(u => u.status === 'completed') && (
          <div className="mt-8 rounded-xl p-6" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-2">Upload Complete!</h4>
                <p className="text-slate-300 mb-4">
                  Your files have been successfully uploaded and are now available in your library.
                </p>
                <button
                  onClick={() => navigate('/library')}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all hover:opacity-90"
                  style={{ background: '#FF5A1F', color: '#fff' }}
                >
                  <span>View My Library</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 rounded-xl p-6" style={{ background: 'rgba(255, 90, 31, 0.1)', border: '1px solid rgba(255, 90, 31, 0.2)' }}>
          <h3 className="text-lg font-semibold mb-3">Phase 1: Free Ownership Registration</h3>
          <p className="text-slate-300">
            DCCS Platform is currently in Phase 1, offering free unlimited uploads to all digital creators.
            Upload any creative work, get timestamped ownership proof, and download your DCCS-imprinted files anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
