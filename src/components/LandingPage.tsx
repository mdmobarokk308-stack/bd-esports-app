import React, { useState } from 'react';
import { Download, Play, Shield, Smartphone, ArrowRight, CheckCircle2, Sparkles, Trophy, Award, Gamepad2, X } from 'lucide-react';
import { EsportsLogo } from './EsportsLogo';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenInstall: () => void;
  apkDownloadUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenInstall, apkDownloadUrl }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    // 1. Get APK URL (custom admin link or built-in APK)
    const customApkUrl = apkDownloadUrl || localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url');
    const apkUrl = customApkUrl && customApkUrl.trim() !== '' && customApkUrl !== '/BD_ESPORTS_MS_v1.0.apk' ? customApkUrl.trim() : 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';

    // 2. Trigger real browser file download or external link
    try {
      if (apkUrl.startsWith('http://') || apkUrl.startsWith('https://')) {
        window.open(apkUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = apkUrl;
        link.setAttribute('download', 'BD_ESPORTS_MS_v1.0.apk');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download trigger error:', err);
    }

    // 3. Trigger native PWA install prompt if available
    if ((window as any).deferredInstallPrompt) {
      try {
        const promptEvent = (window as any).deferredInstallPrompt;
        promptEvent.prompt();
      } catch (e) {
        console.log(e);
      }
    }

    // 4. Show success instructions
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#2e1363] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Neon Lighting Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-b from-purple-600/30 via-indigo-900/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-gradient-to-t from-fuchsia-900/30 via-purple-900/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full bg-[#1e0a45]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-purple-900/50 z-30 sticky top-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#160633] rounded-full flex items-center justify-center">
              <span className="text-xs">🎮</span>
            </div>
          </div>
          <span className="font-orbitron font-extrabold text-white text-base tracking-wide">
            BD ESPORTS MS
          </span>
        </div>

        <button
          onClick={onEnterApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer font-rajdhani tracking-wider"
        >
          <span>সরাসরি অ্যাপ</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-5 pt-8 pb-4 text-center z-10 max-w-lg mx-auto w-full">
        {/* Main Bengali Title matching Screenshot */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-snug tracking-tight drop-shadow-md mb-3 font-bengali">
          আপনি কি একজন <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-200">
            eSports প্লেয়ার ?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-purple-200 text-sm sm:text-base font-medium max-w-xs sm:max-w-sm mb-7 leading-relaxed font-bengali opacity-90">
          গেম খেলে আপনি জিতে নিতে পারেন প্রতিদিন ১০০০-২০০০ টাকা পর্যন্ত রিওয়ার্ড
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3.5 mb-6">
          {/* Red Video Button */}
          <button
            onClick={() => setShowVideoModal(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#ea3a47] hover:bg-[#d42d3a] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-white font-bold text-base shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <Play size={18} className="fill-white" />
            <span className="font-bengali">ভিডিও দেখে নিন</span>
          </button>

          {/* Dark Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1e0a45] hover:bg-[#2a0e5f] active:scale-[0.98] border border-purple-800/80 transition-all flex items-center justify-center gap-2.5 text-white font-bold text-base shadow-lg shadow-black/50 cursor-pointer"
          >
            <Download size={19} className={downloading ? 'animate-bounce text-amber-400' : 'text-white'} />
            <span className="font-bengali">
              {downloading ? 'অ্যাপ লোড হচ্ছে...' : 'অ্যাপটি ডাউনলোড করুন'}
            </span>
          </button>

          {/* Enter directly button */}
          <button
            onClick={onEnterApp}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-400/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-amber-300 font-bold text-sm cursor-pointer"
          >
            <Sparkles size={16} />
            <span className="font-bengali">সরাসরি গেম টুর্নামেন্টে প্রবেশ করুন</span>
          </button>
        </div>

        {/* Download Success Notice with Step-by-Step Instructions */}
        {downloadSuccess && (
          <div className="w-full max-w-sm mb-4 p-3.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-500 text-white text-xs flex flex-col gap-2 animate-fade-in shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="font-bengali">APK ডাউনলোড হচ্ছে!</span>
            </div>
            
            <div className="bg-emerald-900/40 p-2.5 rounded-xl text-left text-[11.5px] text-emerald-100 font-bengali space-y-1 border border-emerald-700/50">
              <p>১. ডাউনলোড শেষ হলে ক্রোম স্ক্রিনে <b>"File downloaded [Open]"</b> আসবে।</p>
              <p>২. <b>"Open"</b> এ চাপ দিলে আসবে <b>"Do you want to install this app?"</b></p>
              <p>৩. এরপর <b>"Install"</b> বাটনে চাপ দিলেই ফোনে ইনস্টল হয়ে যাবে!</p>
            </div>

            <button
              onClick={onEnterApp}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-lg text-xs font-rajdhani hover:brightness-110 tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>সরাসরি ব্রাউজারে খেলুন (PLAY NOW)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Features Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <div className="bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-full text-[11px] text-purple-200 flex items-center gap-1.5 font-bengali">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            লাইভ ম্যাচ রুম
          </div>
          <div className="bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-full text-[11px] text-purple-200 flex items-center gap-1.5 font-bengali">
            <Trophy size={12} className="text-amber-400" />
            ইনস্ট্যান্ট বিকাশ/নগদ পেমেন্ট
          </div>
          <div className="bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-full text-[11px] text-purple-200 flex items-center gap-1.5 font-bengali">
            <Award size={12} className="text-yellow-400" />
            ১০০% নিরাপদ ও ভেরিফাইড
          </div>
        </div>

        {/* Free Fire Cyber Character Illustration matching screenshot */}
        <div className="relative w-full max-w-xs sm:max-w-sm flex items-center justify-center mt-auto">
          {/* Glowing pedestal effect */}
          <div className="absolute -bottom-2 w-48 h-8 bg-purple-500/40 rounded-full blur-xl pointer-events-none" />
          
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"
            alt="Esports Battle Royale Champion"
            className="w-56 sm:w-64 h-56 sm:h-64 object-cover rounded-3xl border-2 border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.35)] relative z-10 brightness-110"
          />

          {/* Winner Badge floating */}
          <div className="absolute bottom-2 right-4 z-20 bg-gradient-to-r from-purple-900 to-indigo-950 border border-purple-400/60 px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 text-[10px] font-orbitron font-extrabold text-amber-300">
            <span>🏆 WINNER BATTLE ROYALE</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-[11px] text-purple-300/70 border-t border-purple-900/40 bg-[#160633] z-20">
        <p className="font-bengali">© 2026 BD ESPORTS MS • সর্বস্বত্ব সংরক্ষিত</p>
      </footer>

      {/* Video Guide Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e0a45] border border-purple-600/60 rounded-3xl w-full max-w-md p-5 text-white relative shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-950/80 border border-purple-700 flex items-center justify-center text-purple-300 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Play size={14} className="fill-white" />
              </div>
              <h3 className="font-bold text-base text-white font-bengali">
                কিভাবে অ্যাপে ম্যাচ খেলবেন ও টাকা জিতবেন?
              </h3>
            </div>

            {/* Video preview / Guide steps */}
            <div className="bg-[#12052b] border border-purple-900/80 rounded-2xl p-4 mb-4 text-left space-y-3 text-xs text-purple-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <p className="font-bengali leading-relaxed">
                  <b>ম্যাচে জয়েন করুন:</b> অ্যাপ ওপেন করে আপনার পছন্দের Free Fire BR বা Clash Squad ম্যাচ সিলেক্ট করে জয়েন বাটনে চাপ দিন।
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <p className="font-bengali leading-relaxed">
                  <b>রুম আইডি ও পাসওয়ার্ড:</b> ম্যাচ শুরুর ১৫ মিনিট আগে অ্যাপের ভেতরেই কাস্টম রুম কোড পেয়ে যাবেন।
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <p className="font-bengali leading-relaxed">
                  <b>ইনস্ট্যান্ট টাকা উইথড্র:</b> ম্যাচে Booyah বা কিল করে জয়ী হলে আপনার ওয়ালেটে সাথে সাথে টাকা যোগ হবে এবং বিকাশ/নগদে তুলে নিতে পারবেন!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowVideoModal(false);
                onEnterApp();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold font-rajdhani text-sm tracking-wider rounded-xl cursor-pointer hover:brightness-110 shadow-lg"
            >
              এখনই টুর্নামেন্টে যোগ দিন (JOIN NOW)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
