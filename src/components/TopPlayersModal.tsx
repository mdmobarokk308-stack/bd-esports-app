import React from 'react';
import { X, TrendingUp, Trophy, Medal, Flame } from 'lucide-react';
import { TOP_PLAYERS } from '../data/mockData';

interface TopPlayersModalProps {
  onClose: () => void;
}

export const TopPlayersModal: React.FC<TopPlayersModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">TOP PLAYERS</h3>
              <p className="text-xs text-amber-300 font-rajdhani">Highest Earners & Fraggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Podium for top 3 */}
        <div className="bg-slate-900 text-white px-4 py-4 grid grid-cols-3 gap-2 text-center items-end border-b border-slate-800">
          {/* #2 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-slate-300 overflow-hidden mb-1">
              <img src={TOP_PLAYERS[1].avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] bg-slate-400 text-slate-900 font-black px-2 py-0.5 rounded-full font-orbitron">
              #2
            </span>
            <span className="text-xs font-bold font-mono mt-1 truncate max-w-[80px]">
              {TOP_PLAYERS[1].ign}
            </span>
            <span className="text-[11px] text-amber-300 font-mono font-bold">
              ৳{TOP_PLAYERS[1].totalEarnings}
            </span>
          </div>

          {/* #1 Winner */}
          <div className="flex flex-col items-center -mt-2">
            <div className="relative mb-1">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <img src={TOP_PLAYERS[0].avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
            </div>
            <span className="text-xs bg-amber-400 text-slate-900 font-black px-2.5 py-0.5 rounded-full font-orbitron">
              #1 CHAMP
            </span>
            <span className="text-sm font-bold font-mono mt-1 text-yellow-300 truncate max-w-[100px]">
              {TOP_PLAYERS[0].ign}
            </span>
            <span className="text-xs text-amber-400 font-mono font-extrabold">
              ৳{TOP_PLAYERS[0].totalEarnings}
            </span>
          </div>

          {/* #3 */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-amber-700 overflow-hidden mb-1">
              <img src={TOP_PLAYERS[2].avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] bg-amber-700 text-white font-black px-2 py-0.5 rounded-full font-orbitron">
              #3
            </span>
            <span className="text-xs font-bold font-mono mt-1 truncate max-w-[80px]">
              {TOP_PLAYERS[2].ign}
            </span>
            <span className="text-[11px] text-amber-300 font-mono font-bold">
              ৳{TOP_PLAYERS[2].totalEarnings}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {TOP_PLAYERS.map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center font-mono">
                  {player.rank}
                </span>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                  <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-mono">{player.ign}</h4>
                  <span className="text-[10px] text-slate-500">
                    {player.matchesWon} Wins • {player.kills} Kills
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-extrabold text-emerald-700 text-sm block">
                  ৳{player.totalEarnings}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-rajdhani">Total Earned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
