// App Configuration
export const APP_CONFIG = {
  name: 'DCCS Platform - Digital Creative Copyright System',
  description: 'Instant digital ownership proof with cryptographic fingerprinting by Victor Joseph Edet, Victor360 Brand Limited',
  version: '1.0.0-Phase1',
  author: 'Victor Joseph Edet',
  website: 'https://dccsverify.com',
  support: 'info@victor360brand.com',
  founder: 'Victor Joseph Edet',
  trademark: '© 2026 Victor360 Brand Limited. All rights reserved. Patent pending.',
  uniquePosition: 'Digital Clearance Code System - Instant Ownership Verification',
  domains: {
    primary: 'dccsverify.com',
    legacy: ['v3bmusic.ai', 'dccs.platform', 'victor360brand.com']
  },
  phase: {
    current: 1,
    description: 'Complete DCCS Platform - Upload, Registration & Verification',
    nextPhase: 'Advanced Enterprise Features & Global Expansion'
  },
  scalability: {
    maxConcurrentUsers: 10000000, // 10 million concurrent
    maxDailyTransactions: 1000000000, // 1 billion daily
    globalRegions: 195,
    cdnNodes: 500,
    datacenters: 50
  }
};

// Enterprise Scaling Configuration
export const ENTERPRISE_CONFIG = {
  performance: {
    targetLatency: 50, // milliseconds
    maxResponseTime: 200, // milliseconds
    uptime: 99.99, // percentage
    throughput: 1000000 // requests per second
  },
  infrastructure: {
    loadBalancers: 'Global',
    caching: 'Multi-tier Redis Cluster',
    database: 'Distributed PostgreSQL with Read Replicas',
    cdn: 'CloudFlare Enterprise + AWS CloudFront',
    monitoring: 'Real-time with AI anomaly detection'
  },
  security: {
    encryption: 'AES-256 + TLS 1.3',
    ddosProtection: 'Industry-standard protection',
    compliance: ['SOC2', 'GDPR', 'CCPA', 'PCI-DSS'],
    authentication: 'Multi-factor + Biometric'
  }
};

// Pricing Configuration
export const PRICING = {
  minPrice: 0.05,
  maxPrice: 2.00,
  defaultPrice: 0.15,
  artistShare: 0.70, // 70% to artist
  platformShare: 0.30, // 30% to platform
  enterpriseDiscounts: {
    volume1M: 0.05, // 5% discount for 1M+ transactions
    volume10M: 0.10, // 10% discount for 10M+ transactions
    volume100M: 0.15 // 15% discount for 100M+ transactions
  }
};

// Audio Configuration
export const AUDIO_CONFIG = {
  minDuration: 5, // seconds
  maxDuration: 60, // seconds
  maxFileSize: 500 * 1024 * 1024, // 500MB for enterprise
  supportedFormats: ['mp3', 'wav', 'flac', 'm4a'],
  sampleRate: 44100,
  bitRate: 320,
  enterpriseFormats: ['dsd', 'mqa', 'dolby-atmos'],
  qualityTiers: ['standard', 'hd', 'ultra-hd', 'studio-master']
};

// Platform Limits
export const LIMITS = {
  standard: {
    maxSnippetsPerUpload: 10,
    maxUploadsPerDay: 50,
    maxSearchResults: 100,
    maxRecentActivity: 50
  },
  enterprise: {
    maxSnippetsPerUpload: 1000,
    maxUploadsPerDay: 10000,
    maxSearchResults: 10000,
    maxRecentActivity: 1000,
    bulkOperations: true,
    apiRateLimit: 10000 // requests per minute
  }
};

// Global Infrastructure
export const GLOBAL_INFRASTRUCTURE = {
  regions: [
    { name: 'North America', datacenters: ['us-east-1', 'us-west-1', 'ca-central-1'] },
    { name: 'Europe', datacenters: ['eu-west-1', 'eu-central-1', 'eu-north-1'] },
    { name: 'Asia Pacific', datacenters: ['ap-southeast-1', 'ap-northeast-1', 'ap-south-1'] },
    { name: 'South America', datacenters: ['sa-east-1'] },
    { name: 'Africa', datacenters: ['af-south-1'] },
    { name: 'Middle East', datacenters: ['me-south-1'] }
  ],
  cdnProviders: ['CloudFlare', 'AWS CloudFront', 'Azure CDN', 'Google Cloud CDN'],
  edgeLocations: 500,
  globalLatency: '<50ms'
};

// Social Media Platforms
export const PLATFORMS = {
  tiktok: {
    name: 'TikTok',
    maxDuration: 60,
    recommendedDuration: 15,
    globalUsers: 1000000000
  },
  instagram: {
    name: 'Instagram Reels',
    maxDuration: 90,
    recommendedDuration: 30,
    globalUsers: 2000000000
  },
  youtube: {
    name: 'YouTube Shorts',
    maxDuration: 60,
    recommendedDuration: 15,
    globalUsers: 2800000000
  },
  twitter: {
    name: 'Twitter',
    maxDuration: 140,
    recommendedDuration: 30,
    globalUsers: 450000000
  },
  snapchat: {
    name: 'Snapchat',
    maxDuration: 60,
    recommendedDuration: 15,
    globalUsers: 750000000
  },
  discord: {
    name: 'Discord',
    maxDuration: 300,
    recommendedDuration: 30,
    globalUsers: 150000000
  }
};

// Genres
export const GENRES = [
  'Electronic',
  'Hip-Hop',
  'Pop',
  'Rock',
  'R&B',
  'Jazz',
  'Classical',
  'Country',
  'Reggae',
  'Folk',
  'Blues',
  'Funk',
  'House',
  'Techno',
  'Dubstep',
  'Trap',
  'Lo-Fi',
  'Ambient',
  'Cinematic',
  'World'
];

// Moods
export const MOODS = [
  'happy',
  'energetic',
  'chill',
  'aggressive',
  'romantic',
  'sad',
  'mysterious',
  'uplifting',
  'dark',
  'peaceful',
  'intense',
  'playful',
  'dramatic',
  'nostalgic',
  'epic',
  'dreamy',
  'funky',
  'melancholic',
  'triumphant',
  'ethereal'
];

// License Types
export const LICENSE_TYPES = {
  creator: {
    name: 'Content Creator License',
    description: 'Perfect for TikTok, Instagram Reels, and YouTube Shorts',
    features: [
      'Social media usage rights',
      'Non-commercial use',
      'Attribution required',
      'Up to 1M views per post'
    ]
  },
  commercial: {
    name: 'Commercial License',
    description: 'For businesses and commercial content',
    features: [
      'Commercial usage rights',
      'No attribution required',
      'Unlimited views',
      'Broadcast rights included'
    ]
  },
  extended: {
    name: 'Extended License',
    description: 'Full rights for any use case',
    features: [
      'Unlimited usage rights',
      'Resale rights included',
      'Modification allowed',
      'Worldwide distribution'
    ]
  }
};

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh'
  },
  snippets: {
    list: '/snippets',
    create: '/snippets',
    update: '/snippets/:id',
    delete: '/snippets/:id',
    search: '/snippets/search'
  },
  licenses: {
    create: '/licenses',
    list: '/licenses',
    download: '/licenses/:id/download'
  },
  payments: {
    createIntent: '/payments/create-intent',
    confirm: '/payments/confirm',
    webhook: '/payments/webhook'
  }
};