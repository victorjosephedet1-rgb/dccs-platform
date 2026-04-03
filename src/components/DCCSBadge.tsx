import { CheckCircle2 } from 'lucide-react';
import DCCSIcon from './DCCSIcon';

interface DCCSBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  verificationCount?: number;
  certificateId?: string;
  showVerificationLink?: boolean;
}

export default function DCCSBadge({
  size = 'md',
  variant = 'default',
  verificationCount,
  certificateId,
  showVerificationLink = false
}: DCCSBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900 rounded-full font-medium border border-blue-200`}>
        <DCCSIcon size={iconSizes[size]} />
        <span>DCCS Verified</span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 border-2 border-blue-300 rounded-2xl shadow-md">
        <div className="flex-shrink-0">
          <DCCSIcon size={40} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">DCCS Certified</span>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
          <span className="text-xs text-gray-700">Digital ownership verified</span>
          {verificationCount && verificationCount > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              Verified {verificationCount} {verificationCount === 1 ? 'time' : 'times'}
            </span>
          )}
          {showVerificationLink && certificateId && (
            <a
              href={`/verify/${certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 underline"
            >
              Verify authenticity →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}>
      <DCCSIcon size={iconSizes[size]} />
      <span>DCCS Verified</span>
      {verificationCount && verificationCount > 0 && (
        <span className="text-cyan-100 text-xs font-bold">
          ({verificationCount})
        </span>
      )}
    </div>
  );
}
