# Domain Setup Guide - v3bmusic.ai & dccsverify.com

**DCCS Platform - Victor360 Brand Limited**

---

## Overview

This guide explains how to configure your two production domains:

1. **v3bmusic.ai** - Main creator platform (Phase 1 - Active)
2. **dccsverify.com** - Verification hub (Phase 2 - Future)

---

## Prerequisites

- Domain registrar access (where you bought the domains)
- Netlify account with project deployed
- DNS propagation can take 24-48 hours

---

## Part 1: Configure v3bmusic.ai (Primary Platform)

### Step 1: Add Domain in Netlify

1. Log into Netlify Dashboard
2. Select your DCCS project
3. Go to **Domain Settings** → **Add Custom Domain**
4. Enter: `v3bmusic.ai`
5. Click **Verify** → **Add domain**

### Step 2: Configure DNS Records

**In your domain registrar (Namecheap, GoDaddy, etc.):**

Add these DNS records for `v3bmusic.ai`:

```
Type    Name    Value                           TTL
A       @       75.2.60.5                      Auto
CNAME   www     [your-site].netlify.app        Auto
```

**Example for Netlify site named "dccs-platform":**
```
Type    Name    Value                           TTL
A       @       75.2.60.5                      3600
CNAME   www     dccs-platform.netlify.app      3600
```

### Step 3: Enable HTTPS

