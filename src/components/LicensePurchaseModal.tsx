import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Tag, FileText, Globe, Users, Briefcase, GraduationCap, Radio, Building, ChevronDown, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PLATFORM_INFO } from '../utils/routes';

interface MarketplaceListing {
  upload_id: string;
  creator_id: string;
  file_name: string;
  file_category: string;
  description: string | null;
  price: number | null;
  clearance_code: string | null;
  project_title: string | null;
  creator_name: string | null;
}

interface Props {
  listing: MarketplaceListing;
  onClose: () => void;
  onSuccess: () => void;
}

const LICENSE_TYPES = [
  {
    value: 'personal',
    label: 'Personal Use',
    icon: Users,
    description: 'Non-commercial personal projects only. No distribution.',
    multiplier: 1,
  },
  {
    value: 'commercial',
    label: 'Commercial',
    icon: Briefcase,
    description: 'Use in commercial products, advertising, and business content.',
    multiplier: 2.5,
  },
  {
    value: 'educational',
    label: 'Educational',
    icon: GraduationCap,
    description: 'Educational institutions and non-profit learning materials.',
    multiplier: 1.5,
  },
  {
    value: 'broadcast',
    label: 'Broadcast',
    icon: Radio,
    description: 'TV, radio, streaming platforms, and broadcast media.',
    multiplier: 4,
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    icon: Building,
    description: 'Unlimited use across enterprise with sub-licensing rights.',
    multiplier: 8,
  },
] as const;

export default function LicensePurchaseModal({ listing, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [licenseType, setLicenseType] = useState<string>('personal');
  const [territory, setTerritory]     = useState('worldwide');
  const [duration, setDuration]       = useState('perpetual');
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedLicense = LICENSE_TYPES.find((lt) => lt.value === licenseType) ?? LICENSE_TYPES[0];
  const basePrice = listing.price ?? 0;
  const finalPrice = basePrice === 0 ? 0 : parseFloat((basePrice * selectedLicense.multiplier).toFixed(2));
  const creatorPayout = parseFloat((finalPrice * 0.8).toFixed(2));
  const platformFee = parseFloat((finalPrice * 0.2).toFixed(2));
  const title = listing.project_title ?? listing.file_name;

  const handlePurchase = async () => {
    if (!user) { setError('You must be signed in to purchase a license.'); return; }
    if (!agreed) { setError('Please accept the license terms to continue.'); return; }

    setLoading(true);
    setError(null);

    try {
      const { error: dbErr } = await supabase
        .from('marketplace_license_purchases')
        .insert({
          buyer_id:    user.id,
          upload_id:   listing.upload_id,
          creator_id:  listing.creator_id,
          license_type: licenseType,
          price_paid:  finalPrice,
          currency:    'GBP',
          status:      finalPrice === 0 ? 'completed' : 'pending',
          metadata: {
            territory,
            duration,
            clearance_code: listing.clearance_code,
            base_price: basePrice,
            multiplier: selectedLicense.multiplier,
          },
        });

      if (dbErr) throw dbErr;
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Purchase License</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">License Acquired</h3>
            <p className="text-slate-400 text-sm">
              Your {selectedLicense.label} license for <strong className="text-slate-200">{title}</strong> has been issued.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Asset Info */}
            <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white text-sm truncate">{title}</p>
                <p className="text-slate-400 text-xs truncate">{listing.creator_name ?? 'Creator'}</p>
                {listing.clearance_code && (
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono text-slate-400 truncate">{listing.clearance_code}</span>
                  </div>
                )}
              </div>
            </div>

            {/* License Type */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
                License Type
              </label>
              <div className="space-y-2">
                {LICENSE_TYPES.map((lt) => {
                  const Icon = lt.icon;
                  const price = basePrice === 0 ? 'Free' : `${PLATFORM_INFO.DEFAULT_CURRENCY}${(basePrice * lt.multiplier).toFixed(2)}`;
                  const active = licenseType === lt.value;
                  return (
                    <button
                      key={lt.value}
                      onClick={() => setLicenseType(lt.value)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        active
                          ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-300'}`}>{lt.label}</span>
                          <span className={`text-sm font-bold shrink-0 ${active ? 'text-blue-400' : 'text-slate-400'}`}>{price}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{lt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Territory & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Territory</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg pl-8 pr-7 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="worldwide">Worldwide</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">European Union</option>
                    <option value="us">United States</option>
                    <option value="africa">Africa</option>
                    <option value="asia">Asia Pacific</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">Duration</label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 pr-7 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="perpetual">Perpetual</option>
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="5years">5 Years</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {finalPrice > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Price Breakdown</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">License fee</span>
                  <span className="text-white font-medium">{PLATFORM_INFO.DEFAULT_CURRENCY}{finalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Creator receives (80%)</span>
                    <span className="text-emerald-400">{PLATFORM_INFO.DEFAULT_CURRENCY}{creatorPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Platform fee (20%)</span>
                    <span>{PLATFORM_INFO.DEFAULT_CURRENCY}{platformFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    agreed ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                  }`}
                >
                  {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to the license terms and confirm I will use this work according to the selected license type. I acknowledge the DCCS clearance code is the authoritative proof of ownership.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading || !agreed || !user}
                className="flex-2 flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : finalPrice === 0 ? (
                  'Get Free License'
                ) : (
                  `Purchase for ${PLATFORM_INFO.DEFAULT_CURRENCY}${finalPrice.toFixed(2)}`
                )}
              </button>
            </div>

            {!user && (
              <p className="text-center text-xs text-slate-500">
                You need to <a href="/login" className="text-blue-400 hover:underline">sign in</a> to purchase a license.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
