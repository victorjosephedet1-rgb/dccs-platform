import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import DCCSIcon from './DCCSIcon';

interface DCCSVerificationSealProps {
  variant?: 'verified' | 'certified' | 'registered';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const variantConfig = {
  verified: {
    label: 'DCCS Verified',
    description: 'Digital ownership verified',
    icon: CheckCircle2,
  },
  certified: {
    label: 'DCCS Certified',
    description: 'Officially certified',
    icon: Shield,
  },
  registered: {
    label: 'DCCS Registered',
    description: 'Registered creation',
    icon: CheckCircle2,
  },
};

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    icon: 24,
    text: 'text-[8px]',
    badge: 'w-5 h-5',
    badgeIcon: 12,
  },
  md: {
    container: 'w-24 h-24',
    icon: 36,
    text: 'text-[10px]',
    badge: 'w-6 h-6',
    badgeIcon: 14,
  },
  lg: {
    container: 'w-32 h-32',
    icon: 48,
    text: 'text-xs',
    badge: 'w-8 h-8',
    badgeIcon: 16,
  },
  xl: {
    container: 'w-48 h-48',
    icon: 72,
    text: 'text-sm',
    badge: 'w-10 h-10',
    badgeIcon: 20,
  },
};

export default function DCCSVerificationSeal({
  variant = 'verified',
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}: DCCSVerificationSealProps) {
  const config = variantConfig[variant];
  const sizes = sizeConfig[size];
  const BadgeIcon = config.icon;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes.container}
          rounded-full
          bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600
          p-1
          shadow-xl
          ${animated ? 'animate-pulse-slow' : ''}
          relative
        `}
      >
        <div className="w-full h-full rounded-full bg-white p-2 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50" />

          <div className="relative flex flex-col items-center justify-center">
            <DCCSIcon size={sizes.icon} />
            {showText && (
              <>
                <div className={`${sizes.text} font-bold text-blue-900 mt-1 text-center leading-tight tracking-wide`}>
                  {config.label.split(' ')[0]}
                </div>
                <div className={`${sizes.text} font-bold text-cyan-700 text-center leading-tight tracking-wide`}>
                  {config.label.split(' ')[1]}
                </div>
              </>
            )}
          </div>

          <div
            className={`
              absolute -top-1 -right-1
              ${sizes.badge}
              rounded-full
              bg-gradient-to-br from-green-500 to-emerald-500
              flex items-center justify-center
              border-2 border-white
              shadow-lg
            `}
          >
            <BadgeIcon size={sizes.badgeIcon} className="text-white" />
          </div>
        </div>

        <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-20" />
        <div className="absolute inset-1 rounded-full border border-cyan-300 opacity-30" />
      </div>
    </div>
  );
}
