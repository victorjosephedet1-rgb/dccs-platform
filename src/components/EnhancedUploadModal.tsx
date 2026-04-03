import React, { useState } from 'react';
import { X, Upload, Music, DollarSign, Users, FileText, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';
import { uploadAudioFile, validateAudioFile } from '../lib/storage';

interface RoyaltySplit {
  id: string;
  recipient_name: string;
  recipient_type: 'artist' | 'producer' | 'songwriter' | 'label' | 'publisher' | 'other';
  percentage: number;
}

interface LicensingTerms {
  license_type: 'standard' | 'extended' | 'exclusive';
  allowed_platforms: string[];
  allowed_uses: string[];
  attribution_required: boolean;
  duration_months: number;
  territory: string;
  max_views: number | null;
}

interface EnhancedUploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EnhancedUploadModal({ onClose, onSuccess }: EnhancedUploadModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Step 1: Basic Track Info
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState(120);
  const [duration, setDuration] = useState(180);
  const [price, setPrice] = useState(29.99);
  const [mood, setMood] = useState<string[]>([]);
  const [, setTags] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);

  // Step 2: Royalty Splits
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplit[]>([
    { id: '1', recipient_name: '', recipient_type: 'artist', percentage: 100 }
  ]);

  // Step 3: Licensing Terms
  const [licensingTerms, setLicensingTerms] = useState<LicensingTerms>({
    license_type: 'standard',
    allowed_platforms: ['youtube', 'tiktok', 'instagram', 'twitch', 'facebook', 'podcast'],
    allowed_uses: ['commercial', 'non-commercial'],
    attribution_required: true,
    duration_months: 12,
    territory: 'worldwide',
    max_views: null
  });

  const moodOptions = ['energetic', 'chill', 'dark', 'uplifting', 'aggressive', 'happy', 'sad', 'peaceful', 'intense', 'dreamy'];
  const platformOptions = ['youtube', 'tiktok', 'instagram', 'twitch', 'facebook', 'podcast', 'streaming'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: validation.error || 'Please select a valid audio file'
        });
        return;
      }

      setAudioFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));

      // Get audio duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.round(audio.duration));
      });

      addNotification({
        type: 'success',
        title: 'File Selected',
        message: `"${file.name}" is ready for upload`
      });
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
    }
  };

  const addRoyaltySplit = () => {
    setRoyaltySplits([...royaltySplits, {
      id: Date.now().toString(),
      recipient_name: '',
      recipient_type: 'artist',
      percentage: 0
    }]);
  };

  const removeRoyaltySplit = (id: string) => {
    if (royaltySplits.length > 1) {
      setRoyaltySplits(royaltySplits.filter(split => split.id !== id));
    }
  };

  const updateRoyaltySplit = (id: string, field: keyof RoyaltySplit, value: string | number) => {
    setRoyaltySplits(royaltySplits.map(split =>
      split.id === id ? { ...split, [field]: value } : split
    ));
  };

  const getTotalPercentage = () => {
    return royaltySplits.reduce((sum, split) => sum + split.percentage, 0);
  };

  const toggleMood = (selectedMood: string) => {
    setMood(prev =>
      prev.includes(selectedMood)
        ? prev.filter(m => m !== selectedMood)
        : [...prev, selectedMood]
    );
  };

  const togglePlatform = (platform: string) => {
    setLicensingTerms(prev => ({
      ...prev,
      allowed_platforms: prev.allowed_platforms.includes(platform)
        ? prev.allowed_platforms.filter(p => p !== platform)
        : [...prev.allowed_platforms, platform]
    }));
  };

  const validateStep1 = () => {
    return audioFile && title && genre && mood.length > 0;
  };

  const validateStep2 = () => {
    const total = getTotalPercentage();
    const allNamed = royaltySplits.every(split => split.recipient_name.trim());
    return total === 100 && allNamed;
  };

  const validateStep3 = () => {
    return licensingTerms.allowed_platforms.length > 0 && licensingTerms.allowed_uses.length > 0;
  };

  const handleSubmit = async () => {
    if (!audioFile || !user) return;

    setLoading(true);
    try {
      // 1. Upload audio file
      addNotification({
        type: 'info',
        title: 'Uploading',
        message: 'Uploading your track...'
      });

      const audioUploadResult = await uploadAudioFile(audioFile, user.id);

      // 2. Upload cover image if provided
      let coverImageUrl = null;
      if (coverImage) {
        const coverUploadResult = await uploadAudioFile(coverImage, user.id);
        coverImageUrl = coverUploadResult.url;
      }

      // 3. Insert audio snippet
      const { data: snippet, error: snippetError } = await supabase
        .from('audio_snippets')
        .insert({
          title,
          artist: user.name || 'Unknown Artist',
          artist_id: user.id,
          duration,
          price,
          mood,
          bpm,
          genre,
          audio_url: audioUploadResult.url,
          cover_image_url: coverImageUrl,
          description,
          tags,
          is_featured: isFeatured,
          is_exclusive: isExclusive,
          waveform_data: Array.from({ length: 50 }, () => Math.random())
        })
        .select()
        .single();

      if (snippetError) throw snippetError;

      // 4. Insert royalty splits
      const splitsToInsert = royaltySplits.map(split => ({
        snippet_id: snippet.id,
        recipient_name: split.recipient_name,
        recipient_type: split.recipient_type,
        percentage: split.percentage
      }));

      const { error: splitsError } = await supabase
        .from('royalty_splits')
        .insert(splitsToInsert);

      if (splitsError) throw splitsError;

      // 5. Insert licensing terms
      const { error: termsError } = await supabase
        .from('licensing_terms')
        .insert({
          snippet_id: snippet.id,
          ...licensingTerms
        });

      if (termsError) throw termsError;

      addNotification({
        type: 'success',
        title: 'Track Published',
        message: 'Your track is now live in the marketplace!'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload track'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Upload Track to V3BMusic.AI</h2>
              <p className="text-sm text-gray-400">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-700'
                }`} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Track Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Music className="h-5 w-5 text-purple-400" />
                <span>Track Information</span>
              </h3>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Audio File *
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-300 mb-2">
                      {audioFile ? audioFile.name : 'Drop your audio file here or click to browse'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports MP3, WAV, FLAC (max 50MB)
                    </p>
                  </label>
                </div>
              </div>

              {audioFile && (
                <>
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Cover Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Track Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Enter track title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Genre *
                      </label>
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option value="">Select genre</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Hip Hop">Hip Hop</option>
                        <option value="Pop">Pop</option>
                        <option value="Rock">Rock</option>
                        <option value="Lo-Fi">Lo-Fi</option>
                        <option value="R&B">R&B</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Classical">Classical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        BPM
                      </label>
                      <input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price ($) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0.99"
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value))}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="Describe your track..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Mood * (Select at least one)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMood(m)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            mood.includes(m)
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 rounded bg-white/10 border-white/20"
                      />
                      <span className="text-gray-300">Feature this track</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isExclusive}
                        onChange={(e) => setIsExclusive(e.target.checked)}
                        className="w-5 h-5 rounded bg-white/10 border-white/20"
                      />
                      <span className="text-gray-300">Exclusive license</span>
                    </label>
                  </div>
                </>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!validateStep1()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next: Royalty Splits
              </button>
            </div>
          )}

          {/* Step 2: Royalty Splits */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <span>Royalty Distribution</span>
                </h3>
                <p className="text-sm text-gray-400">
                  Define how royalties will be split between contributors. Total must equal 100%.
                </p>
              </div>

              <div className="space-y-3">
                {royaltySplits.map((split) => (
                  <div key={split.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={split.recipient_name}
                          onChange={(e) => updateRoyaltySplit(split.id, 'recipient_name', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Role</label>
                        <select
                          value={split.recipient_type}
                          onChange={(e) => updateRoyaltySplit(split.id, 'recipient_type', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                        >
                          <option value="artist">Artist</option>
                          <option value="producer">Producer</option>
                          <option value="songwriter">Songwriter</option>
                          <option value="label">Label</option>
                          <option value="publisher">Publisher</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Percentage</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={split.percentage}
                            onChange={(e) => updateRoyaltySplit(split.id, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                          />
                        </div>
                        {royaltySplits.length > 1 && (
                          <button
                            onClick={() => removeRoyaltySplit(split.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-white font-medium">Total Percentage:</span>
                <span className={`text-xl font-bold ${
                  getTotalPercentage() === 100 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getTotalPercentage().toFixed(2)}%
                </span>
              </div>

              <button
                onClick={addRoyaltySplit}
                className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Another Recipient</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!validateStep2()}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next: Licensing Terms
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Licensing Terms */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <span>Licensing Terms</span>
                </h3>
                <p className="text-sm text-gray-400">
                  Define how creators can use your track
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Type
                </label>
                <select
                  value={licensingTerms.license_type}
                  onChange={(e) => setLicensingTerms({ ...licensingTerms, license_type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="standard">Standard License</option>
                  <option value="extended">Extended License</option>
                  <option value="exclusive">Exclusive License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Allowed Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        licensingTerms.allowed_platforms.includes(platform)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Duration (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={licensingTerms.duration_months}
                    onChange={(e) => setLicensingTerms({ ...licensingTerms, duration_months: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Territory
                  </label>
                  <input
                    type="text"
                    value={licensingTerms.territory}
                    onChange={(e) => setLicensingTerms({ ...licensingTerms, territory: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., Worldwide, USA, Europe"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={licensingTerms.attribution_required}
                  onChange={(e) => setLicensingTerms({ ...licensingTerms, attribution_required: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/10 border-white/20"
                />
                <span className="text-gray-300">Require attribution in content</span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !validateStep3()}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Publish Track</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
