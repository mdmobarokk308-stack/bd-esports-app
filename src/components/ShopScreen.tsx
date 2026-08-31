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
  PackageCheck,
  Clock,
  RotateCcw,
  ExternalLink,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TOPUP_CATEGORIES, TopupCategoryItem, RechargeOption } from '../data/topupData';
import { User, Transaction, AppNotification, VoucherVaultItem } from '../types';
import { autoFulfillOrderFromVault, parseVoucherCode } from '../utils/voucherMatcher';
import { syncVouchersToServer } from '../api';

interface ShopScreenProps {
  user: User;
  transactions?: Transaction[];
  onSuccessOrder: (item: any, uid: string, deliveredCode?: string, costInfo?: string) => void;
  onOpenWallet?: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, transactions = [], onSuccessOrder, onOpenWallet }) => {
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
    deliveredCode?: string;
    costSummary?: string;
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

  // My Orders Modal state
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [copiedVoucherPin, setCopiedVoucherPin] = useState<string | null>(null);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Top-up orders list (filtered from transactions)
  const topupOrders = (transactions || []).filter(
    (t) =>
      t.type === 'topup_purchase' ||
      Boolean(t.orderId) ||
      (t.description &&
        (t.description.toLowerCase().includes('top-up') ||
          t.description.toLowerCase().includes('diamond') ||
          t.description.toLowerCase().includes('voucher') ||
          t.description.toLowerCase().includes('membership')))
  );

  // Filtered orders for modal
  const filteredOrders = topupOrders.filter((ord) => {
    if (ordersFilter === 'approved' && ord.status !== 'approved') return false;
    if (ordersFilter === 'pending' && ord.status !== 'pending') return false;
    if (ordersFilter === 'rejected' && ord.status !== 'rejected') return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const idMatch = (ord.orderId || ord.id || '').toLowerCase().includes(q);
      const pkgMatch = (ord.packageName || ord.description || '').toLowerCase().includes(q);
      const uidMatch = (ord.targetUid || '').toLowerCase().includes(q);
      return idMatch || pkgMatch || uidMatch;
    }
    return true;
  });

  // When a category is selected, auto select first recharge option
  const handleSelectCategory = (cat: TopupCategoryItem) => {
    setActiveCategory(cat);
    setSelectedOption(cat.rechargeOptions[2] || cat.rechargeOptions[0]);
    setOrderSuccessData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (order: Transaction) => {
    setShowOrdersModal(false);
    let matchedCat = TOPUP_CATEGORIES[0];
    const desc = (order.packageName || order.description || '').toLowerCase();
    if (desc.includes('indonesia')) {
      matchedCat = TOPUP_CATEGORIES.find((c) => c.id === 'indonesia_uid') || TOPUP_CATEGORIES[0];
    } else if (desc.includes('weekly') || desc.includes('monthly') || desc.includes('membership')) {
      matchedCat = TOPUP_CATEGORIES.find((c) => c.id === 'weekly_monthly') || TOPUP_CATEGORIES[0];
    } else if (desc.includes('airdrop')) {
      matchedCat = TOPUP_CATEGORIES.find((c) => c.id === 'special_airdrop') || TOPUP_CATEGORIES[0];
    } else if (desc.includes('level up')) {
      matchedCat = TOPUP_CATEGORIES.find((c) => c.id === 'levelup_pass') || TOPUP_CATEGORIES[0];
    }

    setActiveCategory(matchedCat);
    if (order.targetUid) {
      setPlayerUid(order.targetUid);
    }
    const matchedOpt =
      matchedCat.rechargeOptions.find(
        (opt) =>
          desc.includes(opt.name.toLowerCase()) ||
          opt.price === order.amount
      ) ||
      matchedCat.rechargeOptions[2] ||
      matchedCat.rechargeOptions[0];

    setSelectedOption(matchedOpt);
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
        const fullItemName = `${activeCategory.title} - ${selectedOption.name}`;
        const targetAccount = activeCategory.type === 'uid' ? playerUid.trim() : accountNumber.trim();

        // 100% Automated Voucher Vault Lookup & Lowest Cost Matcher
        let vaultList: VoucherVaultItem[] = [];
        try {
          const stored = localStorage.getItem('admin_voucher_vault');
          if (stored) vaultList = JSON.parse(stored);
        } catch {}

        const fulfillResult = autoFulfillOrderFromVault(
          selectedOption.name || activeCategory.title,
          targetAccount,
          orderId,
          vaultList
        );

        if (fulfillResult.deliveredVoucher) {
          syncVouchersToServer(fulfillResult.updatedVault);
        }

        setOrderSuccessData({
          orderId,
          itemTitle: activeCategory.title,
          optionName: selectedOption.name,
          price: selectedOption.price,
          account: activeCategory.type === 'uid' ? `UID: ${playerUid}` : `${accountType}: ${accountNumber}`,
          method: 'MS Wallet',
          deliveredCode: fulfillResult.deliveredVoucher?.code,
          costSummary: fulfillResult.costInfo,
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
            name: fullItemName,
            amount: selectedOption.name,
            price: selectedOption.price,
            category: 'diamond',
            icon: '💎',
          },
          targetAccount,
          fulfillResult.deliveredVoucher?.code,
          fulfillResult.costInfo
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
        const fullItemName = `${activeCategory.title} - ${selectedOption.name}`;
        const targetAccount = activeCategory.type === 'uid' ? playerUid.trim() : accountNumber.trim();

        // 100% Automated Voucher Vault Lookup & Lowest Cost Matcher
        let vaultList: VoucherVaultItem[] = [];
        try {
          const stored = localStorage.getItem('admin_voucher_vault');
          if (stored) vaultList = JSON.parse(stored);
        } catch {}

        const fulfillResult = autoFulfillOrderFromVault(
          selectedOption.name || activeCategory.title,
          targetAccount,
          orderId,
          vaultList
        );

        if (fulfillResult.deliveredVoucher) {
          syncVouchersToServer(fulfillResult.updatedVault);
        }

        setOrderSuccessData({
          orderId,
          itemTitle: activeCategory.title,
          optionName: selectedOption.name,
          price: selectedOption.price,
          account: activeCategory.type === 'uid' ? `UID: ${playerUid}` : `${accountType}: ${accountNumber}`,
          method: `${instantMethod} Instant Auto Pay`,
          deliveredCode: fulfillResult.deliveredVoucher?.code,
          costSummary: fulfillResult.costInfo,
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
            name: fullItemName,
            amount: selectedOption.name,
            price: selectedOption.price,
            category: 'diamond',
            icon: '💎',
          },
          targetAccount,
          fulfillResult.deliveredVoucher?.code,
          fulfillResult.costInfo
        );
      }, 1200);
    }
  };

  // Render Category Icon Visual with real Free Fire Character artwork matching reference image
  const renderCardGraphic = (iconType: string, bengaliTitle: string, tag: string) => {
    // Map real Free Fire character artwork for each category
    let imageSrc = '/images/ff_hiphop_gold.jpg';
    let bannerText = bengaliTitle.replace('\n', ' ');

    if (iconType === 'idcode') {
      imageSrc = '/images/ff_hiphop_gold.jpg';
      bannerText = 'আইডি কোড টপআপ';
    } else if (iconType === 'indonesia') {
      imageSrc = '/images/ff_blue_aura.jpg';
      bannerText = 'ইন্দোনেশিয়া সার্ভার';
    } else if (iconType === 'airdrop') {
      imageSrc = '/images/ff_fox_mask.jpg';
      bannerText = 'ইনগেম এয়ারড্রপ';
    } else if (iconType === 'levelup') {
      imageSrc = '/images/ff_oni_demon.jpg';
      bannerText = 'লেভেল আপ পাস';
    } else if (iconType === 'weekly_lite') {
      imageSrc = '/images/ff_neon_purple.jpg';
      bannerText = 'উইকলি লাইট';
    } else if (iconType === 'weekly') {
      imageSrc = '/images/ff_magenta_warrior.jpg';
      bannerText = 'উইকলি মেম্বারশিপ';
    } else if (iconType === 'monthly') {
      imageSrc = '/images/ff_snow_samurai.jpg';
      bannerText = 'মান্থলি মেম্বারশিপ';
    } else if (iconType === 'weekly_monthly') {
      imageSrc = '/images/ff_oni_lightning.jpg';
      bannerText = 'উইকলি মান্থলি কম্বো';
    }

    return (
      <div className="relative w-full aspect-[0.92/1] rounded-2xl overflow-hidden bg-[#091026] border border-cyan-500/50 flex flex-col justify-between items-center shadow-md group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300">
        {/* Real Character Image Background */}
        <img
          src={imageSrc}
          alt={bannerText}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/70 pointer-events-none" />

        {/* Top Header Badge Row inside Card */}
        <div className="w-full flex justify-between items-center z-10 p-1.5">
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-bengali shadow-md ${
              tag === 'USER ডেলিভারি'
                ? 'bg-amber-400 text-slate-950 font-extrabold border border-amber-300'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold border border-cyan-300/40'
            }`}
          >
            {tag}
          </span>
          <span className="text-xs text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] font-bold">⚡</span>
        </div>

        {/* Bottom Bengali Title Tag Banner inside card */}
        <div className="w-full text-center z-10 p-1">
          <div className="w-full bg-slate-950/90 backdrop-blur-xs py-1 px-1 rounded-xl border border-cyan-500/50 shadow-md">
            <p className="text-[10px] sm:text-[11px] font-black text-cyan-200 font-bengali leading-tight tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap overflow-hidden text-ellipsis">
              {bannerText}
            </p>
          </div>
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

        {/* Right Action: My Orders & Wallet Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowOrdersModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition cursor-pointer shadow-2xs"
            title="My Orders"
          >
            <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline font-rajdhani uppercase font-black text-[11px]">Orders</span>
            {topupOrders.length > 0 && (
              <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-3.5 text-center">
                {topupOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold font-mono hover:bg-rose-100 transition cursor-pointer shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>৳{user.balance}</span>
          </button>
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

                {orderSuccessData.costSummary && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-cyan-800 font-bengali flex items-center justify-between">
                    <span className="font-bold">⚡ সিস্টেম প্রসেসিং:</span>
                    <span className="bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded font-bold">{orderSuccessData.costSummary}</span>
                  </div>
                )}
              </div>

              {/* Direct In-Game Auto Delivery Success Banner */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400/80 rounded-2xl p-4 text-left space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold font-rajdhani text-xs">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500 animate-bounce" />
                    <span className="uppercase tracking-wider">100% AUTOMATIC TOP-UP DELIVERY</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    ⚡ সফল হয়েছে
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-xs border border-emerald-300 rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs font-bengali">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আপনার অর্ডারের ডায়মন্ড ডেলিভারি প্রস্তুত!</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                    <span>টার্গেট Player UID:</span>
                    <span className="font-bold text-slate-900 font-mono">{orderSuccessData.account}</span>
                  </div>

                  {/* If voucher was delivered from Vault, display Serial & PIN & 1-Click Redeem Link */}
                  {orderSuccessData.deliveredCode && (() => {
                    const parsed = parseVoucherCode(orderSuccessData.deliveredCode);
                    return (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 font-mono text-xs">
                        <span className="text-[11px] font-bold text-amber-800 font-bengali block">
                          🎟️ আপনার ভাউচার পিন ও রিডিম ডিটেইলস:
                        </span>
                        {parsed.serial && (
                          <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <div>
                              <span className="text-[10px] text-amber-700 block font-sans font-bold">SERIAL NUMBER:</span>
                              <span className="font-bold text-slate-900 text-xs">{parsed.serial}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(parsed.serial!)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-sans font-bold"
                            >
                              COPY
                            </button>
                          </div>
                        )}
                        {parsed.pin && (
                          <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            <div>
                              <span className="text-[10px] text-emerald-700 block font-sans font-bold">VOUCHER PIN:</span>
                              <span className="font-black text-emerald-900 text-xs">{parsed.pin}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(parsed.pin!)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-sans font-bold"
                            >
                              COPY PIN
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (parsed.pin) {
                              navigator.clipboard.writeText(parsed.pin);
                            }
                            window.open('https://shop.garena.my', '_blank');
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-rajdhani font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer"
                        >
                          <span>🌐 ১-ক্লিকে Garena Shop এ রিডিম করুন (shop.garena.my)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()}
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
            {/* Header Action Bar: WhatsApp Chat (Left) & My Orders Button (Right - in marked area) */}
          <div className="flex items-center justify-between gap-2">
            <a
              href="https://wa.me/8801612456053"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-rose-500" />
              <span>CHAT WhatsApp</span>
            </a>

            {/* MY ORDERS Button (Placed exactly in the marked area) */}
            <button
              id="shop-topbar-my-orders-btn"
              onClick={() => setShowOrdersModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black font-rajdhani tracking-wide shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition border border-amber-300/40 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="font-extrabold uppercase">MY ORDERS</span>
              {topupOrders.length > 0 && (
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {topupOrders.length}
                </span>
              )}
            </button>
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

          {/* Featured Offers Top Banner Cards matching reference screenshot */}
          <div className="grid grid-cols-2 gap-3 my-4">
            {/* WEEKLY OFFER CARD */}
            <div
              onClick={() => {
                const weeklyCat = TOPUP_CATEGORIES.find((c) => c.id === 'weekly_bd');
                if (weeklyCat) handleSelectCategory(weeklyCat);
              }}
              className="relative rounded-2xl overflow-hidden border-2 border-purple-500/60 bg-[#0c1229] p-2.5 cursor-pointer group hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2">
                <img
                  src="/images/ff_magenta_warrior.jpg"
                  alt="Weekly Offer"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 left-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                  Ai ⚡
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs font-black text-white font-orbitron uppercase tracking-wider group-hover:text-purple-300 transition">
                  WEEKLY OFFER
                </h3>
                <p className="text-[10px] text-purple-200 font-bengali mt-0.5">
                  উইকলি মেম্বারশিপ 🇧🇩
                </p>
              </div>
            </div>

            {/* MONTHLY OFFER CARD */}
            <div
              onClick={() => {
                const monthlyCat = TOPUP_CATEGORIES.find((c) => c.id === 'monthly_bd');
                if (monthlyCat) handleSelectCategory(monthlyCat);
              }}
              className="relative rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-[#140e24] p-2.5 cursor-pointer group hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2">
                <img
                  src="/images/ff_snow_samurai.jpg"
                  alt="Monthly Offer"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 left-1 bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                  VIP 👑
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xs font-black text-amber-400 font-orbitron uppercase tracking-wider group-hover:text-amber-300 transition">
                  MONTHLY OFFER
                </h3>
                <p className="text-[10px] text-amber-200 font-bengali mt-0.5">
                  মান্থলি মেম্বারশিপ 🇧🇩
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: GAMES TOPUP MS */}
          <div>
            <div className="text-center my-4 flex items-center justify-center gap-2 select-none">
              <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider flex items-center gap-2">
                <span className="text-slate-900 drop-shadow-2xs">GAMES TOPUP</span>
                <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white px-2.5 py-0.5 rounded-lg text-sm shadow-md border border-amber-300 tracking-widest font-extrabold">
                  MS
                </span>
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
            href="https://wa.me/8801612456053"
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

      {/* =========================================================================
          MY ORDERS MODAL (Order History, Live Status & Issue Resolution)
         ========================================================================= */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950/30 backdrop-blur-xs border border-white/20 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-black text-base font-rajdhani uppercase tracking-wider flex items-center gap-2">
                    <span>MY ORDERS (আমার অর্ডার)</span>
                    <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      {topupOrders.length} টি অর্ডার
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-100 font-bengali">
                    টপ-আপ অর্ডারের লাইভ স্ট্যাটাস, ভাউচার কোড ও সমস্যা সমাধান
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowOrdersModal(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2 shrink-0">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Order ID, UID বা প্যাকেজ নাম দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 font-bengali focus:outline-none focus:border-amber-500"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold font-bengali">
                <button
                  onClick={() => setOrdersFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    ordersFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  সব ({topupOrders.length})
                </button>
                <button
                  onClick={() => setOrdersFilter('approved')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                    ordersFilter === 'approved'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  সফল / কনফার্ম ({topupOrders.filter((t) => t.status === 'approved').length})
                </button>
                <button
                  onClick={() => setOrdersFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                    ordersFilter === 'pending'
                      ? 'bg-amber-600 text-white font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  অপেক্ষমাণ ({topupOrders.filter((t) => t.status === 'pending').length})
                </button>
                <button
                  onClick={() => setOrdersFilter('rejected')}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
                    ordersFilter === 'rejected'
                      ? 'bg-rose-600 text-white font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  সমস্যা ({topupOrders.filter((t) => t.status === 'rejected').length})
                </button>
              </div>
            </div>

            {/* Orders List Body */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1">
              {filteredOrders.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    📦
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-bengali">কোনো টপ-আপ অর্ডার পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-400 font-bengali mt-0.5">
                      আপনি যখনই শপ থেকে ডায়মন্ড টপ-আপ করবেন, তার লাইভ স্ট্যাটাস এখানে দেখতে পাবেন।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOrdersModal(false);
                      if (!activeCategory) {
                        handleSelectCategory(TOPUP_CATEGORIES[0]);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer transition active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>এখনই ডায়মন্ড টপ-আপ করুন</span>
                  </button>
                </div>
              ) : (
                filteredOrders.map((ord, index) => {
                  const isDelivered = ord.status === 'approved';
                  const isPending = ord.status === 'pending';
                  const isRejected = ord.status === 'rejected';
                  const orderId = ord.orderId || ord.id || `MS-${index + 1000}`;
                  const isIssueExpanded = expandedIssueId === orderId;

                  return (
                    <div
                      key={ord.id || index}
                      className={`rounded-xl border transition overflow-hidden shadow-sm ${
                        isDelivered
                          ? 'border-emerald-500/30 bg-gradient-to-b from-slate-900 via-emerald-950/10 to-slate-900'
                          : isPending
                          ? 'border-amber-500/30 bg-gradient-to-b from-slate-900 via-amber-950/10 to-slate-900'
                          : 'border-rose-500/40 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-900'
                      }`}
                    >
                      {/* Top Bar of Card */}
                      <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">ORDER ID:</span>
                          <span className="text-xs font-mono font-black text-amber-300">{orderId}</span>
                          <button
                            onClick={() => {
                              handleCopy(orderId);
                              setCopiedOrderId(orderId);
                              setTimeout(() => setCopiedOrderId(null), 2000);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-amber-300 transition cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === orderId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isDelivered && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold px-2 py-0.5 rounded-full font-bengali">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>কনফার্ম / সফল</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2 py-0.5 rounded-full font-bengali">
                              <Clock className="w-3 h-3 text-amber-300 animate-spin" />
                              <span>প্রসেসিং চলছে</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold px-2 py-0.5 rounded-full font-bengali animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>সমস্যা পাওয়া গেছে</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white font-rajdhani flex items-center gap-1.5">
                              <span>💎</span>
                              <span>{ord.packageName || ord.description}</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1 font-mono">
                              {ord.targetUid && (
                                <span className="text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                  UID: {ord.targetUid}
                                </span>
                              )}
                              <span className="text-slate-400 text-[11px] font-sans">{ord.date}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-amber-400 font-rajdhani">৳{ord.amount}</span>
                            {ord.method && (
                              <p className="text-[10px] text-slate-400 font-sans uppercase">{ord.method}</p>
                            )}
                          </div>
                        </div>

                        {/* Status Explanations & Action Boxes */}
                        {isDelivered && (
                          <div className="space-y-2">
                            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-xs font-bengali text-emerald-200">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="leading-tight">
                                  <span className="font-bold text-emerald-300 block">
                                    ডায়মন্ড ডেলিভারি সফলভাবে সম্পন্ন হয়েছে!
                                  </span>
                                  <span className="text-[11px] text-emerald-200/80">
                                    অটোমেটিক প্রসেসিং সম্পন্ন হয়েছে
                                  </span>
                                </div>
                              </div>

                              {ord.deliveredCode && (() => {
                                const parsed = parseVoucherCode(ord.deliveredCode);
                                return (
                                  <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-2.5 space-y-2 font-mono mt-2">
                                    <span className="text-[10px] text-amber-300 font-sans font-bold block uppercase">
                                      🎟️ ভাউচার ডেলিভারি ডিটেইলস:
                                    </span>
                                    {parsed.serial && (
                                      <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded border border-slate-800 text-[11px]">
                                        <div>
                                          <span className="text-[9px] text-slate-400 block font-sans">SERIAL:</span>
                                          <span className="font-bold text-amber-200">{parsed.serial}</span>
                                        </div>
                                        <button
                                          onClick={() => handleCopy(parsed.serial!)}
                                          className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded text-[10px] font-sans font-bold"
                                        >
                                          COPY
                                        </button>
                                      </div>
                                    )}
                                    {parsed.pin && (
                                      <div className="flex items-center justify-between bg-emerald-950/40 px-2 py-1.5 rounded border border-emerald-500/30 text-[11px]">
                                        <div>
                                          <span className="text-[9px] text-emerald-400 block font-sans">PIN:</span>
                                          <span className="font-black text-yellow-300">{parsed.pin}</span>
                                        </div>
                                        <button
                                          onClick={() => handleCopy(parsed.pin!)}
                                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-sans font-bold"
                                        >
                                          COPY PIN
                                        </button>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (parsed.pin) {
                                          navigator.clipboard.writeText(parsed.pin);
                                        }
                                        window.open('https://shop.garena.my', '_blank');
                                      }}
                                      className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-rajdhani font-black text-xs rounded-lg flex items-center justify-center gap-1 shadow-xs uppercase tracking-wider cursor-pointer"
                                    >
                                      <span>🌐 Garena Shop এ রিডিম করুন</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })()}

                              <div className="bg-slate-950/80 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">ডেলিভারি স্ট্যাটাস:</span>
                                <span className="text-emerald-400 font-bold font-mono">
                                  ⚡ 100% Complete & Verified
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isPending && (
                          <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 flex items-start gap-2 text-xs font-bengali text-amber-200">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <p className="leading-snug">
                              অর্ডারটি প্রক্রিয়াধীন রয়েছে। সাধারণত ১ থেকে ৫ মিনিটের মধ্যে ডায়মন্ড অ্যাকাউন্টে যোগ হয়। কোনো সমস্যা হলে সাপোর্টে যোগাযোগ করতে পারেন।
                            </p>
                          </div>
                        )}

                        {/* REJECTED / ISSUE STATE WITH STEP-BY-STEP INSTRUCTIONS */}
                        {isRejected && (
                          <div className="space-y-2">
                            <div className="bg-rose-950/60 border border-rose-500/40 rounded-lg p-2.5 space-y-2 text-xs font-bengali text-rose-200">
                              <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-rose-300">
                                    অর্ডারটি সম্পূর্ণ হতে সমস্যা হয়েছে (Failed / Issue)
                                  </p>
                                  <p className="text-[11px] text-rose-200/90 mt-0.5">
                                    সম্ভাব্য কারণ: আপনার দেওয়া Free Fire UID টি ভুল ছিল, অথবা অ্যাকাউন্টে সিকিউরিটি টু-স্টেপ লক ছিল।
                                  </p>
                                </div>
                              </div>

                              {/* How to Fix & Re-order Box */}
                              <div className="bg-slate-950/80 border border-rose-500/30 rounded-lg p-2 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                                  <span className="flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-amber-400" />
                                    <span>কীভাবে সঠিক করে পুনরায় অর্ডার করবেন?</span>
                                  </span>
                                </div>

                                <div className="space-y-1 text-[11px] text-slate-300 pl-1 leading-relaxed">
                                  <p>1️⃣ আপনার গেম ওপেন করে প্রোফাইল থেকে সঠিক Player ID (UID) কপি করুন।</p>
                                  <p>2️⃣ নিচের <strong className="text-amber-300">"রি-অর্ডার করুন"</strong> বাটনে ক্লিক করে সঠিক UID টি পেস্ট করুন।</p>
                                  <p>3️⃣ অর্ডার কনফার্ম করলেই সাথে সাথে ডায়মন্ড পৌঁছে যাবে।</p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons for Rejected Orders */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleReorder(ord)}
                                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer font-bengali"
                              >
                                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>পুনরায় সঠিক অর্ডার করুন (Re-order)</span>
                              </button>

                              <a
                                href={`https://wa.me/8801612456053?text=Hello%20Support,%20I%20have%20an%20issue%20with%20Order%20ID:%20${orderId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 font-bold text-xs rounded-lg flex items-center gap-1 transition shrink-0"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>সাপোর্ট</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Bottom Quick Help Guideline */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 font-bengali flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>যেকোনো সমস্যায় WhatsApp বা Telegram-এ অর্ডার আইডি পাঠিয়ে দ্রুত সমাধান নিন।</span>
              </div>
              <button
                onClick={() => setShowOrdersModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ml-2"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

