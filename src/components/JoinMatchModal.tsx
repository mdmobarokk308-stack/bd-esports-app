import React, { useState } from 'react';
import { X, Swords, AlertCircle, ShieldAlert, CheckCircle2, Trophy, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Match, User as UserType } from '../types';

interface JoinMatchModalProps {
  match: Match;
  user: UserType;
  onClose: () => void;
  onConfirmJoin: (matchId: string, slot: number, ign: string, uid: string) => void;
  onOpenDeposit: () => void;
}

export const JoinMatchModal: React.FC<JoinMatchModalProps> = ({
  match,
  user,
  onClose,
  onConfirmJoin,
  onOpenDeposit,
}) => {
  const [ign, setIgn] = useState(user.freeFireIgn || user.username);
  const [uid, setUid] = useState(user.freeFireUid || '');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Taken slots
  const takenSlots = new Set(match.joinedPlayers.map((p) => p.slot));

  // Find first available slot by default
  React.useEffect(() => {
    for (let i = 1; i <= match.totalSlots; i++) {
      if (!takenSlots.has(i)) {
        setSelectedSlot(i);
        break;
      }
    }
  }, [match.totalSlots]);

  const hasEnoughBalance = user.balance >= match.entryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) {
      setError('Please enter your Free Fire In-Game Name (IGN)');
      return;
    }
    if (!uid.trim() || uid.length < 7) {
      setError('Please enter a valid Free Fire Player UID (8-10 digits)');
      return;
    }
    if (!selectedSlot) {
      setError('Please choose an available slot');
      return;
    }
    if (!hasEnoughBalance && match.entryFee > 0) {
      setError('Insufficient wallet balance. Please add funds.');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onConfirmJoin(match.id, selectedSlot, ign.trim(), uid.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div
        id="join-match-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">Join Tournament Match</h3>
              <p className="text-[11px] text-cyan-300 font-rajdhani">{match.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Match Quick Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="text-slate-500 font-rajdhani uppercase text-[10px] block">Entry Fee</span>
              <span className="font-bold text-slate-900 text-sm font-mono">
                {match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`}
              </span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-slate-500 font-rajdhani uppercase text-[10px] block">Win Prize</span>
              <span className="font-bold text-emerald-600 text-sm font-mono">৳{match.winPrize}</span>
            </div>
            <div>
              <span className="text-slate-500 font-rajdhani uppercase text-[10px] block">Per Kill</span>
              <span className="font-bold text-slate-900 text-sm font-mono">৳{match.perKill}</span>
            </div>
          </div>

          {/* User Balance Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-rajdhani">Your Wallet Balance:</span>
              <p className="text-base font-extrabold text-slate-900 font-mono">৳{user.balance} BDT</p>
            </div>
            {!hasEnoughBalance && match.entryFee > 0 ? (
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-rajdhani uppercase tracking-wider cursor-pointer shadow-sm"
              >
                + Add Money
              </button>
            ) : (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready to Join
              </span>
            )}
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Free Fire IGN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                Free Fire In-Game Name (IGN) <span className="text-red-500">*</span>
              </label>
              <input
                id="join-ign-input"
                type="text"
                value={ign}
                onChange={(e) => setIgn(e.target.value)}
                placeholder="e.g. BOSS_MOBAROK"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Must match your actual in-game nickname exactly.
              </p>
            </div>

            {/* Free Fire UID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                Free Fire UID <span className="text-red-500">*</span>
              </label>
              <input
                id="join-uid-input"
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="e.g. 2849182391"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Slot Picker (1 to totalSlots) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider">
                  Select Custom Room Slot
                </label>
                <span className="text-[11px] text-slate-500 font-rajdhani">
                  Slot Selected: <span className="font-bold text-indigo-600 font-mono">#{selectedSlot || 'None'}</span>
                </span>
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {Array.from({ length: match.totalSlots }, (_, i) => i + 1).map((slotNum) => {
                  const isTaken = takenSlots.has(slotNum);
                  const isSelected = selectedSlot === slotNum;

                  return (
                    <button
                      key={slotNum}
                      type="button"
                      disabled={isTaken}
                      onClick={() => setSelectedSlot(slotNum)}
                      className={`h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                        isTaken
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isTaken ? `Slot ${slotNum} Taken` : `Select Slot ${slotNum}`}
                    >
                      {slotNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 font-bengali">
              ⚠️ ম্যাচ শুরুর ১০ মিনিট আগে My Matches থেকে রুম আইডি ও পাসওয়ার্ড নিয়ে নির্দিষ্ট স্লটে গিয়ে বসবেন।
            </div>

            {/* Confirm Submit Button */}
            <div className="pt-2">
              <button
                id="confirm-join-match-btn"
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6d28d9] via-[#2563eb] to-[#06b6d4] hover:from-[#7c3aed] hover:via-[#3b82f6] hover:to-[#22d3ee] text-white font-bold font-orbitron tracking-wider text-sm shadow-md cursor-pointer active:scale-98 transition"
              >
                CONFIRM & JOIN ({match.entryFee === 0 ? 'FREE' : `৳${match.entryFee}`})
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
