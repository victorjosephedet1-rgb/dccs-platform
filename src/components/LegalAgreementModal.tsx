import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, Shield } from 'lucide-react';
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

export default function LegalAgreementModal({
  agreementType,
  onAccept,
  onDecline,
  isOpen
}: LegalAgreementModalProps) {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<LegalAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptanceChecked, setAcceptanceChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
        .single();

      if (error) throw error;
      setAgreement(data);
    } catch (error) {
      console.error('Error fetching agreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!user || !agreement) return;

    try {
      setAccepting(true);

      // Record acceptance
      const { error } = await supabase
        .from('user_agreement_acceptances')
        .insert({
          user_id: user.id,
          agreement_id: agreement.id,
          signature_hash: await generateSignatureHash()
        });

      if (error) throw error;

      // Create audit log
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
      console.error('Error accepting agreement:', error);
      alert('Failed to record agreement acceptance. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const generateSignatureHash = async (): Promise<string> => {
    const data = `${user?.id}-${agreement?.id}-${Date.now()}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-purple-500/20 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {loading ? 'Loading Agreement...' : agreement?.title}
              </h2>
              {agreement && (
                <p className="text-sm text-gray-400">
                  Version {agreement.version} • Effective {new Date(agreement.effective_date).toLocaleDateString()}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : agreement ? (
            <div className="prose prose-invert max-w-none">
              <div
                className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: agreement.content }}
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
        {agreement && (
          <div className="p-6 border-t border-white/10 bg-slate-900/50">
            {!hasScrolledToBottom && (
              <p className="text-sm text-yellow-400 mb-4 flex items-center">
                <span className="animate-bounce mr-2">↓</span>
                Please scroll to the bottom to continue
              </p>
            )}

            <label className="flex items-start space-x-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptanceChecked}
                onChange={(e) => setAcceptanceChecked(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-1 h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900 disabled:opacity-50"
              />
              <span className="text-sm text-gray-300">
                I agree to the {agreement.title}. This is legally binding and will be digitally signed.
              </span>
            </label>

            <div className="flex space-x-4">
              <button
                onClick={handleAccept}
                disabled={!hasScrolledToBottom || !acceptanceChecked || accepting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
              Acceptance recorded with timestamp & digital signature.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
