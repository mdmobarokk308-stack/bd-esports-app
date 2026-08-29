import React, { useState, useEffect } from 'react';
import { ChevronRight, Volume2, Sparkles, Trophy, Zap, Shield, Flame, Gift, Bell, Wallet, Gamepad2 } from 'lucide-react';
import { MATCH_CATEGORIES } from '../data/mockData';
import { MatchCategoryKey } from '../types';

interface PlayScreenProps {
  onSelectCategory: (categoryId: MatchCategoryKey) => void;
  onOpenShop: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  userBalance?: number;
  onOpenWallet?: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  onSelectCategory,
  onOpenShop,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  userBalance,
  onOpenWallet,
}) => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'BD ESPORTS MS',
      subtitle: 'প্রতিদিন ফ্রি ট্রানজেকশন giveaway নিতে টেলিগ্রাম চ্যানেলে জয়েন করুন',
      bgGradient: 'from-amber-950 via-slate-900 to-black',
      tag: 'DAILY GIVEAWAY',
      actionUrl: 'https://t.me/esportsclubbd',
      actionText: 'Join Telegram',
    },
    {
      id: 2,
      title: 'MEGA WEEKEND TOURNAMENT',
      subtitle: '১০০০+ টাকা প্রাইজপুল! ফ্রি ফায়ার স্কোয়াড টুর্নামেন্টে জয়েন করুন এখনই',
      bgGradient: 'from-purple-950 via-indigo-950 to-black',
      tag: 'SPECIAL EVENT',
      actionText: 'Join Squad',
    },
    {
      id: 3,
      title: 'DIAMOND TOP-UP 20% DISCOUNT',
      subtitle: 'সবচেয়ে কম দামে বিকাশ ও নগদ দিয়ে ইনস্ট্যান্ট ইউআইডি টপ আপ করুন',
      bgGradient: 'from-blue-950 via-slate-900 to-black',
      tag: 'INSTANT SHOP',
      actionText: 'Top Up Now',
    },
  ];

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="w-full bg-[#f8fafc] min-h-full pb-6 text-slate-800">
      {/* App Header Bar with Wallet and Notification Bell */}
      <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center justify-center shrink-0">
            <img
              src="/team_logo.png"
              alt="BD ESPORTS MS Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-orbitron font-extrabold text-sm tracking-wider text-slate-900 leading-none">
              BD ESPORTS <span className="text-amber-500">MS</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold font-rajdhani tracking-wide">
              FREE FIRE TOURNAMENTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Balance Button */}
          {userBalance !== undefined && onOpenWallet && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-full text-xs font-rajdhani font-bold text-amber-900 shadow-xs cursor-pointer transition active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              <span>৳{userBalance}</span>
            </button>
          )}

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              id="header-notification-bell"
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-950 transition cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Top Banner Carousel matching Screenshot */}
      <div className="px-3 pt-1">
        <div
          id="banner-carousel"
          className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-amber-500/30 bg-gradient-to-r from-[#1e0a00] via-[#2a1205] to-[#0d0400] text-white min-h-[135px] sm:min-h-[145px] flex flex-col justify-between p-3.5"
        >
          {/* Background particle / flame graphics */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black pointer-events-none" />

          {/* Top Row: Brand & Payment Partners */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 bg-amber-500 text-black px-2 py-0.5 rounded-sm font-orbitron font-black text-[10px] tracking-wider transform -rotate-1 shadow-sm">
              <Flame className="w-3 h-3 text-red-700 fill-red-700" />
              <span>{banners[activeBannerIndex].title}</span>
            </div>

            {/* Payment & Telegram logos */}
            <div className="flex items-center space-x-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs border border-white/10">
              <span className="w-4 h-4 rounded-full bg-[#e2136e] text-white text-[8px] font-bold flex items-center justify-center" title="bKash">
                b
              </span>
              <span className="w-4 h-4 rounded-full bg-[#8c3494] text-white text-[8px] font-bold flex items-center justify-center" title="Rocket">
                R
              </span>
              <span className="w-4 h-4 rounded-full bg-[#f7941d] text-white text-[8px] font-bold flex items-center justify-center" title="Nagad">
                N
              </span>
              <span className="w-4 h-4 rounded-full bg-[#229ed9] text-white text-[8px] font-bold flex items-center justify-center" title="Telegram">
                ✈️
              </span>
            </div>
          </div>

          {/* Middle Content: Team Logo + Bangla Giveaway text */}
          <div className="relative z-10 my-1.5 flex items-center gap-3">
            {/* Team Logo Badge */}
            <div className="w-13 h-13 shrink-0 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border border-amber-300/40">
                <img
                  src="/team_logo.png"
                  alt="BD ESPORTS MS"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <p className="font-bengali text-sm sm:text-base font-bold text-yellow-300 leading-snug drop-shadow-md">
                {banners[activeBannerIndex].subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="px-3 mt-3">
        <div
          id="news-ticker"
          onClick={onOpenShop}
          className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center space-x-2 overflow-hidden shadow-xs cursor-pointer hover:bg-amber-100/70 transition"
        >
          <Volume2 className="w-4 h-4 text-orange-600 shrink-0 animate-bounce" />
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee font-bengali font-bold text-orange-600 text-sm tracking-wide">
              ⚡ কম দামে ডায়মন্ড টপ আপ | 24/7 ইনস্ট্যান্ট সাপোর্ট | রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে দেওয়া হবে | ১০০% ট্রাস্টেড টুর্নামেন্ট প্লাটফর্ম! ⚡
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Header "FREE FIRE" */}
      <div className="text-center mt-4 mb-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase font-rajdhani text-slate-800 drop-shadow-xs">
          FREE FIRE
        </h2>
      </div>

      {/* 2-Column Match Categories Grid */}
      <div className="px-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {MATCH_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            id={`category-card-${cat.id}`}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative bg-white border border-slate-300/80 hover:border-indigo-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform active:scale-97 cursor-pointer flex flex-col"
          >
            {/* Category Artwork Image with exact Free Fire posters */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
              <img
                src={cat.image}
                alt={cat.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content info matching clean layout */}
            <div className="p-3 bg-white flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight font-rajdhani leading-tight uppercase group-hover:text-indigo-600 transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 font-rajdhani">
                  {cat.matchCount} matches found
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
