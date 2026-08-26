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
  Bell,
  X,
  Send,
  Radio,
  MessageSquare
} from 'lucide-react';
import { AppNotice, AppNotification, Match, MatchCategoryKey, TabType, Transaction } from '../types';
import { DEFAULT_APP_NOTICE } from '../data/mockData';

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
  notice?: AppNotice;
  onUpdateNotice?: (notice: AppNotice) => void;
  notifications?: AppNotification[];
  onSendNotification?: (notif: { title: string; message: string; category?: 'match' | 'deposit' | 'system' | 'room' | 'offer'; linkTab?: TabType }) => void;
  onDeleteNotification?: (id: string) => void;
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
  notice = DEFAULT_APP_NOTICE,
  onUpdateNotice,
  notifications = [],
  onSendNotification,
  onDeleteNotification,
}) => {
  // Admin PIN Protection State
  const [adminPin, setAdminPin] = useState(
    localStorage.getItem('owner_admin_pin') || '7788'
  );
  const [enteredPin, setEnteredPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  // Notice Management State
  const [noticeEnabled, setNoticeEnabled] = useState<boolean>(notice.enabled);
  const [noticeTitle, setNoticeTitle] = useState<string>(notice.title);
  const [noticeLines, setNoticeLines] = useState<string[]>(notice.content);
  const [newLineText, setNewLineText] = useState<string>('');

  // Push Notification State
  const [pushTitle, setPushTitle] = useState<string>('সকালের ম্যাচ অ্যাড করা আছে');
  const [pushMessage, setPushMessage] = useState<string>('জয়েন করে নিন');
  const [pushCategory, setPushCategory] = useState<'match' | 'deposit' | 'system' | 'room' | 'offer'>('match');
  const [pushLinkTab, setPushLinkTab] = useState<TabType>('play');

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

  const [activeTab, setActiveTab] = useState<'matches' | 'rooms' | 'deposits' | 'push_notifications' | 'notices' | 'settings' | 'pin' | 'stats'>('matches');
  const [showPinChangeOnLock, setShowPinChangeOnLock] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [lockNewPinInput, setLockNewPinInput] = useState('');
  const [lockConfirmPinInput, setLockConfirmPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleDirectPinReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinInput !== adminPin) {
      setPinChangeMessage({ text: '❌ বর্তমান পিন ভুল হয়েছে!', isError: true });
      return;
    }
    if (lockNewPinInput.trim().length < 4) {
      setPinChangeMessage({ text: '⚠️ নতুন পিন অন্তত ৪ ডিজিটের হতে হবে!', isError: true });
      return;
    }
    if (lockNewPinInput.trim() !== lockConfirmPinInput.trim()) {
      setPinChangeMessage({ text: '❌ নতুন পিন এবং কনফার্ম পিন মিলছে না!', isError: true });
      return;
    }
    const updated = lockNewPinInput.trim();
    setAdminPin(updated);
    localStorage.setItem('owner_admin_pin', updated);
    setOldPinInput('');
    setLockNewPinInput('');
    setLockConfirmPinInput('');
    setPinChangeMessage({ text: '✅ পিন সফলভাবে পরিবর্তন হয়েছে! এবার নতুন পিন দিয়ে লগইন করুন।', isError: false });
    setTimeout(() => {
      setShowPinChangeOnLock(false);
      setPinChangeMessage(null);
    }, 1500);
  };

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
  const [rocketNumber, setRocketNumber] = useState(
    localStorage.getItem('admin_rocket_number') || '019999888775'
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
    localStorage.setItem('admin_rocket_number', rocketNumber);
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
            <h3 className="text-lg font-black font-orbitron text-amber-400">
              {showPinChangeOnLock ? 'RESET OWNER PIN' : 'OWNER PIN REQUIRED'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-bengali">
              {showPinChangeOnLock
                ? 'বর্তমান পিন দিয়ে নিজের পছন্দমতো নতুন পিন সেট করুন।'
                : 'অ্যাডমিন প্যানেলে ঢুকতে আপনার সিক্রেট পিন কোডটি দিন।'}
            </p>
          </div>

          {showPinChangeOnLock ? (
            <form onSubmit={handleDirectPinReset} className="space-y-3 text-left">
              <div>
                <label className="text-[11px] text-slate-300 font-bold font-rajdhani block mb-1">
                  বর্তমান পিন (Current PIN):
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="বর্তমান পিন দিন"
                  className="w-full text-center text-lg font-mono py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl outline-none text-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold font-rajdhani block mb-1">
                  আপনার নতুন গোপন পিন (New PIN):
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  value={lockNewPinInput}
                  onChange={(e) => setLockNewPinInput(e.target.value)}
                  placeholder="নতুন ৪-৮ ডিজিটের পিন লিখুন"
                  className="w-full text-center text-lg font-mono py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl outline-none text-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold font-rajdhani block mb-1">
                  নতুন পিন আবার লিখুন (Confirm New PIN):
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  value={lockConfirmPinInput}
                  onChange={(e) => setLockConfirmPinInput(e.target.value)}
                  placeholder="নতুন পিন নিশ্চিত করুন"
                  className="w-full text-center text-lg font-mono py-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl outline-none text-emerald-400"
                />
              </div>

              {pinChangeMessage && (
                <p
                  className={`text-xs font-bold text-center mt-2 ${
                    pinChangeMessage.isError ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {pinChangeMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-black font-orbitron text-slate-950 rounded-xl shadow-lg transition active:scale-95 cursor-pointer text-xs"
              >
                SAVE NEW PIN (নতুন পিন সেট করুন)
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPinChangeOnLock(false);
                  setPinChangeMessage(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1 cursor-pointer"
              >
                ← লগইনে ফিরে যান (Back)
              </button>
            </form>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
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

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setShowPinChangeOnLock(true)}
                  className="text-amber-400/90 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  🔑 পিন পরিবর্তন করতে চান?
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  বাতিল (Close)
                </button>
              </div>
            </form>
          )}
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
            <span>bKash/Payment</span>
          </button>

          <button
            onClick={() => setActiveTab('push_notifications')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'push_notifications'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white hover:bg-slate-800 border border-amber-400/40'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>🔔 Push Notifications ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'notices'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md font-black'
                : 'text-rose-400 hover:text-white hover:bg-slate-800 border border-rose-500/30'
            }`}
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span>📢 App Notice Popup</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'pin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-400 hover:text-white hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>🔐 PIN Settings</span>
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
                      Rocket Personal Number (রকেট নম্বর):
                    </label>
                    <input
                      type="text"
                      value={rocketNumber}
                      onChange={(e) => setRocketNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
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

          {/* TAB: PUSH NOTIFICATIONS BROADCAST */}
          {activeTab === 'push_notifications' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md">
                    <Radio className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black font-orbitron text-amber-400">
                      PUSH NOTIFICATION BROADCAST
                    </h4>
                    <p className="text-xs text-slate-300 font-bengali">
                      যে কোনো সময় ইউজারদের মোবাইলে সরাসরি পুশ নোটিফিকেশন ব্যানার পাঠান
                    </p>
                  </div>
                </div>

                {/* Quick Preset Templates */}
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2 font-rajdhani uppercase tracking-wider">
                    ⚡ Quick Templates (এক ক্লিকে নোটিফিকেশন রেডি করুন):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPushTitle('সকালের ম্যাচ অ্যাড করা আছে');
                        setPushMessage('জয়েন করে নিন');
                        setPushCategory('match');
                        setPushLinkTab('play');
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-400 rounded-xl text-left transition cursor-pointer"
                    >
                      <span className="font-bold text-xs text-amber-300 font-bengali block">
                        🎮 সকালের ম্যাচ জয়েন করুন
                      </span>
                      <span className="text-[11px] text-slate-400 font-bengali">
                        "সকালের ম্যাচ অ্যাড করা আছে - জয়েন করে নিন"
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPushTitle('রুম আইডি ও পাসওয়ার্ড দেওয়া হয়েছে 🔑');
                        setPushMessage('My Matches অপশনে গিয়ে রুম আইডি ও পাস নিয়ে দ্রুত গেমে জয়েন করুন!');
                        setPushCategory('room');
                        setPushLinkTab('my_matches');
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-400 rounded-xl text-left transition cursor-pointer"
                    >
                      <span className="font-bold text-xs text-blue-300 font-bengali block">
                        🔑 রুম আইডি ও পাসওয়ার্ড
                      </span>
                      <span className="text-[11px] text-slate-400 font-bengali">
                        "রুম আইডি ও পাসওয়ার্ড দেওয়া হয়েছে..."
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPushTitle('বিকাশ ও নগদ ডিপোজিট অফার 🔥');
                        setPushMessage('ইনস্ট্যান্ট ডিপোজিট একটিভ! এখনই ব্যালেন্স অ্যাড করে টুর্নামেন্টে অংশ নিন।');
                        setPushCategory('deposit');
                        setPushLinkTab('shop');
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-400 rounded-xl text-left transition cursor-pointer"
                    >
                      <span className="font-bold text-xs text-emerald-300 font-bengali block">
                        💰 ডিপোজিট অফার
                      </span>
                      <span className="text-[11px] text-slate-400 font-bengali">
                        "বিকাশ ও নগদ ডিপোজিট অফার 🔥..."
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPushTitle('আজকের ফ্রি গিভঅ্যাওয়ে ম্যাচ 🏆');
                        setPushMessage('কোনো এন্ট্রি ফি ছাড়াই ফ্রি ম্যাচে জয়েন করে জিতে নিন ফ্রি ক্যাশ!');
                        setPushCategory('offer');
                        setPushLinkTab('play');
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-400 rounded-xl text-left transition cursor-pointer"
                    >
                      <span className="font-bold text-xs text-purple-300 font-bengali block">
                        🎁 ফ্রি টুর্নামেন্ট গিভঅ্যাওয়ে
                      </span>
                      <span className="text-[11px] text-slate-400 font-bengali">
                        "আজকের ফ্রি গিভঅ্যাওয়ে ম্যাচ 🏆..."
                      </span>
                    </button>
                  </div>
                </div>

                {/* Custom Compose Form */}
                <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                  <div>
                    <label className="text-xs text-slate-200 font-bold block mb-1 font-rajdhani">
                      Notification Title (নোটিফিকেশন টাইটেল):
                    </label>
                    <input
                      type="text"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="যেমন: সকালের ম্যাচ অ্যাড করা আছে"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-bengali font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-200 font-bold block mb-1 font-rajdhani">
                      Notification Body / Message (বিস্তারিত মেসেজ):
                    </label>
                    <textarea
                      rows={2}
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      placeholder="যেমন: জয়েন করে নিন"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white font-bengali font-medium outline-none resize-none"
                    />
                  </div>

                  {/* Category and Tab Selection */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1 font-rajdhani">
                        Category (ক্যাটাগরি):
                      </label>
                      <select
                        value={pushCategory}
                        onChange={(e) => setPushCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="match">🎮 Match Alert</option>
                        <option value="room">🔑 Room Code</option>
                        <option value="deposit">💰 Deposit / Wallet</option>
                        <option value="offer">🔥 Special Offer</option>
                        <option value="system">📢 System Notice</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1 font-rajdhani">
                        Target Tab on Tap (ক্লিক করলে কোথায় যাবে):
                      </label>
                      <select
                        value={pushLinkTab}
                        onChange={(e) => setPushLinkTab(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="play">Play (ম্যাচ লিস্ট)</option>
                        <option value="my_matches">My Matches (আমার ম্যাচ / রুম কোড)</option>
                        <option value="shop">Top-Up / Wallet (ডিপোজিট)</option>
                        <option value="results">Results (ফলাফল)</option>
                        <option value="profile">Profile (প্রোফাইল)</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Emojis */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">Quick Emojis:</span>
                    {['🎮', '🔥', '🔑', '💰', '🏆', '💎', '📢', '✅', '⚡', '💖', '👉', '⚠️'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPushTitle((prev) => prev + ' ' + emoji)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Mobile Push Notification Preview (Matching Screenshot 2) */}
                <div className="mt-2 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2 font-rajdhani uppercase tracking-wider">
                    📱 Mobile Push Banner Preview (ইউজারদের স্ক্রিনে যেভাবে নোটিফিকেশন ভাসবে):
                  </span>

                  <div className="bg-gradient-to-b from-slate-700/80 to-slate-800/80 p-4 rounded-3xl border border-slate-700 max-w-sm mx-auto shadow-2xl">
                    <div className="text-center text-[10px] text-slate-300 font-mono mb-2 opacity-80">
                      12:21 AM • Thu, Aug 27
                    </div>

                    {/* Notification Card */}
                    <div className="bg-white/95 text-slate-900 rounded-3xl p-3.5 shadow-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-['Rajdhani',sans-serif]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-xs border border-amber-300">
                            <Gamepad2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                            Khelo FreeFire
                            <span className="text-slate-400">•</span>
                            <span className="text-[11px] text-slate-400 font-normal">now</span>
                            <Bell className="w-3 h-3 text-slate-400 fill-slate-400 ml-0.5 inline" />
                          </span>
                        </div>
                      </div>

                      <div className="pl-8 pr-1">
                        <h4 className="text-sm font-black text-slate-950 font-bengali leading-snug tracking-tight">
                          {pushTitle || 'সকালের ম্যাচ অ্যাড করা আছে'}
                        </h4>
                        <p className="text-xs font-semibold text-slate-700 font-bengali mt-0.5 leading-relaxed">
                          {pushMessage || 'জয়েন করে নিন'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Send Broadcast Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!pushTitle.trim()) {
                      onToast('⚠️ দয়া করে নোটিফিকেশন টাইটেল লিখুন!');
                      return;
                    }
                    if (onSendNotification) {
                      onSendNotification({
                        title: pushTitle.trim(),
                        message: pushMessage.trim(),
                        category: pushCategory,
                        linkTab: pushLinkTab,
                      });
                    }
                    onToast('🚀 পুশ নোটিফিকেশন সফলভাবে ব্রডকাস্ট করা হয়েছে!');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>BROADCAST PUSH NOTIFICATION (ইউজারদের পাঠান)</span>
                </button>

                {/* Sent Notifications List History */}
                {notifications.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2 font-rajdhani uppercase tracking-wider">
                      📜 Sent Notification History ({notifications.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-300 font-bengali truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-rajdhani">
                                ({item.timestamp})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bengali truncate mt-0.5">
                              {item.message}
                            </p>
                          </div>

                          {onDeleteNotification && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteNotification(item.id);
                                onToast('🗑️ নোটিফিকেশন ডিলিট করা হয়েছে');
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: APP ENTRY POPUP NOTICE MANAGER */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-rose-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black font-orbitron text-rose-400">
                        APP ENTRY NOTICE POPUP (অ্যাপে ঢোকার নোটিশ)
                      </h4>
                      <p className="text-xs text-slate-400 font-bengali">
                        ইউজার অ্যাপে ঢুকলেই স্ক্রিনে ভেসে উঠা নোটিশ বক্স এখান থেকে তৈরি ও নিয়ন্ত্রণ করুন।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-200 block font-rajdhani">
                      Enable Entry Notice Popup (নোটিশ পপআপ চালু রাখুন)
                    </span>
                    <span className="text-xs text-slate-400">
                      চালু থাকলে ইউজার অ্যাপে ঢুকলেই নোটিশটি পপআপ আকারে দেখতে পাবে।
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeEnabled}
                      onChange={(e) => setNoticeEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* Header Title */}
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1 font-rajdhani">
                    Popup Header Title (নোটিশের প্রধান শিরোনাম):
                  </label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="WELCOME TO KHELO FREE-FIRE 💖"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-4 py-2.5 text-rose-300 font-bold font-['Rajdhani',sans-serif] outline-none"
                  />
                </div>

                {/* Notice Points / Lines */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 block font-rajdhani">
                      Notice Bullet Lines (নোটিশের পয়েন্টসমূহ):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeTitle(DEFAULT_APP_NOTICE.title);
                        setNoticeLines([...DEFAULT_APP_NOTICE.content]);
                        onToast('🔄 ডিফল্ট নোটিশ লোড করা হয়েছে!');
                      }}
                      className="text-[11px] text-cyan-400 hover:underline font-bengali cursor-pointer"
                    >
                      ডিফল্ট নোটিশে রিসেট করুন
                    </button>
                  </div>

                  {/* List of lines */}
                  <div className="space-y-2">
                    {noticeLines.map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => {
                            const newLines = [...noticeLines];
                            newLines[idx] = e.target.value;
                            setNoticeLines(newLines);
                          }}
                          className="flex-1 bg-transparent text-xs text-slate-100 font-medium outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = noticeLines.filter((_, i) => i !== idx);
                            setNoticeLines(newLines);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Line */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newLineText}
                      onChange={(e) => setNewLineText(e.target.value)}
                      placeholder="নতুন কোনো নোটিশ পয়েন্ট যোগ করতে এখানে লিখুন..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newLineText.trim()) {
                          e.preventDefault();
                          setNoticeLines([...noticeLines, newLineText.trim()]);
                          setNewLineText('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newLineText.trim()) {
                          setNoticeLines([...noticeLines, newLineText.trim()]);
                          setNewLineText('');
                        }
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition font-rajdhani"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Line</span>
                    </button>
                  </div>

                  {/* Quick Emojis to Copy/Insert */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                    <span className="text-[11px] text-slate-400">Quick Emojis:</span>
                    {['➡️', '⬅️', '⚠️', '🔴', '🟣', '👉', '💖', '🏆', '💎', '👑', '🔥'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewLineText((prev) => prev + emoji)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time Preview in Admin */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2 font-rajdhani uppercase tracking-wider">
                    📱 Live User Preview (ইউজাররা যেভাবে দেখতে পাবে):
                  </span>
                  
                  <div className="bg-white text-slate-900 rounded-3xl p-5 border-2 border-slate-300 max-w-sm mx-auto shadow-xl">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h5 className="text-sm font-black font-['Rajdhani',sans-serif] text-rose-600 tracking-tight text-center">
                        {noticeTitle || 'NOTICE'}
                      </h5>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      {noticeLines.map((line, i) => (
                        <div key={i} className="leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                      <div className="px-6 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white rounded-full font-bold text-xs tracking-wider text-center">
                        OK
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={() => {
                    const updated: AppNotice = {
                      enabled: noticeEnabled,
                      title: noticeTitle.trim() || DEFAULT_APP_NOTICE.title,
                      content: noticeLines.filter((l) => l.trim().length > 0),
                    };
                    if (onUpdateNotice) {
                      onUpdateNotice(updated);
                    }
                    localStorage.setItem('ff_app_entry_notice', JSON.stringify(updated));
                    onToast('✅ অ্যাপের নোটিশ সফলভাবে সেভ ও আপডেট করা হয়েছে!');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE & UPDATE NOTICE (নোটিশ সেভ ও পাবলিশ করুন)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: DEDICATED PIN SECURITY TAB */}
          {activeTab === 'pin' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black font-orbitron text-amber-400">
                      ADMIN PIN SECURITY (পিন নিয়ন্ত্রণ)
                    </h4>
                    <p className="text-xs text-slate-400 font-bengali">
                      আপনার অ্যাডমিন প্যানেলের সিকিউরিটি পিন যেকোনো সময় নিজের ইচ্ছামতো পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-rajdhani">Current Secret PIN (বর্তমান পিন):</span>
                    <span className="text-xl font-mono font-black text-amber-300 tracking-widest">{adminPin}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                    🔒 ACTIVE & PROTECTED
                  </span>
                </div>

                <form onSubmit={handleChangePin} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-200 font-bold block mb-1 font-rajdhani">
                      নতুন ৪ থেকে ৮ ডিজিটের গোপন পিন দিন (Enter New PIN):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="যেমন: 5566 বা 9824"
                      className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-lg text-emerald-400 font-mono tracking-widest outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black font-orbitron text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95"
                  >
                    UPDATE & SAVE PIN (নতুন পিন সেভ করুন)
                  </button>
                </form>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200/90 font-bengali space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    ⚠️ জরুরি নির্দেশনা:
                  </p>
                  <p>• আপনি যে পিন সেট করবেন সেটি কাউকে বলবেন না।</p>
                  <p>• পরবর্তীতে অ্যাডমিন প্যানেলে ঢুকতে হলে অবশ্যই এই নতুন পিন কোডটি দিতে হবে।</p>
                  <p>• পিন ভুলে গেলে আপনি আনলক স্ক্রিনের "পিন পরিবর্তন করতে চান?" অপশন থেকেও রিসেট করতে পারবেন।</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS & PROFIT STATS */}
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
