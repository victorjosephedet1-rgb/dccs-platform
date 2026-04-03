import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'Digital Creative Copyright System (DCCS) | Prove Ownership of Digital Assets',
  description = 'Digital Creative Copyright System (DCCS) - Prove ownership of digital assets with unique clearance codes. Upload, fingerprint, and receive permanent ownership certificates. Free Phase 1 by Victor360 Brand Limited.',
  keywords = 'DCCS, Digital Creative Copyright System, Digital Clearance Code System, copyright protection, digital ownership, asset fingerprinting, creator rights, ownership verification, Victor360 Brand Limited',
  image = '/brand-assets/logo/MY_LOGOS_1.jpg',
  url = 'https://dccs.platform',
  type = 'website'
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Victor360 Brand Limited" />
      <meta name="copyright" content="Victor360 Brand Limited" />
      <meta name="publisher" content="Victor360 Brand Limited" />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Digital Creative Copyright System (DCCS)" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@victor360brand" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="DCCS" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Digital Creative Copyright System (DCCS)",
          "alternateName": "Digital Clearance Code System",
          "description": description,
          "url": url,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Any",
          "installUrl": url,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          },
          "creator": {
            "@type": "Organization",
            "name": "Victor360 Brand Limited",
            "founder": {
              "@type": "Person",
              "name": "Victor Joseph Edet",
              "jobTitle": "Founder"
            },
            "url": "https://dccs.platform",
            "description": "Digital Creative Copyright System - Prove ownership of digital assets"
          }
        })}
      </script>
    </Helmet>
  );
}