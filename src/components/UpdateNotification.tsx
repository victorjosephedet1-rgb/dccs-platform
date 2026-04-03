import { useState, useEffect } from 'react';
import { X, RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UpdateInfo {
  version: string;
  message: string;
  deployedAt: string;
  hasUpdate: boolean;
  updateType: 'pwa' | 'content' | 'both';
}

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    checkForUpdates();
    checkServiceWorkerUpdate();

    const interval = setInterval(() => {
      checkForUpdates();
    }, 5 * 60 * 1000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setSwUpdateAvailable(true);
        checkForUpdates();
      });
    }

    return () => clearInterval(interval);
  }, []);

  const checkServiceWorkerUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true);
                if (!isDismissed) {
                  setUpdateInfo({
                    version: 'Latest',
                    message: 'New PWA version with enhanced features and performance improvements',
                    deployedAt: new Date().toISOString(),
                    hasUpdate: true,
                    updateType: 'pwa',
                  });
                  setIsVisible(true);
                }
              }
            });
          }
        });

        registration.update();
      });
    }
  };

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);

      const currentVersionResponse = await fetch('/version.json', {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const currentVersion = await currentVersionResponse.json();

      const { data: latestDeployment, error } = await supabase
        .from('deployment_versions')
        .select('version_number, changes_summary, deployed_at')
        .eq('deployment_status', 'deployed')
        .order('deployed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking for updates:', error);
        return;
      }

      if (!latestDeployment) {
        return;
      }

      const hasUpdate = latestDeployment.version_number !== currentVersion.version;

      if (hasUpdate && !isDismissed) {
        setUpdateInfo({
          version: latestDeployment.version_number,
          message: latestDeployment.changes_summary?.description || 'New features and improvements available',
          deployedAt: latestDeployment.deployed_at,
          hasUpdate: true,
          updateType: swUpdateAvailable ? 'both' : 'content',
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator && swUpdateAvailable) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    setTimeout(() => setIsDismissed(false), 30 * 60 * 1000);
  };

  if (!isVisible || !updateInfo?.hasUpdate) {
    return null;
  }

  const getUpdateTypeLabel = () => {
    if (updateInfo?.updateType === 'pwa') return 'PWA Update';
    if (updateInfo?.updateType === 'both') return 'Major Update';
    return 'Update Available';
  };

  const getUpdateIcon = () => {
    if (updateInfo?.updateType === 'pwa') return Download;
    if (updateInfo?.updateType === 'both') return CheckCircle;
    return RefreshCw;
  };

  const UpdateIcon = getUpdateIcon();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white rounded-lg shadow-2xl p-6 transform transition-all duration-300 hover:scale-105 border border-orange-400/30">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
              <UpdateIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              {getUpdateTypeLabel()}
              {updateInfo?.updateType === 'both' && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </h3>
            <p className="text-sm text-white/90 mb-1">
              Version {updateInfo?.version}
            </p>
            <p className="text-sm text-white/80 mb-4">
              {updateInfo?.message}
            </p>

            {updateInfo?.updateType === 'pwa' && (
              <p className="text-xs text-white/70 mb-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Service worker update detected
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Later
              </button>
            </div>

            <p className="text-xs text-white/60 mt-3">
              Takes only a few seconds • Won't lose your progress
            </p>
          </div>
        </div>

        {isChecking && (
          <div className="absolute top-2 left-2">
            <RefreshCw className="w-4 h-4 text-white/60 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
