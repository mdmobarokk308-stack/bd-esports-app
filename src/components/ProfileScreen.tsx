import React from 'react';
import {
  Wallet,
  Banknote,
  User,
  BookOpenCheck,
  TrendingUp,
  Code2,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileScreenProps {
  user: UserType;
  onOpenWallet: () => void;
  onOpenWithdraw: () => void;
  onOpenEditProfile: () => void;
  onOpenRules: () => void;
  onOpenTopPlayers: () => void;
  onOpenDeveloper: () => void;
  onOpenInstall?: () => void;
  onOpenAdmin?: () => void;
  onOpenLanding?: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenWallet,
  onOpenWithdraw,
  onOpenEditProfile,
  onOpenRules,
  onOpenTopPlayers,
  onOpenDeveloper,
  onOpenInstall,
  onOpenAdmin,
  onOpenLanding,
  onLogout,
}) => {
  return (
    <div className="w-full bg-white min-h-full pb-10 text-slate-800">
      {/* Top Hero Gradient Profile Section matching Screenshot 6 */}
      <div
        id="profile-hero-section"
        className="w-full bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1e1b4b] text-white pt-6 pb-6 px-4 flex flex-col items-center shadow-md relative"
      >
        {/* Avatar Circle matching Screenshot 6 */}
        <div className="relative mb-2">
          <div className="w-20 h-20 rounded-full bg-amber-400 p-1 border-2 border-white/90 shadow-xl flex items-center justify-center overflow-hidden">
            {/* Cartoon Gamer Guy matching screenshot avatar */}
            <div className="w-full h-full rounded-full bg-[#fed7aa] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Hair */}
              <div className="w-12 h-6 bg-amber-600 rounded-t-full absolute top-1" />
              {/* Face */}
              <div className="w-8 h-8 rounded-full bg-[#ffedd5] mt-1 relative">
                {/* Eyes */}
                <div className="w-1 h-1 bg-slate-800 rounded-full absolute top-3 left-2" />
                <div className="w-1 h-1 bg-slate-800 rounded-full absolute top-3 right-2" />
              </div>
              {/* Shirt */}
              <div className="w-16 h-8 bg-slate-700 rounded-t-2xl absolute -bottom-1" />
            </div>
          </div>
          {/* Online badge */}
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
        </div>

        {/* Username */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-rajdhani text-white drop-shadow-sm">
          {user.username}
        </h2>
        <span className="text-xs text-cyan-200/90 font-mono mt-0.5">UID: {user.freeFireUid || 'Not set'}</span>

        {/* 3-Column Stats Row matching Screenshot 6 */}
        <div className="w-full max-w-sm grid grid-cols-3 items-center text-center mt-5 pt-3 border-t border-white/20">
          {/* Matches Joined */}
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-orbitron leading-none text-white">
              {user.matchesJoined}
            </span>
            <span className="text-[11px] font-bengali text-cyan-100 font-medium mt-1 leading-tight">
              ম্যাচ জয়েন করেছেন
            </span>
          </div>

          {/* Total Balance / BDT 0 */}
          <div className="flex flex-col items-center border-x border-white/20 px-1">
            <span className="text-xl sm:text-2xl font-black font-rajdhani leading-none text-white tracking-wide">
              BDT {user.balance}
            </span>
            <span className="text-[10px] font-rajdhani uppercase tracking-wider text-cyan-200 font-semibold mt-1">
              Main Wallet
            </span>
          </div>

          {/* Total Won */}
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-orbitron leading-none text-white">
              {user.totalWon}
            </span>
            <span className="text-[11px] font-bengali text-cyan-100 font-medium mt-1 leading-tight">
              এখন পর্যন্ত জিতেছেন
            </span>
          </div>
        </div>
      </div>

      {/* Menu List Options matching Screenshot 6 */}
      <div className="max-w-md mx-auto divide-y divide-slate-100 px-2 mt-2">
        {/* 1. Wallet */}
        <button
          id="profile-menu-wallet"
          onClick={onOpenWallet}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-blue-600 transition">
              Wallet
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
              Deposit
            </span>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 2. Withdraw */}
        <button
          id="profile-menu-withdraw"
          onClick={onOpenWithdraw}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Banknote className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-sky-600 transition">
              Withdraw
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-xs text-slate-400 font-mono">bKash/Nagad</span>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* 3. My Profile */}
        <button
          id="profile-menu-edit-profile"
          onClick={onOpenEditProfile}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-blue-600 transition">
              My Profile
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 4. All Rules */}
        <button
          id="profile-menu-rules"
          onClick={onOpenRules}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpenCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-teal-600 transition">
              All Rules
            </span>
          </div>
          {/* Arrow shown explicitly in Screenshot 6 */}
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 5. Top Players */}
        <button
          id="profile-menu-top-players"
          onClick={onOpenTopPlayers}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-indigo-600 transition">
              Top Players
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 6. Landing Page & Download Website */}
        {onOpenLanding && (
          <button
            id="profile-menu-landing-page"
            onClick={onOpenLanding}
            className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-purple-50/50 transition cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-purple-600 transition block leading-tight">
                  Download Page (Landing)
                </span>
                <span className="text-[11px] text-purple-600 font-bengali">অফিসিয়াল ডাউনলোড ও ল্যান্ডিং পেজ</span>
              </div>
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full font-rajdhani">
              WEB
            </span>
          </button>
        )}

        {/* 7. Install App on Phone */}
        {onOpenInstall && (
          <button
            id="profile-menu-install-app"
            onClick={onOpenInstall}
            className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-emerald-50/50 transition cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Download className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-emerald-600 transition block leading-tight">
                  Install App
                </span>
                <span className="text-[11px] text-emerald-600 font-bengali">ফোনে ইনস্টল করুন (PWA/APK)</span>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-rajdhani">
              FREE
            </span>
          </button>
        )}

        {/* 7. Owner Admin Panel */}
        {onOpenAdmin && (
          <button
            id="profile-menu-admin-panel"
            onClick={onOpenAdmin}
            className="w-full py-3.5 px-4 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer group border-y border-amber-500/20"
          >
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold font-rajdhani text-amber-700 group-hover:text-amber-800 transition block leading-tight">
                  Owner Admin Panel
                </span>
                <span className="text-[11px] text-amber-600 font-bengali font-semibold">মালিকানা ও রুম কন্ট্রোল প্যানেল</span>
              </div>
            </div>
            <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
              ADMIN
            </span>
          </button>
        )}

        {/* 8. Developer Profile */}
        <button
          id="profile-menu-developer"
          onClick={onOpenDeveloper}
          className="w-full py-3.5 px-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold font-rajdhani text-slate-800 group-hover:text-blue-600 transition">
              Developer Profile
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Logout Button matching Screenshot 6 */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <button
          id="profile-logout-button"
          onClick={onLogout}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#38bdf8] via-[#0284c7] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white font-cursive text-xl font-semibold shadow-md active:scale-98 transition duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
