import { Shield, Lock, CheckCircle, Download, ExternalLink, Clock, Users, FileCheck, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClearanceCodeGenerator } from '../lib/dccs/ClearanceCodeGenerator';

interface DCCSCertificate {
  certificate_id: string;
  clearance_code: string;
  creator_id: string;
  creator_legal_name: string;
  creator_verified: boolean;
  project_title: string;
  project_type: string;
  creation_timestamp: string;
  audio_fingerprint: string;
  audio_signature: any;
  metadata_hash: string;
  collaborators: any[];
  blockchain_tx_hash: string | null;
  blockchain_network: string | null;
  blockchain_verified: boolean;
  verified_at: string | null;
  certificate_hash: string;
  previous_certificate_hash: string | null;
  available_for_licensing: boolean;
  licensing_status: string;
  created_at: string;
  updated_at: string;
  // NFT metadata (optional)
  nft_blockchain?: string | null;
  nft_wallet_address?: string | null;
  nft_token_id?: string | null;
  nft_contract_address?: string | null;
}

interface DCCSCertificateDisplayProps {
  certificateId?: string;
  clearanceCode?: string;
  snippetId?: string;
  onClose?: () => void;
}

export default function DCCSCertificateDisplay({
  certificateId,
  clearanceCode,
  snippetId,
  onClose
}: DCCSCertificateDisplayProps) {
  const [certificate, setCertificate] = useState<DCCSCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId, clearanceCode, snippetId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('dccs_certificates').select('*');

      if (certificateId) {
        query = query.eq('certificate_id', certificateId);
      } else if (clearanceCode) {
        query = query.eq('clearance_code', clearanceCode);
      } else if (snippetId) {
        query = query.eq('audio_snippet_id', snippetId);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) throw fetchError;
      setCertificate(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    const certificateData = {
      title: 'Digital Creation Certificate (DCCS)',
      certificate_id: certificate.certificate_id,
      clearance_code: certificate.clearance_code,
      project_title: certificate.project_title,
      creator: certificate.creator_legal_name,
      creation_date: new Date(certificate.creation_timestamp).toLocaleString(),
      blockchain_verified: certificate.blockchain_verified,
      blockchain_tx: certificate.blockchain_tx_hash,
      certificate_hash: certificate.certificate_hash,
      issued_by: 'V3BMusic.AI',
      terms: 'Creator retains 80% of all revenues. Platform receives 20% service fee.'
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCCS-${certificate.clearance_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'licensed': return 'text-blue-400';
      case 'exclusive': return 'text-purple-400';
      case 'revoked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Certificate Not Found</h3>
        </div>
        <p className="text-red-300">{error || 'Certificate does not exist or you do not have permission to view it.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Digital Creation Certificate</h2>
              <p className="text-purple-100">Immutable Proof of Creation</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Certificate ID */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">Certificate ID</p>
              <p className="text-white font-mono text-sm">{certificate.certificate_id}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">Clearance Code</p>
              <p className="text-white font-mono text-sm">{certificate.clearance_code}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Project Details */}
        <div className="bg-slate-800/50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Title</p>
              <p className="text-white font-medium">{certificate.project_title}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Asset Type</p>
              <p className="text-white font-medium">
                {(() => {
                  const parsed = ClearanceCodeGenerator.parseClearanceCode(certificate.clearance_code);
                  if (parsed?.assetType) {
                    return ClearanceCodeGenerator.getAssetTypeName(parsed.assetType);
                  }
                  return certificate.project_type.charAt(0).toUpperCase() + certificate.project_type.slice(1);
                })()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Creator</p>
              <p className="text-white font-medium flex items-center gap-2">
                {certificate.creator_legal_name}
                {certificate.creator_verified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className={`font-medium capitalize ${getStatusColor(certificate.licensing_status)}`}>
                {certificate.licensing_status}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-slate-800/50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Created</p>
              <p className="text-white font-medium">
                {new Date(certificate.creation_timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Registered</p>
              <p className="text-white font-medium">
                {new Date(certificate.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-slate-800/50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Blockchain Verification
          </h3>
          {certificate.blockchain_verified ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified on Blockchain</span>
              </div>
              {certificate.blockchain_tx_hash && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-cyan-400 font-mono text-xs break-all">
                      {certificate.blockchain_tx_hash}
                    </p>
                    <a
                      href={`https://basescan.org/tx/${certificate.blockchain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              {certificate.blockchain_network && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Network</p>
                  <p className="text-white font-medium capitalize">{certificate.blockchain_network}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              <span>Pending blockchain verification</span>
            </div>
          )}
        </div>

        {/* NFT Metadata */}
        {(certificate.nft_blockchain || certificate.nft_wallet_address || certificate.nft_token_id) && (
          <div className="bg-slate-800/50 rounded-lg p-5 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              NFT Asset Information
            </h3>
            <div className="space-y-3">
              {certificate.nft_blockchain && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Blockchain Network</p>
                  <p className="text-white font-medium capitalize">{certificate.nft_blockchain}</p>
                </div>
              )}
              {certificate.nft_wallet_address && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Creator Wallet Address</p>
                  <p className="text-purple-400 font-mono text-xs break-all bg-slate-900/50 p-2 rounded">
                    {certificate.nft_wallet_address}
                  </p>
                </div>
              )}
              {certificate.nft_token_id && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Token ID</p>
                  <p className="text-white font-medium">{certificate.nft_token_id}</p>
                </div>
              )}
              {certificate.nft_contract_address && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Contract Address</p>
                  <p className="text-purple-400 font-mono text-xs break-all bg-slate-900/50 p-2 rounded">
                    {certificate.nft_contract_address}
                  </p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-yellow-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    DCCS is the primary proof of ownership. Blockchain/NFT information is supplementary
                    and does not supersede DCCS verification.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collaborators */}
        {certificate.collaborators && certificate.collaborators.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Collaborators
            </h3>
            <div className="space-y-2">
              {certificate.collaborators.map((collab: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                  <span className="text-white font-medium">{collab.name}</span>
                  <span className="text-gray-400 text-sm">{collab.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Hash */}
        <div className="bg-slate-800/50 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Certificate Hash (SHA-256)</h3>
          <p className="text-cyan-400 font-mono text-xs break-all bg-slate-900/50 p-3 rounded-lg">
            {certificate.certificate_hash}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            This hash provides tamper-proof verification of certificate authenticity
          </p>
        </div>

        {/* DCCS Terms */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">DCCS Terms</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Creator retains 100% ownership of the work</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>80% of all revenues go to creator (lifetime)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>20% platform service fee covers infrastructure, dispute resolution, and platform-proofing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>AI guides but never claims ownership or licenses autonomously</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Immutable proof-of-creation established before commercialization</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadCertificate}
            className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Certificate
          </button>
          {certificate.blockchain_tx_hash && (
            <a
              href={`https://basescan.org/tx/${certificate.blockchain_tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              View on Blockchain
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
