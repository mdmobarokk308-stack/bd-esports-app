import { AppNotice, AppNotification, BannerSlide, Match, MatchCategory, TopPlayer, TopupPackage, Transaction, User } from '../types';
import brMatchImg from '../assets/images/ff_br_match_1787743504248.jpg';
import brSurvivalImg from '../assets/images/ff_br_survival_1787743527330.jpg';
import clashSquadImg from '../assets/images/ff_clash_squad_1787743547043.jpg';
import cs2v2Img from '../assets/images/ff_cs_2v2_1787743564062.jpg';
import loneWolfImg from '../assets/images/ff_lone_wolf_1787743592051.jpg';
import freeMatchImg from '../assets/images/ff_free_match_1787743614766.jpg';
import headshotImg from '../assets/images/ff_headshot_art_1788308873284.jpg';
import lostToWinImg from '../assets/images/ff_losttowin_art_1788308895706.jpg';
import extremeTourImg from '../assets/images/ff_extreme_art_1788308920802.jpg';
import categoriesArtImg from '../assets/images/ff_categories_art_1788308850273.jpg';

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
    title: 'BR DUO MATCH',
    subtitle: 'Battle Royale Duo Full Map',
    image: brMatchImg,
    matchCount: 0,
    tag: 'BR',
  },
  {
    id: 'br_solo',
    title: 'BR SOLO MATCH',
    subtitle: 'Battle Royale Solo Full Map',
    image: brMatchImg,
    matchCount: 0,
    tag: 'BR',
  },
  {
    id: 'br_pro_league',
    title: 'BR PRO LEAGUE',
    subtitle: 'BPL Squad Tournament',
    image: categoriesArtImg,
    matchCount: 0,
    tag: 'BPL',
  },
  {
    id: 'br_survival',
    title: 'SOLO SURVIVAL',
    subtitle: 'BSS Solo Survival Tournament',
    image: brSurvivalImg,
    matchCount: 0,
    tag: 'BSS',
  },
  {
    id: 'lone_wolf',
    title: 'LONE WOLF',
    subtitle: 'LW 2v2 Fast Action',
    image: loneWolfImg,
    matchCount: 0,
    tag: 'LW',
  },
  {
    id: 'lw_head_host',
    title: 'LW HEAD HOST',
    subtitle: 'Headshot Only 2v2',
    image: headshotImg,
    matchCount: 0,
    tag: 'HEADHOST',
  },
  {
    id: 'clash_squad',
    title: 'CLASH SQUAD',
    subtitle: '4 vs 4 Intense Clash',
    image: clashSquadImg,
    matchCount: 0,
    tag: 'CS',
  },
  {
    id: 'cs_2v2',
    title: 'CS 1v1...2v2',
    subtitle: '1v1 / 2v2 Clash Squad',
    image: cs2v2Img,
    matchCount: 0,
    tag: 'CS',
  },
  {
    id: 'lone_wolf_1v1',
    title: 'LONE WOLF 1vs1',
    subtitle: '1 vs 1 Pure Skill',
    image: loneWolfImg,
    matchCount: 0,
    tag: 'LW',
  },
  {
    id: 'lost_to_win',
    title: 'LOST TO WIN',
    subtitle: 'Special Reverse Match',
    image: lostToWinImg,
    matchCount: 0,
    tag: 'LTW',
  },
  {
    id: 'extreme_tour',
    title: 'EXTREME TOUR SPECIAL MODE',
    subtitle: 'Special Mode 1 Taka Fee',
    image: extremeTourImg,
    matchCount: 0,
    tag: 'SPECIAL MODE',
  },
  {
    id: 'free_match',
    title: 'FREE MATCH',
    subtitle: 'Daily Free Giveaways',
    image: freeMatchImg,
    matchCount: 0,
    tag: 'FREE',
  },
];

export const INITIAL_MATCHES: Match[] = [];

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

export const TOP_PLAYERS: TopPlayer[] = [];

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

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'banner-1',
    title: 'BD ESPORTS MS',
    subtitle: 'প্রতিদিন ফ্রি গিভঅ্যাওয়ে ও রুম কোড পেতে টেলিগ্রাম চ্যানেলে জয়েন করুন',
    tag: 'DAILY GIVEAWAY',
    type: 'custom',
    bgGradient: 'from-[#1e0a00] via-[#2a1205] to-[#0d0400]',
    actionType: 'telegram',
    actionText: 'Join Telegram',
    active: true,
    order: 0,
  },
  {
    id: 'banner-2',
    title: 'MEGA WEEKEND TOURNAMENT',
    subtitle: '১০০০+ টাকা প্রাইজপুল! ফ্রি ফায়ার স্কোয়াড টুর্নামেন্টে জয়েন করুন এখনই',
    tag: 'SPECIAL EVENT',
    type: 'custom',
    bgGradient: 'from-purple-950 via-indigo-950 to-black',
    actionType: 'category',
    actionCategory: 'clash_squad',
    actionText: 'Join Squad',
    active: true,
    order: 1,
  },
  {
    id: 'banner-3',
    title: 'DIAMOND TOP-UP 20% DISCOUNT',
    subtitle: 'সবচেয়ে কম দামে বিকাশ ও নগদ দিয়ে ইনস্ট্যান্ট ইউআইডি টপ আপ করুন',
    tag: 'INSTANT SHOP',
    type: 'custom',
    bgGradient: 'from-blue-950 via-slate-900 to-black',
    actionType: 'shop',
    actionText: 'Top Up Now',
    active: true,
    order: 2,
  },
  {
    id: 'banner-4',
    title: 'FREE FIRE HIGHLIGHTS & GUIDE',
    subtitle: 'কিভাবে কাস্টম রুমে জয়েন করবেন ও প্রাইজ ক্লেইম করবেন বিস্তারিত ভিডিও টিউটোরিয়াল',
    tag: 'WATCH VIDEO',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
    videoEmbedUrl: 'https://www.youtube.com/embed/kXYiU_JCYtU',
    bgGradient: 'from-red-950 via-slate-900 to-black',
    actionType: 'external_link',
    actionUrl: 'https://www.youtube.com',
    actionText: 'Watch Video',
    active: true,
    order: 3,
  },
];

