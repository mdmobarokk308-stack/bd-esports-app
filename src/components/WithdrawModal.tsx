import React, { useState } from 'react';
import { X, Banknote, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [success, setSuccess] = useState(false);

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

    onWithdraw(numAmount, method, accountNumber.trim());
    setSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => {
      onClose();
    }, 1200);
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
              <h3 className="font-orbitron font-bold text-sm leading-tight">Withdraw Winnings</h3>
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
                  <span className="text-[10px] text-slate-500">Auto Payout</span>
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

          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold text-center font-rajdhani">
              Withdraw request submitted! Funds will arrive within 10-30 minutes.
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
                <span>⚡ ফাস্ট উইথড্রল প্রসেসিং</span>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                উইথড্র রিকোয়েস্ট সাবমিট করার পর অ্যাডমিন আপনার নম্বরে টাকা পাঠিয়ে প্যানেল থেকে <strong>Approve (অ্যাক্টিভ)</strong> করার সাথে সাথে আপনার লেনদেন সম্পন্ন হবে।
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-orbitron tracking-wider text-xs shadow-md cursor-pointer transition active:scale-98"
            >
              CONFIRM WITHDRAW (৳{amount || 0})
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
