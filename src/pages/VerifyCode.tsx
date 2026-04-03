import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, AlertTriangle, Clock, User, FileText, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClearanceCodeGenerator } from '../lib/dccs/ClearanceCodeGenerator';
import { useNavigate } from 'react-router-dom';
import { SecureGridPattern } from '../components/BackgroundPatterns';
import { DCCSCodeDisplay } from '../components/DCCSCodeDisplay';

interface VerificationResult {
  isValid: boolean;
  found: boolean;
  certificate?: {
    clearance_code: string;
    project_title: string;
    project_type: string;
    creator_legal_name: string;
    creator_verified: boolean;
    creation_timestamp: string;
    created_at: string;
    licensing_status: string;
    blockchain_verified: boolean;
    blockchain_network?: string;
    nft_blockchain?: string;
    nft_wallet_address?: string;
    nft_token_id?: string;
    nft_contract_address?: string;
  };
  error?: string;
}

export default function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) {
      setResult({
        isValid: false,
        found: false,
        error: 'Please enter a DCCS code'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const normalizedCode = code.trim().toUpperCase();
      const isValidFormat = ClearanceCodeGenerator.validateClearanceCode(normalizedCode);

      if (!isValidFormat) {
        setResult({
          isValid: false,
          found: false,
          error: 'Invalid DCCS code format'
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('dccs_certificates')
        .select(`
          clearance_code,
          project_title,
          project_type,
          creator_legal_name,
          creator_verified,
          creation_timestamp,
          created_at,
          licensing_status,
          blockchain_verified,
          blockchain_network,
          nft_blockchain,
          nft_wallet_address,
          nft_token_id,
          nft_contract_address
        `)
        .eq('clearance_code', normalizedCode)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setResult({
          isValid: true,
          found: false,
          error: 'Code not found in registry'
        });
      } else {
        setResult({
          isValid: true,
          found: true,
          certificate: data
        });
      }
    } catch (err: any) {
      setResult({
        isValid: false,
        found: false,
        error: err.message || 'Verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const getAssetTypeInfo = (code: string) => {
    const parsed = ClearanceCodeGenerator.parseClearanceCode(code);
    if (parsed?.assetType) {
      return {
        code: parsed.assetType,
        name: ClearanceCodeGenerator.getAssetTypeName(parsed.assetType)
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <SecureGridPattern className="text-blue-500" />

      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-black to-black pointer-events-none" />

      <div className="relative z-10">
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/')}
              className="text-cyan-400 hover:text-cyan-300 transition-fast flex items-center gap-2 mb-4 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-fast">←</span>
              <span>Back to Home</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <Shield className="w-12 h-12 text-cyan-400 relative" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Verify DCCS Code
                </h1>
                <p className="text-gray-400 text-lg">
                  Public ownership verification system
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="glass-dark rounded-xl p-8 mb-8 border-white/10 animate-slide-up">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-3">
                Verify Ownership and Authenticity
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Enter any DCCS clearance code to verify its registration and ownership status.
              </p>
            </div>
          </div>

          <div className="glass-dark rounded-2xl p-10 mb-8 border-white/10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <label className="block text-white text-xl font-semibold mb-6">
              Enter DCCS Clearance Code
            </label>
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="DCCS-AUD-2026-9F3K2L"
                  className="w-full px-6 py-4 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-lg transition-smooth group-hover:border-white/30"
                  disabled={loading}
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-fast pointer-events-none" />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl transition-smooth flex items-center gap-3 shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none relative overflow-hidden group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Verify</span>
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-smooth" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Example: DCCS-AUD-2026-9F3K2L, DCCS-ART-2026-X82LMN, DCCS-NFT-2026-A7B4CD
            </p>
          </div>

          {result && (
            <div className="space-y-6 animate-scale-in">
              {result.found && result.certificate ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-green-500 bg-black/80 p-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
                  <div className="relative flex items-center gap-5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                      <div className="relative bg-green-500/10 p-4 rounded-2xl border border-green-500/50">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">VERIFIED</h3>
                      <p className="text-green-300 text-lg font-medium">Ownership confirmed in DCCS registry</p>
                    </div>
                  </div>
                </div>
              ) : result.isValid ? (
                <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-500 bg-black/80 p-10">
                  <div className="flex items-center gap-5">
                    <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/50">
                      <AlertTriangle className="w-12 h-12 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">NOT FOUND</h3>
                      <p className="text-yellow-300 text-lg">Code format valid, but not registered in DCCS</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border-2 border-red-500 bg-black/80 p-10">
                  <div className="flex items-center gap-5">
                    <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/50">
                      <XCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">INVALID</h3>
                      <p className="text-red-300 text-lg">{result.error || 'Invalid DCCS code format'}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.found && result.certificate && (
                <div className="card-premium overflow-hidden border-white/10">
                  <div className="bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 border-b border-white/10 px-8 py-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <FileText className="w-7 h-7 text-cyan-400" />
                      Certificate Details
                    </h3>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="space-y-4">
                      <label className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                        DCCS Clearance Code
                      </label>
                      <DCCSCodeDisplay code={result.certificate.clearance_code} size="lg" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        Asset Type
                      </label>
                      <div className="flex items-center gap-4">
                        {(() => {
                          const typeInfo = getAssetTypeInfo(result.certificate.clearance_code);
                          return (
                            <>
                              <span className="px-5 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-300 rounded-xl font-bold border border-cyan-500/30 text-lg">
                                {typeInfo?.code || 'Unknown'}
                              </span>
                              <span className="text-white text-xl font-semibold">
                                {typeInfo?.name || result.certificate.project_type}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        Project Title
                      </label>
                      <p className="text-white text-2xl font-semibold">
                        {result.certificate.project_title}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        Creator
                      </label>
                      <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-gray-400" />
                        <span className="text-white text-xl font-semibold">
                          {result.certificate.creator_legal_name}
                        </span>
                        {result.certificate.creator_verified && (
                          <span className="verified-badge">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        Registration Date
                      </label>
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-gray-400" />
                        <span className="text-white text-lg">
                          {new Date(result.certificate.created_at).toLocaleString('en-US', {
                            dateStyle: 'long',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                        Ownership Status
                      </label>
                      <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-green-400" />
                        <span className="text-green-300 text-lg font-bold capitalize">
                          {result.certificate.licensing_status}
                        </span>
                      </div>
                    </div>

                    {result.certificate.blockchain_verified && (
                      <div className="space-y-3">
                        <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                          Blockchain Verification
                        </label>
                        <div className="status-success rounded-xl p-6">
                          <div className="flex items-center gap-3 text-green-300 mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-bold text-lg">Verified on Blockchain</span>
                          </div>
                          {result.certificate.blockchain_network && (
                            <p className="text-gray-300 text-sm ml-9">
                              Network: <span className="text-white font-semibold capitalize">{result.certificate.blockchain_network}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(result.certificate.nft_blockchain || result.certificate.nft_wallet_address) && (
                      <div className="space-y-3">
                        <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                          NFT Information
                        </label>
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 space-y-4">
                          {result.certificate.nft_blockchain && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Blockchain</p>
                              <p className="text-white text-lg font-semibold capitalize">
                                {result.certificate.nft_blockchain}
                              </p>
                            </div>
                          )}
                          {result.certificate.nft_wallet_address && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
                              <p className="text-purple-300 font-mono text-sm break-all">
                                {result.certificate.nft_wallet_address}
                              </p>
                            </div>
                          )}
                          {result.certificate.nft_token_id && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Token ID</p>
                              <p className="text-white font-semibold">
                                {result.certificate.nft_token_id}
                              </p>
                            </div>
                          )}
                          <div className="pt-4 border-t border-purple-500/20">
                            <p className="text-yellow-300 text-sm flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>
                                DCCS is the primary proof of ownership. NFT information is supplementary.
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && (
            <div className="glass-dark rounded-xl p-8 border-white/10 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-white text-xl font-semibold mb-4">About DCCS Verification</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                DCCS provides universal ownership verification for creative works. Each registered asset
                receives a unique clearance code that can be publicly verified by anyone.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    All asset types: Audio, Video, Art, NFTs, Documents, Code
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Blockchain-agnostic verification
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    Instant public verification
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
