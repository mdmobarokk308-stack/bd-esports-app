import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  DEFAULT_APP_NOTICE,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { AppNotice, AppNotification, Match, MatchCategoryKey, TabType, TopupPackage, Transaction, User } from './types';
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
    } else {
      setUser((prev) => ({
        ...prev,
        matchesJoined: prev.matchesJoined + 1,
        freeFireIgn: ign,
        freeFireUid: uid,
      }));
    }

    // Add player to match
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const newPlayer = { slot, username: user.username, ign, uid };
          return {
            ...m,
            joinedPlayers: [...m.joinedPlayers.filter((p) => p.slot !== slot), newPlayer],
          };
        }
        return m;
      })
    );

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
    } else {
      setUser((prev) => ({
        ...prev,
        matchesJoined: Math.max(0, prev.matchesJoined - 1),
      }));
    }

    // Remove player from match slot
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            joinedPlayers: m.joinedPlayers.filter((p) => p.username !== user.username),
          };
        }
        return m;
      })
    );

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
    showToast(`Withdrawal of ৳${amount} BDT submitted!`);
  };

  // Shop Top-up Order Handler
  const handleSuccessShopOrder = (item: TopupPackage, uid: string) => {
    if (user.balance >= item.price) {
      setUser((prev) => ({ ...prev, balance: prev.balance - item.price, freeFireUid: uid }));
    }
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'topup_purchase',
      amount: item.price,
      status: 'approved',
      date: new Date().toLocaleString(),
      description: `Diamond Top-up: ${item.name} for UID: ${uid}`,
    };
    setTransactions((prev) => [newTxn, ...prev]);
    showToast(`Purchased ${item.name} successfully! Diamonds delivered to UID ${uid}.`);
  };

  // Admin Match Operations
  const handleAddMatch = (newMatch: Match) => {
    setMatches((prev) => [newMatch, ...prev]);
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
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
      }
    }
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const handleMoveMatchUp = (index: number) => {
    if (index <= 0) return;
    setMatches((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveMatchDown = (index: number) => {
    if (index >= matches.length - 1) return;
    setMatches((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleApproveTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'approved' } : t))
    );
  };

  const handleRejectTransaction = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'rejected' } : t))
    );
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
    showToast('🚀 Push notification broadcast sent to all players!');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
    localStorage.clear();
    setUser(INITIAL_USER);
    setMatches(INITIAL_MATCHES);
    setTransactions(INITIAL_TRANSACTIONS);
    showToast('Reset data to initial state.');
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
          <div className="bg-slate-950/95 backdrop-blur-md border border-amber-500/50 p-2.5 rounded-2xl shadow-2xl flex flex-col gap-2 text-xs font-['Rajdhani',sans-serif] animate-in fade-in zoom-in-90">
            <button
              onClick={() => setShowAdminModal(true)}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold rounded-xl text-center shadow-sm cursor-pointer hover:brightness-110"
            >
              👑 Owner Admin Panel
            </button>
            <button
              onClick={handleQuickAddMoney}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center cursor-pointer"
            >
              +৳100 Quick Demo Money
            </button>
            <button
              onClick={() => setIsPhoneFrame(!isPhoneFrame)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-center cursor-pointer"
            >
              📱 {isPhoneFrame ? 'Full Width' : 'Mobile Frame'}
            </button>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-300 font-bold rounded-xl text-center cursor-pointer"
            >
              🔄 Reset Demo Data
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickToolbar(!showQuickToolbar)}
          className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 transition cursor-pointer"
          title="Quick Admin & Tester Tools"
        >
          ⚡
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
        {/* Android Status Bar */}
        <div className="w-full bg-[#6366f1] text-white text-[11px] px-5 py-1 flex items-center justify-between font-mono font-bold select-none shrink-0 z-30">
          <span>09:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px]">4G</span>
            <span>📶</span>
            <span>🔋 98%</span>
          </div>
        </div>

        {/* Dynamic Screen View */}
        <div className="flex-1 flex flex-col relative">
          {authState === 'landing' ? (
            <LandingPage
              onOpenLogin={() => setAuthState('login')}
              onOpenSignUp={() => setAuthState('signup')}
              onOpenInstall={() => setShowInstallModal(true)}
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
              onSuccessOrder={handleSuccessShopOrder}
            />
          )}

          {/* Floating 24/7 Mascot Customer Support Button */}
          {authState === 'authenticated' && <FloatingSupport />}
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

        {/* Android Navigation Bar */}
        <div className="w-full bg-white border-t border-slate-200 py-1.5 px-8 flex items-center justify-around text-slate-400 select-none shrink-0 z-30">
          <button
            onClick={() => {
              if (selectedCategory) setSelectedCategory(null);
              else setCurrentTab('play');
            }}
            className="p-1 hover:text-slate-700 transition cursor-pointer"
            title="App Switcher"
          >
            <div className="flex flex-col gap-0.5">
              <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-400 rounded-full" />
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedCategory(null);
              setCurrentTab('play');
            }}
            className="p-1 hover:text-slate-700 transition cursor-pointer"
            title="Home"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
          </button>

          <button
            onClick={() => {
              if (selectedCategory) setSelectedCategory(null);
            }}
            className="p-1 hover:text-slate-700 transition cursor-pointer"
            title="Back"
          >
            <div className="w-0 h-0 border-y-4 border-y-transparent border-r-6 border-r-slate-400" />
          </button>
        </div>
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
          onToast={showToast}
          notice={appNotice}
          onUpdateNotice={setAppNotice}
          notifications={notifications}
          onSendNotification={handleSendNotification}
          onDeleteNotification={handleDeleteNotification}
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
