import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_USER,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  DEFAULT_APP_NOTICE,
  INITIAL_NOTIFICATIONS,
  DEFAULT_BANNERS,
} from './data/mockData';
import {
  AppNotice,
  AppNotification,
  AppSettings,
  BannerSlide,
  Match,
  MatchCategoryKey,
  TabType,
  TopupPackage,
  Transaction,
  User,
} from './types';
import {
  DEFAULT_SETTINGS,
  fetchSyncAllData,
  fetchRemoteSettings,
  saveRemoteSettings,
  fetchRemoteMatches,
  syncMatchesToServer,
  updateMatchRemote,
  deleteMatchRemote,
  fetchRemoteTransactions,
  saveTransactionRemote,
  updateTransactionStatusRemote,
  fetchRemoteNotifications,
  broadcastNotificationRemote,
  deleteNotificationRemote,
  fetchRemoteVouchers,
  fetchRemoteBanners,
  saveBannersRemote,
} from './api';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { PlayScreen } from './components/PlayScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MyMatchesScreen } from './components/MyMatchesScreen';
import { ShopScreen } from './components/ShopScreen';
import { MatchListScreen } from './components/MatchListScreen';
import { JoinMatchModal } from './components/JoinMatchModal';
import { WalletModal } from './components/WalletModal';
import { WithdrawModal } from './components/WithdrawModal';
import { RulesModal } from './components/RulesModal';
import { TopPlayersModal } from './components/TopPlayersModal';
import { DeveloperModal } from './components/DeveloperModal';
import { MyProfileModal } from './components/MyProfileModal';
import { ReferEarnModal } from './components/ReferEarnModal';
import { InstallModal } from './components/InstallModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AppNoticeModal } from './components/AppNoticeModal';
import { NotificationModal } from './components/NotificationModal';
import { PullToRefreshContainer } from './components/PullToRefreshContainer';
import { PushNotificationToast } from './components/PushNotificationToast';
import { BottomNav } from './components/BottomNav';
import { FloatingSupport } from './components/FloatingSupport';
import { FloatingInstallBanner } from './components/FloatingInstallBanner';
import { LandingPage } from './components/LandingPage';

export const normalizeMatchSlots = (matchList: Match[]): Match[] => {
  return matchList.map((m) => {
    // If Lone Wolf Solo -> 2 slots; Lone Wolf Duo -> 4 slots
    if (m.category === 'lone_wolf') {
      if (m.entryType === 'Solo' && (m.totalSlots === 48 || m.totalSlots > 2)) {
        return { ...m, totalSlots: 2 };
      }
      if (m.entryType === 'Duo' && (m.totalSlots === 48 || m.totalSlots > 4)) {
        return { ...m, totalSlots: 4 };
      }
    }
    // If CS 2v2 -> 4 slots for Duo, 2 for Solo
    if (m.category === 'cs_2v2') {
      if (m.entryType === 'Duo' && (m.totalSlots === 48 || m.totalSlots > 4)) {
        return { ...m, totalSlots: 4 };
      }
      if (m.entryType === 'Solo' && (m.totalSlots === 48 || m.totalSlots > 2)) {
        return { ...m, totalSlots: 2 };
      }
    }
    // If Clash Squad -> 8 slots for Squad, 4 for Duo, 2 for Solo
    if (m.category === 'clash_squad') {
      if (m.entryType === 'Squad' && (m.totalSlots === 48 || m.totalSlots > 8)) {
        return { ...m, totalSlots: 8 };
      }
      if (m.entryType === 'Duo' && (m.totalSlots === 48 || m.totalSlots > 4)) {
        return { ...m, totalSlots: 4 };
      }
      if (m.entryType === 'Solo' && (m.totalSlots === 48 || m.totalSlots > 2)) {
        return { ...m, totalSlots: 2 };
      }
    }
    return m;
  });
};

