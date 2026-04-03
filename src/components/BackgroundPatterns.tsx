import React from 'react';

export const NetworkPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="100" cy="0" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="0" cy="100" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.3" />
          <line x1="50" y1="50" x2="0" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="50" y1="50" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="50" y1="50" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="50" y1="50" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#network)" />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/10" />
  </div>
);

export const DataFlowPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
          style={{
            top: `${5 + i * 5}%`,
            left: '-100%',
            width: '100%',
            animation: `flowRight ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
    <div className="absolute inset-0 bg-gradient-radial-purple" />
    <style>{`
      @keyframes flowRight {
        from { transform: translateX(0); }
        to { transform: translateX(200%); }
      }
    `}</style>
  </div>
);

export const SecureGridPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <svg className="absolute w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="secure-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="currentColor" />
          <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#secure-grid)" />
    </svg>
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  </div>
);

export const CreativeWavesPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <path
        d="M0,300 Q360,150 720,300 T1440,300 L1440,0 L0,0 Z"
        fill="url(#wave-gradient-1)"
        className="animate-float"
      />
      <path
        d="M0,400 Q360,250 720,400 T1440,400 L1440,0 L0,0 Z"
        fill="url(#wave-gradient-2)"
        className="animate-float"
        style={{ animationDelay: '1s', animationDuration: '4s' }}
      />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent" />
  </div>
);

export const ParticleField: React.FC<{ className?: string; count?: number }> = ({
  className = '',
  count = 30
}) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ))}
  </div>
);

export const HexagonPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 overflow-hidden ${className}`}>
    <svg className="absolute w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons" x="0" y="0" width="100" height="173.2" patternUnits="userSpaceOnUse">
          <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons)" />
    </svg>
  </div>
);
