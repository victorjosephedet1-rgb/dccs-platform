import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
}

export default function ConnectionDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const diagnostics: DiagnosticResult[] = [];

    // Check 1: Environment variables
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co')) {
        diagnostics.push({
          name: 'Environment Configuration',
          status: 'success',
          message: 'Supabase credentials are properly configured'
        });
      } else {
        diagnostics.push({
          name: 'Environment Configuration',
          status: 'error',
          message: 'Supabase credentials missing or invalid'
        });
      }
    } catch {
      diagnostics.push({
        name: 'Environment Configuration',
        status: 'error',
        message: 'Failed to read environment variables'
      });
    }

    // Check 2: Supabase connectivity
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );

      const healthCheck = supabase.auth.getSession();
      await Promise.race([healthCheck, timeout]);

      diagnostics.push({
        name: 'Supabase Connection',
        status: 'success',
        message: 'Successfully connected to Supabase'
      });
    } catch (error: unknown) {
      let errorMsg = 'Failed to connect to Supabase';

      if (error instanceof Error) {
        if (error.message?.includes('timeout')) {
          errorMsg = 'Connection timeout - network may be slow or blocked';
        } else if (error.message?.includes('protocol') || error.message?.includes('SSL')) {
          errorMsg = 'SSL/TLS protocol error - possible network security issue';
        }
      }

      diagnostics.push({
        name: 'Supabase Connection',
        status: 'error',
        message: errorMsg
      });
    }

    // Check 3: Browser compatibility
    try {
      const hasLocalStorage = typeof localStorage !== 'undefined';
      const hasFetch = typeof fetch !== 'undefined';
      const hasWebSocket = typeof WebSocket !== 'undefined';

      if (hasLocalStorage && hasFetch && hasWebSocket) {
        diagnostics.push({
          name: 'Browser Compatibility',
          status: 'success',
          message: 'Browser supports all required features'
        });
      } else {
        diagnostics.push({
          name: 'Browser Compatibility',
          status: 'warning',
          message: 'Some browser features may be missing'
        });
      }
    } catch {
      diagnostics.push({
        name: 'Browser Compatibility',
        status: 'error',
        message: 'Failed to check browser compatibility'
      });
    }

    // Check 4: Network status
    try {
      if (navigator.onLine) {
        diagnostics.push({
          name: 'Network Status',
          status: 'success',
          message: 'Device is online'
        });
      } else {
        diagnostics.push({
          name: 'Network Status',
          status: 'error',
          message: 'Device appears to be offline'
        });
      }
    } catch {
      diagnostics.push({
        name: 'Network Status',
        status: 'warning',
        message: 'Unable to determine network status'
      });
    }

    setResults(diagnostics);
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const allPassed = results.every(r => r.status === 'success');
  const hasErrors = results.some(r => r.status === 'error');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isChecking ? (
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          ) : allPassed ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : hasErrors ? (
            <XCircle className="w-6 h-6 text-red-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          )}
          <div>
            <h3 className="font-bold text-gray-900">Connection Diagnostics</h3>
            <p className="text-sm text-gray-600">
              {isChecking
                ? 'Running diagnostics...'
                : allPassed
                ? 'All systems operational'
                : hasErrors
                ? 'Issues detected'
                : 'Warnings detected'}
            </p>
          </div>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isChecking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking ? 'Checking...' : 'Run Again'}
        </button>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${
              result.status === 'success'
                ? 'bg-green-50 border-green-200'
                : result.status === 'error'
                ? 'bg-red-50 border-red-200'
                : result.status === 'warning'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              {result.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              {result.status === 'warning' && (
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              {result.status === 'checking' && (
                <Loader className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">
                <div
                  className={`font-semibold text-sm ${
                    result.status === 'success'
                      ? 'text-green-900'
                      : result.status === 'error'
                      ? 'text-red-900'
                      : result.status === 'warning'
                      ? 'text-yellow-900'
                      : 'text-gray-900'
                  }`}
                >
                  {result.name}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    result.status === 'success'
                      ? 'text-green-700'
                      : result.status === 'error'
                      ? 'text-red-700'
                      : result.status === 'warning'
                      ? 'text-yellow-700'
                      : 'text-gray-700'
                  }`}
                >
                  {result.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasErrors && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="font-semibold text-blue-900 mb-2">Troubleshooting Steps:</div>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Disable VPN if enabled</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser</li>
            <li>Disable browser extensions temporarily</li>
            <li>Check if your firewall is blocking connections</li>
            <li>Contact your network administrator if on corporate network</li>
          </ul>
        </div>
      )}
    </div>
  );
}
