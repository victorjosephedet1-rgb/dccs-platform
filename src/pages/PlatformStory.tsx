import React, { useState, useEffect } from 'react';
import {
  Upload,
  Music,
  Sparkles,
  Users,
  Download,
  Shield,
  PlayCircle,
  CheckCircle,
  Heart,
  Share2,
  Zap,
  Globe,
  ChevronRight,
  ArrowRight,
  Star,
  Mic,
  Headphones,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
    title: 'Welcome & Onboarding',
    subtitle: 'Your Creative Journey Begins',
    description: 'The AI assistant warmly welcomes a diverse global family to the platform, explaining how easy it is to create, protect, and share music together.',
    icon: Heart,
    color: 'blue',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    features: [
      'Friendly AI guide with culturally inclusive design',
      'Multi-language support for global families',
      'Interactive tutorial with real-time help',
      'Personalized dashboard setup'
    ],
    characters: ['Grandmother from UK', 'Teenager from USA', 'Father from Brazil', 'Mother from Japan'],
    aiMessage: 'Welcome to Digital Creative Copyright System (DCCS)! I\'m here to help you create, protect, and verify ownership of your creative work. Let\'s start your journey!'
  },
  {
    id: 2,
    title: 'Music Upload & DCCS Protection',
    subtitle: 'Secure Your Creative Rights',
    description: 'Family members upload their original tracks. The AI instantly generates unique DCCS codes, creating a blockchain-verified certificate of ownership for each creation.',
    icon: Shield,
    color: 'purple',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    features: [
      'Drag-and-drop file upload',
      'Instant DCCS code generation',
      'Blockchain certification in seconds',
      'Audio fingerprinting & metadata extraction'
    ],
    characters: ['Teen uploads first beat', 'Dad uploads guitar recording', 'Mom uploads vocal track', 'Grandma uploads traditional song'],
    aiMessage: 'Perfect! Your music is now protected with DCCS blockchain certification. Your unique code: DCCS-2026-AFR-X7K9M. This proves you created it!'
  },
  {
    id: 3,
    title: 'AI Music Generation & Remixing',
    subtitle: 'Create Magic Together',
    description: 'The AI helps the family create new tracks and remix existing ones. Real-time collaboration with style suggestions, live previews, and creative recommendations.',
    icon: Sparkles,
    color: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    features: [
      'AI-powered music generation',
      'Interactive remix controls',
      'Style transfer & genre fusion',
      'Live preview with waveform visualization'
    ],
    characters: ['Teen blends genres together', 'Family creates collaborative track', 'Dad remixes grandma\'s traditional song', 'AI suggests harmonies'],
    aiMessage: 'Love that fusion! Try adding a rhythmic element to your electronic base. I can help blend your family\'s musical styles into something unique!'
  },
  {
    id: 4,
    title: 'Library & Collaboration',
    subtitle: 'Share & Grow Together',
    description: 'The family explores their growing music library, shares tracks with friends worldwide, and collaborates with other creators in real-time.',
    icon: Users,
    color: 'green',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    features: [
      'Organized music library with smart folders',
      'Real-time collaboration tools',
      'Share tracks privately or publicly',
      'AI feedback & creative suggestions'
    ],
    characters: ['Family reviews their 15 tracks', 'Sharing with relatives abroad', 'Collaborating with creators worldwide', 'AI organizes by mood & style'],
    aiMessage: 'Your library is growing beautifully! I\'ve organized your tracks by mood and style. Want to collaborate with other creators who match your vibe?'
  },
  {
    id: 5,
    title: 'Download & Ownership Celebration',
    subtitle: 'Your Music, Your Rights',
    description: 'The family downloads their finished masterpieces with full DCCS verification. The AI celebrates their creative achievement and explains their ownership rights.',
    icon: Download,
    color: 'indigo',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    features: [
      'High-quality downloads (WAV, FLAC, MP3)',
      'DCCS certificate included with every download',
      'Blockchain-verified ownership proof',
      'Re-download anytime with DCCS code'
    ],
    characters: ['Downloading family album', 'Sharing DCCS certificates', 'Verifying ownership codes', 'Celebrating together'],
    aiMessage: 'Congratulations! Your family album is complete and fully protected. You own 100% of your rights with blockchain-verified DCCS certificates. Share your verified ownership with the world!'
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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Interactive Platform Story</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              How V3B Music
              <span className={`block bg-gradient-to-r ${currentScene.gradient} bg-clip-text text-transparent`}>
                Empowers Families
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Follow a global family's journey as they create, protect, and share music together with the help of our intelligent AI assistant
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

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
          </div>

          {/* Scene Content */}
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              {/* Left: Illustration Placeholder */}
              <div className="space-y-6">
                <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${currentScene.gradient} p-1`}>
                  <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                    {/* Animated Scene Illustration */}
                    <div className="relative w-full h-full p-8">
                      {/* AI Assistant Character */}
                      <div className="absolute top-8 right-8 animate-bounce">
                        <div className={`p-4 bg-gradient-to-br ${currentScene.gradient} rounded-full border-4 border-white/20`}>
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      {/* Family Characters */}
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

                      {/* Platform UI Elements */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="h-32 w-32 text-white/10" />
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse" />
                          <Music className="relative h-12 w-12 text-white/40 animate-spin-slow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Characters List */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Meet the Family</h3>
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
                    What's Happening
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
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-400 mb-1">
                          V3B AI Assistant
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
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Platform Features in Action
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
                <ChevronRight className="h-5 w-5 rotate-180" />
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

      {/* Call to Action */}
      <div className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-1">
          <div className="bg-slate-900 rounded-3xl p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">Start Your Journey Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Your Family's Music Story?
            </h2>

            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of families worldwide creating, protecting, and sharing music together on V3B Music
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold transition-all shadow-xl shadow-blue-500/20"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                to="/demo"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold border border-white/20 transition-all"
              >
                <PlayCircle className="h-5 w-5" />
                <span>Try the Demo</span>
              </Link>

              <Link
                to="/marketplace"
                className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white font-semibold border border-white/10 transition-all"
              >
                <Globe className="h-5 w-5" />
                <span>Explore Music</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">195+</div>
                <div className="text-slate-400">Countries Served</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">80%</div>
                <div className="text-slate-400">Royalty to Creators</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">100%</div>
                <div className="text-slate-400">Rights Protection</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">DCCS Protection</h3>
            <p className="text-slate-300">
              Every upload gets blockchain-verified certification, proving ownership instantly and permanently.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Creation</h3>
            <p className="text-slate-300">
              Our intelligent AI assistant guides you through every step with personalized recommendations.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Global Family</h3>
            <p className="text-slate-300">
              Connect and collaborate with creators worldwide, sharing culture and creativity across borders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
