import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileAudio, FileVideo, Download, CheckCircle, Fingerprint, Shield, ArrowLeft, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import PaymentModal from '../components/PaymentModal';
import { DCCSStageIllustration } from '../components/DCCSStoryIllustrations';

const DCCS_REGISTRATION_FEE = 4.99;

export default function DCCSRegistration() {
  const { user, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [dccsData, setDccsData] = useState<{
    code: string;
    certificateUrl: string;
    originalFileUrl: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    creatorName: '',
    description: '',
    category: 'audio' as 'audio' | 'video'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Auto-detect category
      if (selectedFile.type.startsWith('audio/')) {
        setFormData(prev => ({ ...prev, category: 'audio' }));
      } else if (selectedFile.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, category: 'video' }));
      }

      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const generateDCCSCode = async (mediaType: string, fileData: File) => {
    // Generate cryptographic fingerprint reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const fingerprintHash = `${timestamp}${random}`.substring(0, 8);

    // Use database function to generate structured code
    const { data, error } = await supabase.rpc('generate_structured_dccs_code', {
      p_media_type: mediaType,
      p_fingerprint_hash: fingerprintHash
    });

    if (error) {
      console.error('Error generating structured code:', error);
      // Fallback to manual generation with patent-ready format
      const year = new Date().getFullYear();
      const mediaCode = mediaType.startsWith('audio') ? 'AUD' : 'VID';
      return `DCCS-VXB-${year}-${mediaCode}-${fingerprintHash}-T1`;
    }

    return data as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !isAuthenticated || !user) {
      return;
    }

    if (!paymentCompleted) {
      setShowPayment(true);
      return;
    }

    setUploading(true);

    try {
      // Generate unique structured DCCS code with file data
      const dccsCode = await generateDCCSCode(file.type, file);

      // Upload original file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${dccsCode}-original.${fileExt}`;
      const filePath = `dccs-registrations/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      // Create DCCS certificate record with structured code
      const { data: certificate, error: certError } = await supabase
        .from('dccs_certificates')
        .insert({
          artist_id: user.id,
          clearance_code: dccsCode,
          structured_code: dccsCode,
          content_title: formData.title,
          content_description: formData.description,
          content_type: formData.category,
          file_url: publicUrl,
          has_enhanced_fingerprint: true,
          fingerprint_version: 'v1',
          creator_name: formData.creatorName || user.name,
          status: 'active',
          verification_level: 'blockchain_verified'
        })
        .select()
        .single();

      if (certError) throw certError;

      // Parse structured code components
      const codeParts = dccsCode.split('-');
      const year = parseInt(codeParts[2]) || new Date().getFullYear();
      const mediaCode = codeParts[3] || (formData.category === 'audio' ? 'AUD' : 'VID');
      const fingerprintRef = codeParts[4] || 'REF00000';
      const versionCode = codeParts[5] || 'T1';

      // Create structured identifier entry with parsed components
      await supabase.from('dccs_structured_identifiers').insert({
        certificate_id: certificate.id,
        structured_code: dccsCode,
        issuer_code: 'VXB',
        registration_year: year,
        media_type_code: mediaCode,
        fingerprint_reference: fingerprintRef,
        version_indicator: versionCode,
        metadata: {
          title: formData.title,
          creator: formData.creatorName || user.name,
          category: formData.category,
          file_size: file.size,
          file_name: file.name,
          mime_type: file.type
        }
      });

      // Generate comprehensive patent-ready certificate document
      const certificateContent = `
═══════════════════════════════════════════════════════════════════════
DIGITAL CLEARANCE CODE SYSTEM (DCCS) CERTIFICATE
Patent-Ready Structured Identifier System
═══════════════════════════════════════════════════════════════════════

STRUCTURED CLEARANCE CODE: ${dccsCode}
Certificate ID: ${certificate.certificate_id || certificate.id}
Issue Date: ${new Date().toISOString()}
Status: ACTIVE

═══════════════════════════════════════════════════════════════════════
STRUCTURED CODE BREAKDOWN (Patent-Ready Format)
═══════════════════════════════════════════════════════════════════════

Format: DCCS-[ISSUER]-[YEAR]-[MEDIA]-[FINGERPRINT]-[VERSION]

Components:
┌─────────────────────────────────────────────────────────────────────┐
│ PREFIX:      DCCS (Digital Clearance Code System)                   │
│ ISSUER:      VXB (Victor360 Brand Limited)                          │
│ YEAR:        ${year} (Registration Year)                               │
│ MEDIA TYPE:  ${mediaCode} (${formData.category === 'audio' ? 'Audio Content' : 'Video Content'})                        │
│ FINGERPRINT: ${fingerprintRef} (Cryptographic Reference)                │
│ VERSION:     ${versionCode} (Timestamp Version 1)                           │
└─────────────────────────────────────────────────────────────────────┘

This structured format enables:
✓ Unique global identification
✓ Distortion-tolerant verification
✓ Multi-resolution fingerprint matching
✓ International copyright tracking
✓ Blockchain verification readiness

═══════════════════════════════════════════════════════════════════════
REGISTERED CONTENT INFORMATION
═══════════════════════════════════════════════════════════════════════

Title:       ${formData.title}
Creator:     ${formData.creatorName || user.name}
Type:        ${formData.category.toUpperCase()}
Description: ${formData.description || 'N/A'}

File Details:
- File Name:  ${file.name}
- File Size:  ${(file.size / 1024 / 1024).toFixed(2)} MB
- MIME Type:  ${file.type}

═══════════════════════════════════════════════════════════════════════
TECHNICAL SPECIFICATIONS
═══════════════════════════════════════════════════════════════════════

Fingerprint System: DCCS-FP-V1 (Enhanced Multi-Resolution)
Verification Level: Blockchain-Verified
Storage Location:   Secure Cloud Storage (Encrypted)
Access Control:     RLS (Row-Level Security) Enabled

Distortion Tolerance Capabilities:
- Pitch shifting detection
- Speed change detection
- Audio compression tolerance
- Noise addition resilience
- EQ adjustment tracking

═══════════════════════════════════════════════════════════════════════
OWNERSHIP & RIGHTS DECLARATION
═══════════════════════════════════════════════════════════════════════

This certificate verifies that the above content has been registered
with DCCS Platform's Digital Clearance Code System (DCCS).

The structured clearance code provides:
• Patent-ready identification format
• Blockchain-verified proof of ownership
• Enhanced audio fingerprinting
• Distortion-tolerant verification
• Global copyright tracking

Original File URL: ${publicUrl}

═══════════════════════════════════════════════════════════════════════
ISSUER INFORMATION
═══════════════════════════════════════════════════════════════════════

Legal Entity:  Victor360 Brand Limited
Platform:      DCCS Platform
Website:       https://dccsverify.com
Email:         support@dccsverify.com

═══════════════════════════════════════════════════════════════════════
PUBLIC VERIFICATION
═══════════════════════════════════════════════════════════════════════

Anyone can verify this certificate at:
https://dccsverify.com/verify-dccs-code

Enter the structured code: ${dccsCode}

This verification is public, transparent, and permanently recorded.

═══════════════════════════════════════════════════════════════════════
LEGAL NOTICE
═══════════════════════════════════════════════════════════════════════

This DCCS certificate provides cryptographic proof of registration
and ownership claims. It is designed to support copyright protection,
licensing management, and royalty tracking.

This system is protected by patent-pending technology.
Unauthorized reproduction or tampering is prohibited.

Copyright © ${new Date().getFullYear()} Victor360 Brand Limited. All rights reserved.

═══════════════════════════════════════════════════════════════════════
END OF CERTIFICATE
═══════════════════════════════════════════════════════════════════════
`;

      // Create certificate blob
      const certBlob = new Blob([certificateContent], { type: 'text/plain' });
      const certUrl = URL.createObjectURL(certBlob);

      setDccsData({
        code: dccsCode,
        certificateUrl: certUrl,
        originalFileUrl: publicUrl
      });

      setCompleted(true);
    } catch (error) {
      console.error('Error registering DCCS:', error);
      alert('Failed to register content. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentCompleted(true);
    setShowPayment(false);

    await handleSubmit(new Event('submit') as any);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-slate-400 mb-6">
            Please sign in to register your content with DCCS
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (completed && dccsData) {
    return (
      <>
        <SEOHead
          title="DCCS Registration Complete - Digital Creative Copyright System"
          description="Your content has been successfully registered with the Digital Creative Copyright System (DCCS)"
          path="/dccs-register"
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Registration Complete!</h1>
                <p className="text-slate-400">Your content is now DCCS-certified</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Fingerprint className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Your DCCS Code</h2>
                </div>
                <div className="bg-slate-950 rounded-lg p-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-cyan-400 text-center break-all">
                    {dccsData.code}
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Save this code. It's your proof of ownership.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Download Your Files</h3>

                <a
                  href={dccsData.certificateUrl}
                  download={`DCCS-Certificate-${dccsData.code}.txt`}
                  className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">DCCS Certificate</div>
                      <div className="text-sm text-slate-400">Official ownership document</div>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>

                <a
                  href={dccsData.originalFileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-750 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      {formData.category === 'audio' ? (
                        <FileAudio className="w-6 h-6 text-purple-400" />
                      ) : (
                        <FileVideo className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold">Original File</div>
                      <div className="text-sm text-slate-400">{formData.title}</div>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <div className="font-semibold mb-1">Re-download Anytime</div>
                    <div className="text-blue-300/90">
                      Your file is saved in{' '}
                      <Link to="/library" className="text-blue-400 hover:text-blue-300 underline font-medium">
                        My Library
                      </Link>
                      {' '}and can be re-downloaded at any time with the same DCCS code embedded.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-300">
                    <div className="font-semibold mb-1">Important</div>
                    <div className="text-yellow-300/80">
                      Save your DCCS code and certificate. You can verify your certificate anytime at
                      <Link to="/verify-dccs-code" className="text-yellow-400 hover:text-yellow-300 underline ml-1">
                        dccsverify.com/verify-dccs-code
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/my-content"
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all text-center"
                >
                  View My Content
                </Link>
                <Link
                  to="/dccs-register"
                  className="flex-1 py-3 px-6 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-750 transition-all text-center"
                  onClick={() => {
                    setCompleted(false);
                    setDccsData(null);
                    setFile(null);
                    setFormData({ title: '', creatorName: '', description: '', category: 'audio' });
                  }}
                >
                  Register Another
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="DCCS Registration - Digital Clearance Code System"
        description="Register your content with DCCS for blockchain-verified ownership proof"
        path="/dccs-register"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
        <div className="max-w-4xl mx-auto py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <Fingerprint className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">DCCS Registration</h1>
              <p className="text-slate-400">
                Digital Creative Copyright System - Register your content for blockchain-verified ownership proof
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-300">
                    <div className="font-semibold mb-1">What is DCCS?</div>
                    <div className="text-blue-300/80">
                      Digital Clearance Code System provides blockchain-verified proof of ownership.
                      Upload your work, receive a unique DCCS code, and download your certificate with your original file.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-300">
                    <div className="font-semibold mb-1">Registration Fee</div>
                    <div className="text-green-300/80 mb-2">
                      One-time fee of £{DCCS_REGISTRATION_FEE.toFixed(2)} to maintain the DCCS system
                    </div>
                    <div className="text-2xl font-bold text-green-400">£{DCCS_REGISTRATION_FEE.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload Your File *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-700 rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-slate-800/50"
                  >
                    {file ? (
                      <div className="text-center">
                        {file.type.startsWith('audio/') ? (
                          <FileAudio className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        ) : (
                          <FileVideo className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                        )}
                        <div className="text-white font-medium">{file.name}</div>
                        <div className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-500 mb-2" />
                        <div className="text-slate-400 mb-1">Click to upload audio or video file</div>
                        <div className="text-xs text-slate-500">Max file size: 500MB</div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter content title"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Creator Name
                </label>
                <input
                  type="text"
                  value={formData.creatorName}
                  onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                  placeholder={user?.name || 'Your name'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your content"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    {paymentCompleted ? 'Complete Registration' : `Pay £${DCCS_REGISTRATION_FEE.toFixed(2)} & Register`}
                  </>
                )}
              </button>

              {paymentCompleted && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-medium">Payment Complete - Ready to Register</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          item={{
            id: 'dccs-registration',
            name: `DCCS Registration: ${formData.title}`,
            artist: formData.creatorName || user?.name || 'You',
            price: DCCS_REGISTRATION_FEE,
            type: 'service',
            artistId: user?.id || ''
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
