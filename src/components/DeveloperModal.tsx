import React from 'react';
import { X, Code2, ExternalLink, MessageSquare, PhoneCall, Globe, Shield, Heart } from 'lucide-react';

interface DeveloperModalProps {
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">DEVELOPER PROFILE</h3>
              <p className="text-xs text-cyan-300 font-rajdhani">App Creator & System Info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-2 shadow-lg ring-4 ring-blue-100">
              ⚡
            </div>
            <h3 className="font-bold text-lg text-slate-900 font-rajdhani">
              BD ESPORTS MS TECH
            </h3>
            <p className="text-xs text-slate-500 font-bengali">
              বাংলাদেশের সেরা ও বিশ্বস্ত ফ্রি ফায়ার টুর্নামেন্ট এবং ডায়মন্ড টপ-আপ প্ল্যাটফর্ম
            </p>
          </div>

          <div className="space-y-2">
            <a
              href="https://t.me/khelo_bangladesh_ff"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold font-rajdhani border border-blue-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Official Telegram Channel</span>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500" />
            </a>

            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold font-rajdhani border border-emerald-200 transition"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp 24/7 Helpline</span>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-500" />
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>App Version:</span>
              <span className="font-bold text-slate-900">v3.8.2 Pro</span>
            </div>
            <div className="flex justify-between">
              <span>Framework:</span>
              <span className="text-slate-900">React 19 + Tailwind v4</span>
            </div>
            <div className="flex justify-between">
              <span>Server Latency:</span>
              <span className="text-emerald-600 font-bold">14ms (Dhaka Edge)</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for BD Free Fire Gamers
          </p>
        </div>
      </div>
    </div>
  );
};
