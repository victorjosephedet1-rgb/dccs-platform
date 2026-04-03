import React, { useState } from 'react';
import { X, AlertTriangle, FileText, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface DisputeResolutionModalProps {
  snippetId?: string;
  licenseId?: string;
  defendantId: string;
  onClose: () => void;
}

export default function DisputeResolutionModal({
  snippetId,
  licenseId,
  defendantId,
  onClose
}: DisputeResolutionModalProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [disputeData, setDisputeData] = useState({
    disputeType: 'payment_issue' as const,
    title: '',
    description: '',
    amountDisputed: '',
    evidence: [] as string[]
  });

  const disputeTypes = [
    { value: 'copyright_claim', label: 'Copyright Claim' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'license_violation', label: 'License Violation' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'refund_request', label: 'Refund Request' },
    { value: 'contract_breach', label: 'Contract Breach' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to file a dispute'
      });
      return;
    }

    if (!disputeData.title || !disputeData.description) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide a title and description'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('dispute_resolutions')
        .insert({
          plaintiff_id: user.id,
          defendant_id: defendantId,
          dispute_type: disputeData.disputeType,
          title: disputeData.title,
          description: disputeData.description,
          amount_disputed: disputeData.amountDisputed ? parseFloat(disputeData.amountDisputed) : null,
          related_snippet_id: snippetId,
          related_license_id: licenseId,
          plaintiff_evidence: disputeData.evidence,
          status: 'open',
          priority: 'normal',
          response_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);

      addNotification({
        type: 'success',
        title: 'Dispute Filed Successfully',
        message: 'Your dispute has been submitted for review. You will receive updates via email.'
      });

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error filing dispute:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Unable to file dispute. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl border border-white/20 max-w-md w-full p-8 text-center">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dispute Filed</h2>
          <p className="text-gray-300 mb-4">
            Your dispute has been submitted. Our team will review it within 24-48 hours.
          </p>
          <p className="text-sm text-gray-400">
            Case ID will be sent to your email
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">File a Dispute</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <div className="font-medium mb-1">V3BMusic.AI Dispute Resolution</div>
                <div className="text-blue-300/80">
                  Fair review process. Resolved within 5-7 business days.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dispute Type
            </label>
            <select
              value={disputeData.disputeType}
              onChange={(e) => setDisputeData({ ...disputeData, disputeType: e.target.value as any })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {disputeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dispute Title
            </label>
            <input
              type="text"
              value={disputeData.title}
              onChange={(e) => setDisputeData({ ...disputeData, title: e.target.value })}
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed Description
            </label>
            <textarea
              value={disputeData.description}
              onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
              placeholder="Provide a detailed explanation of the issue..."
              rows={6}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
              required
            />
          </div>

          {disputeData.disputeType === 'payment_issue' || disputeData.disputeType === 'refund_request' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount Disputed (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={disputeData.amountDisputed}
                onChange={(e) => setDisputeData({ ...disputeData, amountDisputed: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          ) : null}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Upload className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-300">
                <div className="font-medium mb-1">Evidence Upload</div>
                <div className="text-yellow-300/80">
                  Upload evidence now or after submission
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