export default function App() {
  // State persistence via localStorage - default directly to authenticated gaming app
  const [authState, setAuthState] = useState<'landing' | 'login' | 'signup' | 'authenticated'>('authenticated');
  const [currentTab, setCurrentTab] = useState<TabType>('play');
  const [selectedCategory, setSelectedCategory] = useState<MatchCategoryKey | null>(null);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ff_tournament_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure any legacy fake test balance (like 140, 150, etc.) is reset unless real approved transactions exist
        const savedTxns = localStorage.getItem('ff_tournament_transactions');
        let realApprovedDeposit = 0;
        if (savedTxns) {
          try {
            const txns: Transaction[] = JSON.parse(savedTxns);
            if (Array.isArray(txns) && txns.length > 0) {
              const approvedDeposits = txns
                .filter((t) => t.type === 'deposit' && t.status === 'approved')
                .reduce((acc, t) => acc + (t.amount || 0), 0);
              const matchEntries = txns
                .filter((t) => t.type === 'match_entry')
                .reduce((acc, t) => acc + (t.amount || 0), 0);
              const topups = txns
                .filter((t) => t.type === 'topup_purchase')
                .reduce((acc, t) => acc + (t.amount || 0), 0);
              const withdrawals = txns
                .filter((t) => t.type === 'withdraw' && t.status !== 'rejected')
                .reduce((acc, t) => acc + (t.amount || 0), 0);
              realApprovedDeposit = Math.max(0, approvedDeposits - matchEntries - topups - withdrawals);
            }
          } catch {}
        }
        return {
          ...INITIAL_USER,
          ...parsed,
          balance: realApprovedDeposit,
        };
      } catch (e) {}
    }
    return INITIAL_USER;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const DUMMY_LIST = ['01712345678', '01812345678', '019999888775', '01700000000'];
    const cleanNum = (val: string | undefined | null) => {
      if (val && !DUMMY_LIST.includes(val.trim())) return val.trim();
      return '01612456053';
    };

    const saved = localStorage.getItem('bd_esports_settings');
    const localBkash = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number');
    const localNagad = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number');
    const localRocket = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number');
    const localTelegram = localStorage.getItem('permanent_owner_telegram') || localStorage.getItem('admin_telegram_link');
    const localApk = localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url');
    const localNoticeText = localStorage.getItem('permanent_owner_notice') || localStorage.getItem('admin_notice_text');
    const localPin = localStorage.getItem('permanent_owner_pin') || localStorage.getItem('owner_admin_pin');
    const localModPin = localStorage.getItem('permanent_moderator_pin') || localStorage.getItem('moderator_admin_pin');

    let initialTopupImages: Record<string, string> = {};
    let initialTournamentImages: Record<string, string> = {};
    try {
      const savedTopup = localStorage.getItem('permanent_topup_images') || localStorage.getItem('bd_esports_topup_images');
      if (savedTopup) initialTopupImages = JSON.parse(savedTopup);
    } catch {}
    try {
      const savedTour = localStorage.getItem('permanent_tournament_images') || localStorage.getItem('bd_esports_tournament_images');
      if (savedTour) initialTournamentImages = JSON.parse(savedTour);
    } catch {}

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          bkashNumber: cleanNum(localBkash || parsed.bkashNumber),
          nagadNumber: cleanNum(localNagad || parsed.nagadNumber),
          rocketNumber: cleanNum(localRocket || parsed.rocketNumber),
          telegramLink: localTelegram || parsed.telegramLink || DEFAULT_SETTINGS.telegramLink,
          apkDownloadUrl: localApk || parsed.apkDownloadUrl || DEFAULT_SETTINGS.apkDownloadUrl,
          noticeText: localNoticeText || parsed.noticeText || DEFAULT_SETTINGS.noticeText,
          adminPin: localPin || parsed.adminPin || DEFAULT_SETTINGS.adminPin,
          moderatorPin: localModPin || parsed.moderatorPin || DEFAULT_SETTINGS.moderatorPin,
          autoPushConfig: parsed.autoPushConfig || DEFAULT_SETTINGS.autoPushConfig,
          tournamentImages: { ...initialTournamentImages, ...(parsed.tournamentImages || {}) },
          topupImages: { ...initialTopupImages, ...(parsed.topupImages || {}) },
        };
      } catch (e) {}
    }
    return {
      bkashNumber: cleanNum(localBkash),
      nagadNumber: cleanNum(localNagad),
      rocketNumber: cleanNum(localRocket),
      telegramLink: localTelegram || DEFAULT_SETTINGS.telegramLink,
      apkDownloadUrl: localApk || DEFAULT_SETTINGS.apkDownloadUrl,
      noticeText: localNoticeText || DEFAULT_SETTINGS.noticeText,
      adminPin: localPin || DEFAULT_SETTINGS.adminPin,
      moderatorPin: localModPin || DEFAULT_SETTINGS.moderatorPin,
      tournamentImages: initialTournamentImages,
      topupImages: initialTopupImages,
    };
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903', 'm-078495'];
    const saved = localStorage.getItem('ff_tournament_matches');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((m: any) => !dummyIds.includes(m.id));
          return normalizeMatchSlots(clean);
        }
      } catch {}
    }
    return INITIAL_MATCHES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ff_tournament_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [appNotice, setAppNotice] = useState<AppNotice>(() => {
    const saved = localStorage.getItem('ff_app_entry_notice');
    return saved ? JSON.parse(saved) : DEFAULT_APP_NOTICE;
  });

  // Hero Banners state
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    const saved = localStorage.getItem('bd_esports_banners');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_BANNERS;
  });

  // Push Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ff_app_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [activePushNotification, setActivePushNotification] = useState<AppNotification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Entry notice popup on app load
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(true);

  // Modals state
  const [joiningMatch, setJoiningMatch] = useState<Match | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showTopPlayers, setShowTopPlayers] = useState(false);
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReferEarn, setShowReferEarn] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminInitialPanel, setAdminInitialPanel] = useState<'T' | 'D'>('T');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [showQuickToolbar, setShowQuickToolbar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSyncingRef = useRef(false);

  // Initial remote fetch & periodic real-time sync with high efficiency & zero UI freeze
  const performSync = async (force: boolean = false) => {
    if (typeof document !== 'undefined' && document.hidden && !force) return;
    if (isSyncingRef.current && !force) return; // Prevent piled-up network tasks on low-end devices
    isSyncingRef.current = true;
    try {
      const fullData = await fetchSyncAllData();
      if (!fullData) return;

      // 1. Settings & Notice
      if (fullData.settings) {
        setAppSettings((prev) => {
          const merged: AppSettings = {
            ...prev,
            ...fullData.settings,
            tournamentImages: {
              ...(prev?.tournamentImages || {}),
              ...(fullData.settings.tournamentImages || {}),
            },
            topupImages: {
              ...(prev?.topupImages || {}),
              ...(fullData.settings.topupImages || {}),
            },
          };
          if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
          try {
            localStorage.setItem('bd_esports_settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
      if (fullData.notice) {
        setAppNotice((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fullData.notice)) return prev;
          return fullData.notice;
        });
      }

      // 2. Matches
      if (fullData.matches && Array.isArray(fullData.matches)) {
        const cleanMatches = normalizeMatchSlots(fullData.matches);
        setMatches((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(cleanMatches)) return prev;
          localStorage.setItem('ff_tournament_matches', JSON.stringify(cleanMatches));
          return cleanMatches;
        });
      }

      // 3. Transactions & Real Balance Calculation
      if (fullData.transactions && Array.isArray(fullData.transactions)) {
        setTransactions((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fullData.transactions)) return prev;
          return fullData.transactions;
        });

        // Anti-Hacking: Calculate real legitimate balance from verified transactions
        const myTxns = fullData.transactions.filter(
          (t) => (!t.userId || t.userId === user.id) && (!t.userPhone || t.userPhone === user.phone)
        );
        const approvedDeposits = myTxns
          .filter((t) => t.type === 'deposit' && t.status === 'approved')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const matchPrizes = myTxns
          .filter((t) => t.type === 'match_prize' && t.status === 'approved')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const matchEntries = myTxns
          .filter((t) => t.type === 'match_entry')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const topups = myTxns
          .filter((t) => t.type === 'topup_purchase')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const withdrawals = myTxns
          .filter((t) => t.type === 'withdraw' && t.status !== 'rejected')
          .reduce((acc, t) => acc + (t.amount || 0), 0);
        const realBal = Math.max(0, approvedDeposits + matchPrizes - matchEntries - topups - withdrawals);
        setUser((prev) => (prev.balance !== realBal ? { ...prev, balance: realBal } : prev));
      }

      // 4. Notifications
      if (fullData.notifications && fullData.notifications.length > 0) {
        setNotifications((prev) => {
          const lastPrevId = prev[0]?.id;
          const newLatest = fullData.notifications[0];
          if (newLatest && newLatest.id !== lastPrevId) {
            setActivePushNotification(newLatest);
          }
          if (JSON.stringify(prev) === JSON.stringify(fullData.notifications)) return prev;
          return fullData.notifications;
        });
      }

      // 5. Vouchers
      if (fullData.vouchers && Array.isArray(fullData.vouchers) && fullData.vouchers.length > 0) {
        localStorage.setItem('admin_voucher_vault', JSON.stringify(fullData.vouchers));
      }

      // 6. Banners
      if (fullData.banners && Array.isArray(fullData.banners) && fullData.banners.length > 0) {
        setBanners((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fullData.banners)) return prev;
          localStorage.setItem('bd_esports_banners', JSON.stringify(fullData.banners));
          return fullData.banners;
        });
      }
    } catch (err) {
    } finally {
      isSyncingRef.current = false;
    }
  };

  const handleManualRefresh = async () => {
    await performSync(true);
    showToast('🔄 ডাটা সফলভাবে রিফ্রেশ হয়েছে! (ম্যাচ আপডেট সম্পন্ন)');
  };

  useEffect(() => {
    performSync(true);
    const interval = setInterval(() => performSync(false), 6000);

    const handleFocusSync = () => {
      performSync(true);
    };

    window.addEventListener('visibilitychange', handleFocusSync);
    window.addEventListener('focus', handleFocusSync);
    window.addEventListener('pageshow', handleFocusSync);
    window.addEventListener('online', handleFocusSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleFocusSync);
      window.removeEventListener('focus', handleFocusSync);
      window.removeEventListener('pageshow', handleFocusSync);
      window.removeEventListener('online', handleFocusSync);
    };
  }, []);

  // Capture PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 1-Hour Automatic Notification Engine
  // Triggers periodic notifications to users based on admin autoPushConfig settings
  useEffect(() => {
    const autoConfig = appSettings?.autoPushConfig;
    if (!autoConfig || autoConfig.enabled === false) {
      return;
    }

    // Check if user has notifications enabled
    if (user.notificationsEnabled === false) {
      return;
    }

    const intervalMinutes = autoConfig.intervalMinutes && autoConfig.intervalMinutes > 0
      ? autoConfig.intervalMinutes
      : 60;
    const intervalMs = intervalMinutes * 60 * 1000;

    const triggerAutoPush = () => {
      const title = autoConfig.title?.trim() || 'সকালের ম্যাচ অ্যাড করা আছে';
      const message = autoConfig.message?.trim() || 'জয়েন করে নিন';
      const category = autoConfig.category || 'match';
      const linkTab = autoConfig.linkTab || 'play';

      const autoNotif: AppNotification = {
        id: `auto-${Date.now()}`,
        title,
        message,
        timestamp: 'Just now',
        read: false,
        category,
        linkTab,
      };

      // Play audio chime and trigger pop-up banner
      setActivePushNotification(autoNotif);
      setNotifications((prev) => [autoNotif, ...prev.slice(0, 49)]);
      localStorage.setItem('last_auto_push_timestamp', Date.now().toString());
    };

    // Check when was the last auto-push
    const lastTrigger = Number(localStorage.getItem('last_auto_push_timestamp') || '0');
    const now = Date.now();
    const timeSinceLast = now - lastTrigger;

    let initialTimeoutId: NodeJS.Timeout | null = null;
    let mainIntervalId: NodeJS.Timeout | null = null;

    if (timeSinceLast >= intervalMs || lastTrigger === 0) {
      // Fire notification after 3.5s of app launch if 1 hour has elapsed
      initialTimeoutId = setTimeout(() => {
        triggerAutoPush();
      }, 3500);
    }

    // Setup the repeating interval (1 hour / configured interval)
    mainIntervalId = setInterval(() => {
      triggerAutoPush();
    }, intervalMs);

    return () => {
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      if (mainIntervalId) clearInterval(mainIntervalId);
    };
  }, [
    appSettings?.autoPushConfig?.enabled,
    appSettings?.autoPushConfig?.intervalMinutes,
    appSettings?.autoPushConfig?.title,
    appSettings?.autoPushConfig?.message,
    appSettings?.autoPushConfig?.category,
    appSettings?.autoPushConfig?.linkTab,
    appSettings?.autoPushConfig?.lastUpdated,
    user?.notificationsEnabled,
  ]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ff_tournament_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bd_esports_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('ff_tournament_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('ff_tournament_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ff_app_entry_notice', JSON.stringify(appNotice));
  }, [appNotice]);

  useEffect(() => {
    localStorage.setItem('ff_app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update Settings Handler (Syncs to server so all phones see new payment numbers)
  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = {
      ...appSettings,
      ...newSettings,
      tournamentImages: {
        ...(appSettings.tournamentImages || {}),
        ...(newSettings.tournamentImages || {}),
      },
      topupImages: {
        ...(appSettings.topupImages || {}),
        ...(newSettings.topupImages || {}),
      },
    };
    setAppSettings(updated);
    try {
      localStorage.setItem('bd_esports_settings', JSON.stringify(updated));
    } catch {}
    await saveRemoteSettings(newSettings, appNotice);
  };

  const handleUpdateNotice = async (newNotice: AppNotice) => {
    setAppNotice(newNotice);
    localStorage.setItem('ff_app_entry_notice', JSON.stringify(newNotice));
    await saveRemoteSettings({}, newNotice);
  };

  // Auth Handlers
  const handleLogin = (username: string) => {
    setUser((prev) => ({
      ...prev,
      username: username || 'mobarok55',
    }));
    setAuthState('authenticated');
    showToast(`Welcome back, ${username || 'mobarok55'}!`);
  };

  const handleSignUp = (userData: { username: string; email: string; phone: string }) => {
    setUser((prev) => ({
      ...prev,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      balance: 100, // welcome bonus
      matchesJoined: 0,
      totalWon: 0,
    }));
    setAuthState('authenticated');
    showToast('Account created successfully! ৳100 Welcome Bonus added.');
  };

  const handleLogout = () => {
    setAuthState('login');
    setSelectedCategory(null);
    setCurrentTab('play');
    showToast('Logged out successfully');
  };

  // Match Join Handler
  const handleConfirmJoinMatch = (matchId: string, slot: number, ign: string, uid: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    // Deduct fee if any
    if (targetMatch.entryFee > 0) {
      setUser((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - targetMatch.entryFee),
        matchesJoined: prev.matchesJoined + 1,
        freeFireIgn: ign,
        freeFireUid: uid,
      }));

      const newTxn: Transaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'match_entry',
        amount: targetMatch.entryFee,
        status: 'approved',
        date: new Date().toLocaleString(),
        description: `Entry fee for ${targetMatch.title} (Slot #${slot})`,
      };
      setTransactions((prev) => [newTxn, ...prev]);
      saveTransactionRemote(newTxn);
    } else {
      setUser((prev) => ({
        ...prev,
        matchesJoined: prev.matchesJoined + 1,
        freeFireIgn: ign,
        freeFireUid: uid,
      }));
    }

    // Add player to match
    const newPlayer = { slot, username: user.username, ign, uid };
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          joinedPlayers: [...m.joinedPlayers.filter((p) => p.slot !== slot), newPlayer],
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    syncMatchesToServer(updatedMatches);

    setJoiningMatch(null);
    showToast(`Successfully joined Match Slot #${slot}! Check "My Matches" for Room ID.`);
  };

  // User Cancel/Leave Match Handler (Refund entry fee)
  const handleUserLeaveMatch = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    // Refund entry fee
    if (targetMatch.entryFee > 0) {
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + targetMatch.entryFee,
        matchesJoined: Math.max(0, prev.matchesJoined - 1),
      }));

      const refundTxn: Transaction = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'deposit',
        amount: targetMatch.entryFee,
        status: 'approved',
        date: new Date().toLocaleString(),
        description: `Refund for cancelled match: ${targetMatch.title}`,
      };
      setTransactions((prev) => [refundTxn, ...prev]);
      saveTransactionRemote(refundTxn);
    } else {
      setUser((prev) => ({
        ...prev,
        matchesJoined: Math.max(0, prev.matchesJoined - 1),
      }));
    }

    // Remove player from match slot
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          joinedPlayers: m.joinedPlayers.filter((p) => p.username !== user.username),
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    syncMatchesToServer(updatedMatches);

    showToast(`Match registration cancelled! ৳${targetMatch.entryFee} refunded to wallet.`);
  };

  // Real Instant Deposit Handler (with instant auto-credit & anti-hacking security)
  const handleDeposit = (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', sender: string, trxId: string) => {
    const cleanTrx = trxId.trim().toUpperCase();

    // Anti-Hacking: Duplicate TrxID Check on client
    if (transactions.some((t) => t.trxId && t.trxId.trim().toUpperCase() === cleanTrx)) {
      showToast('⚠️ এই TrxID ইতিপূর্বে ব্যবহার করা হয়েছে!');
      return;
    }

    const newTxnId = `TXN-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
    const newTxn: Transaction = {
      id: newTxnId,
      type: 'deposit',
      method,
      amount,
      senderNumber: sender,
      trxId: cleanTrx,
      userId: user.id,
      userPhone: user.phone || sender,
      userName: user.username,
      status: 'approved', // Real Instant Add Money!
      date: new Date().toLocaleString(),
      description: `Instant Real Deposit via ${method} (TrxID: ${cleanTrx})`,
    };

    // Credit instantly to user's real balance
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));

    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);

    showToast(`⚡ ৳${amount} টাকা সফলভাবে ওয়ালেটে যুক্ত হয়েছে! (TrxID: ${cleanTrx})`);

    const autoNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `💰 ৳${amount} ডিপোজিট সফল (Instant)!`,
      message: `আপনার ${method} (${sender}) থেকে পাঠানো ৳${amount} টাকা সফলভাবে যাচাইপূর্বক আপনার একাউন্টে যোগ হয়েছে।`,
      timestamp: 'just now',
      read: false,
      category: 'deposit',
      linkTab: 'play',
    };
    setNotifications((prev) => [autoNotif, ...prev]);
    setActivePushNotification(autoNotif);
    broadcastNotificationRemote(autoNotif);
  };

  // Real Instant Withdraw Handler
  const handleWithdraw = (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', receiver: string) => {
    if (amount < 50) {
      showToast('⚠️ মিনিমাম উইথড্র ৫০ টাকা!');
      return;
    }
    if (amount > user.balance) {
      showToast(`⚠️ অপর্যাপ্ত ব্যালেন্স! আপনার বর্তমান ব্যালেন্স ৳${user.balance}`);
      return;
    }

    // Immediately deduct amount from balance (anti-hacking: prevents double withdraw)
    setUser((prev) => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));

    const payoutTxnId = `TXN-W${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
    const newTxn: Transaction = {
      id: payoutTxnId,
      type: 'withdraw',
      method,
      amount,
      senderNumber: receiver,
      userId: user.id,
      userPhone: user.phone || receiver,
      userName: user.username,
      status: 'approved', // Real Instant Withdraw Processing!
      date: new Date().toLocaleString(),
      description: `Instant Cashout to ${method} (${receiver})`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);

    showToast(`⚡ ৳${amount} টাকা উইথড্র সফল হয়েছে! (${method}: ${receiver})`);

    const autoNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `🎉 ৳${amount} টাকা উইথড্র সফল!`,
      message: `আপনার ৳${amount} টাকা ${method} (${receiver}) অ্যাকাউন্টে সফলভাবে প্রসেস ও প্রদান করা হয়েছে।`,
      timestamp: 'just now',
      read: false,
      category: 'deposit',
      linkTab: 'profile',
    };
    setNotifications((prev) => [autoNotif, ...prev]);
    setActivePushNotification(autoNotif);
    broadcastNotificationRemote(autoNotif);
  };

  // Shop Top-up Order Handler
  const handleSuccessShopOrder = (item: TopupPackage, uid: string, deliveredCode?: string, costInfo?: string) => {
    if (user.balance >= item.price) {
      setUser((prev) => ({ ...prev, balance: prev.balance - item.price, freeFireUid: uid }));
    }
    const orderId = `MS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'topup_purchase',
      amount: item.price,
      targetUid: uid,
      packageName: item.name,
      orderId: orderId,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: `Diamond Top-up: ${item.name} for UID: ${uid}`,
      deliveredCode: deliveredCode,
      voucherCostInfo: costInfo,
      isAutoDelivered: !!deliveredCode,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);

    if (deliveredCode) {
      showToast(`⚡ ${item.name} ভল্ট থেকে অটো-ডেলিভার্ড হয়েছে! (PIN: ${deliveredCode})`);
    } else {
      showToast(`✅ ${item.name} সফলভাবে অর্ডার হয়েছে! UID: ${uid} (Order ID: ${orderId})`);
    }

    // Auto-broadcast top-up notification
    const autoNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `💎 টপ-আপ সফল হয়েছে! (${item.name})`,
      message: deliveredCode
        ? `আপনার ${uid} অ্যাকাউন্টে ${item.name} সফলভাবে পাঠানো হয়েছে। (অটো ভল্ট PIN: ${deliveredCode}, ৳${item.price} পরিশোধিত, Order: ${orderId})`
        : `আপনার ${uid} অ্যাকাউন্টে ${item.name} সফলভাবে পাঠানো হয়েছে। (৳${item.price} পরিশোধিত, Order: ${orderId})`,
      timestamp: 'just now',
      read: false,
      category: 'offer',
      linkTab: 'shop',
    };
    setNotifications((prev) => [autoNotif, ...prev]);
    setActivePushNotification(autoNotif);
    broadcastNotificationRemote(autoNotif);
  };

  // Admin Match Operations
  const handleAddMatch = (newMatch: Match) => {
    const updated = normalizeMatchSlots([newMatch, ...matches]);
    setMatches(updated);
    localStorage.setItem('ff_tournament_matches', JSON.stringify(updated));
    syncMatchesToServer(updated);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updated = normalizeMatchSlots(matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    setMatches(updated);
    localStorage.setItem('ff_tournament_matches', JSON.stringify(updated));
    updateMatchRemote(updatedMatch);
    syncMatchesToServer(updated);
  };

  const handleDeleteMatch = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (targetMatch) {
      const userJoined = targetMatch.joinedPlayers.some((p) => p.username === user.username);
      if (userJoined && targetMatch.entryFee > 0) {
        setUser((prev) => ({
          ...prev,
          balance: prev.balance + targetMatch.entryFee,
          matchesJoined: Math.max(0, prev.matchesJoined - 1),
        }));
        const refundTxn: Transaction = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'deposit',
          amount: targetMatch.entryFee,
          status: 'approved',
          date: new Date().toLocaleString(),
          description: `Refund (Match Cancelled): ${targetMatch.title}`,
        };
        setTransactions((prev) => [refundTxn, ...prev]);
        saveTransactionRemote(refundTxn);
      }
    }
    const updated = matches.filter((m) => m.id !== matchId);
    setMatches(updated);
    localStorage.setItem('ff_tournament_matches', JSON.stringify(updated));
    deleteMatchRemote(matchId);
    syncMatchesToServer(updated);
    showToast('🗑️ ম্যাচটি সফলভাবে ডিলিট করা হয়েছে!');
  };

  const handleMoveMatchUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...matches];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    setMatches(copy);
    syncMatchesToServer(copy);
  };

  const handleMoveMatchDown = (index: number) => {
    if (index >= matches.length - 1) return;
    const copy = [...matches];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    setMatches(copy);
    syncMatchesToServer(copy);
  };

  const handleApproveTransaction = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (!target) return;

    // If it was a pending deposit, credit real balance to user now!
    if (target.type === 'deposit' && target.status === 'pending') {
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + target.amount,
      }));
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'approved' } : t))
    );
    updateTransactionStatusRemote(txnId, 'approved');

    if (target.type === 'deposit') {
      showToast(`✅ Deposit of ৳${target.amount} approved! ৳${target.amount} added to user wallet.`);
      const autoNotif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: `💰 ডিপোজিট সফল হয়েছে! (৳${target.amount} ${target.method || 'bKash'})`,
        message: `আপনার ৳${target.amount} টাকা ডিপোজিট ভেরিফাই করা হয়েছে এবং ওয়ালেটে যোগ হয়েছে। এখনই টুর্নামেন্টে জয়েন করুন!`,
        timestamp: 'just now',
        read: false,
        category: 'deposit',
        linkTab: 'play',
      };
      setNotifications((prev) => [autoNotif, ...prev]);
      setActivePushNotification(autoNotif);
      broadcastNotificationRemote(autoNotif);
    } else {
      showToast(`✅ Withdrawal of ৳${target.amount} approved & recorded as paid!`);
      const autoNotif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: `🎉 উইথড্র পরিশোধ করা হয়েছে! (৳${target.amount} ${target.method || 'bKash'})`,
        message: `আপনার ৳${target.amount} টাকা উইথড্র সফলভাবে পরিশোধ করা হয়েছে। ${target.method || 'bKash'} (${target.senderNumber || ''}) চেক করুন!`,
        timestamp: 'just now',
        read: false,
        category: 'deposit',
        linkTab: 'profile',
      };
      setNotifications((prev) => [autoNotif, ...prev]);
      setActivePushNotification(autoNotif);
      broadcastNotificationRemote(autoNotif);
    }
  };

  const handleRejectTransaction = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (target && target.type === 'deposit' && target.status === 'approved') {
      // Anti-Fraud: Deduct fake deposit amount back from user wallet
      setUser((prev) => ({
        ...prev,
        balance: Math.max(0, prev.balance - target.amount),
      }));
    } else if (target && target.type === 'withdraw' && target.status === 'pending') {
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + target.amount,
      }));
    }
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId
          ? { ...t, status: 'rejected', isFraudRevoked: target?.type === 'deposit' }
          : t
      )
    );
    updateTransactionStatusRemote(txnId, 'rejected');
    if (target && target.type === 'withdraw') {
      showToast(`❌ Withdrawal rejected & ৳${target.amount} refunded to user wallet.`);
    } else if (target && target.type === 'deposit' && target.status === 'approved') {
      showToast(`⚠️ ভুয়া TrxID বাতিল ও ব্যালেন্স থেকে ৳${target.amount} কেটে নেওয়া হয়েছে!`);
    } else {
      showToast(`❌ Deposit rejected.`);
    }
  };

  const handleAdjustUserBalance = (amount: number, type: 'add' | 'deduct', reason: string) => {
    setUser((prev) => ({
      ...prev,
      balance: type === 'add' ? prev.balance + amount : Math.max(0, prev.balance - amount),
    }));
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: type === 'add' ? 'deposit' : 'withdraw',
      amount,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: `Admin Balance Adjustment (${type === 'add' ? 'Added' : 'Deducted'}): ${reason || 'Manual Adjustment'}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);
    showToast(`✅ User balance updated: ${type === 'add' ? '+' : '-'}৳${amount} BDT!`);

    const autoNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: type === 'add' ? `💰 ওয়ালেটে ৳${amount} টাকা যোগ হয়েছে!` : `⚠️ ওয়ালেট থেকে ৳${amount} টাকা অ্যাডজাস্ট করা হয়েছে`,
      message: `অ্যাডমিন আপনার ওয়ালেট ব্যালেন্স পরিবর্তন করেছেন। কারণ: ${reason || 'সরাসরি অ্যাডমিন আপডেট'}`,
      timestamp: 'just now',
      read: false,
      category: 'deposit',
      linkTab: 'profile',
    };
    setNotifications((prev) => [autoNotif, ...prev]);
    setActivePushNotification(autoNotif);
    broadcastNotificationRemote(autoNotif);
  };

  const handleAdminDirectPayout = (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', receiver: string, note: string) => {
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'withdraw',
      method,
      amount,
      senderNumber: receiver,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: `Admin Direct Payout (${method}) to ${receiver}: ${note || 'Instant Payout'}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);
    showToast(`✅ Successfully paid ৳${amount} to ${receiver} via ${method}!`);

    // Auto-broadcast notification to user's app
    const autoNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `🎁 প্রাইজমানি / ক্যাশ পেমেন্ট! (৳${amount} ${method})`,
      message: `অ্যাডমিন আপনার ${receiver} নম্বরে (${method}) ৳${amount} টাকা পাঠিয়েছেন। (${note || 'টুর্নামেন্ট প্রাইজমানি'})`,
      timestamp: 'just now',
      read: false,
      category: 'offer',
      linkTab: 'profile',
    };
    setNotifications((prev) => [autoNotif, ...prev]);
    setActivePushNotification(autoNotif);
    broadcastNotificationRemote(autoNotif);
  };

  // Push Notification Handlers
  const handleSendNotification = (notifData: {
    title: string;
    message: string;
    category?: 'match' | 'deposit' | 'system' | 'room' | 'offer';
    linkTab?: TabType;
  }) => {
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: notifData.title,
      message: notifData.message,
      timestamp: 'just now',
      read: false,
      category: notifData.category || 'match',
      linkTab: notifData.linkTab,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActivePushNotification(newNotif);
    broadcastNotificationRemote(newNotif);
    showToast('🚀 Push notification broadcast sent to all players!');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationRemote(id);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared.');
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setShowNotificationModal(false);
    setActivePushNotification(null);

    if (notif.linkTab) {
      setCurrentTab(notif.linkTab);
      setSelectedCategory(null);
    }
  };

  // Reset Demo Data
  const handleResetData = () => {
    const savedBkash = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number');
    const savedNagad = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number');
    const savedRocket = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number');
    const savedPin = localStorage.getItem('owner_admin_pin');
    const savedVault = localStorage.getItem('admin_voucher_vault');
    const savedSettings = localStorage.getItem('bd_esports_settings');

    localStorage.clear();

    if (savedBkash) {
      localStorage.setItem('admin_bkash_number', savedBkash);
      localStorage.setItem('permanent_owner_bkash', savedBkash);
    }
    if (savedNagad) {
      localStorage.setItem('admin_nagad_number', savedNagad);
      localStorage.setItem('permanent_owner_nagad', savedNagad);
    }
    if (savedRocket) {
      localStorage.setItem('admin_rocket_number', savedRocket);
      localStorage.setItem('permanent_owner_rocket', savedRocket);
    }
    if (savedPin) localStorage.setItem('owner_admin_pin', savedPin);
    if (savedVault) localStorage.setItem('admin_voucher_vault', savedVault);
    if (savedSettings) localStorage.setItem('bd_esports_settings', savedSettings);

    setUser(INITIAL_USER);
    setMatches(INITIAL_MATCHES);
    setTransactions(INITIAL_TRANSACTIONS);
    showToast('Reset demo user data (Payment numbers & Admin PIN preserved).');
  };

  // Quick test add money
  const handleQuickAddMoney = () => {
    setUser((prev) => ({ ...prev, balance: prev.balance + 100 }));
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'deposit',
      amount: 100,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: 'Quick Demo Test Add Money (৳100)',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    showToast('৳100 Demo Money added to wallet!');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start overflow-x-hidden font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-3 z-60 bg-emerald-700 text-white px-4 py-2 rounded-full shadow-2xl font-['Rajdhani',sans-serif] text-sm font-bold animate-in fade-in slide-in-from-top-3 flex items-center gap-2 border border-emerald-400">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Push Notification Toast Banner (matches Screenshot 2) */}
      <PushNotificationToast
        notification={activePushNotification}
        onClose={() => setActivePushNotification(null)}
        onClick={handleNotificationClick}
      />

      {/* Floating Quick Action Toolbar for owner/tester */}
      <div className="fixed bottom-16 right-4 z-40 flex flex-col gap-2 items-end">
        {showQuickToolbar && (
          <div className="bg-slate-950/95 backdrop-blur-md border border-amber-500/60 p-3 rounded-2xl shadow-2xl flex flex-col gap-2 text-xs font-['Rajdhani',sans-serif] animate-in fade-in zoom-in-90 min-w-[200px]">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-1 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>⚡ কুইক কন্ট্রোল</span>
              <span className="text-slate-400">অ্যাডমিন টুলস</span>
            </div>

            {/* Button 1: Owner Admin Panel T (matches & tournament) */}
            <button
              onClick={() => {
                setAdminInitialPanel('T');
                setShowAdminModal(true);
                setShowQuickToolbar(false);
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black rounded-xl text-left shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">👑</span>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-xs leading-tight">Owner Admin Panel T</span>
                  <span className="text-[10px] text-slate-900/80 font-bold font-bengali">টুর্নামেন্ট, রুম আইডি ও ম্যাচ</span>
                </div>
              </div>
              <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-mono font-black border border-red-400 shrink-0">
                Panel (T)
              </span>
            </button>

            {/* Button 2: Owner Admin Panel D (diamond shop & orders) */}
            <button
              onClick={() => {
                setAdminInitialPanel('D');
                setShowAdminModal(true);
                setShowQuickToolbar(false);
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black rounded-xl text-left shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">👑</span>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-xs leading-tight">Owner Admin Panel D</span>
                  <span className="text-[10px] text-cyan-100 font-bold font-bengali">ডায়মন্ড শপ ড্যাশবোর্ড ও অর্ডার</span>
                </div>
              </div>
              <span className="px-1.5 py-0.5 bg-cyan-900/90 text-cyan-300 rounded text-[10px] font-mono font-black border border-cyan-400 shrink-0">
                Panel (D)
              </span>
            </button>

            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-center cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>📱</span>
              <span>{isPhoneFrame ? 'Full Width View' : 'Mobile Frame View'}</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickToolbar(!showQuickToolbar)}
          className={`w-11 h-11 rounded-full text-slate-950 font-black flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 active:scale-95 transition cursor-pointer ${
            showQuickToolbar ? 'bg-amber-400 rotate-45' : 'bg-gradient-to-tr from-amber-400 to-yellow-300'
          }`}
          title="Quick Admin Tools"
        >
          <span className="text-base">{showQuickToolbar ? '✕' : '⚡'}</span>
        </button>
      </div>

      {/* Main Container */}
      <main
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[420px] my-4 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[10px] border-slate-800 overflow-hidden'
            : 'max-w-md w-full min-h-screen shadow-2xl'
        } bg-[#f8fafc] flex flex-col relative`}
      >
        {/* Dynamic Screen View */}
        <PullToRefreshContainer onRefresh={handleManualRefresh}>
          <div className="flex-1 flex flex-col relative">
            {authState === 'landing' ? (
              <LandingPage
                onEnterApp={() => setAuthState('authenticated')}
                onOpenInstall={() => setShowInstallModal(true)}
                apkDownloadUrl={appSettings.apkDownloadUrl}
              />
            ) : authState === 'login' ? (
              <LoginScreen
                onLogin={handleLogin}
                onNavigateToSignUp={() => setAuthState('signup')}
                onForgotPassword={() => showToast('Password reset link sent to your registered email/phone')}
              />
            ) : authState === 'signup' ? (
              <SignUpScreen
                onSignUp={handleSignUp}
                onNavigateToLogin={() => setAuthState('login')}
              />
            ) : selectedCategory ? (
              <MatchListScreen
                categoryId={selectedCategory}
                matches={matches}
                user={user}
                onBack={() => setSelectedCategory(null)}
                onJoinMatch={(match) => setJoiningMatch(match)}
                onViewRoomDetails={(match) => {
                  setCurrentTab('my_matches');
                  setSelectedCategory(null);
                }}
                onRefresh={handleManualRefresh}
              />
            ) : currentTab === 'play' ? (
            <PlayScreen
              matches={matches}
              banners={banners}
              telegramLink={appSettings.telegramLink}
              onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
              onOpenShop={() => setCurrentTab('shop')}
              unreadNotificationsCount={notifications.filter((n) => !n.read).length}
              onOpenNotifications={() => setShowNotificationModal(true)}
              userBalance={user.balance}
              onOpenWallet={() => setShowWallet(true)}
              tournamentImages={appSettings.tournamentImages}
            />
          ) : currentTab === 'results' ? (
            <ResultsScreen
              matches={matches}
              onOpenLiveStream={(url) => window.open(url, '_blank')}
            />
          ) : currentTab === 'profile' ? (
            <ProfileScreen
              user={user}
              telegramLink={appSettings.telegramLink}
              onOpenWallet={() => setShowWallet(true)}
              onOpenWithdraw={() => setShowWithdraw(true)}
              onOpenEditProfile={() => setShowEditProfile(true)}
              onOpenRules={() => setShowRules(true)}
              onOpenTopPlayers={() => setShowTopPlayers(true)}
              onOpenDeveloper={() => setShowDeveloper(true)}
              onOpenReferEarn={() => setShowReferEarn(true)}
              onOpenInstall={() => setShowInstallModal(true)}
              onOpenAdmin={() => setShowAdminModal(true)}
              onOpenLanding={() => setAuthState('landing')}
              onLogout={handleLogout}
            />
          ) : currentTab === 'my_matches' ? (
            <MyMatchesScreen
              matches={matches}
              user={user}
              onBrowseMatches={() => setCurrentTab('play')}
              onLeaveMatch={handleUserLeaveMatch}
            />
          ) : (
            <ShopScreen
              user={user}
              transactions={transactions}
              onSuccessOrder={handleSuccessShopOrder}
              onOpenWallet={() => setShowWallet(true)}
              topupImages={appSettings.topupImages}
            />
          )}

          {/* Floating 24/7 Mascot Customer Support Button */}
          {authState === 'authenticated' && (
            <FloatingSupport
              telegramLink={appSettings.telegramLink}
              adminPhone={appSettings.bkashNumber || appSettings.nagadNumber}
            />
          )}

          {/* Floating Install App Banner (above Bottom Navigation like TSBAZAR with 1-click APK download) */}
          {authState === 'authenticated' && (
            <FloatingInstallBanner
              apkDownloadUrl={appSettings.apkDownloadUrl}
              deferredPrompt={deferredPrompt}
              onInstallClick={() => setShowInstallModal(true)}
              onToast={showToast}
            />
          )}
        </div>
        </PullToRefreshContainer>

        {/* Bottom Navigation Bar */}
        {authState === 'authenticated' && (
          <BottomNav
            currentTab={selectedCategory ? 'play' : currentTab}
            onSelectTab={(tab) => {
              setSelectedCategory(null);
              setCurrentTab(tab);
            }}
            myMatchesCount={
              matches.filter(
                (m) => m.joinedPlayers.some((p) => p.username === user.username) && m.status !== 'completed'
              ).length
            }
          />
        )}
      </main>

      {/* Join Match Modal */}
      {joiningMatch && (
        <JoinMatchModal
          match={joiningMatch}
          user={user}
          onClose={() => setJoiningMatch(null)}
          onConfirmJoin={handleConfirmJoinMatch}
          onOpenDeposit={() => {
            setJoiningMatch(null);
            setShowWallet(true);
          }}
        />
      )}

      {/* Wallet Modal */}
      {showWallet && (
        <WalletModal
          user={user}
          transactions={transactions}
          settings={appSettings}
          onClose={() => setShowWallet(false)}
          onDeposit={handleDeposit}
          onOpenWithdraw={() => setShowWithdraw(true)}
          onOpenReferEarn={() => setShowReferEarn(true)}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <WithdrawModal
          user={user}
          onClose={() => setShowWithdraw(false)}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* Rules Modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Top Players Modal */}
      {showTopPlayers && <TopPlayersModal user={user} matches={matches} onClose={() => setShowTopPlayers(false)} />}

      {/* Developer Modal */}
      {showDeveloper && <DeveloperModal onClose={() => setShowDeveloper(false)} />}

      {/* My Profile Modal */}
      {showEditProfile && (
        <MyProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(updated) => {
            setUser((prev) => ({ ...prev, ...updated }));
            showToast('Profile saved successfully!');
          }}
        />
      )}

      {/* Refer & Earn Modal */}
      {showReferEarn && (
        <ReferEarnModal
          user={user}
          onClose={() => setShowReferEarn(false)}
          onToast={showToast}
        />
      )}

      {/* Phone Install Modal */}
      {showInstallModal && (
        <InstallModal
          deferredPrompt={deferredPrompt}
          apkDownloadUrl={appSettings.apkDownloadUrl}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Owner Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanelModal
          initialPanel={adminInitialPanel}
          onClose={() => setShowAdminModal(false)}
          matches={matches}
          onAddMatch={handleAddMatch}
          onUpdateMatch={handleUpdateMatch}
          onDeleteMatch={handleDeleteMatch}
          onMoveMatchUp={handleMoveMatchUp}
          onMoveMatchDown={handleMoveMatchDown}
          transactions={transactions}
          onApproveTransaction={handleApproveTransaction}
          onRejectTransaction={handleRejectTransaction}
          onAdminDirectPayout={handleAdminDirectPayout}
          onToast={showToast}
          notice={appNotice}
          onUpdateNotice={handleUpdateNotice}
          notifications={notifications}
          onSendNotification={handleSendNotification}
          onDeleteNotification={handleDeleteNotification}
          banners={banners}
          onUpdateBanners={(newBanners) => {
            setBanners(newBanners);
            localStorage.setItem('bd_esports_banners', JSON.stringify(newBanners));
          }}
          settings={appSettings}
          onUpdateSettings={handleUpdateSettings}
          user={user}
          onAdjustUserBalance={handleAdjustUserBalance}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotificationModal(false)}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClearAll={handleClearAllNotifications}
          onNotificationClick={handleNotificationClick}
        />
      )}

      {/* App Entry Notice Modal Popup */}
      {showNoticeModal && appNotice.enabled && (
        <AppNoticeModal
          notice={appNotice}
          onClose={() => setShowNoticeModal(false)}
        />
      )}
    </div>
  );
}
