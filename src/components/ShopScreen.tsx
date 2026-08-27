import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  X,
  ChevronRight,
  ArrowLeft,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  PlayCircle,
  Flame,
  Wallet,
  CreditCard,
  Lock,
  UserCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TOPUP_CATEGORIES, TopupCategoryItem, RechargeOption } from '../data/topupData';
import { User, Transaction, AppNotification } from '../types';

interface ShopScreenProps {
  user: User;
  onSuccessOrder: (item: any, uid: string) => void;
  onOpenWallet?: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, onSuccessOrder, onOpenWallet }) => {
  // State for Navigation / Detail View
  const [activeCategory, setActiveCategory] = useState<TopupCategoryItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<RechargeOption | null>(null);
  const [playerUid, setPlayerUid] = useState(user.freeFireUid || '');
  
  // Ingame form state
  const [accountType, setAccountType] = useState<'Facebook' | 'Gmail' | 'Twitter'>('Facebook');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState('');

  // Payment state
  const [paymentOption, setPaymentOption] = useState<'wallet' | 'instant'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    itemTitle: string;
    optionName: string;
    price: number;
    account: string;
    method: string;
  } | null>(null);

  // Instant Payment Gateway Modal state
  const [showInstantGateway, setShowInstantGateway] = useState(false);
  const [instantMethod, setInstantMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay'>('bKash');
  const [instantStep, setInstantStep] = useState<'number' | 'pin' | 'processing'>('number');
  const [gatewayPhone, setGatewayPhone] = useState('017');
  const [gatewayPin, setGatewayPin] = useState('');

  // UI state
  const [showNotice, setShowNotice] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showBackupGuideModal, setShowBackupGuideModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // When a category is selected, auto select first recharge option
  const handleSelectCategory = (cat: TopupCategoryItem) => {
    setActiveCategory(cat);
    setSelectedOption(cat.rechargeOptions[2] || cat.rechargeOptions[0]); // default to 115 Diamonds or 3rd option
    setOrderSuccessData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to copy text
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Process purchase
  const handleStartPurchase = () => {
    if (!activeCategory || !selectedOption) return;

    // Validation
    if (activeCategory.type === 'uid') {
      if (!playerUid.trim() || playerUid.trim().length < 6) {
        alert('অনুগ্রহ করে সঠিক Free Fire Player ID (UID) দিন!');
        return;
      }
    } else {
      if (!accountNumber.trim()) {
        alert('অনুগ্রহ করে আপনার ফেসবুক/জিমেইল আইডি বা নাম্বার দিন!');
        return;
      }
      if (!accountPassword.trim()) {
        alert('অনুগ্রহ করে পাসওয়ার্ড দিন!');
        return;
      }
      if (!backupCodes.trim()) {
        alert('অনুগ্রহ করে ব্যাকআপ কোড বা হোয়াটসঅ্যাপ নাম্বার দিন!');
        return;
      }
    }

    if (paymentOption === 'wallet') {
      if (user.balance < selectedOption.price) {
        const confirmGoWallet = window.confirm(
          `আপনার ওয়ালেট ব্যালেন্স অপর্যাপ্ত (আছে ৳${user.balance}, প্রয়োজন ৳${selectedOption.price})। আপনি কি ওয়ালেটে টাকা অ্যাড করতে চান? অথবা Instant Pay (bKash/Nagad) বেছে নিন।`
        );
        if (confirmGoWallet && onOpenWallet) {
          onOpenWallet();
        }
        return;
      }

      // Process with Wallet
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const orderId = `MS-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderSuccessData({
          orderId,
          itemTitle: activeCategory.title,
          optionName: selectedOption.name,
          price: selectedOption.price,
          account: activeCategory.type === 'uid' ? `UID: ${playerUid}` : `${accountType}: ${accountNumber}`,
          method: 'MS Wallet',
        });

        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {}

        onSuccessOrder(
          {
            id: selectedOption.id,
            name: `${activeCategory.title} - ${selectedOption.name}`,
            amount: selectedOption.name,
            price: selectedOption.price,
            category: 'diamond',
            icon: '💎',
          },
          playerUid || accountNumber
        );
      }, 1000);
    } else {
      // Instant Pay (bKash/Nagad) Gateway Modal
      setShowInstantGateway(true);
      setInstantStep('number');
      setGatewayPhone(user.phone || '017');
      setGatewayPin('');
    }
  };

  // Complete Instant Gateway
  const handleConfirmInstantPayment = () => {
    if (!gatewayPhone || gatewayPhone.length < 11) {
      alert('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (instantStep === 'number') {
      setInstantStep('pin');
      return;
    }

    if (instantStep === 'pin') {
      if (!gatewayPin || gatewayPin.length < 4) {
        alert('সঠিক পিন নম্বর দিন');
        return;
      }

      setInstantStep('processing');
      setTimeout(() => {
        setShowInstantGateway(false);
        if (!activeCategory || !selectedOption) return;

        const orderId = `MS-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderSuccessData({
          orderId,
          itemTitle: activeCategory.title,
          optionName: selectedOption.name,
          price: selectedOption.price,
          account: activeCategory.type === 'uid' ? `UID: ${playerUid}` : `${accountType}: ${accountNumber}`,
          method: `${instantMethod} Instant Auto Pay`,
        });

        try {
          confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}

        onSuccessOrder(
          {
            id: selectedOption.id,
            name: `${activeCategory.title} - ${selectedOption.name}`,
            amount: selectedOption.name,
            price: selectedOption.price,
            category: 'diamond',
            icon: '💎',
          },
          playerUid || accountNumber
        );
      }, 1200);
    }
  };

  // Render Category Icon Visual
  const renderCardGraphic = (iconType: string, bengaliTitle: string, tag: string) => {
    return (
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b1329] via-[#090d1f] to-[#04060f] border border-cyan-500/40 p-2 flex flex-col justify-between items-center shadow-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all">
        {/* Top badge */}
        <div className="w-full flex justify-between items-center z-10">
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-bengali shadow-sm ${
              tag === 'USER ডেলিভারি'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold'
            }`}
          >
            {tag}
          </span>
          <span className="text-[10px]">⚡</span>
        </div>

        {/* Center Artwork / Icon */}
        <div className="my-auto flex flex-col items-center justify-center relative">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-inner relative">
            {iconType === 'idcode' && <span>🥷</span>}
            {iconType === 'like' && <span className="text-amber-400">👍</span>}
            {iconType === 'indonesia' && <span>🇮🇩</span>}
            {iconType === 'airdrop' && <span>🎁</span>}
            {iconType === 'levelup' && <span>🛡️</span>}
            {iconType === 'weekly_lite' && <span className="text-cyan-300 font-black text-xl font-orbitron">W💎</span>}
            {iconType === 'weekly' && <span className="text-amber-300 font-black text-xl font-orbitron">💳W</span>}
            {iconType === 'monthly' && <span className="text-yellow-400 text-2xl">👑</span>}
            {iconType === 'weekly_monthly' && <span className="text-pink-400 text-2xl">🌟</span>}

            {/* Glowing neon pulse behind */}
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 blur-sm pointer-events-none" />
          </div>
        </div>

        {/* Bottom Bengali Title Tag inside card */}
        <div className="w-full text-center z-10 bg-slate-950/80 backdrop-blur-xs py-1 px-1 rounded-lg border border-cyan-900/60">
          <p className="text-[11px] font-black text-cyan-200 font-bengali leading-tight whitespace-pre-line drop-shadow-sm">
            {bengaliTitle}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f1f5f9] min-h-screen text-slate-900 pb-16 font-['Rajdhani',sans-serif]">
      {/* 1. Header Bar (MS TOPUP) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-3 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 mr-1"
              title="Back to games"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md border border-red-300 font-orbitron">
            MS
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg tracking-tight text-red-600 font-orbitron">MS</span>
              <span className="font-black text-lg tracking-tight text-slate-900 font-orbitron">TOPUP</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bengali font-bold leading-none">
              💎 ডায়মন্ড টপআপের বিশ্বস্ত ঠিকানা
            </p>
          </div>
        </div>

        {/* Right Action: Wallet / Login Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold font-mono hover:bg-rose-100 transition cursor-pointer shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>৳{user.balance}</span>
          </button>
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black rounded-lg shadow-sm font-orbitron">
            {user.username ? 'USER' : 'Login'}
          </div>
        </div>
      </header>

      {/* 2. Top Notice Bar */}
      {showNotice && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bengali shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[10px] font-black uppercase shrink-0 font-orbitron">
              📢 NOTICE
            </span>
            <div className="whitespace-nowrap overflow-x-auto text-[11px] font-medium no-scrollbar animate-pulse">
              আমাদের সাইটে রাত-দিন ২৪ ঘণ্টাই অর্ডার করতে পারবেন। যেকোনো সমস্যায় Support-এ যোগাযোগ করুন।
            </div>
          </div>
          <button onClick={() => setShowNotice(false)} className="text-white/80 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW A: DETAIL VIEW (When a Game/Package is clicked)
         ========================================================================= */}
      {activeCategory ? (
        <div className="max-w-md mx-auto px-3 py-3 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Card of Product */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-cyan-500/50 flex items-center justify-center text-2xl text-cyan-300 shadow-xs">
                {activeCategory.iconType === 'idcode' && '🥷'}
                {activeCategory.iconType === 'like' && '👍'}
                {activeCategory.iconType === 'indonesia' && '🇮🇩'}
                {activeCategory.iconType === 'airdrop' && '🎁'}
                {activeCategory.iconType === 'levelup' && '🛡️'}
                {activeCategory.iconType === 'weekly_lite' && '💎'}
                {activeCategory.iconType === 'weekly' && '💳'}
                {activeCategory.iconType === 'monthly' && '👑'}
                {activeCategory.iconType === 'weekly_monthly' && '🌟'}
              </div>
              <div>
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                  {activeCategory.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>⚡</span>
                    <span>২ সেকেন্ডে টপআপ</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>পরিবর্তন</span>
            </button>
          </div>

          {/* SUCCESS SCREEN */}
          {orderSuccessData ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[10px] bg-emerald-600 text-white font-black px-2.5 py-0.5 rounded-full font-orbitron uppercase">
                  ORDER COMPLETED
                </span>
                <h2 className="text-xl font-black text-slate-900 font-rajdhani mt-2">
                  অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
                </h2>
                <p className="text-xs text-slate-500 font-bengali mt-1">
                  অটোমেটিক Ai ডেলিভারির মাধ্যমে আপনার অ্যাকাউন্টে ডায়মন্ড পাঠানো হচ্ছে।
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900">{orderSuccessData.optionName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-bold text-indigo-700">{orderSuccessData.account}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold text-emerald-700">{orderSuccessData.method}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-extrabold text-red-600 text-sm">৳{orderSuccessData.price} BDT</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOrderSuccessData(null)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider shadow-md cursor-pointer"
                >
                  আরেকটি টপআপ করুন
                </button>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider shadow-md cursor-pointer"
                >
                  হোমে ফিরে যান
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Recharge */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <h2 className="font-bold text-sm text-slate-800 tracking-wide">Select Recharge</h2>
                  </div>
                  <button
                    onClick={() => setShowTutorialModal(true)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 font-bengali"
                  >
                    <span>কিভাবে অর্ডার করবেন?</span>
                    <span className="text-xs">➡</span>
                  </button>
                </div>

                {/* 2-Column Options Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {activeCategory.rechargeOptions.map((opt) => {
                    const isSelected = selectedOption?.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        id={`opt-${opt.id}`}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between select-none ${
                          isSelected
                            ? 'bg-rose-50/50 border-red-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">{opt.name}</span>
                        </div>
                        <span className="text-xs font-extrabold text-red-600 font-mono shrink-0 ml-1">
                          {opt.price} TK
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Account Info */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <h2 className="font-bold text-sm text-slate-800 tracking-wide">Account Info</h2>
                </div>

                {activeCategory.type === 'uid' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                      Player ID (UID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerUid}
                      onChange={(e) => setPlayerUid(e.target.value)}
                      placeholder="এখানে প্লেয়ার আইডি কোড দিন (e.g. 2849182391)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                        Account Type
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Facebook">Facebook</option>
                        <option value="Gmail">Gmail</option>
                        <option value="Twitter">Twitter / X</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                        Your {accountType} Id / Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder={`Enter your ${accountType} Id / Number`}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider">
                          Backup Code / Your WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowBackupGuideModal(true)}
                          className="text-[10px] text-blue-600 hover:underline font-bengali font-bold"
                        >
                          কোড কিভাবে পাবেন?
                        </button>
                      </div>
                      <input
                        type="text"
                        value={backupCodes}
                        onChange={(e) => setBackupCodes(e.target.value)}
                        placeholder="Backup Code / Your WhatsApp Number"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Payment Option */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs">
                    3
                  </span>
                  <h2 className="font-bold text-sm text-slate-800 tracking-wide">Select one option</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Wallet Pay */}
                  <div
                    onClick={() => setPaymentOption('wallet')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                      paymentOption === 'wallet'
                        ? 'border-red-500 bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {paymentOption === 'wallet' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg">
                        👛
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 font-bengali leading-tight">
                          MS TOPUP ওয়ালেট
                        </p>
                        <p className="text-[10px] text-slate-500">Wallet Pay</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between text-[11px] font-mono">
                      <span className="text-slate-500">ব্যালেন্স:</span>
                      <span className="font-bold text-slate-900">৳{user.balance}</span>
                    </div>
                  </div>

                  {/* Instant Pay (bKash, Nagad, Rocket, Upay) */}
                  <div
                    onClick={() => setPaymentOption('instant')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                      paymentOption === 'instant'
                        ? 'border-red-500 bg-rose-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {paymentOption === 'instant' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-red-600 rounded-full text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold bg-pink-600 text-white px-1.5 py-0.5 rounded">
                        bKash
                      </span>
                      <span className="text-[10px] font-extrabold bg-orange-500 text-white px-1.5 py-0.5 rounded">
                        নগদ
                      </span>
                      <span className="text-[10px] font-extrabold bg-purple-700 text-white px-1.5 py-0.5 rounded">
                        Rocket
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 mt-2">Instant Auto Pay</p>
                    <p className="text-[10px] text-slate-500">বিকাশ / নগদ অটো পেমেন্ট</p>
                  </div>
                </div>

                {/* Price alert banner */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs font-bengali flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-red-600">ℹ️</span>
                    <span>প্রোডাক্টটি কিনতে আপনার প্রয়োজন:</span>
                  </div>
                  <span className="font-extrabold text-red-600 font-mono text-sm">
                    ৳ {selectedOption?.price || 0} টাকা
                  </span>
                </div>

                {/* Big Order Action Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleStartPurchase}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/30 hover:brightness-105 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>অর্ডার সম্পন্ন করুন (৳{selectedOption?.price || 0} TK)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rules & Conditions Box */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-red-600 text-base">📋</span>
                  <h3 className="font-bold text-sm text-slate-800">Rules & Conditions</h3>
                </div>

                <div className="space-y-2 text-xs font-bengali text-slate-600 leading-relaxed">
                  {activeCategory.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                      <p>{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* =========================================================================
            VIEW B: MAIN TOPUP STORE HOME (Matching Screenshots & Video)
           ========================================================================= */
        <div className="max-w-md mx-auto px-3 py-3 space-y-4">
          {/* WhatsApp Support Pill */}
          <div className="flex justify-start">
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-rose-500" />
              <span>CHAT WhatsApp</span>
            </a>
          </div>

          {/* Promotional Carousel Banner */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-950 border border-slate-800 aspect-[16/8]">
            {/* Slide 1 */}
            {activeSlide === 0 && (
              <div
                onClick={() => setShowTutorialModal(true)}
                className="w-full h-full bg-gradient-to-r from-black via-slate-900 to-red-950 p-4 flex flex-col justify-between cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase font-orbitron">
                      100% Ai Delivery
                    </span>
                    <h2 className="text-lg font-black text-white font-bengali mt-1 leading-snug drop-shadow-md">
                      কিভাবে ১ সেকেন্ডে ডায়মন্ড টপ-আপ করবেন?
                    </h2>
                  </div>
                  <div className="text-4xl animate-bounce">💎</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-bengali shadow-sm">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>ক্লিক করে ভিডিও দেখুন</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-cyan-300 font-bengali font-bold">
                    <span>⚡ ১ সেকেন্ড ডেলিভারি</span>
                    <span>🕒 ২৪ ঘণ্টা সেবা</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2 */}
            {activeSlide === 1 && (
              <div
                onClick={() => setShowTutorialModal(true)}
                className="w-full h-full bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-4 flex flex-col justify-between cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase font-orbitron">
                      UniPin Voucher
                    </span>
                    <h2 className="text-lg font-black text-white font-bengali mt-1 leading-snug">
                      কিভাবে ১ সেকেন্ডে ইউনিপিন দিয়ে টপ-আপ করবেন?
                    </h2>
                  </div>
                  <div className="text-3xl">🎫</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold font-bengali">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>টিউটোরিয়াল দেখুন</span>
                  </div>
                  <span className="text-xs text-amber-300 font-bold font-bengali">সবচেয়ে কম রেট</span>
                </div>
              </div>
            )}

            {/* Slide 3 */}
            {activeSlide === 2 && (
              <div className="w-full h-full bg-gradient-to-r from-emerald-950 via-slate-900 to-red-950 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase font-orbitron">
                      SPECIAL COMBO
                    </span>
                    <h2 className="text-lg font-black text-white font-bengali mt-1 leading-snug">
                      উইকলি + মান্থলি মেগা কম্বো অফার
                    </h2>
                  </div>
                  <div className="text-3xl">👑</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">BD SERVER INSTANT</span>
                  <span className="text-xs text-white font-bold font-bengali">অটো ডেলিভারি ⚡</span>
                </div>
              </div>
            )}

            {/* Carousel Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeSlide === idx ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Section 1: GAMES TOPUP */}
          <div>
            <div className="text-center my-3">
              <h2 className="text-xl font-black text-[#1e293b] font-orbitron tracking-wider">
                GAMES TOPUP
              </h2>
            </div>

            {/* 3-Column Games Topup Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {TOPUP_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  onClick={() => handleSelectCategory(cat)}
                  className="flex flex-col items-center cursor-pointer group hover:-translate-y-1 transition-transform duration-150 select-none"
                >
                  {/* Visual card */}
                  {renderCardGraphic(cat.iconType, cat.bengaliTitle, cat.categoryTag)}

                  {/* Title under card */}
                  <h3 className="mt-1.5 text-center text-xs font-bold text-slate-800 font-rajdhani line-clamp-2 leading-tight group-hover:text-red-600 transition">
                    {cat.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMMON FOOTER: STAY CONNECTED & SUPPORT CENTER
         ========================================================================= */}
      <footer className="max-w-md mx-auto mt-8 px-3 space-y-4">
        {/* STAY CONNECTED */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3 text-center">
          <h3 className="text-base font-black font-orbitron tracking-wider uppercase text-cyan-300">
            STAY CONNECTED
          </h3>
          <p className="text-xs text-slate-300 font-bengali leading-relaxed">
            কোন সমস্যায় পড়লে হোয়াটসঅ্যাপ এ যোগাযোগ করবেন। তাহলে দ্রুত সমাধান পেয়ে যাবেন।
          </p>

          <div className="flex justify-center gap-3 pt-1">
            {[
              { icon: Facebook, color: 'hover:bg-blue-600', link: 'https://facebook.com' },
              { icon: Instagram, color: 'hover:bg-pink-600', link: 'https://instagram.com' },
              { icon: Youtube, color: 'hover:bg-red-600', link: 'https://youtube.com' },
              { icon: Mail, color: 'hover:bg-amber-600', link: 'mailto:support@mstopup.com' },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <a
                  key={idx}
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white transition ${s.color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* SUPPORT CENTER */}
        <div className="bg-[#0b1329] text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-black font-orbitron tracking-wider text-slate-400 uppercase text-center">
            SUPPORT CENTER
          </h3>
          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Help line [9AM-12PM] Whatsapp HelpLine</span>
          </a>
          <p className="text-center text-[10px] text-slate-500 font-mono pt-1">
            © MS TOPUP 2026 | All Rights Reserved | BD ESPORTS MS
          </p>
        </div>
      </footer>

      {/* =========================================================================
          MODAL 1: TUTORIAL VIDEO / HOW TO ORDER
         ========================================================================= */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm font-bengali">কিভাবে ১ সেকেন্ডে টপ-আপ করবেন?</h3>
              </div>
              <button
                onClick={() => setShowTutorialModal(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 font-bengali text-xs text-slate-700">
              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <p className="text-white font-bold text-xs">ভিডিও টিউটোরিয়াল লোড হচ্ছে</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">সহজ ৩টি ধাপ:</p>
                <p>১. আপনার কাঙ্ক্ষিত ডায়মন্ড প্যাকেজ সিলেক্ট করুন।</p>
                <p>২. আপনার ফ্রি ফায়ার প্লেয়ার UID কোড দিন।</p>
                <p>৩. ওয়ালেট বা বিকাশ অটো পেমেন্ট দিয়ে অর্ডার সম্পন্ন করুন।</p>
              </div>

              <button
                onClick={() => setShowTutorialModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold font-orbitron"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: HOW TO GET 2-STEP BACKUP CODES (Facebook)
         ========================================================================= */}
      {showBackupGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-bengali">ফেসবুক ব্যাকআপ কোড বের করার নিয়ম</h3>
              <button
                onClick={() => setShowBackupGuideModal(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 font-bengali text-xs text-slate-700 leading-relaxed">
              <p>১. ফেসবুক সেটিংস এ গিয়ে <b>Password and Security</b> তে যান।</p>
              <p>২. <b>Two-Factor Authentication</b> এ ক্লিক করুন।</p>
              <p>৩. <b>Additional Methods</b> বা <b>Recovery Codes</b> এ ক্লিক করুন।</p>
              <p>৪. সেখান থেকে যেকোনো ৮ ডিজিটের ২টি কোড কপি করে এখানে দিন।</p>

              <button
                onClick={() => setShowBackupGuideModal(false)}
                className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BKASH / NAGAD INSTANT AUTO-PAY GATEWAY
         ========================================================================= */}
      {showInstantGateway && selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl space-y-3 border border-slate-200">
            {/* Gateway Brand Header */}
            <div
              className={`p-4 text-white flex items-center justify-between ${
                instantMethod === 'bKash'
                  ? 'bg-gradient-to-r from-pink-700 to-rose-600'
                  : instantMethod === 'Nagad'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600'
                  : 'bg-gradient-to-r from-purple-800 to-indigo-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                  ৳
                </div>
                <div>
                  <h3 className="font-extrabold text-sm font-rajdhani uppercase tracking-wider">
                    {instantMethod} Direct Payment
                  </h3>
                  <p className="text-[10px] text-white/80 font-mono">Merchant: MS TOPUP BD</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstantGateway(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gateway Content */}
            <div className="p-4 space-y-4">
              {/* Method Switcher */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['bKash', 'Nagad', 'Rocket', 'Upay'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setInstantMethod(m);
                      setInstantStep('number');
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      instantMethod === m
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Amount Display */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Payable Amount:</span>
                <span className="font-extrabold text-red-600 font-mono text-base">
                  ৳ {selectedOption.price} BDT
                </span>
              </div>

              {instantStep === 'number' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                      Your {instantMethod} Account Number
                    </label>
                    <input
                      type="tel"
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 font-bengali text-center">
                    পরের ধাপে আপনার {instantMethod} পিন দিয়ে ভেরিফাই করুন।
                  </p>

                  <button
                    type="button"
                    onClick={handleConfirmInstantPayment}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider shadow-md"
                  >
                    CONTINUE ➡
                  </button>
                </div>
              )}

              {instantStep === 'pin' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                      Enter {instantMethod} PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={gatewayPin}
                      onChange={(e) => setGatewayPin(e.target.value)}
                      placeholder="•••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono text-slate-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmInstantPayment}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black font-rajdhani uppercase tracking-wider shadow-md"
                  >
                    CONFIRM & PAY ৳{selectedOption.price}
                  </button>
                </div>
              )}

              {instantStep === 'processing' && (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-800">পেমেন্ট সম্পন্ন হচ্ছে...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

