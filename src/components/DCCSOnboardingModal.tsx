import { useState, useEffect, useRef } from 'react';
import { Shield, Upload, Download, ArrowRight, X, CheckCircle, Fingerprint, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SystemLogger } from '../lib/monitoring/SystemLogger';

interface DCCSOnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Shield,
    iconColor: '#0ea5e9',
    title: 'What is DCCS?',
    subtitle: 'Digital Creative Copyright System',
    body: 'DCCS creates a permanent, tamper-proof ownership record for every digital file you upload — audio, video, images, documents, artwork, and more.',
    highlight: 'Your proof of creation. Locked forever.',
    detail: 'No lawyers. No paperwork. Upload once, protected always.',
  },
  {
    icon: Fingerprint,
    iconColor: '#10b981',
    title: 'What happens when you upload?',
    subtitle: 'Your file gets fingerprinted + coded',
    body: 'The moment you upload a file, DCCS automatically generates a unique Ownership Code tied to your creator identity.',
    highlight: 'Example: DCCS-VictorEdet-AUD-A91K-01',
    detail: 'This code is unique to you, immutable, and permanently bound to your file.',
  },
  {
    icon: Download,
    iconColor: '#f59e0b',
    title: 'What can you do?',
    subtitle: 'Own, prove, and protect your work',
    body: 'Your DCCS Ownership Code appears on every certificate and download. Use it to prove creation, resolve disputes, and license your work.',
    highlight: null,
    detail: null,
    bullets: [
      { icon: Upload,       text: 'Upload any digital asset (audio, video, images, PDFs, art)' },
      { icon: Shield,       text: 'Get an instant verified ownership certificate' },
      { icon: Lock,         text: 'Your code is permanent — it cannot be changed or duplicated' },
      { icon: CheckCircle,  text: 'Prove ownership instantly to anyone, anywhere' },
    ],
  },
];

export default function DCCSOnboardingModal({ userId, onComplete }: DCCSOnboardingModalProps) {
  const [step, setStep]         = useState(0);
  const [saving, setSaving]     = useState(false);
  const [visible, setVisible]   = useState(false);   // controls content fade
  const [exiting, setExiting]   = useState(false);   // triggers slide-out
  const contentRef              = useRef<HTMLDivElement>(null);

  // Fade in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const advanceStep = (next: number) => {
    setExiting(true);
    setTimeout(() => {
      setStep(next);
      setExiting(false);
    }, 220);
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      advanceStep(step + 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
      .catch(() => {});

    SystemLogger.info('onboarding_complete', 'User completed onboarding', userId);
    setSaving(false);
    onComplete();
  };

  const Icon = current.icon;

  // Overlay fade-in style
  const overlayStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 350ms ease',
    opacity: visible ? 1 : 0,
  };

  // Content transition style
  const contentStyle: React.CSSProperties = {
    transition: 'opacity 200ms ease, transform 220ms ease',
    opacity: exiting ? 0 : 1,
    transform: exiting ? 'translateY(8px)' : 'translateY(0)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle}>
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #0c1a2e 100%)',
          border: '1px solid rgba(14,165,233,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(16px)',
        }}
      >
        {/* Animated top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${current.iconColor}, transparent)`,
            transition: 'background 400ms ease',
          }}
        />

        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => i < step && advanceStep(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                aria-label={`Step ${i + 1}`}
                style={{
                  flex: i === step ? '2.5' : '1',
                  background: i < step
                    ? `${STEPS[i].iconColor}aa`
                    : i === step
                      ? current.iconColor
                      : 'rgba(255,255,255,0.1)',
                  cursor: i < step ? 'pointer' : 'default',
                }}
              />
            ))}
          </div>

          {/* Animated content region */}
          <div ref={contentRef} style={contentStyle}>
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background: `${current.iconColor}18`,
                border: `1px solid ${current.iconColor}30`,
                transition: 'background 300ms ease, border-color 300ms ease',
              }}
            >
              <Icon className="w-8 h-8" style={{ color: current.iconColor }} />
            </div>

            {/* Content */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: current.iconColor }}>
              Step {step + 1} of {STEPS.length} — {current.subtitle}
            </p>
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{current.title}</h2>
            <p className="text-white/70 leading-relaxed mb-5">{current.body}</p>

            {/* Highlight box */}
            {current.highlight && (
              <div
                className="rounded-xl px-5 py-4 mb-5"
                style={{ background: `${current.iconColor}10`, border: `1px solid ${current.iconColor}25` }}
              >
                <p className="font-mono font-semibold text-sm" style={{ color: current.iconColor }}>
                  {current.highlight}
                </p>
                {current.detail && (
                  <p className="text-white/50 text-xs mt-1">{current.detail}</p>
                )}
              </div>
            )}

            {/* Bullets (step 3) */}
            {current.bullets && (
              <ul className="space-y-3 mb-5">
                {current.bullets.map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${current.iconColor}15` }}
                      >
                        <BIcon className="w-4 h-4" style={{ color: current.iconColor }} />
                      </div>
                      <span className="text-white/70 text-sm leading-relaxed">{b.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2"
            style={{ background: `linear-gradient(135deg, ${current.iconColor}, ${current.iconColor}bb)`, transition: 'background 300ms ease' }}
          >
            <span>{isLast ? (saving ? 'Saving...' : 'Start using DCCS') : 'Next'}</span>
            {!saving && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Dot nav for step position */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  background: i === step ? current.iconColor : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>

          <p className="text-center text-white/15 text-xs mt-3">
            dccsverify.com — Digital Creative Copyright System
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook: returns true if the current user has not yet completed onboarding.
 * Uses the already-loaded onboarding_completed value from the User object —
 * no extra DB round-trip. Falls back to a DB check if the value is unknown.
 */
export function useOnboardingRequired(
  userId: string | null,
  onboardingCompleted: boolean | null = null,
): {
  showOnboarding: boolean;
  markComplete:   () => void;
} {
  // If we already know the value from the auth context, use it directly.
  const [showOnboarding, setShowOnboarding] = useState(
    () => userId !== null && onboardingCompleted === false,
  );

  useEffect(() => {
    // Already have a definitive answer from the User object — skip the DB call.
    if (onboardingCompleted !== null) {
      setShowOnboarding(userId !== null && onboardingCompleted === false);
      return;
    }

    // Fallback: profile was loaded before the column existed (legacy session).
    if (!userId) return;

    supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        // Treat NULL as "not completed" only for users who have explicitly never
        // seen onboarding. Treat anything truthy as completed.
        setShowOnboarding(data ? data.onboarding_completed !== true : false);
      })
      .catch(() => {});
  }, [userId, onboardingCompleted]);

  const markComplete = () => setShowOnboarding(false);

  return { showOnboarding, markComplete };
}
