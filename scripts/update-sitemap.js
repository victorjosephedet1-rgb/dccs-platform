#!/usr/bin/env node

/**
 * ====================================================================
 * AUTOMATED SITEMAP GENERATOR
 * ====================================================================
 *
 * PURPOSE:
 *   Automatically updates sitemap.xml with current routes and dates
 *   Ensures search engines always have fresh metadata
 *
 * USAGE:
 *   node scripts/update-sitemap.js
 *
 * RUNS:
 *   - Automatically during build process (vite build)
 *   - Can be run manually anytime
 *
 * OUTPUT:
 *   public/sitemap.xml (overwritten)
 *
 * ====================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOMAIN = 'https://dccsverify.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// Get current date in ISO format
const currentDate = new Date().toISOString().split('T')[0];

// Define all routes with their properties
// priority: 0.0 to 1.0 (how important relative to other pages)
// changefreq: always, hourly, daily, weekly, monthly, yearly, never
const routes = [
  // High priority pages
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/demo', priority: 0.95, changefreq: 'daily' },
  { path: '/upload', priority: 0.95, changefreq: 'daily' },
  { path: '/register', priority: 0.95, changefreq: 'daily' },
  { path: '/downloads', priority: 0.9, changefreq: 'daily' },

  // DCCS System pages
  { path: '/dccs-system', priority: 0.95, changefreq: 'weekly' },
  { path: '/dccs-registration', priority: 0.95, changefreq: 'daily' },
  { path: '/dccs-verification', priority: 0.9, changefreq: 'weekly' },
  { path: '/verify', priority: 0.9, changefreq: 'weekly' },

  // Information pages
  { path: '/story', priority: 0.85, changefreq: 'monthly' },
  { path: '/library', priority: 0.8, changefreq: 'weekly' },
  { path: '/my-content', priority: 0.8, changefreq: 'weekly' },
  { path: '/safety', priority: 0.8, changefreq: 'monthly' },
  { path: '/guidelines', priority: 0.75, changefreq: 'monthly' },

  // Authentication pages
  { path: '/login', priority: 0.7, changefreq: 'monthly' },
  { path: '/careers', priority: 0.7, changefreq: 'monthly' },
  { path: '/forgot-password', priority: 0.5, changefreq: 'yearly' },
];

// Generate XML sitemap
function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Write sitemap to file
function writeSitemap() {
  try {
    const sitemap = generateSitemap();
    fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');

    const fileSize = fs.statSync(OUTPUT_FILE).size;
    const urlCount = routes.length;

    console.log('✅ Sitemap updated successfully!');
    console.log(`   - URLs: ${urlCount}`);
    console.log(`   - Size: ${fileSize} bytes`);
    console.log(`   - File: ${OUTPUT_FILE}`);
    console.log(`   - Last updated: ${currentDate}`);

    return true;
  } catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    return false;
  }
}

// Main execution
const success = writeSitemap();
process.exit(success ? 0 : 1);
