import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkStatusIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (!isOnline) {
    return (
      <div
        className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in"
        style={{
          background: 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <WifiOff className="h-5 w-5 text-white" />
        <div>
          <p className="text-white font-semibold text-sm">No Internet Connection</p>
          <p className="text-white/80 text-xs">Please check your network</p>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div
        className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in"
        style={{
          background: 'rgba(16, 185, 129, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Wifi className="h-5 w-5 text-white" />
        <div>
          <p className="text-white font-semibold text-sm">Back Online</p>
          <p className="text-white/80 text-xs">Connection restored</p>
        </div>
      </div>
    );
  }

  return null;
}
