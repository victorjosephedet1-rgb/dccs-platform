export const ROUTES = {
  HOME: '/',

  MARKETPLACE: '/marketplace',

  MUSIC: '/music',
  VIDEO: '/video',
  PODCAST: '/podcast',
  BOOKING: '/booking',

  videoDetail: (id: string | number) => `/video/${id}`,
  podcastDetail: (id: string | number) => `/podcast/${id}`,
  bookingDetail: (id: string | number) => `/booking/${id}`,
  marketplacePack: (packId: string | number) => `/marketplace?pack=${packId}`,

  UPLOAD: '/upload',
  uploadWithType: (type: 'music' | 'video' | 'podcast' | 'other') => `/upload?type=${type}`,

  MY_CONTENT: '/my-content',
  DASHBOARD: '/dashboard',
  dashboardWithTab: (tab: string) => `/dashboard?tab=${tab}`,

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  ADMIN: '/admin',
  ADMIN_CONTROL: '/admin/control',

  artistProfile: (slug: string) => `/artist/${slug}`,

  LICENSE_DOWNLOAD: '/license-download',
  licenseDetail: (id: string | number) => `/license/${id}`,

  DCCS_REDOWNLOAD: '/dccs-redownload',

  verifyClearance: (code: string) => `/verify/${code}`,
  VERIFY_DCCS: '/verify-dccs',
  verifyCertificate: (certificateId: string) => `/verify-certificate/${certificateId}`,

  SAFETY: '/safety',
  GUIDELINES: '/guidelines',
  CATALOG: '/catalog',

  SSO_CALLBACK: '/sso/callback',

  LEGAL_TERMS: '/legal/terms-of-service.html',
  LEGAL_PRIVACY: '/legal/privacy-policy.html',
  LEGAL_COOKIE: '/legal/cookie-policy.html',
  LEGAL_DMCA: '/legal/dmca-policy.html',
} as const;

export const EXTERNAL_LINKS = {
  VICTOR360: 'https://victor360brand.com',
  TWITTER: 'https://twitter.com/victor360brand',
  LINKEDIN: 'https://linkedin.com/company/victor360brand',
  GITHUB: 'https://github.com/victor360brand',

  PEXELS_MUSIC: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
  PEXELS_VIDEO: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400',
  PEXELS_PODCAST: 'https://images.pexels.com/photos/7683900/pexels-photo-7683900.jpeg?auto=compress&cs=tinysrgb&w=400',
  PEXELS_STUDIO: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',

  GOOGLE_SEARCH_CONSOLE: 'https://search.google.com/search-console',
  GOOGLE_ANALYTICS: 'https://analytics.google.com',
} as const;

export const PLATFORM_INFO = {
  NAME: 'DCCS',
  FULL_NAME: 'Digital Creative Copyright System - Instant Ownership Verification',
  TAGLINE: 'Prove you made it before anyone profits from it',
  DOMAIN: 'https://dccs.platform',
  LOGO_URL: '/brand-assets/logo/MY_LOGOS_1.jpg',
  FOUNDER: 'Victor Joseph Edet',
  COMPANY: 'Victor360 Brand Limited',

  SUPPORT_EMAIL: 'info@victor360brand.com',
  BUSINESS_EMAIL: 'partnership@victor360brand.com',
  COPYRIGHT_EMAIL: 'info@victor360brand.com',

  DEFAULT_CURRENCY: '£',
  PAYMENT_TIME: 'Instant',
  ARTIST_SPLIT: '80%',
  PLATFORM_SPLIT: '20%',
} as const;

export const EDGE_FUNCTIONS = {
  STRIPE_CHECKOUT: (baseUrl: string) => `${baseUrl}/functions/v1/stripe-checkout`,
  STRIPE_WEBHOOK: (baseUrl: string) => `${baseUrl}/functions/v1/stripe-webhook`,
  UNIFIED_PAYMENT: (baseUrl: string) => `${baseUrl}/functions/v1/unified-payment-router`,
  INSTANT_PAYOUT: (baseUrl: string) => `${baseUrl}/functions/v1/instant-crypto-payout`,
  STRIPE_CONNECT: (baseUrl: string) => `${baseUrl}/functions/v1/stripe-connect-onboarding`,
  ARTIST_NOTIFICATIONS: (baseUrl: string) => `${baseUrl}/functions/v1/artist-notifications`,
  DISPUTE_NOTIFICATIONS: (baseUrl: string) => `${baseUrl}/functions/v1/dispute-notifications`,
  PLATFORM_SYNC: (baseUrl: string) => `${baseUrl}/functions/v1/platform-sync-tracking`,
  PAYOUT_IDENTITY: (baseUrl: string) => `${baseUrl}/functions/v1/process-payout-identity`,
} as const;
