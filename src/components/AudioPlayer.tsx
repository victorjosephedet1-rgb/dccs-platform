import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { getAudioFileUrl } from '../lib/storage';

interface AudioPlayerProps {
  snippet: {
    id: string;
    title: string;
    audioUrl: string;
    waveformData: number[];
    duration: number;
  };
}

export default function AudioPlayer({ snippet }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioSrc, setAudioSrc] = useState<string>('');

  useEffect(() => {
    // Get the proper audio URL (handles both demo and real URLs)
    const audioUrl = getAudioFileUrl(snippet.audioUrl);
    setAudioSrc(audioUrl);
    drawWaveform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippet.waveformData, currentTime, snippet.audioUrl]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const data = snippet.waveformData;
    const barWidth = width / data.length;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    data.forEach((value, index) => {
      const barHeight = (value * height) / 2;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Color based on progress
      const progress = (currentTime / snippet.duration) * data.length;
      const isPlayed = index < progress;
      
      ctx.fillStyle = isPlayed 
        ? 'rgba(168, 85, 247, 0.8)' // Purple for played portion
        : 'rgba(75, 85, 99, 0.5)';  // Gray for unplayed
      
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });

    // Draw progress line
    const progressX = (currentTime / snippet.duration) * width;
    ctx.strokeStyle = 'rgba(168, 85, 247, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / canvas.width;
    const newTime = progress * snippet.duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/20 rounded-lg p-4">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedData={() => {
          // Since we're using a demo audio file, simulate the correct duration
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      >
        <source src={audioSrc} type="audio/mpeg" />
      </audio>

      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-cyan-600 transition-all duration-200"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(snippet.duration)}</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full h-15 cursor-pointer rounded"
        onClick={handleCanvasClick}
        style={{ maxHeight: '60px' }}
      />
    </div>
  );
}