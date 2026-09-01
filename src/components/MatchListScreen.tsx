import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Swords, Key, Trophy, ArrowLeft } from 'lucide-react';
import { Match, MatchCategoryKey, User } from '../types';
import { MATCH_CATEGORIES } from '../data/mockData';
import { getTournamentImage } from '../data/categoryImages';
import { PrizePoolModal } from './PrizePoolModal';

interface MatchListScreenProps {
  categoryId: MatchCategoryKey;
  matches: Match[];
  user: User;
  onBack: () => void;
  onJoinMatch: (match: Match) => void;
  onViewRoomDetails: (match: Match) => void;
  onRefresh?: () => void;
}

export const MatchListScreen: React.FC<MatchListScreenProps> = ({
  categoryId,
  matches,
  user,
  onBack,
  onJoinMatch,
  onViewRoomDetails,
  onRefresh,
}) => {
  const [selectedPrizeMatch, setSelectedPrizeMatch] = useState<Match | null>(null);
  const [expandedRoomDetails, setExpandedRoomDetails] = useState<{ [key: string]: boolean }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Push history state to support hardware / Android back button
  useEffect(() => {
    window.history.pushState({ screen: 'match_list', categoryId }, '');

    const handlePopState = () => {
      onBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [categoryId, onBack]);

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

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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
    <div className="w-full bg-[#f1f5f9] min-h-screen pb-20 text-slate-900 select-none">
      {/* Top Header Bar matching Screenshot with prominent back action */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-3 py-2.5 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to tournaments"
          className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0 shadow-xs"
        >
          <ChevronLeft className="w-7 h-7 stroke-[3] text-slate-800" />
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] tracking-tight truncate px-2">
          {displayTitle}
        </h1>

        <button
          type="button"
          onClick={handleRefreshClick}
          className={`w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-cyan-600 flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0 shadow-xs ${isRefreshing ? 'animate-spin' : ''}`}
          title="Refresh matches"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Match Cards List */}
      <div className="p-3.5 space-y-4 max-w-md mx-auto">
        {categoryMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/90 text-slate-500 shadow-sm mt-4 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto mb-1">
              <Swords className="w-8 h-8 text-amber-500" />
            </div>
            <p className="font-black text-lg text-slate-800 font-['Rajdhani',sans-serif]">
              বর্তমানে কোনো ম্যাচ চালু নেই
            </p>
            <p className="text-xs text-slate-500 font-bengali leading-relaxed">
              এডমিন এই ক্যাটাগরিতে নতুন টুর্নামেন্ট বা ম্যাচ অ্যাড করলে সাথে সাথে এখানে দেখতে পাবেন।
            </p>

            {/* In-Card Direct Back Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-rajdhani text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>← টুর্নামেন্ট পেজে ফিরে যান (Back)</span>
              </button>
            </div>
          </div>
        ) : (
          categoryMatches.map((match, idx) => {
            const isUserJoined = match.joinedPlayers.some((p) => p.username === user.username);
            const joinedCount = match.joinedPlayers.length;
            const isFull = joinedCount >= match.totalSlots;
            const matchNumber = `#${match.id.replace(/[^0-9]/g, '') || String(64487 + idx)}`;

            // Default thumbnail matching Screenshot 1
            const matchThumbnail = getTournamentImage(match.category) || categoryInfo.image;

            return (
              <div
                key={match.id}
                id={`match-card-${match.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all relative"
              >
                {/* Top-Right Purple Badge (#64487) matching Screenshot 1 */}
                <div className="absolute top-0 right-0 bg-[#3b498f] text-white px-3.5 py-1 rounded-bl-2xl font-black font-['Rajdhani',sans-serif] text-sm tracking-wider shadow-xs">
                  {matchNumber}
                </div>

                <div className="p-4 pt-3.5">
                  {/* Top: Thumbnail + Title + Red Date & Time */}
                  <div className="flex items-start gap-3 pr-16">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900 shadow-xs">
                      <img
                        src={matchThumbnail}
                        alt="Free Fire"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = categoryInfo.image || getTournamentImage('br_match');
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Rajdhani',sans-serif] leading-tight tracking-tight uppercase">
                        {match.title}
                      </h2>
                      {/* Red Schedule Time */}
                      <p className="text-xs sm:text-sm font-bold text-[#e11d48] font-['Rajdhani',sans-serif] mt-1 tracking-tight">
                        {match.scheduleTime || '2026-08-26 at 11:59 PM'}
                      </p>
                    </div>
                  </div>

                  {/* 3 Rounded Boxes Row matching Screenshot 1: WIN PRIZE | PER KILL | ENTRY FEE */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    {/* WIN PRIZE */}
                    <div className="bg-[#f1f5f9] rounded-2xl p-2.5 flex flex-col justify-center items-center border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        WIN PRIZE
                      </span>
                      <span className="text-base font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                        {match.winPrize} TK
                      </span>
                    </div>

                    {/* PER KILL */}
                    <div className="bg-[#f1f5f9] rounded-2xl p-2.5 flex flex-col justify-center items-center border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        PER KILL
                      </span>
                      <span className="text-base font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                        {match.perKill} TK
                      </span>
                    </div>

                    {/* ENTRY FEE */}
                    <div className="bg-[#f1f5f9] rounded-2xl p-2.5 flex flex-col justify-center items-center border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-500 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                        ENTRY FEE
                      </span>
                      <span className="text-base font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                        {match.entryFee === 0 ? 'FREE' : `${match.entryFee} TK`}
                      </span>
                    </div>
                  </div>

                  {/* Subline: Solo (with orange bar) | Bermuda | MOBILE matching Screenshot 1 */}
                  <div className="flex items-center justify-around text-slate-500 text-xs font-bold font-['Rajdhani',sans-serif] mt-4 px-2 tracking-wider">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-800 font-extrabold">{match.entryType}</span>
                      <div className="w-12 h-1 bg-[#d97706] rounded-full mt-1"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-slate-600">{match.map}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-slate-600 uppercase">{match.version}</span>
                    </div>
                  </div>

                  {/* Spots Bar & Action Button matching Screenshot 1 */}
                  <div className="mt-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        Only {Math.max(0, match.totalSlots - joinedCount)} spots are left
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {joinedCount}/{match.totalSlots}
                      </span>
                    </div>

                    {/* Action Button: Match Full (Red-brown) vs Join (Blue) */}
                    <div>
                      {isUserJoined ? (
                        <button
                          onClick={() => onViewRoomDetails(match)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black font-['Rajdhani',sans-serif] text-sm rounded-full transition cursor-pointer shadow-xs"
                        >
                          Joined (Room)
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="px-5 py-2 bg-[#8b261a] text-white font-black font-['Rajdhani',sans-serif] text-sm rounded-2xl cursor-not-allowed shadow-xs opacity-95"
                        >
                          Match Full
                        </button>
                      ) : (
                        <button
                          onClick={() => onJoinMatch(match)}
                          className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-black font-['Rajdhani',sans-serif] text-sm rounded-2xl transition cursor-pointer shadow-xs"
                        >
                          Join Match
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Buttons Row: 🔑 Room Details & 🏆 Prize Pool matching Screenshot 1 */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleRoomDetails(match.id)}
                      className="py-2 px-3 bg-[#e2e8f0]/70 hover:bg-[#cbd5e1] border border-slate-300/80 rounded-2xl text-[#1e3a8a] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer font-['Rajdhani',sans-serif]"
                    >
                      <Key className="w-4 h-4 text-[#1e3a8a]" />
                      <span className="font-extrabold">Room Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPrizeMatch(match)}
                      className="py-2 px-3 bg-[#e2e8f0]/70 hover:bg-[#cbd5e1] border border-slate-300/80 rounded-2xl text-[#1e3a8a] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer font-['Rajdhani',sans-serif]"
                    >
                      <Trophy className="w-4 h-4 text-[#1e3a8a]" />
                      <span className="font-extrabold">Prize Pool</span>
                    </button>
                  </div>

                  {/* Expandable Room Details Box */}
                  {expandedRoomDetails[match.id] && (
                    <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-150">
                      {isUserJoined ? (
                        <div>
                          <p className="font-bold text-blue-900">
                            🔑 ROOM ID: <span className="font-mono text-sm text-emerald-700 font-black">{match.roomId || 'Waiting for Admin...'}</span>
                          </p>
                          <p className="font-bold text-blue-900">
                            🔒 PASSWORD: <span className="font-mono text-sm text-emerald-700 font-black">{match.roomPass || 'Waiting for Admin...'}</span>
                          </p>
                          <p className="text-[11px] text-blue-700 mt-1">ম্যাচ শুরুর ১০ মিনিট আগে পাসওয়ার্ড একটিভ হবে।</p>
                        </div>
                      ) : (
                        <p className="text-slate-700 font-medium font-bengali">
                          ⚠️ রুম আইডি ও পাসওয়ার্ড দেখতে হলে আগে ম্যাচে জয়েন (Join) করতে হবে।
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Green Banner: "Room Created Join Now" matching Screenshot 1 */}
                <div className="bg-[#2e7d32] text-white py-2.5 px-4 text-center font-black text-sm tracking-wide shadow-inner flex items-center justify-center gap-1.5 font-['Rajdhani',sans-serif]">
                  <span>{match.roomId ? 'Room Created Join Now' : `STARTS IN - ${match.scheduleTime || 'Soon'}`}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Toast Notice */}
        <div className="py-2 flex justify-center">
          <div className="bg-slate-700/90 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-600 text-xs flex items-center gap-2 font-['Rajdhani',sans-serif]">
            <span className="w-4 h-4 rounded-full bg-red-600 text-[8px] font-bold flex items-center justify-center">
              FF
            </span>
            <span className="text-sm font-bold tracking-wide">No More Matches to load</span>
          </div>
        </div>
      </div>

      {/* Prize Details Modal Popup matching Screenshot 1 */}
      {selectedPrizeMatch && (
        <PrizePoolModal
          match={selectedPrizeMatch}
          onClose={() => setSelectedPrizeMatch(null)}
        />
      )}
    </div>
  );
};
