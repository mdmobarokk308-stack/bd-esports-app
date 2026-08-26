import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { Match, MatchCategoryKey, TabType, TopupPackage, Transaction, User } from './types';
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
import { InstallModal } from './components/InstallModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { BottomNav } from './components/BottomNav';
import { FloatingSupport } from './components/FloatingSupport';
import { LandingPage } from './components/LandingPage';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  PlusCircle,
  Key,
  RotateCcw,
  Sparkles,
  Download,
  ShieldAlert,
  Globe,
} from 'lucide-react';

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

  // Modals state
  const [joiningMatch, setJoiningMatch] = useState<Match | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showTopPlayers, setShowTopPlayers] = useState(false);
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handlers
  const handleLogin = (username: string) => {
    setUser((prev) => ({
      ...prev,
      username: username || 'mdmobarok15',
    }));
    setAuthState('authenticated');
    showToast(`Welcome back, ${username || 'mdmobarok15'}!`);
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
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
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

  // Reset Demo Data
  const handleResetData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setMatches(INITIAL_MATCHES);
    setTransactions(INITIAL_TRANSACTIONS);
    showToast('Reset data to initial screenshot state.');
  };

  // Quick test add money
  const handleQuickAddMoney = () => {
    setUser((prev) => ({ ...prev, balance: prev.balance + 100 }));
    showToast('Added +100 BDT test wallet balance!');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-800">
      {/* Top Floating Control Bar (Mode switcher, demo tools) */}
      <header className="w-full max-w-md mb-2 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 z-50">
        <div className="flex items-center space-x-2">
          <span className="font-orbitron font-bold text-amber-400">BD ESPORTS MS</span>
          <span className="bg-purple-900/80 text-purple-300 text-[10px] px-1.5 py-0.5 rounded border border-purple-700">
            FF Pro
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Fast Screen Switcher */}
          <button
            onClick={() => {
              if (authState === 'landing') setAuthState('authenticated');
              else if (authState === 'authenticated') setAuthState('login');
              else setAuthState('landing');
            }}
            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 font-rajdhani font-bold cursor-pointer transition flex items-center gap-1 text-[11px]"
            title="Toggle between Landing Page, Login, and Main App"
          >
            {authState === 'landing' ? (
              <>
                <Globe className="w-3 h-3 text-purple-400" />
                <span>Landing</span>
              </>
            ) : authState === 'login' ? (
              <>
                <Key className="w-3 h-3 text-amber-400" />
                <span>Login UI</span>
              </>
            ) : (
              <>
                <span>🎮 App UI</span>
              </>
            )}
          </button>

          {/* Admin Panel Quick Access Button */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-white font-rajdhani font-bold cursor-pointer transition flex items-center gap-1 shadow-sm"
            title="Open Admin Control Panel"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[11px]">Admin</span>
          </button>

          {/* Install App Trigger Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white font-rajdhani font-bold cursor-pointer transition flex items-center gap-1 shadow-sm"
            title="Install app to your phone"
          >
            <Download className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[11px]">Install</span>
          </button>

          {/* Quick Toolbar Toggle */}
          <button
            onClick={() => setShowQuickToolbar(!showQuickToolbar)}
            className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-amber-300 cursor-pointer"
            title="Demo quick actions"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Phone Frame Toggle */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 cursor-pointer"
            title={isPhoneFrame ? 'Switch to Fullscreen' : 'Switch to Phone Mockup'}
          >
            {isPhoneFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Quick Demo Toolbar Dropdown */}
      {showQuickToolbar && (
        <div className="w-full max-w-md mb-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-2xl flex flex-wrap items-center gap-2 text-xs text-white z-50 animate-in fade-in duration-150">
          <button
            onClick={handleQuickAddMoney}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> +৳100 Balance
          </button>
          <button
            onClick={() => {
              setMatches((prev) =>
                prev.map((m) => ({
                  ...m,
                  roomId: m.roomId || `${Math.floor(1000000 + Math.random() * 9000000)}`,
                  roomPass: m.roomPass || '1234',
                }))
              );
              showToast('Generated Room ID & Passwords for all matches!');
            }}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" /> Release All Room IDs
          </button>
          <button
            onClick={handleResetData}
            className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset App
          </button>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2 bg-slate-900/95 text-white border border-amber-400/80 rounded-2xl shadow-2xl text-xs font-bold font-rajdhani flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Phone Mockup Frame Container */}
      <main
        className={`w-full relative bg-[#f8fafc] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[420px] h-[92vh] max-h-[860px] sm:rounded-[38px] border-4 sm:border-8 border-slate-800 ring-1 ring-slate-700'
            : 'max-w-xl min-h-screen rounded-none'
        }`}
      >
        {/* Dynamic App Content Body */}
        <div className="flex-1 overflow-y-auto relative flex flex-col">
          {authState === 'landing' ? (
            <LandingPage
              onEnterApp={() => setAuthState('authenticated')}
              onOpenInstall={() => setShowInstallModal(true)}
            />
          ) : authState === 'login' ? (
            <LoginScreen
              onLogin={handleLogin}
              onNavigateToSignUp={() => setAuthState('signup')}
              onForgotPassword={() => showToast('Password reset link sent to registered phone/email!')}
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
            />
          ) : (
            <ShopScreen
              user={user}
              onSuccessOrder={handleSuccessShopOrder}
            />
          )}

          {/* Floating 24/7 Mascot Customer Support Button shown in screenshots 3, 4, 5, 6 */}
          {authState === 'authenticated' && <FloatingSupport />}
        </div>

        {/* Bottom Navigation Bar matching Screenshots 3, 4, 5, 6 */}
        {authState === 'authenticated' && !selectedCategory && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setSelectedCategory(null);
            }}
            myMatchesCount={matches.filter((m) => m.joinedPlayers.some((p) => p.username === user.username) && m.status !== 'completed').length}
          />
        )}

        {/* Android Navigation Bar (Hamburger ≡, Circle ○, Triangle ◁) matching screenshot footer */}
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

      {/* Wallet Deposit Modal */}
      {showWallet && (
        <WalletModal
          user={user}
          transactions={transactions}
          onClose={() => setShowWallet(false)}
          onDeposit={handleDeposit}
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
          transactions={transactions}
          onApproveTransaction={handleApproveTransaction}
          onRejectTransaction={handleRejectTransaction}
          onToast={showToast}
        />
      )}
    </div>
  );
}
