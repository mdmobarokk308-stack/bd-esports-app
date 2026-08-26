import React, { useState } from 'react';
import { ChevronLeft, Trophy, Swords, Users, Clock, Flame, ShieldAlert, Sparkles, MapPin, Smartphone } from 'lucide-react';
import { Match, MatchCategoryKey, User } from '../types';
import { MATCH_CATEGORIES } from '../data/mockData';

interface MatchListScreenProps {
  categoryId: MatchCategoryKey;
  matches: Match[];
  user: User;
  onBack: () => void;
  onJoinMatch: (match: Match) => void;
  onViewRoomDetails: (match: Match) => void;
}

export const MatchListScreen: React.FC<MatchListScreenProps> = ({
  categoryId,
  matches,
  user,
  onBack,
  onJoinMatch,
  onViewRoomDetails,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'Solo' | 'Duo' | 'Squad'>('ALL');

  const categoryInfo = MATCH_CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    title: 'FREE FIRE',
    subtitle: 'Tournament Matches',
    matchCount: matches.length,
    image: '',
  };

  const categoryMatches = matches.filter((m) => m.category === categoryId);

  const filteredMatches = categoryMatches.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.entryType === filterType;
  });

  return (
    <div className="w-full bg-[#f8fafc] min-h-full pb-10 text-slate-800">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-3 py-3 shadow-xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1 font-bold text-sm"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="font-orbitron font-extrabold text-base tracking-wider text-slate-900 uppercase">
              {categoryInfo.title}
            </h1>
            <p className="text-[11px] text-slate-500 font-rajdhani font-semibold">
              {categoryMatches.length} Matches Available
            </p>
          </div>

          {/* User Wallet Badge */}
          <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-emerald-700 font-bold text-xs font-mono">
            ৳{user.balance}
          </div>
        </div>
      </div>

      {/* Filter Tabs (Solo / Duo / Squad) */}
      <div className="px-3 py-2.5 flex items-center justify-center gap-2 max-w-md mx-auto">
        {(['ALL', 'Solo', 'Duo', 'Squad'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-rajdhani uppercase tracking-wider transition cursor-pointer ${
              filterType === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Match Cards List */}
      <div className="px-3 space-y-4 max-w-md mx-auto mt-1">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <Swords className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-cursive text-lg">No matches currently in this category</p>
            <p className="text-xs text-slate-400 mt-1">Check other categories or upcoming tournament times!</p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isUserJoined = match.joinedPlayers.some((p) => p.username === user.username);
            const joinedCount = match.joinedPlayers.length;
            const isFull = joinedCount >= match.totalSlots;
            const progressPercent = Math.min(100, Math.round((joinedCount / match.totalSlots) * 100));

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="bg-white rounded-2xl border border-slate-300/80 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-4">
                  {/* Top Match Header: Image Thumbnail + Title + Red Time matching Screenshot 5 */}
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 relative">
                      <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=160&auto=format&fit=crop&q=80"
                        alt="Free Fire"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-0.5">
                        <span className="text-[7px] text-white font-orbitron font-bold uppercase">
                          MATCH #{match.id.replace('m-', '')}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-cursive text-base sm:text-lg font-semibold text-slate-900 leading-tight truncate">
                        {match.title}
                      </h3>
                      {/* Red date text matching Screenshot 5 */}
                      <p className="text-sm font-rajdhani font-bold text-[#ef4444] mt-0.5 tracking-tight">
                        {match.scheduleTime}
                      </p>
                    </div>
                  </div>

                  {/* 3x2 Grid Specs matching Screenshot 5 */}
                  <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-center mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        WIN PRIZE
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-slate-900">
                        {match.winPrize} TK
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        ENTRY TYPE
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-slate-900">
                        {match.entryType}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        ENTRY FEE
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-emerald-600">
                        {match.entryFee === 0 ? 'FREE' : `${match.entryFee} TK`}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        PER KILL
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-slate-900">
                        {match.perKill} TK
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        MAP
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-slate-900">
                        {match.map}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        VERSION
                      </span>
                      <span className="font-cursive text-base sm:text-lg font-bold text-slate-900">
                        {match.version}
                      </span>
                    </div>
                  </div>

                  {/* Slot Progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-600 font-rajdhani">
                        Spots Filled: <span className="text-slate-900 font-mono">{joinedCount}</span>/{match.totalSlots}
                      </span>
                      <span className="text-slate-500 font-rajdhani">
                        {match.totalSlots - joinedCount} Left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progressPercent > 80
                            ? 'bg-red-500'
                            : progressPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Join / Room Details Action Button */}
                  <div className="mt-4 pt-2 flex items-center gap-2">
                    {isUserJoined ? (
                      <button
                        id={`view-room-${match.id}`}
                        onClick={() => onViewRoomDetails(match)}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold font-orbitron tracking-wider text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition"
                      >
                        <span>🔑 ROOM ID & PASSWORD (JOINED)</span>
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-200 text-slate-500 font-bold font-orbitron tracking-wider text-xs rounded-xl cursor-not-allowed"
                      >
                        ROOM FULL ({match.totalSlots}/{match.totalSlots})
                      </button>
                    ) : (
                      <button
                        id={`join-match-btn-${match.id}`}
                        onClick={() => onJoinMatch(match)}
                        className="w-full py-2.5 bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#06b6d4] hover:from-[#7c3aed] hover:via-[#3b82f6] hover:to-[#22d3ee] text-white font-bold font-orbitron tracking-wider text-xs rounded-xl shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 transition"
                      >
                        <Swords className="w-4 h-4" />
                        <span>JOIN NOW • {match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
