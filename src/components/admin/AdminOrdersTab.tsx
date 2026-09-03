import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Eye,
  Trash2,
  Save,
  X,
  Copy,
  Check,
  Gem,
  Send,
  ArrowLeft,
  RotateCcw,
  Zap
} from 'lucide-react';
import { OrderStatus, Transaction, VoucherVaultItem } from '../../types';

export interface AdminOrdersTabProps {
  transactions: Transaction[];
  voucherVault: VoucherVaultItem[];
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    deliveryMessage?: string,
    deliveredCode?: string
  ) => void;
  onDeleteOrder: (orderId: string) => void;
  onToast: (msg: string) => void;
  onNavigateTab?: (tab: any) => void;
  initialSelectedOrder?: Transaction | null;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  transactions,
  voucherVault,
  onUpdateOrderStatus,
  onDeleteOrder,
  onToast,
  onNavigateTab,
  initialSelectedOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'completed' | 'processing' | 'hold' | 'pending' | 'cancelled' | 'auto_processing'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState<Transaction | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (initialSelectedOrder) {
      handleOpenEdit(initialSelectedOrder);
    }
  }, [initialSelectedOrder]);

  // Filter top-up orders
  const orders = useMemo(() => {
    return transactions.filter(
      (t) => t.type === 'topup_purchase' || (t.type as any) === 'voucher_order'
    );
  }, [transactions]);

  // Summary Metrics
  const openOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === 'pending' ||
        o.status === 'processing' ||
        o.status === 'hold' ||
        o.status === 'auto_processing' ||
        o.status === 'looking_by_admin'
    ).length;
  }, [orders]);

  const averagePrice = useMemo(() => {
    if (orders.length === 0) return 0;
    const totalAmount = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    return Math.round(totalAmount / orders.length);
  }, [orders]);

  // Filtered List based on tab and search
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'completed') {
          if (o.status !== 'approved' && o.status !== 'completed') return false;
        } else if (filterStatus === 'cancelled') {
          if (o.status !== 'rejected' && o.status !== 'cancelled') return false;
        } else if (filterStatus === 'processing') {
          if (o.status !== 'processing') return false;
        } else if (filterStatus === 'hold') {
          if (o.status !== 'hold') return false;
        } else if (filterStatus === 'pending') {
          if (o.status !== 'pending') return false;
        } else if (filterStatus === 'auto_processing') {
          if (o.status !== 'auto_processing') return false;
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (o.orderId || o.id || '').toLowerCase().includes(q);
        const userMatch = (o.userName || o.targetUid || o.userPhone || '').toLowerCase().includes(q);
        const prodMatch = (o.packageName || o.productName || o.description || '').toLowerCase().includes(q);
        return idMatch || userMatch || prodMatch;
      }

      return true;
    });
  }, [orders, filterStatus, searchQuery]);

  const handleOpenEdit = (order: Transaction) => {
    setEditingOrder(order);
    let mappedStatus: OrderStatus = order.status;
    if (mappedStatus === 'approved') mappedStatus = 'completed';
    if (mappedStatus === 'rejected') mappedStatus = 'cancelled';
    setEditStatus(mappedStatus);
    setDeliveryMessage(order.deliveryMessage || '');
    setVoucherCodeInput(order.deliveredCode || '');
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    const targetId = editingOrder.orderId || editingOrder.id;
    onUpdateOrderStatus(targetId, editStatus, deliveryMessage, voucherCodeInput);
    onToast(`✅ অর্ডার #${targetId} সফলভাবে আপডেট করা হয়েছে!`);
    setEditingOrder(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
    onToast(`📋 ${label} কপি করা হয়েছে!`);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
            COMPLETED
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            PROCESSING
          </span>
        );
      case 'hold':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            HOLD
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
            CANCELLED
          </span>
        );
      case 'auto_processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
            AUTO PROCESSING
          </span>
        );
      case 'looking_by_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            LOOKING BY ADMIN
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            PENDING
          </span>
        );
    }
  };

  // If in Edit mode, render the full Edit Order Details screen matching video timestamp 01:51!
  if (editingOrder) {
    const orderId = editingOrder.orderId || editingOrder.id;
    return (
      <div className="space-y-5 font-sans">
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <button
              onClick={() => setEditingOrder(null)}
              className="hover:text-cyan-400 flex items-center gap-1 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orders</span>
            </button>
            <span>›</span>
            <span className="text-slate-200 font-bold">Edit</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`আপনি কি অর্ডার #${orderId} ডিলিট করতে চান?`)) {
                onDeleteOrder(orderId);
                setEditingOrder(null);
              }
            }}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Edit Order Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-slate-100 font-orbitron tracking-wide">
                Edit Order
              </h3>
              <p className="text-xs text-slate-400 font-bengali mt-0.5">
                ডায়মন্ড ডেলিভারি স্ট্যাটাস পরিবর্তন করুন ও প্লেয়ারকে ডেলিভারি কোড/মেসেজ পাঠান
              </p>
            </div>
            <div>{getStatusBadge(editingOrder.status)}</div>
          </div>

          {/* Order Details Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-mono block">Order ID</span>
              <span className="text-sm font-black font-mono text-cyan-400 mt-0.5 block flex items-center gap-1">
                {orderId}
                <button
                  onClick={() => handleCopy(orderId, 'Order ID')}
                  className="text-slate-500 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-mono block">Order Date</span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-1 block">
                {editingOrder.date || 'Jan 13, 2026 12:52:12 AM'}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-mono block">Amount</span>
              <span className="text-base font-black font-mono text-emerald-400 mt-0.5 block">
                BDT {Number(editingOrder.amount || 0).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-mono block">Current Status</span>
              <span className="text-xs font-bold font-mono text-slate-200 mt-1 block uppercase">
                {editingOrder.status}
              </span>
            </div>
          </div>

          {/* Status Dropdown Selector (Matching Video Options) */}
          <div className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Status Selection
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
              className="w-full sm:w-80 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="hold">Hold</option>
              <option value="cancelled">Cancelled</option>
              <option value="looking_by_admin">Looking By Admin</option>
              <option value="auto_processing">Auto Processing</option>
            </select>
            <p className="text-[11px] text-slate-400 font-bengali">
              ডায়মন্ড ডেলিভারি সম্পন্ন হলে <strong>Completed</strong> সিলেক্ট করুন।
            </p>
          </div>

          {/* Account Info Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Account Info
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 w-1/3">Name</th>
                    <th className="py-2.5 px-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="py-2.5 px-4 font-mono text-slate-400">Order ID</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">{orderId}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono text-slate-400">User / Player</td>
                    <td className="py-2.5 px-4 font-bold">{editingOrder.userName || 'Script Writing'}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono text-slate-400">Player UID</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-400 flex items-center gap-2">
                      <span>{editingOrder.targetUid || '853241'}</span>
                      {editingOrder.targetUid && (
                        <button
                          onClick={() => handleCopy(editingOrder.targetUid!, 'Player UID')}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 font-mono"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy UID</span>
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono text-slate-400">Product / Package</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">
                      {editingOrder.packageName || editingOrder.productName || 'FREE FIRE 115 DIAMOND'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono text-slate-400">Support Pin</td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">
                      {editingOrder.supportPin || '853241'}
                    </td>
                  </tr>
                  {editingOrder.deliveredCode && (
                    <tr>
                      <td className="py-2.5 px-4 font-mono text-slate-400">Voucher Code / PIN</td>
                      <td className="py-2.5 px-4 font-mono font-black text-amber-300">
                        {editingOrder.deliveredCode}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Message Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              Delivery Message (প্লেয়ারকে পাঠানোর মেসেজ বা কোড)
            </label>
            <textarea
              rows={3}
              value={deliveryMessage}
              onChange={(e) => setDeliveryMessage(e.target.value)}
              placeholder="যেমন: আপনার ফ্রি ফায়ার আইডিতে ১১৫ ডায়মন্ড সফলভাবে পাঠিয়ে দেওয়া হয়েছে! অথবা ভাউচার পিন..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans placeholder-slate-600"
            />
          </div>

          {/* Quick 1-Click Official Portals */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 font-mono block">
              ⚡ 1-Click Official Top-up Portals:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href="https://www.unipin.com/bd/garena/free-fire"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition"
              >
                <span>UniPin BD</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://shop.garena.my"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5 transition"
              >
                <span>Garena Shop</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.codashop.com/en-bd/free-fire"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition col-span-2 sm:col-span-1"
              >
                <span>Codashop</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Save Changes & Cancel Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleSaveEdit}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black font-orbitron flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save changes</span>
            </button>

            <button
              onClick={() => setEditingOrder(null)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular Orders List View (Timestamp 01:44 in Video)
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-black text-slate-100 font-orbitron tracking-wide">
              Orders
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-bengali">
            ডায়মন্ড টপ-আপ, প্যাকেজ ও গিফট ভাউচার অর্ডার পরিচালনা ও ডেলিভারি তালিকা
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* TOP 3 STAT CARDS (EXACT MATCH WITH VIDEO TIMESTAMP 01:44) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Orders */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 tracking-wider block">Orders</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {orders.length}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">
            ↑ increased by 100% in this month
          </div>
        </div>

        {/* Card 2: Open Orders */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 tracking-wider block">Open orders</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {openOrdersCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Pending / Processing
          </div>
        </div>

        {/* Card 3: Average Price */}
        <div className="bg-slate-900/90 border-t-2 border-t-emerald-500 border-x border-b border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 tracking-wider block">Average price</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {averagePrice > 0 ? averagePrice.toFixed(2) : '3,500.00'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Average ticket value (BDT)
          </div>
        </div>
      </div>

      {/* FILTER STATUS TABS (ALL, COMPLETED, PROCESSING, HOLD, PENDING, CANCELLED, AUTO PROCESSING) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'completed', label: 'Completed' },
          { id: 'processing', label: 'Processing' },
          { id: 'hold', label: 'Hold' },
          { id: 'pending', label: 'Pending' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'auto_processing', label: 'Auto processing' },
        ].map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR & CONTROLS */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, UID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
          Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">User</th>
                <th className="py-3 px-3.5">Product</th>
                <th className="py-3 px-3.5">Variation</th>
                <th className="py-3 px-3.5">Amount</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-bengali">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = order.orderId || order.id;
                  const variation = order.variation || order.packageName || '115 DIAMOND';
                  const product = order.productName || 'FREE FIRE';

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-cyan-400">
                        {orderId}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-200">
                          {order.userName || (order.targetUid ? `UID: ${order.targetUid}` : 'Script Writing')}
                        </div>
                        {order.targetUid && (
                          <div className="text-[10px] text-amber-400 font-mono">
                            UID: {order.targetUid}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 font-bold text-slate-300">
                        {product}
                      </td>

                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">
                        {variation}
                      </td>

                      <td className="py-3 px-3.5 font-mono font-black text-slate-100">
                        {Number(order.amount || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-3.5">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`অর্ডার #${orderId} ডিলিট করতে চান?`)) {
                                onDeleteOrder(orderId);
                              }
                            }}
                            className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
