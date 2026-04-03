import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../components/NotificationSystem';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: 'Check your email for a password reset link',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
          <p className="text-slate-400">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {emailSent ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
            <p className="text-slate-300 mb-4">
              We've sent a password reset link to <span className="font-semibold text-cyan-400">{email}</span>
            </p>
            <p className="text-sm text-slate-400 mb-6">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
