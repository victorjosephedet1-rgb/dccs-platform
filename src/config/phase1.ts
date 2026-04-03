/**
 * Phase 1 DCCS Architecture Configuration
 *
 * V3BMusic.ai Platform - Digital Creative Copyright System (DCCS)
 * Copyright © 2026 Victor360 Brand Limited. All Rights Reserved.
 *
 * INTELLECTUAL PROPERTY NOTICE:
 * This configuration represents the Phase 1 foundational architecture of the
 * proprietary DCCS framework. The system design, metadata architecture, and
 * implementation methodology may form part of future patent applications.
 *
 * PHASE 1 SCOPE (CURRENT):
 * - Creator registration
 * - Media upload capability
 * - Media download capability
 * - Basic storage and retrieval
 * - FREE service for user adoption
 *
 * PHASE 2+ SCOPE (DISABLED):
 * - AI media recognition systems
 * - Royalty monitoring infrastructure
 * - Cross-platform content detection
 * - Monetization and licensing systems
 *
 * DO NOT modify this architecture without explicit authorization.
 * Unauthorized changes may compromise IP protection.
 */

export const PHASE_1_CONFIG = {
  /**
   * Current development phase
   * Phase 1: Foundation layer - free service, basic upload/download
   * Phase 2+: Advanced features - AI, royalties, monetization (DISABLED)
   */
  CURRENT_PHASE: 1,

  /**
   * Feature flags for Phase 1 compliance
   */
  FEATURES: {
    // ENABLED: Phase 1 core features
    CREATOR_REGISTRATION: true,
    MEDIA_UPLOAD: true,
    MEDIA_DOWNLOAD: true,
    BASIC_STORAGE: true,
    FREE_SERVICE: true,

    // DISABLED: Phase 2+ advanced features
    PAYMENTS: false,
    MONETIZATION: false,
    LICENSING: false,
    MARKETPLACE: false,

    // DISABLED: DCCS advanced tracking
    DCCS_REGISTRATION: false,
    DCCS_CERTIFICATES: false,
    DCCS_VERIFICATION: false,
    DCCS_ROYALTY_TRACKING: false,
    DCCS_CLEARANCE_CODES: false,
    DCCS_DISPUTES: false,

    // DISABLED: AI & Content Recognition
    AI_CONTENT_DETECTION: false,
    AI_MODERATION: false,
    AUDIO_FINGERPRINTING: false,
    COPYRIGHT_DETECTION: false,
    AI_TRAINING_CONSENT: false,

    // DISABLED: Blockchain & Web3
    BLOCKCHAIN: false,
    SMART_CONTRACTS: false,
    CRYPTO_PAYMENTS: false,
    WEB3_WALLETS: false,
    NFT_LICENSING: false,

    // DISABLED: Royalty Systems
    ROYALTY_SPLITS: false,
    INSTANT_PAYOUTS: false,
    ONGOING_ROYALTIES: false,
    ROYALTY_TRACKING: false,
    PLATFORM_MONITORING: false,

    // DISABLED: Cross-Platform Integration
    YOUTUBE_TRACKING: false,
    TIKTOK_TRACKING: false,
    SPOTIFY_TRACKING: false,
    INSTAGRAM_TRACKING: false,
    TWITCH_TRACKING: false,

    // DISABLED: Payment Providers
    STRIPE_PAYMENTS: false,
    STRIPE_CONNECT: false,
    CRYPTO_WALLET_PAYOUTS: false,

    // DISABLED: Advanced Features
    ADMIN_MODERATION: false,
    DISPUTE_RESOLUTION: false,
    KYC_VERIFICATION: false,
    LEGAL_AGREEMENTS: false,
  },

  /**
   * IP Protection Configuration
   */
  IP_PROTECTION: {
    OWNER: 'Victor360 Brand Limited',
    COPYRIGHT_YEAR: 2026,
    FRAMEWORK_NAME: 'Digital Creative Copyright System (DCCS)',
    PRESERVE_ARCHITECTURE: true,
    METADATA_PROPRIETARY: true,
  },

  /**
   * UI/UX Configuration for Phase 1
   */
  UI: {
    SHOW_PHASE_2_COMING_SOON: false,
    SHOW_MONETIZATION_MESSAGES: false,
    SHOW_DCCS_BRANDING: false,
    SHOW_PAYMENT_OPTIONS: false,
    SHOW_LICENSING_INFO: false,
    SIMPLIFIED_NAVIGATION: true,
    FREE_SERVICE_MESSAGING: true,
  },

  /**
   * Upload Configuration for Phase 1
   */
  UPLOAD: {
    REQUIRE_PAYMENT: false,
    GENERATE_DCCS_CODE: false,
    RUN_AI_DETECTION: false,
    RUN_FINGERPRINTING: false,
    CHECK_COPYRIGHT: false,
    IMMEDIATE_AVAILABILITY: true,
    FREE_UNLIMITED_UPLOADS: true,
  },

  /**
   * Download Configuration for Phase 1
   */
  DOWNLOAD: {
    REQUIRE_PAYMENT: false,
    REQUIRE_LICENSE: false,
    SHOW_DCCS_CODES: false,
    TRACK_USAGE: false,
    GENERATE_ROYALTIES: false,
    FREE_UNLIMITED_DOWNLOADS: true,
  },
} as const;

