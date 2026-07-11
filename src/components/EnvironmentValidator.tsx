import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  key: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  message: string;
}

function validate(
  key: string,
  value: string | undefined,
  required: boolean,
  check: (v: string) => boolean,
  hint: string
): ValidationResult {
  if (!value) {
    return {
      key, required, present: false, valid: false,
      message: required ? `NOT SET — ${hint}` : 'Not set (optional)',
    };
  }
  const valid = check(value);
  return {
    key, required, present: true, valid,
    message: valid ? 'Valid' : `Invalid format — ${hint}`,
  };
}

export default function EnvironmentValidator() {
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [showValidator, setShowValidator] = useState(false);

  useEffect(() => {
    const results: ValidationResult[] = [
      validate(
        'VITE_SUPABASE_URL',
        import.meta.env.VITE_SUPABASE_URL,
        true,
        v => v.startsWith('https://') && v.includes('.supabase.co'),
        'must be https://xxx.supabase.co'
      ),
      validate(
        'VITE_SUPABASE_ANON_KEY',
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        true,
        v => v.startsWith('eyJ'),
        'must be a JWT starting with eyJ'
      ),
      validate(
        'VITE_STRIPE_PUBLISHABLE_KEY',
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        false,
        v => v.startsWith('pk_'),
        'must start with pk_live_ or pk_test_'
      ),
    ];

    setValidations(results);

    const hasCritical = results.some(r => r.required && !r.valid);
    if (hasCritical) {
      setShowValidator(true);
    }
  }, []);

  const hasErrors = validations.some(v => v.required && !v.valid);
  const hasWarnings = validations.some(v => !v.required && v.present && !v.valid);

  if (!showValidator) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`rounded-lg shadow-xl border-2 ${
        hasErrors   ? 'bg-red-50 border-red-500' :
        hasWarnings ? 'bg-yellow-50 border-yellow-500' :
                      'bg-green-50 border-green-500'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              {hasErrors ? (
                <><XCircle className="w-5 h-5 text-red-600" /><span className="text-red-900">Configuration Error</span></>
              ) : hasWarnings ? (
                <><AlertCircle className="w-5 h-5 text-yellow-600" /><span className="text-yellow-900">Configuration Warning</span></>
              ) : (
                <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-green-900">Configuration Valid</span></>
              )}
            </h3>
            <button
              onClick={() => setShowValidator(false)}
              className="text-slate-500 hover:text-slate-700 text-xl font-bold leading-none"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {validations.map((v) => {
              const isError = v.required && !v.valid;
              const isWarn  = !v.required && v.present && !v.valid;
              return (
                <div
                  key={v.key}
                  className={`p-2 rounded ${isError ? 'bg-red-100' : isWarn ? 'bg-yellow-100' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-2">
                    {isError ? (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : isWarn ? (
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-semibold text-xs break-all">{v.key}</div>
                      <div className={`text-xs mt-1 ${
                        isError ? 'text-red-700' : isWarn ? 'text-yellow-700' : 'text-slate-600'
                      }`}>
                        {v.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasErrors && (
            <div className="mt-4 p-3 bg-red-100 rounded border border-red-300">
              <p className="text-sm font-semibold text-red-900 mb-1">Action Required</p>
              <p className="text-xs text-red-800">
                Set the missing environment variables in your Netlify site settings and redeploy.
                The platform cannot function without valid Supabase configuration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
