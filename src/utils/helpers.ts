import { PRICING, AUDIO_CONFIG } from './constants';

// Format currency
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Format time duration
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Calculate artist earnings
export const calculateArtistEarnings = (price: number): number => {
  return price * PRICING.artistShare;
};

// Calculate platform fee
export const calculatePlatformFee = (price: number): number => {
  return price * PRICING.platformShare;
};

// Validate audio file
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > AUDIO_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(AUDIO_CONFIG.maxFileSize)}`
    };
  }

  // Check file type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !AUDIO_CONFIG.supportedFormats.includes(extension)) {
    return {
      valid: false,
      error: `Supported formats: ${AUDIO_CONFIG.supportedFormats.join(', ')}`
    };
  }

  return { valid: true };
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Debounce function
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate price
export const isValidPrice = (price: number): boolean => {
  return price >= PRICING.minPrice && price <= PRICING.maxPrice;
};

// Generate waveform data (mock)
export const generateWaveformData = (length = 100): number[] => {
  return Array.from({ length }, () => Math.random());
};

// Calculate snippet quality score
export const calculateQualityScore = (snippet: {
  duration: number;
  price: number;
  mood: string[];
  bpm: number;
}): number => {
  let score = 0;

  // Duration score (15-30 seconds is optimal)
  if (snippet.duration >= 15 && snippet.duration <= 30) {
    score += 30;
  } else if (snippet.duration >= 10 && snippet.duration <= 45) {
    score += 20;
  } else {
    score += 10;
  }

  // Price score (reasonable pricing)
  if (snippet.price >= 0.10 && snippet.price <= 0.50) {
    score += 25;
  } else if (snippet.price >= 0.05 && snippet.price <= 1.00) {
    score += 15;
  } else {
    score += 5;
  }

  // Mood diversity score
  score += Math.min(snippet.mood.length * 10, 25);

  // BPM score (danceable range)
  if (snippet.bpm >= 120 && snippet.bpm <= 140) {
    score += 20;
  } else if (snippet.bpm >= 100 && snippet.bpm <= 160) {
    score += 15;
  } else {
    score += 10;
  }

  return Math.min(score, 100);
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Download file
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};