import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useNotifications } from '../components/NotificationSystem';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'creator';
  onboarding_completed: boolean;
  is_beta_user: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'artist' | 'creator') => Promise<void>;
  loginWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'artist' | 'creator') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Safety timeout — stops the loading spinner if everything else hangs
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      // Clean auth tokens from URL after callback
      const hash = new URLSearchParams(window.location.hash.substring(1));
      if (hash.has('access_token') || hash.has('refresh_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      if (event === 'SIGNED_IN' && session?.user) {
        (async () => { await fetchUserProfile(session.user); })();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        (async () => { await fetchUserProfile(session.user); })();
      } else if (session?.user) {
        (async () => { await fetchUserProfile(session.user); })();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(timeout);

      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (!mounted) return;
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const controller = new AbortController();
      const profileTimeout = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      clearTimeout(profileTimeout);

      if (error) {
        // RLS errors are expected for unauthenticated or unprovisioned users
        if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
          setLoading(false);
          return;
        }
        throw error;
      }

      if (!data) {
        // First login — create profile from auth metadata
        const meta = authUser.user_metadata ?? {};
        const newProfile: User = {
          id: authUser.id,
          email: authUser.email ?? '',
          name: meta.name ?? authUser.email?.split('@')[0] ?? 'User',
          role: (meta.role ?? 'creator') as 'artist' | 'creator',
          onboarding_completed: false,
          is_beta_user: false,
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id:    newProfile.id,
            email: newProfile.email,
            name:  newProfile.name,
            role:  newProfile.role,
          }]);

        if (!insertError) {
          setUser(newProfile);
        }
        return;
      }

      setUser({
        id:                   data.id,
        email:                data.email,
        name:                 data.name,
        role:                 data.role,
        onboarding_completed: data.onboarding_completed ?? false,
        is_beta_user:         data.is_beta_user ?? false,
      });
    } catch {
      // Profile fetch failure is non-fatal — user stays unauthenticated
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, _role: 'artist' | 'creator') => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      addNotification({ type: 'error', title: 'Login Failed', message: error.message });
      throw error;
    }

    if (data.user) {
      supabase.rpc('track_instant_login', { p_email: email, p_login_method: 'password' }).catch(() => {});
    }

    addNotification({ type: 'success', title: 'Welcome Back!', message: 'You have successfully logged in.' });
  };

  const loginWithOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      addNotification({ type: 'error', title: 'Failed to Send Code', message: error.message });
      throw error;
    }

    supabase.rpc('track_otp_attempt', { p_email: email, p_attempt_type: 'login', p_success: true }).catch(() => {});

    addNotification({ type: 'success', title: 'Magic Link Sent!', message: 'Check your email and click the link to log in.' });
  };

  const verifyOTP = async (email: string, token: string) => {
    const { error, data } = await supabase.auth.verifyOtp({ email, token, type: 'email' });

    if (error) {
      addNotification({ type: 'error', title: 'Invalid Code', message: error.message });
      throw error;
    }

    if (data.user) {
      supabase.rpc('track_instant_login', { p_email: email, p_login_method: 'otp' }).catch(() => {});
    }

    addNotification({ type: 'success', title: 'Verified!', message: 'Welcome back.' });
  };

  const register = async (email: string, password: string, name: string, role: 'artist' | 'creator') => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      addNotification({ type: 'error', title: 'Registration Failed', message: error.message });
      throw error;
    }

    // Email verification required — send OTP
    if (data.user && !data.session) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (!otpError) {
        supabase.rpc('track_otp_attempt', { p_email: email, p_attempt_type: 'signup', p_success: true }).catch(() => {});
      }

      addNotification({ type: 'success', title: 'Magic Link Sent!', message: 'Check your email to verify your account.' });
      return;
    }

    if (data.user) {
      supabase.rpc('track_instant_login', { p_email: email, p_login_method: 'password' }).catch(() => {});
    }

    addNotification({ type: 'success', title: 'Account Created!', message: 'You can start using DCCS immediately.' });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    addNotification({ type: 'info', title: 'Logged Out', message: 'You have been successfully logged out.' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOTP, verifyOTP, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
