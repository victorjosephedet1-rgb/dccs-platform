import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState<'artist' | 'creator'>('creator');
  const [loading, setLoading]   = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const { track } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    track('register_start', 'Registration form submitted', { role });
    try {
      await register(email, password, name, role);
      track('register_success', 'Registration completed', { role });
      setOtpSent(true);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) navigate(user.role === 'artist' ? '/dashboard' : '/upload');
  }, [user, navigate]);

  const BRAND        = '#FF5A1F';
  const BRAND_ALPHA  = 'rgba(255, 90, 31, 0.12)';
  const BRAND_BORDER = 'rgba(255, 90, 31, 0.28)';

  const ROLE_OPTIONS = [
    {
      value: 'creator' as const,
      label: t('auth.register.licenseMusic', 'License Content'),
      sub: t('auth.register.forCreators', 'For creators & brands'),
    },
    {
      value: 'artist' as const,
      label: t('auth.register.sellMusic', 'Sell / Distribute'),
      sub: t('auth.register.forArtists', 'For artists & musicians'),
    },
  ];

  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div
            className="rounded-2xl p-7 sm:p-10 text-center"
            style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.22)' }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Link Sent!</h2>
            <p className="text-emerald-300/80 text-sm mb-3">We sent a secure verification link to:</p>
            <p className="text-white font-semibold mb-6 break-all">{email}</p>

            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-emerald-300/80 text-sm font-semibold mb-2.5">Next steps:</p>
              <ol className="text-emerald-300/60 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center mt-0.5">1</span>
                  Check your email inbox
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center mt-0.5">2</span>
                  Click the verification link in the email
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center mt-0.5">3</span>
                  You'll be signed in automatically
                </li>
              </ol>
            </div>

            <p className="text-emerald-300/50 text-xs mb-5">Link expires in 60 minutes. Check spam if needed.</p>

            <button
              onClick={() => setOtpSent(false)}
              className="w-full py-2.5 text-sm font-medium text-neutral-400 hover:text-white rounded-lg transition-colors min-h-[44px]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: BRAND_ALPHA, border: `1px solid ${BRAND_BORDER}` }}
          >
            <UserPlus className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('auth.register.title', 'Create Account')}
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            {t('auth.register.subtitle', 'Join the global ownership registry')}
          </p>
        </div>

        {/* Feature highlights */}
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ background: BRAND_ALPHA, border: `1px solid ${BRAND_BORDER}` }}
        >
          <p className="text-white text-sm font-semibold mb-2.5">
            {t('auth.register.revolutionaryTitle', 'Why DCCS?')}
          </p>
          <ul className="space-y-1.5">
            {[
              t('auth.register.features.exclusiveTech', 'Patent-pending fingerprinting technology'),
              t('auth.register.features.firstOfKind', 'First-of-kind clearance code system'),
              t('auth.register.features.patentPending', 'Instant, immutable ownership proof'),
              t('auth.register.features.transparency', 'Fully transparent verification'),
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-xs text-neutral-300">
                <CheckCircle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" style={{ color: BRAND }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2.5">
              {t('auth.register.wantTo', 'I want to')}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_OPTIONS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="py-3 px-3 rounded-xl border-2 transition-all duration-150 text-sm text-left min-h-[56px]"
                  style={{
                    borderColor: role === value ? BRAND : 'rgba(255,255,255,0.12)',
                    background: role === value ? BRAND_ALPHA : 'rgba(255,255,255,0.04)',
                    color: role === value ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
              {role === 'artist'
                ? t('auth.register.artistName', 'Artist name')
                : t('auth.register.fullName', 'Full name')
              }
            </label>
            <div className="form-field-icon">
              <User className="icon" style={{ color: 'rgba(148,163,184,0.6)' }} />
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'artist'
                  ? t('auth.register.enterArtistName', 'Enter your artist name')
                  : t('auth.register.enterFullName', 'Enter your full name')
                }
                className="form-field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('auth.login.emailAddress', 'Email address')}
            </label>
            <div className="form-field-icon">
              <Mail className="icon" style={{ color: 'rgba(148,163,184,0.6)' }} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.enterEmail', 'Enter your email')}
                className="form-field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('common.password', 'Password')}
            </label>
            <div className="form-field-icon">
              <Lock className="icon" style={{ color: 'rgba(148,163,184,0.6)' }} />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.register.createPassword', 'Create a strong password')}
                className="form-field"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-600">
              {t('auth.register.passwordSecurity', 'Use at least 8 characters with letters and numbers.')}
            </p>
          </div>

          {/* Terms */}
          <p className="text-xs text-neutral-600 leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="/legal/terms-of-service.html" className="text-neutral-500 hover:text-white transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/legal/privacy-policy.html" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</a>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 min-h-[52px]"
            style={{
              background: BRAND,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? <><span className="spinner" style={{ borderTopColor: '#fff', width: '1.125rem', height: '1.125rem' }} /><span>{t('auth.register.creatingAccount', 'Creating account...')}</span></>
              : <><span>{t('auth.register.createAccount', 'Create Account')}</span><ArrowRight className="h-4 w-4" /></>
            }
          </button>

          <div className="text-center">
            <p className="text-neutral-500 text-sm">
              {t('auth.register.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: BRAND }}>
                {t('auth.register.signInHere', 'Sign in here')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
