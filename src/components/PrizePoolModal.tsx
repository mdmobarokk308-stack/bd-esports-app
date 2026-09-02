import React from 'react';
import { X } from 'lucide-react';
import { Match, PositionPrize } from '../types';

interface PrizePoolModalProps {
  match: Match;
  onClose: () => void;
}

export const PrizePoolModal: React.FC<PrizePoolModalProps> = ({ match, onClose }) => {
  const isTeam =
    match.entryType === 'Duo' ||
    match.entryType === 'Squad' ||
    match.title.includes('2vs2') ||
    match.title.includes('2 VS 2');

  // Generate or read position prizes
  const positions: PositionPrize[] = React.useMemo(() => {
    if (match.customPositions && match.customPositions.length > 0) {
      return match.customPositions.filter((p) => p.prize > 0);
    }

    // Default Winner position
    const winnerAmount = match.winPrize || 0;
    const defaultList: PositionPrize[] = [
      {
        position: 1,
        label: isTeam && match.winPrize >= 100 ? 'Winner (Team)' : 'Winner',
        prize: winnerAmount,
      },
    ];

    return defaultList;
  }, [match.customPositions, match.winPrize, isTeam]);

  // Calculate Total Prize Pool
  const totalPrizePool = React.useMemo(() => {
    if (match.totalPrizePool && match.totalPrizePool > 0) {
      return match.totalPrizePool;
    }

    const positionSum = positions.reduce((acc, p) => acc + (Number(p.prize) || 0), 0);
    
    // If per kill exists, calculate potential total kills in a match (total slots - 1)
    if (match.perKill > 0) {
      const estimatedKills = Math.max(1, match.totalSlots > 2 ? match.totalSlots - 1 : 1);
      return positionSum + (match.perKill * estimatedKills);
    }

    return positionSum > 0 ? positionSum : (match.winPrize || 0);
  }, [match.totalPrizePool, match.perKill, match.totalSlots, match.winPrize, positions]);

  // Helper for position icon
  const getPositionIcon = (pos: number) => {
    switch (pos) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      case 4:
        return '🏅';
      case 5:
        return '🏅';
      default:
        return '🎖️';
    }
  };

  // Subtitle / Note matching Screenshot 1
  const customSubtitle = match.prizeNote?.trim() || 
    `${match.title} | ${match.version || 'MOBILE'} | Regular রুমে ঢুকার পর কেউ আনরে-রেজিস্ট্রেশন/বাহিরের প্লেয়ার ইনভাইট করবেন না 🔥`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Round White Close Button matching Screenshot */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl mb-3 hover:scale-110 active:scale-95 transition cursor-pointer border border-slate-200"
          title="Close"
        >
          <X className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Modal Card with Yellow Top & White Bottom */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          {/* Top Bright Yellow Section */}
          <div className="bg-[#facc15] px-5 py-4 text-center text-slate-950">
            <h3 className="text-2xl sm:text-3xl font-black font-['Rajdhani',sans-serif] tracking-wider uppercase leading-none text-slate-950">
              TOTAL WINPRIZE
            </h3>
            <p className="text-xs sm:text-[13px] font-extrabold font-bengali text-slate-900 mt-2 leading-snug">
              {customSubtitle}
            </p>
          </div>

          {/* Bottom Clean White Section */}
          <div className="bg-white px-6 py-5 text-center space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Position Prize Rows (Winner, 2nd, 3rd, 4th, 5th, etc.) */}
            {positions.map((pos) => (
              <div
                key={pos.position}
                className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif]"
              >
                <span className="text-2xl">{getPositionIcon(pos.position)}</span>
                <span>
                  {pos.label || (pos.position === 1 ? 'Winner' : `${pos.position}th Position`)} - {pos.prize} Taka
                </span>
              </div>
            ))}

            {/* Per Kill row if per kill > 0 */}
            {match.perKill > 0 && (
              <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black text-slate-900 font-['Rajdhani',sans-serif]">
                <span className="text-xl">🔥</span>
                <span>Per Kill : {match.perKill} Taka</span>
              </div>
            )}

            {/* Total Prize Pool Row with Trophy Icon */}
            <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black text-slate-800 font-['Rajdhani',sans-serif] pt-1">
              <span className="text-2xl">🏆</span>
              <span>Total Prize Pool: {totalPrizePool} Taka</span>
            </div>

            {/* Sub-note */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 font-bengali">
                ম্যাচ শেষে আপনার প্লেসমেন্ট ও কিল অনুযায়ী স্বয়ংক্রিয়ভাবে ওয়ালেটে টাকা যোগ হবে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
