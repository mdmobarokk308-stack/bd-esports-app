import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  User as UserIcon,
  TrendingUp,
  Code2,
  Share2,
  ChevronRight,
  LogOut,
  Headphones,
  ShieldAlert,
  Download,
  BookOpenCheck,
  Bell,
  Moon,
} from 'lucide-react';
import { User as UserType } from '../types';
import { formatTelegramUrl, openExternalUrl } from '../utils/urlHelper';
import { requestDeviceNotificationPermission, sendSystemDeviceNotification } from '../utils/notificationUtils';

interface ProfileScreenProps {
  user: UserType;
  telegramLink?: string;
  onOpenWallet: () => void;
  onOpenWithdraw: () => void;
  onOpenEditProfile: () => void;
  onOpenRules: () => void;
  onOpenTopPlayers: () => void;
  onOpenDeveloper: () => void;
  onOpenReferEarn?: () => void;
  onOpenInstall?: () => void;
  onOpenAdmin?: (type?: 'tournament' | 'diamond') => void;
  onOpenLanding?: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  telegramLink,
  onOpenWallet,
  onOpenWithdraw,
  onOpenEditProfile,
  onOpenRules,
  onOpenTopPlayers,
  onOpenDeveloper,
  onOpenReferEarn,
  onOpenInstall,
  onOpenAdmin,
  onOpenLanding,
  onLogout,
}) => {
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('bd_esports_app_notifications_enabled') !== 'false';
  });

  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    return localStorage.getItem('bd_esports_theme_dark') !== 'false';
  });

  const handleToggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDarkTheme(checked);
    localStorage.setItem('bd_esports_theme_dark', checked ? 'true' : 'false');
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const handleToggleAppNotifications = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAppNotificationsEnabled(checked);
    localStorage.setItem('bd_esports_app_notifications_enabled', checked ? 'true' : 'false');

    if (checked) {
      const granted = await requestDeviceNotificationPermission();
      sendSystemDeviceNotification(
        'BD ESPORTS MS • নোটিফিকেশন চালু হয়েছে 🔔',
        granted
          ? 'আপনার ডিভাইসে পুশ নোটিফিকেশন চালু করা হয়েছে! এখন রুম আইডি, গিভঅ্যাওয়ে ও ডায়মন্ড অফারের আপডেট পাবেন।'
          : 'ইন-অ্যাপ নোটিফিকেশন চালু হয়েছে। ফোনের সিস্টেম নোটিফিকেশন দিতে ব্রাউজারে নোটিফিকেশন পারমিশন Allow করুন।'
      );
    }
  };
  return (
    <div className="w-full bg-gradient-to-b from-[#6366f1] via-[#818cf8] to-[#f1f5f9] min-h-screen pb-16 text-slate-800 select-none">
      {/* Top Hero Section matching Screenshot 1 */}
      <div className="pt-6 pb-8 px-4 text-center text-white">
        {/* Username */}
        <h1 className="text-3xl sm:text-4xl font-extrabold font-['Rajdhani',sans-serif] tracking-wide text-white drop-shadow-sm">
          {user.username || 'mobarok55'}
        </h1>

        {/* 3 Stats Row matching Screenshot 1 */}
        <div className="grid grid-cols-3 items-center justify-center mt-6 max-w-sm mx-auto text-white">
          {/* Matches */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-['Rajdhani',sans-serif] leading-none">
              {user.matchesJoined}
            </span>
            <span className="text-sm sm:text-base font-semibold font-['Rajdhani',sans-serif] mt-1 opacity-90">
              Matches
            </span>
          </div>

          {/* Balance (BDT 0) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-amber-300 font-bold text-lg font-mono">৳</span>
              <span className="text-2xl sm:text-3xl font-black font-['Rajdhani',sans-serif] leading-none">
                BDT {user.balance}
              </span>
            </div>
            <span className="text-sm sm:text-base font-semibold font-['Rajdhani',sans-serif] mt-1 opacity-90">
              Balance
            </span>
          </div>

          {/* Won */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black font-['Rajdhani',sans-serif] leading-none">
              {user.totalWon}
            </span>
            <span className="text-sm sm:text-base font-semibold font-['Rajdhani',sans-serif] mt-1 opacity-90">
              Won
            </span>
          </div>
        </div>
      </div>

      {/* Main White Rounded Card matching Screenshot 1 */}
      <div className="max-w-md mx-auto px-4 -mt-2">
        <div className="bg-[#f8fafc]/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-xl border border-white/80 space-y-1">
          {/* 1. Wallet */}
          <button
            id="profile-menu-wallet"
            onClick={onOpenWallet}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                Wallet
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Withdraw */}
          <button
            id="profile-menu-withdraw"
            onClick={onOpenWithdraw}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shadow-xs">
                <Coins className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                Withdraw
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. My Profile */}
          <button
            id="profile-menu-edit-profile"
            onClick={onOpenEditProfile}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fae8ff] text-[#c026d3] flex items-center justify-center shadow-xs">
                <UserIcon className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                My Profile
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 4. Theme Toggle matching Screenshot */}
          <div
            id="profile-menu-theme"
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shadow-xs">
                <Moon className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800">
                Theme
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold italic text-slate-500 font-serif">
                {isDarkTheme ? 'Dark' : 'Light'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDarkTheme}
                  onChange={handleToggleTheme}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* 5. All Rules */}
          <button
            id="profile-menu-rules"
            onClick={onOpenRules}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center shadow-xs">
                <BookOpenCheck className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                All Rules
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 4. Top Players */}
          <button
            id="profile-menu-top-players"
            onClick={onOpenTopPlayers}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                Top Players
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 5. Developer Profile */}
          <button
            id="profile-menu-developer"
            onClick={onOpenDeveloper}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center shadow-xs">
                <Code2 className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                Developer Profile
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 6. Refer and Earn matching Screenshot 1 */}
          <button
            id="profile-menu-refer-earn"
            onClick={onOpenReferEarn}
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center shadow-xs">
                <Share2 className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 group-hover:text-slate-950 transition">
                Refer and Earn
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 7. App Notifications Toggle */}
          <div
            id="profile-menu-app-notifications"
            className="w-full py-3.5 px-3.5 flex items-center justify-between rounded-2xl hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center shadow-xs">
                <Bell className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <span className="text-xl font-bold font-['Rajdhani',sans-serif] text-slate-800 block leading-tight">
                  App Notifications
                </span>
                <span className="text-[10px] text-slate-500 font-bengali">সিস্টেম পুশ অ্যালার্ট ও ম্যাচ অ্যালার্ম</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appNotificationsEnabled}
                onChange={handleToggleAppNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Extra Admin & Rules Options */}
          {onOpenAdmin && (
            <div className="space-y-2 pt-1">
              {/* Owner Admin Panel T (Tournament) */}
              <button
                id="profile-menu-admin-panel-t"
                onClick={() => onOpenAdmin('tournament')}
                className="w-full py-3 px-3.5 flex items-center justify-between rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold font-['Rajdhani',sans-serif] text-amber-900 group-hover:text-amber-950 transition block leading-tight">
                      Owner Admin Panel (T)
                    </span>
                    <span className="text-[10px] text-amber-700 font-bengali">ম্যাচ তৈরি, রুম আইডি, ডিপোজিট ও অ্যানালিটিক্স</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded font-mono">
                  ADMIN T
                </span>
              </button>

              {/* Owner Admin Panel D (Diamond Shop) */}
              <button
                id="profile-menu-admin-panel-d"
                onClick={() => onOpenAdmin('diamond')}
                className="w-full py-3 px-3.5 flex items-center justify-between rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-5 h-5 stroke-[2.4] text-slate-950" />
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold font-['Rajdhani',sans-serif] text-cyan-900 group-hover:text-cyan-950 transition block leading-tight">
                      Owner Admin Panel (D)
                    </span>
                    <span className="text-[10px] text-cyan-700 font-bengali">ডায়মন্ড ড্যাশবোর্ড, স্টেটমেন্টস, অর্ডার্স ও ভাউচার</span>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded font-mono">
                  ADMIN D
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Red Logout Button with Support Headset Icon matching Screenshot 1 */}
        <div className="relative mt-5 mb-4">
          <button
            id="profile-logout-button"
            onClick={onLogout}
            className="w-full py-3.5 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-rajdhani text-xl font-black uppercase tracking-wider shadow-lg active:scale-98 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-6 h-6 stroke-[2.5]" />
            <span>Logout</span>
          </button>

          {/* Support Headset Floating Mascot Icon on the right matching Screenshot 1 */}
          <div
            id="profile-support-headset-btn"
            onClick={() => {
              const url = formatTelegramUrl(telegramLink || localStorage.getItem('permanent_owner_telegram') || localStorage.getItem('admin_telegram_link') || 'https://t.me/esportsclubbd');
              openExternalUrl(url);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition"
            title="Customer Support"
          >
            <div className="w-10 h-10 rounded-full bg-[#fed7aa] flex items-center justify-center relative">
              <Headphones className="w-6 h-6 text-[#1e293b] stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
