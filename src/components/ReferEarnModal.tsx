import React, { useState } from 'react';
import { ChevronLeft, Users, Share2, Copy, Check, Gift } from 'lucide-react';
import { User } from '../types';

interface ReferEarnModalProps {
  user: User;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ReferEarnModal: React.FC<ReferEarnModalProps> = ({
  user,
  onClose,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const referCode = user.username || 'mobarok55';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referCode);
    setCopied(true);
    onToast('রেফার কোড কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Free Fire Tournament App',
          text: `আমার রেফার কোড ${referCode} দিয়ে জয়েন করুন এবং ফ্রি ফায়ার টুর্নামেন্ট খেলে আনলিমিটেড টাকা ইনকাম করুন!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full h-full sm:h-auto max-w-md bg-[#181a20] sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col text-white">
        {/* Top Header matching Screenshot 2 */}
        <div className="sticky top-0 z-10 bg-[#181a20]/95 backdrop-blur-md px-4 py-4 flex items-center border-b border-white/5">
          <button
            onClick={onClose}
            className="p-1 -ml-2 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>
          <h1 className="text-xl font-bold font-bengali ml-3 text-white">
            রেফার অ্যান্ড আর্ন
          </h1>
        </div>

        {/* Content Body matching Screenshot 2 */}
        <div className="p-5 flex-1 flex flex-col items-center text-center space-y-6">
          {/* Circular 3-People Avatar matching Screenshot 2 */}
          <div className="w-28 h-28 rounded-full bg-[#38bdf8] p-1 shadow-xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-[#60a5fa] flex items-center justify-center relative overflow-hidden">
              <Users className="w-16 h-16 text-white stroke-[1.8]" />
            </div>
          </div>

          {/* Yellow Bangla Heading */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f59e0b] font-bengali tracking-tight">
              রেফার করুন, আয় করুন
            </h2>
            <p className="text-sm sm:text-base text-slate-200 font-bengali leading-relaxed max-w-xs mx-auto">
              আপনার রেফার কোড ব্যবহার করে কেউ রেজিস্ট্রেশন করলে, সেই ইউজার যতবার পেইড ম্যাচে জয়েন করবে আপনি প্রতিবার তার এন্ট্রি ফি-এর ১০% আপনার ওয়ালেটে পাবেন।
            </p>
          </div>

          {/* Dark Blue Refer Code Box matching Screenshot 2 */}
          <div className="w-full bg-[#111827] border border-[#1f2937] rounded-3xl p-5 shadow-lg space-y-3.5">
            <span className="text-sm font-bold text-slate-300 font-bengali block">
              আপনার রেফার কোড
            </span>

            {/* Yellow Copy Button with username */}
            <button
              onClick={handleCopyCode}
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold font-rajdhani text-2xl tracking-wide rounded-xl shadow-md cursor-pointer transition active:scale-98 flex items-center justify-center gap-2"
            >
              <span>{referCode}</span>
              {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white/80" />}
            </button>

            <p className="text-xs sm:text-sm text-slate-400 font-bengali leading-relaxed">
              আপনার বন্ধু রেজিস্ট্রেশনের সময় এই কোড ব্যবহার করলে, তার প্রতিটি পেইড ম্যাচ জয়েনে আপনি ১০% কমিশন পাবেন।
            </p>
          </div>

          {/* Bottom Purple Share Button matching Screenshot 2 */}
          <div className="w-full pt-2">
            <button
              onClick={handleShare}
              className="w-full py-3.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold font-bengali text-lg rounded-2xl shadow-lg cursor-pointer transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>বন্ধুদের সাথে শেয়ার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
