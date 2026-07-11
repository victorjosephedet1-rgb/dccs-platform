import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'artist' | 'creator'>('creator');
  const [loading, setLoading]   = useState(false);
  const [useOTP, setUseOTP]     = useState(true);
  const [otpSent, setOtpSent]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login, loginWithOTP, user } = useAuth();
  const navigate = useNavigate();
  const { track } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email.trim()) return;
    if (!useOTP && !password.trim()) return;
    setLoading(true);
    try {
      if (useOTP) {
        await loginWithOTP(email);
        setOtpSent(true);
        setCountdown(60);
      } else {
        await login(email, password, role);
        track('login_success', 'User logged in', { method: 'password' });
      }
    } catch (err) {
      console.error('[AUTH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  React.useEffect(() => {
    if (user) navigate('/upload');
  }, [user, navigate]);

  const BRAND = '#FF5A1F';
  const BRAND_ALPHA = 'rgba(255, 90, 31, 0.15)';
  const BRAND_BORDER = 'rgba(255, 90, 31, 0.3)';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: BRAND_ALPHA, border: `1px solid ${BRAND_BORDER}` }}>
            <LogIn className="h-5 w-5" style={{ color: BRAND }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('auth.login.title', 'Sign In')}
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            {t('auth.login.subtitle', 'Access your DCCS dashboard')}
          </p>
        </div>

        {/* Magic link notice */}
        {useOTP && !otpSent && (
          <div
            className="mb-6 p-3.5 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Shield className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
            <div>
              <p className="text-emerald-300 text-sm font-semibold mb-0.5">Instant Login with Magic Link</p>
              <p className="text-emerald-300/70 text-xs leading-relaxed">
                Enter your email and we'll send you a secure login link — no password needed.
              </p>
            </div>
          </div>
        )}

        {/* Magic link sent state */}
        {otpSent ? (
          <div
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.25)' }}
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Magic Link Sent!</h3>
            <p className="text-emerald-300/80 text-sm mb-3">We sent a secure login link to:</p>
            <p className="text-white font-semibold mb-5 break-all">{email}</p>

            <div className="rounded-xl p-4 mb-5 text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-emerald-300/80 text-sm font-semibold mb-2">Next steps:</p>
              <ol className="text-emerald-300/60 text-sm space-y-1.5">
                <li>1. Check your email inbox</li>
                <li>2. Click the "Log In" button in the email</li>
                <li>3. You'll be signed in automatically</li>
              </ol>
            </div>
            <p className="text-emerald-300/50 text-xs mb-5">Link expires in 60 minutes. Check spam if needed.</p>

            <button
              onClick={() => { setOtpSent(false); setCountdown(0); }}
              disabled={countdown > 0}
              className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors min-h-[44px]"
              style={{
                color: countdown > 0 ? 'rgba(52,211,153,0.4)' : '#34D399',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Send a new link'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2.5">
                {t('auth.login.roleSelection', 'I am a')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['creator', 'artist'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="py-3 px-3 rounded-xl border-2 transition-all duration-150 font-medium text-sm min-h-[48px]"
                    style={{
                      borderColor: role === r ? BRAND : 'rgba(255,255,255,0.12)',
                      background: role === r ? BRAND_ALPHA : 'rgba(255,255,255,0.04)',
                      color: role === r ? '#fff' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {r === 'creator'
                      ? t('auth.login.contentCreator', 'Content Creator')
                      : t('auth.login.musicArtist', 'Music Artist')
                    }
                  </button>
                ))}
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

            {/* Password (when not using OTP) */}
            {!useOTP && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                    {t('common.password', 'Password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs transition-colors hover:opacity-80"
                    style={{ color: BRAND }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="form-field-icon">
                  <Lock className="icon" style={{ color: 'rgba(148,163,184,0.6)' }} />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.login.enterPassword', 'Enter your password')}
                    className="form-field"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>
            )}

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
                ? <><span className="spinner" style={{ borderTopColor: '#fff', width: '1.125rem', height: '1.125rem' }} /><span>Sending...</span></>
                : <><span>{useOTP ? 'Send Magic Link' : 'Sign In'}</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>

            {/* Toggle OTP/password */}
            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={() => { setUseOTP(!useOTP); setOtpSent(false); }}
                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {useOTP ? 'Use password instead' : 'Use magic link instead'}
              </button>
              <p className="text-neutral-500 text-sm">
                {t('auth.login.noAccount', "Don't have an account?")}{' '}
                <Link to="/register" className="font-medium hover:opacity-80 transition-opacity" style={{ color: BRAND }}>
                  {t('auth.login.signUpHere', 'Sign up here')}
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
