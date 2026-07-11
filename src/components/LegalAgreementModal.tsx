import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LegalAgreement {
  id: string;
  agreement_type: string;
  version: string;
  title: string;
  content: string;
  effective_date: string;
}

interface LegalAgreementModalProps {
  agreementType: 'artist_upload' | 'buyer_licensing' | 'kyc_consent';
  onAccept: () => void;
  onDecline: () => void;
  isOpen: boolean;
}

function sanitizeHtml(raw: string): string {
  const div = document.createElement('div');
  div.textContent = raw;
  return div.innerHTML;
}

export default function LegalAgreementModal({
  agreementType,
  onAccept,
  onDecline,
  isOpen
}: LegalAgreementModalProps) {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<LegalAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptanceChecked, setAcceptanceChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetchError(null);
      setAgreement(null);
      setHasScrolledToBottom(false);
      setAcceptanceChecked(false);
      fetchAgreement();
    }
  }, [isOpen, agreementType]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_agreements')
        .select('*')
        .eq('agreement_type', agreementType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Agreement not available. Please try again later.');
      setAgreement(data);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to load agreement.');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!user || !agreement) return;

    try {
      setAccepting(true);

      const { error } = await supabase
        .from('user_agreement_acceptances')
        .insert({
          user_id: user.id,
          agreement_id: agreement.id,
          signature_hash: await generateSignatureHash()
        });

      if (error) throw error;

      await supabase.rpc('create_audit_log', {
        p_event_type: 'agreement_accepted',
        p_event_category: 'legal',
        p_event_data: {
          agreement_type: agreementType,
          agreement_id: agreement.id,
          version: agreement.version
        }
      });

      onAccept();
    } catch (error) {
      setFetchError('Failed to record acceptance. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const generateSignatureHash = async (): Promise<string> => {
    const data = `${user?.id}-${agreement?.id}-${Date.now()}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-sky-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {loading ? 'Loading Agreement...' : agreement?.title ?? 'Legal Agreement'}
              </h2>
              {agreement && (
                <p className="text-sm text-gray-400">
                  Version {agreement.version} &middot; Effective {new Date(agreement.effective_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={accepting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <AlertCircle className="h-16 w-16 text-red-400 opacity-75" />
              <p className="text-red-300 font-medium">{fetchError}</p>
              <button
                onClick={fetchAgreement}
                className="px-4 py-2 text-sm rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : agreement ? (
            <div className="prose prose-invert max-w-none">
              {/* Content rendered as plain text — no HTML injection possible */}
              <pre
                className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-sm"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(agreement.content) }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Agreement not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {agreement && !fetchError && (
          <div className="p-6 border-t border-white/10 bg-slate-900/50">
            {!hasScrolledToBottom && (
              <p className="text-sm text-yellow-400 mb-4 flex items-center">
                <span className="animate-bounce mr-2">↓</span>
                Please scroll to the bottom to continue
              </p>
            )}

            {fetchError && (
              <p className="text-sm text-red-400 mb-4">{fetchError}</p>
            )}

            <label className="flex items-start space-x-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptanceChecked}
                onChange={(e) => setAcceptanceChecked(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-1 h-5 w-5 rounded border-gray-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">
                I agree to the {agreement.title}. This is legally binding and will be digitally signed.
              </span>
            </label>

            <div className="flex space-x-4">
              <button
                onClick={handleAccept}
                disabled={!hasScrolledToBottom || !acceptanceChecked || accepting}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>I Accept</span>
                  </>
                )}
              </button>
              <button
                onClick={onDecline}
                disabled={accepting}
                className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Acceptance recorded with timestamp &amp; digital signature.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
