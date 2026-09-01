import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface FloatingInstallBannerProps {
  onInstallClick: () => void;
  deferredPrompt?: any;
}

export const FloatingInstallBanner: React.FC<FloatingInstallBannerProps> = ({
  onInstallClick,
  deferredPrompt,
}) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if user temporarily dismissed the banner in this session
    return sessionStorage.getItem('dismissed_install_banner') === 'true';
  });
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already running as installed PWA / standalone
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    sessionStorage.setItem('dismissed_install_banner', 'true');
  };

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setIsDismissed(true);
        }
      });
    }
    onInstallClick();
  };

  // Don't show if already in standalone/installed mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div
      id="floating-install-app-banner"
      className="fixed bottom-[68px] left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#144f3d] hover:bg-[#114434] transition-all text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
        {/* Left Side: Download Icon + Title */}
        <div
          onClick={handleInstall}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 shadow-inner">
            <Download className="w-4 h-4 text-emerald-100 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <span className="font-orbitron font-extrabold text-sm sm:text-base text-white tracking-wide block truncate">
              Install App
            </span>
          </div>
        </div>

        {/* Right Side: Install Button & Close 'X' */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#144f3d] font-orbitron font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer"
          >
            Install
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close install banner"
            className="w-7 h-7 rounded-lg hover:bg-emerald-800/80 active:scale-90 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
