import React from 'react';
import { Upload, Cpu, Shield, CheckCircle } from 'lucide-react';

interface FlowStep {
  icon: React.ReactNode;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

interface SystemFlowVisualizerProps {
  currentStep?: number;
  compact?: boolean;
}

export const SystemFlowVisualizer: React.FC<SystemFlowVisualizerProps> = ({
  currentStep = 0,
  compact = false
}) => {
  const steps: FlowStep[] = [
    {
      icon: <Upload className="w-5 h-5" />,
      label: 'Upload',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending'
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      label: 'Processing',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'DCCS Code',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Verified',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                step.status === 'completed'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : step.status === 'active'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800/50 text-gray-600 border border-gray-700/30'
              }`}
            >
              <span className={step.status === 'active' ? 'animate-pulse' : ''}>
                {step.icon}
              </span>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-700" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-3 flex-1">
              <div
                className={`relative w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-500/10 border-green-500 text-green-400'
                    : step.status === 'active'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-600'
                }`}
              >
                {step.status === 'active' && (
                  <div className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-pulse" />
                )}
                <span className="relative z-10">{step.icon}</span>
              </div>
              <span
                className={`text-sm font-semibold transition-all ${
                  step.status === 'completed'
                    ? 'text-green-400'
                    : step.status === 'active'
                    ? 'text-cyan-400'
                    : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-gray-700 via-gray-700 to-gray-700 relative">
                {currentStep > index && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
                    style={{
                      width: currentStep > index + 1 ? '100%' : '50%'
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const ProgressIndicator: React.FC<{
  steps: string[];
  currentStep: number;
  variant?: 'minimal' | 'detailed';
}> = ({ steps, currentStep, variant = 'minimal' }) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                index < currentStep
                  ? 'bg-green-500 w-12'
                  : index === currentStep
                  ? 'bg-cyan-500 w-16 animate-pulse'
                  : 'bg-gray-700 w-12'
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
              index < currentStep
                ? 'bg-green-500/10 border-green-500 text-green-400'
                : index === currentStep
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                : 'bg-gray-800/50 border-gray-700 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-medium transition-all ${
                index < currentStep
                  ? 'text-green-400'
                  : index === currentStep
                  ? 'text-cyan-400'
                  : 'text-gray-600'
              }`}
            >
              {step}
            </p>
          </div>
          {index < currentStep && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          {index === currentStep && (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      ))}
    </div>
  );
};
