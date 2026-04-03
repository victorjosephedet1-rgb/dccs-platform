import { useState } from 'react';
import { Search, Shield, CheckCircle, XCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DCCSBadge from '../components/DCCSBadge';
import DCCSVerificationSeal from '../components/DCCSVerificationSeal';
import { ClearanceCodeGenerator } from '../lib/dccs/ClearanceCodeGenerator';
import { supabase } from '../lib/supabase';
import { DCCSStageIllustration } from '../components/DCCSStoryIllustrations';
import { errorHandler, ErrorCategory } from '../lib/ErrorHandler';

export default function DCCSPublicVerification() {
  const [verificationMode, setVerificationMode] = useState<'code' | 'file'>('code');
  const [clearanceCode, setClearanceCode] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCodeVerification = async () => {
    if (loading) {
      console.log('[VERIFICATION] Verification already in progress, ignoring duplicate request');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('[VERIFICATION] Starting code verification:', clearanceCode);

      if (!clearanceCode.trim()) {
        const validationError = errorHandler.handleError(
          new Error('Clearance code is required'),
          ErrorCategory.VALIDATION,
          'Code verification'
        );
        setError(validationError.userMessage);
        setLoading(false);
        return;
      }

      if (!ClearanceCodeGenerator.validateClearanceCode(clearanceCode)) {
        const formatError = errorHandler.handleError(
          new Error('Invalid code format'),
          ErrorCategory.VERIFICATION,
          'Code format validation'
        );
        setError(formatError.userMessage);
        setLoading(false);
        return;
      }

      console.log('[VERIFICATION] Code format valid, querying database...');

      const { data, error: dbError } = await supabase
        .from('dccs_certificates')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            username
          )
        `)
        .eq('clearance_code', clearanceCode.trim())
        .maybeSingle();

      if (dbError) {
        const databaseError = errorHandler.handleError(
          dbError,
          ErrorCategory.DATABASE,
          'Certificate lookup'
        );
        console.error('[VERIFICATION ERROR] Database query failed:', databaseError);
        throw new Error(databaseError.userMessage);
      }

      if (!data) {
        console.log('[VERIFICATION] Code not found in registry');
        setResult({ found: false });
      } else {
        console.log('[VERIFICATION SUCCESS] Certificate found:', data.id);
        setResult({
          found: true,
          certificate: data
        });
      }
    } catch (err: any) {
      const verificationError = errorHandler.handleError(
        err,
        ErrorCategory.VERIFICATION,
        'Code verification'
      );
      console.error('[VERIFICATION ERROR]', verificationError);
      setError(verificationError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileVerification = async () => {
    if (loading) {
      console.log('[VERIFICATION] Verification already in progress, ignoring duplicate request');
      return;
    }

    if (!uploadedFile) {
      const validationError = errorHandler.handleError(
        new Error('No file selected'),
        ErrorCategory.VALIDATION,
        'File verification'
      );
      setError(validationError.userMessage);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('[VERIFICATION] Starting file verification:', uploadedFile.name);

      console.log('[VERIFICATION] Generating file fingerprint...');
      const { fingerprint } = await ClearanceCodeGenerator.generateAssetFingerprint(uploadedFile);
      console.log('[VERIFICATION] Fingerprint generated:', fingerprint);

      console.log('[VERIFICATION] Querying database for fingerprint match...');
      const { data, error: dbError } = await supabase
        .from('dccs_certificates')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            username
          )
        `)
        .eq('asset_fingerprint', fingerprint)
        .maybeSingle();

      if (dbError) {
        const databaseError = errorHandler.handleError(
          dbError,
          ErrorCategory.DATABASE,
          'Fingerprint lookup'
        );
        console.error('[VERIFICATION ERROR] Database query failed:', databaseError);
        throw new Error(databaseError.userMessage);
      }

      if (!data) {
        console.log('[VERIFICATION] File fingerprint not found in registry');
        setResult({ found: false, fingerprint });
      } else {
        console.log('[VERIFICATION SUCCESS] Match found for fingerprint');
        setResult({
          found: true,
          certificate: data,
          fingerprint
        });
      }
    } catch (err: any) {
      const verificationError = errorHandler.handleError(
        err,
        ErrorCategory.VERIFICATION,
        'File verification'
      );
      console.error('[VERIFICATION ERROR]', verificationError);
      setError(verificationError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setResult(null);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SEOHead
        title="DCCS Public Verification | Check Digital Clearance Codes"
        description="Verify the authenticity of digital assets using DCCS clearance codes. Check ownership, registration date, and creator information instantly."
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DCCS Verification
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verify digital asset ownership and authenticity using DCCS clearance codes or file fingerprints
          </p>
        </div>

        {/* Mode Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                setVerificationMode('code');
                setResult(null);
                setError('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                verificationMode === 'code'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-5 h-5 mx-auto mb-2" />
              Verify by Code
            </button>
            <button
              onClick={() => {
                setVerificationMode('file');
                setResult(null);
                setError('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                verificationMode === 'file'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-2" />
              Verify by File
            </button>
          </div>

          {/* Code Verification */}
          {verificationMode === 'code' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter DCCS Clearance Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={clearanceCode}
                  onChange={(e) => setClearanceCode(e.target.value.toUpperCase())}
                  placeholder="DCCS-AUD-V360-82AF19-20260320"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <button
                  onClick={handleCodeVerification}
                  disabled={loading || !clearanceCode}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Format: DCCS-TYPE-CREATOR-HASH-DATE
              </p>
            </div>
          )}

          {/* File Verification */}
          {verificationMode === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File to Verify
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadedFile ? (
                    <>
                      <FileText className="w-12 h-12 text-blue-600 mb-3" />
                      <p className="text-lg font-semibold text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-lg font-semibold text-gray-900">Drop file here or click to upload</p>
                      <p className="text-sm text-gray-500">Any file type supported</p>
                    </>
                  )}
                </label>
              </div>
              {uploadedFile && (
                <button
                  onClick={handleFileVerification}
                  disabled={loading}
                  className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify File'}
                </button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              {result.found ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-green-900">Asset Verified!</h3>
                        <p className="text-green-700">This asset is registered in the DCCS registry</p>
                      </div>
                    </div>
                    <DCCSVerificationSeal size="lg" variant="certified" animated={true} />
                  </div>

                  <DCCSBadge variant="detailed" size="lg" />

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Asset Title</p>
                        <p className="font-semibold text-gray-900">{result.certificate.asset_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Creator</p>
                        <p className="font-semibold text-gray-900">
                          {result.certificate.profiles?.full_name || result.certificate.profiles?.username || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Clearance Code</p>
                        <p className="font-mono text-sm font-semibold text-blue-600">
                          {result.certificate.clearance_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Registration Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(result.certificate.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Asset Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{result.certificate.asset_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      </div>
                    </div>

                    {result.certificate.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-gray-900">{result.certificate.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-amber-900">Not Found in Registry</h3>
                      <p className="text-amber-700">This asset is not registered with DCCS</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-amber-200 mt-6">
                    <p className="text-gray-700 mb-4">
                      This {verificationMode === 'code' ? 'clearance code' : 'file'} does not exist in our registry.
                    </p>
                    <a
                      href="/dccs-registration"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      <Shield className="w-5 h-5" />
                      Register This Asset Now
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 flex items-center justify-center mb-4 transition-all hover:scale-110">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-sm text-gray-600">
              Verify ownership in seconds using clearance codes or file fingerprints
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 flex items-center justify-center mb-4 transition-all hover:scale-110">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Permanent Registry</h3>
            <p className="text-sm text-gray-600">
              All registrations are permanently stored and cryptographically verified
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 flex items-center justify-center mb-4 transition-all hover:scale-110">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Universal Protection</h3>
            <p className="text-sm text-gray-600">
              Works with any digital asset - audio, video, images, documents, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
