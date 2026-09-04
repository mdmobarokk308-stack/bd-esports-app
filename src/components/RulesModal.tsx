import React from 'react';
import { X, BookOpenCheck, ShieldAlert } from 'lucide-react';
import { TOURNAMENT_RULES, BANNED_ITEMS_NOTE } from '../data/mockData';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">Match Instructions and Rules</h3>
              <p className="text-xs text-teal-300 font-rajdhani">ম্যাচ রুলস ও নির্দেশাবলী</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3 font-bengali">
          {/* Banned Weapons Gray Card (Exact layout from user video) */}
          <div className="bg-slate-100 border border-slate-300 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-800">
            <p className="italic text-slate-500 font-medium">{BANNED_ITEMS_NOTE.header}</p>
            <p className="font-bold text-slate-900">যেই গান গুলো চালানো যাবে না -</p>
            <p className="font-mono font-semibold text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200 text-[11px] leading-tight">
              {BANNED_ITEMS_NOTE.bannedGuns}
            </p>
            <p className="font-mono font-semibold text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200 text-[11px] leading-tight">
              {BANNED_ITEMS_NOTE.bannedCharacter}
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 leading-relaxed font-semibold">
              সতর্কবার্তা: হ্যাকিং, স্ক্রিপ্ট বা এমুলেটর ব্যবহারকারীদের একাউন্ট সাথে সাথে আজীবন ব্যান করা হয়।
            </div>
          </div>

          {TOURNAMENT_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1"
            >
              <h4 className="font-bold text-slate-900 font-rajdhani text-sm">{rule.title}</h4>
              <p className="text-slate-600 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-bold font-orbitron tracking-wider text-xs rounded-xl cursor-pointer"
          >
            I UNDERSTAND & AGREE
          </button>
        </div>
      </div>
    </div>
  );
};
