import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DeploymentStatus {
  status: 'active' | 'deploying' | 'error' | 'unknown';
  lastDeployment?: {
    timestamp: string;
    commit: string;
    author: string;
    message: string;
  };
}

export function AutomationStatusBadge() {
  const [status, setStatus] = useState<DeploymentStatus>({ status: 'unknown' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkDeploymentStatus();
    const interval = setInterval(checkDeploymentStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkDeploymentStatus = async () => {
    try {
      const response = await fetch('/version.json');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          status: 'active',
          lastDeployment: {
            timestamp: data.buildTime || new Date().toISOString(),
            commit: data.commit || 'unknown',
            author: data.author || 'system',
            message: data.message || 'Deployment successful',
          },
        });
        setIsVisible(true);
      } else {
        setStatus({ status: 'error' });
      }
    } catch (error) {
      setStatus({ status: 'error' });
    }
  };

  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deploying':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'active':
        return 'All Systems Operational';
      case 'deploying':
        return 'Deploying Updates...';
      case 'error':
        return 'System Error';
      default:
        return 'Status Unknown';
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'active':
        return 'bg-green-500/10 border-green-500/20 text-green-700';
      case 'deploying':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-700';
      default:
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300`}>
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor()} backdrop-blur-sm shadow-lg`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {status.lastDeployment && status.status === 'active' && (
        <div className="mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-xs">
          <div className="font-semibold text-gray-900 mb-2">Last Deployment</div>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>
                {new Date(status.lastDeployment.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">By:</span>
              <span className="truncate ml-2">
                {status.lastDeployment.author}
              </span>
            </div>
            <div className="mt-1 pt-1 border-t border-gray-200">
              <span className="font-medium">Message:</span>
              <p className="text-gray-500 mt-1 truncate">
                {status.lastDeployment.message}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-center text-gray-400">
            Auto-deployed via GitHub Actions
          </div>
        </div>
      )}
    </div>
  );
}
