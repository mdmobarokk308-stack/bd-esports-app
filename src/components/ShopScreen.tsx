import React, { useState } from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, ShieldCheck, Flame, Zap, HelpCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TOPUP_PACKAGES } from '../data/mockData';
import { TopupPackage, User } from '../types';

interface ShopScreenProps {
  user: User;
  onSuccessOrder: (item: TopupPackage, uid: string) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ user, onSuccessOrder }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'diamond' | 'membership' | 'special'>('all');
  const [selectedPackage, setSelectedPackage] = useState<TopupPackage | null>(null);
  const [playerUid, setPlayerUid] = useState(user.freeFireUid || '');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Wallet'>('Wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const filteredPackages = TOPUP_PACKAGES.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerUid.trim() || playerUid.length < 7) {
      alert('Please enter a valid Free Fire Player UID (8-10 digits)');
      return;
    }
    if (!selectedPackage) return;

    if (paymentMethod === 'Wallet' && user.balance < selectedPackage.price) {
      alert('Insufficient wallet balance. Please choose bKash / Nagad or add money to your wallet.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderSuccess(true);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      onSuccessOrder(selectedPackage, playerUid);
    }, 1000);
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-full pb-10 text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-4 py-5 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-black font-orbitron uppercase">
              100% Instant Delivery
            </span>
            <h1 className="text-2xl font-black font-rajdhani tracking-wide mt-1">
              FREE FIRE DIAMOND TOP-UP
            </h1>
            <p className="text-xs text-cyan-200/90 font-bengali">
              সবচেয়ে কম মূল্যে বিকাশ ও নগদ দিয়ে ইউআইডি টপ আপ করুন
            </p>
          </div>
          <div className="text-3xl">💎</div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 pt-3 flex gap-2 overflow-x-auto no-scrollbar max-w-md mx-auto">
        {[
          { id: 'all', label: 'All Packages' },
          { id: 'diamond', label: '💎 Diamonds' },
          { id: 'membership', label: '👑 Membership' },
          { id: 'special', label: '⚡ Special Offers' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-rajdhani whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topup Grid */}
      <div className="px-3 mt-3 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            id={`package-${pkg.id}`}
            onClick={() => {
              setSelectedPackage(pkg);
              setOrderSuccess(false);
            }}
            className="bg-white rounded-2xl border border-slate-300/80 p-3.5 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between relative group"
          >
            {pkg.badge && (
              <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md font-orbitron uppercase shadow-xs">
                {pkg.badge}
              </span>
            )}

            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-2">
                {pkg.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-rajdhani leading-tight">
                {pkg.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{pkg.amount}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-extrabold text-indigo-700 font-mono">
                  ৳{pkg.price}
                </span>
                {pkg.originalPrice && (
                  <span className="text-[10px] text-slate-400 line-through ml-1 font-mono">
                    ৳{pkg.originalPrice}
                  </span>
                )}
              </div>
              <button className="px-2.5 py-1 bg-slate-900 group-hover:bg-indigo-600 text-white text-[11px] font-bold rounded-lg transition font-rajdhani uppercase">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{selectedPackage.icon}</span>
                <div>
                  <h3 className="font-bold font-orbitron text-sm">{selectedPackage.name}</h3>
                  <p className="text-xs text-cyan-300 font-mono">Total Price: ৳{selectedPackage.price} BDT</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {orderSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold font-rajdhani text-slate-900">
                    Order Submitted Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                    আপনার UID: <span className="font-mono font-bold text-indigo-600">{playerUid}</span> এ ৫-১৫ মিনিটের মধ্যে ডায়মন্ড ট্রান্সফার হবে।
                  </p>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold font-orbitron cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePurchase} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                      Free Fire Player UID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerUid}
                      onChange={(e) => setPlayerUid(e.target.value)}
                      placeholder="e.g. 2849182391"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 font-rajdhani uppercase tracking-wider mb-1">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Wallet', label: `Wallet (৳${user.balance})`, color: 'border-indigo-500' },
                        { id: 'bKash', label: 'bKash Instant', color: 'border-pink-500' },
                        { id: 'Nagad', label: 'Nagad Instant', color: 'border-orange-500' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold font-rajdhani transition cursor-pointer ${
                            paymentMethod === m.id
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-400'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item:</span>
                      <span className="font-bold text-slate-800">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payable Amount:</span>
                      <span className="font-extrabold text-indigo-700 font-mono">৳{selectedPackage.price} BDT</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold font-orbitron tracking-wider text-xs shadow-md cursor-pointer hover:opacity-95 transition"
                  >
                    {isProcessing ? 'Processing Order...' : `PAY NOW ৳${selectedPackage.price}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
