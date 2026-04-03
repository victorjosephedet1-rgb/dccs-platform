import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'artist' | 'creator'>('creator');
  const [loading, setLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(true); // OTP is default - fast and easy!
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login, loginWithOTP, verifyOTP, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      console.log('[AUTH] Submit ignored - already processing');
      return;
    }

    if (!email || !email.trim()) {
      console.log('[AUTH] Submit ignored - email is empty');
      return;
    }

    if (!useOTP && (!password || !password.trim())) {
      console.log('[AUTH] Submit ignored - password is empty');
      return;
    }

    setLoading(true);

    try {
      if (useOTP) {
        console.log('[AUTH] Requesting magic link for:', email);
        await loginWithOTP(email);
        setOtpSent(true);
        setCountdown(60);
        console.log('[AUTH] Magic link sent successfully');
      } else {
        console.log('[AUTH] Logging in with password for:', email);
        await login(email, password, role);
        console.log('[AUTH] Login successful');
      }
    } catch (error) {
      console.error('[AUTH ERROR] Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for resend button
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect after successful login
  React.useEffect(() => {
    if (user) {
      navigate('/upload');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <LogIn className="h-8 w-8" style={{ color: '#FF5A1F' }} />
            <h2 className="text-3xl font-bold text-white">{t('auth.login.title')}</h2>
          </div>
          <p className="text-slate-400">{t('auth.login.subtitle')}</p>
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-200 text-sm font-medium mb-1">
                  Instant Login with Magic Link
                </p>
                <p className="text-emerald-200/80 text-xs">
                  Enter your email and we'll send you a secure login link - no passwords needed!
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">{t('auth.login.roleSelection')}</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className="flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium"
                  style={{
                    borderColor: role === 'creator' ? '#FF5A1F' : 'rgba(255, 255, 255, 0.2)',
                    background: role === 'creator' ? 'rgba(255, 90, 31, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: role === 'creator' ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {t('auth.login.contentCreator')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className="flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium"
                  style={{
                    borderColor: role === 'artist' ? '#FF5A1F' : 'rgba(255, 255, 255, 0.2)',
                    background: role === 'artist' ? 'rgba(255, 90, 31, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: role === 'artist' ? '#fff' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {t('auth.login.musicArtist')}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.login.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-lg rounded-lg text-white placeholder-slate-400 focus:outline-none"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF5A1F';
                    e.target.style.boxShadow = '0 0 0 2px rgba(255, 90, 31, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder={t('auth.login.enterEmail')}
                />
              </div>
            </div>

            {/* OTP or Password */}
            {useOTP ? (
              <>
                {otpSent && (
                  <div className="space-y-3">
                    <div className="rounded-lg p-6 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                      <Mail className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                      <p className="text-emerald-200 text-lg font-semibold mb-2">
                        Magic Link Sent!
                      </p>
                      <p className="text-emerald-200 text-sm mb-3">
                        We sent a secure login link to:
                      </p>
                      <p className="text-white text-base font-medium mb-4">
                        {email}
                      </p>
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <p className="text-emerald-200/80 text-sm mb-2">
                          <strong>Next Steps:</strong>
                        </p>
                        <ol className="text-left text-emerald-200/70 text-xs space-y-2">
                          <li>1. Check your email inbox</li>
                          <li>2. Click the "Log In" button in the email</li>
                          <li>3. You'll be logged in automatically</li>
                        </ol>
                      </div>
                      <p className="text-emerald-200/60 text-xs">
                        Link expires in 60 minutes. Check spam if you don't see it.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-lg rounded-lg text-white placeholder-slate-400 focus:outline-none"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FF5A1F';
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 90, 31, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder={t('auth.login.enterPassword')}
                  />
                </div>
              </div>
            )}
          </div>

          {!(useOTP && otpSent) && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white rounded-lg font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ background: '#FF5A1F' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
            >
              {loading ?
                (useOTP && !otpSent ? 'Sending Magic Link...' : 'Signing In...') :
                (useOTP && !otpSent ? 'Send Magic Link' : 'Sign In')
              }
            </button>
          )}

          {otpSent && (
            <button
              type="button"
              onClick={() => {
                if (countdown === 0) {
                  setOtpSent(false);
                  setOtp('');
                  setCountdown(60);
                }
              }}
              disabled={countdown > 0}
              className="w-full py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Resend link in ${countdown}s`
                : 'Send new link'}
            </button>
          )}

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setUseOTP(!useOTP);
                setOtpSent(false);
                setOtp('');
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {useOTP ? 'Use password instead' : 'Use magic link instead'}
            </button>
            {!useOTP && (
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm transition-colors"
                  style={{ color: '#FF5A1F' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            <p className="text-slate-400">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="transition-colors" style={{ color: '#FF5A1F' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {t('auth.login.signUpHere')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}