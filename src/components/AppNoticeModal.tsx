import React from 'react';
import { Info, X, Check } from 'lucide-react';
import { AppNotice } from '../types';

interface AppNoticeModalProps {
  notice: AppNotice;
  onClose: () => void;
}

export const AppNoticeModal: React.FC<AppNoticeModalProps> = ({ notice, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Screenshot 2: Orange Info Icon + "Notice" + Close */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              <Info className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Rajdhani',sans-serif] tracking-tight">
              Notice
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Close Notice"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body Content matching Screenshot 2 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-700 font-bengali">
          {/* Welcome Title */}
          {notice.title && (
            <div className="text-center pb-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-['Rajdhani',sans-serif] uppercase tracking-wide">
                {notice.title}
              </h3>
            </div>
          )}

          {/* Notice Points */}
          <div className="space-y-3.5 text-sm sm:text-base leading-relaxed font-semibold">
            {notice.content.map((line, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="flex-1 text-slate-800">
                  {line}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button to Dismiss */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-black text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer font-['Rajdhani',sans-serif] tracking-wider"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>ঠিক আছে, বুঝতে পেরেছি (OK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
