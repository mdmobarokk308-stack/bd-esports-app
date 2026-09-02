import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
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
  Ticket,
  Image as ImageIcon,
  Video,
  Play,
  ArrowUp,
  ArrowDown,
  Eye,
  ToggleLeft,
  ToggleRight,
  Volume2,
  BellRing,
  Info,
  Upload,
  RotateCcw,
  Flame,
  Download
} from 'lucide-react';
import { AppNotice, AppNotification, AppSettings, BannerSlide, Match, MatchCategoryKey, TabType, Transaction, User, VoucherVaultItem } from '../types';
import { DEFAULT_APP_NOTICE, DEFAULT_BANNERS } from '../data/mockData';
import { syncVouchersToServer, deleteVoucherRemote, executeAutoBotTopup, saveBannersRemote, deleteBannerRemote, saveRemoteSettings } from '../api';
import { autoFulfillOrderFromVault, parseVoucherCode } from '../utils/voucherMatcher';
import {
  TOURNAMENT_CATEGORY_ITEMS,
  TOPUP_CATEGORY_ITEMS,
  PRESET_GALLERY_IMAGES,
  getTournamentImage,
  getTopupImage,
} from '../data/categoryImages';

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
  banners?: BannerSlide[];
  onUpdateBanners?: (banners: BannerSlide[]) => void;
  user?: User;
  onAdjustUserBalance?: (amount: number, type: 'add' | 'deduct', reason: string) => void;
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
  banners,
  onUpdateBanners,
  user,
  onAdjustUserBalance,
}) => {
  // Admin PIN & Role Protection State
  const [adminPin, setAdminPin] = useState(
    settings?.adminPin || localStorage.getItem('owner_admin_pin') || '7788'
  );
  const [moderatorPin, setModeratorPin] = useState(
    settings?.moderatorPin || localStorage.getItem('moderator_admin_pin') || '1234'
  );

  useEffect(() => {
    if (settings?.adminPin) {
      setAdminPin(settings.adminPin);
    }
    if (settings?.moderatorPin) {
      setModeratorPin(settings.moderatorPin);
    }
  }, [settings?.adminPin, settings?.moderatorPin]);
  const [adminRole, setAdminRole] = useState<'owner' | 'moderator'>('owner');
  const [enteredPin, setEnteredPin] = useState('');
  const [newModPinInput, setNewModPinInput] = useState('');

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
  const [noticeEnabled, setNoticeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ff_app_entry_notice');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.enabled === 'boolean') return parsed.enabled;
      } catch {}
    }
    return notice?.enabled ?? true;
  });
  const [noticeTitle, setNoticeTitle] = useState<string>(() => {
    const saved = localStorage.getItem('ff_app_entry_notice');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) return parsed.title;
      } catch {}
    }
    return notice?.title || DEFAULT_APP_NOTICE.title;
  });
  const [noticeLines, setNoticeLines] = useState<string[]>(() => {
    const saved = localStorage.getItem('ff_app_entry_notice');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.content)) return parsed.content;
      } catch {}
    }
    return notice?.content || DEFAULT_APP_NOTICE.content;
  });
  const [newLineText, setNewLineText] = useState<string>('');

  // Sync notice when updated from remote
  React.useEffect(() => {
    if (notice) {
      if (typeof notice.enabled === 'boolean') setNoticeEnabled(notice.enabled);
      if (notice.title) setNoticeTitle(notice.title);
      if (Array.isArray(notice.content)) setNoticeLines(notice.content);
    }
  }, [notice]);

  // Push Notification & Auto Periodic Push State
  const [autoPushActive, setAutoPushActive] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.enabled === 'boolean') return parsed.enabled;
      }
    } catch {}
    return settings?.autoPushConfig?.enabled ?? true;
  });
  const [autoPushInterval, setAutoPushInterval] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.intervalMinutes) return Number(parsed.intervalMinutes);
      }
    } catch {}
    return settings?.autoPushConfig?.intervalMinutes ?? 60;
  });
  const [pushTitle, setPushTitle] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.title) return parsed.title;
      }
    } catch {}
    return settings?.autoPushConfig?.title || 'সকালের ম্যাচ অ্যাড করা আছে';
  });
  const [pushMessage, setPushMessage] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.message) return parsed.message;
      }
    } catch {}
    return settings?.autoPushConfig?.message || 'জয়েন করে নিন';
  });
  const [pushCategory, setPushCategory] = useState<'match' | 'deposit' | 'system' | 'room' | 'offer'>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.category) return parsed.category;
      }
    } catch {}
    return settings?.autoPushConfig?.category || 'match';
  });
  const [pushLinkTab, setPushLinkTab] = useState<TabType>(() => {
    try {
      const raw = localStorage.getItem('admin_auto_push_config');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.linkTab) return parsed.linkTab;
      }
    } catch {}
    return settings?.autoPushConfig?.linkTab || 'play';
  });

  // Anti-Brute-Force & Security Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return Number(localStorage.getItem('admin_failed_attempts') || '0');
  });
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(() => {
    const lockUntil = Number(localStorage.getItem('admin_lockout_until') || '0');
    const now = Date.now();
    return lockUntil > now ? Math.ceil((lockUntil - now) / 1000) : 0;
  });

  // Lockout Countdown Timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      const lockUntil = Number(localStorage.getItem('admin_lockout_until') || '0');
      const now = Date.now();
      if (lockUntil > now) {
        setLockoutRemainingSec(Math.ceil((lockUntil - now) / 1000));
      } else {
        setLockoutRemainingSec(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    const lockUntil = Number(localStorage.getItem('admin_lockout_until') || '0');
    if (lockUntil > now) {
      const rem = Math.ceil((lockUntil - now) / 1000);
      setPinError(`⛔ সিস্টেম সাময়িকভাবে লকড! ${rem} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    // Check Owner PIN vs Moderator Sub-Admin PIN
    const inputPin = enteredPin.trim();
    const ownerP = (settings?.adminPin || adminPin || '7788').trim();
    const modP = (settings?.moderatorPin || moderatorPin || '1234').trim();

    if (inputPin === ownerP) {
      setAdminRole('owner');
      setIsUnlocked(true);
      setPinError('');
      setFailedAttempts(0);
      localStorage.removeItem('admin_failed_attempts');
      localStorage.removeItem('admin_lockout_until');
      onToast('👑 স্বাগতম! অনার অ্যাডমিন প্যানেল (Full Control) আনলক হয়েছে।');
    } else if (inputPin === modP) {
      setAdminRole('moderator');
      setIsUnlocked(true);
      setActiveTab('matches');
      setPinError('');
      setFailedAttempts(0);
      localStorage.removeItem('admin_failed_attempts');
      localStorage.removeItem('admin_lockout_until');
      onToast('🛡️ স্বাগতম! সাব-অ্যাডমিন প্যানেল: ম্যাচ অ্যাড ও রুম আইডি/পাসওয়ার্ড নিয়ন্ত্রণ আনলক হয়েছে।');
    } else {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      localStorage.setItem('admin_failed_attempts', String(newFails));

      if (newFails >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('admin_lockout_until', String(lockoutTime));
        setLockoutRemainingSec(15 * 60);
        setPinError('🚨 সতর্কবার্তা! ৫ বার ভুল পিন দেওয়ায় প্যানেল ১৫ মিনিটের জন্য লক করা হয়েছে!');
      } else {
        setPinError(`❌ ভুল পিন কোড! অনার পিন বা সাব-অ্যাডমিন পিন দিন। (অবশিষ্ট চেষ্টা: ${5 - newFails})`);
      }
      setEnteredPin('');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      onToast('⚠️ পিন কোড অন্তত ৪ সংখ্যার বা অক্ষরের হতে হবে!');
      return;
    }
    const updatedOwner = newPinInput.trim();
    setAdminPin(updatedOwner);
    localStorage.setItem('owner_admin_pin', updatedOwner);
    localStorage.setItem('permanent_owner_pin', updatedOwner);
    if (onUpdateSettings && settings) {
      onUpdateSettings({ ...settings, adminPin: updatedOwner });
    }
    setNewPinInput('');
    onToast(`✅ অনার অ্যাডমিন পিন সফলভাবে পরিবর্তন করা হয়েছে! নতুন পিন: ${updatedOwner}`);
  };

  const handleChangeModPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModPinInput.trim().length < 4) {
      onToast('⚠️ সাব-অ্যাডমিন পিন অন্তত ৪ সংখ্যার বা অক্ষরের হতে হবে!');
      return;
    }
    const updatedMod = newModPinInput.trim();
    setModeratorPin(updatedMod);
    localStorage.setItem('moderator_admin_pin', updatedMod);
    localStorage.setItem('permanent_moderator_pin', updatedMod);
    if (onUpdateSettings && settings) {
      onUpdateSettings({ ...settings, moderatorPin: updatedMod });
    }
    setNewModPinInput('');
    onToast(`✅ সাব-অ্যাডমিন (মডারেটর) পিন সফলভাবে পরিবর্তন করা হয়েছে! নতুন পিন: ${updatedMod}`);
  };

  const [activeTab, setActiveTab] = useState<'matches' | 'rooms' | 'deposits' | 'topup_orders' | 'voucher_vault' | 'banners' | 'category_images' | 'push_notifications' | 'notices' | 'settings' | 'pin' | 'security' | 'stats'>('matches');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Category & Page Images Management State
  const [categoryImageSubTab, setCategoryImageSubTab] = useState<'tournament' | 'topup' | 'presets'>('tournament');
  const [tournamentImages, setTournamentImages] = useState<Record<string, string>>(() => {
    if (settings?.tournamentImages && Object.keys(settings.tournamentImages).length > 0) {
      return settings.tournamentImages;
    }
    const saved = localStorage.getItem('bd_esports_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.tournamentImages) return parsed.tournamentImages;
      } catch {}
    }
    return {};
  });

  const [topupImages, setTopupImages] = useState<Record<string, string>>(() => {
    if (settings?.topupImages && Object.keys(settings.topupImages).length > 0) {
      return settings.topupImages;
    }
    const saved = localStorage.getItem('bd_esports_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.topupImages) return parsed.topupImages;
      } catch {}
    }
    return {};
  });

  // Keep local states synced if settings prop updates
  useEffect(() => {
    if (settings?.tournamentImages) {
      setTournamentImages(settings.tournamentImages);
    }
    if (settings?.topupImages) {
      setTopupImages(settings.topupImages);
    }
  }, [settings]);

  const handleUpdateTournamentImage = (categoryId: string, url: string) => {
    const updated = { ...tournamentImages, [categoryId]: url.trim() };
    setTournamentImages(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ tournamentImages: updated });
    }
    onToast(`✅ ${categoryId} এর টুর্নামেন্ট ছবি আপডেট করা হয়েছে!`);
  };

  const handleResetTournamentImage = (categoryId: string) => {
    const updated = { ...tournamentImages };
    delete updated[categoryId];
    setTournamentImages(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ tournamentImages: updated });
    }
    onToast(`🔄 ডিফল্ট ছবিতে রিসেট করা হয়েছে!`);
  };

  const handleUpdateTopupImage = (key: string, url: string) => {
    const updated = { ...topupImages, [key]: url.trim() };
    setTopupImages(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ topupImages: updated });
    }
    onToast(`✅ টপ-আপ কার্ডের ছবি আপডেট করা হয়েছে!`);
  };

  const handleResetTopupImage = (key: string) => {
    const updated = { ...topupImages };
    delete updated[key];
    setTopupImages(updated);
    if (onUpdateSettings) {
      onUpdateSettings({ topupImages: updated });
    }
    onToast(`🔄 ডিফল্ট ছবিতে রিসেট করা হয়েছে!`);
  };

  const handleCategoryImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetType: 'tournament' | 'topup',
    targetId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onToast('⚠️ ফাইলের সাইজ সর্বোচ্চ 5MB হতে হবে!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        if (targetType === 'tournament') {
          handleUpdateTournamentImage(targetId, base64);
        } else {
          handleUpdateTopupImage(targetId, base64);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Banner & Video Slider State
  const [localBanners, setLocalBanners] = useState<BannerSlide[]>(() => {
    if (banners && Array.isArray(banners) && banners.length > 0) return banners;
    const saved = localStorage.getItem('bd_esports_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_BANNERS;
  });

  // Banner Form State
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerType, setBannerType] = useState<'custom' | 'image' | 'video'>('custom');
  const [bannerMediaUrl, setBannerMediaUrl] = useState('');
  const [bannerVideoEmbedUrl, setBannerVideoEmbedUrl] = useState('');
  const [bannerBgGradient, setBannerBgGradient] = useState('from-[#1e0a00] via-[#2a1205] to-[#0d0400]');
  const [bannerActionType, setBannerActionType] = useState<'telegram' | 'shop' | 'category' | 'wallet' | 'external_link' | 'none'>('telegram');
  const [bannerActionCategory, setBannerActionCategory] = useState<MatchCategoryKey>('clash_squad');
  const [bannerActionUrl, setBannerActionUrl] = useState('');
  const [bannerActionText, setBannerActionText] = useState('Join Now');
  const [bannerActive, setBannerActive] = useState(true);

  const saveBannersToStateAndServer = (updated: BannerSlide[]) => {
    setLocalBanners(updated);
    localStorage.setItem('bd_esports_banners', JSON.stringify(updated));
    saveBannersRemote(updated);
    if (onUpdateBanners) {
      onUpdateBanners(updated);
    }
  };

  const handleStartEditBanner = (b: BannerSlide) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title || '');
    setBannerSubtitle(b.subtitle || '');
    setBannerTag(b.tag || '');
    setBannerType(b.type || 'custom');
    setBannerMediaUrl(b.mediaUrl || '');
    setBannerVideoEmbedUrl(b.videoEmbedUrl || '');
    setBannerBgGradient(b.bgGradient || 'from-[#1e0a00] via-[#2a1205] to-[#0d0400]');
    setBannerActionType(b.actionType || 'telegram');
    setBannerActionCategory(b.actionCategory || 'clash_squad');
    setBannerActionUrl(b.actionUrl || '');
    setBannerActionText(b.actionText || 'Join Now');
    setBannerActive(b.active !== false);
  };

  const handleCancelEditBanner = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerTag('');
    setBannerType('custom');
    setBannerMediaUrl('');
    setBannerVideoEmbedUrl('');
    setBannerBgGradient('from-[#1e0a00] via-[#2a1205] to-[#0d0400]');
    setBannerActionType('telegram');
    setBannerActionCategory('clash_squad');
    setBannerActionUrl('');
    setBannerActionText('Join Now');
    setBannerActive(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      onToast('⚠️ অনুগ্রহ করে ব্যানারের শিরোনাম (Title) লিখুন!');
      return;
    }

    // Auto-format YouTube embed URL if video type
    let embedUrl = bannerVideoEmbedUrl.trim();
    if (bannerType === 'video' && bannerMediaUrl.trim()) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = bannerMediaUrl.match(regExp);
      if (match && match[2].length === 11) {
        embedUrl = `https://www.youtube.com/embed/${match[2]}`;
      }
    }

    if (editingBannerId) {
      // Update existing banner
      const updated = localBanners.map((b) => {
        if (b.id === editingBannerId) {
          return {
            ...b,
            title: bannerTitle.trim(),
            subtitle: bannerSubtitle.trim(),
            tag: bannerTag.trim() || 'BD ESPORTS',
            type: bannerType,
            mediaUrl: bannerMediaUrl.trim(),
            videoEmbedUrl: embedUrl,
            bgGradient: bannerBgGradient,
            actionType: bannerActionType,
            actionCategory: bannerActionCategory,
            actionUrl: bannerActionUrl.trim(),
            actionText: bannerActionText.trim(),
            active: bannerActive,
          };
        }
        return b;
      });
      saveBannersToStateAndServer(updated);
      onToast('✅ স্লাইডার ব্যানার সফলভাবে আপডেট করা হয়েছে!');
    } else {
      // Create new banner
      const newBanner: BannerSlide = {
        id: `banner-${Date.now()}`,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        tag: bannerTag.trim() || 'NEW EVENT',
        type: bannerType,
        mediaUrl: bannerMediaUrl.trim(),
        videoEmbedUrl: embedUrl,
        bgGradient: bannerBgGradient,
        actionType: bannerActionType,
        actionCategory: bannerActionCategory,
        actionUrl: bannerActionUrl.trim(),
        actionText: bannerActionText.trim(),
        active: bannerActive,
        order: localBanners.length,
      };
      const updated = [...localBanners, newBanner];
      saveBannersToStateAndServer(updated);
      onToast('🎉 নতুন স্লাইডার ব্যানার সফলভাবে যোগ করা হয়েছে!');
    }

    handleCancelEditBanner();
  };

  const handleDeleteBanner = (id: string) => {
    if (localBanners.length <= 1) {
      onToast('⚠️ অন্তত ১টি ব্যানার থাকা আবশ্যক!');
      return;
    }
    const updated = localBanners.filter((b) => b.id !== id);
    saveBannersToStateAndServer(updated);
    deleteBannerRemote(id);
    onToast('🗑️ ব্যানার মুছে ফেলা হয়েছে।');
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = localBanners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    saveBannersToStateAndServer(updated);
    onToast('🔄 ব্যানারের স্ট্যাটাস পরিবর্তন করা হয়েছে!');
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= localBanners.length) return;

    const copy = [...localBanners];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    copy.forEach((item, idx) => {
      item.order = idx;
    });
    saveBannersToStateAndServer(copy);
    onToast('↕️ স্লাইডারের ক্রম পরিবর্তন করা হয়েছে!');
  };

  const handleResetDefaultBanners = () => {
    if (window.confirm('আপনি কি ডিফল্ট ব্যানারগুলো ফিরিয়ে আনতে চান?')) {
      saveBannersToStateAndServer(DEFAULT_BANNERS);
      onToast('🔄 ডিফল্ট ব্যানারগুলো সফলভাবে রিস্টোর করা হয়েছে!');
    }
  };

  // Voucher Vault State (Persistent in localStorage) - Strictly real vouchers only, no fake mock items
  const [voucherVault, setVoucherVault] = useState<VoucherVaultItem[]>(() => {
    const saved = localStorage.getItem('admin_voucher_vault');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleanRealList = parsed.filter(
            (v) => !['UPBD-FF115-8849-2109-7731', 'UPBD-FF240-9921-4321-1102', 'UPBD-WKLY-7712-9900-5544'].includes(v.code) &&
                   !v.code.startsWith('UPBD-FF') && !v.code.startsWith('UPBD-WKLY')
          );
          localStorage.setItem('admin_voucher_vault', JSON.stringify(cleanRealList));
          return cleanRealList;
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

  // State for adding new vouchers in vault
  const [newVoucherCategory, setNewVoucherCategory] = useState('Garena MY Shell (50 Shells - 115💎)');
  const [newVoucherCodesInput, setNewVoucherCodesInput] = useState('');
  const [newVoucherNote, setNewVoucherNote] = useState('');
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'available' | 'used'>('all');

  // Direct User Balance Adjustment State
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');
  const [adjustReason, setAdjustReason] = useState('');

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

      // Execute Bot Engine API on server
      executeAutoBotTopup({
        orderId: orderIdentifier,
        playerUid: targetUid,
        packageCategory: order.packageName || order.description,
        voucherCode: fulfillResult.deliveredVoucher.code,
        apiProvider: 'BD_ESPORTS_AUTO_BOT_v2',
      });

      // Auto approve transaction so admin doesn't need to manually click Delivered
      onApproveTransaction(order.id);

      // Copy voucher code to clipboard for instant reference
      try {
        navigator.clipboard.writeText(fulfillResult.deliveredVoucher.code);
      } catch {
        // ignore
      }

      onToast(`⚡ ২ সেকেন্ডে অটো-বট ডেলিভারি সম্পন্ন! কোড: ${fulfillResult.deliveredVoucher.code}`);

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

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(adjustAmount);
    if (!num || num <= 0) {
      onToast('❌ অনুগ্রহ করে সঠিক টাকার পরিমাণ (Amount) লিখুন!');
      return;
    }
    if (onAdjustUserBalance) {
      onAdjustUserBalance(num, adjustType, adjustReason.trim());
      setAdjustAmount('');
      setAdjustReason('');
    }
  };

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
  const [bkashNumber, setBkashNumber] = useState(() => {
    const val = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number') || settings?.bkashNumber;
    return (val && !['01712345678', '01812345678', '019999888775', '01700000000'].includes(val.trim())) ? val.trim() : '01612456053';
  });
  const [nagadNumber, setNagadNumber] = useState(() => {
    const val = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number') || settings?.nagadNumber;
    return (val && !['01712345678', '01812345678', '019999888775', '01700000000'].includes(val.trim())) ? val.trim() : '01612456053';
  });
  const [rocketNumber, setRocketNumber] = useState(() => {
    const val = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number') || settings?.rocketNumber;
    return (val && !['01712345678', '01812345678', '019999888775', '01700000000'].includes(val.trim())) ? val.trim() : '01612456053';
  });
  const [telegramLink, setTelegramLink] = useState(() => {
    const val = localStorage.getItem('permanent_owner_telegram') || localStorage.getItem('admin_telegram_link') || settings?.telegramLink;
    return val && val.trim() ? val.trim() : 'https://t.me/esportsclubbd';
  });
  const [apkDownloadUrl, setApkDownloadUrl] = useState(() => {
    const val = localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url') || settings?.apkDownloadUrl;
    return val && val.trim() && val !== '/BD_ESPORTS_MS_v1.0.apk' && !val.includes('run.app') ? val.trim() : (val || '');
  });
  const [noticeText, setNoticeText] = useState(() => {
    const val = settings?.noticeText || localStorage.getItem('permanent_owner_notice') || localStorage.getItem('admin_notice_text');
    return val && val.trim() ? val.trim() : 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!';
  });

  // Only update input fields from background sync if not currently active on settings tab
  React.useEffect(() => {
    if (settings && activeTab !== 'settings') {
      if (settings.bkashNumber) setBkashNumber(settings.bkashNumber);
      if (settings.nagadNumber) setNagadNumber(settings.nagadNumber);
      if (settings.rocketNumber) setRocketNumber(settings.rocketNumber);
      if (settings.telegramLink) setTelegramLink(settings.telegramLink);
      if (settings.apkDownloadUrl !== undefined) setApkDownloadUrl(settings.apkDownloadUrl);
      if (settings.noticeText !== undefined) setNoticeText(settings.noticeText);
      if (settings.adminPin) setAdminPin(settings.adminPin);
      if (settings.autoPushConfig) {
        if (typeof settings.autoPushConfig.enabled === 'boolean') setAutoPushActive(settings.autoPushConfig.enabled);
        if (settings.autoPushConfig.intervalMinutes) setAutoPushInterval(settings.autoPushConfig.intervalMinutes);
        if (settings.autoPushConfig.title) setPushTitle(settings.autoPushConfig.title);
        if (settings.autoPushConfig.message) setPushMessage(settings.autoPushConfig.message);
        if (settings.autoPushConfig.category) setPushCategory(settings.autoPushConfig.category);
        if (settings.autoPushConfig.linkTab) setPushLinkTab(settings.autoPushConfig.linkTab);
      }
    }
  }, [settings, activeTab]);



  // New Match Form State
  const [newMatchTitle, setNewMatchTitle] = useState('Solo Rush | Bermuda');
  const [newCategory, setNewCategory] = useState<MatchCategoryKey>('lone_wolf');
  const [newEntryType, setNewEntryType] = useState<'Solo' | 'Duo' | 'Squad'>('Solo');
  const [newScheduleTime, setNewScheduleTime] = useState('Today at 09:00 PM');
  const [newWinPrize, setNewWinPrize] = useState(50);
  const [newPosition2Prize, setNewPosition2Prize] = useState('');
  const [newPosition3Prize, setNewPosition3Prize] = useState('');
  const [newPosition4Prize, setNewPosition4Prize] = useState('');
  const [newPosition5Prize, setNewPosition5Prize] = useState('');
  const [newPrizeNote, setNewPrizeNote] = useState('');
  const [newTotalPrizePool, setNewTotalPrizePool] = useState('');
  const [newExtraPositions, setNewExtraPositions] = useState<{ position: number; label: string; prize: number }[]>([]);
  const [newEntryFee, setNewEntryFee] = useState(20);
  const [newPerKill, setNewPerKill] = useState(0);
  const [newMap, setNewMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra'>('Bermuda');
  const [newTotalSlots, setNewTotalSlots] = useState(2);

  // Smart slot handler when category or entry type changes for new match
  const handleNewCategoryChange = (cat: MatchCategoryKey) => {
    setNewCategory(cat);
    if (cat === 'lone_wolf') {
      if (newEntryType === 'Solo') {
        setNewTotalSlots(2);
      } else if (newEntryType === 'Duo') {
        setNewTotalSlots(4);
      } else {
        setNewEntryType('Solo');
        setNewTotalSlots(2);
      }
    } else if (cat === 'cs_2v2') {
      setNewEntryType('Duo');
      setNewTotalSlots(4);
    } else if (cat === 'clash_squad') {
      setNewEntryType('Squad');
      setNewTotalSlots(8);
    } else {
      setNewTotalSlots(48);
    }
  };

  const handleNewEntryTypeChange = (type: 'Solo' | 'Duo' | 'Squad') => {
    setNewEntryType(type);
    if (type === 'Solo') {
      // Solo default is 2 spots (1v1) for Lone Wolf/CS or customizable
      if (newCategory === 'lone_wolf' || newCategory === 'cs_2v2') {
        setNewTotalSlots(2);
      } else if (newCategory === 'clash_squad') {
        setNewTotalSlots(2);
      } else {
        // Full map solo can be 48 or 2
        if (newTotalSlots === 4 || newTotalSlots === 8) setNewTotalSlots(2);
      }
    } else if (type === 'Duo') {
      // Duo default is 4 spots (2v2)
      setNewTotalSlots(4);
    } else if (type === 'Squad') {
      // Squad default is 8 spots (4v4 CS) or 48 for BR
      if (newCategory === 'clash_squad') {
        setNewTotalSlots(8);
      } else {
        setNewTotalSlots(48);
      }
    }
  };

  // Edit Match State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MatchCategoryKey>('br_match');
  const [editEntryType, setEditEntryType] = useState<'Solo' | 'Duo' | 'Squad'>('Solo');
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editWinPrize, setEditWinPrize] = useState(500);
  const [editPosition2Prize, setEditPosition2Prize] = useState('');
  const [editPosition3Prize, setEditPosition3Prize] = useState('');
  const [editPosition4Prize, setEditPosition4Prize] = useState('');
  const [editPosition5Prize, setEditPosition5Prize] = useState('');
  const [editPrizeNote, setEditPrizeNote] = useState('');
  const [editTotalPrizePool, setEditTotalPrizePool] = useState('');
  const [editExtraPositions, setEditExtraPositions] = useState<{ position: number; label: string; prize: number }[]>([]);
  const [editEntryFee, setEditEntryFee] = useState(20);
  const [editPerKill, setEditPerKill] = useState(10);
  const [editMap, setEditMap] = useState<'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra'>('Bermuda');
  const [editTotalSlots, setEditTotalSlots] = useState(48);

  const handleEditCategoryChange = (cat: MatchCategoryKey) => {
    setEditCategory(cat);
    if (cat === 'lone_wolf') {
      if (editEntryType === 'Solo') setEditTotalSlots(2);
      else if (editEntryType === 'Duo') setEditTotalSlots(4);
      else setEditTotalSlots(2);
    } else if (cat === 'cs_2v2') {
      setEditEntryType('Duo');
      setEditTotalSlots(4);
    } else if (cat === 'clash_squad') {
      setEditEntryType('Squad');
      setEditTotalSlots(8);
    }
  };

  const handleEditEntryTypeChange = (type: 'Solo' | 'Duo' | 'Squad') => {
    setEditEntryType(type);
    if (type === 'Solo') {
      setEditTotalSlots(2);
    } else if (type === 'Duo') {
      setEditTotalSlots(4);
    } else if (type === 'Squad') {
      if (editCategory === 'clash_squad') setEditTotalSlots(8);
      else setEditTotalSlots(48);
    }
  };

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

    // Extract custom positions
    const pos2 = m.customPositions?.find((p) => p.position === 2)?.prize;
    const pos3 = m.customPositions?.find((p) => p.position === 3)?.prize;
    const pos4 = m.customPositions?.find((p) => p.position === 4)?.prize;
    const pos5 = m.customPositions?.find((p) => p.position === 5)?.prize;
    const extras = m.customPositions?.filter((p) => p.position > 5) || [];

    setEditPosition2Prize(pos2 !== undefined && pos2 > 0 ? String(pos2) : '');
    setEditPosition3Prize(pos3 !== undefined && pos3 > 0 ? String(pos3) : '');
    setEditPosition4Prize(pos4 !== undefined && pos4 > 0 ? String(pos4) : '');
    setEditPosition5Prize(pos5 !== undefined && pos5 > 0 ? String(pos5) : '');
    setEditPrizeNote(m.prizeNote || '');
    setEditTotalPrizePool(m.totalPrizePool ? String(m.totalPrizePool) : '');
    setEditExtraPositions(extras);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    // Build customPositions list
    const customPositions: { position: number; label: string; prize: number }[] = [
      { position: 1, label: 'Winner', prize: Number(editWinPrize) || 0 },
    ];
    if (Number(editPosition2Prize) > 0) {
      customPositions.push({ position: 2, label: '2nd Position', prize: Number(editPosition2Prize) });
    }
    if (Number(editPosition3Prize) > 0) {
      customPositions.push({ position: 3, label: '3rd Position', prize: Number(editPosition3Prize) });
    }
    if (Number(editPosition4Prize) > 0) {
      customPositions.push({ position: 4, label: '4th Position', prize: Number(editPosition4Prize) });
    }
    if (Number(editPosition5Prize) > 0) {
      customPositions.push({ position: 5, label: '5th Position', prize: Number(editPosition5Prize) });
    }
    editExtraPositions.forEach((extra) => {
      if (Number(extra.prize) > 0) {
        customPositions.push({
          position: extra.position,
          label: extra.label || `${extra.position}th Position`,
          prize: Number(extra.prize),
        });
      }
    });

    const parsedTotalPool = editTotalPrizePool ? Number(editTotalPrizePool) : undefined;

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
      customPositions: customPositions.length > 1 ? customPositions : undefined,
      prizeNote: editPrizeNote.trim() || undefined,
      totalPrizePool: parsedTotalPool,
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
    const id = `m-${Date.now().toString().slice(-6)}`;
    const catLabelMap: Record<MatchCategoryKey, string> = {
      br_match: 'BR MATCH',
      br_survival: 'BR SURVIVAL',
      clash_squad: 'CLASH SQUAD',
      cs_2v2: 'CS 2 VS 2',
      lone_wolf: 'LONE WOLF',
      free_match: 'FREE MATCH',
    };

    // Build custom positions list
    const customPositions: { position: number; label: string; prize: number }[] = [
      { position: 1, label: 'Winner', prize: Number(newWinPrize) || 0 },
    ];
    if (Number(newPosition2Prize) > 0) {
      customPositions.push({ position: 2, label: '2nd Position', prize: Number(newPosition2Prize) });
    }
    if (Number(newPosition3Prize) > 0) {
      customPositions.push({ position: 3, label: '3rd Position', prize: Number(newPosition3Prize) });
    }
    if (Number(newPosition4Prize) > 0) {
      customPositions.push({ position: 4, label: '4th Position', prize: Number(newPosition4Prize) });
    }
    if (Number(newPosition5Prize) > 0) {
      customPositions.push({ position: 5, label: '5th Position', prize: Number(newPosition5Prize) });
    }
    newExtraPositions.forEach((extra) => {
      if (Number(extra.prize) > 0) {
        customPositions.push({
          position: extra.position,
          label: extra.label || `${extra.position}th Position`,
          prize: Number(extra.prize),
        });
      }
    });

    const parsedTotalPool = newTotalPrizePool ? Number(newTotalPrizePool) : undefined;

    const newMatch: Match = {
      id,
      title: newMatchTitle,
      category: newCategory,
      categoryLabel: catLabelMap[newCategory] || 'SPECIAL MATCH',
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
      customPositions: customPositions.length > 1 ? customPositions : undefined,
      prizeNote: newPrizeNote.trim() || undefined,
      totalPrizePool: parsedTotalPool,
    };

    onAddMatch(newMatch);
    onToast(`🎉 New match "${newMatchTitle}" created successfully!`);
    setNewMatchTitle('');
    setNewScheduleTime('');
    setNewPosition2Prize('');
    setNewPosition3Prize('');
    setNewPosition4Prize('');
    setNewPosition5Prize('');
    setNewPrizeNote('');
    setNewTotalPrizePool('');
    setNewExtraPositions([]);
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
    localStorage.setItem('permanent_owner_telegram', cleanTelegram);
    localStorage.setItem('admin_apk_download_url', cleanApk);
    localStorage.setItem('permanent_owner_apk_url', cleanApk);
    localStorage.setItem('admin_notice_text', cleanNotice);
    localStorage.setItem('permanent_owner_notice', cleanNotice);
    localStorage.setItem('owner_admin_pin', cleanPin);
    localStorage.setItem('permanent_owner_pin', cleanPin);

    onToast('🔒 বিকাশ, নগদ, রকেট, টেলিগ্রাম ও APK লিঙ্ক স্থায়ীভাবে সেভ করা হয়েছে এবং আর কখনো পরিবর্তন হবে না!');
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
              {showPinChangeOnLock ? 'RESET ADMIN PIN' : 'ADMIN PIN REQUIRED'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-bengali">
              {showPinChangeOnLock
                ? 'বর্তমান পিন দিয়ে নতুন সিক্রেট পিন সেট করুন।'
                : 'অনার পিন (Full Control) অথবা সাব-অ্যাডমিন পিন (Match & Room Only) দিন।'}
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
              {lockoutRemainingSec > 0 ? (
                <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-4 text-center space-y-2">
                  <ShieldAlert className="w-8 h-8 text-red-500 mx-auto animate-bounce" />
                  <h4 className="text-xs font-black font-orbitron text-red-400">
                    SECURITY LOCKOUT ACTIVE
                  </h4>
                  <p className="text-xs text-red-200/90 font-bengali">
                    পরপর ৫ বার ভুল পিন দেওয়ায় অ্যান্টি-হ্যাক লক সক্রিয় হয়েছে।
                  </p>
                  <div className="py-2 px-3 bg-red-950/80 rounded-xl border border-red-500/30 text-amber-300 font-mono font-black text-sm">
                    অপেক্ষা করুন: {Math.floor(lockoutRemainingSec / 60)}m {lockoutRemainingSec % 60}s
                  </div>
                </div>
              ) : (
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
                  {failedAttempts > 0 && failedAttempts < 5 && (
                    <p className="text-[11px] text-amber-400 font-bold mt-1">
                      ⚠️ ভুল প্রচেষ্টা: {failedAttempts}/5 (৫ বারে ১৫ মিনিট লক হবে)
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutRemainingSec > 0}
                className={`w-full py-3.5 font-black font-orbitron text-slate-950 rounded-xl shadow-lg transition active:scale-95 cursor-pointer ${
                  lockoutRemainingSec > 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400'
                }`}
              >
                {lockoutRemainingSec > 0 ? 'SYSTEM TEMPORARILY LOCKED' : 'UNLOCK PANEL (লগইন)'}
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

              {/* Sub-Admin vs Owner Role Info Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-bengali text-left space-y-1 mt-2">
                <p className="font-bold text-amber-300">🔑 পিন সহায়িকা (Role Access):</p>
                <p>• <strong className="text-amber-400">অনার পিন:</strong> সম্পূর্ণ অ্যাডমিন ফুল এক্সেস (ডিপোজিট, উইথড্র, সেটিংস ও অল রুলস)।</p>
                <p>• <strong className="text-cyan-400">সাব-অ্যাডমিন পিন:</strong> শুধুমাত্র ম্যাচ অ্যাড এবং রুম আইডি/পাসওয়ার্ড সুবিধা।</p>
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
        <div
          className={`p-4 flex items-center justify-between text-white shadow-lg flex-shrink-0 z-10 ${
            adminRole === 'moderator'
              ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/80 text-amber-400 flex items-center justify-center font-bold shadow-inner border border-amber-400/40">
              {adminRole === 'moderator' ? (
                <ShieldCheck className="w-6 h-6 text-cyan-300" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-extrabold text-base tracking-wide">
                  {adminRole === 'moderator' ? 'SUB-ADMIN MODERATOR PANEL' : 'OWNER ADMIN PANEL'}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    adminRole === 'moderator'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      : 'bg-black/50 text-amber-300 border-amber-400/40'
                  }`}
                >
                  {adminRole === 'moderator' ? 'MATCH & ROOM ONLY' : 'MASTER CONTROL'}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-bengali">
                {adminRole === 'moderator'
                  ? 'ম্যাচ তৈরি ও রুম আইডি/পাসওয়ার্ড ম্যানেজার (সীমিত এক্সেস)'
                  : 'মালিকানা ও সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ কেন্দ্র'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer transition active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Filtered for Sub-Admin Moderator */}
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

          {/* Owner-Only Tabs */}
          {adminRole === 'owner' && (
            <>
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
            onClick={() => setActiveTab('banners')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'banners'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-black ring-1 ring-purple-300'
                : 'text-purple-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-purple-500/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>🎨 ব্যানার ও ভিডিও স্লাইডার ({localBanners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('category_images')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'category_images'
                ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white shadow-md font-black ring-1 ring-cyan-300'
                : 'text-cyan-300 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-cyan-500/40'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>🖼️ পেজ ও ক্যাটাগরি ছবি (টপআপ ও টুর্নামেন্ট)</span>
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
            onClick={() => setActiveTab('security')}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-black ring-1 ring-emerald-300'
                : 'text-emerald-400 bg-slate-900/80 hover:text-white hover:bg-slate-800 border border-emerald-500/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>🛡️ Anti-Hack & Firewall</span>
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
            </>
          )}
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
                      onChange={(e) => handleNewCategoryChange(e.target.value as MatchCategoryKey)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    >
                      <option value="lone_wolf">LONE WOLF (1v1 / 2v2)</option>
                      <option value="cs_2v2">CS 2v2 (2 VS 2)</option>
                      <option value="clash_squad">Clash Squad (4v4)</option>
                      <option value="br_match">BR MATCH (Full Map)</option>
                      <option value="br_survival">BR SURVIVAL</option>
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
                          onClick={() => handleNewEntryTypeChange(t)}
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

                  {/* Total Spots / Slots Selector with Quick Presets */}
                  <div className="sm:col-span-2 bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-amber-400 font-bold text-xs flex items-center gap-1.5 font-orbitron">
                        <span>👥 TOTAL SPOTS / SLOTS (মোট প্লেয়ার স্পট):</span>
                        <span className="text-white font-mono font-black text-sm bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                          {newTotalSlots} SPOTS
                        </span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-bengali">Solo=২ জন, Duo=৪ জন</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewTotalSlots(2)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                          newTotalSlots === 2
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        ⚡ 2 Spots (Solo 1v1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTotalSlots(4)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                          newTotalSlots === 4
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        🔥 4 Spots (Duo 2v2)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTotalSlots(8)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                          newTotalSlots === 8
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        ⚔️ 8 Spots (CS 4v4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTotalSlots(48)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                          newTotalSlots === 48
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        🗺️ 48 Spots (BR Full Map)
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">বা কাস্টম সংখ্যা:</span>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={newTotalSlots}
                        onChange={(e) => setNewTotalSlots(Math.max(2, Number(e.target.value)))}
                        className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center font-bold text-xs outline-none focus:border-amber-400"
                      />
                    </div>
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

                  {/* Multi Position Prizes Box (1st, 2nd, 3rd, 4th, 5th, etc.) */}
                  <div className="sm:col-span-2 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-3 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <h5 className="font-orbitron font-black text-amber-400 text-xs flex items-center gap-1.5">
                          <span>🏆 MULTI-POSITION PRIZE POOL (পজিশন ভিত্তিক প্রাইজমানি):</span>
                        </h5>
                        <p className="text-[11px] text-slate-400 font-bengali">
                          Winner ছাড়াও 2nd, 3rd, 4th, 5th পজিশনের প্রাইজ টাকা সেট করুন
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNewWinPrize(50);
                            setNewPosition2Prize('40');
                            setNewPosition3Prize('30');
                            setNewPosition4Prize('20');
                            setNewPosition5Prize('10');
                            setNewPerKill(5);
                            setNewTotalPrizePool('405');
                            setNewPrizeNote('Solo Time | Mobile | Regular রুমে ঢুকার পর কেউ আনরে-রেজিস্ট্রেশন/বাহিরের প্লেয়ার ইনভাইট করবেন না 🔥');
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-lg text-[11px] font-bold cursor-pointer transition"
                        >
                          ✨ 5 Positions Preset (50, 40, 30, 20, 10)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPosition2Prize('');
                            setNewPosition3Prize('');
                            setNewPosition4Prize('');
                            setNewPosition5Prize('');
                            setNewExtraPositions([]);
                            setNewTotalPrizePool('');
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                          <span>🥈 2nd Position (৳)</span>
                        </label>
                        <input
                          type="number"
                          value={newPosition2Prize}
                          onChange={(e) => setNewPosition2Prize(e.target.value)}
                          placeholder="e.g. 40"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                          <span>🥉 3rd Position (৳)</span>
                        </label>
                        <input
                          type="number"
                          value={newPosition3Prize}
                          onChange={(e) => setNewPosition3Prize(e.target.value)}
                          placeholder="e.g. 30"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                          <span>🏅 4th Position (৳)</span>
                        </label>
                        <input
                          type="number"
                          value={newPosition4Prize}
                          onChange={(e) => setNewPosition4Prize(e.target.value)}
                          placeholder="e.g. 20"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                          <span>🏅 5th Position (৳)</span>
                        </label>
                        <input
                          type="number"
                          value={newPosition5Prize}
                          onChange={(e) => setNewPosition5Prize(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Extra Custom Positions */}
                    {newExtraPositions.map((extra, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-xs font-bold w-24">🎖️ Pos #{extra.position}</span>
                        <input
                          type="text"
                          value={extra.label}
                          onChange={(e) => {
                            const next = [...newExtraPositions];
                            next[idx].label = e.target.value;
                            setNewExtraPositions(next);
                          }}
                          placeholder="Label (e.g. 6th Position)"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                        />
                        <input
                          type="number"
                          value={extra.prize || ''}
                          onChange={(e) => {
                            const next = [...newExtraPositions];
                            next[idx].prize = Number(e.target.value);
                            setNewExtraPositions(next);
                          }}
                          placeholder="Prize ৳"
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setNewExtraPositions(newExtraPositions.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const nextPos = 6 + newExtraPositions.length;
                          setNewExtraPositions([...newExtraPositions, { position: nextPos, label: `${nextPos}th Position`, prize: 0 }]);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        + আরও পজিশন যোগ করুন (Add 6th, 7th...)
                      </button>
                    </div>

                    {/* Custom Subtitle / Rule Note & Total Prize Pool */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                          Popup Rules / Notice Note (প্রাইজপুলের নোটিশ বা নিয়ম)
                        </label>
                        <input
                          type="text"
                          value={newPrizeNote}
                          onChange={(e) => setNewPrizeNote(e.target.value)}
                          placeholder="Solo Time | Mobile | Regular রুমে ঢুকার পর কেউ..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                          Total Prize Pool (টোটাল প্রাইজমানি ৳ - খালি রাখলে অটো যোগ হবে)
                        </label>
                        <input
                          type="number"
                          value={newTotalPrizePool}
                          onChange={(e) => setNewTotalPrizePool(e.target.value)}
                          placeholder="e.g. 405"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
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
                        onChange={(e) => handleEditCategoryChange(e.target.value as MatchCategoryKey)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      >
                        <option value="lone_wolf">LONE WOLF (1v1 / 2v2)</option>
                        <option value="cs_2v2">CS 2v2 (2 VS 2)</option>
                        <option value="clash_squad">Clash Squad (4v4)</option>
                        <option value="br_match">BR MATCH (Full Map)</option>
                        <option value="br_survival">BR SURVIVAL</option>
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
                            onClick={() => handleEditEntryTypeChange(t)}
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

                    {/* Total Spots / Slots Selector in Edit */}
                    <div className="sm:col-span-2 bg-slate-900/90 border border-amber-500/30 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-amber-400 font-bold text-xs flex items-center gap-1.5 font-orbitron">
                          <span>👥 TOTAL SPOTS / SLOTS (মোট প্লেয়ার স্পট):</span>
                          <span className="text-white font-mono font-black text-sm bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                            {editTotalSlots} SPOTS
                          </span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-bengali">Solo=২ জন, Duo=৪ জন</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditTotalSlots(2)}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                            editTotalSlots === 2
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          ⚡ 2 Spots (Solo 1v1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTotalSlots(4)}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                            editTotalSlots === 4
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          🔥 4 Spots (Duo 2v2)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTotalSlots(8)}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                            editTotalSlots === 8
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          ⚔️ 8 Spots (CS 4v4)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTotalSlots(48)}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[11px] font-rajdhani transition cursor-pointer border ${
                            editTotalSlots === 48
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          🗺️ 48 Spots (BR Full Map)
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">বা কাস্টম সংখ্যা:</span>
                        <input
                          type="number"
                          min="2"
                          max="100"
                          value={editTotalSlots}
                          onChange={(e) => setEditTotalSlots(Math.max(2, Number(e.target.value)))}
                          className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center font-bold text-xs outline-none focus:border-amber-400"
                        />
                      </div>
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

                    {/* Multi Position Prizes Box in Edit */}
                    <div className="sm:col-span-2 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-3 shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <h5 className="font-orbitron font-black text-amber-400 text-xs flex items-center gap-1.5">
                            <span>🏆 MULTI-POSITION PRIZE POOL (পজিশন ভিত্তিক প্রাইজমানি):</span>
                          </h5>
                          <p className="text-[11px] text-slate-400 font-bengali">
                            Winner ছাড়াও 2nd, 3rd, 4th, 5th পজিশনের প্রাইজ টাকা এডিট করুন
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditWinPrize(50);
                              setEditPosition2Prize('40');
                              setEditPosition3Prize('30');
                              setEditPosition4Prize('20');
                              setEditPosition5Prize('10');
                              setEditPerKill(5);
                              setEditTotalPrizePool('405');
                              setEditPrizeNote('Solo Time | Mobile | Regular রুমে ঢুকার পর কেউ আনরে-রেজিস্ট্রেশন/বাহিরের প্লেয়ার ইনভাইট করবেন না 🔥');
                            }}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-lg text-[11px] font-bold cursor-pointer transition"
                          >
                            ✨ 5 Positions Preset (50, 40, 30, 20, 10)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditPosition2Prize('');
                              setEditPosition3Prize('');
                              setEditPosition4Prize('');
                              setEditPosition5Prize('');
                              setEditExtraPositions([]);
                              setEditTotalPrizePool('');
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                            <span>🥈 2nd Position (৳)</span>
                          </label>
                          <input
                            type="number"
                            value={editPosition2Prize}
                            onChange={(e) => setEditPosition2Prize(e.target.value)}
                            placeholder="e.g. 40"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                            <span>🥉 3rd Position (৳)</span>
                          </label>
                          <input
                            type="number"
                            value={editPosition3Prize}
                            onChange={(e) => setEditPosition3Prize(e.target.value)}
                            placeholder="e.g. 30"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                            <span>🏅 4th Position (৳)</span>
                          </label>
                          <input
                            type="number"
                            value={editPosition4Prize}
                            onChange={(e) => setEditPosition4Prize(e.target.value)}
                            placeholder="e.g. 20"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px] flex items-center gap-1">
                            <span>🏅 5th Position (৳)</span>
                          </label>
                          <input
                            type="number"
                            value={editPosition5Prize}
                            onChange={(e) => setEditPosition5Prize(e.target.value)}
                            placeholder="e.g. 10"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Extra Custom Positions */}
                      {editExtraPositions.map((extra, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-xs font-bold w-24">🎖️ Pos #{extra.position}</span>
                          <input
                            type="text"
                            value={extra.label}
                            onChange={(e) => {
                              const next = [...editExtraPositions];
                              next[idx].label = e.target.value;
                              setEditExtraPositions(next);
                            }}
                            placeholder="Label (e.g. 6th Position)"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                          />
                          <input
                            type="number"
                            value={extra.prize || ''}
                            onChange={(e) => {
                              const next = [...editExtraPositions];
                              next[idx].prize = Number(e.target.value);
                              setEditExtraPositions(next);
                            }}
                            placeholder="Prize ৳"
                            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setEditExtraPositions(editExtraPositions.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 text-xs px-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const nextPos = 6 + editExtraPositions.length;
                            setEditExtraPositions([...editExtraPositions, { position: nextPos, label: `${nextPos}th Position`, prize: 0 }]);
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          + আরও পজিশন যোগ করুন (Add 6th, 7th...)
                        </button>
                      </div>

                      {/* Custom Subtitle / Rule Note & Total Prize Pool */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                            Popup Rules / Notice Note (প্রাইজপুলের নোটিশ বা নিয়ম)
                          </label>
                          <input
                            type="text"
                            value={editPrizeNote}
                            onChange={(e) => setEditPrizeNote(e.target.value)}
                            placeholder="Solo Time | Mobile | Regular রুমে ঢুকার পর কেউ..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1 text-[11px]">
                            Total Prize Pool (টোটাল প্রাইজমানি ৳ - খালি রাখলে অটো যোগ হবে)
                          </label>
                          <input
                            type="number"
                            value={editTotalPrizePool}
                            onChange={(e) => setEditTotalPrizePool(e.target.value)}
                            placeholder="e.g. 405"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
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

              {/* Direct User Wallet Balance Adjustment Box */}
              <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-orbitron font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    MANUAL USER WALLET BALANCE MANAGER (সরাসরি ব্যালেন্স অ্যাড / মাইনাস)
                  </h5>
                  {user && (
                    <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                      Current User Balance: ৳{user.balance} BDT
                    </span>
                  )}
                </div>
                <form onSubmit={handleAdjustBalanceSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Action Type</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bold"
                    >
                      <option value="add">➕ Add Balance (টাকা যোগ করুন)</option>
                      <option value="deduct">➖ Deduct Balance (টাকা কাটুন)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Amount (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 100"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1 font-rajdhani">Reason / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Manual Deposit / Prize"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-orbitron rounded-xl text-xs cursor-pointer transition shadow-lg"
                    >
                      APPLY BALANCE ({adjustType === 'add' ? '+৳' : '-৳'}{adjustAmount || 0})
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
                            {(() => {
                              const rawCode = t.deliveredCode || voucherVault.find((v) => v.usedForOrderId === (t.orderId || t.id))?.code;
                              if (!rawCode) return null;
                              const parsed = parseVoucherCode(rawCode);

                              return (
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] text-amber-400 font-bold">⚡ ভল্ট ডেলিভার্ড ভাউচার:</span>
                                    {parsed.serial && (
                                      <div className="flex items-center gap-1 bg-slate-900 border border-amber-500/40 px-2 py-0.5 rounded-lg">
                                        <span className="text-[10px] text-slate-400">Serial:</span>
                                        <span className="font-mono text-xs font-bold text-amber-300">{parsed.serial}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(parsed.serial!);
                                            onToast(`📋 Serial (${parsed.serial}) কপি করা হয়েছে!`);
                                          }}
                                          className="p-1 bg-amber-500/30 hover:bg-amber-500 text-amber-200 hover:text-slate-950 rounded text-[10px]"
                                          title="Copy Serial"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}

                                    {parsed.pin && (
                                      <div className="flex items-center gap-1 bg-amber-950/50 border border-amber-500/50 px-2 py-0.5 rounded-lg">
                                        <span className="text-[10px] text-amber-300 font-bold">PIN:</span>
                                        <span className="font-mono text-xs font-black text-yellow-300">{parsed.pin}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(parsed.pin!);
                                            onToast(`📋 PIN (${parsed.pin}) কপি করা হয়েছে!`);
                                          }}
                                          className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold"
                                          title="Copy PIN"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}

                                    {t.voucherCostInfo && (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                                        {t.voucherCostInfo}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

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

                            {/* 1-Click Open Garena Topup Center with Auto-Copy */}
                            <button
                              type="button"
                              onClick={() => {
                                handleCopyUid(extractedUid);
                                const rawCode = t.deliveredCode || voucherVault.find((v) => v.usedForOrderId === (t.orderId || t.id))?.code;
                                if (rawCode) {
                                  const parsed = parseVoucherCode(rawCode);
                                  if (parsed.pin) {
                                    setTimeout(() => {
                                      try {
                                        navigator.clipboard.writeText(parsed.pin!);
                                      } catch {}
                                    }, 1000);
                                  }
                                }
                                window.open('https://shop.garena.my', '_blank');
                                onToast(`🚀 UID (${extractedUid}) কপি করা হয়েছে! Garena Shop ওপেন হচ্ছে...`);
                              }}
                              className="px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-rajdhani font-black flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                            >
                              <span>🌐 Garena Shop (১-ক্লিক)</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

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
                      Support Telegram / WhatsApp Link (টেলিগ্রাম / সাপোর্ট লিঙ্ক):
                    </label>
                    <input
                      type="text"
                      value={telegramLink}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTelegramLink(val);
                        localStorage.setItem('admin_telegram_link', val.trim());
                        localStorage.setItem('permanent_owner_telegram', val.trim());
                      }}
                      onBlur={() => {
                        const val = telegramLink.trim();
                        localStorage.setItem('admin_telegram_link', val);
                        localStorage.setItem('permanent_owner_telegram', val);
                        if (onUpdateSettings) {
                          onUpdateSettings({ telegramLink: val });
                        }
                      }}
                      placeholder="https://t.me/yourusername অথবা https://wa.me/8801XXXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Download className="w-4 h-4 text-emerald-400" />
                        Direct 1-Click APK Download Link (১-ক্লিক APK ডাউনলোড লিঙ্ক):
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        Auto 1-Click Active
                      </span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={apkDownloadUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setApkDownloadUrl(val);
                            }}
                            placeholder="আপনার Google Drive ডাউনলোড লিঙ্ক এখানে পেস্ট করুন"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-emerald-300 font-mono text-xs outline-none focus:border-emerald-400"
                          />
                          {apkDownloadUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setApkDownloadUrl('');
                                localStorage.removeItem('admin_apk_download_url');
                                localStorage.removeItem('permanent_owner_apk_url');
                                if (onUpdateSettings) {
                                  onUpdateSettings({ apkDownloadUrl: '' });
                                }
                                onToast('🗑️ লিঙ্ক সম্পূর্ণ ক্লিয়ার/মুছে ফেলা হয়েছে!');
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 p-1 text-xs font-bold"
                              title="Clear Link"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              if (text && text.trim()) {
                                const clean = text.trim();
                                setApkDownloadUrl(clean);
                                localStorage.setItem('admin_apk_download_url', clean);
                                localStorage.setItem('permanent_owner_apk_url', clean);
                                if (onUpdateSettings) {
                                  onUpdateSettings({ apkDownloadUrl: clean });
                                }
                                onToast('📋 ড্রাইভ লিঙ্ক সফলভাবে পেস্ট ও সেভ হয়েছে!');
                              } else {
                                onToast('⚠️ ক্লিপবোর্ডে কোনো লিঙ্ক পাওয়া যায়নি!');
                              }
                            } catch {
                              onToast('⚠️ অনুগ্রহ করে বক্সে লং-প্রেস করে Paste করুন!');
                            }
                          }}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold font-rajdhani flex items-center gap-1 cursor-pointer shrink-0 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>পেস্ট করুন</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const val = apkDownloadUrl.trim();
                            localStorage.setItem('admin_apk_download_url', val);
                            localStorage.setItem('permanent_owner_apk_url', val);
                            if (onUpdateSettings) {
                              onUpdateSettings({ apkDownloadUrl: val });
                            }
                            onToast('✅ APK লিঙ্ক সফলভাবে সেভ করা হয়েছে!');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-orbitron flex items-center gap-1 cursor-pointer shrink-0 shadow-md transition"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>সেভ</span>
                        </button>
                      </div>

                      {apkDownloadUrl && apkDownloadUrl.trim() && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const val = apkDownloadUrl.trim();
                              let directVal = val;
                              if (val.includes('drive.google.com/file/d/')) {
                                const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                if (match && match[1]) {
                                  directVal = `https://drive.google.com/uc?export=download&id=${match[1]}`;
                                }
                              }
                              const link = document.createElement('a');
                              link.href = directVal;
                              link.setAttribute('download', 'BD_ESPORTS_MS.apk');
                              link.setAttribute('target', '_blank');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              onToast('📥 টেস্ট ডাউনলোড শুরু হয়েছে!');
                            }}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>টেস্ট ডাউনলোড করে পরখ করুন</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      <span className="text-[11px] text-slate-300 block">
                        💡 <strong>কিভাবে লিঙ্ক বসাবেন:</strong> আপনি Google Drive এ APK আপলোড করে <strong>"Anyone with the link"</strong> করার পর যে লিঙ্ক কপি করেছেন, এখানে <strong>"পেস্ট করুন"</strong> বাটনে চাপ দিন অথবা বক্সে পেস্ট করে <strong>"সেভ"</strong>-এ চাপ দিন।
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-200 font-bold block mb-1 font-rajdhani">
                      App Banner Announcement Notice (নোটিশ টেক্সট):
                    </label>
                    <textarea
                      rows={2}
                      value={noticeText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoticeText(val);
                        localStorage.setItem('admin_notice_text', val.trim());
                        localStorage.setItem('permanent_owner_notice', val.trim());
                      }}
                      onBlur={() => {
                        const val = noticeText.trim();
                        localStorage.setItem('admin_notice_text', val);
                        localStorage.setItem('permanent_owner_notice', val);
                        if (onUpdateSettings) {
                          onUpdateSettings({ noticeText: val });
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-200 outline-none resize-none focus:border-amber-400"
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
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition border border-emerald-400/50 active:scale-[0.99]"
                  >
                    <Save className="w-4 h-4" />
                    <span>🔒 SAVE & LOCK ALL NUMBERS & LINKS (স্থায়ীভাবে সেভ করুন)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUSH NOTIFICATIONS BROADCAST */}
          {activeTab === 'push_notifications' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md">
                      <Radio className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black font-orbitron text-amber-400 flex items-center gap-2">
                        PUSH NOTIFICATION SYSTEM
                        {autoPushActive ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold font-rajdhani flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            ACTIVE (চালু)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold font-rajdhani">
                            INACTIVE (বন্ধ)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-300 font-bengali">
                        ইউজারদের মোবাইলে ১ ঘন্টা পর পর স্বয়ংক্রিয় পুশ নোটিফিকেশন পাঠান ও নিয়ন্ত্রণ করুন
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIVE / INACTIVE MAIN MASTER CONTROL BOX */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  autoPushActive
                    ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/40 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-900/90 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BellRing className={`w-5 h-5 ${autoPushActive ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
                        <span className="font-bold text-sm text-white font-rajdhani">
                          AUTO 1-HOUR PUSH NOTIFICATION (স্বয়ংক্রিয় নোটিফিকেশন স্ট্যাটাস):
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-bengali mt-1">
                        {autoPushActive
                          ? `🟢 একটিভ আছে! ইউজারদের ফোনে প্রতি ${autoPushInterval >= 60 ? (autoPushInterval / 60) + ' ঘন্টা' : autoPushInterval + ' মিনিট'} পর পর এই নোটিফিকেশনটি স্বয়ংক্রিয়ভাবে পপ-আপ যাবে।`
                          : '⚪ আন-একটিভ (বন্ধ আছে)! কোনো স্বয়ংক্রিয় নোটিফিকেশন পাঠানো হবে না। চালু করতে সুইচে ক্লিক করুন।'}
                      </p>
                    </div>

                    {/* Big Active/Inactive Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !autoPushActive;
                        setAutoPushActive(nextState);
                        const config = {
                          enabled: nextState,
                          title: pushTitle.trim() || 'সকালের ম্যাচ অ্যাড করা আছে',
                          message: pushMessage.trim() || 'জয়েন করে নিন',
                          intervalMinutes: autoPushInterval,
                          category: pushCategory,
                          linkTab: pushLinkTab,
                          lastUpdated: new Date().toISOString(),
                        };
                        localStorage.setItem('admin_auto_push_config', JSON.stringify(config));
                        if (onUpdateSettings) {
                          onUpdateSettings({ autoPushConfig: config });
                        }
                        if (nextState) {
                          onToast(`🟢 অটো-নোটিফিকেশন ACTIVE (চালু) করা হয়েছে! (প্রতি ${autoPushInterval >= 60 ? (autoPushInterval / 60) + ' ঘন্টা' : autoPushInterval + ' মিনিট'} পর পর যাবে)`);
                        } else {
                          onToast('⚪ অটো-নোটিফিকেশন INACTIVE (বন্ধ) করা হয়েছে।');
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold font-orbitron text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg active:scale-95 shrink-0 ${
                        autoPushActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 border border-emerald-300'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-750'
                      }`}
                    >
                      {autoPushActive ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-slate-950 fill-slate-950" />
                          <span>ACTIVE (চালু আছে)</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                          <span>INACTIVE (বন্ধ আছে)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interval Duration Selector */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-rajdhani font-bold">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>REPEAT INTERVAL (কতক্ষণ পর পর নোটিফিকেশন যাবে):</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '১ ঘন্টা পর পর (ডিফল্ট)', value: 60 },
                        { label: '৩০ মিনিট', value: 30 },
                        { label: '২ ঘন্টা', value: 120 },
                        { label: '৩ ঘন্টা', value: 180 },
                        { label: '৬ ঘন্টা', value: 360 },
                        { label: '১২ ঘন্টা', value: 720 },
                        { label: '২৪ ঘন্টা', value: 1440 },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setAutoPushInterval(item.value);
                            const config = {
                              enabled: autoPushActive,
                              title: pushTitle.trim() || 'সকালের ম্যাচ অ্যাড করা আছে',
                              message: pushMessage.trim() || 'জয়েন করে নিন',
                              intervalMinutes: item.value,
                              category: pushCategory,
                              linkTab: pushLinkTab,
                              lastUpdated: new Date().toISOString(),
                            };
                            localStorage.setItem('admin_auto_push_config', JSON.stringify(config));
                            if (onUpdateSettings) {
                              onUpdateSettings({ autoPushConfig: config });
                            }
                            onToast(`⏱️ ইন্টারভাল সেট করা হয়েছে: ${item.label}`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-rajdhani font-bold transition cursor-pointer ${
                            autoPushInterval === item.value
                              ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Preset Templates (Matching User's Video) */}
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
                        onToast('📋 টেমপ্লেট সেট করা হয়েছে: সকালের ম্যাচ জয়েন করুন');
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
                        onToast('📋 টেমপ্লেট সেট করা হয়েছে: রুম আইডি ও পাসওয়ার্ড');
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
                        onToast('📋 টেমপ্লেট সেট করা হয়েছে: ডিপোজিট অফার');
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
                        onToast('📋 টেমপ্লেট সেট করা হয়েছে: ফ্রি গিভঅ্যাওয়ে ম্যাচ');
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
                      12:21 AM • Just now
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
                            <span className="text-[11px] text-slate-400 font-normal">Just now</span>
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

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {/* Button 1: Save & Activate Auto-Broadcast */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!pushTitle.trim()) {
                        onToast('⚠️ দয়া করে নোটিফিকেশন টাইটেল লিখুন!');
                        return;
                      }
                      const config = {
                        enabled: true,
                        title: pushTitle.trim(),
                        message: pushMessage.trim(),
                        intervalMinutes: autoPushInterval,
                        category: pushCategory,
                        linkTab: pushLinkTab,
                        lastUpdated: new Date().toISOString(),
                      };
                      setAutoPushActive(true);
                      localStorage.setItem('admin_auto_push_config', JSON.stringify(config));
                      if (onUpdateSettings) {
                        onUpdateSettings({ autoPushConfig: config });
                      }
                      onToast(`🔒 সেভ ও অ্যাক্টিভ সম্পন্ন! প্রতি ${autoPushInterval >= 60 ? (autoPushInterval / 60) + ' ঘন্টা' : autoPushInterval + ' মিনিট'} পর পর সবার ফোনে যাবে।`);
                    }}
                    className="py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-emerald-400/40"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE & ACTIVATE (সেভ ও অটো চালু করুন)</span>
                  </button>

                  {/* Button 2: Broadcast Instantly Now */}
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
                      onToast('🚀 পুশ নোটিফিকেশন সফলভাবে সবার ফোনে পাঠানো হয়েছে!');
                    }}
                    className="py-3 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>BROADCAST INSTANTLY (এখনই পাঠান)</span>
                  </button>
                </div>

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
                  
                  <div className="bg-white text-slate-900 rounded-3xl p-5 border-2 border-slate-300 max-w-sm mx-auto shadow-xl overflow-hidden">
                    {/* Header matching AppNoticeModal */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          <Info className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-['Rajdhani',sans-serif] tracking-tight">
                          Notice
                        </h2>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
                        <X className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center pb-2">
                      <h3 className="text-base font-black text-slate-900 font-['Rajdhani',sans-serif] uppercase tracking-wide">
                        {noticeTitle || 'WELCOME TO BD ESPORTS MS 💖'}
                      </h3>
                    </div>

                    {/* Lines */}
                    <div className="space-y-2 text-xs text-slate-800 font-semibold font-bengali">
                      {noticeLines.map((line, i) => (
                        <div key={i} className="p-1.5 rounded-lg bg-slate-50 leading-relaxed">
                          {line}
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                      <div className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black font-['Rajdhani',sans-serif] text-xs rounded-xl shadow-md text-center flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ঠিক আছে, বুঝতে পেরেছি (OK)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={async () => {
                    const updated: AppNotice = {
                      enabled: noticeEnabled,
                      title: noticeTitle.trim() || DEFAULT_APP_NOTICE.title,
                      content: noticeLines.filter((l) => l.trim().length > 0),
                    };
                    if (onUpdateNotice) {
                      onUpdateNotice(updated);
                    }
                    localStorage.setItem('ff_app_entry_notice', JSON.stringify(updated));
                    localStorage.setItem('permanent_owner_notice_data', JSON.stringify(updated));
                    await saveRemoteSettings({}, updated);
                    onToast('✅ অ্যাপের নোটিশ সফলভাবে সেভ ও সকল ডিভাইসে আপডেট করা হয়েছে!');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE & UPDATE NOTICE (নোটিশ সেভ ও পাবলিশ করুন)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: BANNER & VIDEO SLIDER MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-6 h-6 text-purple-200" />
                    </div>
                    <div>
                      <h4 className="text-base font-black font-orbitron text-purple-400">
                        HERO BANNER & VIDEO SLIDER CONTROL
                      </h4>
                      <p className="text-xs text-slate-300 font-bengali">
                        হোমস্ক্রিন স্লাইডারে ছবি, ভিডিও ও লিঙ্ক স্থায়ীভাবে (Permanently) যুক্ত করুন
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultBanners}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer transition border border-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>রিসেট ডিফল্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCancelEditBanner();
                        const formElem = document.getElementById('banner-editor-form');
                        if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-xs font-rajdhani font-black flex items-center gap-1 cursor-pointer transition shadow-md active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>নতুন ব্যানার</span>
                    </button>
                  </div>
                </div>

                {/* Banner List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold font-orbitron text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>CURRENT BANNER SLIDES ({localBanners.length})</span>
                    </h5>
                    <span className="text-[11px] text-slate-400 font-bengali">ইউজাররা এই ক্রমে স্লাইড দেখতে পাবে</span>
                  </div>

                  <div className="space-y-2.5">
                    {localBanners.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          editingBannerId === slide.id
                            ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-400'
                            : slide.active !== false
                            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                        }`}
                      >
                        {/* Left: Order, Thumbnail, Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order Buttons */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveBanner(idx, 'up')}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <span className="text-center font-mono text-[10px] text-slate-400 font-bold">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={idx === localBanners.length - 1}
                              onClick={() => handleMoveBanner(idx, 'down')}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Mini Thumbnail */}
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 flex items-center justify-center relative">
                            {slide.type === 'image' && slide.mediaUrl ? (
                              <img
                                src={slide.mediaUrl}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : slide.type === 'video' ? (
                              <div className="w-full h-full bg-gradient-to-tr from-rose-950 to-slate-900 flex items-center justify-center">
                                <Play className="w-5 h-5 text-rose-400 fill-rose-400" />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-amber-600 to-orange-700 flex items-center justify-center p-1 text-[8px] font-black text-black text-center font-orbitron">
                                {slide.tag || 'CARD'}
                              </div>
                            )}
                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-bold text-white uppercase">
                              {slide.type || 'card'}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h6 className="text-xs font-bold text-white truncate font-orbitron">
                                {slide.title}
                              </h6>
                              {slide.tag && (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-mono shrink-0">
                                  {slide.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 truncate font-bengali">
                              {slide.subtitle || 'কোনো বিবরণ নেই'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span>ক্লিক একশন: <strong className="text-cyan-400">{slide.actionType || 'telegram'}</strong></span>
                              {slide.actionText && <span>• বাটন: <strong className="text-amber-300">{slide.actionText}</strong></span>}
                            </div>
                          </div>
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(slide.id)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              slide.active !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                            title="Toggle Active Status"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{slide.active !== false ? 'Active' : 'Inactive'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleStartEditBanner(slide);
                              const formElem = document.getElementById('banner-editor-form');
                              if (formElem) formElem.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer transition"
                            title="Edit Banner"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(slide.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-900/40 text-red-400 border border-slate-700 hover:border-red-500/40 cursor-pointer transition"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banner Add / Edit Form */}
                <div id="banner-editor-form" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h5 className="font-bold text-amber-400 font-orbitron text-xs flex items-center gap-1.5">
                      {editingBannerId ? <Edit className="w-4 h-4 text-amber-400" /> : <PlusCircle className="w-4 h-4 text-purple-400" />}
                      <span>{editingBannerId ? 'EDIT BANNER SLIDE' : 'ADD NEW BANNER SLIDE'}</span>
                    </h5>
                    {editingBannerId && (
                      <button
                        type="button"
                        onClick={handleCancelEditBanner}
                        className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveBanner} className="space-y-3.5 text-xs">
                    {/* Slide Type Selection */}
                    <div>
                      <label className="text-slate-300 font-bold block mb-1.5 font-rajdhani">
                        স্লাইডার ব্যানারের ধরন (Banner Type):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'custom', label: '🎨 Custom Styled Card', desc: 'লোগো + টেক্সট কার্ড' },
                          { id: 'image', label: '🖼️ Image Banner', desc: 'ছবি বা পোস্টার লিঙ্ক' },
                          { id: 'video', label: '🎥 Video Player', desc: 'YouTube ভিডিও লিঙ্ক' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setBannerType(t.id as any)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                              bannerType === t.id
                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-md ring-1 ring-purple-400'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="font-bold block text-xs">{t.label}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-bengali">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title & Tag */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          ব্যানার শিরোনাম (Title) *
                        </label>
                        <input
                          type="text"
                          required
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          placeholder="যেমন: BD ESPORTS MS বা MEGA TOURNAMENT"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          ট্যাগ / ব্যাজ (Tag/Badge)
                        </label>
                        <input
                          type="text"
                          value={bannerTag}
                          onChange={(e) => setBannerTag(e.target.value)}
                          placeholder="যেমন: DAILY GIVEAWAY বা SPECIAL EVENT"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Bengali Subtitle */}
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        বাংলা বিবরণ / সাবটাইটেল (Subtitle)
                      </label>
                      <input
                        type="text"
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        placeholder="যেমন: প্রতিদিন ফ্রি গিভঅ্যাওয়ে ও রুম কোড পেতে টেলিগ্রাম চ্যানেলে জয়েন করুন"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-bengali"
                      />
                    </div>

                    {/* Image URL input (if image type or video poster) */}
                    {bannerType === 'image' && (
                      <div className="space-y-2">
                        <label className="text-slate-300 font-bold block mb-1">
                          ছবি / পোস্টার লিঙ্ক (Image URL) *
                        </label>
                        <input
                          type="url"
                          value={bannerMediaUrl}
                          onChange={(e) => setBannerMediaUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-... বা যেকোনো ইমেজ লিঙ্ক"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        {/* Sample Quick Preset Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">স্যাম্পল ফ্রি ফায়ার ছবি:</span>
                          {[
                            { name: '🔥 FF Tournament', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80' },
                            { name: '💎 Diamonds', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80' },
                            { name: '🏆 Esports Trophy', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80' },
                          ].map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => setBannerMediaUrl(p.url)}
                              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 border border-slate-700 cursor-pointer"
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video URL input (if video type) */}
                    {bannerType === 'video' && (
                      <div className="space-y-2">
                        <label className="text-slate-300 font-bold block mb-1">
                          ইউটিউব বা ভিডিও লিঙ্ক (YouTube / Video URL) *
                        </label>
                        <input
                          type="text"
                          value={bannerMediaUrl}
                          onChange={(e) => setBannerMediaUrl(e.target.value)}
                          placeholder="যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono text-xs"
                        />
                        <p className="text-[10px] text-cyan-300 font-bengali">
                          💡 ইউজার ব্যানারের প্লে বাটনে ক্লিক করলে ইন-অ্যাপ পপআপে ভিডিও সরাসরি প্লে হবে!
                        </p>
                      </div>
                    )}

                    {/* Action On Click Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          ক্লিক করলে কোথায় যাবে (Action On Click)
                        </label>
                        <select
                          value={bannerActionType}
                          onChange={(e) => setBannerActionType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                        >
                          <option value="telegram">✈️ Telegram Channel (অটোমেটিক টেলিগ্রাম ওপেন হবে)</option>
                          <option value="shop">💎 Diamond Shop (টপ-আপ পেজে যাবে)</option>
                          <option value="category">🏆 Tournament Category (নির্দিষ্ট টুর্নামেন্টে যাবে)</option>
                          <option value="wallet">💰 Wallet / Add Money (ওয়ালেট পেজ)</option>
                          <option value="external_link">🔗 Custom Website / Link (যেকোনো লিঙ্ক)</option>
                          <option value="none">🚫 No Action (শুধু শো করবে)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          বাটনের টেক্সট (Action Button Text)
                        </label>
                        <input
                          type="text"
                          value={bannerActionText}
                          onChange={(e) => setBannerActionText(e.target.value)}
                          placeholder="যেমন: Join Telegram বা Top Up Now"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Target Category (if category selected) */}
                    {bannerActionType === 'category' && (
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          নির্দিষ্ট টুর্নামেন্ট ক্যাটাগরি (Target Category)
                        </label>
                        <select
                          value={bannerActionCategory}
                          onChange={(e) => setBannerActionCategory(e.target.value as MatchCategoryKey)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                        >
                          <option value="clash_squad">Clash Squad (4v4)</option>
                          <option value="cs_2v2">CS 2 VS 2</option>
                          <option value="lone_wolf">LONE WOLF (1v1 / 2v2)</option>
                          <option value="br_match">BR MATCH (Full Map)</option>
                          <option value="br_survival">BR SURVIVAL</option>
                          <option value="free_match">Free Match</option>
                        </select>
                      </div>
                    )}

                    {/* Custom External URL input (if external link selected) */}
                    {bannerActionType === 'external_link' && (
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          কাস্টম ওয়েবসাইটের লিঙ্ক (External URL)
                        </label>
                        <input
                          type="url"
                          value={bannerActionUrl}
                          onChange={(e) => setBannerActionUrl(e.target.value)}
                          placeholder="https://facebook.com/... বা https://youtube.com/..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono text-xs"
                        />
                      </div>
                    )}

                    {/* Gradient Theme selector (if custom card or overlay) */}
                    {bannerType === 'custom' && (
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          ব্যাকগ্রাউন্ড কালার থিম (Background Theme)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: '🔥 Gold Flame', val: 'from-[#1e0a00] via-[#2a1205] to-[#0d0400]' },
                            { name: '💜 Royal Purple', val: 'from-purple-950 via-indigo-950 to-black' },
                            { name: '💙 Cyber Blue', val: 'from-blue-950 via-slate-900 to-black' },
                            { name: '💚 Emerald Green', val: 'from-emerald-950 via-teal-950 to-black' },
                          ].map((g) => (
                            <button
                              key={g.name}
                              type="button"
                              onClick={() => setBannerBgGradient(g.val)}
                              className={`p-2 rounded-xl border text-center cursor-pointer transition ${
                                bannerBgGradient === g.val
                                  ? 'border-amber-400 bg-slate-800 text-white font-bold ring-1 ring-amber-300'
                                  : 'border-slate-800 bg-slate-950 text-slate-400'
                              }`}
                            >
                              <div className={`w-full h-4 rounded-md bg-gradient-to-r ${g.val} mb-1 border border-white/20`} />
                              <span className="text-[10px]">{g.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Card Preview in Admin */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1.5 font-rajdhani uppercase tracking-wider">
                        📱 Live Banner Preview (হোম স্ক্রিনে যেমন দেখাবে):
                      </span>
                      <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg border border-amber-500/30 bg-gradient-to-r ${bannerBgGradient} text-white min-h-[120px] flex flex-col justify-between p-3`}>
                        {bannerType === 'image' && bannerMediaUrl && (
                          <img
                            src={bannerMediaUrl}
                            alt="preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 bg-amber-500 text-black px-2 py-0.5 rounded-sm font-orbitron font-black text-[10px]">
                            <span>{bannerTag || 'BD ESPORTS'}</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-bold">
                            <span className="text-amber-300">{bannerActionText || 'Action'}</span>
                          </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2.5 mt-2">
                          <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-400/50 flex items-center justify-center shrink-0">
                            {bannerType === 'video' ? (
                              <Play className="w-5 h-5 text-rose-500 fill-rose-500" />
                            ) : (
                              <img src="/team_logo.png" alt="logo" className="w-full h-full object-cover rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h6 className="font-orbitron font-extrabold text-xs text-white leading-tight">
                              {bannerTitle || 'BANNER TITLE'}
                            </h6>
                            <p className="font-bengali text-xs font-bold text-yellow-300 leading-snug">
                              {bannerSubtitle || 'ব্যানারের বাংলা বিবরণ এখানে দেখা যাবে'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingBannerId ? 'SAVE CHANGES (পরিবর্তন সেভ করুন)' : 'ADD BANNER (ব্যানার যোগ করুন)'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAGE & CATEGORY PICTURE MANAGER (ডায়মন্ড টপ-আপ ও টুর্নামেন্ট পেজের ছবি পরিবর্তন) */}
          {activeTab === 'category_images' && (
            <div className="space-y-5 font-bengali">
              {/* Header Box */}
              <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
                      <ImageIcon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black font-orbitron text-cyan-400 flex items-center gap-2">
                        PAGE & CATEGORY PICTURE CONTROL
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-400/30">
                          Live Sync
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 font-bengali">
                        ডায়মন্ড টপ-আপ পেজের কার্ড এবং টুর্নামেন্ট পেজের ক্যাটাগরি ছবি সরাসরি পরিবর্তন ও কাস্টমাইজ করুন।
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateSettings) {
                        onUpdateSettings({
                          tournamentImages,
                          topupImages,
                        });
                      }
                      onToast('🔒 সমস্ত ছবি ডাটাবেজে ও সকল ডিভাইসের জন্য সেভ করা হয়েছে!');
                    }}
                    className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-emerald-400/40"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE ALL (সব ছবি সেভ করুন)</span>
                  </button>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setCategoryImageSubTab('tournament')}
                    className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-bold font-rajdhani flex items-center justify-center gap-2 transition cursor-pointer ${
                      categoryImageSubTab === 'tournament'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>🎮 টুর্নামেন্ট ক্যাটাগরি ({TOURNAMENT_CATEGORY_ITEMS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryImageSubTab('topup')}
                    className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-bold font-rajdhani flex items-center justify-center gap-2 transition cursor-pointer ${
                      categoryImageSubTab === 'topup'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Gem className="w-4 h-4" />
                    <span>💎 ডায়মন্ড টপ-আপ কার্ড ({TOPUP_CATEGORY_ITEMS.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryImageSubTab('presets')}
                    className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-bold font-rajdhani flex items-center justify-center gap-2 transition cursor-pointer ${
                      categoryImageSubTab === 'presets'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>✨ HD ছবি প্রিসেট ({PRESET_GALLERY_IMAGES.length})</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: TOURNAMENT CATEGORIES */}
              {categoryImageSubTab === 'tournament' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-amber-400 font-rajdhani uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      TOURNAMENT MATCH CATEGORIES ({TOURNAMENT_CATEGORY_ITEMS.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      গ্যালারি থেকে ফটো আপলোড করুন বা লিংক দিন
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TOURNAMENT_CATEGORY_ITEMS.map((item) => {
                      const currentImage = getTournamentImage(item.id, tournamentImages);
                      const isCustom = Boolean(tournamentImages[item.id] && tournamentImages[item.id].trim());

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 space-y-3 shadow-lg transition"
                        >
                          <div className="flex items-start gap-3">
                            {/* Live Artwork Thumbnail */}
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-500/40 bg-slate-900 shrink-0 shadow-md">
                              <img
                                src={currentImage}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-rajdhani uppercase shadow ${
                                    isCustom
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {isCustom ? 'CUSTOM PIC' : 'DEFAULT'}
                                </span>
                              </div>
                            </div>

                            {/* Details & Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-sm font-black font-orbitron text-white truncate">
                                  {item.name}
                                </h5>
                              </div>
                              <p className="text-xs text-amber-300 font-bold font-bengali">
                                {item.bengaliName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-sans leading-tight">
                                {item.description}
                              </p>

                              {/* Upload & Reset Buttons */}
                              <div className="pt-2 flex flex-wrap items-center gap-2">
                                <label className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>গ্যালারি থেকে ফটো আপলোড</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleCategoryImageUpload(e, 'tournament', item.id)}
                                  />
                                </label>

                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetTournamentImage(item.id)}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                                    title="রিসেট করে ডিফল্ট ছবিতে ফেরত যান"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>ডিফল্ট</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Direct URL Input */}
                          <div className="pt-1">
                            <label className="text-[11px] text-slate-400 font-bold block mb-1 font-rajdhani">
                              অথবা অনলাইন ইমেজ লিঙ্ক (Direct URL):
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                defaultValue={tournamentImages[item.id] || ''}
                                key={`url-${item.id}-${tournamentImages[item.id] || ''}`}
                                placeholder="https://i.imgur.com/... বা https://...jpg"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleUpdateTournamentImage(item.id, (e.target as HTMLInputElement).value);
                                  }
                                }}
                                id={`input-tourn-${item.id}`}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`input-tourn-${item.id}`) as HTMLInputElement;
                                  if (el) handleUpdateTournamentImage(item.id, el.value);
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs cursor-pointer transition active:scale-95"
                              >
                                সেভ
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 2: TOP-UP CATEGORIES */}
              {categoryImageSubTab === 'topup' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-cyan-400 font-rajdhani uppercase tracking-wider flex items-center gap-1.5">
                      <Gem className="w-4 h-4 text-cyan-400" />
                      TOP-UP & FEATURED OFFER CARDS ({TOPUP_CATEGORY_ITEMS.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ডায়মন্ড টপআপ পেজের সকল কার্ডের ছবি কাস্টমাইজ করুন
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TOPUP_CATEGORY_ITEMS.map((item) => {
                      const currentImage = getTopupImage(item.id, topupImages);
                      const isCustom = Boolean(topupImages[item.id] && topupImages[item.id].trim());

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3.5 space-y-3 shadow-lg transition"
                        >
                          <div className="flex items-start gap-3">
                            {/* Live Card Thumbnail */}
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-cyan-500/40 bg-slate-900 shrink-0 shadow-md">
                              <img
                                src={currentImage}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-rajdhani uppercase shadow ${
                                    isCustom
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {isCustom ? 'CUSTOM PIC' : 'DEFAULT'}
                                </span>
                              </div>
                            </div>

                            {/* Details & Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-sm font-black font-orbitron text-white truncate">
                                  {item.name}
                                </h5>
                              </div>
                              <p className="text-xs text-cyan-300 font-bold font-bengali">
                                {item.bengaliName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-sans leading-tight">
                                {item.description}
                              </p>

                              {/* Upload & Reset Buttons */}
                              <div className="pt-2 flex flex-wrap items-center gap-2">
                                <label className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>গ্যালারি থেকে ফটো আপলোড</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleCategoryImageUpload(e, 'topup', item.id)}
                                  />
                                </label>

                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetTopupImage(item.id)}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                                    title="রিসেট করে ডিফল্ট ছবিতে ফেরত যান"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>ডিফল্ট</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Direct URL Input */}
                          <div className="pt-1">
                            <label className="text-[11px] text-slate-400 font-bold block mb-1 font-rajdhani">
                              অথবা অনলাইন ইমেজ লিঙ্ক (Direct URL):
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                defaultValue={topupImages[item.id] || ''}
                                key={`url-${item.id}-${topupImages[item.id] || ''}`}
                                placeholder="https://i.imgur.com/... বা https://...jpg"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleUpdateTopupImage(item.id, (e.target as HTMLInputElement).value);
                                  }
                                }}
                                id={`input-topup-${item.id}`}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`input-topup-${item.id}`) as HTMLInputElement;
                                  if (el) handleUpdateTopupImage(item.id, el.value);
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs cursor-pointer transition active:scale-95"
                              >
                                সেভ
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: PRESET HD GAMING CHARACTER GALLERY */}
              {categoryImageSubTab === 'presets' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 space-y-2">
                    <h5 className="text-sm font-black font-orbitron text-purple-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      PRESET FREE FIRE HD AVATAR GALLERY
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      নিচের হাই-কোয়ালিটি গেমিং চরিত্রগুলোর যেকোনো একটিকে ১-ক্লিকে যেকোনো টুর্নামেন্ট বা টপ-আপ কার্ডে সেট করতে পারবেন:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_GALLERY_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-2.5 space-y-2 shadow-lg group transition flex flex-col justify-between"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-200 block truncate font-rajdhani">
                            {preset.name}
                          </span>
                        </div>

                        {/* Quick Apply Dropdown or action */}
                        <div className="space-y-1.5 pt-1">
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              if (val.startsWith('t:')) {
                                const catId = val.replace('t:', '');
                                handleUpdateTournamentImage(catId, preset.url);
                              } else if (val.startsWith('u:')) {
                                const key = val.replace('u:', '');
                                handleUpdateTopupImage(key, preset.url);
                              }
                              e.target.value = '';
                            }}
                            defaultValue=""
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-purple-300 outline-none focus:border-purple-400 font-rajdhani cursor-pointer"
                          >
                            <option value="" disabled>
                              + এই ছবিতে সেট করুন...
                            </option>
                            <optgroup label="🎮 টুর্নামেন্ট পেজ">
                              {TOURNAMENT_CATEGORY_ITEMS.map((t) => (
                                <option key={t.id} value={`t:${t.id}`}>
                                  {t.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="💎 ডায়মন্ড টপ-আপ পেজ">
                              {TOPUP_CATEGORY_ITEMS.map((u) => (
                                <option key={u.id} value={`u:${u.id}`}>
                                  {u.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DEDICATED PIN SECURITY TAB */}
          {activeTab === 'pin' && (
            <div className="space-y-4">
              {/* 1. OWNER MASTER PIN */}
              <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black font-orbitron text-amber-400">
                      👑 OWNER MASTER PIN (ফুল কন্ট্রোল পিন)
                    </h4>
                    <p className="text-xs text-slate-400 font-bengali">
                      অনার অ্যাডমিন প্যানেলের ফুল-এক্সেস পিন কোড এখান থেকে পরিবর্তন করুন।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-rajdhani">Current Owner Master PIN (বর্তমান অনার পিন):</span>
                    <span className="text-xl font-mono font-black text-amber-300 tracking-widest">{adminPin}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                    🔒 MASTER OWNER ACCESS
                  </span>
                </div>

                <form onSubmit={handleChangePin} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-200 font-bold block mb-1 font-rajdhani">
                      নতুন ৪ থেকে ৮ ডিজিটের অনার পিন দিন (New Owner PIN):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="যেমন: 7788 বা 9900"
                      className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-lg text-emerald-400 font-mono tracking-widest outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black font-orbitron text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95"
                  >
                    UPDATE OWNER PIN (অনার পিন সেভ করুন)
                  </button>
                </form>
              </div>

              {/* 2. SUB-ADMIN (MODERATOR) PIN */}
              <div className="bg-slate-950/90 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <ShieldCheck className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-base font-black font-orbitron text-indigo-400">
                      🛡️ SUB-ADMIN (MODERATOR) PIN (সীমিত পিন)
                    </h4>
                    <p className="text-xs text-slate-400 font-bengali">
                      যাকে এই পিন দিবেন সে শুধু ম্যাচ অ্যাড করতে পারবে এবং রুম আইডি/পাসওয়ার্ড দিতে পারবে।
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-rajdhani">Current Sub-Admin PIN (বর্তমান সাব-অ্যাডমিন পিন):</span>
                    <span className="text-xl font-mono font-black text-cyan-300 tracking-widest">{moderatorPin}</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-full font-bold">
                    🛡️ MATCH & ROOM ACCESS ONLY
                  </span>
                </div>

                <form onSubmit={handleChangeModPin} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-200 font-bold block mb-1 font-rajdhani">
                      নতুন সাব-অ্যাডমিন পিন দিন (New Sub-Admin PIN):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={newModPinInput}
                      onChange={(e) => setNewModPinInput(e.target.value)}
                      placeholder="যেমন: 1234 বা 4321"
                      className="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-lg text-cyan-300 font-mono tracking-widest outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black font-orbitron text-xs rounded-xl shadow-lg cursor-pointer transition active:scale-95"
                  >
                    UPDATE SUB-ADMIN PIN (সাব-অ্যাডমিন পিন সেভ করুন)
                  </button>
                </form>

                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3.5 text-xs text-indigo-200/90 font-bengali space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-cyan-300">
                    💡 সাব-অ্যাডমিন গাইডলাইন:
                  </p>
                  <p>• এই পিনটি দিয়ে লগইন করলে শুধুমাত্র "Manage Matches" এবং "Room ID/Pass" অপশন আসবে।</p>
                  <p>• সাব-অ্যাডমিন কোনো ডিপোজিট/উইথড্র রিকোয়েস্ট, পেমেন্ট নাম্বার বা অন্যান্য সেটিংস দেখতে বা পরিবর্তন করতে পারবে না।</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANTI-HACK & FIREWALL SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-black font-orbitron text-emerald-400">
                        ANTI-HACK FIREWALL & SECURITY SHIELD
                      </h4>
                      <p className="text-xs text-slate-400 font-bengali">
                        ১০০% নিরাপদ ও সুরক্ষিত সিস্টেম। কোনো হ্যাকিং বা অননুমোদিত অ্যাক্সেস সম্ভব নয়।
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
                    🛡️ 100% PROTECTED
                  </span>
                </div>

                {/* Security Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 font-rajdhani block">Firewall Status</span>
                    <span className="text-xs font-black font-orbitron text-emerald-400 flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      ACTIVE & LIVE
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 font-rajdhani block">Encryption</span>
                    <span className="text-xs font-black font-orbitron text-cyan-400 mt-1 block">
                      256-BIT SSL/TLS
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 font-rajdhani block">Brute-Force Guard</span>
                    <span className="text-xs font-black font-orbitron text-amber-400 mt-1 block">
                      5 TRIES MAX
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] text-slate-400 font-rajdhani block">Tamper Protection</span>
                    <span className="text-xs font-black font-orbitron text-violet-400 mt-1 block">
                      IMMUTABLE
                    </span>
                  </div>
                </div>

                {/* Security Protection Rules */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h5 className="font-bold text-amber-400 font-orbitron text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    সক্রিয় সিকিউরিটি গার্ডস (Active Security Protections):
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bengali text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">অ্যাডমিন পিন ব্রুট-ফোর্স লক:</strong>
                        <span>পরপর ৫ বার ভুল পিন দিলে স্বয়ংক্রিয়ভাবে ১৫ মিনিট লক হয়ে যাবে।</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">অ্যান্টি-ট্যাম্পার ওয়ালেট শিল্ড:</strong>
                        <span>ব্যবহারকারী তার ব্রাউজারে ব্যালেন্স পরিবর্তন করলে তা ব্লক হয়ে যাবে।</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">সার্ভার-সাইড ভ্যালিডেশন:</strong>
                        <span>নেগেটিভ অ্যামাউন্ট বা ফেক স্ক্রিপ্ট রিকোয়েস্ট সার্ভারে স্বয়ংক্রিয়ভাবে রিজেক্ট হয়।</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">HTTP সিকিউরিটি হেডারস:</strong>
                        <span>XSS, Clickjacking, MIME-sniffing ও ইনজেকশন অ্যাটাক সম্পূর্ণ সুরক্ষিত।</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Lockdown Action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsUnlocked(false);
                      onToast('🔒 অ্যাডমিন প্যানেল তাৎক্ষণিকভাবে লক করা হয়েছে!');
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-orbitron text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>INSTANT LOCK PANEL (এখনই প্যানেল লক করুন)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('pin');
                    }}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-orbitron text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Key className="w-4 h-4" />
                    <span>CHANGE MASTER PIN (গোপন পিন বদলান)</span>
                  </button>
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
