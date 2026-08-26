import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Key,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Trophy,
  Gamepad2,
  Trash2,
  Edit,
  Save,
  Phone,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  Check,
  AlertCircle,
  Settings,
  X
} from 'lucide-react';
import { Match, MatchCategoryKey, Transaction } from '../types';

interface AdminPanelModalProps {
  onClose: () => void;
  matches: Match[];
  onAddMatch: (newMatch: Match) => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  transactions: Transaction[];
  onApproveTransaction: (txnId: string) => void;
  onRejectTransaction: (txnId: string) => void;
  onToast: (msg: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onClose,
  matches,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  transactions,
  onApproveTransaction,
  onRejectTransaction,
  onToast,
}) => {
  // Admin PIN Protection State
  const [adminPin, setAdminPin] = useState(
    localStorage.getItem('owner_admin_pin') || '7788'
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === adminPin) {
      setIsUnlocked(true);
      setPinError('');
      onToast('🔓 Welcome, Owner! Admin panel unlocked.');
    } else {
      setPinError('❌ ভুল পিন কোড! সঠিক পিন দিন।');
      setEnteredPin('');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      onToast('⚠️ পিন কোড অন্তত ৪ সংখ্যার বা অক্ষরের হতে হবে!');
      return;
    }
    setAdminPin(newPinInput.trim());
    localStorage.setItem('owner_admin_pin', newPinInput.trim());
    setNewPinInput('');
    onToast(`✅ অ্যাডমিন পিন সফলভাবে পরিবর্তন করা হয়েছে! নতুন পিন: ${newPinInput.trim()}`);
  };

  const [activeTab, setActiveTab] = useState<'matches' | 'rooms' | 'deposits' | 'settings' | 'stats'>('matches');

  // Room ID/Pass Editor state
  const [selectedMatchForRoom, setSelectedMatchForRoom] = useState<string>(matches[0]?.id || '');
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [roomPassInput, setRoomPassInput] = useState<string>('');

  // Payment settings state (stored in localStorage)
  const [bkashNumber, setBkashNumber] = useState(
    localStorage.getItem('admin_bkash_number') || '01712345678'
  );
  const [nagadNumber, setNagadNumber] = useState(
    localStorage.getItem('admin_nagad_number') || '01812345678'
  );
  const [telegramLink, setTelegramLink] = useState(
    localStorage.getItem('admin_telegram_link') || 'https://t.me/esportsclubbd'
  );
  const [apkDownloadUrl, setApkDownloadUrl] = useState(
    localStorage.getItem('admin_apk_download_url') || '/BD_ESPORTS_MS_v1.0.apk'
  );
  const [noticeText, setNoticeText] = useState(
    localStorage.getItem('admin_notice_text') || 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!'
  );

  // New Match Form State
  const [newMatchTitle, setNewMatchTitle] = useState('Solo Rush | Bermuda');
  const [newCategory, setNewCategory] = useState<MatchCategoryKey>('br_match');
  const [newEntryType, setNewEntryType] = useState<'Solo' | 'Duo' | 'Squad'>('Solo');
  const [newScheduleTime, setNewScheduleTime] = useState('Today at 09:00 PM');
  const [newWinPrize, setNewWinPrize] = useState(500);
  const [newEntryFee, setNewEntryFee] = useState(20);
  const [newPerKill, setNewPerKill] = useState(10);
  const [newMap, setNewMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra'>('Bermuda');
  const [newTotalSlots, setNewTotalSlots] = useState(48);

  const handleSaveRoomDetails = (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const updated: Match = {
      ...target,
      roomId: roomIdInput.trim(),
      roomPass: roomPassInput.trim(),
      status: target.status === 'upcoming' && roomIdInput ? 'ongoing' : target.status,
    };
    onUpdateMatch(updated);
    onToast(`✅ Match Room ID & Pass updated for: ${target.title}`);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `m-${Date.now().toString().slice(-4)}`;
    const newMatch: Match = {
      id,
      title: newMatchTitle,
      category: newCategory,
      categoryLabel: newCategory === 'br_match' ? 'BR MATCH' : newCategory === 'clash_squad' ? 'CLASH SQUAD' : 'SPECIAL MATCH',
      entryType: newEntryType,
      scheduleTime: newScheduleTime,
      winPrize: Number(newWinPrize),
      entryFee: Number(newEntryFee),
      perKill: Number(newPerKill),
      map: newMap,
      version: 'MOBILE',
      totalSlots: Number(newTotalSlots),
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    };

    onAddMatch(newMatch);
    onToast(`🎉 New match "${newMatchTitle}" created successfully!`);
    setActiveTab('matches');
  };

  const handleSaveSettings = () => {
    localStorage.setItem('admin_bkash_number', bkashNumber);
    localStorage.setItem('admin_nagad_number', nagadNumber);
    localStorage.setItem('admin_telegram_link', telegramLink);
    localStorage.setItem('admin_apk_download_url', apkDownloadUrl);
    localStorage.setItem('admin_notice_text', noticeText);
    onToast('✅ Admin payment, APK & notice settings saved!');
  };

  // Stats calculation
  const totalMatchesCount = matches.length;
  const totalJoinedSlots = matches.reduce((acc, m) => acc + m.joinedPlayers.length, 0);
  const totalRevenue = matches.reduce((acc, m) => acc + (m.joinedPlayers.length * m.entryFee), 0);
  const totalPendingTxns = transactions.filter((t) => t.status === 'pending');

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 text-white shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 mx-auto flex items-center justify-center shadow-lg border border-amber-400">
            <Key className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-black font-orbitron text-amber-400">OWNER PIN REQUIRED</h3>
            <p className="text-xs text-slate-400 mt-1 font-bengali">
              অ্যাডমিন প্যানেলে ঢুকতে আপনার সিক্রেট পিন কোডটি দিন।
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="গোপন পিন লিখুন"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-2xl outline-none text-amber-300 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm"
              />
              {pinError && (
                <p className="text-xs text-red-400 font-bold mt-2 animate-shake">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 font-black font-orbitron text-slate-950 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              UNLOCK PANEL (লগইন)
            </button>
          </form>

          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium cursor-pointer"
          >
            বাতিল করুন (Close)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4">
      <div
        id="admin-panel-container"
        className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-amber-500/30 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-4 flex items-center justify-between text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/80 text-amber-400 flex items-center justify-center font-bold shadow-inner border border-amber-400/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-extrabold text-base tracking-wide">
                  OWNER ADMIN PANEL
                </h3>
                <span className="text-[10px] bg-black/50 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/40">
                  MASTER CONTROL
                </span>
              </div>
              <p className="text-xs text-amber-100 font-bengali">মালিকানা ও ম্যাচ নিয়ন্ত্রণ কেন্দ্র</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/70 border-b border-slate-800 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Matches ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Room ID/Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Deposits/Withdraws</span>
            {totalPendingTxns.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {totalPendingTxns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>bKash/Notice</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: MATCHES LIST & ADD FORM */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {/* Add New Match Form */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    CREATE NEW TOURNAMENT MATCH
                  </h4>
                  <span className="text-[11px] text-slate-400 font-bengali">নতুন ম্যাচ তৈরি করুন</span>
                </div>

                <form onSubmit={handleCreateMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Match Title</label>
                    <input
                      type="text"
                      required
                      value={newMatchTitle}
                      onChange={(e) => setNewMatchTitle(e.target.value)}
                      placeholder="e.g. Solo Rush 9:00 PM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as MatchCategoryKey)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    >
                      <option value="br_match">BR MATCH (Full Map)</option>
                      <option value="br_survival">BR SURVIVAL</option>
                      <option value="clash_squad">Clash Squad (4v4)</option>
                      <option value="cs_2v2">CS 2v2</option>
                      <option value="lone_wolf">LONE WOLF (1v1)</option>
                      <option value="free_match">Free Match (0 Entry)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Entry Type</label>
                    <div className="flex gap-2">
                      {(['Solo', 'Duo', 'Squad'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewEntryType(t)}
                          className={`flex-1 py-1.5 rounded-lg font-bold ${
                            newEntryType === t ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Map</label>
                    <select
                      value={newMap}
                      onChange={(e) => setNewMap(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    >
                      <option value="Bermuda">Bermuda</option>
                      <option value="Purgatory">Purgatory</option>
                      <option value="Kalahari">Kalahari</option>
                      <option value="Alpine">Alpine</option>
                      <option value="Nexterra">Nexterra</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Schedule Time (Time & Date)</label>
                    <input
                      type="text"
                      required
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                      placeholder="e.g. Today at 09:30 PM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Entry Fee (৳ Taka)</label>
                    <input
                      type="number"
                      required
                      value={newEntryFee}
                      onChange={(e) => setNewEntryFee(Number(e.target.value))}
                      placeholder="20"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">1st Win Prize (৳)</label>
                    <input
                      type="number"
                      required
                      value={newWinPrize}
                      onChange={(e) => setNewWinPrize(Number(e.target.value))}
                      placeholder="500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Per Kill Prize (৳)</label>
                    <input
                      type="number"
                      required
                      value={newPerKill}
                      onChange={(e) => setNewPerKill(Number(e.target.value))}
                      placeholder="10"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>PUBLISH MATCH TO APP (অ্যাপে ম্যাচ চালু করুন)</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Matches List */}
              <div className="space-y-2.5">
                <h4 className="font-orbitron font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Live & Upcoming Matches ({matches.length})
                </h4>

                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-orbitron">{m.title}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          {m.entryType} • {m.map}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
                        }`}>
                          {m.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-rajdhani">
                        <span>🕒 {m.scheduleTime}</span>
                        <span>💰 Entry: ৳{m.entryFee}</span>
                        <span>🏆 Win: ৳{m.winPrize}</span>
                        <span>👥 Joined: {m.joinedPlayers.length}/{m.totalSlots}</span>
                      </div>

                      {m.roomId && (
                        <div className="text-[11px] bg-slate-900 text-emerald-400 px-2 py-1 rounded inline-block font-mono">
                          🔑 Room ID: <strong className="text-white">{m.roomId}</strong> | Pass: <strong className="text-white">{m.roomPass}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMatchForRoom(m.id);
                          setRoomIdInput(m.roomId || '');
                          setRoomPassInput(m.roomPass || '');
                          setActiveTab('rooms');
                        }}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Set Room</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete match "${m.title}"?`)) {
                            onDeleteMatch(m.id);
                            onToast('🗑️ Match deleted successfully!');
                          }
                        }}
                        className="p-2 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-xl cursor-pointer"
                        title="Delete Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROOM ID & PASS DISPATCHER */}
          {activeTab === 'rooms' && (
            <div className="space-y-4 font-bengali">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-orbitron font-bold text-sm">
                  <Key className="w-4 h-4" />
                  <span>DISPATCH ROOM ID & PASSWORD TO PLAYERS</span>
                </div>
                <p className="text-xs text-slate-300">
                  ফ্রি ফায়ার গেমে কাস্টম রুম খুলে রুম আইডি ও পাসওয়ার্ড এখানে লিখুন। প্লেয়াররা তাদের অ্যাপের <strong>My Matches</strong> ট্যাবে সরাসরি দেখতে পাবে।
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1 font-rajdhani">
                      Select Match:
                    </label>
                    <select
                      value={selectedMatchForRoom}
                      onChange={(e) => {
                        setSelectedMatchForRoom(e.target.value);
                        const m = matches.find((item) => item.id === e.target.value);
                        if (m) {
                          setRoomIdInput(m.roomId || '');
                          setRoomPassInput(m.roomPass || '');
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-rajdhani font-bold outline-none"
                    >
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} ({m.scheduleTime}) - Joined: {m.joinedPlayers.length}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1 font-rajdhani">
                        Custom Room ID (রুম আইডি):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5839201"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold text-sm outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1 font-rajdhani">
                        Room Password (পাসওয়ার্ড):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1234"
                        value={roomPassInput}
                        onChange={(e) => setRoomPassInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-400 font-mono font-bold text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveRoomDetails(selectedMatchForRoom)}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>UPDATE & BROADCAST ROOM ID (প্লেয়ারদের আইডি পাস দিন)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSITS & WITHDRAWALS */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  PENDING DEPOSIT & WITHDRAWAL REQUESTS
                </h4>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                  {totalPendingTxns.length} Pending
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-rajdhani">
                  No transactions found.
                </div>
              ) : (
                transactions.map((t) => (
                  <div
                    key={t.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-black uppercase px-2 py-0.5 rounded ${
                          t.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {t.type} • {t.method || 'bKash'}
                        </span>
                        <span className="text-white font-orbitron font-bold text-sm">৳{t.amount}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400 animate-pulse'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-rajdhani">
                        <span>TrxID: <strong className="text-cyan-300 font-mono">{t.trxId || 'N/A'}</strong></span> • 
                        <span> Phone: <strong className="text-white">{t.senderNumber || 'User Phone'}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-500">{t.description} • {t.date}</p>
                    </div>

                    {t.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onApproveTransaction(t.id);
                            onToast(`✅ Transaction ৳${t.amount} approved!`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            onRejectTransaction(t.id);
                            onToast(`❌ Transaction ৳${t.amount} rejected.`);
                          }}
                          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: ADMIN SETTINGS (PAYMENT NUMBERS & NOTICE) */}
          {activeTab === 'settings' && (
            <div className="space-y-4 font-bengali">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-amber-400 font-orbitron font-bold text-sm">
                  <Settings className="w-4 h-4" />
                  <span>PAYMENT & NOTICE CONFIGURATION</span>
                </div>
                <p className="text-slate-300">
                  আপনার বিকাশ ও নগদ নম্বর পরিবর্তন করুন যেখানে প্লেয়াররা ডিপোজিট এবং ডায়মন্ড টপ-আপের টাকা পাঠাবে।
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani">
                      bKash Personal Number (বিকাশ নম্বর):
                    </label>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani">
                      Nagad Personal Number (নগদ নম্বর):
                    </label>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani">
                      Support Telegram / WhatsApp Link:
                    </label>
                    <input
                      type="text"
                      value={telegramLink}
                      onChange={(e) => setTelegramLink(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani flex items-center justify-between">
                      <span>Direct APK Download Link (সরাসরি APK ডাউনলোড লিঙ্ক):</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Auto / MediaFire / Drive / AppCreator24</span>
                    </label>
                    <input
                      type="text"
                      value={apkDownloadUrl}
                      onChange={(e) => setApkDownloadUrl(e.target.value)}
                      placeholder="/BD_ESPORTS_MS_v1.0.apk অথবা আপনার কাস্টম APK লিঙ্ক"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono outline-none focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">
                      ল্যান্ডিং পেজের "অ্যাপটি ডাউনলোড করুন" বাটনে ক্লিক করলে এই APK ফাইলটি ফোনে সরাসরি ডাউনলোড ও ইনস্টল হবে।
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani">
                      App Banner Announcement Notice (নোটিশ টেক্সট):
                    </label>
                    <textarea
                      rows={2}
                      value={noticeText}
                      onChange={(e) => setNoticeText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-200 outline-none resize-none"
                    />
                  </div>

                  {/* Change Admin PIN Section */}
                  <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
                    <label className="text-amber-300 font-bold block font-rajdhani flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-amber-400" />
                        Change Owner Secret PIN (অ্যাডমিন পিন পরিবর্তন):
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Current: {adminPin}</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="নতুন ৪-৮ ডিজিটের পিন লিখুন"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono outline-none focus:border-amber-400 text-xs"
                      />
                      <button
                        onClick={handleChangePin}
                        type="button"
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs font-orbitron shadow cursor-pointer transition"
                      >
                        SET PIN
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      পিন পরিবর্তন করলে পরবর্তী সময়ে এই নতুন পিন ছাড়া অ্যাডমিন প্যানেলে আর কেউ ঢুকতে পারবে না।
                    </span>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE ALL SETTINGS (সেটিংস সংরক্ষণ করুন)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS & PROFIT STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-rajdhani block">Total Matches Hosted</span>
                  <span className="text-2xl font-black font-orbitron text-amber-400">{totalMatchesCount}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-rajdhani block">Total Player Registrations</span>
                  <span className="text-2xl font-black font-orbitron text-cyan-400">{totalJoinedSlots}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-rajdhani block">Entry Fee Collection</span>
                  <span className="text-2xl font-black font-orbitron text-emerald-400">৳{totalRevenue}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-rajdhani block">Estimated Profit</span>
                  <span className="text-2xl font-black font-orbitron text-violet-400">
                    ৳{Math.round(totalRevenue * 0.25)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2 font-bengali text-xs">
                <h5 className="font-bold text-amber-400 font-orbitron text-sm">💡 লাভ বাড়ানোর কিছু টিপস:</h5>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>প্রতিদিন অন্তত ৩টি ভিন্ন এন্ট্রি ফি-এর ম্যাচ রাখুন (৳১০, ৳২০, ৳৫০)।</li>
                  <li>ম্যাচ শুরুর আগে ফেসবুকে পোস্ট দিয়ে রুম কোডের ঘোষণা দিন।</li>
                  <li>দ্রুত ডিপোজিট অ্যাপ্রুভ করলে প্লেয়াররা বেশি ট্রাস্ট করবে।</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">BD ESPORTS MS v2.4 Admin Module</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold font-orbitron tracking-wider text-xs rounded-xl cursor-pointer"
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </div>
  );
};
