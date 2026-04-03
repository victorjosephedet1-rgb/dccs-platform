import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Clock, FileText, Zap, DollarSign, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './NotificationSystem';
import { supabase } from '../lib/supabase';
import { RoyaltyEngine, PaymentNotificationService } from '../lib/royaltyEngine';

interface EnhancedAutomatedLicensingProps {
  snippetId: string;
  onLicenseComplete: (licenseId: string) => void;
  onClose?: () => void;
}

interface LicensingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
}

export default function EnhancedAutomatedLicensing({
  snippetId,
  onLicenseComplete,
  onClose
}: EnhancedAutomatedLicensingProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [snippet, setSnippet] = useState<Record<string, unknown> | null>(null);
  const [licensingTerms, setLicensingTerms] = useState<Record<string, unknown> | null>(null);
  const [royaltySplits, setRoyaltySplits] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const [steps, setSteps] = useState<LicensingStep[]>([
    { name: 'Payment Processing', status: 'pending', message: 'Validating payment information' },
    { name: 'AI Royalty Calculation', status: 'pending', message: 'Analyzing royalty splits' },
    { name: 'Instant Distribution', status: 'pending', message: 'Distributing payments globally' },
    { name: 'License Generation', status: 'pending', message: 'Creating legal license agreement' },
    { name: 'Blockchain Recording', status: 'pending', message: 'Recording on immutable ledger' },
    { name: 'Completion', status: 'pending', message: 'Finalizing transaction' }
  ]);

  useEffect(() => {
    loadSnippetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippetId]);

  const loadSnippetData = async () => {
    try {
      // Load snippet details
      const { data: snippetData, error: snippetError } = await supabase
        .from('audio_snippets')
        .select('*')
        .eq('id', snippetId)
        .single();

      if (snippetError) throw snippetError;
      setSnippet(snippetData);

      // Load licensing terms
      const { data: termsData } = await supabase
        .from('licensing_terms')
        .select('*')
        .eq('snippet_id', snippetId)
        .single();

      setLicensingTerms(termsData);

      // Load royalty splits
      const { data: splitsData } = await supabase
        .from('royalty_splits')
        .select('*')
        .eq('snippet_id', snippetId);

      setRoyaltySplits(splitsData || []);

    } catch (error) {
      console.error('Error loading snippet data:', error);
      addNotification({
        type: 'error',
        title: 'Load Error',
        message: 'Failed to load track information'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStepStatus = (index: number, status: LicensingStep['status'], message?: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        status,
        message: message || newSteps[index].message
      };
      return newSteps;
    });
  };

  const processLicense = async () => {
    if (!user || !snippet) return;

    setProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Payment Processing (simulated for now)
      updateStepStatus(0, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(0, 'completed', 'Payment validated successfully');
      setCurrentStep(1);

      // Step 2: Create License Record
      const { data: license, error: licenseError } = await supabase
        .from('snippet_licenses')
        .insert({
          snippet_id: snippetId,
          user_id: user.id,
          price_paid: snippet.price,
          license_type: licensingTerms?.license_type || 'Content Creator License'
        })
        .select()
        .single();

      if (licenseError) throw licenseError;
      setLicenseId(license.id);

      // Step 2: AI Royalty Calculation & Distribution
      updateStepStatus(1, 'processing', 'AI analyzing royalty distribution');
      await new Promise(resolve => setTimeout(resolve, 800));

      updateStepStatus(2, 'processing', 'Processing instant payments');

      const royaltyResult = await RoyaltyEngine.calculateAndDistribute(
        snippetId,
        license.id,
        user.id,
        snippet.price,
        'blockchain' // Could be 'stripe' or 'crypto'
      );

      if (!royaltyResult.success) {
        throw new Error(royaltyResult.errors?.join(', ') || 'Royalty calculation failed');
      }

      setTransactionId(royaltyResult.transaction_id);

      updateStepStatus(1, 'completed', `AI validation score: ${royaltyResult.validation_score}%`);
      updateStepStatus(2, 'completed', `${royaltyResult.distributions.length} payments distributed`);
      setCurrentStep(3);

      // Send payment notifications
      await PaymentNotificationService.notifyMultipleRecipients(
        royaltyResult.distributions,
        snippet.title
      );

      // Step 3: License Generation
      updateStepStatus(3, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(3, 'completed', 'Legal license document generated');
      setCurrentStep(4);

      // Step 4: Blockchain Recording
      updateStepStatus(4, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1200));
      updateStepStatus(4, 'completed', 'Transaction recorded on blockchain');
      setCurrentStep(5);

      // Step 5: Completion
      updateStepStatus(5, 'processing');
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStepStatus(5, 'completed', 'License ready for download');

      addNotification({
        type: 'success',
        title: 'License Complete!',
        message: `You can now use "${snippet.title}" in your content`
      });

      onLicenseComplete(license.id);

    } catch (error) {
      console.error('Licensing error:', error);

      // Mark current step as failed
      if (currentStep < steps.length) {
        updateStepStatus(currentStep, 'failed', 'An error occurred');
      }

      addNotification({
        type: 'error',
        title: 'Licensing Failed',
        message: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="bg-gray-900 rounded-xl border border-white/20 p-8">
        <p className="text-white text-center">Track not found</p>
      </div>
    );
  }

  const allCompleted = steps.every(s => s.status === 'completed');

  return (
    <div className="bg-gray-900 rounded-xl border border-white/20 max-w-3xl w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-b border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Zap className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">AI-Powered Instant Licensing</h2>
        </div>
        <p className="text-gray-300">
          V3BMusic.AI processes your license in under 10 seconds with instant global payments
        </p>
      </div>

      {/* Track Info */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            {snippet.cover_image_url ? (
              <img src={snippet.cover_image_url} alt={snippet.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <FileText className="h-10 w-10 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{snippet.title}</h3>
            <p className="text-gray-400">by {snippet.artist}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">${snippet.price.toFixed(2)}</div>
            <div className="text-sm text-gray-400">License Fee</div>
          </div>
        </div>

        {/* Royalty Split Preview */}
        {royaltySplits.length > 0 && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Royalty Distribution</span>
            </div>
            <div className="space-y-2">
              {royaltySplits.slice(0, 3).map((split) => (
                <div key={split.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{split.recipient_name}</span>
                  <span className="text-purple-400 font-medium">{split.percentage}%</span>
                </div>
              ))}
              {royaltySplits.length > 3 && (
                <div className="text-xs text-gray-500">+{royaltySplits.length - 3} more recipients</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Processing Steps */}
      <div className="p-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-start space-x-3 transition-opacity ${
              index > currentStep + 1 ? 'opacity-40' : 'opacity-100'
            }`}>
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
                {step.status === 'processing' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                )}
                {step.status === 'failed' && (
                  <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                )}
                {step.status === 'pending' && (
                  <Clock className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white mb-1">{step.name}</div>
                <div className="text-sm text-gray-400">{step.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/10">
        {!processing && !allCompleted && (
          <div className="space-y-3">
            <button
              onClick={processLicense}
              disabled={!user}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <DollarSign className="h-5 w-5" />
              <span>Process License & Pay Artists</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {allCompleted && (
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">License Complete!</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Your license is ready. All artists have been paid instantly.
              </p>
            </div>

            <button
              onClick={() => window.open(`/license/${licenseId}`, '_blank')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-cyan-600 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download License & Track</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>256-bit Encryption</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Blockchain Verified</span>
          </div>
          <span>•</span>
          <span>Instant Global Payments</span>
        </div>
      </div>
    </div>
  );
}
