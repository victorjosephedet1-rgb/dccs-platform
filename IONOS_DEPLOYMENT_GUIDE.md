# IONOS Deployment Guide for dccsverify.com

**Platform:** DCCS - Digital Creative Copyright System
**Primary Domain:** dccsverify.com
**Legacy Domains:** v3bmusic.ai, dccs.platform (301 redirects configured)
**Company:** Victor360 Brand Limited
**Date:** April 2, 2026

---

## Prerequisites

- ✅ IONOS account with dccsverify.com domain registered and active
- ✅ SSH/FTP access to IONOS web space
- ✅ Node.js 20+ installed locally for building
- ✅ All environment variables ready (Supabase credentials)

---

## Step 1: Build the Application Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -lh dist/
```

**Expected Output:**
- `dist/` folder containing all production files
- Total size: ~5-10 MB
- Key files: `index.html`, `assets/`, `_redirects`

---

## Step 2: IONOS Control Panel Setup

### A. Configure Domain DNS

1. Log in to IONOS Control Panel
2. Navigate to **Domains & SSL**
3. Select **dccsverify.com**
4. Click **DNS Settings**
5. Ensure these records exist:

```
Type    Name    Value                   TTL
A       @       [Your IONOS Server IP]  3600
CNAME   www     dccsverify.com          3600
```

6. Save changes and wait 5-10 minutes for DNS propagation

### B. Configure SSL Certificate

1. In IONOS Control Panel, go to **SSL Certificates**
2. Click **Activate SSL** for dccsverify.com
3. Select **Let's Encrypt (Free)** or use your own certificate
4. Enable **Automatic Renewal**
5. Force HTTPS redirect (if available in panel)

---

## Step 3: Upload Files to IONOS

### Option A: FTP/SFTP Upload (Recommended)

1. **Get FTP Credentials:**
   - In IONOS Control Panel: **Hosting** → **FTP Access**
   - Note: Host, Username, Password, Port

2. **Connect via FTP Client (FileZilla, Cyberduck, etc.):**
   ```
   Host: ftp.yourdomain.com (or IP address)
   Username: your_ftp_username
   Password: your_ftp_password
   Port: 21 (FTP) or 22 (SFTP)
   ```

3. **Upload Build Files:**
   - Navigate to your web root directory (usually `/` or `/public_html/`)
   - Upload **entire contents** of `dist/` folder
   - **Important:** Upload the folder CONTENTS, not the folder itself
   - Verify all files uploaded successfully

### Option B: File Manager Upload

1. In IONOS Control Panel, go to **File Manager**
2. Navigate to web root directory
3. Click **Upload**
4. Select all files from `dist/` folder
5. Wait for upload to complete

---

## Step 4: Configure Server Settings

### A. Apache Configuration (.htaccess)

IONOS typically uses Apache. Create/update `.htaccess` file in web root:

```apache
# DCCS Platform - dccsverify.com
# Apache Configuration for Single Page Application

# Enable Rewrite Engine
RewriteEngine On
RewriteBase /

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.dccsverify\.com [NC]
RewriteRule ^(.*)$ https://dccsverify.com/$1 [L,R=301]

# Legacy domain redirects (v3bmusic.ai → dccsverify.com)
RewriteCond %{HTTP_HOST} ^(www\.)?v3bmusic\.ai [NC]
RewriteRule ^(.*)$ https://dccsverify.com/$1 [L,R=301]

# Legacy domain redirects (dccs.platform → dccsverify.com)
RewriteCond %{HTTP_HOST} ^(www\.)?dccs\.platform [NC]
RewriteRule ^(.*)$ https://dccsverify.com/$1 [L,R=301]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# Asset Caching
<IfModule mod_expires.c>
    ExpiresActive On

    # Images
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"

    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"

    # Fonts
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"

    # HTML (short cache)
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# SPA Routing - Redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/index\.html$
RewriteRule . /index.html [L]
```

**Upload this file to your web root directory.**

---

## Step 5: Environment Variables Configuration

### Option A: IONOS PHP Application (if available)

1. Go to **Hosting** → **Application Settings**
2. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://aqpvcvflwihrisjxmlfz.supabase.co
   VITE_SUPABASE_ANON_KEY=[your_supabase_anon_key]
   VITE_STRIPE_PUBLISHABLE_KEY=[your_stripe_key]
   ```

