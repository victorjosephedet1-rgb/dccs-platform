import React, { useState } from 'react';
import { Play, Music, Video, Mic2, Image as ImageIcon, ExternalLink, TrendingUp, Clock, Calendar } from 'lucide-react';
import LazyImage from './LazyImage';

interface MediaItem {
  id: string;
  title: string;
  subtitle?: string;
  coverUrl: string;
  type: 'audio' | 'video' | 'podcast' | 'image' | 'album' | 'playlist';
  metadata?: {
    duration?: string;
    plays?: number;
    date?: string;
    tracks?: number;
  };
  onClick?: () => void;
}

interface MediaGridShowcaseProps {
  items: MediaItem[];
  title?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  showMetadata?: boolean;
}

export default function MediaGridShowcase({
  items,
  title,
  columns = 4,
  showMetadata = true
}: MediaGridShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      case 6: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'podcast': return <Mic2 className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'album': return <Music className="h-4 w-4" />;
      case 'playlist': return <Music className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="h-8 w-8 text-slate-500" />
        </div>
        <p className="text-slate-400">No content available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            See all
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={`grid ${getGridCols()} gap-4 sm:gap-6`}>
        {items.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={item.onClick}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                <LazyImage
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute top-3 left-3 bg-slate-900/90 px-2 py-1 rounded-md flex items-center gap-1.5">
                    <span className="text-white">{getIcon(item.type)}</span>
                    <span className="text-xs font-medium text-white">{getTypeLabel(item.type)}</span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>

                {showMetadata && item.metadata?.plays !== undefined && (
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="h-3 w-3 text-cyan-400" />
                    <span className="text-xs font-medium text-white">
                      {item.metadata.plays.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 px-1">
                <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-slate-400 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                )}
                {showMetadata && item.metadata && (
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    {item.metadata.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.metadata.duration}
                      </span>
                    )}
                    {item.metadata.tracks && (
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {item.metadata.tracks} tracks
                      </span>
                    )}
                    {item.metadata.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.metadata.date}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
