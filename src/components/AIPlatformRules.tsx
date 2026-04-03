import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Cpu, Link as LinkIcon, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PlatformRule {
  id: string;
  rule_name: string;
  rule_type: 'permitted' | 'prohibited' | 'requires_review';
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'instant_ban';
  ai_auto_enforce: boolean;
  auto_action: string;
  examples: string[];
}

export function AIPlatformRules() {
  const [rules, setRules] = useState<PlatformRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const { data, error } = await supabase
        .from('ai_platform_rules')
        .select('*')
        .order('severity', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Failed to load platform rules:', error);
    } finally {
      setLoading(false);
    }
  }

  const permittedRules = rules.filter(r => r.rule_type === 'permitted');
  const prohibitedRules = rules.filter(r => r.rule_type === 'prohibited');
  const reviewRules = rules.filter(r => r.rule_type === 'requires_review');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Cpu className="h-12 w-12 text-blue-400" />
          <LinkIcon className="h-12 w-12 text-purple-400" />
          <Zap className="h-12 w-12 text-yellow-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3">
          AI-Powered Platform Rules
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          V3BMusic.AI is powered by <span className="text-blue-400 font-semibold">AI</span>,{' '}
          <span className="text-purple-400 font-semibold">BLOCKCHAIN</span>, and{' '}
          <span className="text-yellow-400 font-semibold">CRYPTO</span> to ensure
          a safe, transparent, and automated music licensing platform.
        </p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">All content is automatically scanned before going live</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Permitted Content */}
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-2 border-green-500/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-2xl font-bold text-white">Permitted Content</h3>
                <p className="text-green-300 text-sm">What Sound Engineers CAN upload</p>
              </div>
            </div>

            <div className="space-y-4">
              {permittedRules.map(rule => (
                <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-green-400">{rule.rule_name}</h4>
                    {rule.ai_auto_enforce && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        AI Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{rule.description}</p>
                  {rule.examples && rule.examples.length > 0 && (
                    <div className="text-xs text-green-300/70">
                      Examples: {rule.examples.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prohibited Content */}
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-2 border-red-500/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <XCircle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-2xl font-bold text-white">NEVER Permitted</h3>
                <p className="text-red-300 text-sm">Instant ban + legal action</p>
              </div>
            </div>

            <div className="space-y-4">
              {prohibitedRules.map(rule => (
                <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-red-400">{rule.rule_name}</h4>
                    <div className="flex items-center space-x-2">
                      {rule.severity === 'instant_ban' && (
                        <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded font-bold">
                          INSTANT BAN
                        </span>
                      )}
                      {rule.ai_auto_enforce && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          AI Detected
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{rule.description}</p>
                  {rule.examples && rule.examples.length > 0 && (
                    <div className="text-xs text-red-300/70">
                      Examples: {rule.examples.join(', ')}
                    </div>
                  )}
                  <div className="mt-3 text-xs text-red-400 font-medium">
                    Action: {rule.auto_action?.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Required Section */}
      {reviewRules.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-2 border-yellow-500/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">Requires Review</h3>
              <p className="text-yellow-300 text-sm">Must be disclosed or reviewed</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {reviewRules.map(rule => (
              <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-yellow-400">{rule.rule_name}</h4>
                  {rule.ai_auto_enforce && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      AI Flagged
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-3">{rule.description}</p>
                {rule.examples && rule.examples.length > 0 && (
                  <div className="text-xs text-yellow-300/70">
                    Examples: {rule.examples.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Moderation Features */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          AI Moderation Technology
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">AI Analysis</h4>
            <p className="text-gray-400 text-sm">
              Advanced AI scans every upload for copyright violations, prohibited content, and quality issues
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Blockchain Verification</h4>
            <p className="text-gray-400 text-sm">
              DCCS clearance codes ensure content ownership is verified on the blockchain before going live
            </p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Instant Enforcement</h4>
            <p className="text-gray-400 text-sm">
              Zero-tolerance automated enforcement with instant bans for prohibited content
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-red-400 font-bold text-lg mb-2">Zero Tolerance Policy</h4>
            <p className="text-gray-300 leading-relaxed">
              V3BMusic.AI has a <span className="text-red-400 font-semibold">zero-tolerance policy</span> for
              prohibited content. Violations will result in <span className="text-red-400 font-semibold">instant account bans</span>,
              content removal, and potential <span className="text-red-400 font-semibold">legal action</span>. All uploads are
              automatically scanned by AI before going live. Sound Engineers are responsible for ensuring they have
              full rights to all content they upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
