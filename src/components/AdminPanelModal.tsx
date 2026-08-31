import React, { useState } from 'react';
import { X, Send, Bell, Trophy, Users, Wallet, CheckCircle, Trash2, Plus, ShieldCheck } from 'lucide-react';
import { Match, PushNotificationItem } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onAddMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  matches,
  onAddMatch,
  onDeleteMatch
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'matches' | 'users'>('broadcast');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New match form state
  const [newTitle, setNewTitle] = useState('BR SOLO TOURNAMENT');
  const [newMap, setNewMap] = useState('Bermuda');
  const [newType, setNewType] = useState('BR Solo');
  const [newEntryFee, setNewEntryFee] = useState(20);
  const [newPrizePool, setNewPrizePool] = useState(1500);
  const [newPerKill, setNewPerKill] = useState(10);
  const [newTime, setNewTime] = useState('08:00 PM');
  const [newTotalSpots, setNewTotalSpots] = useState(48);

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const newItem: PushNotificationItem = {
      id: 'bc_' + Date.now(),
      title: notifTitle,
      message: notifMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'broadcast'
    };

    localStorage.setItem('bd_esports_latest_broadcast', JSON.stringify(newItem));
    setBroadcastSuccess(true);
    setNotifTitle('');
    setNotifMessage('');

    setTimeout(() => {
      setBroadcastSuccess(false);
    }, 4000);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const match: Match = {
      id: 'match_' + Date.now(),
      title: newTitle,
      map: newMap,
      type: newType,
      version: 'TPP',
      time: newTime,
      prizePool: Number(newPrizePool),
      entryFee: Number(newEntryFee),
      perKill: Number(newPerKill),
      totalSpots: Number(newTotalSpots),
      joinedCount: 0,
      roomId: '',
      roomPass: '',
      status: 'upcoming'
    };
    onAddMatch(match);
    alert('নতুন ম্যাচ সফলভাবে অ্যাড করা হয়েছে!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">অ্যাডমিন প্যানেল</h3>
              <p className="text-xs text-slate-400">ম্যানেজ করুন ব্রডকাস্ট নোটিফিকেশন ও টুর্নামেন্ট</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'broadcast'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> পুশ নোটিফিকেশন
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> ম্যাচ লিস্ট ({matches.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'broadcast' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Bell className="w-4 h-4 animate-bounce" /> ব্রডকাস্ট পুশ নোটিফিকেশন সিস্টেম
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  এখান থেকে টাইটেল ও মেসেজ লিখে সেন্ড করলেই সমস্ত ইউজারের ফোনে তাৎক্ষণিক পপ-আপ নোটিফিকেশন ব্যানার ভেসে উঠবে এবং ব্রাউজার নোটিফিকেশন অ্যাক্টিভ থাকলে স্ক্রিনের উপরে নোটিফিকেশন দেখাবে!
                </p>
              </div>

              {broadcastSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold animate-pulse">
                  <CheckCircle className="w-5 h-5" /> সফলভাবে সমস্ত ইউজারের কাছে পুশ নোটিফিকেশন ব্রডকাস্ট করা হয়েছে!
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">নোটিফিকেশন টাইটেল (যেমন: সকালের ম্যাচ অ্যাড করা আছে)</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="যেমন: সকালের ম্যাচ অ্যাড করা আছে"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">নোটিফিকেশন মেসেজ (যেমন: জয়েন করে নিন)</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="যেমন: জয়েন করে নিন, রুম আইডি দেওয়া হয়েছে।"
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> BROADCAST PUSH NOTIFICATION
                </button>
              </form>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateMatch} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> নতুন টুর্নামেন্ট ম্যাচ অ্যাড করুন
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ম্যাচ টাইটেল</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ম্যাপ</label>
                    <input
                      type="text"
                      value={newMap}
                      onChange={(e) => setNewMap(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">গেম মোড</label>
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">সময়</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">এন্ট্রি ফি (৳)</label>
                    <input
                      type="number"
                      value={newEntryFee}
                      onChange={(e) => setNewEntryFee(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">প্রাইজ পুল (৳)</label>
                    <input
                      type="number"
                      value={newPrizePool}
                      onChange={(e) => setNewPrizePool(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  ম্যাচ পাবলিশ করুন
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">বর্তমান ম্যাচসমূহ</h4>
                {matches.map((m) => (
                  <div key={m.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">{m.title}</h5>
                      <p className="text-xs text-slate-400">{m.map} • {m.time} • এন্ট্রি: ৳{m.entryFee}</p>
                    </div>
                    <button
                      onClick={() => onDeleteMatch(m.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
