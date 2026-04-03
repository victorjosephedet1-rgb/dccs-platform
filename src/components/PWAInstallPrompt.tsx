import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    if (isInStandaloneMode) {
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-in-right">
      <div className="glass-card p-4 border-2 border-blue-500/30 rounded-2xl shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl flex-shrink-0">
            {isIOS ? (
              <Smartphone className="w-6 h-6 text-white" />
            ) : (
              <Monitor className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">
              Install V3BMusic.AI
            </h3>
            <p className="text-slate-300 text-sm mb-3">
              {isIOS
                ? 'Add to your home screen for quick access and offline features'
                : 'Install our app for faster access, offline support, and better experience'}
            </p>

            {isIOS ? (
              <div className="space-y-2 text-sm text-slate-300">
                <p className="font-semibold text-white">How to install:</p>
                <ol className="space-y-1 ml-4 list-decimal">
                  <li>Tap the Share button <span className="inline-block">⬆️</span></li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 text-center">
            <div>
              <div className="font-semibold text-white">Offline</div>
              <div>Access</div>
            </div>
            <div>
              <div className="font-semibold text-white">Faster</div>
              <div>Loading</div>
            </div>
            <div>
              <div className="font-semibold text-white">Home Screen</div>
              <div>Icon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
