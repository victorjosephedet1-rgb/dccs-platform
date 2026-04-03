import { Brain, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';

interface AITrainingConsentControlProps {
  initialConsent?: boolean;
  onChange: (consent: AITrainingConsentData) => void;
  showDetails?: boolean;
}

export interface AITrainingConsentData {
  training_allowed: boolean;
  allowed_for_internal_ai: boolean;
  allowed_for_third_party_ai: boolean;
  allowed_for_research: boolean;
  badge_visible: boolean;
}

export default function AITrainingConsentControl({
  initialConsent = false,
  onChange,
  showDetails = true
}: AITrainingConsentControlProps) {
  const [consent, setConsent] = useState<AITrainingConsentData>({
    training_allowed: initialConsent,
    allowed_for_internal_ai: false,
    allowed_for_third_party_ai: false,
    allowed_for_research: false,
    badge_visible: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConsent = (updates: Partial<AITrainingConsentData>) => {
    const newConsent = { ...consent, ...updates };

    // If training_allowed is false, all sub-options must be false
    if (!newConsent.training_allowed) {
      newConsent.allowed_for_internal_ai = false;
      newConsent.allowed_for_third_party_ai = false;
      newConsent.allowed_for_research = false;
    }

    setConsent(newConsent);
    onChange(newConsent);
  };

  return (
    <div className="space-y-4">
      {/* Main Toggle */}
      <div className="bg-slate-800/50 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500/20 p-3 rounded-full flex-shrink-0">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">AI Training Consent</h3>
            <p className="text-gray-400 text-sm mb-4">
              Choose whether your work can be used to train AI models. You can change this at any time.
            </p>

            {/* Primary Toggle */}
            <label className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4 cursor-pointer hover:bg-slate-900/70 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">Allow AI Training</span>
                  {!consent.training_allowed && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      Training-Free
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  {consent.training_allowed
                    ? 'Your work can be used to improve AI systems'
                    : 'Your work will NOT be used for AI training'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={consent.training_allowed}
                onChange={(e) => updateConsent({ training_allowed: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      {consent.training_allowed && (
        <div className="bg-slate-800/50 rounded-lg p-5 space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-white font-medium">Advanced Options</span>
            <span className="text-gray-400">{showAdvanced ? '▼' : '▶'}</span>
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-4 border-l-2 border-purple-500/30">
              {/* Internal AI */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">V3BMusic Internal AI</span>
                  <p className="text-gray-400 text-xs mt-1">
                    Recommendation engine, marketplace optimization
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.allowed_for_internal_ai}
                  onChange={(e) => updateConsent({ allowed_for_internal_ai: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500 ml-4"
                />
              </label>

              {/* Third-Party AI */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">Third-Party AI</span>
                  <p className="text-gray-400 text-xs mt-1">
                    External AI models and services
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.allowed_for_third_party_ai}
                  onChange={(e) => updateConsent({ allowed_for_third_party_ai: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500 ml-4"
                />
              </label>

              {/* Research */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">Research Purposes</span>
                  <p className="text-gray-400 text-xs mt-1">
                    Academic and scientific research
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.allowed_for_research}
                  onChange={(e) => updateConsent({ allowed_for_research: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500 ml-4"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Badge Visibility */}
      <div className="bg-slate-800/50 rounded-lg p-5">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex-1">
            <span className="text-white font-medium">Show Public Badge</span>
            <p className="text-gray-400 text-sm mt-1">
              Display your AI training preference on your profile and tracks
            </p>
          </div>
          <input
            type="checkbox"
            checked={consent.badge_visible}
            onChange={(e) => updateConsent({ badge_visible: e.target.checked })}
            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
          />
        </label>
      </div>

      {/* Information Sections */}
      {showDetails && (
        <>
          {/* Why This Matters */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">Why This Matters</h4>
                <p className="text-gray-300 text-sm">
                  Many AI companies train their models on creators' work without consent. V3BMusic gives you control. Your choice is:
                </p>
                <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Contractually binding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Blockchain-anchored for proof
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Revocable at any time
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* DCCS Protection */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-purple-300 font-semibold mb-2">DCCS Protection</h4>
                <p className="text-gray-300 text-sm">
                  Your AI training preference is recorded in your Digital Creation Certificate System (DCCS) record. This provides:
                </p>
                <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                  <li>• Immutable proof of your consent decision</li>
                  <li>• Legal evidence in case of disputes</li>
                  <li>• Transparent audit trail</li>
                  <li>• Easy revocation process</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Industry Context */}
          {!consent.training_allowed && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-300 font-semibold mb-2">You're Protected</h4>
                  <p className="text-gray-300 text-sm">
                    By opting out, you're protecting your work in an uncertain legal landscape. Major lawsuits (Suno, Udio) and evolving regulations (EU AI Act, UK Copyright Reform) make AI training consent increasingly important.
                  </p>
                </div>
              </div>
            </div>
          )}

          {consent.training_allowed && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-2">You Can Change This</h4>
                  <p className="text-gray-300 text-sm">
                    You can revoke consent at any time. Your work uploaded before revocation may still be in training datasets, but no new training will occur after you opt out.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Current Status Summary */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <h4 className="text-white font-semibold mb-2">Current Settings</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">AI Training:</span>
            <span className={consent.training_allowed ? 'text-yellow-400' : 'text-green-400'}>
              {consent.training_allowed ? 'Allowed' : 'Not Allowed'}
            </span>
          </div>
          {consent.training_allowed && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Internal AI:</span>
                <span className={consent.allowed_for_internal_ai ? 'text-green-400' : 'text-gray-400'}>
                  {consent.allowed_for_internal_ai ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Third-Party AI:</span>
                <span className={consent.allowed_for_third_party_ai ? 'text-yellow-400' : 'text-gray-400'}>
                  {consent.allowed_for_third_party_ai ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Research:</span>
                <span className={consent.allowed_for_research ? 'text-blue-400' : 'text-gray-400'}>
                  {consent.allowed_for_research ? 'Yes' : 'No'}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Public Badge:</span>
            <span className={consent.badge_visible ? 'text-cyan-400' : 'text-gray-400'}>
              {consent.badge_visible ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
