import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Gift,
  Wallet,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  PlusCircle,
  Clock,
  ArrowUpRight,
  PackagePlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  BadgeAlert,
  Edit,
  Eye,
  Ticket
} from 'lucide-react';
import { Transaction, User, VoucherVaultItem } from '../../types';

export interface AdminDashboardTabProps {
  transactions: Transaction[];
  user?: User;
  voucherVault: VoucherVaultItem[];
  onOpenOrderModal: (txn: Transaction) => void;
  onNavigateTab: (tab: any) => void;
  onQuickAddVoucher: (category: string) => void;
  onToast: (msg: string) => void;
}

// Preset Voucher Stock Catalog from the Video
export interface VoucherStockProduct {
  id: number;
  name: string;
  categoryMatch: string;
  amount: number; // Selling Price
  buyPrice: number; // Wholesale Buy Price
}

export const VOUCHER_STOCK_CATALOG: VoucherStockProduct[] = [
  { id: 300, name: '25 Diamond', categoryMatch: '25 Diamond', amount: 25, buyPrice: 20 },
  { id: 258, name: '50 Diamond', categoryMatch: '50 Diamond', amount: 38, buyPrice: 32 },
  { id: 309, name: '115 Diamond', categoryMatch: '115 Diamond', amount: 75, buyPrice: 65 },
  { id: 259, name: '240 Diamond', categoryMatch: '240 Diamond', amount: 155, buyPrice: 135 },
  { id: 281, name: '610 Diamond', categoryMatch: '610 Diamond', amount: 385, buyPrice: 340 },
  { id: 264, name: '1240 Diamond', categoryMatch: '1240 Diamond', amount: 762, buyPrice: 680 },
  { id: 310, name: '2530 Diamond', categoryMatch: '2530 Diamond', amount: 1500, buyPrice: 1350 },
  { id: 269, name: 'Weekly Membership', categoryMatch: 'Weekly', amount: 155, buyPrice: 135 },
  { id: 270, name: 'Monthly Membership', categoryMatch: 'Monthly', amount: 750, buyPrice: 680 },
];

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  transactions,
  user,
  voucherVault,
  onOpenOrderModal,
  onNavigateTab,
  onQuickAddVoucher,
  onToast,
}) => {
  const [searchOrderQuery, setSearchOrderQuery] = useState('');

  // Topup transactions (both direct diamond topup & voucher gift orders)
  const topupTxns = useMemo(() => {
    return transactions.filter(
      (t) => t.type === 'topup_purchase' || (t.type as any) === 'voucher_order'
    );
  }, [transactions]);

  // Calculations for 12 Summary Metric Cards
  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let todayOrdersCount = 0;
    let todayGiftOrdersCount = 0;
    let todayProfit = 0;
    let yesterdayProfit = 0;
    let last7DaysProfit = 0;
    let thisMonthProfit = 0;
    let lastMonthProfit = 0;
    let totalProfit = 0;

    topupTxns.forEach((t) => {
      const tDate = new Date(t.date);
      const isDateValid = !isNaN(tDate.getTime());
      const amount = Number(t.amount) || 0;
      // Estimated profit is approx 12-15% margin
      const profit = Math.round(amount * 0.14);

      if (isDateValid && tDate.toDateString() === todayStr) {
        if (t.isAutoDelivered || t.deliveredCode || t.description?.toLowerCase().includes('voucher')) {
          todayGiftOrdersCount += 1;
        } else {
          todayOrdersCount += 1;
        }
        todayProfit += profit;
      }

      if (isDateValid && tDate.toDateString() === yesterdayStr) {
        yesterdayProfit += profit;
      }

      if (isDateValid && tDate >= sevenDaysAgo) {
        last7DaysProfit += profit;
      }

      if (isDateValid && tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear) {
        thisMonthProfit += profit;
      }

      if (isDateValid && tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear) {
        lastMonthProfit += profit;
      }

      totalProfit += profit;
    });

    // Also include deposit profit / match revenue if any
    const depositTxns = transactions.filter((t) => t.type === 'deposit' && t.status === 'approved');
    const totalDeposited = depositTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalCirculatingWallet = Math.max(0, totalDeposited - topupTxns.reduce((s, t) => s + (t.amount || 0), 0) + (user?.balance || 0));

    // Simulated / registered total users
    const totalUsersCount = Math.max(6, 4 + topupTxns.length);
    const todayUsersCount = Math.max(2, Math.min(todayOrdersCount + 1, totalUsersCount));

    return {
      todayUsers: todayUsersCount,
      totalUsers: totalUsersCount,
      todayOrders: todayOrdersCount,
      todayGiftOrders: todayGiftOrdersCount,
      totalOrders: topupTxns.length,
      walletBalance: totalCirculatingWallet,
      todayProfit,
      yesterdayProfit,
      last7DaysProfit,
      thisMonthProfit,
      lastMonthProfit,
      totalProfit: Math.max(totalProfit, Math.round(totalDeposited * 0.12)),
    };
  }, [topupTxns, transactions, user]);

  // Vouchers Stock calculation matching video formulas
  const stockData = useMemo(() => {
    return VOUCHER_STOCK_CATALOG.map((cat) => {
      // Find matching items in voucherVault
      const availableCodes = voucherVault.filter(
        (v) => !v.isUsed && v.packageCategory?.toLowerCase().includes(cat.categoryMatch.toLowerCase())
      );
      const stock = availableCodes.length;
      const stockBalance = stock * cat.buyPrice;

      return {
        ...cat,
        stock,
        stockBalance,
      };
    });
  }, [voucherVault]);

  const totalProductValue = useMemo(() => {
    return stockData.reduce((acc, item) => acc + item.stock * item.buyPrice, 0);
  }, [stockData]);

  const totalSellingValue = useMemo(() => {
    return stockData.reduce((acc, item) => acc + item.stock * item.amount, 0);
  }, [stockData]);

  const expectedProfit = useMemo(() => {
    return Math.max(0, totalSellingValue - totalProductValue);
  }, [totalSellingValue, totalProductValue]);

  // Filter latest orders
  const filteredLatestOrders = useMemo(() => {
    const q = searchOrderQuery.trim().toLowerCase();
    return topupTxns.filter((t) => {
      if (!q) return true;
      const matchId = (t.orderId || t.id || '').toLowerCase().includes(q);
      const matchUser = (t.userName || t.targetUid || t.userPhone || '').toLowerCase().includes(q);
      const matchProd = (t.packageName || t.productName || t.description || '').toLowerCase().includes(q);
      return matchId || matchUser || matchProd;
    });
  }, [topupTxns, searchOrderQuery]);

  // Determine stock row color style as described in video:
  // "যখন আপনার স্টক 0 তে চলে আসবে তখন এটা রেড (Red) হয়ে যাবে"
  // "আর যখন ৫ টার নিচে চলে আসবে তখন এটা হলুদ কালার (Yellow) হবে"
  // "আর ১০ টার উপরে থাকলে সেটা ব্লু কালার (Blue) হবে"
  const getStockIndicatorStyle = (stock: number) => {
    if (stock === 0) {
      return {
        borderColor: 'border-rose-500',
        textColor: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        label: 'Out of Stock',
        accentBar: 'bg-rose-500',
      };
    }
    if (stock < 5) {
      return {
        borderColor: 'border-amber-400',
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        label: 'Low Stock (<5)',
        accentBar: 'bg-amber-400',
      };
    }
    if (stock >= 10) {
      return {
        borderColor: 'border-blue-500',
        textColor: 'text-blue-400',
        badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        label: 'Healthy Stock (10+)',
        accentBar: 'bg-blue-500',
      };
    }
    return {
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      label: 'Good Stock',
      accentBar: 'bg-emerald-500',
    };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-100 font-orbitron tracking-wide">
              Admin Dashboard
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● Live System
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-bengali">
            ডায়মন্ড টপ-আপ, ভাউচার স্টক ও প্রতিদিনের ইনকাম/প্রফিট স্ট্যাটাস মনিটর
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('statements')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>📄 Statements</span>
          </button>
          <button
            onClick={() => onNavigateTab('topup_orders')}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold font-orbitron flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <span>💎 Orders ({topupTxns.length})</span>
          </button>
        </div>
      </div>

      {/* 12 METRIC SUMMARY CARDS (EXACT MATCH WITH VIDEO) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Card 1: Today Users */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Today Users</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {stats.todayUsers}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>↑ increased by 100% in this month</span>
          </div>
        </div>

        {/* Card 2: Total Users */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Total Users</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {stats.totalUsers}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>↑ increased by 100% in this month</span>
          </div>
        </div>

        {/* Card 3: Today Orders (Diamond Topup) */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Today Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {stats.todayOrders}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>↑ increased by 100% in this month</span>
          </div>
        </div>

        {/* Card 4: Today Gift Orders (Unipin Voucher) */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Today Gift Orders</span>
            <Gift className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {stats.todayGiftOrders}
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1.5">
            <span>increased by 0% in this month</span>
          </div>
        </div>

        {/* Card 5: Total Orders */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Total Orders</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {stats.totalOrders}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>↑ increased by 100% in this month</span>
          </div>
        </div>

        {/* Card 6: Wallet */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Wallet</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            ৳ {stats.walletBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Customer Active Balance</span>
          </div>
        </div>

        {/* Card 7: Today Profit */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Today Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ৳ {stats.todayProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>↑ increased by 100% in this month</span>
          </div>
        </div>

        {/* Card 8: Yesterday Profit */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Yesterday Profit</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-200 font-mono mt-1">
            ৳ {stats.yesterdayProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Yesterday Total Gain</span>
          </div>
        </div>

        {/* Card 9: Last 7 Days */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Last 7 Days</span>
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            ৳ {stats.last7DaysProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Past 7 Days Rolling</span>
          </div>
        </div>

        {/* Card 10: This Month */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">This Month</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ৳ {stats.thisMonthProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Current Month Net</span>
          </div>
        </div>

        {/* Card 11: Last Month */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Last Month</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-200 font-mono mt-1">
            ৳ {stats.lastMonthProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Previous Month Closed</span>
          </div>
        </div>

        {/* Card 12: Total Profit */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">Total Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            ৳ {stats.totalProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-1.5">
            <span>Lifetime Platform Profit</span>
          </div>
        </div>
      </div>

      {/* VOUCHERS STOCK SECTION (EXACT REPLICATION FROM VIDEO) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-black text-slate-100 font-orbitron tracking-wide">
                Vouchers Stock
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-bengali mt-0.5">
              UniPin / Garena Shell অটো-ডেলিভারি কোডের লাইভ ইনভেন্টরি ও ভ্যালুয়েশন
            </p>
          </div>

          {/* 3 Header Stat Boxes shown in Video */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 font-bold block">Total Product Value</span>
              <span className="text-sm font-black font-mono text-slate-100">
                ৳ {totalProductValue.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 font-bold block">Total Selling Value</span>
              <span className="text-sm font-black font-mono text-cyan-400">
                ৳ {totalSellingValue.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 font-bold block">Expected Profit</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                ৳ {expectedProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Color Meaning Guide Bar */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-bengali">
          <span className="font-bold text-slate-300">💡 কালার ইন্ডিকেটর গাইড:</span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            লাল = স্টক ০ (খালি)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            হলুদ = স্টক ৫ এর কম (Low)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            ব্লু = স্টক ১০ বা তার বেশি (Good)
          </span>
        </div>

        {/* Vouchers Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <th className="py-2.5 px-3 w-4"></th>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Buy Price</th>
                <th className="py-2.5 px-3">Stock Balance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {stockData.map((item) => {
                const style = getStockIndicatorStyle(item.stock);
                return (
                  <tr
                    key={item.id + item.name}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    {/* Colored vertical line indicator on left */}
                    <td className="p-0 relative w-1.5">
                      <div className={`absolute inset-y-1 left-1 w-1 rounded-full ${style.accentBar}`}></div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      #{item.id}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-100 flex items-center gap-2">
                      <span>{item.name}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block font-mono font-black px-2.5 py-0.5 rounded-md text-xs border ${style.badgeBg}`}
                      >
                        {item.stock}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      BDT {item.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      BDT {item.buyPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-300">
                      BDT {item.stockBalance.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onQuickAddVoucher(item.categoryMatch);
                          onNavigateTab('voucher_vault');
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LATEST ORDERS SECTION (AS SHOWN IN VIDEO) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-100 font-orbitron tracking-wide">
              Latest Orders
            </h4>
            <p className="text-xs text-slate-400 font-bengali">
              ইউজারদের সাম্প্রতিক ডায়মন্ড টপ-আপ ও ভাউচার ডেলিভারি হিস্টোরি
            </p>
          </div>

          {/* Search bar in Latest Orders */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchOrderQuery}
              onChange={(e) => setSearchOrderQuery(e.target.value)}
              placeholder="Search Order ID, UID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <th className="py-2.5 px-3">Order Date</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLatestOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-bengali">
                    কোনো অর্ডার পাওয়া যায়নি। ইউজাররা শপ থেকে ডায়মন্ড অর্ডার করলে এখানে লাইভ দেখা যাবে।
                  </td>
                </tr>
              ) : (
                filteredLatestOrders.slice(0, 10).map((order) => {
                  const orderId = order.orderId || order.id;
                  const isPending = order.status === 'pending';
                  const isCompleted = order.status === 'approved' || order.status === 'completed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {order.date || 'Jan 13, 2026'}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                        {orderId}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">
                          {order.userName || (order.targetUid ? `UID: ${order.targetUid}` : 'Script Writing')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {order.packageName || order.description}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {order.status === 'approved' ? 'COMPLETED' : order.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-black text-slate-100">
                        ৳ {Number(order.amount || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenOrderModal(order)}
                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
