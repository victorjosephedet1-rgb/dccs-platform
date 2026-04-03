import React, { useState } from 'react';
import { Upload, Search, Shield, CheckCircle, AlertTriangle, FileAudio, Info } from 'lucide-react';
import { distortionTolerantVerification, VerificationMatch, VerificationReport } from '../lib/dccs/DistortionTolerantVerification';
import SEOHead from '../components/SEOHead';

type VerificationMode = 'code' | 'file';

export default function DCCSVerificationPortal() {
  const [mode, setMode] = useState<VerificationMode>('code');
  const [dccsCode, setDccsCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [codeResult, setCodeResult] = useState<VerificationMatch | null>(null);
  const [fileResults, setFileResults] = useState<VerificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCode = async () => {
    if (!dccsCode.trim()) {
      setError('Please enter a DCCS code');
      return;
    }

    setVerifying(true);
    setError(null);
    setCodeResult(null);

    try {
      const result = await distortionTolerantVerification.verifyByDCCSCode(dccsCode.trim());

      if (result) {
        setCodeResult(result);
      } else {
        setError('DCCS code not found in our registry');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyFile = async () => {
    if (!selectedFile) {
      setError('Please select a media file');
      return;
    }

    setVerifying(true);
    setError(null);
    setFileResults(null);

    try {
      const result = await distortionTolerantVerification.verifyMediaFile(selectedFile);
      setFileResults(result);
    } catch (err) {
      setError('File verification failed. Please try again.');
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'certain':
      case 'very_high':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SEOHead
        title="DCCS Verification Portal - Verify Digital Clearance Codes"
        description="Verify DCCS certificates and check media authenticity using our patent-pending distortion-tolerant verification technology."
        keywords="DCCS verification, digital clearance code, media authentication, content verification, copyright protection"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              DCCS Verification Portal
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Verify the authenticity and ownership of digital media using our patent-pending
              distortion-tolerant fingerprint verification technology
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex gap-4 mb-8 border-b">
              <button
                onClick={() => {
                  setMode('code');
                  setError(null);
                  setCodeResult(null);
                  setFileResults(null);
                }}
                className={`pb-4 px-6 font-semibold transition-colors ${
                  mode === 'code'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-5 h-5 inline mr-2" />
                Verify by Code
              </button>
              <button
                onClick={() => {
                  setMode('file');
                  setError(null);
                  setCodeResult(null);
                  setFileResults(null);
                }}
                className={`pb-4 px-6 font-semibold transition-colors ${
                  mode === 'file'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Verify by File
              </button>
            </div>

            {mode === 'code' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Enter DCCS Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={dccsCode}
                    onChange={(e) => setDccsCode(e.target.value)}
                    placeholder="e.g., DCCS-VXB-2026-AUD-A1B2C3D4-T1"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={verifying}
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifying}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                  >
                    {verifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Media File
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*,video/*"
                    className="hidden"
                    id="file-upload"
                    disabled={verifying}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileAudio className="w-12 h-12 text-slate-400 mb-3" />
                    {selectedFile ? (
                      <p className="text-slate-700 font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-500">
                          Audio or video files (MP3, WAV, MP4, etc.)
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {selectedFile && (
                  <button
                    onClick={handleVerifyFile}
                    disabled={verifying}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
                  >
                    {verifying ? 'Analyzing...' : 'Verify File'}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>

          {codeResult && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-slate-900">Verification Successful</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">DCCS Code</p>
                    <p className="font-mono font-semibold text-slate-900">
                      {codeResult.targetDCCSCode}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Match Type</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceBadgeColor(
                        codeResult.confidenceLevel
                      )}`}
                    >
                      {codeResult.matchType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Similarity Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${codeResult.similarityScore}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-900">
                      {codeResult.similarityScore.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-2">Certificate Details</p>
                  <p className="text-sm text-blue-800">
                    This DCCS certificate is registered and verified in our system.
                    The content is protected under the Digital Clearance Code System.
                  </p>
                </div>
              </div>
            </div>
          )}

          {fileResults && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Verification Results</h2>
                <span className="text-sm text-slate-600">
                  Scanned {fileResults.totalCandidatesScanned} certificates in{' '}
                  {fileResults.processingTimeMs}ms
                </span>
              </div>

              {fileResults.matches.length === 0 ? (
                <div className="p-8 text-center">
                  <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium mb-2">No Matches Found</p>
                  <p className="text-sm text-slate-600">
                    This media file does not match any registered DCCS certificates in our database.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fileResults.matches.map((match, index) => (
                    <div
                      key={match.matchId}
                      className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-mono font-semibold text-slate-900">
                              {match.targetDCCSCode}
                            </p>
                            <p className="text-sm text-slate-600">
                              {match.confidenceLevel.replace('_', ' ')} confidence
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceBadgeColor(
                            match.confidenceLevel
                          )}`}
                        >
                          {match.similarityScore.toFixed(1)}%
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${match.similarityScore}%` }}
                          />
                        </div>

                        {match.distortionDetected && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm font-semibold text-slate-700 mb-2">
                              Detected Transformations:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.distortionTypes.map((distortion) => (
                                <span
                                  key={distortion}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"
                                >
                                  {distortion.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                            {match.transformationParameters.estimatedPitchShift !== undefined && (
                              <p className="text-sm text-slate-600 mt-2">
                                Pitch shift: {match.transformationParameters.estimatedPitchShift > 0 ? '+' : ''}
                                {match.transformationParameters.estimatedPitchShift.toFixed(1)} semitones
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  About DCCS Verification Technology
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Our patent-pending verification system uses distortion-tolerant fingerprinting
                  to identify media content even after modifications such as pitch shifts, speed
                  changes, compression, or noise addition.
                </p>
                <a
                  href="/dccs-system"
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  Learn more about DCCS technology →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
