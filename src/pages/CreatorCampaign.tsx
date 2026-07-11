import React from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  Upload,
  Bug,
  Lightbulb,
  Globe,
  Heart,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Mail,
  Shield,
  Users,
  Star,
  Rocket,
  MapPin,
  Languages,
  Clock,
  Zap,
  BarChart3,
  FileAudio,
  FileImage,
  FileVideo,
  FileText,
  AlertTriangle,
  Search,
  Lock,
  Link as LinkIcon,
  Github,
  Send
} from 'lucide-react';

export default function CreatorCampaign() {
  return (
    <div className="min-h-screen bg-slate-950">
      <SEOHead
        title="Join the DCCS Verify Creator Campaign — Test & Shape the Future"
        description="Calling all indie creators worldwide: upload your work, test DCCS Verify, and help us build the most honest copyright protection system. Every complaint drives innovation."
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-8">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Global Creator Callout</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Indie Creators
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your work. Test our system. Complain loudly. We build better.
            DCCS Verify is being shaped by real creators — not marketing hype.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all shadow-xl shadow-blue-500/25"
            >
              <Upload className="h-5 w-5" />
              <span>Start Testing Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              to="/story"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold border border-white/20 transition-all text-lg"
            >
              <Shield className="h-5 w-5" />
              <span>See How It Works</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Open Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Real Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Honest Pitch */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            We Are Not Selling Dreams.
            <span className="block text-blue-400">We Are Building a Real System.</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            DCCS Verify is a digital copyright registration platform built by Victor360 Brand Limited.
            We are not promising blockchain magic. We are not claiming AI will replace lawyers.
            We are building a system that lets you upload your work, get a unique code, and prove
            you created it — and we need your honest testing to make it work for everyone.
          </p>
        </div>

        {/* Two-Column: What Works / What Does Not */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">What Works Now</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Upload audio, images, video, documents',
                'Generate a unique DCCS code instantly',
                'Receive a downloadable ownership certificate',
                'Audio fingerprinting for verification matching',
                'Public verification portal — anyone can check your code',
                'Multi-language support (25+ languages)',
                'Free registration, no paywall',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">What We Are Still Building</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Double-entry financial ledger (schema defined, not live)',
                'Escrow-based licensing payments (in development)',
                'AI agent orchestration (backend schema ready, not executing)',
                'Creator-to-creator marketplace (roadmap stage)',
                'Instant royalty payouts (depends on ledger activation)',
                'Blockchain anchoring (certificate structure ready)',
                'Mobile app (future phase)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <Clock className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action Cards */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Three Ways to Help
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              We do not just want users. We want honest testers who will break things and tell us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Test & Upload */}
            <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Test Uploads</h3>
              <p className="text-slate-300 mb-4">
                Upload your actual work. Try different file types, sizes, and formats. Tell us if
                anything breaks, is slow, or confusing. We fix what you report.
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                <FileAudio className="h-4 w-4" />
                <FileImage className="h-4 w-4" />
                <FileVideo className="h-4 w-4" />
                <FileText className="h-4 w-4" />
                <span className="ml-2">All formats welcome</span>
              </div>
            </div>

            {/* Report Bugs */}
            <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Bug className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Report Bugs Loudly</h3>
              <p className="text-slate-300 mb-4">
                Did something fail? Was the certificate wrong? Did the upload break? We want every
                detail. Screenshot, error message, what you clicked. We read everything.
              </p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                <span>No bug too small</span>
              </div>
            </div>

            {/* Suggest Features */}
            <div className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Suggest Features</h3>
              <p className="text-slate-300 mb-4">
                What do you actually need? Watermarking? Batch uploads? API access? Team accounts?
                We build what real creators ask for, not what looks good on a pitch deck.
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                <Star className="h-4 w-4" />
                <span>Your needs shape our roadmap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats / Social Proof */}
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl p-1">
          <div className="bg-slate-900 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Who We Are Building For</h2>
              <p className="text-slate-300 max-w-2xl mx-auto">
                DCCS Verify is free for indie creators worldwide. No country restrictions. No gatekeeping.
                If you create digital work, you are welcome.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-fit mx-auto mb-4">
                  <FileAudio className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-semibold mb-1">Musicians</div>
                <div className="text-slate-400 text-sm">Tracks, beats, samples, stems</div>
              </div>
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-4">
                  <FileImage className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-semibold mb-1">Designers</div>
                <div className="text-slate-400 text-sm">Logos, illustrations, UI kits</div>
              </div>
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl w-fit mx-auto mb-4">
                  <FileVideo className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-semibold mb-1">Filmmakers</div>
                <div className="text-slate-400 text-sm">Footage, reels, animations</div>
              </div>
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl w-fit mx-auto mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-white font-semibold mb-1">Writers</div>
                <div className="text-slate-400 text-sm">Scripts, manuscripts, courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Channels */}
      <div className="bg-slate-950 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">How to Reach Us</h2>
              <p className="text-slate-300">
                Every message is read. Every bug is tracked. Every suggestion is logged.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-white font-semibold">Email</div>
                </div>
                <div className="text-slate-300 text-sm mb-2">support@dccsverify.com</div>
                <div className="text-slate-500 text-xs">
                  Best for: bug reports, detailed complaints, private feedback
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Github className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-white font-semibold">GitHub</div>
                </div>
                <div className="text-slate-300 text-sm mb-2">victorjosephedet1-rgb/dccsverify-platform1new</div>
                <div className="text-slate-500 text-xs">
                  Best for: technical issues, pull requests, feature requests
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Send className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-white font-semibold">Social</div>
                </div>
                <div className="text-slate-300 text-sm mb-2">@dccsverify</div>
                <div className="text-slate-500 text-xs">
                  Best for: public feedback, community discussion, sharing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1">
          <div className="bg-slate-900 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Work Deserves Proof.
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              We are not perfect. We are building. And we need real creators to tell us what is broken.
              Upload your work. Get your DCCS code. Help us improve.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold text-lg transition-all shadow-xl shadow-blue-500/25"
              >
                <Upload className="h-5 w-5" />
                <span>Register & Start Testing</span>
              </Link>
              <Link
                to="/story"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold border border-white/20 transition-all text-lg"
              >
                <Heart className="h-5 w-5" />
                <span>See the Platform Story</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-6 pb-12 text-center">
        <div className="text-slate-500 text-sm max-w-2xl mx-auto">
          <p className="mb-2">
            DCCS Verify is operated by Victor360 Brand Limited. Founded by Victor Joseph Edet.
          </p>
          <p>
            Built in the open. Shaped by creators. No false promises. No fake metrics.
            Just honest work toward real digital rights protection.
          </p>
        </div>
      </div>
    </div>
  );
}

/* SEO Head helper (inline for simplicity) */
function SEOHead({ title, description }: { title: string; description: string }) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
    </>
  );
}
