import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Music, Video, Image as ImageIcon, Loader, RefreshCw, Shield, ExternalLink, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { uploadManager, UploadProgress } from '../lib/uploadManager';
import { validateFile } from '../lib/fileValidator';

interface ComprehensiveUploaderProps {
  projectId?: string;
  acceptedTypes?: string;
  maxFiles?: number;
  onUploadComplete?: (uploads: UploadProgress[]) => void;
}

export default function ComprehensiveUploader({
  projectId,
  acceptedTypes = 'audio/*,video/*,image/*,.pdf',
  maxFiles = 10,
  onUploadComplete,
}: ComprehensiveUploaderProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Check max files limit
    if (fileArray.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    if (validFiles.length === 0) return;

    // Start uploads
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      uploadId: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files sequentially to avoid overwhelming the system
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadId = newUploads[i].uploadId;

      try {
        await uploadManager.uploadFile(file, {
          projectId,
          onProgress: (progress) => {
            setUploads(prev =>
              prev.map(u =>
                u.uploadId === uploadId ? progress : u
              )
            );
          },
        });
      } catch (error) {
        console.error('Upload failed:', error);
        setUploads(prev =>
          prev.map(u =>
            u.uploadId === uploadId
              ? { ...u, status: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
              : u
          )
        );
      }
    }

    // Call completion callback
    if (onUploadComplete) {
      const completedUploads = uploads.filter(u => u.status === 'completed');
      onUploadComplete(completedUploads);
    }
  }, [projectId, maxFiles, onUploadComplete, uploads]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeUpload = (uploadId: string) => {
    uploadManager.cancelUpload(uploadId);
    setUploads(prev => prev.filter(u => u.uploadId !== uploadId));
  };

  const retryUpload = async (uploadId: string) => {
    const upload = uploads.find(u => u.uploadId === uploadId);
    if (!upload) return;

    // Remove old upload and start fresh
    setUploads(prev => prev.filter(u => u.uploadId !== uploadId));
    // User would need to re-select file - simplified for now
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext || '')) {
      return <Music className="h-5 w-5 text-purple-400" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) {
      return <Video className="h-5 w-5 text-blue-400" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-5 w-5 text-green-400" />;
    }
    return <File className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-300">{error}</p>
                ))}
              </div>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragging ? 'bg-purple-500/20' : 'bg-slate-700/50'
          }`}>
            <Upload className={`h-8 w-8 transition-colors ${
              isDragging ? 'text-purple-400' : 'text-slate-400'
            }`} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragging ? 'Drop files here' : 'Upload Your Files'}
            </h3>
            <p className="text-slate-400 mb-4">
              Drag and drop your MP3, MP4, images, or other files here
            </p>
          </div>

          <button
            onClick={handleBrowseClick}
            className="btn-futuristic bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all duration-300"
          >
            Browse Files
          </button>

          <div className="text-sm text-slate-500 space-y-1">
            <p>Supported: MP3, MP4, WAV, FLAC, MOV, AVI, JPG, PNG, PDF</p>
            <p>Maximum file size: 500MB • Up to {maxFiles} files at once</p>
            <p className="text-purple-400 font-medium">All files encrypted on upload • DCCS Certificate generated</p>
          </div>
        </div>
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">
              Uploads ({uploads.filter(u => u.status === 'completed').length}/{uploads.length})
            </h4>
            {uploads.some(u => u.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear Completed
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploads.map(upload => (
              <div
                key={upload.uploadId}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(upload.fileName)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {upload.fileName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {upload.status === 'completed' && 'Upload complete • DCCS certificate generated'}
                        {upload.status === 'uploading' && `Uploading... ${upload.progress}%`}
                        {upload.status === 'processing' && 'Processing file...'}
                        {upload.status === 'failed' && (upload.error || 'Upload failed')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <Loader className="h-5 w-5 text-purple-400 animate-spin" />
                    )}
                    {upload.status === 'failed' && (
                      <>
                        <button
                          onClick={() => retryUpload(upload.uploadId)}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Retry upload"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </>
                    )}
                    <button
                      onClick={() => removeUpload(upload.uploadId)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(upload.status === 'uploading' || upload.status === 'processing') && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* DCCS Certificate - Prominent Display */}
                {upload.status === 'completed' && (upload.dccsClearanceCode || upload.dccsCertificateId) && (
                  <div className="mt-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Shield className="h-4 w-4 text-green-400" />
                          <span className="text-xs font-semibold text-green-400">DCCS TRACKING CODE</span>
                        </div>
                        <div className="font-mono text-sm text-white font-bold">
                          {upload.dccsClearanceCode || upload.dccsCertificateId}
                        </div>
                        <p className="text-xs text-cyan-400 mt-1">
                          This code tracks your content globally for royalty collection
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 ml-3" />
                    </div>
                    <Link
                      to="/library"
                      className="flex items-center justify-center space-x-2 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Folder className="h-4 w-4" />
                      <span>View in My Library</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