1. In Netlify Domain Settings
2. Wait for DNS to propagate (check status indicator)
3. Click **Verify DNS Configuration**
4. Click **Provision Certificate** (automatic via Let's Encrypt)
5. Enable **Force HTTPS**

### Step 4: Set as Primary Domain

1. In Netlify Domain Settings
2. Click the three dots next to `v3bmusic.ai`
3. Select **Set as primary domain**
4. All traffic now redirects to `https://v3bmusic.ai`

---

## Part 2: Configure dccsverify.com (Future Verification Hub)

### Option A: Point to Same Netlify Site (Recommended for Now)

**Why:** Share the same codebase until Phase 2 is ready

1. In Netlify, add custom domain: `dccsverify.com`
2. Add DNS records in registrar:

```
Type    Name    Value                           TTL
A       @       75.2.60.5                      3600
CNAME   www     [your-site].netlify.app        3600
```

3. Enable HTTPS (automatic)
4. Keep `v3bmusic.ai` as primary domain

**Result:** Both domains point to same site with automatic redirect configured in `netlify.toml`

### Option B: Separate Netlify Site (Phase 2 Ready)

**When:** You're ready to launch dedicated verification platform

1. Create new Netlify site for verification app
2. Deploy verification-focused React app
3. Add custom domain: `dccsverify.com`
4. Configure DNS (same as above)
5. Link to shared Supabase backend

---

## Part 3: Verify Configuration

### Test v3bmusic.ai

Open browser and test:

```
http://v3bmusic.ai           → redirects to https://v3bmusic.ai
http://www.v3bmusic.ai       → redirects to https://v3bmusic.ai
https://v3bmusic.ai          → ✅ Loads correctly
https://www.v3bmusic.ai      → redirects to https://v3bmusic.ai
```

### Test dccsverify.com

```
http://dccsverify.com        → redirects to https://dccsverify.com
http://www.dccsverify.com    → redirects to https://dccsverify.com
https://dccsverify.com       → ✅ Loads correctly
https://www.dccsverify.com   → redirects to https://dccsverify.com
```

### Test Specific Pages

```
https://v3bmusic.ai/upload
https://v3bmusic.ai/downloads
https://v3bmusic.ai/register
https://v3bmusic.ai/verify
https://dccsverify.com/verify
```

---

## Part 4: DNS Propagation Check

### Check DNS Records

Use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

Enter your domain and check if A record shows `75.2.60.5`

### Typical Propagation Times

- Fastest: 5-10 minutes
- Average: 1-2 hours
- Maximum: 24-48 hours

### During Propagation

You may see:
- Mixed results (some locations work, others don't)
- Certificate errors (until DNS fully propagates)
- "Domain not found" errors

**Solution:** Wait and recheck every hour

---

## Part 5: Email Configuration (Optional)

### Custom Email Addresses

If you want `info@v3bmusic.ai` or `support@dccsverify.com`:

**Option 1: Email Forwarding (Free)**
- Most registrars offer email forwarding
- Forward to your existing Gmail/Outlook
- Example: `info@v3bmusic.ai` → `yourname@gmail.com`

**Option 2: Google Workspace ($6/user/month)**
- Professional email hosting
- Full Gmail interface
- Custom domain emails

**Option 3: Zoho Mail (Free tier available)**
- 5GB storage free
- Professional email
- Custom domain

---

## Part 6: SSL Certificate Issues

### Common SSL Problems

**Problem:** "Certificate not valid for domain"
**Solution:** Wait for DNS propagation, then re-provision in Netlify

**Problem:** Mixed content warnings
**Solution:** Ensure all resources use HTTPS in code

**Problem:** Certificate expired
**Solution:** Netlify auto-renews; check domain settings

### Force Certificate Renewal

1. Netlify Dashboard → Domain Settings
2. HTTPS Section → Renew Certificate
3. Wait 1-2 minutes for new certificate

---

## Part 7: Redirects Configuration

### Current Setup (netlify.toml)

```toml
# Redirect www to non-www
[[redirects]]
from = "https://www.v3bmusic.ai/*"
to = "https://v3bmusic.ai/:splat"
status = 301
force = true

[[redirects]]
from = "https://www.dccsverify.com/*"
to = "https://dccsverify.com/:splat"
status = 301
force = true
```

### Adding Custom Redirects

Example: Redirect old URLs

```toml
[[redirects]]
from = "/old-page"
to = "/new-page"
status = 301

[[redirects]]
from = "/blog/*"
to = "https://blog.v3bmusic.ai/:splat"
status = 301
```

---

## Part 8: Performance Optimization

### Enable Netlify Features

**1. Asset Optimization**
- Settings → Build & Deploy → Post Processing
- Enable: Bundle CSS, Minify CSS, Minify JS
- Enable: Image optimization

**2. CDN Cache**
- Automatically enabled
- Global edge network
- Static assets cached worldwide

**3. Prerendering**
- For better SEO
- Settings → Build & Deploy → Prerendering
- Enable for public pages

### Performance Headers (Already Configured)

```toml
[[headers]]
for = "/assets/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"
```

---

## Part 9: Monitoring & Analytics

### Free Monitoring Tools

**1. Google Search Console**
- Add both domains
- Verify ownership via DNS TXT record
- Monitor search performance

**2. Cloudflare Analytics (Optional)**
- Point DNS through Cloudflare
- Free tier includes analytics
- DDoS protection included

**3. Netlify Analytics ($9/month)**
- Server-side analytics
- No JavaScript required
- More accurate than client-side

**4. Plausible/Fathom (Privacy-focused)**
- GDPR compliant
- Lightweight
- Simple dashboard

### Uptime Monitoring

**Free Services:**
- UptimeRobot (50 monitors free)
- Freshping (50 monitors free)
- StatusCake (10 monitors free)

**Setup:**
1. Create account
2. Add monitor for `https://v3bmusic.ai`
3. Add monitor for `https://dccsverify.com`
4. Configure email alerts

---

## Part 10: Troubleshooting

### Domain Not Working

**Check:**
1. DNS records correct?
2. DNS propagated? (use dnschecker.org)
3. Netlify domain added and verified?
4. HTTPS certificate provisioned?

### Redirect Loop

**Cause:** Conflicting redirect rules
**Fix:** Review netlify.toml redirects, remove duplicates

### 404 Errors

**Cause:** Missing SPA fallback
**Fix:** Verify this is in netlify.toml:

```toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Slow Loading

**Solutions:**
1. Enable asset optimization in Netlify
2. Optimize images (use WebP format)
3. Enable CDN caching
4. Minimize JavaScript bundle size

---

## Part 11: Security Checklist

- [ ] HTTPS enforced (Force HTTPS enabled)
- [ ] Security headers configured (in netlify.toml)
- [ ] www → non-www redirect active
- [ ] Environment variables secure (never in code)
- [ ] CORS properly configured
- [ ] Rate limiting enabled (Supabase RLS)
- [ ] Supabase API keys rotated regularly

---

## Part 12: Post-Launch Checklist

### Day 1: Launch Day

- [ ] Both domains accessible via HTTPS
- [ ] All pages loading correctly
- [ ] Forms working (registration, upload)
- [ ] Database connections working
- [ ] Payment system functional (if applicable)
- [ ] Email notifications sending
- [ ] Mobile responsive on all devices

### Week 1: Monitor

- [ ] Check error logs daily (Netlify Functions)
- [ ] Monitor Supabase usage
- [ ] Review user feedback
- [ ] Test on multiple browsers
- [ ] Check SEO indexing status

### Month 1: Optimize

- [ ] Review performance metrics
- [ ] Optimize slow pages
- [ ] Fix any reported bugs
- [ ] Update documentation
- [ ] Plan Phase 2 features

---

## Quick Reference

### DNS Records Summary

**v3bmusic.ai:**
```
A       @       75.2.60.5
CNAME   www     [your-site].netlify.app
```

**dccsverify.com:**
```
A       @       75.2.60.5
CNAME   www     [your-site].netlify.app
```

### Important URLs

- Netlify Dashboard: https://app.netlify.com
- Supabase Dashboard: https://app.supabase.com
- DNS Checker: https://dnschecker.org
- SSL Checker: https://www.ssllabs.com/ssltest/

---

## Support Resources

- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://www.netlify.com/support/
- DNS Help: Your domain registrar support
- Community: Netlify Discord, Stack Overflow

---

**Status:** Configuration Guide
**Last Updated:** April 2, 2026
**Maintained By:** Victor360 Brand Limited
