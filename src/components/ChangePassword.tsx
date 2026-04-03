import React, { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationSystem';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addNotification } = useNotifications();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Not authenticated');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been successfully updated',
      });
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to change password. Please try again.');
      addNotification({
        type: 'error',
        title: 'Change Failed',
        message: err.message || 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <Lock className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
          <p className="text-sm text-slate-400">Update your account password</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-sm text-green-300">Password updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm"
              placeholder="Enter current password"
            />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm"
              placeholder="Enter new password"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Must be at least 8 characters with uppercase, lowercase, and numbers
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </span>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  );
}
