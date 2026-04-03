import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
}

export default function FlagIcon({ code, className = 'w-8 h-6' }: FlagIconProps) {
  const flagSvgs: Record<string, JSX.Element> = {
    'en': (
      <svg viewBox="0 0 60 30" className={className}>
        <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
        <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
        <g clipPath="url(#s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
      </svg>
    ),
    'es': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#AA151B"/>
        <rect y="7.5" width="60" height="15" fill="#F1BF00"/>
      </svg>
    ),
    'fr': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="20" height="30" fill="#002395"/>
        <rect x="20" width="20" height="30" fill="#FFFFFF"/>
        <rect x="40" width="20" height="30" fill="#ED2939"/>
      </svg>
    ),
    'de': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#000000"/>
        <rect y="10" width="60" height="10" fill="#DD0000"/>
        <rect y="20" width="60" height="10" fill="#FFCE00"/>
      </svg>
    ),
    'pt': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#009C3B"/>
        <polygon points="30,5 50,15 30,25 10,15" fill="#FFDF00"/>
        <circle cx="30" cy="15" r="4.5" fill="#002776"/>
      </svg>
    ),
    'it': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="20" height="30" fill="#009246"/>
        <rect x="20" width="20" height="30" fill="#FFFFFF"/>
        <rect x="40" width="20" height="30" fill="#CE2B37"/>
      </svg>
    ),
    'nl': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#AE1C28"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#21468B"/>
      </svg>
    ),
    'pl': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="15" fill="#FFFFFF"/>
        <rect y="15" width="60" height="15" fill="#DC143C"/>
      </svg>
    ),
    'ru': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#FFFFFF"/>
        <rect y="10" width="60" height="10" fill="#0039A6"/>
        <rect y="20" width="60" height="10" fill="#D52B1E"/>
      </svg>
    ),
    'uk': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="15" fill="#005BBB"/>
        <rect y="15" width="60" height="15" fill="#FFD500"/>
      </svg>
    ),
    'tr': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#E30A17"/>
        <circle cx="22" cy="15" r="7" fill="#FFFFFF"/>
        <circle cx="24" cy="15" r="5.5" fill="#E30A17"/>
        <polygon points="33,15 35,16.5 36.5,15 35.5,17 37,18.5 34.5,18 34,20.5 33,18 30.5,18 32,16.5" fill="#FFFFFF"/>
      </svg>
    ),
    'ar': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#006C35"/>
        <rect width="60" height="30" fill="#FFFFFF" opacity="0.5"/>
        <path d="M25,10 L25,20 L35,15 Z" fill="#FFFFFF"/>
      </svg>
    ),
    'hi': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#FF9933"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#138808"/>
        <circle cx="30" cy="15" r="4" fill="#000080" stroke="#000080" strokeWidth="0.5"/>
      </svg>
    ),
    'ja': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#FFFFFF"/>
        <circle cx="30" cy="15" r="7" fill="#BC002D"/>
      </svg>
    ),
    'zh': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#DE2910"/>
        <polygon points="15,6 16,9 19,9 17,11 18,14 15,12 12,14 13,11 11,9 14,9" fill="#FFDE00"/>
      </svg>
    ),
    'ko': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#FFFFFF"/>
        <circle cx="30" cy="15" r="8" fill="#C60C30"/>
        <path d="M30,7 A8,8 0 0,0 30,23 A4,4 0 0,1 30,15 A4,4 0 0,0 30,7" fill="#003478"/>
      </svg>
    ),
    'id': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="15" fill="#FF0000"/>
        <rect y="15" width="60" height="15" fill="#FFFFFF"/>
      </svg>
    ),
    'vi': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#DA251D"/>
        <polygon points="30,8 32,14 38,14 33,18 35,24 30,20 25,24 27,18 22,14 28,14" fill="#FFFF00"/>
      </svg>
    ),
    'th': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="5" fill="#A51931"/>
        <rect y="5" width="60" height="5" fill="#FFFFFF"/>
        <rect y="10" width="60" height="10" fill="#2D2A4A"/>
        <rect y="20" width="60" height="5" fill="#FFFFFF"/>
        <rect y="25" width="60" height="5" fill="#A51931"/>
      </svg>
    ),
    'sw': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#000000"/>
        <rect y="10" width="60" height="10" fill="#BC0000"/>
        <rect y="20" width="60" height="10" fill="#006B3D"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF" opacity="0.3"/>
      </svg>
    ),
    'am': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#009A44"/>
        <rect y="10" width="60" height="10" fill="#FEDD00"/>
        <rect y="20" width="60" height="10" fill="#EF2118"/>
      </svg>
    ),
    'yo': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#008751"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#008751"/>
      </svg>
    ),
    'ig': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#008751"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#008751"/>
      </svg>
    ),
    'ha': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#008751"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#008751"/>
      </svg>
    ),
    'no': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="30" fill="#BA0C2F"/>
        <rect x="16" width="8" height="30" fill="#FFFFFF"/>
        <rect y="11" width="60" height="8" fill="#FFFFFF"/>
        <rect x="18" width="4" height="30" fill="#00205B"/>
        <rect y="13" width="60" height="4" fill="#00205B"/>
      </svg>
    ),
    'ibb': (
      <svg viewBox="0 0 60 30" className={className}>
        <rect width="60" height="10" fill="#008751"/>
        <rect y="10" width="60" height="10" fill="#FFFFFF"/>
        <rect y="20" width="60" height="10" fill="#008751"/>
      </svg>
    ),
  };

  return flagSvgs[code] || flagSvgs['en'];
}
