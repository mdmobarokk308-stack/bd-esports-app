import React, { useState } from 'react';
import { X, User, Phone, Mail, Gamepad2, Shield, Check } from 'lucide-react';
import { User as UserType } from '../types';

interface MyProfileModalProps {
  user: UserType;
  onClose: () => void;
  onUpdate: (updatedData: Partial<UserType>) => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [ffUid, setFfUid] = useState(user.freeFireUid);
  const [ffIgn, setFfIgn] = useState(user.freeFireIgn);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      freeFireUid: ffUid.trim(),
      freeFireIgn: ffIgn.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">EDIT PROFILE</h3>
              <p className="text-xs text-cyan-300 font-rajdhani">Gamer Details & UID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {saved && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold text-center font-rajdhani">
              Profile updated successfully!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
              Free Fire UID (Required for Match Rooms & Top-up)
            </label>
            <input
              type="text"
              value={ffUid}
              onChange={(e) => setFfUid(e.target.value)}
              placeholder="e.g. 2849182391"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
              Free Fire In-Game Name (IGN)
            </label>
            <input
              type="text"
              value={ffIgn}
              onChange={(e) => setFfIgn(e.target.value)}
              placeholder="e.g. BOSS_MOBAROK"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold font-orbitron tracking-wider text-xs shadow-md cursor-pointer transition active:scale-98"
            >
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
