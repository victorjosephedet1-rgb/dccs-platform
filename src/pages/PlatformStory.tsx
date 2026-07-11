import React, { useState, useEffect } from 'react';
import {
  Upload,
  Shield,
  Users,
  Download,
  PlayCircle,
  CheckCircle,
  Heart,
  ArrowRight,
  Star,
  Megaphone,
  Bug,
  Lightbulb,
  Globe,
  MessageSquare,
  Mail,
  Link
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface StoryScene {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: string[];
  characters: string[];
  aiMessage: string;
}

const scenes: StoryScene[] = [
  {
    id: 1,
    title: 'Upload & Register',
    subtitle: 'Secure Your Creative Work',
    description: 'You upload an audio file, image, video, or document. The system generates a unique DCCS code and creates an ownership certificate. The file is fingerprinted for future verification.',
    icon: Upload,
    color: 'blue',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    features: [
      'Drag-and-drop upload for audio, images, video, documents',
      'Instant DCCS code generation',
      'Audio fingerprinting for verification matching',
      'Ownership certificate with timestamp and creator details'
    ],
    characters: ['Musician uploads a track', 'Designer uploads artwork', 'Filmmaker uploads footage', 'Writer uploads manuscript'],
    aiMessage: 'Welcome! Your upload is being processed. I will generate a unique DCCS code and fingerprint for your work. This is the first step in establishing verified ownership.'
  },
  {
    id: 2,
    title: 'Verification & Protection',
    subtitle: 'Prove You Created It',
    description: 'Your DCCS certificate is stored in the database with a public verification link. Anyone can enter your DCCS code to verify ownership, date, and creator details.',
    icon: Shield,
    color: 'purple',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    features: [
      'Public verification portal at /verify',
      'DCCS code lookup shows ownership, date, file hash',
      'Blockchain-ready certificate structure',
      'Immutable audit trail of all verifications'
    ],
    characters: ['Creator shares DCCS code', 'Buyer verifies ownership', 'Platform checks clearance', 'Lawyer reviews audit log'],
    aiMessage: 'Your DCCS certificate is ready. Share your code: DCCS-2026-AFR-X7K9M. Anyone can verify it publicly. The certificate includes your name, timestamp, and file fingerprint.'
  },
  {
    id: 3,
    title: 'Creator Community',
    subtitle: 'Build, Test, and Improve Together',
    description: 'Creators worldwide upload their work, test the verification system, and report issues. Every complaint drives a bug fix or feature improvement. The platform evolves through real creator feedback.',
    icon: Users,
    color: 'green',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    features: [
      'Creator dashboard with upload history',
      'Community feedback loop via reports and complaints',
      'Issue tracking drives development priority',
      'Beta tester recognition for early adopters'
    ],
    characters: ['Musician tests audio fingerprint', 'Designer reports UI bug', 'Developer fixes issue in hours', 'Community votes on next feature'],
    aiMessage: 'We are building this together. Your feedback matters. Report a bug, suggest a feature, or tell us what is missing. We read every message and ship improvements fast.'
  },
  {
    id: 4,
    title: 'Download & Certificate',
    subtitle: 'Your Proof, Your Rights',
    description: 'You download your certificate with the DCCS code embedded. The certificate serves as evidence of ownership and creation date. Use it in licensing deals, disputes, or portfolio submissions.',
    icon: Download,
    color: 'indigo',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    features: [
      'Downloadable PDF certificate with DCCS code',
      'Blockchain-ready metadata structure',
      'Re-verify anytime using your DCCS code',
      'Certificate includes file hash for integrity proof'
    ],
    characters: ['Downloading certificate', 'Sharing proof with client', 'Using in licensing deal', 'Verifying on public portal'],
    aiMessage: 'Your certificate is ready for download. It includes your DCCS code, creation timestamp, file fingerprint, and creator details. This is your proof of ownership. Use it anywhere.'
  }
];

export default function PlatformStory() {
  const [activeScene, setActiveScene] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveScene(prev => (prev + 1) % scenes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentScene = scenes[activeScene];
  const Icon = currentScene.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Campaign Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3 text-white">
            <Megaphone className="h-5 w-5" />
            <span className="font-semibold">Global Creator Callout:</span>
            <span className="text-white/90">
              We need indie creators worldwide to test DCCS Verify and tell us what breaks.
            </span>
            <RouterLink
              to="/campaign"
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
            >
              Join the Campaign
            </RouterLink>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">How DCCS Verify Works</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              DCCS Verify
              <span className={`block bg-gradient-to-r ${currentScene.gradient} bg-clip-text text-transparent`}>
                In Action
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              See what DCCS Verify actually does today — upload, verify, and protect your creative work.
              No hype. No fiction. Just what works.
            </p>
          </div>

          {/* Scene Navigator */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {scenes.map((scene, idx) => {
              const SceneIcon = scene.icon;
              const isActive = activeScene === idx;

              return (
                <button
                  key={scene.id}
                  onClick={() => {
                    setActiveScene(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`group relative px-6 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 border-2 border-white/30 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${scene.gradient} ${
                      isActive ? 'opacity-100' : 'opacity-60'
                    }`}>
                      <SceneIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}>
                        Scene {scene.id}
                      </div>
                      <div className="text-xs text-slate-400 hidden md:block">
                        {scene.title}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Auto-play Toggle */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isAutoPlaying
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm">
                {isAutoPlaying ? 'Auto-playing' : 'Paused'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Story Scene */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          {/* Scene Header */}
          <div className={`relative p-8 bg-gradient-to-r ${currentScene.gradient}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">
                    Scene {currentScene.id} of {scenes.length}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    {currentScene.title}
                  </h2>
                  <p className="text-xl text-white/90 mt-2">
                    {currentScene.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
          </div>

          {/* Scene Content */}
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              {/* Left: Illustration */}
              <div className="space-y-6">
                <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${currentScene.gradient} p-1`}>
                  <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full p-8">
                      <div className="absolute top-8 right-8 animate-bounce">
                        <div className={`p-4 bg-gradient-to-br ${currentScene.gradient} rounded-full border-4 border-white/20`}>
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="grid grid-cols-4 gap-4">
                          {currentScene.characters.map((character, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center animate-fade-in"
                              style={{ animationDelay: `${idx * 200}ms` }}
                            >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center mb-2">
                                <Users className="h-6 w-6 text-white/60" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-32 w-32 text-white/10" />
                      </div>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse" />
                          <Shield className="relative h-12 w-12 text-white/40 animate-spin-slow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Characters List */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Creator Examples</h3>
                  </div>
                  <div className="space-y-2">
                    {currentScene.characters.map((character, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>{character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Scene Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    What Happens
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {currentScene.description}
                  </p>
                </div>

                {/* AI Assistant Message */}
                <div className={`relative bg-gradient-to-r ${currentScene.gradient} p-1 rounded-2xl`}>
                  <div className="bg-slate-800 rounded-2xl p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 bg-gradient-to-br ${currentScene.gradient} rounded-lg`}>
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-1">
                          DCCS Assistant
                        </div>
                        <div className="text-white font-medium">
                          {currentScene.aiMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Features Working Today
                  </h3>
                  <div className="space-y-3">
                    {currentScene.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group"
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${currentScene.gradient} group-hover:scale-110 transition-transform`}>
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-slate-300 flex-1">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <button
                onClick={() => setActiveScene(prev => (prev - 1 + scenes.length) % scenes.length)}
                disabled={activeScene === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
                <span>Previous Scene</span>
              </button>

              <div className="flex items-center gap-2">
                {scenes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScene(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeScene === idx
                        ? 'w-8 bg-blue-500'
                        : 'w-2 bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (activeScene === scenes.length - 1) {
                    setActiveScene(0);
                  } else {
                    setActiveScene(prev => prev + 1);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${currentScene.gradient} hover:opacity-90 rounded-xl text-white font-medium transition-all`}
              >
                <span>{activeScene === scenes.length - 1 ? 'Start Over' : 'Next Scene'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Callout Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1">
          <div className="bg-slate-900 rounded-3xl p-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                <Megaphone className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">Global Creator Callout</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Indie Creators Worldwide:
                <span className="block text-blue-400">Test DCCS Verify</span>
              </h2>

              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                We are building DCCS Verify in the open. We need musicians, designers, filmmakers, writers,
                and digital creators from every country to upload their work, test the system, and tell us
                what breaks. Every complaint drives innovation. Every bug report makes the platform stronger.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-fit mx-auto mb-4">
                  <Bug className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Report Bugs</h3>
                <p className="text-slate-300">
                  Upload fails? Verification wrong? Certificate broken? Tell us immediately. We fix issues fast.
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Suggest Features</h3>
                <p className="text-slate-300">
                  What do you need that we do not have? Licensing workflows? Better fingerprints? More file types?
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl w-fit mx-auto mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Spread the Word</h3>
                <p className="text-slate-300">
                  Share DCCS Verify with your creator network. More testers = more feedback = better platform.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <RouterLink
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all shadow-xl shadow-blue-500/20"
              >
                <Upload className="h-5 w-5" />
                <span>Upload & Test Now</span>
              </RouterLink>

              <RouterLink
                to="/campaign"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold border border-white/20 transition-all"
              >
                <Megaphone className="h-5 w-5" />
                <span>Read the Full Campaign</span>
              </RouterLink>
            </div>

            {/* Feedback Channels */}
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                How to Send Feedback
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-medium">Email</div>
                    <div className="text-slate-400 text-sm">support@dccsverify.com</div>
                    <div className="text-slate-500 text-xs">For bugs, complaints, and suggestions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Link className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-medium">GitHub</div>
                    <div className="text-slate-400 text-sm">github.com/victorjosephedet1-rgb/dccsverify-platform1new</div>
                    <div className="text-slate-500 text-xs">Open issues, pull requests, feature requests</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-medium">Social</div>
                    <div className="text-slate-400 text-sm">@dccsverify on social platforms</div>
                    <div className="text-slate-500 text-xs">Public feedback and community discussion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Footer Info */}
      <div className="container mx-auto px-6 pb-20">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <h3 className="text-xl font-bold text-white mb-4">What We Actually Do Today</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="font-semibold text-green-400 mb-2">Working Now</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Upload and register creative assets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Generate DCCS codes and certificates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Audio fingerprinting for verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Public verification portal
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-yellow-400 mb-2">In Development</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-400" />
                  Double-entry ledger system
                </li>
                <li className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-400" />
                  Escrow-based licensing
                </li>
                <li className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-400" />
                  AI agent orchestration
                </li>
                <li className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-400" />
                  Marketplace and royalties
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-blue-400 mb-2">We Need Your Help</div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Test uploads with your file types
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Report verification failures
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Tell us what features you need
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  Share with your creator network
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
