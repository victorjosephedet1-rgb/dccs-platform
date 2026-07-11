import { useState } from 'react';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SystemLogger } from '../lib/monitoring/SystemLogger';

const CREATOR_TYPES = [
  { value: 'musician',   label: 'Musician / Producer' },
  { value: 'artist',     label: 'Visual Artist'        },
  { value: 'filmmaker',  label: 'Filmmaker'            },
  { value: 'writer',     label: 'Writer / Author'      },
  { value: 'developer',  label: 'Developer'            },
  { value: 'nft',        label: 'NFT Creator'          },
  { value: 'other',      label: 'Other Creator'        },
];

interface EarlyAccessCaptureProps {
  source?:  string;
  heading?: string;
  subhead?: string;
  compact?: boolean;
}

export default function EarlyAccessCapture({
  source  = 'landing_hero',
  heading = 'Join the Phase 2 waitlist',
  subhead = 'Get notified when advanced features launch. Free forever.',
  compact = false,
}: EarlyAccessCaptureProps) {
  const [email,       setEmail]       = useState('');
  const [name,        setName]        = useState('');
  const [creatorType, setCreatorType] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { error: dbError } = await supabase.from('early_access_signups').insert({
        email:        email.trim().toLowerCase(),
        name:         name.trim(),
        creator_type: creatorType,
        source,
      });

      if (dbError) {
        // Duplicate email — treat as success (already signed up)
        if (dbError.code === '23505') {
          setDone(true);
          return;
        }
        throw dbError;
      }

      SystemLogger.info('early_access_signup', 'Early access signup', undefined, { source, creator_type: creatorType });
      setDone(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
        <p className="text-white font-bold text-lg mb-1">You're on the list.</p>
        <p className="text-white/50 text-sm">We'll notify you at <span className="text-white/80">{email}</span> when Phase 2 launches.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors bg-transparent"
          style={{ border: '1px solid rgba(255,255,255,0.12)' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 flex-shrink-0"
          style={{ background: '#FF5A1F' }}
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Notify me</span><ArrowRight className="w-3.5 h-3.5" /></>}
        </button>
      </form>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Phase 2 Coming Soon</p>
      </div>
      <h3 className="text-white font-bold text-xl mb-1">{heading}</h3>
      <p className="text-white/45 text-sm mb-6">{subhead}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors bg-transparent"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors bg-transparent"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <select
          value={creatorType}
          onChange={(e) => setCreatorType(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: creatorType ? '#fff' : 'rgba(255,255,255,0.3)' }}
        >
          <option value="">I am a... (optional)</option>
          {CREATOR_TYPES.map(({ value, label }) => (
            <option key={value} value={value} style={{ background: '#0f172a', color: '#fff' }}>{label}</option>
          ))}
        </select>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background: '#FF5A1F' }}
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><span>Join the waitlist</span><ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </form>

      <p className="text-white/20 text-xs mt-4 text-center">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
