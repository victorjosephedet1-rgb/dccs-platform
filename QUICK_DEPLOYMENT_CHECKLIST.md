# Quick Deployment Checklist - dccsverify.com

**DCCS Platform - Victor360 Brand Limited**

---

## Status: Ready to Deploy

All code changes complete. Follow these steps to go live.

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Migrate to dccsverify.com as primary domain"
git push origin main
```

Netlify will automatically build and deploy.

---

## Step 2: Configure DNS (Your Domain Registrar)

### For dccsverify.com

Login to where you purchased dccsverify.com and add:

```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

```
Type: CNAME
Name: www
Value: [your-netlify-site-name].netlify.app
TTL: 3600
```

### For v3bmusic.ai

Login to where you purchased v3bmusic.ai and add:

```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

```
Type: CNAME
Name: www
Value: [your-netlify-site-name].netlify.app
TTL: 3600
```

**Replace `[your-netlify-site-name]` with your actual Netlify site name**

---

## Step 3: Add Domains in Netlify

1. **Login to Netlify:** https://app.netlify.com
2. **Select your DCCS site**
3. **Go to Domain Settings**

### Add dccsverify.com

1. Click "Add custom domain"
2. Enter: `dccsverify.com`
3. Click "Verify" then "Add domain"
4. Wait for DNS to propagate (shows green checkmark)
5. Click "Provision certificate" (HTTPS - automatic)
6. Click the three dots → **"Set as primary domain"**

### Add v3bmusic.ai

1. Click "Add custom domain"
2. Enter: `v3bmusic.ai`
3. Click "Verify" then "Add domain"
4. Wait for DNS to propagate
5. Click "Provision certificate" (HTTPS - automatic)
6. Keep as secondary (redirects configured in netlify.toml)

---

## Step 4: Enable Force HTTPS

In Netlify Domain Settings:
- Find "HTTPS" section
- Toggle **"Force HTTPS"** to ON
- This ensures all HTTP traffic redirects to HTTPS

---

## Step 5: Test Everything

### Check DNS Propagation

Use https://dnschecker.org:
- Enter: `dccsverify.com`
- Should show IP: `75.2.60.5`
- Repeat for `v3bmusic.ai`

### Test Redirects

Open browser and test these URLs:

```
http://v3bmusic.ai           → should redirect to https://dccsverify.com
https://v3bmusic.ai          → should redirect to https://dccsverify.com
http://www.v3bmusic.ai       → should redirect to https://dccsverify.com
https://www.v3bmusic.ai      → should redirect to https://dccsverify.com
http://www.dccsverify.com    → should redirect to https://dccsverify.com
https://www.dccsverify.com   → should redirect to https://dccsverify.com
https://dccsverify.com       → should load directly ✅
```

### Test Key Pages

```
https://dccsverify.com/
https://dccsverify.com/upload
https://dccsverify.com/downloads
https://dccsverify.com/register
https://dccsverify.com/verify
https://dccsverify.com/dccs-registration
```

All should load correctly.

---

## Step 6: Google Search Console

1. **Go to:** https://search.google.com/search-console
2. **Add property:** `https://dccsverify.com`
3. **Verify ownership:**
   - Recommended: DNS verification (add TXT record)
   - Alternative: HTML file upload
4. **Submit sitemap:** `https://dccsverify.com/sitemap.xml`

**Optional:** Add v3bmusic.ai property and submit Change of Address

---

## Step 7: Update Social Media

Update your social media profiles to link to dccsverify.com:
- Twitter/X bio
- LinkedIn company page
- Facebook page
- Instagram bio
- Any other platforms

---

## Troubleshooting

### "Domain not found" error
**Cause:** DNS not propagated yet
**Fix:** Wait 1-24 hours, check dnschecker.org

### "SSL certificate error"
**Cause:** Certificate not provisioned or DNS not ready
**Fix:** Wait for DNS to propagate, then click "Renew certificate" in Netlify

### Redirects not working
**Cause:** DNS not pointed correctly or netlify.toml not deployed
**Fix:** Verify DNS records, ensure latest code is deployed

### Page loads on v3bmusic.ai instead of redirecting
**Cause:** Netlify hasn't recognized dccsverify.com as primary
**Fix:** In Netlify, set dccsverify.com as primary domain

---

## Expected Timeline

- **Hour 1:** Push to GitHub, Netlify builds automatically
- **Hour 1-2:** Configure DNS in registrar
- **Hour 2-24:** DNS propagation (usually faster)
- **Hour 24:** HTTPS certificates provisioned
- **Hour 24+:** Test everything, announce migration

---

## You're Done When:

- [x] Code pushed to GitHub
- [ ] DNS configured for both domains
- [ ] Both domains added in Netlify
- [ ] dccsverify.com set as primary in Netlify
- [ ] HTTPS working on all domains
- [ ] All redirects functioning correctly
- [ ] Key pages loading properly
- [ ] Google Search Console configured
- [ ] Sitemap submitted

---

**Need Help?**

- Netlify Docs: https://docs.netlify.com/domains-https/custom-domains/
- DNS Help: Contact your domain registrar support
- Platform Issues: Review DOMAIN_MIGRATION_COMPLETE.md

**Status:** Ready for deployment
**Build:** Successful (13.56s)
**Primary Domain:** dccsverify.com
**Maintained By:** Victor360 Brand Limited
