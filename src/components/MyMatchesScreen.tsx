import React, { useState } from 'react';
import { Copy, Check, Swords, Key, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Match, User } from '../types';

interface MyMatchesScreenProps {
  matches: Match[];
  user: User;
  onBrowseMatches: () => void;
  onLeaveMatch?: (matchId: string) => void;
}

export const MyMatchesScreen: React.FC<MyMatchesScreenProps> = ({
  matches,
  user,
  onBrowseMatches,
  onLeaveMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter matches user has joined
  const myMatches = matches.filter(
    (m) =>
      m.joinedPlayers.some((p) => p.username === user.username) ||
      (m.results && m.results.some((r) => r.ign === user.freeFireIgn || r.uid === user.freeFireUid))
  );

  const upcomingMatches = myMatches.filter((m) => m.status !== 'completed');
  const completedMatches = myMatches.filter((m) => m.status === 'completed');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedList = activeTab === 'upcoming' ? upcomingMatches : completedMatches;

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pb-16 text-slate-800 select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="font-['Rajdhani',sans-serif] font-black text-xl text-slate-900 uppercase tracking-tight">
            My Matches
          </h1>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full font-mono">
            {myMatches.length} Joined
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3.5 pt-3 flex gap-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold font-['Rajdhani',sans-serif] uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Upcoming ({upcomingMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold font-['Rajdhani',sans-serif] uppercase tracking-wider transition cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Completed / Results ({completedMatches.length})
        </button>
      </div>

      {/* Content */}
      <div className="px-3.5 mt-3 space-y-4 max-w-md mx-auto">
        {displayedList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 mt-4 shadow-sm">
            <Swords className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-['Rajdhani',sans-serif] text-xl font-bold text-slate-700">
              No {activeTab} matches found
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Join a Free Fire tournament lobby to compete and win prizes!
            </p>
            <button
              onClick={onBrowseMatches}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl font-['Rajdhani',sans-serif] uppercase tracking-wider shadow-sm cursor-pointer"
            >
              Browse Tournaments
            </button>
          </div>
        ) : (
          displayedList.map((match) => {
            const userSlot = match.joinedPlayers.find((p) => p.username === user.username)?.slot || 1;
            const hasRoomId = Boolean(match.roomId && match.roomPass);

            return (
              <div
                key={match.id}
                id={`my-match-${match.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  {/* Top line with category & time */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] bg-slate-900 text-amber-300 font-black px-2.5 py-0.5 rounded font-['Rajdhani',sans-serif] uppercase">
                      {match.categoryLabel || 'Lone Wolf'}
                    </span>
                    <span className="text-sm font-bold text-red-600 font-['Rajdhani',sans-serif]">
                      {match.scheduleTime}
                    </span>
                  </div>

                  <h3 className="font-['Rajdhani',sans-serif] text-xl font-black text-slate-900 leading-tight">
                    {match.title}
                  </h3>

                  {/* Slot & Specs Row */}
                  <div className="grid grid-cols-4 gap-2 text-center my-3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif] uppercase font-bold">
                        My Slot
                      </span>
                      <span className="font-mono font-extrabold text-indigo-600 text-sm">#{userSlot}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif] uppercase font-bold">
                        Map
                      </span>
                      <span className="font-bold text-slate-800">{match.map}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif] uppercase font-bold">
                        Total Prize
                      </span>
                      <span className="font-bold text-emerald-600">৳{match.totalPrizePool && match.totalPrizePool > 0 ? match.totalPrizePool : match.winPrize}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif] uppercase font-bold">
                        Per Kill
                      </span>
                      <span className="font-bold text-slate-800">৳{match.perKill}</span>
                    </div>
                  </div>

                  {/* Cancel / Leave Match button if match has not completed */}
                  {match.status !== 'completed' && onLeaveMatch && (
                    <div className="mb-3">
                      <button
                        onClick={() => onLeaveMatch(match.id)}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs font-['Rajdhani',sans-serif] rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>ম্যাচ বাতিল করুন (বাতিল করলে ফি ফেরত পাবেন)</span>
                      </button>
                    </div>
                  )}

                  {/* Room Credentials Card */}
                  {hasRoomId ? (
                    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-xl p-3 text-white border border-indigo-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-bold font-['Rajdhani',sans-serif] uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5" /> CUSTOM ROOM DETAILS
                        </span>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40 font-mono">
                          LIVE NOW
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Room ID */}
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif]">
                              ROOM ID
                            </span>
                            <span className="font-mono font-bold text-base text-cyan-300">{match.roomId}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(match.roomId || '', `room-${match.id}`)}
                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                            title="Copy Room ID"
                          >
                            {copiedId === `room-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Room Password */}
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-['Rajdhani',sans-serif]">
                              PASSWORD
                            </span>
                            <span className="font-mono font-bold text-base text-amber-300">{match.roomPass}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(match.roomPass || '', `pass-${match.id}`)}
                            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedId === `pass-${match.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 font-bengali">
                        👉 ফ্রি ফায়ারে Custom Room অপশনে গিয়ে Room ID ও Password দিয়ে জয়েন করে আপনার নির্দিষ্ট{' '}
                        <span className="text-amber-300 font-bold">Slot #{userSlot}</span> এ বসুন।
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 font-bengali flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে এখানে অটো আপডেট হবে।</span>
                    </div>
                  )}

                  {/* Completed result check if available */}
                  {match.status === 'completed' && match.results && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 font-['Rajdhani',sans-serif] block mb-1">
                        🏁 MATCH RESULT:
                      </span>
                      <div className="space-y-1">
                        {match.results.map((res) => (
                          <div
                            key={res.rank}
                            className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-xs"
                          >
                            <span className="font-semibold text-slate-800">
                              #{res.rank} {res.ign}
                            </span>
                            <span className="font-mono font-bold text-emerald-600">
                              {res.kills} Kills (+৳{res.prize})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
