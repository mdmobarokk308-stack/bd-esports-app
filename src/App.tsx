import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  DEFAULT_APP_NOTICE,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  AppNotice,
  AppNotification,
  AppSettings,
  Match,
  MatchCategoryKey,
  TabType,
  TopupPackage,
  Transaction,
  User,
} from './types';
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  saveRemoteSettings,
  fetchRemoteMatches,
  syncMatchesToServer,
  fetchRemoteTransactions,
  saveTransactionRemote,
  updateTransactionStatusRemote,
  fetchRemoteNotifications,
  broadcastNotificationRemote,
  deleteNotificationRemote,
  fetchRemoteVouchers,
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
import { PushNotificationToast } from './components/PushNotificationToast';
import { BottomNav } from './components/BottomNav';
import { FloatingSupport } from './components/FloatingSupport';
import { LandingPage } from './components/LandingPage';

export default function App() {
  // State persistence via localStorage - default directly to authenticated gaming app
  const [authState, setAuthState] = useState<'landing' | 'login' | 'signup' | 'authenticated'>('authenticated');
  const [currentTab, setCurrentTab] = useState<TabType>('play');
  const [selectedCategory, setSelectedCategory] = useState<MatchCategoryKey | null>(null);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('ff_tournament_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bd_esports_settings');
    const localBkash = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number');
    const localNagad = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number');
    const localRocket = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number');
    const localPin = localStorage.getItem('owner_admin_pin');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          bkashNumber: localBkash || parsed.bkashNumber || DEFAULT_SETTINGS.bkashNumber,
          nagadNumber: localNagad || parsed.nagadNumber || DEFAULT_SETTINGS.nagadNumber,
          rocketNumber: localRocket || parsed.rocketNumber || DEFAULT_SETTINGS.rocketNumber,
          telegramLink: localStorage.getItem('admin_telegram_link') || parsed.telegramLink || DEFAULT_SETTINGS.telegramLink,
          apkDownloadUrl: localStorage.getItem('admin_apk_download_url') || parsed.apkDownloadUrl || DEFAULT_SETTINGS.apkDownloadUrl,
          noticeText: localStorage.getItem('admin_notice_text') || parsed.noticeText || DEFAULT_SETTINGS.noticeText,
          adminPin: localPin || parsed.adminPin || DEFAULT_SETTINGS.adminPin,
        };
      } catch (e) {}
    }
    return {
      bkashNumber: localBkash || DEFAULT_SETTINGS.bkashNumber,
      nagadNumber: localNagad || DEFAULT_SETTINGS.nagadNumber,
      rocketNumber: localRocket || DEFAULT_SETTINGS.rocketNumber,
      telegramLink: localStorage.getItem('admin_telegram_link') || DEFAULT_SETTINGS.telegramLink,
      apkDownloadUrl: localStorage.getItem('admin_apk_download_url') || DEFAULT_SETTINGS.apkDownloadUrl,
      noticeText: localStorage.getItem('admin_notice_text') || DEFAULT_SETTINGS.noticeText,
      adminPin: localPin || DEFAULT_SETTINGS.adminPin,
    };
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('ff_tournament_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ff_tournament_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [appNotice, setAppNotice] = useState<AppNotice>(() => {
    const saved = localStorage.getItem('ff_app_entry_notice');
    return saved ? JSON.parse(saved) : DEFAULT_APP_NOTICE;
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [showQuickToolbar, setShowQuickToolbar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial remote fetch & periodic real-time sync (so admin numbers & matches update across all phones)
  useEffect(() => {
    const syncAllData = async () => {
      // 1. Settings & Notice
      const remoteData = await fetchRemoteSettings();
      if (remoteData?.settings) {
        setAppSettings(remoteData.settings);
      }
      if (remoteData?.notice) {
        setAppNotice(remoteData.notice);
      }

      // 2. Matches
      const remoteMatches = await fetchRemoteMatches();
      if (remoteMatches && remoteMatches.length > 0) {
        setMatches(remoteMatches);
      }

      // 3. Transactions
      const remoteTxns = await fetchRemoteTransactions();
      if (remoteTxns && remoteTxns.length > 0) {
        setTransactions(remoteTxns);
      }

      // 4. Notifications
      const remoteNotifs = await fetchRemoteNotifications();
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications((prev) => {
          const lastPrevId = prev[0]?.id;
          const newLatest = remoteNotifs[0];
          if (newLatest && newLatest.id !== lastPrevId) {
            // New broadcast received from admin! Show popup immediately
            setActivePushNotification(newLatest);
          }
          return remoteNotifs;
        });
      }

      // 5. Sync Vouchers from server to localStorage if available
      try {
        const remoteVouchers = await fetchRemoteVouchers();
        if (remoteVouchers && Array.isArray(remoteVouchers) && remoteVouchers.length > 0) {
          localStorage.setItem('admin_voucher_vault', JSON.stringify(remoteVouchers));
        }
      } catch {}
    };

    syncAllData();
    const interval = setInterval(syncAllData, 6000);
    return () => clearInterval(interval);
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

  // Show a welcome push notification after 2.5 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0 && !activePushNotification) {
        setActivePushNotification(notifications[0]);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
    const updated = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    localStorage.setItem('bd_esports_settings', JSON.stringify(updated));
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

  // Deposit Handler
  const handleDeposit = (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', sender: string, trxId: string) => {
    setUser((prev) => ({ ...prev, balance: prev.balance + amount }));
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'deposit',
      method,
      amount,
      senderNumber: sender,
      trxId,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: `Deposit via ${method} (TrxID: ${trxId})`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);
    showToast(`৳${amount} BDT deposited into your wallet!`);
  };

  // Withdraw Handler
  const handleWithdraw = (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', receiver: string) => {
    setUser((prev) => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'withdraw',
      method,
      amount,
      senderNumber: receiver,
      status: 'pending',
      date: new Date().toLocaleString(),
      description: `Withdrawal request to ${method} ${receiver}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    saveTransactionRemote(newTxn);
    showToast(`⚡ Withdrawal request of ৳${amount} BDT submitted! Processing within 1 min.`);

    // 1-Minute (60s) Auto-Processing Settlement
    setTimeout(() => {
      setTransactions((currentTxns) => {
        const found = currentTxns.find((t) => t.id === newTxn.id);
        if (found && found.status === 'pending') {
          updateTransactionStatusRemote(newTxn.id, 'approved');
          showToast(`✅ Withdrawal of ৳${amount} to ${method} (${receiver}) successfully paid & approved!`);
          return currentTxns.map((t) => (t.id === newTxn.id ? { ...t, status: 'approved' } : t));
        }
        return currentTxns;
      });
    }, 60000);
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
    const updated = [newMatch, ...matches];
    setMatches(updated);
    syncMatchesToServer(updated);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updated = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    setMatches(updated);
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
    syncMatchesToServer(updated);
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
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'approved' } : t))
    );
    updateTransactionStatusRemote(txnId, 'approved');
    if (target) {
      showToast(`✅ ${target.type === 'withdraw' ? 'Withdrawal' : 'Transaction'} of ৳${target.amount} approved & paid!`);

      // Auto-broadcast notification to user's app
      const autoNotif: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: `🎉 টাকা পাঠানো হয়েছে! (৳${target.amount} ${target.method || 'bKash'})`,
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
    if (target && target.type === 'withdraw' && target.status === 'pending') {
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + target.amount,
      }));
    }
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'rejected' } : t))
    );
    updateTransactionStatusRemote(txnId, 'rejected');
    if (target && target.type === 'withdraw') {
      showToast(`❌ Withdrawal rejected & ৳${target.amount} refunded to user wallet.`);
    } else {
      showToast(`❌ Transaction rejected.`);
    }
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
              <span>⚡ কুইক টেস্ট ও কন্ট্রোল</span>
              <span className="text-slate-400">অ্যাডমিন টুলস</span>
            </div>
            <button
              onClick={() => {
                setShowAdminModal(true);
                setShowQuickToolbar(false);
              }}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-center shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>👑</span>
              <span>Owner Admin Panel</span>
            </button>
            <button
              onClick={handleQuickAddMoney}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>💰</span>
              <span>+৳100 Quick Demo Money</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-center cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>📱</span>
              <span>{isPhoneFrame ? 'Full Width View' : 'Mobile Frame View'}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('সব ডেমো ডাটা রিসেট করতে চান?')) {
                  handleResetData();
                  setShowQuickToolbar(false);
                }
              }}
              className="px-3 py-1.5 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900 text-rose-300 font-bold rounded-xl text-center cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>🔄</span>
              <span>Reset Demo Data</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickToolbar(!showQuickToolbar)}
          className={`w-11 h-11 rounded-full text-slate-950 font-black flex items-center justify-center shadow-2xl border-2 border-white hover:scale-110 active:scale-95 transition cursor-pointer ${
            showQuickToolbar ? 'bg-amber-400 rotate-45' : 'bg-gradient-to-tr from-amber-400 to-yellow-300'
          }`}
          title="Quick Admin & Tester Tools"
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
        <div className="flex-1 flex flex-col relative">
          {authState === 'landing' ? (
            <LandingPage
              onOpenLogin={() => setAuthState('login')}
              onOpenSignUp={() => setAuthState('signup')}
              onOpenInstall={() => setShowInstallModal(true)}
              apkDownloadUrl={appSettings.apkDownloadUrl}
            />
          ) : authState === 'login' ? (
            <LoginScreen
              onLogin={handleLogin}
              onNavigateToSignUp={() => setAuthState('signup')}
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
            />
          ) : currentTab === 'play' ? (
            <PlayScreen
              onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
              onOpenShop={() => setCurrentTab('shop')}
              unreadNotificationsCount={notifications.filter((n) => !n.read).length}
              onOpenNotifications={() => setShowNotificationModal(true)}
              userBalance={user.balance}
              onOpenWallet={() => setShowWallet(true)}
            />
          ) : currentTab === 'results' ? (
            <ResultsScreen
              matches={matches}
              onOpenLiveStream={(url) => window.open(url, '_blank')}
            />
          ) : currentTab === 'profile' ? (
            <ProfileScreen
              user={user}
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
            />
          )}

          {/* Floating 24/7 Mascot Customer Support Button */}
          {authState === 'authenticated' && <FloatingSupport telegramLink={appSettings.telegramLink} />}
        </div>

        {/* Bottom Navigation Bar */}
        {authState === 'authenticated' && !selectedCategory && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setSelectedCategory(null);
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
      {showTopPlayers && <TopPlayersModal onClose={() => setShowTopPlayers(false)} />}

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
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Owner Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanelModal
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
          settings={appSettings}
          onUpdateSettings={handleUpdateSettings}
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
