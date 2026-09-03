import React, { useMemo } from 'react';
import {
  TrendingUp,
  Gamepad2,
  Users,
  DollarSign,
  Trophy,
  CheckCircle2,
  Clock,
  Radio,
  ArrowRight,
  Zap,
  Target,
  Flame,
} from 'lucide-react';
import { Match, Transaction } from '../../types';

interface AdminTournamentAnalyticsTabProps {
  matches: Match[];
  transactions: Transaction[];
  onNavigateTab: (tab: any) => void;
  onToast: (msg: string) => void;
}

export const AdminTournamentAnalyticsTab: React.FC<AdminTournamentAnalyticsTabProps> = ({
  matches,
  transactions,
  onNavigateTab,
}) => {
  // Calculations
  const totalMatchesCount = matches.length;
  const totalJoinedSlots = useMemo(() => {
    return matches.reduce((acc, m) => acc + (m.joinedPlayers?.length || 0), 0);
  }, [matches]);

  const totalMaxSlots = useMemo(() => {
    return matches.reduce((acc, m) => acc + (m.totalSlots || 0), 0);
  }, [matches]);

  const totalRevenue = useMemo(() => {
    return matches.reduce((acc, m) => acc + ((m.joinedPlayers?.length || 0) * (m.entryFee || 0)), 0);
  }, [matches]);

  const totalPrizeCommitted = useMemo(() => {
    return matches.reduce((acc, m) => acc + (m.totalPrizePool || m.winPrize || 0), 0);
  }, [matches]);

  const estimatedProfit = useMemo(() => {
    return Math.round(totalRevenue * 0.25);
  }, [totalRevenue]);

  const liveMatches = matches.filter((m) => m.status === 'ongoing');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  // Deposit stats
  const approvedDeposits = transactions.filter(
    (t) => t.type === 'deposit' && (t.status === 'approved' || t.status === 'completed')
  );
  const totalDepositAmount = approvedDeposits.reduce((acc, t) => acc + (t.amount || 0), 0);
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; players: number; revenue: number; maxSlots: number }> = {};
    matches.forEach((m) => {
      const cat = m.category || 'BR Match';
      if (!map[cat]) {
        map[cat] = { count: 0, players: 0, revenue: 0, maxSlots: 0 };
      }
      map[cat].count += 1;
      map[cat].players += m.joinedPlayers?.length || 0;
      map[cat].revenue += (m.joinedPlayers?.length || 0) * (m.entryFee || 0);
      map[cat].maxSlots += m.totalSlots || 0;
    });
    return map;
  }, [matches]);

  return (
    <div className="space-y-4 font-['Rajdhani',sans-serif]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-black flex-shrink-0">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-black font-orbitron text-amber-400 uppercase tracking-wide">
                Tournament Analytics & Revenue
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bengali">
              ম্যাচ ফি কালেকশন, রেজিস্ট্রেশন রিপোর্ট এবং আয়-ব্যয় পরিসংখ্যান
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('matches')}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Matches</span>
          </button>
        </div>
      </div>

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Matches */}
        <div className="bg-slate-950/90 border border-amber-500/30 p-3.5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Matches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-amber-400 block">
            {totalMatchesCount}
          </span>
          <span className="text-[10px] text-slate-500 font-bengali block mt-1">
            সর্বমোট টুর্নামেন্ট অনুষ্ঠিত
          </span>
        </div>

        {/* Player Registrations */}
        <div className="bg-slate-950/90 border border-cyan-500/30 p-3.5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Registrations</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-cyan-400 block">
            {totalJoinedSlots}
          </span>
          <span className="text-[10px] text-slate-500 font-bengali block mt-1">
            মোট প্লেয়ার স্লট পূরণ ({totalMaxSlots > 0 ? Math.round((totalJoinedSlots / totalMaxSlots) * 100) : 0}%)
          </span>
        </div>

        {/* Entry Fee Collection */}
        <div className="bg-slate-950/90 border border-emerald-500/30 p-3.5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Entry Fee Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-emerald-400 block">
            ৳{totalRevenue}
          </span>
          <span className="text-[10px] text-slate-500 font-bengali block mt-1">
            মোট এন্ট্রি ফি কালেকশন
          </span>
        </div>

        {/* Estimated Profit */}
        <div className="bg-slate-950/90 border border-violet-500/30 p-3.5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Estimated Profit</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-violet-400 block">
            ৳{estimatedProfit}
          </span>
          <span className="text-[10px] text-violet-300 font-mono block mt-1">
            ~২৫% নিট আয় মার্জিন
          </span>
        </div>
      </div>

      {/* Match Status Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Live Matches</span>
              <span className="text-lg font-black font-orbitron text-red-400">{liveMatches.length}</span>
            </div>
          </div>
          <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-mono">এখন চলছে</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Upcoming Matches</span>
              <span className="text-lg font-black font-orbitron text-amber-400">{upcomingMatches.length}</span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono">রেজিস্ট্রেশন ওপেন</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Completed Matches</span>
              <span className="text-lg font-black font-orbitron text-emerald-400">{completedMatches.length}</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono">রেজাল্ট পাবলিশড</span>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs sm:text-sm font-bold text-slate-200 font-orbitron flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Category-wise Tournament Breakdown</span>
          </h5>
          <span className="text-[10px] text-slate-400 font-mono">
            {Object.keys(categoryStats).length} Categories Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-rajdhani text-[11px] uppercase">
                <th className="pb-2 font-bold">Category</th>
                <th className="pb-2 font-bold text-center">Matches</th>
                <th className="pb-2 font-bold text-center">Players Joined</th>
                <th className="pb-2 font-bold text-right">Fee Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Object.keys(categoryStats).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 font-bengali">
                    কোনো ম্যাচ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                Object.entries(categoryStats).map(([cat, stats]) => (
                  <tr key={cat} className="hover:bg-slate-900/50 transition">
                    <td className="py-2.5 font-bold text-slate-200 font-rajdhani">
                      <span className="text-amber-400 mr-1.5">●</span>
                      {cat}
                    </td>
                    <td className="py-2.5 text-center text-slate-300">{stats.count}</td>
                    <td className="py-2.5 text-center text-cyan-400">{stats.players}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">৳{stats.revenue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit & Wallet Overview */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Deposit Requests Summary
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg font-black font-orbitron text-emerald-400">
              ৳{totalDepositAmount} <span className="text-xs font-normal text-slate-400">(অ্যাপ্রুভড)</span>
            </span>
            {pendingDeposits.length > 0 && (
              <span className="text-xs font-mono bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                {pendingDeposits.length} Pending
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('deposits')}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
        >
          <span>View Deposits Tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pro Tips For Increasing Profit */}
      <div className="bg-slate-950/90 border border-amber-500/30 p-4 rounded-2xl space-y-2.5 font-bengali text-xs">
        <h5 className="font-bold text-amber-400 font-orbitron text-sm flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>💡 টুর্নামেন্ট লাভ ও প্লেয়ার বাড়ানোর ট্রিকস:</span>
        </h5>
        <ul className="list-disc list-inside text-slate-300 space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-amber-300">এন্ট্রি ফি ভ্যারাইটি:</strong> প্রতিদিন অন্তত ৩টি ভিন্ন এন্ট্রি ফি-এর ম্যাচ রাখুন (যেমন: ৳১০, ৳২০ ও ৳৫০)। এতে সাধারণ ও প্রিমিয়াম দুই শ্রেণির প্লেয়ারই খেলবে।
          </li>
          <li>
            <strong className="text-cyan-300">দ্রুত রুম কোড প্রদান:</strong> ম্যাচ শুরুর ১০ মিনিট আগেই রুম কোড এবং পাসওয়ার্ড অ্যাডমিন প্যানেল থেকে পাঠিয়ে দিন।
          </li>
          <li>
            <strong className="text-emerald-300">তাৎক্ষণিক ডিপোজিট অনুমোদন:</strong> ডিপোজিট রিকোয়েস্ট ৩ মিনিটের মধ্যে অ্যাপ্রুভ করলে প্লেয়ারদের বিশ্বস্ততা বহুগুণ বৃদ্ধি পায়।
          </li>
          <li>
            <strong className="text-violet-300">উইকেন্ড মেগা টুর্নামেন্ট:</strong> প্রতি শুক্রবার বা শনিবার ১০০০+ টাকা প্রাইজপুলের বিগ টুর্নামেন্ট আয়োজন করে ফেসবুক/টেলিগ্রামে শেয়ার করুন।
          </li>
        </ul>
      </div>
    </div>
  );
};
