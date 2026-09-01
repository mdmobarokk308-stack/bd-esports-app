import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle2 } from 'lucide-react';

interface FloatingInstallBannerProps {
  apkDownloadUrl?: string;
  onInstallClick?: () => void;
  onToast?: (msg: string) => void;
}

export const getCleanApkDownloadUrl = (rawUrl?: string): string => {
  if (!rawUrl || rawUrl.trim() === '' || rawUrl.includes('ais-pre-mctznqvvcorhlkxb3sz4on') || rawUrl.includes('ais-dev-mctznqvvcorhlkxb3sz4on')) {
    return '/BD_ESPORTS_MS_v1.0.apk';
  }
  const clean = rawUrl.trim();
  // Auto-convert Google Drive sharing link to 1-click direct download
  if (clean.includes('drive.google.com/file/d/')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return clean;
};

export const FloatingInstallBanner: React.FC<FloatingInstallBannerProps> = ({
  apkDownloadUrl,
  onInstallClick,
  onToast,
}) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('dismissed_install_banner') === 'true';
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDirectDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    const targetUrl = getCleanApkDownloadUrl(apkDownloadUrl);

    // Trigger instant browser download for APK file
    const link = document.createElement('a');
    link.href = targetUrl;
    link.setAttribute('download', 'BD_ESPORTS_MS_v1.0.apk');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onToast) {
      onToast('📥 ১-ক্লিকে APK ফাইল ডাউনলোড শুরু হয়েছে (BD_ESPORTS_MS.apk)...');
    }

    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);
  };

  // Don't show if already in standalone app or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div
      id="floating-install-app-banner"
      className="fixed bottom-[66px] left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#144f3d] hover:bg-[#104333] transition-all text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
        {/* Left Side: Download Icon + Title */}
        <div
          onClick={handleDirectDownload}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 shadow-inner">
            {isDownloading ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-pulse stroke-[2.5]" />
            ) : (
              <Download className="w-4 h-4 text-emerald-100 stroke-[2.5]" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-orbitron font-extrabold text-sm sm:text-base text-white tracking-wide block truncate">
              {isDownloading ? 'Downloading...' : 'Install App'}
            </span>
          </div>
        </div>

        {/* Right Side: Install Button & Close 'X' */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDirectDownload}
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#144f3d] font-orbitron font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
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
