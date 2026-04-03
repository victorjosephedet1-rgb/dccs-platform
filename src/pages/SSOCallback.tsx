import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { verifySSOToken } from '../utils/sso';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your credentials...');

  useEffect(() => {
    handleSSO();
  }, []);

  async function handleSSO() {
    try {
      const ssoToken = searchParams.get('sso');

      if (!ssoToken) {
        setStatus('error');
        setMessage('No SSO token provided');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      setMessage('Verifying token...');
      const userData = await verifySSOToken(ssoToken);

      if (!userData) {
        setStatus('error');
        setMessage('Invalid or expired SSO token');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      setMessage('Checking user account...');

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (!existingUser) {
        setMessage('Creating your account...');

        const tempPassword = crypto.randomUUID();

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: tempPassword,
          options: {
            data: {
              name: userData.name,
              sso_user: true,
              victor360_user_id: userData.user_id
            }
          }
        });

        if (signUpError) {
          console.error('SSO signup error:', signUpError);
          setStatus('error');
          setMessage('Failed to create account. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (authData.user) {
          await supabase
            .from('profiles')
            .update({
              name: userData.name,
              sso_linked: true,
              victor360_user_id: userData.user_id
            })
            .eq('id', authData.user.id);
        }
      }

      setMessage('Signing you in...');

      const tempPassword = crypto.randomUUID() + crypto.randomUUID();

      let authSuccess = false;

      if (existingUser) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: tempPassword
        });

        if (signInError) {
          const { data: passwordlessSignIn, error: passwordlessError } = await supabase.auth.signInWithOtp({
            email: userData.email,
            options: {
              shouldCreateUser: false
            }
          });

          if (!passwordlessError) {
            setStatus('success');
            setMessage('Check your email for the login link!');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        } else {
          authSuccess = true;
        }
      }

      if (!existingUser || !authSuccess) {
        const { data: refreshSession } = await supabase.auth.getSession();
        if (refreshSession?.session) {
          authSuccess = true;
        }
      }

      if (authSuccess || !existingUser) {
        setStatus('success');
        setMessage('Successfully authenticated! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Authentication setup complete. Please sign in with your email.');
        setTimeout(() => navigate('/login', {
          state: {
            email: userData.email,
            message: 'Your account has been created. Please check your email to complete sign-in.'
          }
        }), 3000);
      }

    } catch (error) {
      console.error('SSO error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="flex flex-col items-center space-y-6">
          {status === 'verifying' && (
            <>
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Authenticating
                </h2>
                <p className="text-blue-200">{message}</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="relative">
                <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 bg-green-400 rounded-full opacity-30 animate-ping"></div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome!
                </h2>
                <p className="text-green-200">{message}</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Authentication Failed
                </h2>
                <p className="text-red-200">{message}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-blue-200/60">
            Powered by Victor360 Brand Limited SSO
          </p>
        </div>
      </div>
    </div>
  );
}
