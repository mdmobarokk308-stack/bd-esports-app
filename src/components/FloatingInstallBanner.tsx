import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle2 } from 'lucide-react';

interface FloatingInstallBannerProps {
  apkDownloadUrl?: string;
  deferredPrompt?: any;
  onInstallClick?: () => void;
  onToast?: (msg: string) => void;
}

export const getCleanApkDownloadUrl = (rawUrl?: string): string | null => {
  if (!rawUrl || rawUrl.trim() === '' || rawUrl.includes('ais-pre-mctznqvvcorhlkxb3sz4on') || rawUrl.includes('ais-dev-mctznqvvcorhlkxb3sz4on') || rawUrl === '/BD_ESPORTS_MS_v1.0.apk') {
    return null;
  }
  const clean = rawUrl.trim();
  // Auto-convert Google Drive sharing link to 1-click direct download
  if (clean.includes('drive.google.com/file/d/')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  if (clean.includes('drive.google.com/open?id=')) {
    const match = clean.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return clean;
};

export const FloatingInstallBanner: React.FC<FloatingInstallBannerProps> = ({
  apkDownloadUrl,
  deferredPrompt,
  onInstallClick,
  onToast,
}) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('dismissed_install_banner') === 'true';
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect if already running inside installed standalone app
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

  const handleInstallAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInstalling(true);

    const targetUrl = getCleanApkDownloadUrl(apkDownloadUrl);

    // 1. If custom APK link (e.g. Google Drive) is configured, trigger APK download
    if (targetUrl) {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', 'BD_ESPORTS_MS.apk');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onToast) {
        onToast('📥 APK ফাইল ডাউনলোড শুরু হয়েছে...');
      }
      setTimeout(() => setIsInstalling(false), 2000);
      return;
    }

    // 2. If Android PWA prompt is ready, trigger 1-tap native home screen install!
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (onToast) {
            onToast('🎉 অ্যাপ সফলভাবে আপনার ফোনে ইনস্টল হচ্ছে!');
          }
          setIsDismissed(true);
        }
      } catch {
        if (onInstallClick) onInstallClick();
      }
      setIsInstalling(false);
      return;
    }

    // 3. Fallback: Open Install Guide Modal with 1-click Chrome & APK setup
    setIsInstalling(false);
    if (onInstallClick) {
      onInstallClick();
    }
  };

  // Don't show if already in standalone app or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div
      id="floating-install-app-banner"
      className="fixed bottom-[68px] left-3 z-40 max-w-[210px] sm:max-w-[240px] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#144f3d] hover:bg-[#104333] transition-all text-white px-2.5 py-2 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-2">
        {/* Left Side: Clickable Install Pill */}
        <button
          type="button"
          onClick={handleInstallAction}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 text-left active:scale-95 transition"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-700/90 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 shadow-inner">
            {isInstalling ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 animate-pulse stroke-[2.5]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-100 stroke-[2.5]" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-orbitron font-extrabold text-xs sm:text-sm text-white tracking-wide block truncate">
              {isInstalling ? 'Installing...' : 'Install App'}
            </span>
          </div>
        </button>

        {/* Right Side: Close 'X' */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close install banner"
          className="w-6 h-6 rounded-lg hover:bg-emerald-800/80 active:scale-90 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
