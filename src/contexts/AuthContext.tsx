import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useNotifications } from '../components/NotificationSystem';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'creator';
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

    // If Supabase is not configured, skip auth entirely
    if (!isSupabaseConfigured) {
            setLoading(false);
      return;
    }

    // Check if URL contains auth tokens (magic link callback)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasAuthTokens = hashParams.has('access_token') || hashParams.has('refresh_token');

    if (hasAuthTokens) {
      console.log('[AUTH CALLBACK] Tokens detected in URL - processing magic link callback');
    }

    // Safety timeout - stop loading after 2 seconds regardless
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('[AUTH ERROR] Session initialization timeout - forcing completion');
        setLoading(false);
      }
    }, 2000);

    // CRITICAL: Set up listener BEFORE calling getSession() to catch all events
    console.log('[AUTH FLOW] Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[AUTH FLOW] State change detected:', { event, hasSession: !!session, hasUser: !!session?.user });

      // Clean URL tokens for all sign-in events (including magic link callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthTokens = hashParams.has('access_token') || hashParams.has('refresh_token');

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AUTH FLOW] SIGNED_IN event - fetching user profile');

        if (hasAuthTokens) {
          console.log('[AUTH CALLBACK] Magic link callback successful - cleaning URL');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH FLOW] SIGNED_OUT event - clearing user state');
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('[AUTH FLOW] TOKEN_REFRESHED event - updating user profile');
        await fetchUserProfile(session.user);
      } else if (session?.user) {
        console.log('[AUTH FLOW] Generic session update - fetching user profile');
        await fetchUserProfile(session.user);
      } else {
        console.log('[AUTH FLOW] No session - clearing user state');
        setUser(null);
        setLoading(false);
      }
    });

    // Get initial session - this will automatically process URL tokens if present
    // The listener above will catch the SIGNED_IN event when tokens are processed
    console.log('[AUTH FLOW] Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      console.log('[AUTH FLOW] Initial session check complete:', { hasSession: !!session, hasUser: !!session?.user });

      if (session?.user) {
        console.log('[AUTH FLOW] Existing session found - fetching profile');

        // Clean URL hash after successful session establishment
        if (hasAuthTokens) {
          console.log('[AUTH CALLBACK] Cleaning auth tokens from URL');
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        fetchUserProfile(session.user);
      } else {
        console.log('[AUTH FLOW] No existing session - user not logged in');
        setLoading(false);
      }
      clearTimeout(timeout);
    }).catch((error) => {
      if (!mounted) return;
      console.log('[AUTH ERROR] Session check failed:', error);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  React.useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    const heartbeat = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[SESSION HEARTBEAT] Session active - refresh time:', new Date(session.expires_at! * 1000).toISOString());
      } else {
        console.log('[SESSION HEARTBEAT] No active session detected');
      }
    }, 300000);

    return () => clearInterval(heartbeat);
  }, [user]);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('[AUTH FLOW] fetchUserProfile called for user:', authUser.id);

      // Only fetch profile if user is authenticated
      if (!authUser) {
        console.log('[AUTH ERROR] No auth user provided to fetchUserProfile');
        setLoading(false);
        return;
      }

      const profileTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      const profileFetch = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log('[AUTH FLOW] Fetching profile from database...');
      const { data, error } = await Promise.race([profileFetch, profileTimeout]) as Awaited<typeof profileFetch>;

      // Silently handle RLS and permission errors for unauthenticated users
      if (error) {
        console.log('[AUTH ERROR] Profile fetch error:', { code: error.code, message: error.message });
        if (error.code === 'PGRST116' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          setLoading(false);
          return;
        }
        throw error;
      }

      if (!data) {
        console.log('[AUTH FLOW] No profile found - creating new profile for user:', authUser.id);

        // Create a new profile for the user
        const userMetadata = authUser.user_metadata || {};
        const newProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: userMetadata.name || authUser.email?.split('@')[0] || 'User',
          role: userMetadata.role || 'creator'
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.log('[AUTH ERROR] Failed to create profile:', insertError);
          setLoading(false);
          return;
        }

        console.log('[AUTH FLOW] Profile created successfully');

        setUser(newProfile);
        console.log('[AUTH FLOW] User state updated with new profile');
        return;
      }

      console.log('[AUTH FLOW] Profile fetched successfully:', { id: data.id, email: data.email, role: data.role });

      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      });

      console.log('[AUTH FLOW] User state updated successfully');
    } catch (error) {
      console.log('[AUTH ERROR] Profile fetch exception:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'artist' | 'creator') => {
    console.log('[AUTH] Login attempt:', { email, role });

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('[AUTH ERROR] Login failed:', {
        error: error.message,
        code: error.status,
        email
      });

      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: `Authentication failed: ${error.message}`
      });
      throw error;
    }

    console.log('[AUTH SUCCESS] Login successful:', {
      userId: data.user?.id,
      email
    });

    if (data.user) {
      try {
        await supabase.rpc('track_instant_login', {
          p_email: email,
          p_login_method: 'password'
        });
      } catch (trackError) {
        console.warn('[AUTH] Tracking failed (non-critical):', trackError);
      }
    }

    addNotification({
      type: 'success',
      title: 'Welcome Back!',
      message: 'You have successfully logged in to V3BMusic.AI'
    });
  };

  const loginWithOTP = async (email: string) => {
    console.log('[AUTH] Requesting OTP for email:', email);

    // Get the current origin (works in both dev and production)
    const redirectTo = `${window.location.origin}/`;

    const { error, data } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: redirectTo,
      }
    });

    if (error) {
      console.error('[AUTH ERROR] OTP request failed:', {
        error: error.message,
        code: error.status,
        email
      });

      addNotification({
        type: 'error',
        title: 'Failed to Send Code',
        message: `Email delivery failed: ${error.message}. Check Supabase email configuration.`
      });
      throw error;
    }

    console.log('[AUTH SUCCESS] OTP request sent successfully:', {
      email,
      response: data
    });

    try {
      await supabase.rpc('track_otp_attempt', {
        p_email: email,
        p_attempt_type: 'login',
        p_success: true
      });
    } catch (trackError) {
      console.warn('[AUTH] Tracking failed (non-critical):', trackError);
    }

    addNotification({
      type: 'success',
      title: 'Magic Link Sent!',
      message: 'Check your email and click the link to log in instantly'
    });
  };

  const verifyOTP = async (email: string, token: string) => {
    console.log('[AUTH] Verifying OTP code:', { email, tokenLength: token.length });

    const { error, data } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      console.error('[AUTH ERROR] OTP verification failed:', {
        error: error.message,
        code: error.status,
        email
      });

      addNotification({
        type: 'error',
        title: 'Invalid Code',
        message: `Verification failed: ${error.message}`
      });
      throw error;
    }

    console.log('[AUTH SUCCESS] OTP verified successfully:', {
      userId: data.user?.id,
      email
    });

    if (data.user) {
      try {
        await supabase.rpc('track_instant_login', {
          p_email: email,
          p_login_method: 'otp'
        });
      } catch (trackError) {
        console.warn('[AUTH] Tracking failed (non-critical):', trackError);
      }
    }

    addNotification({
      type: 'success',
      title: 'Verified!',
      message: 'Welcome back to V3BMusic.AI'
    });
  };

  const register = async (email: string, password: string, name: string, role: 'artist' | 'creator') => {
    console.log('[AUTH] Starting registration:', { email, name, role });

    // Get the current origin for email verification redirect
    const redirectTo = `${window.location.origin}/`;

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        },
        emailRedirectTo: redirectTo,
      }
    });

    if (error) {
      console.error('[AUTH ERROR] Registration failed:', {
        error: error.message,
        code: error.status,
        email
      });

      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: `Account creation failed: ${error.message}`
      });
      throw error;
    }

    console.log('[AUTH] Registration response:', {
      userId: data.user?.id,
      hasSession: !!data.session,
      email
    });

    if (data.user && !data.session) {
      console.log('[AUTH] Email verification required - sending OTP');

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (otpError) {
        console.error('[AUTH ERROR] OTP send failed after registration:', otpError);
      } else {
        console.log('[AUTH SUCCESS] OTP sent for registration verification');

        try {
          await supabase.rpc('track_otp_attempt', {
            p_email: email,
            p_attempt_type: 'signup',
            p_success: true
          });
        } catch (trackError) {
          console.warn('[AUTH] Tracking failed (non-critical):', trackError);
        }
      }

      addNotification({
        type: 'success',
        title: 'Magic Link Sent!',
        message: 'Check your email and click the link to verify your account'
      });
      return;
    }

    console.log('[AUTH SUCCESS] User logged in immediately after registration');

    if (data.user) {
      try {
        await supabase.rpc('track_instant_login', {
          p_email: email,
          p_login_method: 'password'
        });
      } catch (trackError) {
        console.warn('[AUTH] Tracking failed (non-critical):', trackError);
      }
    }

    addNotification({
      type: 'success',
      title: 'Account Created!',
      message: 'You can now start using V3BMusic.AI immediately!'
    });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out'
    });
  };

  const value = {
    user,
    loading,
    login,
    loginWithOTP,
    verifyOTP,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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