### Option B: Pre-built (Current Method)

Since Vite builds environment variables into the static files, they're already included in your `dist/` folder. No additional configuration needed.

**Note:** For production, verify these are set correctly in `.env.production` before building.

---

## Step 6: Configure Legacy Domain Redirects (v3bmusic.ai)

### If v3bmusic.ai is also hosted on IONOS:

1. Access v3bmusic.ai web space
2. Create `.htaccess` with:
   ```apache
   RewriteEngine On
   RewriteRule ^(.*)$ https://dccsverify.com/$1 [L,R=301]
   ```

### If v3bmusic.ai is on different hosting:

1. Update DNS to point to IONOS
2. Follow same redirect configuration above

OR

1. Use domain forwarding in registrar settings
2. Set 301 permanent redirect to dccsverify.com

---

## Step 7: Verification & Testing

### A. DNS Propagation Check

```bash
# Check DNS resolution
nslookup dccsverify.com
dig dccsverify.com

# Check from multiple locations
# https://dnschecker.org/
```

### B. Site Accessibility Tests

Visit these URLs and verify they all work:

1. **Primary Domain:**
   - https://dccsverify.com ✅
   - https://dccsverify.com/upload ✅
   - https://dccsverify.com/register ✅
   - https://dccsverify.com/verify ✅

2. **Redirects (should go to dccsverify.com):**
   - https://www.dccsverify.com → https://dccsverify.com ✅
   - https://v3bmusic.ai → https://dccsverify.com ✅
   - https://www.v3bmusic.ai → https://dccsverify.com ✅
   - http://dccsverify.com → https://dccsverify.com ✅

### C. SSL Certificate Check

```bash
# Check SSL certificate
openssl s_client -connect dccsverify.com:443 -servername dccsverify.com

# Or use online tool:
# https://www.ssllabs.com/ssltest/
```

**Expected:** Grade A or A+ SSL rating

### D. Functional Testing

Test core platform features:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] File upload system functional
- [ ] DCCS certificate generation works
- [ ] Verification portal accessible
- [ ] Download system works
- [ ] All routes navigate correctly
- [ ] Images and assets load
- [ ] PWA installable

### E. Performance Testing

```bash
# Test page load speed
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://dccsverify.com

# Run Lighthouse audit
# Use Chrome DevTools → Lighthouse
# Or: https://pagespeed.web.dev/
```

**Target Metrics:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

---

## Step 8: Supabase Configuration

### Update Supabase Authentication URLs

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add dccsverify.com to allowed URLs:
   ```
   Site URL: https://dccsverify.com
   Redirect URLs:
   - https://dccsverify.com/*
   - https://dccsverify.com/sso/callback
   - https://dccsverify.com/reset-password
   ```
5. **Remove or keep v3bmusic.ai URLs** (keep for 30 days during transition)
6. Save changes

### Update Supabase Storage CORS

1. In Supabase Dashboard: **Storage** → **Policies**
2. Ensure CORS allows dccsverify.com:
   ```sql
   -- Check current CORS settings
   SELECT * FROM storage.buckets;
   ```
3. Update if necessary via Supabase Dashboard

---

## Step 9: Update External Services

### Stripe

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Update webhook URLs from v3bmusic.ai to dccsverify.com
4. Update redirect URLs in Stripe Connect settings

### Google Search Console

1. Add dccsverify.com as new property
2. Verify ownership via DNS or HTML file upload
3. Submit sitemap: https://dccsverify.com/sitemap.xml
4. Set up **Change of Address** from v3bmusic.ai → dccsverify.com