/**
 * Helper function to check if a feature is enabled in current phase
 */
export function isFeatureEnabled(feature: keyof typeof PHASE_1_CONFIG.FEATURES): boolean {
  return PHASE_1_CONFIG.FEATURES[feature] === true;
}

/**
 * Helper function to check if we're in Phase 1
 */
export function isPhase1(): boolean {
  return PHASE_1_CONFIG.CURRENT_PHASE === 1;
}

/**
 * Helper function to check if we're in Phase 2 or later
 */
export function isPhase2Plus(): boolean {
  return PHASE_1_CONFIG.CURRENT_PHASE >= 2;
}

/**
 * Get IP protection notice for display in footer/about
 */
export function getIPProtectionNotice(): string {
  const { OWNER, COPYRIGHT_YEAR, FRAMEWORK_NAME } = PHASE_1_CONFIG.IP_PROTECTION;
  return `${FRAMEWORK_NAME} © ${COPYRIGHT_YEAR} ${OWNER}. All Rights Reserved. Patent Pending.`;
}

/**
 * Routes that should be disabled in Phase 1
 */
export const DISABLED_ROUTES = {
  // Payment & Monetization
  PAYMENT_TEST: '/payment-test',
  LICENSE_DOWNLOAD: '/license-download',
  LICENSE_DETAIL: '/license/:id',

  // DCCS Features
  DCCS_REGISTRATION: '/dccs-register',
  DCCS_REGISTRATIONS: '/dccs-registrations',
  DCCS_RE_REGISTRATION: '/dccs-re-register',
  DCCS_RE_DOWNLOAD: '/dccs-redownload',
  DCCS_RE_DOWNLOAD_ALT: '/redownload',
  GET_DCCS: '/get-dccs',
  DCCS_AI_MONITORING: '/dccs-ai-monitoring',
  VERIFY_DCCS: '/verify-dccs',
  VERIFY_DCCS_CODE: '/verify-dccs-code',
  VERIFY_CODE: '/verify/:code',
  VERIFY_CERTIFICATE: '/verify-certificate/:certificateId',
  CLEARANCE_VERIFICATION: '/clearance-verification',

  // Admin & Moderation (disabled for Phase 1)
  ADMIN_PORTAL: '/admin/control',
  ADMIN_MODERATION: '/admin/moderation',

  // Premium/Monetization
  PREMIUM_DASHBOARD: '/premium-dashboard',
} as const;

/**
 * Components that should not render in Phase 1
 */
export const DISABLED_COMPONENTS = [
  'PaymentModal',
  'BlockchainPaymentModal',
  'StripeConnect',
  'InstantPayoutSystem',
  'RoyaltyTracker',
  'DCCSCertificateDisplay',
  'DCCSDownloadManager',
  'DCCSRoyaltyDashboard',
  'ClearanceCodeDisplay',
  'MetaMaskGuide',
  'AIBlockchainDashboard',
  'DisputeResolutionModal',
  'EnhancedAutomatedLicensing',
] as const;

export default PHASE_1_CONFIG;
