'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share2 } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = () => {
      return window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone === true;
    };

    setIsStandalone(isInStandaloneMode());

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        if (!isInStandaloneMode()) {
          setIsVisible(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Installer TontineSecure</h3>
          <p className="text-sm text-gray-600">
            Accédez à vos tontines plus rapidement
          </p>
        </div>
        
        {isIOS ? (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Appuyez sur</p>
              <Share2 className="h-6 w-6 text-blue-600 mx-auto" />
              <p className="text-xs text-gray-500 mt-1">puis "Sur l'écran d'accueil"</p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-5 w-5" />
              Installer
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}