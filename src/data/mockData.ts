import { AppNotice, AppNotification, Match, MatchCategory, TopPlayer, TopupPackage, Transaction, User } from '../types';
import brMatchImg from '../assets/images/ff_br_match_1787743504248.jpg';
import brSurvivalImg from '../assets/images/ff_br_survival_1787743527330.jpg';
import clashSquadImg from '../assets/images/ff_clash_squad_1787743547043.jpg';
import cs2v2Img from '../assets/images/ff_cs_2v2_1787743564062.jpg';
import loneWolfImg from '../assets/images/ff_lone_wolf_1787743592051.jpg';
import freeMatchImg from '../assets/images/ff_free_match_1787743614766.jpg';

export const INITIAL_USER: User = {
  id: 'user_1',
  username: 'mdmobarok15',
  email: 'mdmobarok308@gmail.com',
  phone: '01612456053',
  balance: 0,
  matchesJoined: 0,
  totalWon: 0,
  freeFireUid: '',
  freeFireIgn: '',
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
};

export const MATCH_CATEGORIES: MatchCategory[] = [
  {
    id: 'br_match',
    title: 'BR MATCH',
    subtitle: 'Battle Royale Full Map',
    image: brMatchImg,
    matchCount: 0,
  },
  {
    id: 'br_survival',
    title: 'BR SURVIVAL',
    subtitle: 'Solo Survival Tournament',
    image: brSurvivalImg,
    matchCount: 0,
  },
  {
    id: 'clash_squad',
    title: 'Clash Squad',
    subtitle: '4 vs 4 Intense Clash',
    image: clashSquadImg,
    matchCount: 0,
  },
  {
    id: 'cs_2v2',
    title: 'CS 2 VS 2',
    subtitle: 'Duo vs Duo Fast Action',
    image: cs2v2Img,
    matchCount: 0,
  },
  {
    id: 'lone_wolf',
    title: 'LONE WOLF',
    subtitle: '1 vs 1 Pure Skill',
    image: loneWolfImg,
    matchCount: 0,
  },
  {
    id: 'free_match',
    title: 'Free Match',
    subtitle: 'Daily Free Giveaways',
    image: freeMatchImg,
    matchCount: 0,
    tag: 'FREE',
  },
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'm-1687',
    title: 'SOLO RUSH | BERMUDA',
    category: 'lone_wolf',
    categoryLabel: 'SPECIAL MATCH',
    entryType: 'Solo',
    scheduleTime: 'Today at 08:00 PM',
    winPrize: 30,
    entryFee: 20,
    perKill: 0,
    map: 'Bermuda',
    version: 'MOBILE',
    totalSlots: 2,
    joinedPlayers: [],
    status: 'upcoming',
    roomId: '',
    roomPass: '',
  },
];

