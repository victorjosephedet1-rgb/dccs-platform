import React, { useState } from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface CopyrightProtectionProps {
  snippetId: string;
  title: string;
  artist: string;
}

interface UsageDetection {
  id: string;
  platform: string;
  url: string;
  creator: string;
  detectedAt: string;
  status: 'licensed' | 'unlicensed' | 'investigating';
  confidence: number;
}

export default function CopyrightProtection({ snippetId, title, artist }: CopyrightProtectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detections' | 'watermark'>('overview');
  
  // Mock data for demonstration
  const protectionStats = {
    totalScans: 1247,
    detectedUses: 23,
    licensedUses: 18,
    unlicensedUses: 5,
    lastScan: '2 hours ago'
  };

  const detections: UsageDetection[] = [
    {
      id: '1',
      platform: 'TikTok',
      url: 'https://tiktok.com/@creator1/video/123',
      creator: '@creator1',
      detectedAt: '2025-01-15 14:30',
      status: 'licensed',
      confidence: 0.95
    },
    {
      id: '2',
      platform: 'Instagram',
      url: 'https://instagram.com/p/ABC123',
      creator: '@influencer2',
      detectedAt: '2025-01-15 12:15',
      status: 'unlicensed',
      confidence: 0.87
    },
    {
      id: '3',
      platform: 'YouTube Shorts',
      url: 'https://youtube.com/shorts/XYZ789',
      creator: 'ContentCreator3',
      detectedAt: '2025-01-15 09:45',
      status: 'investigating',
      confidence: 0.92
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'licensed': return 'text-green-400 bg-green-500/20';
      case 'unlicensed': return 'text-red-400 bg-red-500/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'licensed': return <CheckCircle className="h-4 w-4" />;
      case 'unlicensed': return <AlertTriangle className="h-4 w-4" />;
      case 'investigating': return <Eye className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Copyright Protection</h2>
            <p className="text-gray-400">{title} by {artist}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'detections', label: 'Usage Detections' },
            { id: 'watermark', label: 'Watermark Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{protectionStats.totalScans}</div>
                <div className="text-sm text-gray-400">Total Scans</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{protectionStats.licensedUses}</div>
                <div className="text-sm text-gray-400">Licensed Uses</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{protectionStats.unlicensedUses}</div>
                <div className="text-sm text-gray-400">Unlicensed Uses</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((protectionStats.licensedUses / protectionStats.detectedUses) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Compliance Rate</div>
              </div>
            </div>

            {/* Protection Status */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="text-lg font-semibold text-green-300">Protection Active</h3>
              </div>
              <p className="text-green-200 text-sm mb-3">
                Your snippet is being monitored across major platforms. Last scan: {protectionStats.lastScan}
              </p>
              <div className="flex space-x-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">TikTok</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Instagram</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">YouTube</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Twitter</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {detections.slice(0, 3).map((detection) => (
                  <div key={detection.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(detection.status)}
                      <div>
                        <div className="text-white text-sm">{detection.platform} - {detection.creator}</div>
                        <div className="text-gray-400 text-xs">{detection.detectedAt}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(detection.status)}`}>
                      {detection.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Usage Detections</h3>
              <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
                Export Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Creator</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Detected</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Confidence</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {detections.map((detection) => (
                    <tr key={detection.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{detection.platform}</td>
                      <td className="py-3 px-4 text-white">{detection.creator}</td>
                      <td className="py-3 px-4 text-gray-300">{detection.detectedAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-purple-400 h-2 rounded-full" 
                              style={{ width: `${detection.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-300">
                            {Math.round(detection.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 w-fit ${getStatusColor(detection.status)}`}>
                          {getStatusIcon(detection.status)}
                          <span>{detection.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {detection.status === 'unlicensed' && (
                            <button className="p-1 text-red-400 hover:text-red-300 transition-colors">
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'watermark' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Watermark Configuration</h3>
              <p className="text-gray-400 mb-6">
                Configure how your snippets are watermarked for tracking and protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Watermark Type
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="audio">Audio Fingerprint (Recommended)</option>
                    <option value="inaudible">Inaudible Watermark</option>
                    <option value="both">Both Methods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tracking Intensity
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="high">High (Every 2 hours)</option>
                    <option value="medium">Medium (Every 6 hours)</option>
                    <option value="low">Low (Daily)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Enable automatic DMCA takedowns</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Send usage alerts via email</span>
                  </label>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Watermark Preview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Original File:</span>
                    <span className="text-sm text-white">3.2 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Watermarked:</span>
                    <span className="text-sm text-white">3.2 MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Quality Impact:</span>
                    <span className="text-sm text-green-400">None</span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Download Watermarked Version</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">How It Works</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Audio fingerprinting creates unique signatures for each snippet</li>
                <li>• Inaudible watermarks embed tracking data without affecting quality</li>
                <li>• Our AI scans major platforms every few hours for matches</li>
                <li>• Automatic notifications alert you to both licensed and unlicensed usage</li>
                <li>• DMCA takedown requests can be sent automatically for violations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}