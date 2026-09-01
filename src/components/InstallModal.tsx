import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Share2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface InstallModalProps {
  onClose: () => void;
  deferredPrompt: any;
  apkDownloadUrl?: string;
}

export const InstallModal: React.FC<InstallModalProps> = ({ onClose, deferredPrompt, apkDownloadUrl }) => {
  const [copied, setCopied] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'other'>('android');

  const appUrl = 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';
  const rawApkUrl = apkDownloadUrl || localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url');
  
  let targetApkUrl: string | null = null;
  if (rawApkUrl && rawApkUrl.trim() && rawApkUrl !== '/BD_ESPORTS_MS_v1.0.apk' && !rawApkUrl.includes('run.app')) {
    let clean = rawApkUrl.trim();
    if (clean.includes('drive.google.com/file/d/')) {
      const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        clean = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    } else if (clean.includes('drive.google.com/open?id=')) {
      const match = clean.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        clean = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    targetApkUrl = clean;
  }

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType('ios');
    } else if (/android/i.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('android');
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3">
      <div
        id="install-app-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#1e1b4b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">INSTALL ESPORTS APP</h3>
              <p className="text-xs text-cyan-200 font-bengali">ফোনে এক ক্লিকে ইনস্টল করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-slate-800">
          {/* App Card Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-2xl border border-slate-700 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <img src="/app_icon.png" alt="App Icon" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-orbitron font-extrabold text-sm text-white truncate">
                  BD ESPORTS MS
                </h4>
                <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.2 rounded font-mono">
                  APK / PWA
                </span>
              </div>
              <p className="text-xs text-cyan-200 font-rajdhani font-semibold mt-0.5">
                Free Fire Tournaments & Diamond Store
              </p>
              <p className="text-[10px] text-slate-400">100% Free • No Play Store Needed</p>
            </div>
          </div>

          {/* Warning notice if opened in in-app / offline preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 font-bengali text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <span className="text-base">⚠️</span>
              <span>"Viewing an offline copy" বা ইনস্টল না হওয়ার কারণ:</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              আপনি যদি AI Studio এর ভেতরে বা গুগল প্রিভিউ ফ্রেমের ভেতরে থাকেন, তবে ক্রোম ব্রাউজার সরাসরি ইনস্টল করতে দেয় না। 
              <span className="font-bold text-amber-950"> নিচের "Open in Chrome" বাটনে ক্লিক করে সরাসরি গুগল ক্রোমে ওপেন করুন</span> — সাথে সাথে ১-ক্লিকে ইনস্টল হয়ে যাবে!
            </p>
          </div>

          {/* Quick 1-Click Install Button if supported */}
          {deferredPrompt ? (
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-orbitron text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>INSTALL TO PHONE (১-ক্লিকে ইনস্টল)</span>
            </button>
          ) : null}

          {/* Action Buttons */}
          <div className={`grid ${targetApkUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {targetApkUrl ? (
              <a
                href={targetApkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-rajdhani text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD APK</span>
              </a>
            ) : null}
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold font-rajdhani text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN IN CHROME (ক্রোমে খুলুন)</span>
            </a>
          </div>

          {/* Device Tab Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setDeviceType('android')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-rajdhani uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                deviceType === 'android'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android Phone</span>
            </button>
            <button
              onClick={() => setDeviceType('ios')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold font-rajdhani uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                deviceType === 'ios'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>iPhone / iOS</span>
            </button>
          </div>

          {/* Step-by-Step Bangla Instructions */}
          {deviceType === 'android' ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 font-bengali text-xs">
              <h5 className="font-bold text-slate-900 font-rajdhani text-sm flex items-center gap-1.5 text-base">
                📱 Android ফোনে ইনস্টল করার সহজ নিয়ম (Chrome):
              </h5>
              
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-700 leading-relaxed">
                  আপনার মোবাইলের <span className="font-bold text-blue-600">Google Chrome</span> ব্রাউজারে এই লিংকটি ওপেন করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-700 leading-relaxed">
                  উপরে ডানপাশে থাকা <span className="font-bold text-slate-900">৩টি ডট (⋮)</span> মেনুতে ক্লিক করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-700 font-rajdhani text-sm">"Install App"</span> বা <span className="font-bold text-emerald-700">"Add to Home screen" (হোম স্ক্রিনে যোগ করুন)</span> অপশনে ট্যাপ করুন।
                </p>
              </div>

              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center font-semibold">
                ✅ সাথে সাথে আপনার ফোনের হোম স্ক্রিনে অফিশিয়াল অ্যাপের মতো আইকন চলে আসবে!
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 font-bengali text-xs">
              <h5 className="font-bold text-slate-900 font-rajdhani text-sm flex items-center gap-1.5 text-base">
                🍎 iPhone / iPad এ ইনস্টল করার নিয়ম (Safari):
              </h5>
              
              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-sky-600">Safari Browser</span> এ লিংকটি ওপেন করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-700 leading-relaxed">
                  নিচের মাঝখানের <span className="font-bold text-slate-900">Share বাটন (⎙ / 📤)</span> এ ক্লিক করুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-slate-700 leading-relaxed">
                  নিচে স্ক্রল করে <span className="font-bold text-emerald-700">"Add to Home Screen" (+)</span> এ ক্লিক করে "Add" চাপুন।
                </p>
              </div>
            </div>
          )}

          {/* Copy Link Section for opening on phone */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-rajdhani uppercase font-bold text-[11px]">Direct App URL:</span>
              <span className="text-amber-400 text-[10px]">Open on Mobile Chrome</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-black/40 text-cyan-300 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold font-orbitron tracking-wider text-xs rounded-xl cursor-pointer"
          >
            GOT IT / সম্পন্ন হয়েছে
          </button>
        </div>
      </div>
    </div>
  );
};
