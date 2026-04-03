import React from 'react';

/**
 * Custom SVG Illustrations for V3BMusic.AI Platform
 * Self-explanatory, brand-specific visuals
 */

export const BlockchainIllustration = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blockchainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>

    {/* Chain links */}
    <circle cx="100" cy="200" r="40" fill="url(#blockchainGrad)" opacity="0.2" />
    <circle cx="200" cy="200" r="40" fill="url(#blockchainGrad)" opacity="0.4" />
    <circle cx="300" cy="200" r="40" fill="url(#blockchainGrad)" opacity="0.6" />

    <line x1="140" y1="200" x2="160" y2="200" stroke="#8B5CF6" strokeWidth="4" />
    <line x1="240" y1="200" x2="260" y2="200" stroke="#06B6D4" strokeWidth="4" />

    {/* Lock symbols */}
    <rect x="90" y="190" width="20" height="20" fill="#10B981" rx="3" />
    <rect x="190" y="190" width="20" height="20" fill="#10B981" rx="3" />
    <rect x="290" y="190" width="20" height="20" fill="#10B981" rx="3" />

    {/* Pulse effect */}
    <circle cx="200" cy="200" r="60" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.3">
      <animate attributeName="r" from="60" to="80" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const InstantPayoutIllustration = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="payoutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>

    {/* Money/Dollar */}
    <circle cx="150" cy="200" r="50" fill="url(#payoutGrad)" opacity="0.3" />
    <text x="130" y="220" fontSize="48" fill="#10B981" fontWeight="bold">$</text>

    {/* Arrow */}
    <path d="M 200 200 L 280 200" stroke="#10B981" strokeWidth="6" markerEnd="url(#arrowhead)" />
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="#10B981" />
      </marker>
    </defs>

    {/* Wallet */}
    <rect x="280" y="170" width="60" height="60" fill="#06B6D4" opacity="0.3" rx="8" />
    <rect x="290" y="185" width="40" height="30" fill="#10B981" rx="4" />

    {/* Lightning bolt (instant) */}
    <path d="M 220 160 L 210 200 L 230 200 L 220 240" stroke="#FBBF24" strokeWidth="4" fill="none" />

    {/* Timer text */}
    <text x="190" y="280" fontSize="16" fill="#94A3B8" textAnchor="middle">2-5 seconds</text>
  </svg>
);

export const LicensingIllustration = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document */}
    <rect x="120" y="100" width="160" height="200" fill="#1E293B" stroke="#8B5CF6" strokeWidth="3" rx="8" />
    <line x1="140" y1="130" x2="260" y2="130" stroke="#8B5CF6" strokeWidth="2" />
    <line x1="140" y1="160" x2="260" y2="160" stroke="#06B6D4" strokeWidth="2" />
    <line x1="140" y1="190" x2="220" y2="190" stroke="#06B6D4" strokeWidth="2" />

    {/* Checkmark */}
    <circle cx="200" cy="240" r="30" fill="#10B981" opacity="0.3" />
    <path d="M 185 240 L 195 250 L 215 230" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" />

    {/* Clock/Speed indicator */}
    <text x="200" y="290" fontSize="14" fill="#94A3B8" textAnchor="middle">Generated in</text>
    <text x="200" y="310" fontSize="20" fill="#10B981" textAnchor="middle" fontWeight="bold">10 seconds</text>
  </svg>
);

export const GlobalRoyaltyIllustration = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Globe */}
    <circle cx="200" cy="200" r="80" fill="#1E293B" stroke="#8B5CF6" strokeWidth="3" />
    <ellipse cx="200" cy="200" rx="80" ry="40" fill="none" stroke="#06B6D4" strokeWidth="2" />
    <ellipse cx="200" cy="200" rx="40" ry="80" fill="none" stroke="#06B6D4" strokeWidth="2" />
    <line x1="200" y1="120" x2="200" y2="280" stroke="#06B6D4" strokeWidth="2" />

    {/* Money points around globe */}
    <circle cx="140" cy="150" r="8" fill="#10B981" />
    <circle cx="260" cy="180" r="8" fill="#10B981" />
    <circle cx="170" cy="250" r="8" fill="#10B981" />
    <circle cx="240" cy="220" r="8" fill="#10B981" />

    {/* Connection lines */}
    <line x1="140" y1="150" x2="200" y2="200" stroke="#10B981" strokeWidth="1" opacity="0.5" />
    <line x1="260" y1="180" x2="200" y2="200" stroke="#10B981" strokeWidth="1" opacity="0.5" />
    <line x1="170" y1="250" x2="200" y2="200" stroke="#10B981" strokeWidth="1" opacity="0.5" />
    <line x1="240" y1="220" x2="200" y2="200" stroke="#10B981" strokeWidth="1" opacity="0.5" />

    {/* Text */}
    <text x="200" y="320" fontSize="16" fill="#94A3B8" textAnchor="middle">195+ Countries</text>
  </svg>
);

