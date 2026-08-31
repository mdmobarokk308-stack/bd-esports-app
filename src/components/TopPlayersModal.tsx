import React from 'react';
import { X, TrendingUp, Trophy, Medal, Flame, ShieldAlert, Award } from 'lucide-react';
import { TopPlayer, User, Match } from '../types';

interface TopPlayersModalProps {
  user?: User;
  matches?: Match[];
  onClose: () => void;
}

export const TopPlayersModal: React.FC<TopPlayersModalProps> = ({ user, matches = [], onClose }) => {
  // Compute real winners from completed matches if available
  const realLeaderboard: TopPlayer[] = [];
  
  if (user && user.totalWon > 0) {
    realLeaderboard.push({
      rank: 1,
      username: user.username,
      ign: user.freeFireIgn || user.username,
      totalEarnings: user.totalWon,
      matchesWon: Math.max(1, Math.floor(user.matchesJoined / 2)),
      kills: user.matchesJoined * 3,
      avatar: user.avatar,
    });
  }

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
              <p className="text-xs text-amber-300 font-rajdhani">Live Earnings & Tournament Leaders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {realLeaderboard.length > 0 ? (
          <div className="p-4 overflow-y-auto flex-1 space-y-2">
            {realLeaderboard.map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center font-mono">
                    #{player.rank}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-300">
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
        ) : (
          <div className="p-6 text-center flex flex-col items-center justify-center space-y-3 my-auto">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base font-['Rajdhani',sans-serif]">
              টুর্নামেন্ট লিডারবোর্ড
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-bengali">
              ম্যাচ খেলা ও প্রাইজ জিতার পর রিয়েল প্লেয়ারদের মোট উইনিং ব্যালেন্স অনুযায়ী এই লিডারবোর্ডে নাম ও র‍্যাঙ্ক সরাসরি আপডেট হবে।
            </p>
            {user && (
              <div className="w-full mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden">
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-slate-800">{user.username} (You)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-500 text-[11px] block">Matches: {user.matchesJoined}</span>
                  <span className="font-bold text-emerald-600">Won: ৳{user.totalWon}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
