# Domain Configuration

## Your Domains

### Primary Platform: **v3bmusic.ai**
- Main application (registration, upload, downloads, user dashboard)
- Public-facing brand domain
- All user interactions happen here

### Verification Portal: **dccsverify.com**
- Public verification lookups
- DCCS code verification
- Certificate validation
- Read-only verification services

---

## Domain Setup Instructions

### On Netlify:

1. **Add both custom domains:**
   - Go to: Site settings → Domain management → Custom domains
   - Add: `v3bmusic.ai` (primary)
   - Add: `dccsverify.com` (verification portal)

2. **Configure DNS:**

   **For v3bmusic.ai:**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: <your-netlify-site>.netlify.app
   ```

   **For dccsverify.com:**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: <your-netlify-site>.netlify.app
   ```

3. **Enable HTTPS:**
   - Netlify will automatically provision SSL certificates
   - Force HTTPS redirect: Enable in Netlify settings

---

## Current Configuration

### Local Development
- URL: `http://localhost:5173`
- Use this for development and testing

### Production URLs
After deployment:
- Main app: `https://v3bmusic.ai`
- Verification: `https://dccsverify.com`
- Both domains point to the same Netlify site
- The app will route verification pages to both domains

---

## Routing Strategy

The platform uses path-based routing. Both domains serve the same application:

**v3bmusic.ai** (Primary):
- `/` - Landing page
- `/upload` - Upload content
- `/downloads` - Browse downloads
- `/my-content` - User dashboard
- `/register` - Sign up
- `/login` - Sign in

**dccsverify.com** (Verification):
- `/verify` - Public verification portal
- `/verify-code` - DCCS code lookup
- `/dccs-verification` - Certificate validation
- All verification URLs work on both domains

---

## Next Steps

1. Point your domain DNS records to Netlify (see DNS configuration above)
2. Add custom domains in Netlify dashboard
3. Wait for SSL provisioning (usually 1-2 minutes)
4. Test both domains work correctly

The platform is ready to deploy once you've configured the domains in Netlify.
