import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Globe,
  Zap,
  Award,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Heart,
  Users,
  Rocket,
  Upload,
  Scan,
  Shield,
  Coins,
  Music,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobRole {
  id: string;
  title: string;
  location: string;
  type: 'full-time' | 'internship' | 'graduate';
  remote: boolean;
  description: string;
  skills: string[];
  category: 'engineering' | 'business' | 'legal' | 'design';
  equity: boolean;
  duration?: string;
}

const roles: JobRole[] = [
  {
    id: 'lead-fullstack',
    title: 'Lead Full-Stack Engineer',
    location: 'UK / Global',
    type: 'full-time',
    remote: true,
    description: 'Architect and scale our AI-powered music licensing platform. Lead technical decisions and mentor a growing team.',
    skills: ['React', 'TypeScript', 'AI/ML'],
    category: 'engineering',
    equity: true
  },
  {
    id: 'blockchain-engineer',
    title: 'Blockchain/Web3 Engineer',
    location: 'UK / Global',
    type: 'full-time',
    remote: true,
    description: 'Build blockchain-backed royalty distribution and DCCS verification systems. Smart contracts meet music rights.',
    skills: ['Solidity', 'Web3', 'Ethereum'],
    category: 'engineering',
    equity: true
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    location: 'UK / Global',
    type: 'full-time',
    remote: true,
    description: 'Develop audio fingerprinting, content matching, and automated licensing recommendation systems.',
    skills: ['Python', 'TensorFlow', 'Audio ML'],
    category: 'engineering',
    equity: true
  },
  {
    id: 'devops-lead',
    title: 'DevOps & Infrastructure Lead',
    location: 'UK / Global',
    type: 'full-time',
    remote: true,
    description: 'Scale platform infrastructure to handle millions of audio transactions. Security-first, performance-obsessed.',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    category: 'engineering',
    equity: true
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    location: 'UK / Global',
    type: 'full-time',
    remote: true,
    description: 'Own the product roadmap for creator tools. Balance artist needs with technical possibilities.',
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    category: 'business',
    equity: true
  },
  {
    id: 'ip-counsel',
    title: 'IP & Music Rights Counsel',
    location: 'London, UK',
    type: 'full-time',
    remote: false,
    description: 'Protect creator rights and navigate complex music licensing. Handle copyright disputes and royalty claims.',
    skills: ['Copyright Law', 'Contract Law', 'Royalty Claims'],
    category: 'legal',
    equity: true
  },
  {
    id: 'growth-partnerships',
    title: 'Growth & Partnerships Lead',
    location: 'London, UK',
    type: 'full-time',
    remote: false,
    description: 'Drive artist acquisition and build strategic partnerships with labels, distributors, and platforms.',
    skills: ['Business Development', 'Partnerships', 'Music Industry'],
    category: 'business',
    equity: true
  },
  {
    id: 'software-intern',
    title: 'Software Engineering Intern',
    location: 'Remote / UK',
    type: 'internship',
    remote: true,
    description: 'Hands-on experience building real features. Work alongside senior engineers on React, APIs, and databases.',
    skills: ['React', 'JavaScript', 'Learning'],
    category: 'engineering',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'ai-intern',
    title: 'AI & Data Science Intern',
    location: 'Remote / UK',
    type: 'internship',
    remote: true,
    description: 'Help build ML models for audio analysis and content matching. Great for AI-passionate students.',
    skills: ['Python', 'Machine Learning', 'Research'],
    category: 'engineering',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'legal-intern',
    title: 'Legal & Rights Intern',
    location: 'London, UK',
    type: 'internship',
    remote: false,
    description: 'Gain real-world IP and entertainment law experience. Assist with contract reviews and rights research.',
    skills: ['IP Law', 'Entertainment', 'Research'],
    category: 'legal',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'marketing-intern',
    title: 'Marketing & Content Intern',
    location: 'Remote / UK',
    type: 'internship',
    remote: true,
    description: 'Create compelling content for artists. Social media, copywriting, and campaign support.',
    skills: ['Content', 'Social Media', 'Copywriting'],
    category: 'business',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'bd-intern',
    title: 'Business Development Intern',
    location: 'London / Remote',
    type: 'internship',
    remote: true,
    description: 'Support partnership outreach, market research, and artist acquisition. Learn startup business operations.',
    skills: ['Business', 'Research', 'Partnerships'],
    category: 'business',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'design-intern',
    title: 'UX/UI Design Intern',
    location: 'Remote / UK',
    type: 'internship',
    remote: true,
    description: 'Design beautiful, intuitive interfaces for creators. Work on real product features with user feedback.',
    skills: ['Figma', 'UI/UX', 'Product Design'],
    category: 'design',
    equity: false,
    duration: '3-6 months'
  },
  {
    id: 'grad-tech',
    title: 'Graduate Programme - Tech',
    location: 'Remote / UK',
    type: 'graduate',
    remote: true,
    description: 'Rotational programme across Engineering, DevOps, and AI teams. Fast-track your music-tech career.',
    skills: ['Full-Stack', 'Rotation', 'Mentorship'],
    category: 'engineering',
    equity: true,
    duration: '12 months'
  },
  {
    id: 'grad-business',
    title: 'Graduate Programme - Business',
    location: 'London / Remote',
    type: 'graduate',
    remote: true,
    description: 'Rotational programme across Product, Partnerships, and Operations. Build your music industry career.',
    skills: ['Product', 'Partnerships', 'Operations'],
    category: 'business',
    equity: true,
    duration: '12 months'
  }
];

