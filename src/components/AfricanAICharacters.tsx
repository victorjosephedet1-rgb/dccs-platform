import React from 'react';

interface CharacterProps {
  type: 'music' | 'video' | 'podcast' | 'booking';
  className?: string;
}

export function AfricanAICharacter({ type, className = '' }: CharacterProps) {
  const characters = {
    music: (
      <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="musicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#92400e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#78350f', stopOpacity: 1 }}  />
          </linearGradient>
        </defs>

        {/* Floating elements - musical energy */}
        <circle cx="80" cy="100" r="8" fill="#f59e0b" opacity="0.6">
          <animate attributeName="cy" values="100;80;100" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="150" r="6" fill="#dc2626" opacity="0.6">
          <animate attributeName="cy" values="150;130;150" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="350" cy="250" r="10" fill="#f59e0b" opacity="0.5">
          <animate attributeName="cy" values="250;230;250" dur="3.5s" repeatCount="indefinite" />
        </circle>

        {/* Body - futuristic suit with African patterns */}
        <ellipse cx="200" cy="380" rx="90" ry="100" fill="url(#musicGradient)" opacity="0.3" />
        <path d="M 150 300 Q 200 280 250 300 L 240 420 Q 200 440 160 420 Z" fill="url(#musicGradient)" />

        {/* African pattern on chest */}
        <path d="M 190 320 L 200 310 L 210 320 L 200 330 Z" fill="#fbbf24" opacity="0.8" />
        <circle cx="180" cy="340" r="4" fill="#fbbf24" opacity="0.6" />
        <circle cx="220" cy="340" r="4" fill="#fbbf24" opacity="0.6" />
        <path d="M 185 360 Q 200 355 215 360" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.6" />

        {/* Arms with tech elements */}
        <path d="M 150 310 Q 130 340 140 380" stroke="url(#musicGradient)" strokeWidth="18" strokeLinecap="round" />
        <path d="M 250 310 Q 270 340 260 380" stroke="url(#musicGradient)" strokeWidth="18" strokeLinecap="round" />

        {/* Hands with energy */}
        <circle cx="140" cy="385" r="12" fill="url(#skinGradient)" />
        <circle cx="260" cy="385" r="12" fill="url(#skinGradient)" />
        <circle cx="140" cy="385" r="8" fill="#f59e0b" opacity="0.4">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="385" r="8" fill="#f59e0b" opacity="0.4">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Head - African features */}
        <ellipse cx="200" cy="200" rx="70" ry="85" fill="url(#skinGradient)" />

        {/* Traditional headpiece with futuristic elements */}
        <path d="M 130 150 Q 200 130 270 150 L 265 180 Q 200 160 135 180 Z" fill="#dc2626" />
        <circle cx="165" cy="145" r="4" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="140" r="5" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="235" cy="145" r="4" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>

        {/* Facial features */}
        <ellipse cx="175" cy="200" rx="8" ry="12" fill="#1e293b" />
        <ellipse cx="225" cy="200" rx="8" ry="12" fill="#1e293b" />

        {/* Glowing AI eyes */}
        <ellipse cx="175" cy="200" rx="5" ry="8" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="225" cy="200" rx="5" ry="8" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
        </ellipse>

        {/* Nose and lips */}
        <path d="M 200 210 L 195 225 L 205 225 Z" fill="#78350f" />
        <ellipse cx="200" cy="240" rx="18" ry="8" fill="#78350f" />

        {/* Tech facial marks - traditional meets futuristic */}
        <path d="M 150 190 L 145 195 L 150 200" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M 250 190 L 255 195 L 250 200" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="145" cy="195" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="255" cy="195" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Sound waves emanating */}
        <path d="M 100 200 Q 90 200 85 205" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="d" values="M 100 200 Q 90 200 85 205; M 95 200 Q 80 200 70 210; M 100 200 Q 90 200 85 205" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 300 200 Q 310 200 315 205" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="d" values="M 300 200 Q 310 200 315 205; M 305 200 Q 320 200 330 210; M 300 200 Q 310 200 315 205" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    video: (
      <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="videoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="skinGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#451a03', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#78350f', stopOpacity: 1 }}  />
          </linearGradient>
        </defs>

        {/* Digital particles */}
        <rect x="60" y="120" width="6" height="6" fill="#06b6d4" opacity="0.7">
          <animate attributeName="y" values="120;100;120" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </rect>
        <rect x="330" y="180" width="8" height="8" fill="#3b82f6" opacity="0.6">
          <animate attributeName="y" values="180;160;180" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="340" cy="280" width="5" height="5" fill="#06b6d4" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Body with tech armor */}
        <path d="M 155 300 Q 200 285 245 300 L 235 420 Q 200 435 165 420 Z" fill="url(#videoGradient)" />
        <ellipse cx="200" cy="380" rx="85" ry="95" fill="url(#videoGradient)" opacity="0.2" />

        {/* Chest panel with African geometric patterns */}
        <rect x="180" y="320" width="40" height="50" fill="#1e293b" opacity="0.3" rx="5" />
        <path d="M 190 330 L 200 325 L 210 330 L 200 335 Z" fill="#06b6d4" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
        </path>
        <line x1="185" y1="345" x2="195" y2="345" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <line x1="205" y1="345" x2="215" y2="345" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <circle cx="200" cy="360" r="3" fill="#3b82f6">
          <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Arms */}
        <path d="M 155 310 Q 135 345 145 385" stroke="url(#videoGradient)" strokeWidth="20" strokeLinecap="round" />
        <path d="M 245 310 Q 265 345 255 385" stroke="url(#videoGradient)" strokeWidth="20" strokeLinecap="round" />

        {/* Hands - one making frame gesture */}
        <circle cx="145" cy="390" r="13" fill="url(#skinGradient2)" />
        <circle cx="255" cy="390" r="13" fill="url(#skinGradient2)" />
        <rect x="140" y="385" width="10" height="12" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Head */}
        <ellipse cx="200" cy="210" rx="68" ry="82" fill="url(#skinGradient2)" />

        {/* Futuristic visor/goggles with African patterns */}
        <rect x="145" y="190" width="110" height="35" fill="#1e293b" opacity="0.7" rx="8" />
        <rect x="150" y="195" width="48" height="25" fill="#06b6d4" opacity="0.4" rx="4">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="202" y="195" width="48" height="25" fill="#06b6d4" opacity="0.4" rx="4">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" begin="1.5s" />
        </rect>

        {/* Visor HUD elements */}
        <line x1="155" y1="202" x2="165" y2="202" stroke="#3b82f6" strokeWidth="1">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="235" y1="202" x2="245" y2="202" stroke="#3b82f6" strokeWidth="1">
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" begin="0.5s" />
        </line>
        <circle cx="175" cy="207" r="2" fill="#06b6d4">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="225" cy="207" r="2" fill="#06b6d4">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" begin="1s" />
        </circle>

        {/* Traditional head decoration */}
        <path d="M 135 165 Q 200 145 265 165 L 260 175 Q 200 155 140 175 Z" fill="#3b82f6" />
        <circle cx="170" cy="160" r="3" fill="#06b6d4">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="155" r="4" fill="#06b6d4">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="230" cy="160" r="3" fill="#06b6d4">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>

        {/* Nose and mouth */}
        <path d="M 200 225 L 195 238 L 205 238 Z" fill="#78350f" />
        <ellipse cx="200" cy="250" rx="16" ry="7" fill="#78350f" />

        {/* Tech marks on cheeks */}
        <rect x="150" y="230" width="8" height="3" fill="#06b6d4" opacity="0.6" />
        <rect x="242" y="230" width="8" height="3" fill="#06b6d4" opacity="0.6" />

        {/* Scanning effect */}
        <line x1="100" y1="210" x2="300" y2="210" stroke="#06b6d4" strokeWidth="1" opacity="0.3">
          <animate attributeName="y1" values="180;250;180" dur="4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="180;250;180" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
        </line>
      </svg>
    ),

    podcast: (
      <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="podcastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="skinGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#78350f', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#92400e', stopOpacity: 1 }}  />
          </linearGradient>
        </defs>

        {/* Sound wave particles */}
        <circle cx="70" cy="180" r="5" fill="#10b981" opacity="0.5">
          <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="330" cy="200" r="7" fill="#059669" opacity="0.5">
          <animate attributeName="r" values="7;12;7" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="350" cy="280" r="6" fill="#10b981" opacity="0.4">
          <animate attributeName="r" values="6;11;6" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Body */}
        <path d="M 160 305 Q 200 290 240 305 L 230 420 Q 200 435 170 420 Z" fill="url(#podcastGradient)" />
        <ellipse cx="200" cy="380" rx="80" ry="90" fill="url(#podcastGradient)" opacity="0.25" />

        {/* Microphone (large, professional) */}
        <rect x="110" y="350" width="20" height="80" fill="#1e293b" rx="3" />
        <ellipse cx="120" cy="345" rx="15" ry="20" fill="#334155" />
        <line x1="115" y1="345" x2="115" y2="360" stroke="#10b981" strokeWidth="1" opacity="0.6" />
        <line x1="120" y1="345" x2="120" y2="360" stroke="#10b981" strokeWidth="1" opacity="0.6" />
        <line x1="125" y1="345" x2="125" y2="360" stroke="#10b981" strokeWidth="1" opacity="0.6" />

        {/* Sound waves from mic */}
        <path d="M 135 355 Q 145 355 150 360" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M 135 365 Q 150 365 158 372" stroke="#059669" strokeWidth="2" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </path>
        <path d="M 135 375 Q 145 375 153 382" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </path>

        {/* Arms - one holding mic */}
        <path d="M 160 315 Q 135 335 120 365" stroke="url(#podcastGradient)" strokeWidth="18" strokeLinecap="round" />
        <path d="M 240 315 Q 265 350 258 385" stroke="url(#podcastGradient)" strokeWidth="18" strokeLinecap="round" />

        {/* Hands */}
        <circle cx="120" cy="370" r="12" fill="url(#skinGradient3)" />
        <circle cx="258" cy="390" r="12" fill="url(#skinGradient3)" />

        {/* Head with traditional features */}
        <ellipse cx="200" cy="215" rx="72" ry="88" fill="url(#skinGradient3)" />

        {/* Headphones (modern with African patterns) */}
        <path d="M 128 180 Q 125 215 130 240" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
        <path d="M 272 180 Q 275 215 270 240" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
        <ellipse cx="130" cy="215" rx="18" ry="25" fill="#334155" />
        <ellipse cx="270" cy="215" rx="18" ry="25" fill="#334155" />

        {/* LED indicators on headphones */}
        <circle cx="130" cy="210" r="4" fill="#10b981">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="270" cy="210" r="4" fill="#10b981">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.75s" />
        </circle>

        {/* African pattern on headphones */}
        <circle cx="130" cy="220" r="2" fill="#10b981" opacity="0.6" />
        <circle cx="130" cy="228" r="2" fill="#059669" opacity="0.6" />
        <circle cx="270" cy="220" r="2" fill="#10b981" opacity="0.6" />
        <circle cx="270" cy="228" r="2" fill="#059669" opacity="0.6" />

        {/* Headband with decoration */}
        <path d="M 128 180 Q 200 165 272 180" stroke="#334155" strokeWidth="12" strokeLinecap="round" fill="none" />
        <circle cx="200" cy="170" r="5" fill="#10b981" />
        <circle cx="180" cy="173" r="3" fill="#059669" opacity="0.7" />
        <circle cx="220" cy="173" r="3" fill="#059669" opacity="0.7" />

        {/* Facial features */}
        <ellipse cx="175" cy="210" rx="9" ry="13" fill="#1e293b" />
        <ellipse cx="225" cy="210" rx="9" ry="13" fill="#1e293b" />

        {/* AI eyes with recording indicator */}
        <ellipse cx="175" cy="210" rx="6" ry="10" fill="#10b981">
          <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="225" cy="210" rx="6" ry="10" fill="#10b981">
          <animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="175" cy="207" r="2" fill="#ffffff" />
        <circle cx="225" cy="207" r="2" fill="#ffffff" />

        {/* Nose */}
        <path d="M 200 220 L 195 235 L 205 235 Z" fill="#92400e" />

        {/* Mouth - speaking */}
        <ellipse cx="200" cy="250" rx="20" ry="10" fill="#1e293b" opacity="0.5">
          <animate attributeName="ry" values="10;14;10" dur="1s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="200" cy="250" rx="18" ry="8" fill="#92400e" />

        {/* Vocal indicator particles */}
        <circle cx="230" cy="250" r="3" fill="#10b981" opacity="0">
          <animate attributeName="cx" values="230;250;260" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="230" cy="255" r="2" fill="#059669" opacity="0">
          <animate attributeName="cx" values="230;245;255" dur="1.2s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="opacity" values="0;0.8;0" dur="1.2s" repeatCount="indefinite" begin="0.5s" />
        </circle>
      </svg>
    ),

    booking: (
      <svg viewBox="0 0 400 500" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ea580c', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="skinGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#451a03', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#92400e', stopOpacity: 1 }}  />
          </linearGradient>
        </defs>

        {/* Calendar/time particles */}
        <rect x="75" y="130" width="12" height="12" fill="#f97316" opacity="0.6" rx="2">
          <animate attributeName="y" values="130;110;130" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </rect>
        <circle cx="325" cy="170" r="8" fill="#ea580c" opacity="0.5">
          <animate attributeName="cy" values="170;150;170" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <rect x="340" y="260" width="10" height="10" fill="#f97316" opacity="0.6" rx="2">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Body - business suit with cultural elements */}
        <path d="M 158 310 Q 200 295 242 310 L 232 420 Q 200 435 168 420 Z" fill="url(#bookingGradient)" />
        <ellipse cx="200" cy="380" rx="82" ry="92" fill="url(#bookingGradient)" opacity="0.2" />

        {/* Suit details with African pattern */}
        <path d="M 200 310 L 200 380" stroke="#1e293b" strokeWidth="3" opacity="0.3" />
        <path d="M 185 330 L 195 335 L 185 340" fill="#f97316" opacity="0.7" />
        <path d="M 215 330 L 205 335 L 215 340" fill="#f97316" opacity="0.7" />

        {/* Digital calendar hologram */}
        <rect x="165" y="350" width="70" height="50" fill="#1e293b" opacity="0.3" rx="5" />
        <line x1="172" y1="358" x2="228" y2="358" stroke="#f97316" strokeWidth="1" opacity="0.6" />
        <rect x="175" y="365" width="8" height="8" fill="#ea580c" opacity="0.5" rx="1" />
        <rect x="188" y="365" width="8" height="8" fill="#f97316" opacity="0.7" rx="1">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <rect x="201" y="365" width="8" height="8" fill="#ea580c" opacity="0.5" rx="1" />
        <rect x="214" y="365" width="8" height="8" fill="#ea580c" opacity="0.5" rx="1" />

        {/* Arms - one gesturing */}
        <path d="M 158 320 Q 138 350 148 388" stroke="url(#bookingGradient)" strokeWidth="19" strokeLinecap="round" />
        <path d="M 242 320 Q 270 340 275 370" stroke="url(#bookingGradient)" strokeWidth="19" strokeLinecap="round" />

        {/* Hands - one open in welcoming gesture */}
        <circle cx="148" cy="393" r="13" fill="url(#skinGradient4)" />
        <ellipse cx="278" cy="370" rx="15" ry="12" fill="url(#skinGradient4)" transform="rotate(-30 278 370)" />

        {/* Energy around welcoming hand */}
        <circle cx="290" cy="365" r="5" fill="#f97316" opacity="0">
          <animate attributeName="r" values="5;15;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Head with professional demeanor */}
        <ellipse cx="200" cy="220" rx="70" ry="86" fill="url(#skinGradient4)" />

        {/* Professional hair/head wrap with cultural elements */}
        <path d="M 132 175 Q 200 150 268 175 L 265 190 Q 200 165 135 190 Z" fill="#ea580c" />
        <path d="M 145 180 Q 200 162 255 180" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />

        {/* Decorative elements on head wrap */}
        <circle cx="175" cy="170" r="4" fill="#fbbf24">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="165" r="5" fill="#fbbf24">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.7s" />
        </circle>
        <circle cx="225" cy="170" r="4" fill="#fbbf24">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1.4s" />
        </circle>

        {/* Facial features - confident expression */}
        <ellipse cx="175" cy="215" rx="10" ry="14" fill="#1e293b" />
        <ellipse cx="225" cy="215" rx="10" ry="14" fill="#1e293b" />

        {/* AI eyes - professional and warm */}
        <ellipse cx="175" cy="215" rx="6" ry="10" fill="#f97316">
          <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="225" cy="215" rx="6" ry="10" fill="#f97316">
          <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="175" cy="212" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="225" cy="212" r="2" fill="#ffffff" opacity="0.8" />

        {/* Nose and mouth - confident smile */}
        <path d="M 200 228 L 195 242 L 205 242 Z" fill="#92400e" />
        <path d="M 185 255 Q 200 262 215 255" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="200" cy="258" rx="16" ry="6" fill="#92400e" opacity="0.5" />

        {/* Tech facial marks - professional */}
        <path d="M 155 210 L 152 215 L 157 217" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M 245 210 L 248 215 L 243 217" stroke="#f97316" strokeWidth="1.5" fill="none" opacity="0.7" />

        {/* Connection lines - networking visual */}
        <line x1="280" y1="220" x2="310" y2="210" stroke="#f97316" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
        </line>
        <circle cx="310" cy="210" r="3" fill="#f97316" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <line x1="120" y1="220" x2="90" y2="210" stroke="#ea580c" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" begin="1s" />
        </line>
        <circle cx="90" cy="210" r="3" fill="#ea580c" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="1s" />
        </circle>
      </svg>
    )
  };

  return characters[type];
}

export default AfricanAICharacter;
