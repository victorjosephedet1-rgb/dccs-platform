import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Scissors, Plus, X } from 'lucide-react';
import { useNotifications } from './NotificationSystem';
import { validateAudioFile } from '../lib/storage';

interface SnippetRange {
  id: string;
  start: number;
  end: number;
  price: number;
  title: string;
}

interface SnippetRangeSelectorProps {
  audioFile: File;
  onRangesChange: (ranges: SnippetRange[]) => void;
}

export default function SnippetRangeSelector({ audioFile, onRangesChange }: SnippetRangeSelectorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ranges, setRanges] = useState<SnippetRange[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [tempEnd, setTempEnd] = useState(0);
  
  const { addNotification } = useNotifications();
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    console.log('SnippetRangeSelector mounted with file:', audioFile.name);
    
    // Validate the audio file
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      addNotification({
        type: 'error',
        title: 'Invalid Audio File',
        message: validation.error || 'Please select a valid audio file'
      });
      return;
    }
    
    // Create object URL for preview
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
        drawWaveform();
        addNotification({
          type: 'success',
          title: 'Audio Loaded',
          message: `Track loaded successfully (${Math.round(audio.duration)}s)`
        });
      };
      
      const handleError = (e: Event) => {
        console.error('Audio loading error:', e);
        addNotification({
          type: 'error',
          title: 'Audio Load Error',
          message: 'Failed to load audio file. Please try a different file.'
        });
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError);
      return () => {
        // Clean up object URL
        if (url) {
          URL.revokeObjectURL(url);
        }
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioFile, addNotification]);

  useEffect(() => {
    drawWaveform();
  }, [currentTime, ranges, isSelecting, tempEnd]);

  useEffect(() => {
    onRangesChange(ranges);
  }, [ranges, onRangesChange]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw waveform (simulated)
    const barCount = 200;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * height * 0.8;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      
      ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Draw existing ranges
    ranges.forEach((range, index) => {
      const startX = (range.start / duration) * width;
      const endX = (range.end / duration) * width;
      const rangeWidth = endX - startX;
      
      // Range background
      ctx.fillStyle = `hsla(${index * 60}, 70%, 50%, 0.3)`;
      ctx.fillRect(startX, 0, rangeWidth, height);
      
      // Range borders
      ctx.strokeStyle = `hsla(${index * 60}, 70%, 50%, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    });

    // Draw current selection
    if (isSelecting) {
      const startX = (selectionStart / duration) * width;
      const endX = (tempEnd / duration) * width;
      const selectionWidth = endX - startX;
      
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fillRect(startX, 0, selectionWidth, height);
      
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  const handlePlayPause = () => {
    console.log('Play/pause button clicked');
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      console.log('Pausing audio');
      audio.pause();
    } else {
      console.log('Playing audio');
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;
    
    setIsSelecting(true);
    setSelectionStart(time);
    setTempEnd(time);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / canvas.width) * duration;
    
    setTempEnd(time);
  };

  const handleCanvasMouseUp = () => {
    if (!isSelecting) return;
    
    const start = Math.min(selectionStart, tempEnd);
    const end = Math.max(selectionStart, tempEnd);
    
    if (end - start >= 5) { // Minimum 5 seconds
      console.log('Creating new snippet range:', { start, end, duration: end - start });
      const newRange: SnippetRange = {
        id: Date.now().toString(),
        start,
        end,
        price: 0.15,
        title: `Snippet ${ranges.length + 1}`
      };
      
      setRanges(prev => [...prev, newRange]);
      addNotification({
        type: 'success',
        title: 'Snippet Range Added',
        message: `Created ${Math.round(end - start)}s snippet`
      });
    } else {
      console.log('Snippet too short, minimum 5 seconds required');
      addNotification({
        type: 'warning',
        title: 'Snippet Too Short',
        message: 'Snippets must be at least 5 seconds long'
      });
    }
    
    setIsSelecting(false);
  };

  const removeRange = (id: string) => {
    console.log('Removing snippet range:', id);
    setRanges(prev => prev.filter(range => range.id !== id));
    addNotification({
      type: 'info',
      title: 'Snippet Removed',
      message: 'Snippet range has been removed'
    });
  };

  const updateRange = (id: string, updates: Partial<SnippetRange>) => {
    console.log('Updating snippet range:', id, updates);
    setRanges(prev => prev.map(range => 
      range.id === id ? { ...range, ...updates } : range
    ));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Audio Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePlayPause}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-cyan-600 transition-all duration-200"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="bg-black/20 rounded-lg p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <Scissors className="h-5 w-5 mr-2" />
            Select Snippet Ranges
          </h3>
          <p className="text-sm text-gray-400">
            Click and drag on the waveform to select ranges for licensing. Minimum 5 seconds.
          </p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-30 cursor-crosshair rounded border border-white/20"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => setIsSelecting(false)}
        />
      </div>

      {/* Selected Ranges */}
      {ranges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Selected Ranges</h3>
          {ranges.map((range, index) => (
            <div key={range.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={range.title}
                  onChange={(e) => updateRange(range.id, { title: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
                />
                <button
                  onClick={() => removeRange(range.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1">Duration</label>
                  <span className="text-white">
                    {formatTime(range.start)} - {formatTime(range.end)} 
                    ({Math.round(range.end - range.start)}s)
                  </span>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="2.00"
                    value={range.price}
                    onChange={(e) => updateRange(range.id, { price: parseFloat(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <span className={`px-2 py-1 rounded text-xs ${
                    range.end - range.start >= 15 ? 'bg-green-500/20 text-green-400' : 
                    range.end - range.start >= 5 ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {range.end - range.start >= 15 ? 'Optimal' : 
                     range.end - range.start >= 5 ? 'Good' : 'Too Short'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}