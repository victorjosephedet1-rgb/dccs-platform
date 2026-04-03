import React from 'react';
import { Music, Video, Image, FileText, Box, Sparkles, File, Video as LucideIcon } from 'lucide-react';

interface CircularAssetIconProps {
  type: 'audio' | 'video' | 'image' | 'document' | '3d' | 'ai' | 'other';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  audio: Music,
  video: Video,
  image: Image,
  document: FileText,
  '3d': Box,
  ai: Sparkles,
  other: File,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  audio: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    gradient: 'from-blue-400 to-cyan-400',
  },
  video: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    gradient: 'from-purple-400 to-pink-400',
  },
  image: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    gradient: 'from-green-400 to-emerald-400',
  },
  document: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    gradient: 'from-orange-400 to-amber-400',
  },
  '3d': {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
    gradient: 'from-cyan-400 to-teal-400',
  },
  ai: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    gradient: 'from-pink-400 to-rose-400',
  },
  other: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    gradient: 'from-gray-400 to-slate-400',
  },
};

const sizeMap = {
  sm: {
    container: 'w-8 h-8',
    icon: 14,
    border: 'border',
  },
  md: {
    container: 'w-12 h-12',
    icon: 20,
    border: 'border-2',
  },
  lg: {
    container: 'w-16 h-16',
    icon: 28,
    border: 'border-2',
  },
  xl: {
    container: 'w-24 h-24',
    icon: 40,
    border: 'border-3',
  },
};

const labelMap: Record<string, string> = {
  audio: 'Audio',
  video: 'Video',
  image: 'Image',
  document: 'Document',
  '3d': '3D Asset',
  ai: 'AI Generated',
  other: 'File',
};

export default function CircularAssetIcon({
  type,
  size = 'md',
  className = '',
  showLabel = false,
}: CircularAssetIconProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];
  const sizes = sizeMap[size];
  const label = labelMap[type];

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`
          ${sizes.container}
          ${colors.bg}
          ${colors.border}
          ${sizes.border}
          rounded-full
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110
          hover:shadow-lg
          group
          relative
          overflow-hidden
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        <Icon size={sizes.icon} className={`${colors.icon} relative z-10`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colors.icon}`}>{label}</span>
      )}
    </div>
  );
}