export const TOPUP_PACKAGES: TopupPackage[] = [
  {
    id: 'topup-1',
    name: '115 Diamonds',
    amount: '115 💎',
    price: 80,
    originalPrice: 95,
    category: 'diamond',
    icon: '💎',
    badge: 'Popular',
  },
  {
    id: 'topup-2',
    name: '240 Diamonds',
    amount: '240 💎',
    price: 160,
    originalPrice: 190,
    category: 'diamond',
    icon: '💎',
    badge: 'Hot Deal',
  },
  {
    id: 'topup-3',
    name: '610 Diamonds',
    amount: '610 💎',
    price: 390,
    originalPrice: 480,
    category: 'diamond',
    icon: '💎',
    badge: 'Best Value',
  },
  {
    id: 'topup-4',
    name: '1240 Diamonds',
    amount: '1240 💎',
    price: 780,
    originalPrice: 950,
    category: 'diamond',
    icon: '💎',
    badge: 'VIP Pack',
  },
  {
    id: 'topup-5',
    name: 'Weekly Membership',
    amount: 'Weekly Pass',
    price: 165,
    originalPrice: 200,
    category: 'membership',
    icon: '🎫',
    badge: 'Save 30%',
  },
  {
    id: 'topup-6',
    name: 'Monthly Membership',
    amount: 'Monthly Pass',
    price: 790,
    originalPrice: 990,
    category: 'membership',
    icon: '👑',
    badge: 'Mega Deal',
  },
  {
    id: 'topup-7',
    name: 'Special Airdrop $0.99',
    amount: 'Airdrop (95 TK)',
    price: 95,
    originalPrice: 120,
    category: 'special',
    icon: '🪂',
    badge: 'Instant',
  },
  {
    id: 'topup-8',
    name: 'Level Up Pass',
    amount: '800 💎 Total',
    price: 160,
    originalPrice: 210,
    category: 'special',
    icon: '⚡',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const TOP_PLAYERS: TopPlayer[] = [
  {
    rank: 1,
    username: 'tanvir_op',
    ign: 'OP_TANVIR_77',
    totalEarnings: 8450,
    matchesWon: 42,
    kills: 312,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 2,
    username: 'mdmobarok15',
    ign: 'BOSS_MOBAROK',
    totalEarnings: 6890,
    matchesWon: 36,
    kills: 284,
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 3,
    username: 'rakib_ff',
    ign: 'RAKIB_FF_99',
    totalEarnings: 5920,
    matchesWon: 29,
    kills: 245,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 4,
    username: 'sabbir_king',
    ign: 'SABBIR_KING',
    totalEarnings: 4780,
    matchesWon: 22,
    kills: 198,
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80',
  },
  {
    rank: 5,
    username: 'nahid_pro',
    ign: 'NAHID_SNIPER',
    totalEarnings: 3950,
    matchesWon: 18,
    kills: 165,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
];

export const TOURNAMENT_RULES = [
  {
    title: '1. No Emulator Allowed (শুধুমাত্র মোবাইল প্লেয়ার)',
    description: 'যেকোনো ধরনের PC Emulator (BlueStacks, LDPlayer, Nox ইত্যাদি) বা Mac ব্যবহার কঠোরভাবে নিষিদ্ধ। Emulator ধরা পড়লে কোনো রিফান্ড ছাড়া একাউন্ট ব্যান করা হবে।',
  },
  {
    title: '2. No Hack / Config / Script (কোনো হ্যাক বা স্ক্রিপ্ট নয়)',
    description: 'Auto Headshot, Location Hack, Antenna, Config File বা যেকোনো থার্ড-পার্টি ফাইল ব্যবহার করলে সাথে সাথে আজীবনের জন্য ব্যান এবং ওয়ালেটের টাকা বাজেয়াপ্ত করা হবে।',
  },
  {
    title: '3. Room ID & Password Time (রুম আইডি ও পাসওয়ার্ড সময়)',
    description: 'ম্যাচ শুরু হওয়ার ঠিক ১০ মিনিট আগে My Matches অপশনে রুম আইডি এবং পাসওয়ার্ড দেওয়া হবে। নির্দিষ্ট সময়ে নিজ স্লটে জয়েন করুন।',
  },
  {
    title: '4. Teaming / Fraud (টিমিং বা অসদুপায় নিষিদ্ধ)',
    description: 'Solo ম্যাচে অন্য প্লেয়ারের সাথে কোনো প্রকার Teaming বা ফিক্সিং করা সম্পূর্ণ নিষিদ্ধ। ভিডিও প্রুফ পেলে উভয় প্লেয়ার অযোগ্য ঘোষিত হবে।',
  },
  {
    title: '5. Screenshot Submission (স্ক্রিনশট প্রুফ)',
    description: 'ম্যাচ শেষ হওয়ার পর আপনার ফাইনাল রেজাল্ট ও কিল স্ক্রিনশট সাপোর্ট অপশনে সাবমিট করুন। ভেরিফিকেশনের পর ৩০ মিনিটের মধ্যে ওয়ালেটে টাকা জমা হবে।',
  },
  {
    title: '6. Deposit & Withdrawal Rules (ডিপোজিট ও উইথড্র)',
    description: 'মিনিমাম উইথড্র ৫০ টাকা (bKash / Nagad / Rocket)। উইথড্র রিকোয়েস্ট করার ১০-৩০ মিনিটের মধ্যে পেমেন্ট কমপ্লিট হবে।',
  },
];

export const DEFAULT_APP_NOTICE: AppNotice = {
  enabled: true,
  title: 'WELCOME TO BD ESPORTS MS 💖',
  content: [
    '➡️ ফ্রি-ফায়ার আইডির নাম গেম থেকে কপি করে দিবেন ⬅️',
    '➡️ ক্লাসিক ম্যাচ এ গাড়ি চালানো যাবে না। ⬅️',
    '⚠️ সময় দেখে জয়েন করবেন। সময় মত না আসলে টাকা রিফান্ড দেওয়া হবে না!',
    '🟣 রুল দেখে ম্যাচ এ জয়েন করবেন!',
    '🔴 উইথড্র প্রতিদিন রাতে দেওয়া হয়!',
    '👉 ১ দিনে সর্বনিম্ন ১০০ এবং সর্বোচ্চ ২০০ টাকা উইথড্র দিতে পারবেন!',
    '👉 ১ দিনে ১ বার এর বেশি উইথড্র দেওয়া যাবে না!',
  ],
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'সকালের ম্যাচ অ্যাড করা আছে',
    message: 'জয়েন করে নিন',
    timestamp: 'Just now',
    read: false,
    category: 'match',
    linkTab: 'play',
  },
  {
    id: 'notif-2',
    title: 'বিকাশ ও নগদ ইনস্ট্যান্ট ডিপোজিট একটিভ 🔥',
    message: 'এখন ডিপোজিট করলে ১০০% ব্যালেন্স ইনস্ট্যান্ট ওয়ালেটে যোগ হয়ে যাবে।',
    timestamp: '1 hour ago',
    read: false,
    category: 'deposit',
    linkTab: 'shop',
  },
  {
    id: 'notif-3',
    title: 'Lone Wolf 2v2 ও CS ম্যাচ শুরু হচ্ছে!',
    message: 'স্লট দ্রুত পূরণ হচ্ছে, নিজ নিজ স্কোয়াড নিয়ে দ্রুত জয়েন করুন।',
    timestamp: '2 hours ago',
    read: true,
    category: 'room',
    linkTab: 'play',
  },
];
