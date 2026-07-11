# Security Policy

**Platform:** Digital Creative Copyright System (DCCS)
**Operated by:** Victor360 Brand Limited

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately.

**Do not** open a public GitHub issue for security vulnerabilities.

Contact: security@dccsverify.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if known)

We will acknowledge reports within 48 hours and aim to resolve critical issues within 7 days.

## Security Architecture

### Authentication
- Supabase Auth with email/password
- JWT tokens with automatic rotation
- Row Level Security (RLS) on every database table
- All RLS policies use `(select auth.uid())` for performance

### Data Protection
- GDPR Right to Erasure via the DCCSDeletionService pipeline
- GDPR-compliant audit logs retained after deletion (anonymised reference only)
- Supabase anon key is public by design — all data access controlled by RLS
- No production secrets stored in frontend code

### Transport Security
- HTTPS enforced via HSTS with 1-year max-age
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Content-Security-Policy restricts script and connection sources

### Deployment Security
- All deployments gate on lint + typecheck + dependency audit
- npm audit --audit-level=high blocks deploys with high/critical CVEs
- Secret scanning via TruffleHog on every CI run
- Build artifacts are immutable and content-addressed
- No force pushes to main (branch protection rule)

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com;
img-src 'self' data: blob: https:;
font-src 'self' data:;
frame-src https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
```

## Dependency Management

- Dependabot alerts enabled
- `npm audit --audit-level=high` runs on every CI pipeline
- Dev dependencies excluded from production audit (`--omit=dev`)

## Supported Versions

| Version | Supported |
|---|---|
| Latest production | YES |
| Previous deploy | NO (use rollback) |
