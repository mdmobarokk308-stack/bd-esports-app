import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, Swords, Key, Trophy } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'RESULTS'>('MATCHES');
  const [expandedRoomDetails, setExpandedRoomDetails] = useState<{ [key: string]: boolean }>({});
  const [expandedPrizeDetails, setExpandedPrizeDetails] = useState<{ [key: string]: boolean }>({});

  const categoryInfo = MATCH_CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    title: 'Lone Wolf',
    subtitle: 'Tournament Matches',
    matchCount: matches.length,
    image: '',
  };

  const categoryMatches = matches.filter((m) => m.category === categoryId);

  const toggleRoomDetails = (matchId: string) => {
    setExpandedRoomDetails((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const togglePrizeDetails = (matchId: string) => {
    setExpandedPrizeDetails((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  // Determine display title (e.g., Lone Wolf, BR MATCH, CS 2 VS 2)
  const displayTitle = categoryId === 'lone_wolf' 
    ? 'Lone Wolf' 
    : categoryId === 'br_match' 
    ? 'BR MATCH' 
    : categoryId === 'cs_2v2' 
    ? 'CS 2 VS 2' 
    : categoryId === 'clash_squad' 
    ? 'Clash Squad'
    : categoryInfo.title;

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen pb-16 text-slate-900 select-none">
      {/* Top Header Bar matching Screenshot exactly */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="p-1 -ml-2 rounded-full hover:bg-slate-100 text-slate-900 transition cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] tracking-tight">
          {displayTitle}
        </h1>

        <button
          onClick={() => window.location.reload()}
          className="p-1 -mr-2 rounded-full hover:bg-slate-100 text-cyan-500 transition cursor-pointer"
          title="Refresh matches"
        >
          <RotateCcw className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Match Cards List */}
      <div className="p-3.5 space-y-4 max-w-md mx-auto">
        {categoryMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 shadow-sm mt-4">
            <Swords className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-cursive text-xl text-slate-700">No matches found in this category</p>
            <p className="text-xs text-slate-400 mt-1">Check back later or view upcoming tournaments!</p>
          </div>
        ) : (
          categoryMatches.map((match, idx) => {
            const isUserJoined = match.joinedPlayers.some((p) => p.username === user.username);
            const joinedCount = match.joinedPlayers.length;
            const isFull = joinedCount >= match.totalSlots;
            const progressPercent = Math.min(100, Math.round((joinedCount / match.totalSlots) * 100));

            // Default thumbnail matching the user's screenshot
            const matchThumbnail =
              match.category === 'lone_wolf'
                ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                <div className="p-4">
                  {/* Top: Thumbnail + Cursive Title + Red Date & Time */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-20 h-14 rounded-md overflow-hidden shrink-0 border border-slate-200 bg-slate-900 shadow-xs">
                      <img
                        src={matchThumbnail}
                        alt="Free Fire"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Cursive Stylish Match Title */}
                      <h2 className="font-cursive text-lg sm:text-xl font-bold text-slate-800 leading-snug tracking-wide">
                        {match.title || 'Lone Wolf 2 VS 2'}
                      </h2>
                      {/* Red Schedule Time */}
                      <p className="text-sm font-semibold text-[#dc2626] font-['Rajdhani',sans-serif] mt-0.5 tracking-tight">
                        {match.scheduleTime || '2026-08-26 at 11:00 pm'}
                      </p>
                    </div>
                  </div>

                  {/* 3x2 Grid Specs with Distinct Typography matching screenshot */}
                  <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center mt-5">
                    {/* WIN PRIZE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        WIN PRIZE
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.winPrize} TK
                      </span>
                    </div>

                    {/* ENTRY TYPE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        ENTRY TYPE
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.entryType}
                      </span>
                    </div>

                    {/* ENTRY FEE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        ENTRY FEE
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.entryFee === 0 ? 'FREE' : `${match.entryFee} TK`}
                      </span>
                    </div>

                    {/* PER KILL */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        PER KILL
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.perKill} TK
                      </span>
                    </div>

                    {/* MAP */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        MAP
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.map}
                      </span>
                    </div>

                    {/* VERSION */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        VERSION
                      </span>
                      <span className="font-cursive text-lg sm:text-xl font-bold text-slate-900">
                        {match.version}
                      </span>
                    </div>
                  </div>

                  {/* Spots Bar & Match Full / Join Button Row */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      {/* Green Progress Bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10b981] rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {match.totalSlots - joinedCount === 0
                            ? 'Only 0 spots are left'
                            : `Only ${match.totalSlots - joinedCount} spots are left`}
                        </span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          {joinedCount}/{match.totalSlots}
                        </span>
                      </div>
                    </div>

                    {/* Action Button: Match Full vs Join vs Room ID */}
                    <div className="shrink-0">
                      {isUserJoined ? (
                        <button
                          onClick={() => onViewRoomDetails(match)}
                          className="px-4 py-2 border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold font-['Rajdhani',sans-serif] text-sm rounded-lg transition cursor-pointer shadow-xs"
                        >
                          View Room
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="px-4 py-2 border-2 border-[#1e3a8a] bg-white text-[#1e3a8a] font-bold font-['Rajdhani',sans-serif] text-sm rounded-lg cursor-not-allowed shadow-xs"
                        >
                          Match Full
                        </button>
                      ) : (
                        <button
                          onClick={() => onJoinMatch(match)}
                          className="px-5 py-2 border-2 border-[#1e3a8a] bg-white hover:bg-[#1e3a8a] hover:text-white text-[#1e3a8a] font-bold font-['Rajdhani',sans-serif] text-sm rounded-lg transition cursor-pointer shadow-xs"
                        >
                          Join Match
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Options Row: Room Details & Total Prize Details */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRoomDetails(match.id)}
                      className="py-1.5 px-3 border border-[#2563eb] rounded-md text-[#2563eb] font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Room Details</span>
                      <span className="text-[10px] ml-0.5">▾</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePrizeDetails(match.id)}
                      className="py-1.5 px-3 border border-[#2563eb] rounded-md text-[#2563eb] font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Total Prize Details</span>
                      <span className="text-[10px] ml-0.5">▾</span>
                    </button>
                  </div>

                  {/* Expandable Room Details Box */}
                  {expandedRoomDetails[match.id] && (
                    <div className="mt-2.5 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
                      {isUserJoined ? (
                        <div>
                          <p className="font-bold text-blue-900">
                            🔑 ROOM ID: <span className="font-mono text-sm text-emerald-700">{match.roomId || 'Waiting for Admin...'}</span>
                          </p>
                          <p className="font-bold text-blue-900">
                            🔒 PASSWORD: <span className="font-mono text-sm text-emerald-700">{match.roomPass || 'Waiting...'}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-600 font-medium">
                          ⚠️ রুম আইডি ও পাসওয়ার্ড দেখতে হলে আগে ম্যাচে জয়েন (Join) করতে হবে।
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expandable Prize Details Box */}
                  {expandedPrizeDetails[match.id] && (
                    <div className="mt-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 animate-in fade-in duration-150">
                      <p className="font-bold text-amber-900">🏆 1st Place (Winner): {match.winPrize} TK</p>
                      {match.perKill > 0 && (
                        <p className="text-amber-800 font-medium">🎯 Per Kill Prize: {match.perKill} TK per kill</p>
                      )}
                      <p className="text-[10px] text-slate-500">ম্যাচ শেষে রেজাল্ট অনুযায়ী স্বয়ংক্রিয়ভাবে ওয়ালেটে টাকা যোগ হবে।</p>
                    </div>
                  )}

                  {/* Green Bottom Banner matching Screenshot: STARTS IN - Match Started */}
                  <div className="mt-3 bg-[#2e7d32] text-white py-2 px-3 rounded-lg text-center font-bold text-sm tracking-wide shadow-xs flex items-center justify-center gap-1.5">
                    <span className="font-cursive text-sm">⏰ STARTS IN - </span>
                    <span className="font-sans font-extrabold text-white">
                      {idx === 0 ? 'Match Started' : '04m:13s'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Floating Toast Notification matching Screenshot: No More Matches to load */}
        <div className="py-2 flex justify-center">
          <div className="bg-slate-700/90 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-600 text-xs font-cursive flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-600 text-[8px] font-bold flex items-center justify-center">
              FF
            </span>
            <span className="text-sm tracking-wide">No More Matches to load</span>
          </div>
        </div>
      </div>
    </div>
  );
};
