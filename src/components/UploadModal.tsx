import React, { useState } from 'react';
import { X, Music2, DollarSign, Scissors, FileAudio } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import { uploadAudioFile, validateAudioFile } from '../lib/storage';
import SnippetRangeSelector from './SnippetRangeSelector';

interface SnippetRange {
  id: string;
  start: number;
  end: number;
  price: number;
  title: string;
}

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('0.10');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [snippetRanges, setSnippetRanges] = useState<SnippetRange[]>([]);
  
  const { addSnippet } = useAudio();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    console.log('UploadModal mounted');
    addNotification({
      type: 'info',
      title: 'Upload Ready',
      message: 'Upload modal is ready for your music'
    });
  }, [addNotification]);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        console.error('Invalid file:', validation.error);
        addNotification({
          type: 'error',
          title: 'Invalid File',
          message: validation.error || 'Please select a valid audio file'
        });
        return;
      }
      
      console.log('Valid audio file selected:', file.name);
      setSongFile(file);
      setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
      addNotification({
        type: 'success',
        title: 'File Selected',
        message: `"${file.name}" is ready for upload`
      });
    }
  };

  const handleRangesChange = (ranges: SnippetRange[]) => {
    console.log('Snippet ranges updated:', ranges.length);
    setSnippetRanges(ranges);
  };

  // const handleAiAnalysis = async () => {
    console.log('Starting AI analysis');
    setLoading(true);
    
    addNotification({
      type: 'info',
      title: 'AI Analysis Started',
      message: 'Analyzing your track for optimal snippets...'
    });
    
    // Simulate AI analysis
    setTimeout(() => {
      console.log('AI analysis completed');
      setAiAnalysis({
        bestClips: [
          { start: 45, duration: 15, confidence: 0.95, reason: 'Chorus with strong hook' },
          { start: 75, duration: 30, confidence: 0.87, reason: 'Bridge section with unique elements' },
          { start: 15, duration: 20, confidence: 0.82, reason: 'Intro with memorable melody' }
        ],
        detectedMoods: ['energetic', 'upbeat', 'catchy'],
        suggestedBPM: 128,
        recommendedPrice: 0.12
      });
      setPrice('0.12');
      setLoading(false);
      setStep(2);
      addNotification({
        type: 'success',
        title: 'AI Analysis Complete',
        message: 'Found optimal snippet ranges for your track'
      });
    }, 3000);
  };

  const handleSubmit = async () => {
    console.log('Starting snippet submission process');
    if (!songFile || snippetRanges.length === 0) return;

    setLoading(true);
    addNotification({
      type: 'info',
      title: 'Creating Snippets',
      message: `Processing ${snippetRanges.length} snippet(s)...`
    });

    try {
      // Upload the audio file first
      console.log('Uploading audio file to storage...');
      const uploadResult = await uploadAudioFile(songFile, user?.id || 'unknown');
      console.log('Audio file uploaded successfully:', uploadResult.url);
      
      // Create snippets from selected ranges
      for (const range of snippetRanges) {
        console.log('Creating snippet:', range.title);
        await addSnippet({
          title: range.title,
          artist: user?.name || 'Unknown Artist',
          duration: Math.round(range.end - range.start),
          price: range.price,
          mood: aiAnalysis?.detectedMoods || ['energetic'],
          bpm: aiAnalysis?.suggestedBPM || 120,
          genre: genre,
          audioUrl: uploadResult.url, // Now using the actual uploaded file URL
          waveformData: Array.from({ length: 100 }, () => Math.random()),
          artistId: user?.id || 'unknown'
        });
      }

      console.log('All snippets created successfully');
      addNotification({
        type: 'success',
        title: 'Upload Successful',
        message: `${snippetRanges.length} snippet(s) uploaded and ready for licensing`
      });
      onClose();
    } catch (error) {
      console.error('Error creating snippets:', error);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'There was an error uploading your snippets. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('Upload modal closing');
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <FileAudio className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Upload New Track</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6">
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Upload Audio File
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Music2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-300 mb-2">
                      {songFile ? songFile.name : 'Drop your audio file here or click to browse'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports MP3, WAV, FLAC (max 50MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Basic Details */}
              {songFile && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Song Title
                    </label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      placeholder="Enter song title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="">Select genre</option>
                      <option value="Electronic">Electronic</option>
                      <option value="Hip-Hop">Hip-Hop</option>
                      <option value="Pop">Pop</option>
                      <option value="Rock">Rock</option>
                      <option value="Ambient">Ambient</option>
                      <option value="R&B">R&B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Base Price per License
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.05"
                        max="2.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended range: $0.05 - $0.50 for maximum sales
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!songFile || !songTitle || !genre || loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Scissors className="h-5 w-5" />
                <span>Select Snippet Ranges</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && songFile && (
          <div className="p-6">
            <SnippetRangeSelector 
              audioFile={songFile}
              onRangesChange={handleRangesChange}
            />

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || snippetRanges.length === 0}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Creating Snippets...' : 'Create Snippets'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
