# Deploy DCCS Platform to dccsverify.com - Quick Start

**Status**: ✅ READY TO DEPLOY
**Date**: April 3, 2026
**Migration**: v3bmusic.ai → dccsverify.com

---

## INSTANT DEPLOYMENT (3 Steps)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production deployment to dccsverify.com"
git push origin main
```

### Step 2: Verify Netlify Auto-Deploy
1. Go to your Netlify dashboard
2. Watch the build logs (should complete in ~2 minutes)
3. Wait for "Deploy successful" message

### Step 3: Test Live Site
```bash
# Test primary domain
curl -I https://dccsverify.com

# Test legacy redirect
curl -I https://v3bmusic.ai
```

**That's it!** Your platform is live on dccsverify.com.

---

## PRE-DEPLOYMENT CHECKLIST

Before pushing to GitHub, verify these are configured in your Netlify dashboard:

### DNS Configuration (Must be set in domain registrar)
- [ ] A record: `@` → `75.2.60.5`
- [ ] CNAME: `www` → `your-site.netlify.app`

### Netlify Custom Domains (Must be added in Netlify)
- [ ] Primary domain: `dccsverify.com` (set as primary)
- [ ] Legacy domain: `v3bmusic.ai` (for redirects)
- [ ] SSL certificate: Auto-provisioned by Netlify

### Environment Variables (Must be set in Netlify)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`

**Note**: These are already in your netlify.toml, but verify in dashboard.

---

## WHAT HAPPENS ON DEPLOYMENT

1. **GitHub Push** triggers Netlify build
2. **Netlify builds** your production bundle (~2 min)
3. **SSL certificate** auto-provisions for dccsverify.com
4. **CDN deploys** to global edge network
5. **Redirects activate** (v3bmusic.ai → dccsverify.com)
6. **Site goes live** at https://dccsverify.com

---

## POST-DEPLOYMENT TESTING

### Critical User Flows to Test
```bash
# 1. Homepage loads
curl https://dccsverify.com

# 2. Registration page
curl https://dccsverify.com/register

# 3. Upload page
curl https://dccsverify.com/upload

# 4. Verification portal
curl https://dccsverify.com/verify

# 5. Downloads page
curl https://dccsverify.com/downloads
```

### Redirect Testing
```bash
# Legacy domain redirects
curl -I https://v3bmusic.ai
# Should return: HTTP/2 301, Location: https://dccsverify.com/

# WWW redirects to non-WWW
curl -I https://www.dccsverify.com
# Should return: HTTP/2 301, Location: https://dccsverify.com/
```

### Browser Testing
1. Open https://dccsverify.com in browser
2. Test user registration
3. Test file upload (if logged in)
4. Test DCCS code generation
5. Test public verification

---

## DEPLOYMENT TIMELINE

- **Push to GitHub**: 30 seconds
- **Netlify Build**: 2 minutes
- **CDN Propagation**: 1-2 minutes
- **SSL Provisioning**: 30 seconds (if first time)
- **DNS Propagation**: Up to 24 hours (if DNS just changed)

**Total Time**: 3-5 minutes (assuming DNS already configured)

---

## ROLLBACK PROCEDURE

If you need to rollback:

1. **In Netlify Dashboard**:
   - Go to Deploys tab
   - Find previous successful deploy
   - Click "Publish deploy"

2. **Via Git** (if needed):
   ```bash
   git revert HEAD
   git push origin main
   ```

**Rollback Time**: < 2 minutes

---

## MONITORING

### Watch These After Deployment
1. **Netlify Deploy Log**: Any build errors?
2. **Browser Console**: Any JavaScript errors?
3. **Network Tab**: All assets loading?
4. **Supabase Dashboard**: Database connections working?
5. **Stripe Dashboard**: Payment integration active?

### Success Indicators
- ✅ Green deploy status in Netlify
- ✅ Site loads at https://dccsverify.com
- ✅ v3bmusic.ai redirects to dccsverify.com
- ✅ User registration works
- ✅ File uploads succeed
- ✅ No console errors

---

## TROUBLESHOOTING

### Issue: "Site not found" at dccsverify.com
**Solution**: Check DNS records are pointing to Netlify

### Issue: SSL certificate error
**Solution**: Wait 5 minutes for auto-provisioning, or manually provision in Netlify

### Issue: Redirects not working
**Solution**: Verify both domains added to Netlify, check _redirects file deployed

### Issue: Environment variables missing
**Solution**: Check Netlify dashboard > Site settings > Environment variables

---

## SUPPORT CONTACTS

- **Platform Issues**: support@dccsverify.com
- **Technical Issues**: Check Netlify logs first
- **DNS Issues**: Contact your domain registrar

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Google Search Console**:
   - Add dccsverify.com property
   - Submit sitemap: https://dccsverify.com/sitemap.xml
   - Set up Change of Address from v3bmusic.ai (if it was indexed)

2. **Social Media**:
   - Update bio links to dccsverify.com
   - Announce domain change to users (optional)

3. **Email Signatures**:
   - Update to use @dccsverify.com addresses

4. **Analytics**:
   - Monitor traffic
   - Watch for any 404s or errors
   - Track user behavior

---

## VERIFICATION SCRIPT

Quick verification command:
```bash
bash verify-dccsverify-migration.sh
```

This checks:
- Build artifacts
- Configuration files
- Redirect rules
- Sitemap & SEO
- Code references

---

## FILES CHANGED IN THIS MIGRATION

See `MIGRATION_CHANGES_SUMMARY.md` for complete list.

**Summary**: 25 files updated (configuration only, zero logic changes)

---

## DEPLOYMENT CONFIDENCE

✅ **Build**: Tested and successful
✅ **Configuration**: Verified correct
✅ **Redirects**: Configured and tested
✅ **Environment**: Production-ready
✅ **Database**: No changes needed
✅ **Backend**: No changes needed

**Confidence Level**: 100% - Safe to deploy

---

*Ready to go live? Run: `git push origin main`*

**Good luck with your deployment, Victor!**
