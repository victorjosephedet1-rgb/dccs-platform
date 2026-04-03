import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'artist' | 'creator'>('creator');
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const { register, verifyOTP, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, name, role);
      // If registration requires OTP, show input field
      setShowOtpInput(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyOTP(email, otpCode);
      // After verification, user will be logged in automatically
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect after successful registration
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'artist' ? '/dashboard' : '/marketplace');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <UserPlus className="h-8 w-8" style={{ color: '#FF5A1F' }} />
            <h2 className="text-3xl font-bold text-white">{t('auth.register.title')}</h2>
          </div>
          <p className="text-slate-400 mb-4">{t('auth.register.subtitle')}</p>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 90, 31, 0.1)', border: '1px solid rgba(255, 90, 31, 0.2)' }}>
            <p className="text-white text-sm mb-2">
              <strong>{t('auth.register.revolutionaryTitle')}</strong>
            </p>
            <ul className="text-xs text-slate-300 space-y-1 text-left">
              <li>• {t('auth.register.features.exclusiveTech')}</li>
              <li>• {t('auth.register.features.firstOfKind')}</li>
              <li>• {t('auth.register.features.patentPending')}</li>
              <li>• {t('auth.register.features.transparency')}</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">{t('auth.register.wantTo')}</label>
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
                  {t('auth.register.licenseMusic')}
                  <div className="text-xs mt-1">{t('auth.register.forCreators')}</div>
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
                  {t('auth.register.sellMusic')}
                  <div className="text-xs mt-1">{t('auth.register.forArtists')}</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                {role === 'artist' ? t('auth.register.artistName') : t('auth.register.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  placeholder={role === 'artist' ? t('auth.register.enterArtistName') : t('auth.register.enterFullName')}
                />
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

            {/* Password */}
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
                  placeholder={t('auth.register.createPassword')}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {t('auth.register.passwordSecurity')}
              </p>
            </div>
          </div>

          {!showOtpInput && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white rounded-lg font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ background: '#FF5A1F' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
            >
              {loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
            </button>
          )}

          <div className="text-center">
            <p className="text-slate-400">
              {t('auth.register.alreadyHaveAccount')}{' '}
              <Link to="/login" className="transition-colors" style={{ color: '#FF5A1F' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {t('auth.register.signInHere')}
              </Link>
            </p>
          </div>
        </form>

        {showOtpInput && (
          <div className="mt-6 p-6 rounded-lg text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
            <Mail className="h-16 w-16 mx-auto mb-4 text-emerald-400" />
            <h3 className="text-xl font-bold text-white mb-2">Magic Link Sent!</h3>
            <p className="text-emerald-200 text-sm mb-3">
              We sent a secure verification link to:
            </p>
            <p className="text-white text-base font-medium mb-4">
              {email}
            </p>
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="text-emerald-200/80 text-sm mb-2">
                <strong>Next Steps:</strong>
              </p>
              <ol className="text-left text-emerald-200/70 text-sm space-y-2">
                <li>1. Check your email inbox</li>
                <li>2. Click the verification link in the email</li>
                <li>3. You'll be logged in automatically</li>
              </ol>
            </div>
            <p className="text-emerald-200/60 text-xs mb-4">
              Link expires in 60 minutes. Check spam if you don't see it.
            </p>

            <button
              type="button"
              onClick={() => setShowOtpInput(false)}
              className="w-full py-2 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              ← Back to registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}