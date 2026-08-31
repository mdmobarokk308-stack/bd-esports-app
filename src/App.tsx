import React, { useState, useEffect } from 'react';
import { Trophy, Wallet, Shield, Bell, Gamepad2, User, Volume2, Send, ExternalLink, CheckCircle, ChevronRight } from 'lucide-react';
import { Match, User as UserType, PushNotificationItem } from './types';
import { PushNotificationToast } from './components/PushNotificationToast';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType>({
    id: 'user_1',
    name: 'Mobarok Hossain',
    phone: '01712345678',
    balance: 160,
    winBalance: 500,
    referralCode: 'BD2026',
    isAdmin: true
  });

  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'm1',
      title: 'BR MATCH',
      map: 'Bermuda',
      type: 'BR Solo',
      version: 'TPP',
      time: '08:00 PM',
      prizePool: 1500,
      entryFee: 20,
      perKill: 10,
      totalSpots: 48,
      joinedCount: 32,
      status: 'upcoming'
    },
    {
      id: 'm2',
      title: 'BR SURVIVAL',
      map: 'Kashmir',
      type: 'BR Survival',
      version: 'TPP',
      time: '09:30 PM',
      prizePool: 250000,
      entryFee: 50,
      perKill: 15,
      totalSpots: 48,
      joinedCount: 14,
      status: 'upcoming'
    },
    {
      id: 'm3',
      title: 'CLASH SQUAD',
      map: 'Bermuda',
      type: 'Clash Squad',
      version: '4V4',
      time: '10:00 PM',
      prizePool: 2000,
      entryFee: 100,
      perKill: 0,
      totalSpots: 12,
      joinedCount: 8,
      status: 'upcoming'
    },
    {
      id: 'm4',
      title: 'KHELO BANGLADESH',
      map: 'Bangladesh Edition',
      type: '2v2',
      version: 'TPP',
      time: '11:00 PM',
      prizePool: 3000,
      entryFee: 60,
      perKill: 20,
      totalSpots: 24,
      joinedCount: 10,
      status: 'upcoming'
    }
  ]);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'matches' | 'wallet' | 'profile'>('home');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const [selectedMatchModal, setSelectedMatchModal] = useState<Match | null>(null);

  const handleAddMatch = (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
  };

  const handleDeleteMatch = (id: string) => {
    setMatches(matches.filter(m => m.id !== id));
  };

  const handleNotificationClick = (item: PushNotificationItem) => {
    setActiveTab('home');
    alert(`নোটিফিকেশন থেকে ওপেন হয়েছে: ${item.title} - ${item.message}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* Real-time Push Notification Banner & Toast listener */}
      <PushNotificationToast onNotificationClick={handleNotificationClick} />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-white">BD ESPORTS <span className="text-amber-400">MS</span></h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider">FREE FIRE TOURNAMENTS</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-full shadow-inner">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">৳60</span>
          </div>

          <button
            onClick={() => {
              setUnreadNotifsCount(0);
              setIsAdminOpen(true);
            }}
            className="relative p-2 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 transition"
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Hero Giveaway Banner matching screenshot */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span> KHELO BANGLADESH
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">b</span>
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">R</span>
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">N</span>
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">✈</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shrink-0 shadow-lg">
                  🐯
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white leading-snug">প্রতিদিন ফ্রি ট্রানজেকশন গিভওয়ে নিতে টেলিগ্রাম চ্যানেলে জয়েন করুন</h3>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-md animate-pulse">
                  DAILY GIVEAWAY
                </span>
                <button
                  onClick={() => window.open('https://telegram.org', '_blank')}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  Join Telegram <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center items-center gap-1.5 mt-3">
                <span className="w-6 h-1.5 rounded-full bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              </div>
            </div>

            {/* Marquee Notice Bar */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-md">
              <div className="text-amber-400 shrink-0">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <p className="text-xs font-bold text-amber-300 animate-marquee">
                  📢 ২৪/৭ ইনস্ট্যান্ট সাপোর্ট | রুম আইডি ও পাসওয়ার্ড ম্যাচ শুরুর ১০ মিনিট আগে দেওয়া হবে!
                </p>
              </div>
            </div>

            {/* Title Free Fire */}
            <div className="text-center py-2">
              <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-amber-500">
                FREE FIRE
              </h2>
            </div>

            {/* Tournament Cards Grid matching screenshot */}
            <div className="grid grid-cols-2 gap-3">
              {matches.map((m, idx) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition group">
                  <div className="relative h-32 bg-slate-950 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                    <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-black text-amber-400 border border-amber-500/30">
                      LIVE
                    </div>
                    {/* Simulated banner image based on index */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition duration-500">
                      {idx === 0 ? '🛡️' : idx === 1 ? '🏎️' : idx === 2 ? '⚔️' : '🔥'}
                    </div>
                  </div>

                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.joinedCount} matches found</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMatchModal(m);
                      }}
                      className="w-full py-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-400 transition flex items-center justify-between px-3"
                    >
                      <span>View Matches</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">সকল টুর্নামেন্ট</h3>
            {matches.map(m => (
              <div key={m.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">{m.type} • {m.map}</span>
                  <span className="text-xs text-slate-400">{m.time}</span>
                </div>
                <h4 className="text-base font-bold text-white">{m.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>প্রাইজ পুল: ৳{m.prizePool}</span>
                  <span>এন্ট্রি ফি: ৳{m.entryFee}</span>
                </div>
                <button
                  onClick={() => alert(`আপনি ${m.title} এ জয়েন করেছেন!`)}
                  className="w-full py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs mt-2"
                >
                  জয়েন করুন
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-white">ওয়ালেট ও ব্যালেন্স</h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">টোটাল ব্যালেন্স</p>
                <p className="text-2xl font-black text-amber-400">৳{currentUser.balance}</p>
              </div>
              <button onClick={() => alert('বিকাশ বা নগদ নাম্বারে সেন্ড মানি করুন')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
                অ্যাড মানি
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-white">ইউজার প্রোফাইল</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>নাম: <span className="text-white font-bold">{currentUser.name}</span></p>
              <p>ফোন: <span className="text-white font-bold">{currentUser.phone}</span></p>
              <p>রেফারেল কোড: <span className="text-amber-400 font-bold">{currentUser.referralCode}</span></p>
            </div>
            {currentUser.isAdmin && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="w-full py-3 bg-amber-500/20 border border-amber-500 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> অ্যাডমিন প্যানেল ওপেন করুন
              </button>
            )}
          </div>
        )}
      </main>

      {/* Match Details / Join Modal if selected */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{selectedMatchModal.title}</h3>
              <button onClick={() => setSelectedMatchModal(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>🗺️ ম্যাপ: <span className="text-white font-semibold">{selectedMatchModal.map}</span></p>
              <p>⏰ সময়: <span className="text-white font-semibold">{selectedMatchModal.time}</span></p>
              <p>🏆 প্রাইজ পুল: <span className="text-amber-400 font-bold">৳{selectedMatchModal.prizePool}</span></p>
              <p>🔫 পার কিল: <span className="text-white font-semibold">৳{selectedMatchModal.perKill}</span></p>
              <p>🎟️ এন্ট্রি ফি: <span className="text-emerald-400 font-bold">৳{selectedMatchModal.entryFee}</span></p>
            </div>
            <button
              onClick={() => {
                alert(`সফলভাবে ${selectedMatchModal.title} ম্যাচে জয়েন করা হয়েছে!`);
                setSelectedMatchModal(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-amber-500/20"
            >
              কনফার্ম জয়েন (Confirm Join)
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation matching screenshot */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-3 flex items-center justify-around z-40 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">হোম</span>
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'matches' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold">ম্যাচ</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'wallet' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold">ওয়ালেট</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">প্রোফাইল</span>
        </button>
      </nav>

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        matches={matches}
        onAddMatch={handleAddMatch}
        onDeleteMatch={handleDeleteMatch}
      />
    </div>
  );
}

