import React, { useState } from 'react';
import { Shield, Copy, Check, QrCode, ExternalLink, Youtube, TrendingUp, DollarSign } from 'lucide-react';

interface ClearanceCodeDisplayProps {
  clearanceCode: string;
  verificationUrl: string;
  trackTitle: string;
  artistName: string;
  platformsAllowed: string[];
  totalViews: number;
  totalRoyaltiesEarned: number;
  usageCount: number;
}

export default function ClearanceCodeDisplay({
  clearanceCode,
  verificationUrl,
  trackTitle,
  artistName,
  platformsAllowed,
  totalViews,
  totalRoyaltiesEarned,
  usageCount,
}: ClearanceCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformIcons: Record<string, string> = {
    youtube: '🎥',
    tiktok: '🎵',
    instagram: '📸',
    twitch: '🎮',
    facebook: '👥',
    podcast: '🎙️',
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Digital Clearance Code</h3>
              <p className="text-gray-400 text-sm">Use this code for all your content</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">VERIFIED</div>
            <div className="text-xs text-gray-400">Copyright Protected</div>
          </div>
        </div>

        {/* Track Info */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Licensed Track</div>
          <div className="text-lg font-semibold text-white">{trackTitle}</div>
          <div className="text-sm text-gray-300">by {artistName}</div>
        </div>
      </div>

      {/* Clearance Code */}
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Unique Clearance Code
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-black/30 border border-green-500/50 rounded-lg px-4 py-3 font-mono text-xl text-green-400 tracking-wider">
              {clearanceCode}
            </div>
            <button
              onClick={() => copyToClipboard(clearanceCode)}
              className="p-3 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <Copy className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Include this code in your video description or use our tracking link
          </p>
        </div>

        {/* Verification URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Verification Link (Add to Description)
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-sm text-gray-300 truncate">
              {verificationUrl}
            </div>
            <button
              onClick={() => copyToClipboard(verificationUrl)}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4 text-white" />
            </button>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Youtube className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {totalViews.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Artist Earned</span>
            </div>
            <div className="text-2xl font-bold text-white">
              £{(totalRoyaltiesEarned * 0.70).toFixed(2)}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Content Pieces</span>
            </div>
            <div className="text-2xl font-bold text-white">{usageCount}</div>
          </div>
        </div>

        {/* Allowed Platforms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Approved Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {platformsAllowed.map((platform) => (
              <span
                key={platform}
                className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium capitalize flex items-center space-x-2"
              >
                <span>{platformIcons[platform] || '✓'}</span>
                <span>{platform}</span>
              </span>
            ))}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="h-20 w-20 text-gray-800" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">
                QR Code Verification
              </h4>
              <p className="text-sm text-gray-300 mb-4">
                Scan this QR code to instantly verify the clearance and view real-time
                royalty tracking. Great for showing in videos or thumbnails.
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors">
                <QrCode className="h-4 w-4" />
                <span>Download QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">
            Important: Ongoing Royalties
          </h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>
              • Artist receives 70% of ongoing royalties from EVERY view your content
              generates
            </li>
            <li>
              • V3BMusic.AI maintains 30% commission for platform services
            </li>
            <li>
              • Royalties are calculated automatically and paid weekly
            </li>
            <li>
              • Add the verification link to ALL content using this audio
            </li>
            <li>
              • Your clearance code ensures copyright protection across all
              platforms
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
