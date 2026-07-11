import { useEffect } from 'react';
import { Globe, Upload, Heart, MessageCircle, Users, CheckCircle, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function Campaign() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="DCCS Verify® - Beta Test Callout | Join Indie Creators Worldwide"
        description="DCCS Verify® is open for beta testing by indie creators. Upload your work, receive a DCCS verification code, and help us improve the system. Free. Feedback-driven."
        keywords="DCCS, beta test, indie creators, copyright verification, open testing, feedback, Victor360 Brand"
      />

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-blue-400" />
              <span className="text-blue-400 font-semibold tracking-wider text-sm uppercase">
                Open Beta — Worldwide
              </span>
            </div>
            <h1
              className="font-black leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              We are building this for you.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Help us get it right.
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
              DCCS Verify® is in beta. We are calling on indie creators, musicians, designers, writers, and artists from every country to test the platform, upload real work, and tell us what breaks, what confuses, and what could be better.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                Start Uploading
              </a>
              <a
                href="/story"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
                See How It Works
              </a>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <section className="max-w-5xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
            What we are testing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <Upload className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload & Verification</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload your audio, image, video, or design files. The system generates a DCCS code and stores a fingerprint. Tell us if the code is useful, if the fingerprinting feels accurate, or if the upload breaks.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <MessageCircle className="w-10 h-10 text-teal-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Feedback & Reporting</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every upload is a test. Every error is a signal. Use the report button in your dashboard to flag issues, or send feedback to our support channel. We read every message.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Creator-to-Creator</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                License your work to other creators through the platform. The system handles Stripe payment, records the transaction in a ledger, and tracks the 80/20 split. Test it and tell us if it works for your workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Honesty banner */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 md:p-8">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  What we are, and what we are not
                </h3>
                <div className="space-y-2 text-amber-800 text-sm">
                  <p>
                    <strong className="text-amber-900">We are:</strong> A copyright verification platform that stores fingerprints, timestamps, and DCCS codes. A tool that helps creators prove they uploaded a file at a specific time.
                  </p>
                  <p>
                    <strong className="text-amber-900">We are not:</strong> A legal authority. A substitute for copyright registration with your government. A bank. A financial institution. A law firm.
                  </p>
                  <p>
                    <strong className="text-amber-900">We use:</strong> Supabase for storage, Stripe for payments, and blockchain for timestamp anchoring. We are not blockchain-native. We are creator-first.
                  </p>
                  <p>
                    <strong className="text-amber-900">We need:</strong> Real uploads from real creators. If the system breaks, we want to know. If it works, we want to know that too.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who we want */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Who we are looking for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Musicians & producers',
              'Graphic designers',
              'Video creators',
              'Writers & authors',
              'Photographers',
              'AI-assisted artists',
              'Sound engineers',
              'Podcasters',
              'NFT creators',
              'Freelancers',
              'Indie game developers',
              'Street artists',
            ].map((role) => (
              <div key={role} className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-slate-700 font-medium text-sm">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How to get started */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            How to get started
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-slate-900">Create a free account</h3>
                <p className="text-slate-600 text-sm mt-1">No credit card. No subscription. Just email and password.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-slate-900">Upload your first creation</h3>
                <p className="text-slate-600 text-sm mt-1">Any file type. We fingerprint it and issue a DCCS code. This is free and unlimited.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-slate-900">Test the features</h3>
                <p className="text-slate-600 text-sm mt-1">Verify your code. Try licensing. Download the certificate. Check if everything behaves the way you expect.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-bold text-slate-900">Tell us what happened</h3>
                <p className="text-slate-600 text-sm mt-1">Use the feedback button, email support, or report issues directly. We fix bugs fast. We listen to every creator.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Innovation commitment */}
        <section className="max-w-5xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 md:p-10 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Constant Innovation</h2>
            </div>
            <p className="text-slate-700 leading-relaxed mb-6">
              DCCS Verify is not a finished product. It is a live system that improves every day. When you report a bug, we fix it. When you suggest a feature, we consider it. When you complain about friction, we remove it. The platform is built by creators and for creators. Your feedback is the engine.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                'Open to all creators',
                'Free uploads',
                'Free verification',
                'Feedback-driven',
                'Bug-fix priority',
                'Feature requests welcomed',
              ].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-700 border border-blue-200">
                  <CheckCircle className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto text-center py-16 px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to test?
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Upload your work. Break the system. Tell us what broke. We will fix it. Together we build a platform that actually protects creative people.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Your Work
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              Create Free Account
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-6">
            Built by Victor360 Brand Limited. Free for creators. Always.
          </p>
        </section>
      </div>
    </>
  );
}
