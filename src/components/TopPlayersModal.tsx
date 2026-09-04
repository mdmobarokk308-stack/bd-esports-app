import React, { useState } from 'react';
import { ArrowLeft, User as UserIcon, Crown } from 'lucide-react';
import { User, Match } from '../types';
import { LEADERBOARD_DATA } from '../data/mockData';

interface TopPlayersModalProps {
  user?: User;
  matches?: Match[];
  onClose: () => void;
}

export const TopPlayersModal: React.FC<TopPlayersModalProps> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Retrieve top players for active tab
  const rawList = LEADERBOARD_DATA[activeTab] || [];

  // Integrate logged in user if user has won amount or matches
  let currentList = [...rawList];
  if (user && user.totalWon > 0) {
    const userExists = currentList.some(
      (p) => p.username.toLowerCase() === user.username.toLowerCase()
    );

    if (!userExists) {
      currentList.push({
        rank: currentList.length + 1,
        username: user.username,
        ign: user.freeFireIgn || user.username,
        totalEarnings: user.totalWon,
        matchesWon: Math.max(1, Math.floor(user.matchesJoined / 2)),
        kills: user.matchesJoined * 2,
        avatar: user.avatar,
      });

      // Sort by total earnings descending
      currentList.sort((a, b) => b.totalEarnings - a.totalEarnings);

      // Re-assign ranks 1..N
      currentList = currentList.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    }
  }

  // Top 3 Podium
  const rank1 = currentList.find((p) => p.rank === 1) || currentList[0];
  const rank2 = currentList.find((p) => p.rank === 2) || currentList[1];
  const rank3 = currentList.find((p) => p.rank === 3) || currentList[2];

  // Ranks 4+
  const rankList = currentList.filter((p) => p.rank > 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 font-sans">
      {/* Top Header matching reference video */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-10">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-800 hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span className="font-extrabold text-xl text-slate-900 font-['Rajdhani',sans-serif]">Leaderboard</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full pb-10">
        {/* Period Pills Switcher (Daily | Weekly | Monthly) matching video */}
        <div className="bg-slate-200/80 p-1.5 rounded-2xl grid grid-cols-3 gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-3 rounded-xl font-bold text-sm text-center transition cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-slate-950 text-white shadow-md font-extrabold scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`py-2 px-3 rounded-xl font-bold text-sm text-center transition cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-slate-950 text-white shadow-md font-extrabold scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`py-2 px-3 rounded-xl font-bold text-sm text-center transition cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-slate-950 text-white shadow-md font-extrabold scale-102'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Top 3 Podium Section matching Screenshot / Video */}
        <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
          {/* Rank #2 (Left Column) */}
          {rank2 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 text-center shadow-xs flex flex-col items-center justify-between min-h-[160px] relative">
              <span className="text-amber-500 font-extrabold text-xs mb-1 block font-mono">#2</span>

              {/* Avatar in yellow ring */}
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 shadow-sm my-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {rank2.avatar ? (
                    <img src={rank2.avatar} alt={rank2.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </div>

              <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85px] block font-mono">
                {rank2.username}
              </span>

              <span className="font-black text-amber-500 text-sm mt-0.5 font-['Rajdhani',sans-serif]">
                {rank2.totalEarnings} TK
              </span>

              <span className="text-[10px] text-slate-400 font-bold block">
                {rank2.kills > 0 ? `${rank2.kills} kills` : `${rank2.matchesWon} wins`}
              </span>
            </div>
          )}

          {/* Rank #1 Center Elevated Gold Podium */}
          {rank1 && (
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-3 text-center shadow-md flex flex-col items-center justify-between min-h-[185px] relative -mt-3 transform scale-105">
              <div className="flex items-center justify-center gap-0.5 text-amber-500 font-black text-sm mb-0.5 font-mono">
                <Crown className="w-4 h-4 fill-amber-400 stroke-amber-600" />
                <span>#1</span>
              </div>

              {/* Avatar in bright gold yellow ring */}
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 shadow-md my-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {rank1.avatar ? (
                    <img src={rank1.avatar} alt={rank1.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-7 h-7 text-slate-400" />
                  )}
                </div>
              </div>

              <span className="font-black text-slate-900 text-xs truncate max-w-[95px] block font-mono">
                {rank1.username}
              </span>

              <span className="font-black text-amber-500 text-base mt-0.5 font-['Rajdhani',sans-serif]">
                {rank1.totalEarnings} TK
              </span>

              <span className="text-[10px] text-slate-400 font-bold block">
                {rank1.kills > 0 ? `${rank1.kills} kills` : `${rank1.matchesWon} wins`}
              </span>
            </div>
          )}

          {/* Rank #3 (Right Column) */}
          {rank3 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 text-center shadow-xs flex flex-col items-center justify-between min-h-[160px] relative">
              <span className="text-amber-600 font-extrabold text-xs mb-1 block font-mono">#3</span>

              {/* Avatar in yellow ring */}
              <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 shadow-sm my-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {rank3.avatar ? (
                    <img src={rank3.avatar} alt={rank3.username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </div>

              <span className="font-extrabold text-slate-900 text-xs truncate max-w-[85px] block font-mono">
                {rank3.username}
              </span>

              <span className="font-black text-amber-500 text-sm mt-0.5 font-['Rajdhani',sans-serif]">
                {rank3.totalEarnings} TK
              </span>

              <span className="text-[10px] text-slate-400 font-bold block">
                {rank3.kills > 0 ? `${rank3.kills} kills` : `${rank3.matchesWon} wins`}
              </span>
            </div>
          )}
        </div>

        {/* Ranks 4+ List Table */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2">
          {/* Table Header Row matching video */}
          <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2 px-1">
            <span className="col-span-2">Rank</span>
            <span className="col-span-7">Player</span>
            <span className="col-span-3 text-right">Won</span>
          </div>

          {/* Table List Rows */}
          <div className="space-y-1.5 divide-y divide-slate-50">
            {rankList.map((player) => (
              <div key={player.rank} className="grid grid-cols-12 gap-2 items-center pt-1.5 pb-1 px-1 text-xs">
                {/* Rank Number */}
                <div className="col-span-2 font-black text-slate-700 font-mono text-sm pl-1">
                  {player.rank}
                </div>

                {/* Player Profile & Name & Subtitle */}
                <div className="col-span-7 flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-amber-300 shrink-0">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-800 font-bold text-xs">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="truncate min-w-0">
                    <span className="font-extrabold text-slate-900 text-xs block truncate font-mono">
                      {player.username}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {player.kills} kills | {player.matchesWon} matches
                    </span>
                  </div>
                </div>

                {/* Won Amount in Bright Yellow/Gold font */}
                <div className="col-span-3 text-right font-black text-amber-500 text-sm font-['Rajdhani',sans-serif] pr-1">
                  {player.totalEarnings} TK
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
