import React, { useState } from 'react';
import { X, Flag, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';

interface ContentReportModalProps {
  snippetId: string;
  contentOwnerId: string;
  snippetTitle: string;
  onClose: () => void;
}

export default function ContentReportModal({
  snippetId,
  contentOwnerId,
  snippetTitle,
  onClose
}: ContentReportModalProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [reportData, setReportData] = useState({
    reportType: 'copyright_infringement' as const,
    description: '',
    evidence: [] as string[]
  });

  const reportTypes = [
    { value: 'copyright_infringement', label: 'Copyright Infringement', description: 'This content uses copyrighted material without permission' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Content is offensive or violates community guidelines' },
    { value: 'spam', label: 'Spam or Misleading', description: 'Content is spam or contains misleading information' },
    { value: 'fake_audio', label: 'Fake or Stolen Audio', description: 'Audio is fake, stolen, or misrepresented' },
    { value: 'low_quality', label: 'Low Quality', description: 'Audio quality is unacceptably poor' },
    { value: 'duplicate', label: 'Duplicate Content', description: 'This is a duplicate of existing content' },
    { value: 'other', label: 'Other', description: 'Other issue not listed above' }
  ];

  // const selectedType = reportTypes.find(t => t.value === reportData.reportType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to report content'
      });
      return;
    }

    if (!reportData.description) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide a description of the issue'
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('content_moderation')
        .insert({
          snippet_id: snippetId,
          reported_by: user.id,
          content_owner_id: contentOwnerId,
          report_type: reportData.reportType,
          report_description: reportData.description,
          report_evidence: reportData.evidence,
          status: 'pending',
          severity: reportData.reportType === 'copyright_infringement' ? 'high' : 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);

      addNotification({
        type: 'success',
        title: 'Report Submitted',
        message: 'Thank you for helping keep V3BMusic.AI safe. We will review this report within 24 hours.'
      });

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting report:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Unable to submit report. Please try again.'
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
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-gray-300 mb-4">
            Thank you for reporting this content. Our moderation team will review it shortly.
          </p>
          <p className="text-sm text-gray-400">
            You will be notified of the outcome
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
            <Flag className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Report Content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Reporting Track</div>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-white font-medium">{snippetTitle}</div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <div className="font-medium mb-1">Community Safety</div>
                <div className="text-blue-300/80">
                  Reports reviewed confidentially. False reports may restrict account.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              What is the issue?
            </label>
            <div className="space-y-2">
              {reportTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    reportData.reportType === type.value
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportData.reportType === type.value}
                    onChange={(e) => setReportData({ ...reportData, reportType: e.target.value as any })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{type.label}</div>
                    <div className="text-sm text-gray-400">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Details
            </label>
            <textarea
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              placeholder="Please provide specific details about this issue..."
              rows={5}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
              required
            />
          </div>

          {reportData.reportType === 'copyright_infringement' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="text-sm text-red-300">
                <div className="font-medium mb-2">Copyright Claims</div>
                <div className="text-red-300/80 space-y-1">
                  <div>• Provide proof of ownership</div>
                  <div>• Include original work URLs</div>
                  <div>• False claims have consequences</div>
                </div>
              </div>
            </div>
          )}

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
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
