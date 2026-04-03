export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileCategory?: 'audio' | 'video' | 'image' | 'document';
  estimatedDuration?: number;
}

export interface FileValidationConfig {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_MAX_SIZE = 500 * 1024 * 1024; // 500MB

const FILE_TYPE_MAP: Record<string, 'audio' | 'video' | 'image' | 'document'> = {
  // Audio
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/x-wav': 'audio',
  'audio/flac': 'audio',
  'audio/aac': 'audio',
  'audio/ogg': 'audio',
  'audio/webm': 'audio',

  // Video
  'video/mp4': 'video',
  'video/mpeg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/webm': 'video',
  'video/x-matroska': 'video',

  // Image
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',

  // Document
  'application/pdf': 'document',
  'text/plain': 'document',
};

const ALLOWED_EXTENSIONS = [
  // Audio
  '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma',
  // Video
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
  // Image
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  // Document
  '.pdf', '.txt',
];

export function validateFile(
  file: File,
  config: FileValidationConfig = {}
): FileValidationResult {
  const maxSize = config.maxSize || DEFAULT_MAX_SIZE;
  const allowedTypes = config.allowedTypes || Object.keys(FILE_TYPE_MAP);
  const allowedExtensions = config.allowedExtensions || ALLOWED_EXTENSIONS;

  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file size
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  const fileType = file.type.toLowerCase();
  if (!allowedTypes.includes(fileType) && fileType !== '') {
    return {
      valid: false,
      error: `File type ${fileType} is not supported`,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `File extension not supported. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  // Determine file category
  const fileCategory = FILE_TYPE_MAP[fileType] || getFileCategoryFromExtension(fileName);

  if (!fileCategory) {
    return {
      valid: false,
      error: 'Unable to determine file category',
    };
  }

  return {
    valid: true,
    fileCategory,
  };
}

function getFileCategoryFromExtension(fileName: string): 'audio' | 'video' | 'image' | 'document' | undefined {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'].includes(ext)) {
    return 'audio';
  }
  if (['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'].includes(ext)) {
    return 'video';
  }
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'image';
  }
  if (['.pdf', '.txt'].includes(ext)) {
    return 'document';
  }

  return undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
}

export function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep only alphanumeric, dots, hyphens, and underscores
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const fileCategory = FILE_TYPE_MAP[file.type];

    if (fileCategory === 'audio') {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(Math.floor(audio.duration));
      };

      audio.onerror = () => {
        resolve(0);
      };

      audio.src = URL.createObjectURL(file);
    } else if (fileCategory === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.floor(video.duration));
      };

      video.onerror = () => {
        resolve(0);
      };

      video.src = URL.createObjectURL(file);
    } else {
      resolve(0);
    }
  });
}

export async function generateThumbnail(file: File): Promise<string | null> {
  const fileCategory = FILE_TYPE_MAP[file.type];

  if (fileCategory === 'image') {
    return URL.createObjectURL(file);
  }

  if (fileCategory === 'video') {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(2, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);

        window.URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        resolve(null);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  return null;
}

export function validateMultipleFiles(
  files: File[],
  config: FileValidationConfig = {}
): { valid: File[]; invalid: { file: File; error: string }[] } {
  const valid: File[] = [];
  const invalid: { file: File; error: string }[] = [];

  files.forEach(file => {
    const result = validateFile(file, config);
    if (result.valid) {
      valid.push(file);
    } else {
      invalid.push({ file, error: result.error || 'Unknown error' });
    }
  });

  return { valid, invalid };
}
