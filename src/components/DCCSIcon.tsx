import React from 'react';

interface DCCSIconProps {
  className?: string;
  size?: number;
}

export default function DCCSIcon({ className = '', size = 48 }: DCCSIconProps) {
  const gradientId = `dccsGradient-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `glow-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0EA5E9', stopOpacity: 1 }} />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="48"
        fill="#1E293B"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        filter={`url(#${glowId})`}
      />

      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#06B6D4"
        strokeWidth="1"
        opacity="0.3"
      />

      <g transform="translate(50, 50)">
        <text
          x="0"
          y="10"
          textAnchor="middle"
          fill={`url(#${gradientId})`}
          fontSize="32"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          D
        </text>

        <circle cx="-22" cy="-22" r="3" fill="#3B82F6" opacity="0.8"/>
        <circle cx="22" cy="-22" r="3" fill="#06B6D4" opacity="0.8"/>
        <circle cx="-22" cy="22" r="3" fill="#0EA5E9" opacity="0.8"/>
        <circle cx="22" cy="22" r="3" fill="#3B82F6" opacity="0.8"/>

        <path
          d="M0,-35 L3,-28 L10,-28 L5,-23 L7,-16 L0,-21 L-7,-16 L-5,-23 L-10,-28 L-3,-28 Z"
          fill="#06B6D4"
          opacity="0.9"
        />
      </g>

      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  );
}
