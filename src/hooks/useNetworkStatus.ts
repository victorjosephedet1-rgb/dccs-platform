import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType?: string;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [effectiveType, setEffectiveType] = useState<string>();

  useEffect(() => {
    const handleOnline = () => {
      console.log('[NETWORK] Connection restored');
      setIsOnline(true);
      if (wasOffline) {
        console.log('[NETWORK] User was offline, now back online');
      }
    };

    const handleOffline = () => {
      console.log('[NETWORK] Connection lost');
      setIsOnline(false);
      setWasOffline(true);
    };

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setEffectiveType(connection.effectiveType);
        console.log('[NETWORK] Connection type:', connection.effectiveType);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, [wasOffline]);

  return { isOnline, wasOffline, effectiveType };
}
