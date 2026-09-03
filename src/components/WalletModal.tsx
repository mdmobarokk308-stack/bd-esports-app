import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Landmark,
  Gift,
  PlayCircle,
  HelpCircle,
  X,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { AppSettings, Transaction, User } from '../types';

interface WalletModalProps {
  user: User;
  transactions: Transaction[];
  settings?: AppSettings;
  onClose: () => void;
  onDeposit: (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', sender: string, trxId: string) => void;
  onOpenWithdraw?: () => void;
  onOpenReferEarn?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  user,
  transactions,
  settings,
  onClose,
  onDeposit,
  onOpenWithdraw,
  onOpenReferEarn,
}) => {
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState<{ title: string; videoId?: string } | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('100');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const DUMMY_LIST = ['01712345678', '01812345678', '019999888775', '01700000000'];

  const getCleanNumber = (val: string | undefined | null, fallback: string) => {
    if (val && !DUMMY_LIST.includes(val.trim())) return val.trim();
    return fallback;
  };

  const paymentNumbers = {
    bKash: getCleanNumber(
      localStorage.getItem('permanent_owner_bkash') || settings?.bkashNumber || localStorage.getItem('admin_bkash_number'),
      '01612456053'
    ),
    Nagad: getCleanNumber(
      localStorage.getItem('permanent_owner_nagad') || settings?.nagadNumber || localStorage.getItem('admin_nagad_number'),
      '01612456053'
    ),
    Rocket: getCleanNumber(
      localStorage.getItem('permanent_owner_rocket') || settings?.rocketNumber || localStorage.getItem('admin_rocket_number'),
      '01612456053'
    ),
  };

  const [verifying, setVerifying] = useState(false);
  const [verifyCountdown, setVerifyCountdown] = useState(3);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumbers[selectedMethod]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      setError('মিনিমাম ডিপোজিট ১০ টাকা (Minimum deposit ৳10 BDT)');
      return;
    }
    if (numAmount > 25000) {
      setError('সর্বোচ্চ ডিপোজিট ২৫,০০০ টাকা (Maximum deposit ৳25,000 BDT)');
      return;
    }
    const cleanPhone = senderNumber.trim();
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setError('সঠিক ১১ ডিজিটের বিকাশ/নগদ/রকেট নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }
    const cleanTrx = trxId.trim().toUpperCase();
    if (cleanTrx.length < 6 || cleanTrx.length > 25) {
      setError('সঠিক Transaction ID (TrxID) দিন (কমপক্ষে ৬-১০ অক্ষর)');
      return;
    }

    // Anti-Hacking: Duplicate TrxID Check across all transactions
    const isDuplicate = transactions.some(
      (t) => t.trxId && t.trxId.trim().toUpperCase() === cleanTrx
    );
    if (isDuplicate) {
      setError('⚠️ এই Transaction ID (TrxID) ইতিপূর্বে ব্যবহার করা হয়েছে! ভুয়া ট্রানজেকশন দিলে অ্যাকাউন্ট ব্যান হবে।');
      return;
    }

    // Anti-Hacking: Fake / Spam TrxID checks
    const FAKE_PATTERNS = ['123456', '12345678', '000000', '111111', '999999', 'TEST', 'FAKE', 'ASDF'];
    if (FAKE_PATTERNS.some((pat) => cleanTrx.includes(pat)) || /^([a-zA-Z0-9])\1+$/.test(cleanTrx)) {
      setError('⚠️ অবৈধ বা ভুয়া TrxID সনাক্ত হয়েছে! অনুগ্রহ করে আসল TrxID দিন।');
      return;
    }

    setError('');
    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      onDeposit(numAmount, selectedMethod, cleanPhone, cleanTrx);
      setSuccess(true);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
      setTimeout(() => {
        setSuccess(false);
        setShowDepositForm(false);
        setShowHistory(true);
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        id="wallet-main-card"
        className="w-full h-full sm:h-auto max-w-md bg-white sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col text-slate-900"
      >
        {/* If showing Deposit form subview */}
        {showDepositForm ? (
          <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                onClick={() => setShowDepositForm(false)}
                className="p-1 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 font-bold text-sm"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                <span>Back</span>
              </button>
              <h3 className="font-bold text-base text-slate-900 font-['Rajdhani',sans-serif]">Add Money / Deposit</h3>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Deposit Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      selectedMethod === method
                        ? method === 'bKash'
                          ? 'bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-300'
                          : method === 'Nagad'
                          ? 'bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-300'
                          : 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm font-black">{method}</span>
                    <span className="text-[10px] text-slate-500">Send Money</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Number to send */}
            <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{selectedMethod} Personal (Send Money)</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-amber-300 tracking-wider">
                  {paymentNumbers[selectedMethod]}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1 text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-bengali">
              📌 উপরের নাম্বারে <span className="font-bold">{selectedMethod} Send Money</span> করে নিচের ফর্মে আপনার মোবাইল নাম্বার ও TrxID লিখে সাবমিট করুন।
            </div>

            {error && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bengali">{error}</div>}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold text-center font-bengali animate-bounce">
                🎉 ডিপোজিট সফল হয়েছে! ৳{amount} টাকা সাথে সাথে আপনার ওয়ালেট ব্যালেন্সে যুক্ত হয়েছে।
              </div>
            )}

            <form onSubmit={handleSubmitDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Amount (BDT)</label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {['50', '100', '200', '500'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                        amount === amt ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sender {selectedMethod} Number</label>
                <input
                  type="tel"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transaction ID (TrxID)</label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="BKS9876543"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {verifying ? (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm font-rajdhani">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Deposit Request...</span>
                  </div>
                  <p className="text-xs text-blue-700 font-bengali">
                    অনুগ্রহ করে অপেক্ষা করুন, রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো হচ্ছে...
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer transition active:scale-98 disabled:opacity-50 font-rajdhani tracking-wide uppercase"
                >
                  ⚡ SUBMIT DEPOSIT REQUEST (৳{amount || 0})
                </button>
              )}
            </form>
          </div>
        ) : showHistory ? (
          /* Transaction History Subview */
          <div className="p-4 flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 font-bold text-sm"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                <span>Back</span>
              </button>
              <h3 className="font-bold text-base text-slate-900">Transaction History</h3>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No transaction records found.</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800">{t.description}</span>
                      <span
                        className={
                          t.status === 'rejected'
                            ? 'text-slate-400 line-through'
                            : t.type === 'deposit' || t.type === 'match_prize'
                            ? 'text-emerald-600 font-mono font-bold'
                            : 'text-rose-600 font-mono font-bold'
                        }
                      >
                        {t.type === 'deposit' || t.type === 'match_prize' ? '+' : '-'}৳{t.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">{t.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                          t.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {t.status === 'approved'
                          ? '✅ Completed'
                          : t.status === 'pending'
                          ? '⏳ Pending Admin Verification'
                          : '❌ Rejected'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Main Wallet Overview Matching Screenshot 3 */
          <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-5">
            {/* Top Bar: TOTAL CASH BALANCE + View Transaction History */}
            <div className="flex items-start justify-between">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] leading-tight tracking-tight uppercase">
                  TOTAL CASH
                </span>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] leading-tight tracking-tight uppercase">
                  BALANCE
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-['Rajdhani',sans-serif] mt-1">
                  BDT {user.balance}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <button
                  onClick={onClose}
                  className="p-1 -mr-2 -mt-1 text-slate-400 hover:text-slate-700 cursor-pointer mb-2"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-rajdhani font-bold cursor-pointer"
                >
                  <span>View Transaction History</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200/80 -mx-4 sm:-mx-5" />

            {/* 1. WINNING CASH BALANCE + WITHDRAW Button (Green) */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 font-['Rajdhani',sans-serif] uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>WINNING CASH BALANCE</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                  BDT {user.totalWon}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenWithdraw) onOpenWithdraw();
                }}
                className="px-4 sm:px-5 py-2.5 bg-[#4caf50] hover:bg-[#43a047] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-98 font-['Rajdhani',sans-serif]"
              >
                <div className="w-4 h-3 border-2 border-white rounded-xs" />
                <span>WITHDRAW</span>
              </button>
            </div>

            <div className="border-t border-slate-200/80 -mx-4 sm:-mx-5" />

            {/* 2. DEPOSIT CASH + ADD MORE Button (Blue) */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 font-['Rajdhani',sans-serif] uppercase tracking-wider">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span>DEPOSIT CASH</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                  BDT {user.balance}
                </span>
              </div>

              <button
                onClick={() => setShowDepositForm(true)}
                className="px-4 sm:px-5 py-2.5 bg-[#2196f3] hover:bg-[#1e88e5] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-98 font-['Rajdhani',sans-serif]"
              >
                <span className="text-base font-black leading-none">+</span>
                <span>ADD MORE</span>
              </button>
            </div>

            <div className="border-t border-slate-200/80 -mx-4 sm:-mx-5" />

            {/* 3. REFER AND EARN + REFER & EARN Button (Purple) */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 font-['Rajdhani',sans-serif] uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-pink-500" />
                  <span>REFER AND EARN</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 font-['Rajdhani',sans-serif] mt-0.5">
                  0
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenReferEarn) onOpenReferEarn();
                }}
                className="px-4 sm:px-5 py-2.5 bg-[#9c27b0] hover:bg-[#8e24aa] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-98 font-['Rajdhani',sans-serif]"
              >
                <Gift className="w-4 h-4" />
                <span>REFER & EARN</span>
              </button>
            </div>

            <div className="border-t border-slate-200/80 -mx-4 sm:-mx-5" />

            {/* Video Tutorial Rows matching Screenshot 3 */}
            <div className="space-y-4 pt-1">
              {/* Row 1: HOW TO ADD MONEY? */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]">
                      ▶
                    </div>
                    <span>HOW TO ADD MONEY?</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 font-bengali tracking-tight mt-0.5">
                    কিভাবে টাকা অ্যাড করবেন
                  </h4>
                </div>

                <button
                  onClick={() => setShowVideoModal({ title: 'কিভাবে টাকা অ্যাড করবেন (Deposit Video)' })}
                  className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white font-bengali font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                >
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px]">
                    ▶
                  </div>
                  <span>ভিডিওটি দেখুন</span>
                </button>
              </div>

              {/* Row 2: HOW TO COLLECT ROOM ID? */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]">
                      ▶
                    </div>
                    <span>HOW TO COLLECT ROOM ID?</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 font-bengali tracking-tight mt-0.5">
                    কিভাবে রুম আইডি পাবেন
                  </h4>
                </div>

                <button
                  onClick={() => setShowVideoModal({ title: 'কিভাবে রুম আইডি পাবেন (Room ID Video)' })}
                  className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white font-bengali font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                >
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px]">
                    ▶
                  </div>
                  <span>ভিডিওটি দেখুন</span>
                </button>
              </div>

              {/* Row 3: HOW TO JOIN IN A MATCH? */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]">
                      ▶
                    </div>
                    <span>HOW TO JOIN IN A MATCH?</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 font-bengali tracking-tight mt-0.5">
                    কিভাবে ম্যাচে জয়েন করবেন
                  </h4>
                </div>

                <button
                  onClick={() => setShowVideoModal({ title: 'কিভাবে ম্যাচে জয়েন করবেন (Join Tutorial)' })}
                  className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white font-bengali font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                >
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px]">
                    ▶
                  </div>
                  <span>ভিডিওটি দেখুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Tutorial Modal Popup */}
        {showVideoModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 font-bengali">{showVideoModal.title}</h4>
                <button
                  onClick={() => setShowVideoModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center">
                <PlayCircle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
                <p className="text-xs font-bold">{showVideoModal.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bengali">
                  ভিডিও প্লেয়ার লোড হচ্ছে... (YouTube / App Guide)
                </p>
              </div>

              <button
                onClick={() => setShowVideoModal(null)}
                className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
