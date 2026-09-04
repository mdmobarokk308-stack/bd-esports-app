import React from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Match } from '../types';
import { TOURNAMENT_RULES, BANNED_ITEMS_NOTE } from '../data/mockData';

interface MatchDetailsPageModalProps {
  match: Match;
  userEmail?: string;
  onClose: () => void;
  onJoinMatch: (match: Match) => void;
  isUserJoined: boolean;
}

export const MatchDetailsPageModal: React.FC<MatchDetailsPageModalProps> = ({
  match,
  onClose,
  onJoinMatch,
  isUserJoined,
}) => {
  // Extract clean title (remove long rule text if admin accidentally pasted rules into title)
  let displayTitle = match.title || 'Free Fire Tournament Match';
  if (displayTitle.includes('যেই গান') || displayTitle.includes('Classic Match Rules') || displayTitle.length > 100) {
    const parts = displayTitle.split('\n');
    displayTitle = parts[0].substring(0, 80).replace(/\|.*/, '').trim() + ' | Regular রুমে ঢুকার পর কেউ আনরে-রেজিস্ট্রেশন/বাহিরের প্লেয়ার ইনভাইট করবেন না 🔥';
  }

  const joinedPlayers = Array.isArray(match.joinedPlayers) ? match.joinedPlayers : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Header matching reference video */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs sticky top-0 z-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-800 font-bold text-sm hover:text-slate-950 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span className="font-['Rajdhani',sans-serif] text-base font-black">Details Page</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full pb-20">
        {/* Match Main Title Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-bengali leading-snug">
            {displayTitle}
          </h2>
        </div>

        {/* Spec Pills Grid (6 Pills) */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Type</span>
            <span className="font-extrabold text-slate-800">{match.entryType || 'Solo'}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Version</span>
            <span className="font-extrabold text-slate-800">{match.version || 'TPP'}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Map</span>
            <span className="font-extrabold text-slate-800">{match.map || 'Bermuda'}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Match Type</span>
            <span className="font-extrabold text-slate-800">{match.entryFee === 0 ? 'Free' : 'Paid'}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Entry Fee</span>
            <span className="font-extrabold text-slate-800">{match.entryFee === 0 ? 'FREE' : `${match.entryFee} TK`}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 text-center shadow-2xs col-span-3 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Match Schedule</span>
            <span className="font-extrabold text-slate-800 text-[11px]">{match.scheduleTime || '2026-09-04 at 10:00 AM'}</span>
          </div>
        </div>

        {/* Room Credentials Box (If Joined) */}
        {isUserJoined && (
          <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-2 shadow-xs">
            <h3 className="font-orbitron font-bold text-xs text-emerald-900 uppercase flex items-center gap-1.5">
              <span>🔑</span> YOUR ROOM CREDENTIALS (রুম তথ্য)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block font-sans">ROOM ID</span>
                <span className="font-black text-slate-900 text-sm">{match.roomId || 'Waiting...'}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-slate-400 block font-sans">PASSWORD</span>
                <span className="font-black text-slate-900 text-sm">{match.roomPass || 'Waiting...'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Prize Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3 shadow-xs">
          <h3 className="font-orbitron font-bold text-sm text-slate-900">Prize Details</h3>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Winning Prize</span>
              <span className="font-black text-slate-900 text-base">{match.winPrize} TK</span>
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Per Kill</span>
              <span className="font-black text-slate-900 text-base">{match.perKill} TK</span>
            </div>
          </div>

          {/* Yellow Banner Box matching video */}
          <div className="bg-[#fef3c7] border border-[#f59e0b]/40 rounded-xl p-3 text-center">
            <p className="text-xs font-extrabold text-[#92400e] font-bengali">
              Room details will be shared before 5-10 minutes of match start time.
            </p>
          </div>
        </div>

        {/* Match Instructions and Rules Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3 shadow-xs font-bengali">
          <h3 className="font-orbitron font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Match Instructions and Rules
          </h3>

          {/* Gray Banned Weapons Box */}
          <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 text-xs space-y-1 text-slate-700 font-mono">
            <p className="italic text-slate-500 font-sans">{BANNED_ITEMS_NOTE.header}</p>
            <p className="font-bold text-slate-900 font-bengali">যেই গান গুলো চালানো যাবে না -</p>
            <p className="text-rose-700 font-bold bg-rose-50/80 p-1.5 rounded border border-rose-200 text-[11px]">
              {BANNED_ITEMS_NOTE.bannedGuns}
            </p>
            <p className="text-rose-700 font-bold bg-rose-50/80 p-1.5 rounded border border-rose-200 text-[11px]">
              {BANNED_ITEMS_NOTE.bannedCharacter}
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-800 font-bold leading-snug">
              সতর্কবার্তা: হ্যাকিং, স্ক্রিপ্ট বা এমুলেটর ব্যবহারকারীদের একাউন্ট সাথে সাথে ব্যান করা হয়।
            </p>
          </div>

          {/* 12 Standard Rules */}
          <div className="space-y-2 text-xs">
            {TOURNAMENT_RULES.map((rule, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5">
                <p className="font-bold text-slate-900 mb-0.5">{rule.title}</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Participants Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-orbitron font-bold text-sm text-slate-900">
              Registered Participants
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {joinedPlayers.length}/{match.totalSlots}
            </span>
          </div>

          {joinedPlayers.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 font-bengali">
              এখনো কোনো প্লেয়ার জয়েন করেনি। প্রথম প্লেয়ার হিসেবে জয়েন করুন!
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {joinedPlayers.map((player: any, idx: number) => {
                const playerName = typeof player === 'string' ? player : player?.gameName || player?.userName || player?.email || `Player ${idx + 1}`;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <span className="w-5 text-slate-400 font-mono text-center">{idx + 1}</span>
                    <span className="font-mono text-slate-900 truncate flex-1">{playerName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center justify-center shadow-lg z-20 max-w-lg mx-auto">
        {isUserJoined ? (
          <button
            type="button"
            disabled
            className="w-full py-3 bg-emerald-600 text-white font-extrabold font-['Rajdhani',sans-serif] rounded-xl text-sm shadow-md"
          >
            YOU ARE JOINED IN THIS MATCH ✅
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onJoinMatch(match)}
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-extrabold font-['Rajdhani',sans-serif] rounded-xl text-sm shadow-md transition active:scale-98 cursor-pointer"
          >
            JOIN MATCH NOW ({match.entryFee === 0 ? 'FREE' : `${match.entryFee} TK`})
          </button>
        )}
      </div>
    </div>
  );
};
