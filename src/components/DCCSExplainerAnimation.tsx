import { useState, useEffect } from 'react';
import { Shield, FileText, Lock, CheckCircle, FileAudio, FileVideo, FileImage, File, Sparkles, AlertTriangle } from 'lucide-react';

export default function DCCSExplainerAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const steps = [
    {
      title: "The Problem",
      description: "Digital creators lose billions annually to theft, disputes, and unverified ownership claims",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      textColor: "text-red-900"
    },
    {
      title: "Upload Your Creation",
      description: "Upload any digital asset - music, video, images, documents, or creative projects",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900"
    },
    {
      title: "Fingerprint Generation",
      description: "DCCS creates a unique cryptographic fingerprint of your asset that proves it's yours",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900"
    },
    {
      title: "Digital Clearance Code",
      description: "Your asset receives a permanent DCCS code - a universal ownership identifier",
      icon: Lock,
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-900"
    },
    {
      title: "Protected Forever",
      description: "Your work is now verifiable, protected, and can be proven as yours anywhere, anytime",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-900"
    }
  ];

  const assetTypes = [
    { icon: FileAudio, label: "Audio" },
    { icon: FileVideo, label: "Video" },
    { icon: FileImage, label: "Images" },
    { icon: File, label: "Documents" }
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Why DCCS Matters
        </h2>
        <p className="text-gray-600 text-lg">
          Protecting Digital Creators from Theft, Disputes & Lost Revenue
        </p>
      </div>

      {/* Main Animation Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div
            className={`h-full bg-gradient-to-r ${currentStep.color} transition-all duration-500`}
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Icon Animation */}
          <div className="flex justify-center mb-6">
            <div
              className={`relative transform transition-all duration-700 ${
                isPlaying ? 'scale-100 rotate-0' : 'scale-95'
              }`}
              key={step}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${currentStep.color} rounded-full blur-2xl opacity-30 animate-pulse`} />
              <div className={`relative bg-gradient-to-r ${currentStep.color} p-6 rounded-full`}>
                <StepIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div
            className="text-center transition-all duration-500 transform"
            key={`content-${step}`}
          >
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              {currentStep.title}
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {currentStep.description}
            </p>
          </div>

          {/* Asset Types (shown on upload step) */}
          {step === 1 && (
            <div className="mt-8 grid grid-cols-4 gap-4 max-w-xl mx-auto animate-fade-in">
              {assetTypes.map((asset, idx) => {
                const AssetIcon = asset.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <AssetIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm text-gray-700 font-medium">{asset.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* DCCS Code Example (shown on code step) */}
          {step === 3 && (
            <div className="mt-8 max-w-lg mx-auto animate-fade-in">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-sm text-amber-800 mb-2 font-medium">Example Clearance Code</p>
                  <div className="font-mono text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    DCCS-AUD-V360-82AF19-20260320
                  </div>
                  <p className="text-xs text-amber-700 mt-2">Unique • Permanent • Verifiable</p>
                </div>
              </div>
            </div>
          )}

          {/* Protection Stats (shown on final step) */}
          {step === 4 && (
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-in">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">100%</p>
                <p className="text-sm text-green-700">Protected</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">Forever</p>
                <p className="text-sm text-green-700">Verifiable</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">FREE</p>
                <p className="text-sm text-green-700">Phase 1</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStep(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === step
                      ? `bg-gradient-to-r ${currentStep.color} scale-125`
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <a
          href="/dccs-registration"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <Shield className="w-6 h-6" />
          Protect Your Work Now - It's FREE
        </a>
        <p className="text-sm text-gray-600 mt-3">
          Join thousands of creators securing their digital assets with DCCS
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
