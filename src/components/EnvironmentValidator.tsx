import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  key: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  message: string;
}

export default function EnvironmentValidator() {
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [showValidator, setShowValidator] = useState(false);

  useEffect(() => {
    const results: ValidationResult[] = [];

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    results.push({
      key: 'VITE_SUPABASE_URL',
      required: true,
      present: !!supabaseUrl,
      valid: !!supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
      message: !supabaseUrl
        ? 'NOT SET - Platform will not function'
        : !supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')
        ? 'Invalid format - must be https://xxx.supabase.co'
        : 'Valid'
    });

    results.push({
      key: 'VITE_SUPABASE_ANON_KEY',
      required: true,
      present: !!supabaseKey,
      valid: !!supabaseKey && supabaseKey.startsWith('eyJ'),
      message: !supabaseKey
        ? 'NOT SET - Authentication will fail'
        : !supabaseKey.startsWith('eyJ')
        ? 'Invalid format - must be JWT starting with eyJ'
        : 'Valid'
    });

    results.push({
      key: 'VITE_STRIPE_PUBLISHABLE_KEY',
      required: false,
      present: !!stripeKey,
      valid: !stripeKey || stripeKey.startsWith('pk_'),
      message: !stripeKey
        ? 'Not set - Stripe payments disabled'
        : !stripeKey.startsWith('pk_')
        ? 'Invalid format - must start with pk_'
        : 'Valid'
    });

    setValidations(results);

    const hasErrors = results.some(r => r.required && (!r.present || !r.valid));
    if (hasErrors) {
      setShowValidator(true);
      console.error('[ENVIRONMENT VALIDATION] Critical configuration errors detected!');
      console.error('Platform cannot function properly. See validator panel for details.');
    } else {
      console.log('[ENVIRONMENT VALIDATION] All required environment variables are valid');
    }
  }, []);

  const hasErrors = validations.some(v => v.required && (!v.present || !v.valid));
  const hasWarnings = validations.some(v => !v.required && v.present && !v.valid);

  if (!showValidator && !hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {showValidator && (
        <div className={`rounded-lg shadow-xl border-2 ${
          hasErrors
            ? 'bg-red-50 border-red-500'
            : hasWarnings
            ? 'bg-yellow-50 border-yellow-500'
            : 'bg-green-50 border-green-500'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {hasErrors ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-900">Configuration Error</span>
                  </>
                ) : hasWarnings ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-900">Configuration Warning</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-900">Configuration Valid</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowValidator(false)}
                className="text-slate-500 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {validations.map((validation) => (
                <div
                  key={validation.key}
                  className={`p-2 rounded ${
                    validation.required && (!validation.present || !validation.valid)
                      ? 'bg-red-100'
                      : !validation.required && validation.present && !validation.valid
                      ? 'bg-yellow-100'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {validation.required && (!validation.present || !validation.valid) ? (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : !validation.required && validation.present && !validation.valid ? (
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-semibold text-xs break-all">
                        {validation.key}
                      </div>
                      <div className={`text-xs mt-1 ${
                        validation.required && (!validation.present || !validation.valid)
                          ? 'text-red-700'
                          : !validation.required && validation.present && !validation.valid
                          ? 'text-yellow-700'
                          : 'text-slate-600'
                      }`}>
                        {validation.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasErrors && (
              <div className="mt-4 p-3 bg-red-100 rounded border border-red-300">
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Action Required
                </p>
                <p className="text-xs text-red-800">
                  Configure missing environment variables in your deployment platform (Netlify, Vercel, etc.)
                  and redeploy. The platform cannot function without proper Supabase configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