export default function Careers() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredRoles = roles.filter(role => {
    const matchesType = typeFilter === 'all' || role.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || role.category === categoryFilter;
    return matchesType && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'from-blue-500 to-cyan-500';
      case 'internship': return 'from-green-500 to-teal-500';
      case 'graduate': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Full-time';
      case 'internship': return 'Internship';
      case 'graduate': return 'Graduate';
      default: return type;
    }
  };

  const stats = [
    { value: '15', label: 'Open Roles', icon: Briefcase },
    { value: '195+', label: 'Countries', icon: Globe },
    { value: '80%', label: 'Creator Revenue', icon: TrendingUp },
    { value: '100%', label: 'Remote OK', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
              <Rocket className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">UK Innovation-Backed</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-transparent bg-clip-text">
                Build What's Next
              </span>
            </h1>

            <p className="text-2xl text-slate-300 mb-8">
              15 roles. One mission. Transform music.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="h-5 w-5 text-blue-400" />
                <span>Work from anywhere</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="h-5 w-5 text-green-400" />
                <span>Own equity</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span>Shape the industry</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="h-5 w-5 text-cyan-400" />
                <span>Grow fast</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-400" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Process Animation Section */}
      <div className="relative py-24 overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">How V3BMusic.AI Works</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-transparent bg-clip-text">
                Powered by AI. Built for Creators.
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Our African-inspired AI assistant works alongside a global family of creators, protecting rights and ensuring fair payments worldwide.
            </p>
          </div>

          {/* Process Steps with Animation */}
          <div className="grid md:grid-cols-5 gap-6 mb-12">
            {[
              {
                icon: Upload,
                title: 'Upload',
                desc: 'Creators upload music globally',
                color: 'blue',
                delay: 0
              },
              {
                icon: Scan,
                title: 'AI Scan',
                desc: 'African AI analyzes & fingerprints',
                color: 'cyan',
                delay: 1
              },
              {
                icon: Shield,
                title: 'DCCS Protection',
                desc: 'Blockchain certificates issued',
                color: 'purple',
                delay: 2
              },
              {
                icon: Music,
                title: 'Global Distribution',
                desc: 'Content reaches 195+ countries',
                color: 'pink',
                delay: 3
              },
              {
                icon: Coins,
                title: 'Instant Royalties',
                desc: '80% paid to creators instantly',
                color: 'green',
                delay: 4
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const colorMap: Record<string, string> = {
                blue: 'from-blue-500 to-cyan-500',
                cyan: 'from-cyan-500 to-blue-500',
                purple: 'from-purple-500 to-pink-500',
                pink: 'from-pink-500 to-purple-500',
                green: 'from-green-500 to-teal-500'
              };

              return (
                <div
                  key={idx}
                  className={`relative bg-white/5 border rounded-2xl p-6 transition-all duration-500 ${
                    isActive
                      ? 'border-white/30 shadow-2xl shadow-blue-500/20 scale-105'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[step.color]} opacity-0 rounded-2xl transition-opacity duration-500 ${
                    isActive ? 'opacity-10' : ''
                  }`} />

                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${colorMap[step.color]} rounded-2xl flex items-center justify-center transform transition-all duration-500 ${
                      isActive ? 'scale-110 rotate-3' : ''
                    }`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {isActive && (
                      <div className="absolute -top-2 -right-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-400 rounded-full blur-md animate-pulse" />
                          <CheckCircle className="relative h-6 w-6 text-green-400" />
                        </div>
                      </div>
                    )}

                    <h3 className={`text-lg font-bold mb-2 text-center transition-colors ${
                      isActive ? 'text-white' : 'text-slate-300'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm text-center transition-colors ${
                      isActive ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                      {step.desc}
                    </p>
                  </div>

                  {idx < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className={`h-6 w-6 transition-all duration-500 ${
                        isActive ? 'text-blue-400 scale-125' : 'text-slate-600'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Robot & Global Family Illustration */}
          <div className="relative bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/10 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.1),transparent_60%)]" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              {/* Left: AI Robot Representation */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">V3B AI Assistant</h3>
                    <p className="text-blue-300">African Innovation • Global Impact</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white/5 border border-blue-500/20 rounded-xl">
                    <Scan className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Audio Fingerprinting</h4>
                      <p className="text-sm text-slate-300">AI scans every upload, creating unique digital signatures for copyright protection</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 border border-purple-500/20 rounded-xl">
                    <Shield className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">DCCS Verification</h4>
                      <p className="text-sm text-slate-300">Blockchain-backed certificates ensure authenticity and ownership proof</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white/5 border border-green-500/20 rounded-xl">
                    <Coins className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-1">Instant Royalty Distribution</h4>
                      <p className="text-sm text-slate-300">80% revenue flows directly to creators globally within seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Global Family Network */}
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <Globe className="relative h-24 w-24 text-cyan-400 mx-auto mb-4" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Global Creator Family</h3>
                  <p className="text-cyan-300">United by Technology • Empowered by AI</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                    <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">195+</div>
                    <div className="text-sm text-slate-300">Countries Served</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                    <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1M+</div>
                    <div className="text-sm text-slate-300">Tracks Protected</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                    <Coins className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">80%</div>
                    <div className="text-sm text-slate-300">Creator Revenue</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                    <Zap className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">Instant</div>
                    <div className="text-sm text-slate-300">Payouts</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 rounded-xl p-6 text-center">
                  <p className="text-white font-medium mb-2">Join the Movement</p>
                  <p className="text-sm text-slate-300">
                    African innovation meeting global creativity. AI-powered protection for every artist, everywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3, 4].map(idx => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStep === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-5 w-5 text-slate-400" />
            <h2 className="text-xl font-semibold">Filter Roles</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <label className="text-sm text-slate-400 mb-3 block">Role Type</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'full-time', 'internship', 'graduate'].map(type => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      typeFilter === type
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {type === 'all' ? 'All Roles' : getTypeLabel(type)}
                    {type !== 'all' && (
                      <span className="ml-2 text-xs opacity-70">
                        ({roles.filter(r => r.type === type).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm text-slate-400 mb-3 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'engineering', 'business', 'legal', 'design'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      categoryFilter === cat
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                    {cat !== 'all' && (
                      <span className="ml-2 text-xs opacity-70">
                        ({roles.filter(r => r.category === cat).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Showing {filteredRoles.length} of {roles.length} roles
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map(role => (
            <div
              key={role.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
              onClick={() => setSelectedRole(role)}
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 bg-gradient-to-r ${getTypeColor(role.type)} rounded-full text-xs font-semibold text-white`}>
                  {getTypeLabel(role.type)}
                  {role.duration && ` • ${role.duration}`}
                </span>
                {role.equity && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <Award className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Equity</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                {role.title}
              </h3>

              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {role.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <MapPin className="h-4 w-4" />
                <span>{role.location}</span>
                <span className="text-slate-600">•</span>
                <span>{role.remote ? 'Remote' : 'Hybrid'}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {role.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-sm text-slate-400">View Details</span>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No roles found</h3>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Role Detail Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-start justify-between">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 bg-gradient-to-r ${getTypeColor(selectedRole.type)} rounded-full text-xs font-semibold text-white mb-3`}>
                  {getTypeLabel(selectedRole.type)}
                  {selectedRole.duration && ` • ${selectedRole.duration}`}
                </span>
                <h2 className="text-3xl font-bold mb-2">{selectedRole.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedRole.location}</span>
                  </div>
                  <span>•</span>
                  <span>{selectedRole.remote ? 'Remote-First' : 'Hybrid'}</span>
                  {selectedRole.equity && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-green-400">
                        <Award className="h-4 w-4" />
                        <span>Equity Included</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">About the Role</h3>
                <p className="text-slate-300 leading-relaxed">{selectedRole.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">What We Offer</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Remote-First Culture</div>
                      <div className="text-sm text-slate-400">Work from anywhere in the world</div>
                    </div>
                  </div>
                  {selectedRole.equity && (
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <Award className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium mb-1">Equity Ownership</div>
                        <div className="text-sm text-slate-400">Share in the company's success</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Fast Growth</div>
                      <div className="text-sm text-slate-400">Rapid career advancement in a scaling startup</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Users className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium mb-1">Impact-Driven</div>
                      <div className="text-sm text-slate-400">Transform how creators earn from their work</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/10">
                <a
                  href={`mailto:careers@dccsverify.com?subject=Application for ${selectedRole.title}`}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold text-center transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-12 text-center">
          <Heart className="h-12 w-12 text-red-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">
            Don't see your perfect role?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            We're always looking for exceptional talent. Send us your CV and tell us how you can help transform the music industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="mailto:info@victor360brand.com?subject=Career Application"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/50"
            >
              Send Us Your CV
              <ExternalLink className="h-5 w-5" />
            </a>
            <a
              href="mailto:partnership@victor360brand.com?subject=Partnership Inquiry"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-purple-500/50"
            >
              Partnership Inquiries
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          <div className="space-y-2 text-slate-400">
            <p className="text-sm">
              <a href="tel:+12023866699" className="hover:text-white transition-colors">+1 (202) 386-6699</a>
              {' '} • {' '}
              <a href="tel:+447438929365" className="hover:text-white transition-colors">+44 7438 929365</a>
            </p>
            <p className="text-sm">United Kingdom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