export const AIRecommendationIllustration = ({ className = "w-64 h-64" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Brain/AI representation */}
    <circle cx="200" cy="180" r="60" fill="#8B5CF6" opacity="0.2" />

    {/* Neural network nodes */}
    <circle cx="160" cy="160" r="10" fill="#8B5CF6" />
    <circle cx="240" cy="160" r="10" fill="#8B5CF6" />
    <circle cx="180" cy="200" r="10" fill="#06B6D4" />
    <circle cx="220" cy="200" r="10" fill="#06B6D4" />
    <circle cx="200" cy="240" r="10" fill="#10B981" />

    {/* Connections */}
    <line x1="160" y1="160" x2="180" y2="200" stroke="#8B5CF6" strokeWidth="2" opacity="0.5" />
    <line x1="240" y1="160" x2="220" y2="200" stroke="#8B5CF6" strokeWidth="2" opacity="0.5" />
    <line x1="180" y1="200" x2="200" y2="240" stroke="#06B6D4" strokeWidth="2" opacity="0.5" />
    <line x1="220" y1="200" x2="200" y2="240" stroke="#06B6D4" strokeWidth="2" opacity="0.5" />

    {/* Sparkles/Magic */}
    <path d="M 280 140 L 285 150 L 290 140 L 285 130 Z" fill="#FBBF24" />
    <path d="M 120 220 L 125 230 L 130 220 L 125 210 Z" fill="#FBBF24" />

    {/* Text */}
    <text x="200" y="300" fontSize="16" fill="#94A3B8" textAnchor="middle">AI-Powered</text>
    <text x="200" y="320" fontSize="16" fill="#94A3B8" textAnchor="middle">Recommendations</text>
  </svg>
);

export const AudioWaveformIllustration = ({ className = "w-full h-32", animate = false }: { className?: string; animate?: boolean }) => (
  <svg className={className} viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Waveform bars */}
    {Array.from({ length: 80 }).map((_, i) => {
      const height = 30 + Math.sin(i * 0.4) * 40 + Math.random() * 40;
      const delay = animate ? `${i * 0.02}s` : '0s';
      return (
        <rect
          key={i}
          x={i * 10}
          y={100 - height / 2}
          width="6"
          height={height}
          fill="url(#waveGrad)"
          opacity="0.7"
        >
          {animate && (
            <animate
              attributeName="height"
              values={`${height};${height * 1.5};${height}`}
              dur="1.5s"
              repeatCount="indefinite"
              begin={delay}
            />
          )}
        </rect>
      );
    })}
  </svg>
);

export const UploadCloudIllustration = ({ className = "w-48 h-48" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cloud */}
    <ellipse cx="150" cy="140" rx="70" ry="50" fill="#8B5CF6" opacity="0.2" />
    <ellipse cx="120" cy="145" rx="50" ry="35" fill="#06B6D4" opacity="0.3" />
    <ellipse cx="180" cy="145" rx="50" ry="35" fill="#06B6D4" opacity="0.3" />

    {/* Upload arrow */}
    <path d="M 150 180 L 150 220" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
    <path d="M 135 195 L 150 180 L 165 195" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* File icon */}
    <rect x="135" y="210" width="30" height="40" fill="#1E293B" stroke="#06B6D4" strokeWidth="2" rx="3" />
    <line x1="142" y1="220" x2="158" y2="220" stroke="#06B6D4" strokeWidth="1.5" />
    <line x1="142" y1="230" x2="158" y2="230" stroke="#06B6D4" strokeWidth="1.5" />
    <line x1="142" y1="240" x2="152" y2="240" stroke="#06B6D4" strokeWidth="1.5" />

    {/* Text */}
    <text x="150" y="275" fontSize="14" fill="#94A3B8" textAnchor="middle">Drag &amp; Drop</text>
  </svg>
);

export const SecureShieldIllustration = ({ className = "w-48 h-48" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>

    {/* Shield */}
    <path d="M 150 80 L 200 100 L 200 180 Q 200 220 150 240 Q 100 220 100 180 L 100 100 Z" fill="url(#shieldGrad)" opacity="0.3" />
    <path d="M 150 80 L 200 100 L 200 180 Q 200 220 150 240 Q 100 220 100 180 L 100 100 Z" stroke="#8B5CF6" strokeWidth="3" fill="none" />

    {/* Checkmark */}
    <path d="M 125 160 L 145 180 L 180 130" stroke="#10B981" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    {/* Lock */}
    <rect x="138" y="145" width="24" height="20" fill="#1E293B" stroke="#06B6D4" strokeWidth="2" rx="2" />
    <path d="M 142 145 L 142 135 Q 142 125 150 125 Q 158 125 158 135 L 158 145" stroke="#06B6D4" strokeWidth="2" fill="none" />
  </svg>
);
