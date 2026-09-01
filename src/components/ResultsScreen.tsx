import React, { useState } from 'react';
import { Trophy, Swords, Youtube, Eye, Medal, Flame, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Match } from '../types';
import { getTournamentImage } from '../data/categoryImages';

interface ResultsScreenProps {
  matches: Match[];
  onOpenLiveStream?: (url: string) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ matches, onOpenLiveStream }) => {
  const [selectedFilter, setSelectedFilter] = useState<'FF FULLMAP' | 'FF Clash Squad' | 'Lone Wolf' | 'Free Match'>('FF FULLMAP');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>('m-901');

  const filterTabs = [
    'FF FULLMAP',
    'FF Clash Squad',
    'Lone Wolf',
    'Free Match',
  ] as const;

  // Filter matches based on category label or tab
  const filteredMatches = matches.filter((m) => {
    if (selectedFilter === 'FF FULLMAP') {
      return m.category === 'br_match' || m.category === 'br_survival' || m.categoryLabel === 'FF FULLMAP';
    }
    if (selectedFilter === 'FF Clash Squad') {
      return m.category === 'clash_squad' || m.category === 'cs_2v2' || m.categoryLabel === 'FF Clash Squad';
    }
    if (selectedFilter === 'Lone Wolf') {
      return m.category === 'lone_wolf' || m.categoryLabel === 'Lone Wolf';
    }
    if (selectedFilter === 'Free Match') {
      return m.category === 'free_match' || m.categoryLabel === 'Free Match';
    }
    return true;
  });

  return (
    <div className="w-full bg-[#f8fafc] min-h-full pb-8 text-slate-800">
      {/* Top Header "Result" matching Screenshot 5 */}
      <div className="text-center pt-5 pb-3">
        <h1 className="text-3xl font-extrabold uppercase font-rajdhani tracking-wide text-slate-900">
          Result
        </h1>
      </div>

      {/* Filter Category Pills matching Screenshot 5 */}
      <div className="px-3 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              id={`filter-tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-rajdhani font-bold tracking-wide whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isActive
                  ? 'bg-[#fcd34d] border-amber-400 text-slate-900 font-extrabold shadow-xs'
                  : 'bg-white border-slate-300/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Match Cards List matching Screenshot 5 */}
      <div className="px-3 space-y-4 max-w-md mx-auto">
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-rajdhani font-bold text-lg">No results found for this category yet</p>
            <p className="text-xs text-slate-400 mt-1">Check back once today's matches conclude!</p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            const hasResults = match.results && match.results.length > 0;

            return (
              <div
                key={match.id}
                id={`result-card-${match.id}`}
                className="bg-white rounded-2xl border border-slate-300/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Top Match Header: Image Thumbnail + Title + Red Time matching Screenshot 5 */}
                  <div className="flex items-start gap-3">
                    {/* Free fire mini thumbnail */}
                    <div className="w-20 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 relative">
                      <img
                        src={getTournamentImage(match.category)}
                        alt="Free Fire"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getTournamentImage('br_match');
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-0.5">
                        <span className="text-[7px] text-white font-orbitron font-bold uppercase">
                          FREE FIRE
                        </span>
                      </div>
                    </div>

                    {/* Title and Date */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-rajdhani text-base sm:text-lg font-black text-slate-900 leading-tight truncate uppercase">
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
                    {/* WIN PRIZE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        WIN PRIZE
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.winPrize} TK
                      </span>
                    </div>

                    {/* ENTRY TYPE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        ENTRY TYPE
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.entryType}
                      </span>
                    </div>

                    {/* ENTRY FEE */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        ENTRY FEE
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.entryFee === 0 ? 'Free' : match.entryFee}
                      </span>
                    </div>

                    {/* PER KILL */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        PER KILL
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.perKill}
                      </span>
                    </div>

                    {/* MAP */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        MAP
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.map}
                      </span>
                    </div>

                    {/* VERSION */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 font-rajdhani tracking-wider uppercase">
                        VERSION
                      </span>
                      <span className="font-rajdhani text-base sm:text-lg font-black text-slate-900">
                        {match.version}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Winner Breakdown Toggle */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {hasResults ? (
                      <button
                        onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                        className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-800 font-bold text-xs font-rajdhani flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isExpanded ? 'Hide Winners' : 'View Winners & Kills'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Results processing...</span>
                    )}

                    {match.youtubeLiveUrl && (
                      <a
                        href={match.youtubeLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-700 font-bold text-xs font-rajdhani flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span>Watch Replay</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Winner Breakdown Drawer */}
                {isExpanded && hasResults && (
                  <div className="bg-slate-50 border-t border-slate-200 p-3.5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-orbitron flex items-center gap-1.5">
                        <Medal className="w-4 h-4 text-amber-500" />
                        Match Leaderboard & Payouts
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {match.results?.map((res) => (
                        <div
                          key={res.rank}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                            res.rank === 1
                              ? 'bg-amber-100/80 border border-amber-300 font-bold'
                              : res.rank === 2
                              ? 'bg-slate-200/80 border border-slate-300 font-semibold'
                              : res.rank === 3
                              ? 'bg-orange-100/60 border border-orange-200'
                              : 'bg-white border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                res.rank === 1
                                  ? 'bg-amber-500 text-white'
                                  : res.rank === 2
                                  ? 'bg-slate-600 text-white'
                                  : res.rank === 3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-300 text-slate-700'
                              }`}
                            >
                              #{res.rank}
                            </span>
                            <span className="font-mono text-slate-900 font-bold">{res.ign}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              <span className="text-red-500 font-bold">{res.kills}</span> Kills
                            </span>
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                              +{res.prize} TK
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
