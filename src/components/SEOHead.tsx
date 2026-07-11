import { Helmet } from 'react-helmet-async';

const BASE_URL  = 'https://dccsverify.com';
const OG_IMAGE  = `${BASE_URL}/brand-assets/logo/MY_LOGOS_1.jpg`;
const SITE_NAME = 'Digital Creative Copyright System (DCCS)';

// All supported language codes — used to generate hreflang tags
const SUPPORTED_LANGS = ['en','es','fr','de','pt','ar','zh','ja','ko','ru','hi','sw','yo','ig','ha','am','ibb','id','it','nl','no','pl','th','tr','uk','vi'] as const;

interface SEOHeadProps {
  title?:       string;
  description?: string;
  keywords?:    string;
  image?:       string;
  url?:         string;
  type?:        'website' | 'article' | 'profile';
  noIndex?:     boolean;
  // Structured data override
  schema?:      Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_TITLE       = 'DCCS — Prove You Made It | Digital Creative Copyright System';
const DEFAULT_DESCRIPTION = 'Upload any digital asset and receive a permanent, verifiable ownership code — instantly and for free. DCCS protects audio, video, images, art, documents, and more. Phase 1 open now.';
const DEFAULT_KEYWORDS    = 'DCCS, Digital Creative Copyright System, copyright protection, digital ownership, ownership code, creator rights, asset fingerprinting, proof of creation, Victor360';

// Per-route presets — imported in page components via <SEOHead {...PAGE_SEO.UPLOAD} />
export const PAGE_SEO = {
  HOME: {
    title:       DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url:         BASE_URL,
  },
  UPLOAD: {
    title:       'Upload & Protect Your Work — DCCS',
    description: 'Upload your digital asset and get an instant DCCS ownership code. Audio, video, images, PDFs, artwork — all asset types supported. Free and permanent.',
    url:         `${BASE_URL}/upload`,
    keywords:    'upload digital asset, protect creative work, DCCS upload, copyright upload, ownership code generator',
  },
  LIBRARY: {
    title:       'My Asset Library — DCCS',
    description: 'View, manage, and download all your DCCS-protected digital assets and ownership codes in one place.',
    url:         `${BASE_URL}/library`,
    noIndex:     true,
  },
  VERIFY: {
    title:       'Verify a DCCS Ownership Code',
    description: 'Enter any DCCS code to verify ownership, check the creator, and confirm registration date. Public verification — no login required.',
    url:         `${BASE_URL}/verify`,
    keywords:    'verify DCCS code, ownership verification, check copyright, digital asset verification',
  },
  DCCS_SYSTEM: {
    title:       'What is DCCS? — Digital Creative Copyright System Explained',
    description: 'DCCS (Digital Creative Copyright System) is a patent-pending technology for proving ownership of digital creative assets. Learn how it works.',
    url:         `${BASE_URL}/dccs-system`,
  },
  LOGIN: {
    title:       'Sign In — DCCS',
    description: 'Sign in to your DCCS account to upload assets and manage your ownership codes.',
    url:         `${BASE_URL}/login`,
    noIndex:     true,
  },
  REGISTER: {
    title:       'Create Your DCCS Account — Free',
    description: 'Register for free on DCCS to start protecting your digital creations with permanent ownership codes.',
    url:         `${BASE_URL}/register`,
  },
  SAFETY: {
    title:       'Safety Center — DCCS',
    description: 'Learn how DCCS protects creators and handles copyright disputes, content moderation, and platform safety.',
    url:         `${BASE_URL}/safety`,
  },
  STORY: {
    title:       'Platform Story — DCCS by Victor360 Brand Limited',
    description: 'The story behind DCCS and Victor360 Brand Limited — why we built the Digital Creative Copyright System.',
    url:         `${BASE_URL}/story`,
  },
} as const;

export default function SEOHead({
  title       = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords    = DEFAULT_KEYWORDS,
  image       = OG_IMAGE,
  url         = BASE_URL,
  type        = 'website',
  noIndex     = false,
  schema,
}: SEOHeadProps) {
  const canonicalUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const ogImage      = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  // Merge caller schema with the base schemas
  const schemas: Record<string, unknown>[] = [
    // WebApplication
    {
      '@context': 'https://schema.org',
      '@type':    'WebApplication',
      name:        SITE_NAME,
      alternateName: 'Digital Clearance Code System',
      description,
      url:         canonicalUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
      creator: {
        '@type': 'Organization',
        name:    'Victor360 Brand Limited',
        founder: { '@type': 'Person', name: 'Victor Joseph Edet', jobTitle: 'Founder' },
        url:     BASE_URL,
      },
      potentialAction: {
        '@type':  'RegisterAction',
        target:   { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/register` },
      },
    },
    // Organization
    {
      '@context': 'https://schema.org',
      '@type':    'Organization',
      name:        'Victor360 Brand Limited',
      url:         BASE_URL,
      logo:        `${BASE_URL}/brand-assets/logo/MY_LOGOS_1.jpg`,
      description: 'Creator of the Digital Creative Copyright System (DCCS)',
      founder:     { '@type': 'Person', name: 'Victor Joseph Edet', jobTitle: 'Founder & CEO' },
      sameAs: [
        'https://twitter.com/victor360brand',
        'https://linkedin.com/company/victor360brand',
      ],
    },
    // Service
    {
      '@context': 'https://schema.org',
      '@type':    'Service',
      name:        'Digital Creative Copyright System',
      serviceType: 'Copyright Protection & Verification',
      provider:    { '@type': 'Organization', name: 'Victor360 Brand Limited' },
      areaServed:  'Worldwide',
      availableChannel: {
        '@type':        'ServiceChannel',
        serviceUrl:     BASE_URL,
        availableLanguage: SUPPORTED_LANGS,
      },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP', description: 'Free during Phase 1 launch' },
    },
  ];

  // Append any caller-provided schema
  if (schema) {
    if (Array.isArray(schema)) schemas.push(...schema);
    else schemas.push(schema);
  }

  return (
    <Helmet>
      {/* Core */}
      <title>{title}</title>
      <meta name="description"  content={description} />
      <meta name="keywords"     content={keywords} />
      <meta name="author"       content="Victor360 Brand Limited" />
      <meta name="copyright"    content="Victor360 Brand Limited" />
      <meta name="publisher"    content="Victor360 Brand Limited" />
      <meta name="theme-color"  content="#FF5A1F" />
      <meta name="viewport"     content="width=device-width, initial-scale=1.0" />
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'}
      />
      <meta
        name="googlebot"
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'}
      />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang — one per supported language, all pointing to canonical */}
      {SUPPORTED_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={canonicalUrl} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:creator"     content="@victor360brand" />
      <meta name="twitter:site"        content="@dccsverify" />

      {/* PWA / mobile */}
      <meta name="mobile-web-app-capable"            content="yes" />
      <meta name="apple-mobile-web-app-capable"      content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title"        content="DCCS" />

      {/* Structured data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}
