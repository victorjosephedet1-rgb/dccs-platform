import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProjectCoverUploadProps {
  onCoverSelected: (coverUrl: string, file: File) => void;
  existingCover?: string;
  projectType?: 'music' | 'video' | 'podcast' | 'image' | 'mixed';
}

export default function ProjectCoverUpload({
  onCoverSelected,
  existingCover,
  projectType = 'music'
}: ProjectCoverUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingCover || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPEG, PNG, WebP, or GIF image' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image must be less than 10MB' };
    }

    return { valid: true };
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(fileName);

      onCoverSelected(publicUrl, file);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onCoverSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const removeCover = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPlaceholderText = () => {
    switch (projectType) {
      case 'music': return 'Upload Album Cover';
      case 'video': return 'Upload Video Thumbnail';
      case 'podcast': return 'Upload Episode Cover';
      case 'image': return 'Upload Gallery Image';
      default: return 'Upload Project Cover';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-200 mb-2">
        {getPlaceholderText()}
      </label>

      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative"
      >
        {preview ? (
          <div className="relative group">
            <div className="aspect-square w-full max-w-md rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
              <img
                src={preview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-3"></div>
                  <p className="text-white font-medium">Uploading...</p>
                </div>
              </div>
            )}

            {!uploading && (
              <>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-900/90 hover:bg-slate-800 rounded-lg text-white transition-colors"
                    title="Change cover"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    onClick={removeCover}
                    className="p-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-white transition-colors"
                    title="Remove cover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-green-500/90 rounded-full p-2">
                  <Check className="h-5 w-5 text-white" />
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square w-full max-w-md border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-700/50 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
              <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="text-center px-4">
              <p className="text-white font-medium mb-1">{getPlaceholderText()}</p>
              <p className="text-sm text-slate-400">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Square images work best • Max 10MB
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Recommended: 3000x3000px or higher for best quality
      </p>
    </div>
  );
}
