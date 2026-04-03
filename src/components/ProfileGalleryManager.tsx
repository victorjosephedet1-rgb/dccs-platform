import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Star, Image as ImageIcon, Loader, AlertCircle } from 'lucide-react';
import LazyImage from './LazyImage';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
  display_order: number;
  is_featured: boolean;
}

interface ProfileGalleryManagerProps {
  profileId: string;
}

export default function ProfileGalleryManager({ profileId }: ProfileGalleryManagerProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGallery();
  }, [profileId]);

  const loadGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_galleries')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGallery(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');

      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${profileId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-assets')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('profile_galleries')
        .insert({
          profile_id: profileId,
          image_url: publicUrl,
          display_order: gallery.length
        });

      if (insertError) throw insertError;

      await loadGallery();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<GalleryItem>) => {
    try {
      const { error } = await supabase
        .from('profile_galleries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadGallery();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    try {
      const filePath = imageUrl.split('/profile-assets/')[1];
      if (filePath) {
        await supabase.storage.from('profile-assets').remove([filePath]);
      }

      const { error } = await supabase
        .from('profile_galleries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadGallery();
    } catch (err: any) {
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
        <h3 className="text-lg font-semibold text-gray-900">Gallery Manager</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {uploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {gallery.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No photos in your gallery yet</p>
          <p className="text-sm text-gray-500 mt-1">Upload photos to showcase your work</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square relative">
                <LazyImage
                  src={item.image_url}
                  alt={item.title || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateItem(item.id, { is_featured: !item.is_featured })}
                    className={`p-2 rounded-lg transition ${
                      item.is_featured
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-yellow-50'
                    }`}
                    title={item.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className="w-5 h-5" fill={item.is_featured ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id, item.image_url)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    title="Delete"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem(item.id, { title: e.target.value })}
                  placeholder="Photo title"
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                  className="w-full mt-2 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
