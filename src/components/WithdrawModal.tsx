import React, { useState, useEffect } from 'react';
import { X, Banknote, ShieldAlert, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  onWithdraw: (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', receiver: string) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  user,
  onClose,
  onWithdraw,
}) => {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('50');
  const [accountNumber, setAccountNumber] = useState(user.phone || '');
  const [accountType, setAccountType] = useState<'Personal' | 'Agent'>('Personal');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isProcessing && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isProcessing) {
      setIsProcessing(false);
      setSuccess(true);
    }
    return () => clearInterval(interval);
  }, [isProcessing, countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50) {
      setError('Minimum withdrawal amount is 50 BDT');
      return;
    }
    if (numAmount > user.balance) {
      setError(`Insufficient balance. You have ৳${user.balance} BDT.`);
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 11) {
      setError('Please enter a valid 11-digit receiver mobile number');
      return;
    }

    setError('');
    onWithdraw(numAmount, method, accountNumber.trim());
    setIsProcessing(true);
    setCountdown(60);

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div
        id="withdraw-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">Instant Withdraw Winnings</h3>
              <p className="text-xs text-sky-200 font-mono">Available Balance: ৳{user.balance} BDT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {isProcessing ? (
            /* 1-Minute Live Fast Processing Screen */
            <div className="py-6 px-3 text-center space-y-4 font-bengali">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-sky-100 animate-ping opacity-30" />
                <div className="w-20 h-20 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
                <div className="absolute font-orbitron font-black text-lg text-sky-900">
                  {countdown}s
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900 font-rajdhani">
                  ⚡ ১ মিনিটের মধ্যে উইথড্র প্রসেসিং হচ্ছে!
                </h4>
                <p className="text-xs text-slate-500">
                  আপনার <strong className="text-sky-700">{method} ({accountNumber})</strong> নম্বরে <strong>৳{amount}</strong> পাঠানোর প্রক্রিয়া চালু হয়েছে।
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs font-rajdhani">
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>1. উইথড্র রিকোয়েস্ট যাচাই</span>
                  <span>✅ সম্পন্ন</span>
                </div>
                <div className="flex items-center justify-between text-blue-600 font-bold">
                  <span>2. {method} গেটওয়ে সংযোগ</span>
                  <span className="animate-pulse">⏳ প্রসেসিং ({countdown}s)...</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>3. অ্যাডমিন অ্যাক্টিভেশন / ক্যাশ আউট</span>
                  <span>অপেক্ষা করুন</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl font-orbitron cursor-pointer"
              >
                GOT IT (ব্যাকগ্রাউন্ডে চালু রাখুন)
              </button>
            </div>
          ) : success ? (
            <div className="py-6 px-3 text-center space-y-3 font-bengali">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-base text-slate-900 font-orbitron">WITHDRAWAL APPROVED!</h4>
              <p className="text-xs text-slate-600">
                আপনার <strong>৳{amount} BDT</strong> সফলভাবে উইথড্র রিকোয়েস্ট সম্পন্ন হয়েছে।
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl font-orbitron cursor-pointer"
              >
                DONE
              </button>
            </div>
          ) : (
            <>
              {/* Method Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-2">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold font-rajdhani flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        method === m
                          ? 'bg-sky-50 border-sky-600 text-sky-900 ring-2 ring-sky-300'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-black">{m}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">⚡ 1-Min Payout</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Type */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 font-rajdhani uppercase">
                  Account Type:
                </label>
                <div className="flex gap-2">
                  {(['Personal', 'Agent'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold border transition cursor-pointer ${
                        accountType === type
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                    Withdraw Amount (Min: ৳50 BDT)
                  </label>
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
                    placeholder="Enter amount"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                    Receiver {method} ({accountType}) Number
                  </label>
                  <input
                    type="tel"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-2.5 text-xs text-sky-900 font-bengali space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-950">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>⚡ ইনস্ট্যান্ট ১ মিনিটের সুপার-ফাস্ট উইথড্রল</span>
                  </div>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    উইথড্র রিকোয়েস্ট সাবমিট করার ১ মিনিটের মধ্যে অ্যাডমিন আপনার নম্বরে টাকা পাঠিয়ে প্যানেল থেকে <strong>Approve (অ্যাক্টিভ)</strong> করে দিবে।
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-orbitron tracking-wider text-xs shadow-md cursor-pointer transition active:scale-98"
                >
                  ⚡ CONFIRM WITHDRAW (৳{amount || 0})
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
