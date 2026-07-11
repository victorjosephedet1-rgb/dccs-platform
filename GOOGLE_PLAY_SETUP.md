# Google Play Console Setup Guide for DCCS

## Overview
This guide walks you through publishing DCCS as an Android app on Google Play Console using TWA (Trusted Web Activity).

---

## Prerequisites

1. **Google Play Console Account** ($25 one-time registration fee)
   - Sign up at: https://play.google.com/console

2. **Node.js and npm** installed on your computer

3. **Android Studio** (optional but recommended for testing)

4. **Java Development Kit (JDK)** 8 or higher

---

## Step 1: Install Bubblewrap CLI

Bubblewrap is Google's official tool for creating TWA apps:

```bash
npm install -g @bubblewrap/cli
```

---

## Step 2: Initialize Your TWA Project

```bash
# Navigate to your project root
cd /path/to/dccs-platform

# Initialize Bubblewrap (it will use twa-manifest.json)
bubblewrap init --manifest=twa-manifest.json
```

Follow the prompts:
- Package name: `com.victor360brand.dccs`
- App name: `DCCS - Digital Copyright Protection`
- Start URL: `https://dccsverify.com/?source=twa`

---

## Step 3: Generate Digital Asset Links

```bash
# Build the TWA
bubblewrap build

# Get your SHA-256 fingerprint
bubblewrap fingerprint
```

Copy the SHA-256 fingerprint and update:
1. `/public/assetlinks.json` - Replace `YOUR_SHA256_FINGERPRINT_HERE`
2. Deploy this updated file to `https://dccsverify.com/.well-known/assetlinks.json`

---

## Step 4: Build the Android App Bundle

```bash
# Build the release version
bubblewrap build --release
```

This creates: `app-release-bundle.aab`

---

## Step 5: Prepare Google Play Console Listing

### App Details
- **App name**: DCCS - Digital Copyright Protection
- **Short description**: Protect and verify your creative work instantly with digital clearance codes
- **Full description**:
```
DCCS (Digital Clearance Code System) is your all-in-one solution for protecting and verifying digital creative works.

KEY FEATURES:
✓ Instant Digital Clearance Codes - Prove ownership immediately
✓ Multi-Format Support - Audio, video, images, documents, and more
✓ Permanent Certificates - Blockchain-backed proof of ownership
✓ Public Verification Portal - Anyone can verify your clearance codes
✓ Free Phase 1 - No cost for early creators
✓ Global Protection - Works worldwide, 24/7

WHO IT'S FOR:
• Musicians & Sound Engineers
• Filmmakers & Video Creators
• Photographers & Visual Artists
• Game Developers
• Content Creators
• Brands & Businesses

HOW IT WORKS:
1. Upload your creative work
2. Get instant digital clearance code
3. Download permanent certificate
4. Share and verify anywhere

POWERED BY:
Victor360 Brand Limited - Founded by Victor Joseph Edet

Your creativity deserves protection. Start protecting your work today!
```

### Category
- **Primary**: Business
- **Secondary**: Productivity

### Content Rating
- Complete the content rating questionnaire
- Expected rating: Everyone

### Privacy Policy
- URL: `https://dccsverify.com/legal/privacy-policy.html`

### Contact Details
- Email: support@victor360brand.com
- Website: https://dccsverify.com

---

## Step 6: Upload Screenshots

### Phone Screenshots (Required - minimum 2)
Recommended size: 1080 x 1920 pixels (9:16 ratio)
Take screenshots of:
1. Upload screen
2. My Files screen
3. Verification portal
4. Certificate view
5. Profile/dashboard

### Tablet Screenshots (Optional)
Recommended size: 1200 x 1920 pixels

### Feature Graphic (Required)
Size: 1024 x 500 pixels
- Create a banner highlighting "Instant Copyright Protection"

### App Icon (Required)
Size: 512 x 512 pixels
- Use the existing `/public/android-chrome-512x512.png`

---

## Step 7: Upload to Google Play Console

1. Go to: https://play.google.com/console
2. Create a new app
3. Fill in all required information
4. Upload the `app-release-bundle.aab` file
5. Complete all sections (Content rating, Pricing, Countries)
6. Submit for review

---

## Step 8: Testing Before Release

### Internal Testing Track
1. Upload your AAB to "Internal testing"
2. Add test users (up to 100 email addresses)
3. Share the test link
4. Collect feedback

### Closed Testing (Beta)
1. Create a closed testing track
2. Add up to 100,000 testers
3. Run beta for 1-2 weeks
4. Fix any issues

### Open Testing (Optional)
1. Open to all Google Play users
2. Collect wider feedback
3. Final testing before production

---

## Step 9: Production Release

1. Set pricing (Free)
2. Select countries (All countries)
3. Set release type (Staged rollout recommended - start at 20%)
4. Submit for review
5. Wait for approval (typically 3-7 days)

---

## Maintenance & Updates

### Updating the App

```bash
# Update version in twa-manifest.json
# Increment appVersionCode and appVersionName

# Rebuild
bubblewrap build --release

# Upload new AAB to Google Play Console
# Create a new release
```

---

## Important URLs to Set Up

### Digital Asset Links
Deploy to: `https://dccsverify.com/.well-known/assetlinks.json`

Content should be the updated `/public/assetlinks.json` file

### Verification
Test your asset links at:
https://developers.google.com/digital-asset-links/tools/generator

---

## Troubleshooting

### Asset Links Not Working
1. Ensure `assetlinks.json` is accessible at `https://dccsverify.com/.well-known/assetlinks.json`
2. No redirects on this URL
3. Content-Type should be `application/json`
4. HTTPS must be valid

### App Not Installing
1. Check signing key matches
2. Verify SHA-256 fingerprint
3. Clear Google Play cache
4. Uninstall previous versions

### TWA Not Opening
1. Verify manifest.json is accessible
2. Check start_url is correct
3. Ensure HTTPS certificate is valid
4. Test in Chrome Custom Tabs first

---

## Best Practices

1. **Regular Updates**: Update every 2-4 weeks to stay current
2. **Monitor Reviews**: Respond to user reviews within 24-48 hours
3. **Test Thoroughly**: Always test on real devices before release
4. **Analytics**: Use Google Analytics in your web app
5. **Push Notifications**: Consider implementing web push
6. **Performance**: Keep app size under 50MB for faster downloads
7. **Ratings**: Encourage satisfied users to rate and review

---

## Resources

- **Bubblewrap Documentation**: https://github.com/GoogleChromeLabs/bubblewrap
- **TWA Guide**: https://developer.chrome.com/docs/android/trusted-web-activity/
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Asset Links Tool**: https://developers.google.com/digital-asset-links

---

## Support

For technical assistance:
- Email: support@victor360brand.com
- Website: https://dccsverify.com

---

**Copyright © 2026 Victor360 Brand Limited**
Founded by Victor Joseph Edet
