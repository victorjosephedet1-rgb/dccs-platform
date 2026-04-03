import React, { useState } from 'react';
import { Shield, AlertTriangle, Send, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DMCANoticeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    complainantName: '',
    complainantEmail: '',
    complainantAddress: '',
    copyrightWorkDescription: '',
    infringingUrl: '',
    swornStatement: false,
    electronicSignature: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.swornStatement) {
      alert('You must confirm the sworn statement to proceed.');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('dmca_notices')
        .insert({
          notice_type: 'takedown',
          complainant_name: formData.complainantName,
          complainant_email: formData.complainantEmail,
          complainant_address: formData.complainantAddress,
          copyright_work_description: formData.copyrightWorkDescription,
          infringing_url: formData.infringingUrl,
          sworn_statement: `I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law. I also state that the information in this notification is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed.`,
          electronic_signature: formData.electronicSignature
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting DMCA notice:', error);
      alert('Failed to submit DMCA notice. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center">
          <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">DMCA Notice Submitted</h2>
          <p className="text-gray-300 mb-6">
            Your DMCA takedown notice has been received and will be reviewed by our legal team within 48-72 hours.
            You will receive updates via email at <strong>{formData.complainantEmail}</strong>.
          </p>
          <div className="space-y-2 text-sm text-gray-400 text-left max-w-md mx-auto">
            <p>• We will investigate the claim and take appropriate action</p>
            <p>• The alleged infringer will be notified and may file a counter-notice</p>
            <p>• Content may be removed within 24 hours if claim is validated</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-red-400" />
          <h1 className="text-3xl font-bold text-white">DMCA Takedown Notice</h1>
        </div>
        <p className="text-gray-400">
          Submit a Digital Millennium Copyright Act (DMCA) takedown notice for copyrighted content on V3BMusic.AI
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-2">Important Legal Notice</p>
            <p>
              False notices have legal consequences. Only file if authorized.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 rounded-xl p-8 border border-white/10">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-400" />
            <span>Your Information</span>
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.complainantName}
              onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Your full legal name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.complainantEmail}
              onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Physical Address *
            </label>
            <textarea
              required
              rows={3}
              value={formData.complainantAddress}
              onChange={(e) => setFormData({ ...formData, complainantAddress: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Your complete physical address (required by law)"
            />
          </div>
        </div>

        {/* Copyright Claim Details */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-xl font-bold text-white">Copyright Claim Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description of Your Copyrighted Work *
            </label>
            <textarea
              required
              rows={4}
              value={formData.copyrightWorkDescription}
              onChange={(e) => setFormData({ ...formData, copyrightWorkDescription: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Describe the copyrighted work that you own or are authorized to represent..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Include title, registration #, publication date
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL of Infringing Content *
            </label>
            <input
              type="url"
              required
              value={formData.infringingUrl}
              onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="https://dccsverify.com/..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter exact infringement URL
            </p>
          </div>
        </div>

        {/* Sworn Statement */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-xl font-bold text-white">Sworn Statement</h3>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.swornStatement}
              onChange={(e) => setFormData({ ...formData, swornStatement: e.target.checked })}
              className="mt-1 h-5 w-5 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-gray-300">
              I hereby state that I have a good faith belief that the disputed use of the copyrighted material
              is not authorized by the copyright owner, its agent, or the law. I also state that the information
              in this notification is accurate and, <strong>under penalty of perjury</strong>, that I am the owner,
              or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the
              copyright that is allegedly infringed.
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Electronic Signature * (Type your full name)
            </label>
            <input
              type="text"
              required
              value={formData.electronicSignature}
              onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Type your full name as your electronic signature"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your signature is legally binding
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting Notice...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit DMCA Takedown Notice</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you confirm accuracy under penalty of perjury per DMCA terms.
        </p>
      </form>
    </div>
  );
}
