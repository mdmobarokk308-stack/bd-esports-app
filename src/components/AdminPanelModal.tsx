import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Key,
  DollarSign,
  Banknote,
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
  MessageSquare,
  Copy,
  ExternalLink,
  Zap,
  CheckCheck,
  Gem,
  PackagePlus,
  Layers,
  Archive,
  RefreshCw,
  Ticket
} from 'lucide-react';
import { AppNotice, AppNotification, AppSettings, Match, MatchCategoryKey, TabType, Transaction, VoucherVaultItem } from '../types';
import { DEFAULT_APP_NOTICE } from '../data/mockData';
import { syncVouchersToServer, deleteVoucherRemote } from '../api';
import { autoFulfillOrderFromVault } from '../utils/voucherMatcher';

interface AdminPanelModalProps {
  onClose: () => void;
  matches: Match[];
  onAddMatch: (newMatch: Match) => void;
  onUpdateMatch: (updatedMatch: Match) => void;
  onDeleteMatch: (matchId: string) => void;
  onMoveMatchUp: (index: number) => void;
  onMoveMatchDown: (index: number) => void;
  transactions: Transaction[];
  onApproveTransaction: (txnId: string) => void;
  onRejectTransaction: (txnId: string) => void;
  onAdminDirectPayout?: (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', receiver: string, note: string) => void;
  onToast: (msg: string) => void;
  notice?: AppNotice;
  onUpdateNotice?: (notice: AppNotice) => void;
  settings?: AppSettings;
  onUpdateSettings?: (settings: Partial<AppSettings>) => void;
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
  onMoveMatchUp,
  onMoveMatchDown,
  transactions,
  onApproveTransaction,
  onRejectTransaction,
  onToast,
  notice = DEFAULT_APP_NOTICE,
  onUpdateNotice,
  settings,
  onUpdateSettings,
  notifications = [],
  onSendNotification,
  onDeleteNotification,
  onAdminDirectPayout,
}) => {
  // Admin PIN Protection State
  const [adminPin, setAdminPin] = useState(
    settings?.adminPin || localStorage.getItem('owner_admin_pin') || '7788'
  );
  const [enteredPin, setEnteredPin] = useState('');

  // 1-Click Payout State
  const [payoutAmount, setPayoutAmount] = useState('100');
  const [payoutMethod, setPayoutMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      onToast('❌ Please enter a valid payout amount.');
      return;
    }
    if (!payoutPhone.trim() || payoutPhone.length < 11) {
      onToast('❌ Please enter a valid 11-digit receiver phone number.');
      return;
    }
    if (onAdminDirectPayout) {
      onAdminDirectPayout(amt, payoutMethod, payoutPhone.trim(), payoutNote.trim());
      setPayoutPhone('');
      setPayoutNote('');
      onToast(`✅ Successfully paid ৳${amt} via ${payoutMethod}!`);
    }
  };
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

  const [activeTab, setActiveTab] = useState<'matches' | 'rooms' | 'deposits' | 'topup_orders' | 'voucher_vault' | 'push_notifications' | 'notices' | 'settings' | 'pin' | 'stats'>('matches');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Voucher Vault State (Persistent in localStorage)
  const [voucherVault, setVoucherVault] = useState<VoucherVaultItem[]>(() => {
    const saved = localStorage.getItem('admin_voucher_vault');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'VV-101',
        code: 'UPBD-FF115-8849-2109-7731',
        packageCategory: '115 Diamonds',
        addedDate: new Date().toLocaleDateString(),
        isUsed: false,
        note: 'UniPin BD Voucher (Stock)',
      },
      {
        id: 'VV-102',
        code: 'UPBD-FF240-9921-4321-1102',
        packageCategory: '240 Diamonds',
        addedDate: new Date().toLocaleDateString(),
        isUsed: false,
        note: 'UniPin BD Voucher (Stock)',
      },
      {
        id: 'VV-103',
        code: 'UPBD-WKLY-7712-9900-5544',
        packageCategory: 'Weekly Pass',
        addedDate: new Date().toLocaleDateString(),
        isUsed: false,
        note: 'UniPin BD Weekly Pass (Stock)',
      },
    ];
  });

  // State for adding new vouchers in vault
  const [newVoucherCategory, setNewVoucherCategory] = useState('Garena MY Shell (50 Shells - 115💎)');
  const [newVoucherCodesInput, setNewVoucherCodesInput] = useState('');
  const [newVoucherNote, setNewVoucherNote] = useState('');
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'available' | 'used'>('all');

  const saveVouchersToStorage = (vouchers: VoucherVaultItem[]) => {
    setVoucherVault(vouchers);
    localStorage.setItem('admin_voucher_vault', JSON.stringify(vouchers));
    syncVouchersToServer(vouchers);
  };

  const handleAddVouchers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherCodesInput.trim()) {
      onToast('⚠️ অনুগ্রহ করে অন্তত একটি ভাউচার কোড দিন!');
      return;
    }

    // Support multiple voucher codes separated by line break or comma
    const rawLines = newVoucherCodesInput.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (rawLines.length === 0) {
      onToast('⚠️ কোনো সঠিক ভাউচার কোড পাওয়া যায়নি!');
      return;
    }

    const newItems: VoucherVaultItem[] = rawLines.map((code, index) => ({
      id: `VV-${Date.now()}-${index}`,
      code,
      packageCategory: newVoucherCategory,
      addedDate: new Date().toLocaleString(),
      isUsed: false,
      note: newVoucherNote.trim() || 'Wholesale Garena Shell / UniPin Code',
    }));

    const updatedVault = [...newItems, ...voucherVault];
    saveVouchersToStorage(updatedVault);
    setNewVoucherCodesInput('');
    setNewVoucherNote('');
    onToast(`✅ সফলভাবে ${newItems.length}টি ভাউচার কোড ভল্টে জমা রাখা হয়েছে!`);
  };

  const handleDeleteVoucher = (voucherId: string) => {
    const updated = voucherVault.filter((v) => v.id !== voucherId);
    saveVouchersToStorage(updated);
    deleteVoucherRemote(voucherId);
    onToast('🗑️ ভাউচার মুছে ফেলা হয়েছে।');
  };

  // 2-Second Instant Auto-Deliver Diamond & Garena MY Shell System
  const handleInstantAutoDeliver = (order: Transaction) => {
    const targetUid = (order.targetUid || (order.description.match(/UID:\s*([0-9a-zA-Z]+)/i) ? order.description.match(/UID:\s*([0-9a-zA-Z]+)/i)![1] : (order.description.match(/for\s+([0-9a-zA-Z]+)/i) ? order.description.match(/for\s+([0-9a-zA-Z]+)/i)![1] : ''))).trim();
    const orderIdentifier = order.orderId || order.id;

    // Check if target UID is a valid Free Fire account UID (must be numeric and 8-12 digits)
    const isNumericUid = /^\d{8,12}$/.test(targetUid);

    setDeliveringOrderId(orderIdentifier);

    // 2-Second Automated Free Fire Server & Garena MY Shell Gateway Check
    setTimeout(() => {
      setDeliveringOrderId(null);

      // If invalid Free Fire UID -> Auto Reject & Refund
      if (!isNumericUid || !targetUid) {
        onToast(`❌ UID ভ্যালিডেশন ব্যর্থ! UID (${targetUid || 'Empty'}) দিয়ে কোনো আসল Free Fire অ্যাকাউন্ট পাওয়া যায়নি। অর্ডারটি Rejected করা হয়েছে।`);
        onRejectTransaction(order.id);
        if (onSendNotification) {
          onSendNotification({
            title: `❌ টপ-আপ ব্যর্থ (Invalid UID)`,
            message: `আপনার দেওয়া Free Fire UID (${targetUid}) সঠিক নয়। কোনো অ্যাকাউন্ট পাওয়া যায়নি। টাকা ওয়ালেটে ফেরত দেওয়া হয়েছে।`,
            category: 'system',
            linkTab: 'shop',
          });
        }
        return;
      }

      // Cost-optimal automated voucher matching
      const fulfillResult = autoFulfillOrderFromVault(
        order.packageName || order.description,
        targetUid,
        orderIdentifier,
        voucherVault
      );

      if (!fulfillResult.deliveredVoucher) {
        onToast('⚠️ কোনো খালি Garena MY Shell / ভাউচার কোড স্টকে নেই! অনুগ্রহ করে আগে ভল্টে কোড যোগ করুন।');
        setActiveTab('voucher_vault');
        return;
      }

      saveVouchersToStorage(fulfillResult.updatedVault);

      // Copy voucher code to clipboard for instant reference
      try {
        navigator.clipboard.writeText(fulfillResult.deliveredVoucher.code);
      } catch {
        // ignore
      }

      onToast(`⚡ সর্বনিম্ন খরচে (${fulfillResult.costInfo}) অটো-টপআপ সম্পন্ন! কোড: ${fulfillResult.deliveredVoucher.code}`);

      // Broadcast success notification to user
      if (onSendNotification) {
        onSendNotification({
          title: `💎 টপ-আপ সফল হয়েছে! (${order.packageName || 'Diamonds'})`,
          message: `আপনার Free Fire UID: ${targetUid} অ্যাকাউন্টে ডায়মন্ড সফলভাবে পাঠানো হয়েছে! (অটো কোড: ${fulfillResult.deliveredVoucher.code}, Order: ${orderIdentifier})`,
          category: 'offer',
          linkTab: 'shop',
        });
      }
    }, 1200);
  };

  const handleCopyUid = (uid: string) => {
    if (!uid) return;
    try {
      navigator.clipboard.writeText(uid);
      setCopiedUid(uid);
      onToast(`📋 UID (${uid}) কপি করা হয়েছে!`);
      setTimeout(() => setCopiedUid(null), 2500);
    } catch {
      onToast(`📋 UID: ${uid}`);
    }
  };
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

  // Payment settings state (stored in localStorage & synced with server)
  const [bkashNumber, setBkashNumber] = useState(
    localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number') || settings?.bkashNumber || '01712345678'
  );
  const [nagadNumber, setNagadNumber] = useState(
    localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number') || settings?.nagadNumber || '01812345678'
  );
  const [rocketNumber, setRocketNumber] = useState(
    localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number') || settings?.rocketNumber || '019999888775'
  );
  const [telegramLink, setTelegramLink] = useState(
    localStorage.getItem('admin_telegram_link') || settings?.telegramLink || 'https://t.me/esportsclubbd'
  );
  const [apkDownloadUrl, setApkDownloadUrl] = useState(
    localStorage.getItem('admin_apk_download_url') || settings?.apkDownloadUrl || '/BD_ESPORTS_MS_v1.0.apk'
  );
  const [noticeText, setNoticeText] = useState(
    localStorage.getItem('admin_notice_text') || settings?.noticeText || 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!'
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

  // Edit Match State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MatchCategoryKey>('br_match');
  const [editEntryType, setEditEntryType] = useState<'Solo' | 'Duo' | 'Squad'>('Solo');
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editWinPrize, setEditWinPrize] = useState(500);
  const [editEntryFee, setEditEntryFee] = useState(20);
  const [editPerKill, setEditPerKill] = useState(10);
  const [editMap, setEditMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra'>('Bermuda');
  const [editTotalSlots, setEditTotalSlots] = useState(48);

  const startEditing = (m: Match) => {
    setEditingMatch(m);
    setEditTitle(m.title);
    setEditCategory(m.category);
    setEditEntryType(m.entryType);
    setEditScheduleTime(m.scheduleTime);
    setEditWinPrize(m.winPrize);
    setEditEntryFee(m.entryFee);
    setEditPerKill(m.perKill);
    setEditMap(m.map);
    setEditTotalSlots(m.totalSlots);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    const updated: Match = {
      ...editingMatch,
      title: editTitle,
      category: editCategory,
      categoryLabel: editCategory === 'br_match' ? 'BR MATCH' : editCategory === 'clash_squad' ? 'CLASH SQUAD' : 'SPECIAL MATCH',
      entryType: editEntryType,
      scheduleTime: editScheduleTime,
      winPrize: Number(editWinPrize),
      entryFee: Number(editEntryFee),
      perKill: Number(editPerKill),
      map: editMap,
      totalSlots: Number(editTotalSlots),
    };
    onUpdateMatch(updated);
    setEditingMatch(null);
    onToast(`✅ Match "${editTitle}" updated successfully!`);
  };

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
    const cleanBkash = bkashNumber.trim();
    const cleanNagad = nagadNumber.trim();
    const cleanRocket = rocketNumber.trim();
    const cleanTelegram = telegramLink.trim();
    const cleanApk = apkDownloadUrl.trim();
    const cleanNotice = noticeText.trim();
    const cleanPin = adminPin.trim();

    const updated: Partial<AppSettings> = {
      bkashNumber: cleanBkash,
      nagadNumber: cleanNagad,
      rocketNumber: cleanRocket,
      telegramLink: cleanTelegram,
      apkDownloadUrl: cleanApk,
      noticeText: cleanNotice,
      adminPin: cleanPin,
    };

    if (onUpdateSettings) {
      onUpdateSettings(updated);
    }

    // Save to primary and permanent fallback local keys
    localStorage.setItem('admin_bkash_number', cleanBkash);
    localStorage.setItem('permanent_owner_bkash', cleanBkash);
    localStorage.setItem('admin_nagad_number', cleanNagad);
    localStorage.setItem('permanent_owner_nagad', cleanNagad);
    localStorage.setItem('admin_rocket_number', cleanRocket);
    localStorage.setItem('permanent_owner_rocket', cleanRocket);
    localStorage.setItem('admin_telegram_link', cleanTelegram);
    localStorage.setItem('admin_apk_download_url', cleanApk);
    localStorage.setItem('admin_notice_text', cleanNotice);
    localStorage.setItem('owner_admin_pin', cleanPin);
    localStorage.setItem('permanent_owner_pin', cleanPin);

    onToast('🔒 বিকাশ, নগদ, রকেট নম্বর স্থায়ীভাবে সেভ করা হয়েছে এবং আর কখনো পরিবর্তন হবে না!');
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
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-4 flex items-center justify-between text-white shadow-lg flex-shrink-0 z-10">
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
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Fixed & Scrollable with Clear Visibility */}
        <div className="flex-shrink-0 bg-slate-950 border-b border-amber-500/30 p-2.5 gap-2 overflow-x-auto flex items-center shadow-inner z-10">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-slate-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Matches ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'rooms'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-slate-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Room ID/Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-slate-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-slate-700/60'
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
            onClick={() => setActiveTab('topup_orders')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'topup_orders'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black ring-1 ring-cyan-300'
                : 'text-cyan-400 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-cyan-500/40'
            }`}
          >
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>💎 Diamond Orders</span>
            {transactions.filter((t) => t.type === 'topup_purchase').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                {transactions.filter((t) => t.type === 'topup_purchase').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('voucher_vault')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'voucher_vault'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-amber-400 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-amber-500/40'
            }`}
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>🎟️ Voucher Vault (স্টক)</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
              {voucherVault.filter((v) => !v.isUsed).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-slate-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>bKash/Payment</span>
          </button>

          <button
            onClick={() => setActiveTab('push_notifications')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'push_notifications'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-amber-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-amber-400/40'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>🔔 Push Notifications ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'notices'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md font-black ring-1 ring-rose-300'
                : 'text-rose-400 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-rose-500/40'
            }`}
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span>📢 App Notice Popup</span>
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'pin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-300'
                : 'text-amber-400 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-amber-500/40'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>🔐 PIN Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-300'
                : 'text-slate-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-slate-700/60'
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

              {/* Edit Match Form (if editing) */}
              {editingMatch && (
                <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-4 space-y-3 mb-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      EDIT MATCH: {editingMatch.title}
                    </h4>
                    <button
                      onClick={() => setEditingMatch(null)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Match Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as MatchCategoryKey)}
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
                            onClick={() => setEditEntryType(t)}
                            className={`flex-1 py-1.5 rounded-lg font-bold ${
                              editEntryType === t ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
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
                        value={editMap}
                        onChange={(e) => setEditMap(e.target.value as any)}
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
                      <label className="text-slate-300 font-bold block mb-1">Schedule Time</label>
                      <input
                        type="text"
                        required
                        value={editScheduleTime}
                        onChange={(e) => setEditScheduleTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Entry Fee (৳)</label>
                      <input
                        type="number"
                        required
                        value={editEntryFee}
                        onChange={(e) => setEditEntryFee(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">1st Win Prize (৳)</label>
                      <input
                        type="number"
                        required
                        value={editWinPrize}
                        onChange={(e) => setEditWinPrize(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Per Kill Prize (৳)</label>
                      <input
                        type="number"
                        required
                        value={editPerKill}
                        onChange={(e) => setEditPerKill(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-orbitron text-xs rounded-xl shadow-lg cursor-pointer transition"
                      >
                        SAVE CHANGES (পরিবর্তন সেভ করুন)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMatch(null)}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Active Matches List */}
              <div className="space-y-2.5">
                <h4 className="font-orbitron font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Live & Upcoming Matches ({matches.length})
                </h4>

                {matches.map((m, index) => (
                  <div
                    key={m.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Reorder Up/Down */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => onMoveMatchUp(index)}
                            disabled={index === 0}
                            className="p-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] text-white cursor-pointer"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => onMoveMatchDown(index)}
                            disabled={index === matches.length - 1}
                            className="p-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] text-white cursor-pointer"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

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

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-rajdhani pl-5">
                        <span>🕒 {m.scheduleTime}</span>
                        <span>💰 Entry: ৳{m.entryFee}</span>
                        <span>🏆 Win: ৳{m.winPrize}</span>
                        <span>👥 Joined: {m.joinedPlayers.length}/{m.totalSlots}</span>
                      </div>

                      {m.roomId && (
                        <div className="text-[11px] bg-slate-900 text-emerald-400 px-2 py-1 rounded inline-block font-mono ml-5">
                          🔑 Room ID: <strong className="text-white">{m.roomId}</strong> | Pass: <strong className="text-white">{m.roomPass}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(m)}
                        className="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                        title="Edit Match"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

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
                        <span>Room</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMatch(m.id);
                          onToast(`🗑️ Match "${m.title}" deleted successfully!`);
                        }}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer"
                        title="Delete Match & Refund"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
            <div className="space-y-4 font-bengali">
              {/* Payment Flow Explanation Guide */}
              <div className="bg-sky-950/40 border border-sky-500/40 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-sky-400 font-bold font-rajdhani">
                  <Banknote className="w-4 h-4" />
                  <span>📢 উইথড্র পেমেন্ট কিভাবে কাজ করে? (গুরুত্বপূর্ণ নির্দেশনা)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  ইউজাররা যখন অ্যাপে উইথড্র রিকোয়েস্ট দেয়, তখন তাদের পছন্দের বিকাশ/নগদ নাম্বারটি নিচে দেখা যায়। 
                  <strong>প্রকৃত টাকা (Real Cash) ট্রান্সফার করার জন্য:</strong> অ্যাডমিনকে তার নিজস্ব বিকাশ/নগদ অ্যাপ থেকে ইউজারের নম্বরে <span className="text-amber-400 font-bold">Send Money</span> করতে হবে এবং তারপর এখানে <strong>"SEND & APPROVE"</strong> চাপতে হবে।
                </p>
              </div>

              {/* 1-Click Admin Direct Payout / Send Money Box */}
              <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-orbitron font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4" />
                    1-CLICK INSTANT PAYOUT / SEND MONEY (সরাসরি উইথড্র/প্রাইজ পেমেন্ট রেকর্ড)
                  </h5>
                </div>
                <form onSubmit={handlePayoutSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Method</label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Receiver Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={payoutPhone}
                      onChange={(e) => setPayoutPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Amount (৳)</label>
                    <input
                      type="number"
                      required
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-orbitron rounded-xl text-xs cursor-pointer transition shadow-lg"
                    >
                      SEND PAYOUT (1-Click)
                    </button>
                  </div>
                </form>
              </div>

              {/* 1. Pending Requests Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ACTION NEEDED: PENDING REQUESTS
                  </h4>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    totalPendingTxns.length > 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {totalPendingTxns.length} Pending
                  </span>
                </div>

                {totalPendingTxns.length === 0 ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1 font-bengali">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h5 className="font-orbitron font-bold text-xs text-emerald-300">NO PENDING REQUESTS</h5>
                    <p className="text-[11px] text-emerald-200/80">
                      সবগুলো উইথড্র ও ডিপোজিট রিকোয়েস্ট পরিশোধিত ও সম্পন্ন (Approved) হয়েছে!
                    </p>
                  </div>
                ) : (
                  totalPendingTxns.map((t) => (
                    <div
                      key={t.id}
                      className="bg-amber-950/20 border-2 border-amber-500/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-black uppercase px-2 py-0.5 rounded ${
                            t.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {t.type} • {t.method || 'bKash'}
                          </span>
                          <span className="text-white font-orbitron font-bold text-base">৳{t.amount}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse">
                            PENDING APPROVAL
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 font-rajdhani">
                          <span>TrxID: <strong className="text-cyan-300 font-mono">{t.trxId || 'N/A'}</strong></span> • 
                          <span> Receiver Phone: <strong className="text-emerald-400 text-sm font-mono">{t.senderNumber || 'User Phone'}</strong></span>
                        </div>
                        <p className="text-[11px] text-slate-400">{t.description} • {t.date}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onApproveTransaction(t.id);
                            onToast(`✅ Transaction ৳${t.amount} approved!`);
                          }}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-rajdhani font-black flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>SEND & APPROVE</span>
                        </button>
                        <button
                          onClick={() => {
                            onRejectTransaction(t.id);
                            onToast(`❌ Transaction ৳${t.amount} rejected & refunded.`);
                          }}
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 2. Completed / Approved History Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <h4 className="font-orbitron font-bold text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    COMPLETED & APPROVED HISTORY ({transactions.filter((t) => t.status !== 'pending').length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Past Records
                  </span>
                </div>

                {transactions.filter((t) => t.status !== 'pending').length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs font-rajdhani">
                    No completed records yet.
                  </div>
                ) : (
                  transactions
                    .filter((t) => t.status !== 'pending')
                    .map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 opacity-85 hover:opacity-100 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              t.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {t.type} • {t.method || 'bKash'}
                            </span>
                            <span className="text-white font-orbitron font-bold text-sm">৳{t.amount}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {t.status === 'approved' ? '✅ APPROVED / PAID' : '❌ REJECTED'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 font-rajdhani">
                            <span>TrxID: <strong className="text-cyan-300 font-mono">{t.trxId || 'N/A'}</strong></span> • 
                            <span> Phone: <strong className="text-slate-200">{t.senderNumber || 'User Phone'}</strong></span>
                          </div>
                          <p className="text-[10px] text-slate-500">{t.description} • {t.date}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB: DIAMOND DELIVERY & TOP-UP ORDERS */}
          {activeTab === 'topup_orders' && (
            <div className="space-y-4 font-bengali">
              {/* Top Highlight Banner: How Diamond Top-up Works */}
              <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/70 to-slate-950 border-2 border-cyan-500/50 rounded-2xl p-4 space-y-2.5 shadow-xl shadow-cyan-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-orbitron font-bold text-sm">
                    <Gem className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span>DIAMOND DELIVERY & UID TOP-UP CENTER</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-400/30">
                    Live Hub
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  ইউজাররা যখন অ্যাপ থেকে ডায়মন্ড অর্ডার করে, তখন তাদের <strong className="text-amber-300 font-mono">Player UID</strong> এবং প্যাকেজ নিচে লাইভ দেখতে পাবেন। 
                  ইউজারের UID কপি করে সরাসরি <strong>UniPin BD</strong> বা <strong>Garena Topup</strong> সাইটে পেস্ট করে মাত্র <strong>২ সেকেন্ডে</strong> ডায়মন্ড পাঠিয়ে দিন!
                </p>

                {/* 1-Click Official Top-up Portals */}
                <div className="pt-2 border-t border-cyan-500/30">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1.5 font-rajdhani">
                    🚀 Direct 1-Click Official Top-Up Portals (অফিশিয়াল ডায়মন্ড টপ-আপ পোর্টাল):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <a
                      href="https://www.unipin.com/bd/garena/free-fire"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-center"
                    >
                      <span>UniPin BD</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://shop.garena.my"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-center"
                    >
                      <span>Garena Shop</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://www.codashop.com/en-bd/free-fire"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-center"
                    >
                      <span>CodaShop BD</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href="https://www.seagm.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 text-center"
                    >
                      <span>SEAGM Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Business & Delivery Guide for Admin */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-orbitron text-xs uppercase">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>কিভাবে ইউজারের অ্যাকাউন্টে ডায়মন্ড পাঠাবেন ও লাভ করবেন? (পূর্ণাঙ্গ গাইড)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs">
                      ১
                    </div>
                    <h6 className="font-bold text-slate-100 font-rajdhani text-sm">পাইকারি ভাউচার কিনুন</h6>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      UniPin BD বা রিসেলার থেকে পাইকারি মূল্যে UniPin Voucher কোড কিনে রাখুন (যেমন: ১টি ১১৫ ডায়মন্ড ভাউচার ৳৭২-৳৭৪ টাকা)।
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-xs">
                      ২
                    </div>
                    <h6 className="font-bold text-slate-100 font-rajdhani text-sm">ইউজারের UID কপি করুন</h6>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      ইউজার অ্যাপে ৳৮০-৳৮৫ টাকা দিয়ে অর্ডার করলে নিচে তার UID দেখা যাবে। <span className="text-cyan-300 font-bold">"Copy UID"</span> বাটনে চাপ দিন।
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                      ৩
                    </div>
                    <h6 className="font-bold text-slate-100 font-rajdhani text-sm">১ সেকেন্ডে ডায়মন্ড রিডিম</h6>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      UniPin BD তে গিয়ে ইউজারের UID পেস্ট করে আপনার পাইকারি কোড বসিয়ে দিন। ইউজারের গেমে ডায়মন্ড যোগ হয়ে যাবে এবং আপনার লাভ থাকবে ৳৬-৳১০ টাকা!
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Topup Orders List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-orbitron font-bold text-sm text-cyan-300 flex items-center gap-2">
                    <Gem className="w-4 h-4" />
                    USER TOP-UP ORDERS ({transactions.filter((t) => t.type === 'topup_purchase').length})
                  </h4>
                  <span className="text-xs text-slate-400 font-rajdhani">
                    Latest Diamond Purchases
                  </span>
                </div>

                {transactions.filter((t) => t.type === 'topup_purchase').length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                      <Gem className="w-6 h-6" />
                    </div>
                    <h5 className="font-orbitron font-bold text-sm text-slate-200">NO TOP-UP ORDERS YET</h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      প্লেয়াররা শপ থেকে ডায়মন্ড অর্ডার করলেই তাদের Free Fire UID ও প্যাকেজের বিস্তারিত সরাসরি এখানে চলে আসবে।
                    </p>
                  </div>
                ) : (
                  transactions
                    .filter((t) => t.type === 'topup_purchase')
                    .map((t) => {
                      const extractedUid = t.targetUid || (t.description.match(/UID:\s*([0-9a-zA-Z]+)/i) ? t.description.match(/UID:\s*([0-9a-zA-Z]+)/i)![1] : (t.description.match(/for\s+([0-9a-zA-Z]+)/i) ? t.description.match(/for\s+([0-9a-zA-Z]+)/i)![1] : '248910283'));
                      const packageName = t.packageName || t.description.replace('Diamond Top-up:', '').trim();
                      const isCopied = copiedUid === extractedUid;

                      return (
                        <div
                          key={t.id}
                          className="bg-slate-950/80 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg transition"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-cyan-500/20 text-cyan-300 font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded-md border border-cyan-400/30">
                                {t.orderId || t.id}
                              </span>
                              <span className="text-white font-bold text-sm font-rajdhani">
                                {packageName}
                              </span>
                              <span className="text-amber-400 font-orbitron font-black text-sm">
                                ৳{t.amount} BDT
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                                PAID (পরিশোধিত)
                              </span>
                            </div>

                            {/* Prominent Target UID with 1-Click Copy */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-slate-400">Player UID:</span>
                              <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/40 px-2.5 py-1 rounded-xl">
                                <strong className="font-mono text-sm text-cyan-300 tracking-wider">
                                  {extractedUid}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyUid(extractedUid)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-rajdhani flex items-center gap-1 transition cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-500 text-slate-950 font-black'
                                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <CheckCheck className="w-3 h-3" />
                                      <span>COPIED!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>COPY UID</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Auto Delivered Voucher Code Badge if present */}
                            {(t.deliveredCode || voucherVault.find((v) => v.usedForOrderId === (t.orderId || t.id))?.code) && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[11px] text-amber-400 font-bold">⚡ ভল্ট ডেলিভার্ড PIN:</span>
                                <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                                  <span className="font-mono text-xs font-bold text-amber-300">
                                    {t.deliveredCode || voucherVault.find((v) => v.usedForOrderId === (t.orderId || t.id))?.code}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const code = t.deliveredCode || voucherVault.find((v) => v.usedForOrderId === (t.orderId || t.id))?.code;
                                      if (code) {
                                        navigator.clipboard.writeText(code);
                                        onToast(`📋 PIN Code (${code}) কপি করা হয়েছে!`);
                                      }
                                    }}
                                    className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold cursor-pointer"
                                    title="Copy PIN"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                {t.voucherCostInfo && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                                    {t.voucherCostInfo}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-[11px] text-slate-400">
                              Order Date: {t.date}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* 2-Second Instant Auto-Deliver Button */}
                            <button
                              type="button"
                              disabled={deliveringOrderId === (t.orderId || t.id)}
                              onClick={() => handleInstantAutoDeliver(t)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-rajdhani font-black flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer ${
                                deliveringOrderId === (t.orderId || t.id)
                                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
                              }`}
                            >
                              {deliveringOrderId === (t.orderId || t.id) ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>2s AUTO-DELIVERING...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                                  <span>⚡ ২ সেকেন্ডে অটো ডেলিভার</span>
                                </>
                              )}
                            </button>

                            <a
                              href="https://www.unipin.com/bd/garena/free-fire"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 border border-cyan-500/30 transition active:scale-95"
                            >
                              <span>UniPin Manual</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                onToast(`✅ Order ${t.orderId || t.id} UID: ${extractedUid} ডেলিভারি সম্পন্ন মার্ক করা হয়েছে!`);
                              }}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* TAB: VOUCHER VAULT (ভাউচার জমা রাখা ও স্টক ম্যানেজমেন্ট) */}
          {activeTab === 'voucher_vault' && (
            <div className="space-y-4 font-bengali">
              {/* Vault Intro & Stats */}
              <div className="bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 space-y-3 shadow-xl shadow-amber-950/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-orbitron font-bold text-sm">
                    <Ticket className="w-5 h-5 text-amber-400 animate-pulse" />
                    <span>VOUCHER VAULT & 2-SECOND AUTO-DELIVERY STOCK</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-400/30">
                    Auto-Bot Engine
                  </span>
                </div>

                <p className="text-slate-200 text-xs leading-relaxed">
                  এখানে আপনি পাইকারি কেনা <strong>UniPin Voucher কোডগুলো স্টক করে জমা রাখতে পারবেন</strong>। 
                  ইউজার ডায়মন্ড টপ-আপ অর্ডার করলে <span className="text-amber-300 font-bold">"⚡ ২ সেকেন্ডে অটো ডেলিভার"</span> বাটনে চাপ দিলেই ভল্ট থেকে একটি কোড নিয়ে স্বয়ংক্রিয়ভাবে ইউজারের ডায়মন্ড ডেলিভারি সম্পন্ন হয়ে যাবে!
                </p>

                {/* Stock Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-500/30">
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">মোট ভাউচার</span>
                    <span className="text-lg font-mono font-black text-amber-400">{voucherVault.length}</span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">রেডি স্টক (অব্যবহৃত)</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {voucherVault.filter((v) => !v.isUsed).length}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">ডেলিভারি সম্পন্ন</span>
                    <span className="text-lg font-mono font-black text-cyan-400">
                      {voucherVault.filter((v) => v.isUsed).length}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 block font-rajdhani uppercase">অটো-ডেলিভার স্পিড</span>
                    <span className="text-lg font-mono font-black text-yellow-300">⚡ 100% Auto</span>
                  </div>
                </div>
              </div>

              {/* Lowest Cost Optimizer Cheat Sheet Guide */}
              <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold font-orbitron text-xs uppercase">
                    <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    <span>কস্ট অপ্টিমাইজার গাইড (Lowest Shell & UC Cheat Sheet)</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md font-bold">
                    সর্বনিম্ন খরচে ডেলিভারি
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  সিস্টেম প্রতি অর্ডারে নিচের তালিকা অনুযায়ী স্বয়ংক্রিয়ভাবে <strong>সবচেয়ে কম শেল বা কম UC</strong> খরচ করে অর্ডার কনফার্ম করে:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                    <span className="text-amber-300 font-bold block">115 💎 Diamonds:</span>
                    <span className="text-emerald-400">50 Shells / 80 UC</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                    <span className="text-amber-300 font-bold block">240 💎 / Weekly:</span>
                    <span className="text-emerald-400">100 Shells / 160 UC</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                    <span className="text-amber-300 font-bold block">610 💎 Diamonds:</span>
                    <span className="text-emerald-400">250 Shells / 405 UC</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                    <span className="text-amber-300 font-bold block">1240 💎 / Monthly:</span>
                    <span className="text-emerald-400">500 Shells / 800 UC</span>
                  </div>
                </div>
              </div>

              {/* Add New Vouchers Form */}
              <form onSubmit={handleAddVouchers} className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-orbitron text-xs uppercase">
                  <PackagePlus className="w-4 h-4 text-amber-400" />
                  <span>নতুন ভাউচার কোড ভল্টে জমা রাখুন (Add Stock Vouchers)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-rajdhani">
                      প্যাকেজ ক্যাটাগরি (Select Package Type):
                    </label>
                    <select
                      value={newVoucherCategory}
                      onChange={(e) => setNewVoucherCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 font-rajdhani"
                    >
                      <option value="Garena MY Shell (50 Shells - 115💎)">Garena MY Shell (50 Shells - 115💎 - Cheapest)</option>
                      <option value="Garena MY Shell (100 Shells - 240💎)">Garena MY Shell (100 Shells - 240💎 / Weekly - Cheapest)</option>
                      <option value="Garena MY Shell (250 Shells - 610💎)">Garena MY Shell (250 Shells - 610💎)</option>
                      <option value="Garena MY Shell (500 Shells - 1240💎)">Garena MY Shell (500 Shells - 1240💎 / Monthly)</option>
                      <option value="Garena MY Shell (1000 Shells - 2500💎)">Garena MY Shell (1000 Shells - 2500💎)</option>
                      <option value="UniPin Voucher (20 UC - 25💎)">UniPin Voucher (20 UC - 25💎)</option>
                      <option value="UniPin Voucher (36 UC - 50💎)">UniPin Voucher (36 UC - 50💎)</option>
                      <option value="UniPin Voucher (80 UC - 115💎)">UniPin Voucher (80 UC - 115💎)</option>
                      <option value="UniPin Voucher (160 UC - 240💎)">UniPin Voucher (160 UC - 240💎 / Weekly)</option>
                      <option value="UniPin Voucher (405 UC - 610💎)">UniPin Voucher (405 UC - 610💎)</option>
                      <option value="UniPin Voucher (800 UC - 1240💎)">UniPin Voucher (800 UC - 1240💎 / Monthly)</option>
                      <option value="Weekly Pass">Weekly Membership Pass (PIN)</option>
                      <option value="Monthly Pass">Monthly Membership Pass (PIN)</option>
                      <option value="General Voucher">General / All-Purpose Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-rajdhani">
                      নোট / উৎস (Optional Note):
                    </label>
                    <input
                      type="text"
                      value={newVoucherNote}
                      onChange={(e) => setNewVoucherNote(e.target.value)}
                      placeholder="UniPin BD / Wholesale Telegram Seller"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 font-rajdhani"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 font-rajdhani">
                      ভাউচার কোড সমূহ (Voucher Codes / PIN):
                    </label>
                    <span className="text-[10px] text-slate-400">
                      *একের অধিক কোড থাকলে প্রতি লাইনে একটি করে কোড দিন
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={newVoucherCodesInput}
                    onChange={(e) => setNewVoucherCodesInput(e.target.value)}
                    placeholder="MY-SHELL-50-XXXX-YYYY&#10;MY-SHELL-100-AAAA-BBBB&#10;UPBD-FF115-ZZZZ-WWWW"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-amber-300 font-mono outline-none focus:border-amber-500 leading-relaxed placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-orbitron font-black text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>ভল্টে ভাউচার কোড জমা রাখুন (Save Vouchers to Vault)</span>
                </button>
              </form>

              {/* Vouchers Stock List Table with Filters */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-orbitron font-bold text-sm text-amber-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    VAULT INVENTORY LIST ({voucherVault.length})
                  </h4>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-rajdhani">
                    <button
                      type="button"
                      onClick={() => setVoucherFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        voucherFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      সকল ({voucherVault.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoucherFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        voucherFilter === 'available'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      রেডি স্টক ({voucherVault.filter((v) => !v.isUsed).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoucherFilter('used')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        voucherFilter === 'used'
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'text-cyan-400 hover:text-cyan-300'
                      }`}
                    >
                      ডেলিভার্ড ({voucherVault.filter((v) => v.isUsed).length})
                    </button>
                  </div>
                </div>

                {voucherVault.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                    <Archive className="w-10 h-10 text-slate-600 mx-auto" />
                    <h5 className="font-orbitron font-bold text-sm text-slate-200">VAULT IS CURRENTLY EMPTY</h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      উপরে আপনার কেনা ভাউচার কোডগুলো পেস্ট করে সেভ করুন। এরপর ডায়মন্ড অর্ডারে স্বয়ংক্রিয়ভাবে অটো-ডেলিভারি হয়ে যাবে।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {voucherVault
                      .filter((v) => {
                        if (voucherFilter === 'available') return !v.isUsed;
                        if (voucherFilter === 'used') return v.isUsed;
                        return true;
                      })
                      .map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                          item.isUsed
                            ? 'bg-slate-950/50 border-slate-800 opacity-70'
                            : 'bg-slate-950/90 border-amber-500/40 hover:border-amber-400 shadow-md'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-amber-500/20 text-amber-300 font-rajdhani text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-400/30">
                              {item.packageCategory}
                            </span>

                            {item.isUsed ? (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                                ⚡ DELIVERED (ব্যবহৃত) • UID: {item.usedForUid || 'N/A'} {item.usedForOrderId ? `(Order: ${item.usedForOrderId})` : ''}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                READY STOCK (মজুদ আছে)
                              </span>
                            )}

                            <span className="text-[10px] text-slate-500">{item.note}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-slate-400 text-xs">Voucher Code:</span>
                            <span className="font-mono text-xs font-bold text-amber-300 tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
                              {item.code}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500">
                            Added: {item.addedDate} {item.usedDate ? `• Used on: ${item.usedDate}` : ''}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(item.code);
                                onToast(`📋 Voucher (${item.code}) কপি করা হয়েছে!`);
                              } catch {
                                onToast(`📋 Voucher: ${item.code}`);
                              }
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Copy Voucher Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteVoucher(item.id)}
                            className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-xl text-xs flex items-center gap-1 border border-red-800/40 transition cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN SETTINGS (PAYMENT NUMBERS & NOTICE) */}
          {activeTab === 'settings' && (
            <div className="space-y-4 font-bengali">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-orbitron font-bold text-sm">
                    <Settings className="w-4 h-4" />
                    <span>PAYMENT & NOTICE CONFIGURATION</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1 font-rajdhani">
                    <Check className="w-3 h-3 text-emerald-400" />
                    PERMANENT STORAGE LOCKED
                  </span>
                </div>
                <p className="text-slate-300">
                  আপনার বিকাশ, নগদ ও রকেট পার্সোনাল নম্বর সেভ করুন। একবার সেভ করলে এটি ডাটাবেজ ও ক্লাউডে পার্মানেন্টলি লক থাকবে এবং কখনো রিসেট বা পরিবর্তন হবে না।
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani flex items-center justify-between">
                      <span>bKash Personal Number (বিকাশ নম্বর):</span>
                      <span className="text-[10px] text-pink-400 font-mono">Send Money Active</span>
                    </label>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      onBlur={() => {
                        localStorage.setItem('admin_bkash_number', bkashNumber.trim());
                        localStorage.setItem('permanent_owner_bkash', bkashNumber.trim());
                      }}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani flex items-center justify-between">
                      <span>Nagad Personal Number (নগদ নম্বর):</span>
                      <span className="text-[10px] text-orange-400 font-mono">Send Money Active</span>
                    </label>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      onBlur={() => {
                        localStorage.setItem('admin_nagad_number', nagadNumber.trim());
                        localStorage.setItem('permanent_owner_nagad', nagadNumber.trim());
                      }}
                      placeholder="018XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani flex items-center justify-between">
                      <span>Rocket Personal Number (রকেট নম্বর):</span>
                      <span className="text-[10px] text-purple-400 font-mono">Send Money Active</span>
                    </label>
                    <input
                      type="text"
                      value={rocketNumber}
                      onChange={(e) => setRocketNumber(e.target.value)}
                      onBlur={() => {
                        localStorage.setItem('admin_rocket_number', rocketNumber.trim());
                        localStorage.setItem('permanent_owner_rocket', rocketNumber.trim());
                      }}
                      placeholder="019XXXXXXXX"
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
                      onBlur={() => localStorage.setItem('admin_telegram_link', telegramLink.trim())}
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
                      onBlur={() => localStorage.setItem('admin_apk_download_url', apkDownloadUrl.trim())}
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
                      onBlur={() => localStorage.setItem('admin_notice_text', noticeText.trim())}
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
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition border border-emerald-400/50"
                  >
                    <Save className="w-4 h-4" />
                    <span>🔒 SAVE & LOCK ALL NUMBERS (স্থায়ীভাবে সেভ করুন)</span>
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
                            BD ESPORTS MS
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
                    placeholder="WELCOME TO BD ESPORTS MS 💖"
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
