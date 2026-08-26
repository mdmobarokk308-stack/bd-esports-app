import React, { useState } from 'react';
import { X, Copy, Check, Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, User } from '../types';

interface WalletModalProps {
  user: User;
  transactions: Transaction[];
  onClose: () => void;
  onDeposit: (amount: number, method: 'bKash' | 'Nagad' | 'Rocket', sender: string, trxId: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  user,
  transactions,
  onClose,
  onDeposit,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState('100');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const paymentNumbers = {
    bKash: '01799988877',
    Nagad: '01899988877',
    Rocket: '019999888775',
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumbers[selectedMethod]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      setError('Minimum deposit amount is 10 BDT');
      return;
    }
    if (!senderNumber.trim() || senderNumber.length < 11) {
      setError('Please enter your 11-digit sender phone number');
      return;
    }
    if (!trxId.trim() || trxId.length < 5) {
      setError('Please enter the valid Transaction ID (TrxID)');
      return;
    }

    onDeposit(numAmount, selectedMethod, senderNumber.trim(), trxId.trim());
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
        id="wallet-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm leading-tight">My Tournament Wallet</h3>
              <p className="text-xs text-cyan-300 font-mono">Current Balance: ৳{user.balance} BDT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-2">
              Select Deposit Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'Nagad', 'Rocket'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold font-rajdhani flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    selectedMethod === method
                      ? method === 'bKash'
                        ? 'bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-300'
                        : method === 'Nagad'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-2 ring-orange-300'
                        : 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm font-black">
                    {method === 'bKash' ? 'bKash' : method === 'Nagad' ? 'Nagad' : 'Rocket'}
                  </span>
                  <span className="text-[10px] text-slate-500">Send Money</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Number Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{selectedMethod} Personal (Send Money)</span>
              <span className="text-emerald-400 font-semibold">Active Number</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-amber-300 tracking-wider">
                {paymentNumbers[selectedMethod]}
              </span>
              <button
                onClick={handleCopyNumber}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-rajdhani font-bold flex items-center gap-1 transition cursor-pointer text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Bangla Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-bengali leading-relaxed">
            📌 উপরের নাম্বারে <span className="font-bold">{selectedMethod} Send Money</span> করে নিচের ফর্মে আপনার মোবাইল নাম্বার ও TrxID লিখে সাবমিট করুন।
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold text-center font-rajdhani">
              Deposit submitted successfully! Balance added to wallet.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                Deposit Amount (BDT)
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sender Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                Sender {selectedMethod} Number (11 Digit)
              </label>
              <input
                type="tel"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 017XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* TrxID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase mb-1">
                Transaction ID (TrxID)
              </label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                placeholder="e.g. BKS9876543"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold font-orbitron tracking-wider text-xs shadow-md cursor-pointer transition active:scale-98"
            >
              VERIFY & ADD MONEY (৳{amount || 0})
            </button>
          </form>

          {/* Recent Transactions list */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold font-rajdhani uppercase text-slate-500 mb-2">
              Recent Transactions
            </h4>
            <div className="space-y-1.5">
              {transactions.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {t.type === 'deposit' || t.type === 'match_prize' ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-800 block">{t.description}</span>
                      <span className="text-[10px] text-slate-400">{t.date}</span>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      t.type === 'deposit' || t.type === 'match_prize' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'deposit' || t.type === 'match_prize' ? '+' : '-'}৳{t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