### Analytics (if configured)

Update any analytics tracking (Google Analytics, etc.) to recognize dccsverify.com

---

## Step 10: Monitoring & Maintenance

### A. Set Up Uptime Monitoring

Use services like:
- UptimeRobot (free): https://uptimerobot.com
- Pingdom
- StatusCake

Monitor:
- https://dccsverify.com (every 5 minutes)
- Alert via email/SMS if down

### B. Check Server Logs

In IONOS Control Panel:
- **Hosting** → **Logs**
- Monitor for 404 errors
- Check for redirect issues
- Review access patterns

### C. Regular Maintenance

**Daily:**
- Check uptime status
- Monitor error logs

**Weekly:**
- Review performance metrics
- Check SSL certificate expiry
- Test core functionality

**Monthly:**
- Update dependencies: `npm update`
- Rebuild and redeploy: `npm run build`
- Review and optimize

---

## Troubleshooting

### Issue: Site shows "404 Not Found"

**Solution:**
- Verify files uploaded to correct directory
- Check .htaccess exists and is correct
- Verify DNS points to correct server

### Issue: CSS/JS not loading

**Solution:**
- Check file permissions (should be 644 for files, 755 for directories)
- Verify asset paths in index.html
- Clear browser cache
- Check IONOS file manager for missing files

### Issue: Redirects not working

**Solution:**
- Verify .htaccess uploaded correctly
- Check if mod_rewrite is enabled on server
- Test redirect rules individually
- Check IONOS redirect settings in control panel

### Issue: SSL errors

**Solution:**
- Verify SSL certificate is active
- Force HTTPS in IONOS settings
- Check mixed content warnings (http resources on https page)
- Wait 24 hours for SSL propagation

### Issue: Supabase connection fails

**Solution:**
- Verify environment variables are correct
- Check Supabase project is active
- Verify allowed URLs in Supabase auth settings
- Check CORS configuration

---

## Rollback Plan

If critical issues occur:

1. **Keep backup of previous deployment**
   ```bash
   # Before deploying new version
   mkdir -p backups/$(date +%Y%m%d)
   cp -r dist/* backups/$(date +%Y%m%d)/
   ```

2. **Quick Rollback:**
   - Upload backup files via FTP
   - Restore previous .htaccess
   - Clear server cache

3. **DNS Rollback:**
   - Revert DNS changes in IONOS panel
   - Wait for propagation (up to 24 hours)

---

## Post-Deployment Checklist

- [ ] All files uploaded successfully
- [ ] .htaccess configured correctly
- [ ] SSL certificate active and valid
- [ ] DNS pointing to IONOS server
- [ ] dccsverify.com loads correctly
- [ ] www.dccsverify.com redirects to dccsverify.com
- [ ] v3bmusic.ai redirects to dccsverify.com
- [ ] All routes work (upload, register, verify, etc.)
- [ ] User authentication functional
- [ ] File uploads working
- [ ] Supabase connection verified
- [ ] Images and assets loading
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] Lighthouse score 90+
- [ ] Uptime monitoring configured
- [ ] Google Search Console configured
- [ ] Stripe webhooks updated
- [ ] Email notifications working
- [ ] Backup created

---

## Support Contacts

**IONOS Support:**
- Phone: [Your IONOS support number]
- Email: support@ionos.com
- Portal: https://www.ionos.com/help/

**Platform Issues:**
- Email: support@dccsverify.com
- Developer: info@victor360brand.com

---

## Additional Resources

- IONOS Help Center: https://www.ionos.com/help/
- Supabase Documentation: https://supabase.com/docs
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html
- Apache mod_rewrite: https://httpd.apache.org/docs/current/mod/mod_rewrite.html

---

**Deployment completed successfully! 🚀**

**Live Site:** https://dccsverify.com
**Status:** Production Ready
**Last Updated:** April 2, 2026
