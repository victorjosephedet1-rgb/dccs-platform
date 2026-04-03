import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface DCCSCodeDisplayProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  showExplanation?: boolean;
}

export const DCCSCodeDisplay: React.FC<DCCSCodeDisplayProps> = ({
  code,
  size = 'md',
  showExplanation = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const parts = code.split('-');

  const sizeClasses = {
    sm: 'text-sm gap-1.5 px-3 py-2',
    md: 'text-lg gap-2 px-4 py-3',
    lg: 'text-2xl gap-3 px-6 py-4'
  };

  const partLabels = {
    0: 'System',
    1: 'Type',
    2: 'Year',
    3: 'ID'
  };

  return (
    <div className="relative inline-block">
      <div className={`flex items-center ${sizeClasses[size]} bg-black/50 border border-cyan-500/30 rounded-xl font-mono font-bold`}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <div className="group relative">
              <span
                className={`
                  ${index === 0 ? 'text-cyan-400' : ''}
                  ${index === 1 ? 'text-blue-400' : ''}
                  ${index === 2 ? 'text-purple-400' : ''}
                  ${index === 3 ? 'text-white' : ''}
                  transition-all
                `}
              >
                {part}
              </span>
              {showExplanation && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-fast pointer-events-none whitespace-nowrap">
                  <span className="text-xs bg-black/90 text-gray-300 px-2 py-1 rounded border border-white/20">
                    {partLabels[index as keyof typeof partLabels]}
                  </span>
                </div>
              )}
            </div>
            {index < parts.length - 1 && (
              <span className="text-gray-600 font-normal">-</span>
            )}
          </React.Fragment>
        ))}

        {showExplanation && (
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="ml-2 text-gray-500 hover:text-cyan-400 transition-fast"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {showExplanation && showTooltip && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 animate-fade-in">
          <div className="bg-black/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 text-sm space-y-2 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-bold">DCCS</span>
              <span className="text-gray-400">System Identifier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono font-bold">{parts[1]}</span>
              <span className="text-gray-400">Asset Type</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-mono font-bold">{parts[2]}</span>
              <span className="text-gray-400">Year Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold">{parts[3]}</span>
              <span className="text-gray-400">Unique ID</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CompactDCCSCodeDisplay: React.FC<{ code: string }> = ({ code }) => {
  const parts = code.split('-');

  return (
    <div className="inline-flex items-center gap-1 font-mono text-sm">
      <span className="text-cyan-400 font-bold">{parts[0]}</span>
      <span className="text-gray-600">-</span>
      <span className="text-blue-400 font-bold">{parts[1]}</span>
      <span className="text-gray-600">-</span>
      <span className="text-purple-400">{parts[2]}</span>
      <span className="text-gray-600">-</span>
      <span className="text-white font-bold">{parts[3]}</span>
    </div>
  );
};
