import React from 'react';
import { X } from 'lucide-react';
import { Match } from '../types';

interface PrizePoolModalProps {
  match: Match;
  onClose: () => void;
}

export const PrizePoolModal: React.FC<PrizePoolModalProps> = ({ match, onClose }) => {
  // Winner prize breakdown
  const winnerPrize = match.winPrize || 0;
  const isTeam = match.entryType === 'Duo' || match.entryType === 'Squad' || match.title.includes('2vs2') || match.title.includes('2 VS 2');
  
  // Winner split per player or total
  const winnerText = isTeam && match.winPrize >= 100
    ? `Winner - ${Math.round(winnerPrize / 2)} Taka`
    : `Winner - ${winnerPrize} Taka`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Round White Close Button matching Screenshot 1 */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl mb-3 hover:scale-110 active:scale-95 transition cursor-pointer border border-slate-200"
          title="Close"
        >
          <X className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Modal Card with Yellow Top & White Bottom matching Screenshot 1 */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          {/* Top Bright Yellow Section */}
          <div className="bg-[#facc15] px-6 py-5 text-center text-slate-950">
            <h3 className="text-2xl sm:text-3xl font-black font-['Rajdhani',sans-serif] tracking-wider uppercase leading-none text-slate-950">
              TOTAL WINPRIZE
            </h3>
            <p className="text-sm font-extrabold font-['Rajdhani',sans-serif] text-slate-800 mt-1.5 opacity-90 truncate">
              {match.title} | {match.version || 'Mobile'} |
            </p>
          </div>

          {/* Bottom Clean White Section */}
          <div className="bg-white px-6 py-6 text-center space-y-3.5">
            {/* Winner Row with Crown Icon */}
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif]">
              <span className="text-2xl">👑</span>
              <span>{winnerText}</span>
            </div>

            {/* Per Kill row if per kill > 0 */}
            {match.perKill > 0 && (
              <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold text-emerald-700 font-['Rajdhani',sans-serif]">
                <span className="text-xl">🎯</span>
                <span>Per Kill: {match.perKill} Taka</span>
              </div>
            )}

            {/* Total Prize Pool Row with Trophy Icon */}
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-slate-700 font-['Rajdhani',sans-serif]">
              <span className="text-2xl">🏆</span>
              <span>Total Prize Pool: {match.winPrize} Taka</span>
            </div>

            {/* Sub-note */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-bengali">
                ম্যাচ শেষে আপনার প্লেসমেন্ট ও কিল অনুযায়ী স্বয়ংক্রিয়ভাবে ওয়ালেটে টাকা যোগ হবে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
