import React from 'react';
import { Volume2, Trophy, Zap, Shield, Gift, Bell, Wallet, Gamepad2 } from 'lucide-react';
import { MATCH_CATEGORIES } from '../data/mockData';
import { BannerSlide, Match, MatchCategoryKey } from '../types';
import { HeroBannerSlider } from './HeroBannerSlider';
import { getTournamentImage } from '../data/categoryImages';

interface PlayScreenProps {
  matches?: Match[];
  banners?: BannerSlide[];
  telegramLink?: string;
  onSelectCategory: (categoryId: MatchCategoryKey) => void;
  onOpenShop: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  userBalance?: number;
  onOpenWallet?: () => void;
  tournamentImages?: Record<string, string>;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  matches = [],
  banners = [],
  telegramLink,
  onSelectCategory,
  onOpenShop,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  userBalance,
  onOpenWallet,
  tournamentImages = {},
}) => {
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
            <h1 className="font-orbitron font-black text-sm tracking-wider leading-none flex items-center gap-1.5 flex-wrap">
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-black drop-shadow-xs">
                BD
              </span>
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-black drop-shadow-xs">
                ESPORTS
              </span>
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white px-1.5 py-0.5 rounded text-[10px] shadow-sm border border-amber-300 tracking-widest font-extrabold shadow-amber-500/20">
                MS
              </span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold font-rajdhani tracking-wide block mt-1">
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

      {/* Dynamic & Swipeable Hero Banner Slider */}
      <div className="px-3 pt-1">
        <HeroBannerSlider
          banners={banners}
          telegramLink={telegramLink}
          onSelectCategory={onSelectCategory}
          onOpenShop={onOpenShop}
          onOpenWallet={onOpenWallet}
        />
      </div>

      {/* Marquee Ticker */}
      <div className="px-3 mt-2.5">
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

      {/* Main Section Header "BD ESPORTS MS" */}
      <div className="text-center mt-4 mb-2 flex items-center justify-center">
        <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase font-orbitron flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-black drop-shadow-xs">
            BD
          </span>
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-black drop-shadow-xs">
            ESPORTS
          </span>
          <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white px-2.5 py-0.5 rounded-lg text-sm shadow-md border border-amber-300 tracking-widest font-extrabold shadow-amber-500/30">
            MS
          </span>
        </h2>
      </div>

      {/* 2-Column Match Categories Grid */}
      <div className="px-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {MATCH_CATEGORIES.map((cat) => {
          const activeCount = matches.filter((m) => m.category === cat.id && m.status === 'upcoming').length;
          const dynamicImg = getTournamentImage(cat.id, tournamentImages);
          return (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-white border border-slate-300/80 hover:border-indigo-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform active:scale-97 cursor-pointer flex flex-col"
            >
              {/* Category Artwork Image with exact Free Fire posters */}
              <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={dynamicImg}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {activeCount > 0 && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white font-rajdhani font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{activeCount} ACTIVE</span>
                  </div>
                )}
              </div>

              {/* Content info matching clean layout */}
              <div className="p-3 bg-white flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight font-rajdhani leading-tight uppercase group-hover:text-indigo-600 transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 font-rajdhani flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>
                      {activeCount > 0
                        ? `${activeCount} ${activeCount === 1 ? 'Match Available' : 'Matches Available'}`
                        : 'No Active Match'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
