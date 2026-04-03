import React, { useState, useEffect } from 'react';
import { Upload, Shield, Lock, CheckCircle } from 'lucide-react';

export const AnimatedSystemFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Upload,
      label: 'Upload',
      description: 'Your creative work',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      label: 'DCCS Code',
      description: 'Unique identifier generated',
      color: 'from-cyan-500 to-purple-500'
    },
    {
      icon: Lock,
      label: 'Ownership',
      description: 'Registered in global system',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: CheckCircle,
      label: 'Verification',
      description: 'Publicly verifiable forever',
      color: 'from-blue-500 to-green-500'
    }
  ];

  return (
    <div className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400">
            Four steps to permanent ownership verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <React.Fragment key={index}>
                <div
                  className={`relative transition-all duration-700 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div
                    className={`relative rounded-2xl p-8 border-2 transition-all duration-700 ${
                      isActive
                        ? 'bg-gradient-to-br ' + step.color + ' border-transparent shadow-2xl'
                        : isPast
                        ? 'bg-black/40 border-white/20'
                        : 'bg-black/20 border-white/10'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 animate-pulse" style={{
                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
                      }} />
                    )}

                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-700 ${
                          isActive
                            ? 'bg-white/20 scale-110'
                            : 'bg-white/10'
                        }`}
                      >
                        <Icon
                          className={`transition-all duration-700 ${
                            isActive ? 'w-8 h-8' : 'w-7 h-7'
                          } ${
                            isActive || isPast ? 'text-white' : 'text-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <h3
                          className={`text-xl font-bold mb-2 transition-all duration-700 ${
                            isActive || isPast ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </h3>
                        <p
                          className={`text-sm transition-all duration-700 ${
                            isActive || isPast ? 'text-white/80' : 'text-gray-600'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>

                      {isPast && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <span className="text-6xl font-bold text-white/5">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center absolute top-16 left-1/4 w-1/4" style={{ left: `${(index + 0.5) * 25}%` }}>
                    <div className="w-full h-0.5 bg-gradient-to-r from-white/10 to-white/10 relative overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ${
                          isPast ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeStep
                  ? 'w-12 bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'w-1.5 bg-white/20 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
