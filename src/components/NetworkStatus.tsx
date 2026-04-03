import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-lg border transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/20 border-green-500/30'
          : 'bg-red-500/20 border-red-500/30'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300 font-medium">No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
}
