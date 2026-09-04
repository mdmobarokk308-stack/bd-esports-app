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

export const LEADERBOARD_DATA = {
  daily: [
    { rank: 1, username: 'mdnoyon93', ign: 'mdnoyon93', totalEarnings: 120, matchesWon: 2, kills: 15, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150' },
    { rank: 2, username: 'mdsakib99', ign: 'mdsakib99', totalEarnings: 95, matchesWon: 1, kills: 10, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { rank: 3, username: 'mrbandor', ign: 'mrbandor', totalEarnings: 85, matchesWon: 1, kills: 7, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { rank: 4, username: 'mrrahin11', ign: 'mrrahin11', totalEarnings: 80, matchesWon: 1, kills: 6, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150' },
    { rank: 5, username: 'Rohan111', ign: 'Rohan111', totalEarnings: 80, matchesWon: 1, kills: 0, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { rank: 6, username: 'tarikul448', ign: 'tarikul448', totalEarnings: 80, matchesWon: 1, kills: 0, avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150' },
    { rank: 7, username: 'FAHIMso', ign: 'FAHIMso', totalEarnings: 80, matchesWon: 1, kills: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { rank: 8, username: 'HOSSAIN7', ign: 'HOSSAIN7', totalEarnings: 80, matchesWon: 1, kills: 0, avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150' },
  ],
  weekly: [
    { rank: 1, username: 'HOSSAIN7', ign: 'HOSSAIN7', totalEarnings: 3970, matchesWon: 12, kills: 0, avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150' },
    { rank: 2, username: 'siam8877', ign: 'siam8877', totalEarnings: 3282, matchesWon: 10, kills: 30, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { rank: 3, username: 'pachong', ign: 'pachong', totalEarnings: 2550, matchesWon: 8, kills: 0, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { rank: 4, username: 'TAIKIKUN', ign: 'TAIKIKUN', totalEarnings: 2430, matchesWon: 7, kills: 0, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150' },
    { rank: 5, username: 'sazidahmed', ign: 'sazidahmed', totalEarnings: 2353, matchesWon: 6, kills: 8, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150' },
    { rank: 6, username: 'Ankita', ign: 'Ankita', totalEarnings: 2207, matchesWon: 5, kills: 0, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { rank: 7, username: 'FAHIMso', ign: 'FAHIMso', totalEarnings: 2169, matchesWon: 5, kills: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  ],
  monthly: [
    { rank: 1, username: 'HOSSAIN7', ign: 'HOSSAIN7', totalEarnings: 3410, matchesWon: 18, kills: 0, avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150' },
    { rank: 2, username: 'siam8877', ign: 'siam8877', totalEarnings: 2352, matchesWon: 14, kills: 30, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { rank: 3, username: 'pachong', ign: 'pachong', totalEarnings: 2310, matchesWon: 12, kills: 0, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { rank: 4, username: 'TAIKIKUN', ign: 'TAIKIKUN', totalEarnings: 1660, matchesWon: 9, kills: 0, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150' },
    { rank: 5, username: 'Ankita', ign: 'Ankita', totalEarnings: 1647, matchesWon: 8, kills: 0, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { rank: 6, username: 'iqoox', ign: 'iqoox', totalEarnings: 1615, matchesWon: 15, kills: 167, avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150' },
    { rank: 7, username: 'sazidahmed', ign: 'sazidahmed', totalEarnings: 1593, matchesWon: 7, kills: 8, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150' },
  ],
};

export const TOP_PLAYERS: TopPlayer[] = LEADERBOARD_DATA.daily;

export const BANNED_ITEMS_NOTE = {
  header: 'Classic Match Rules...',
  bannedGuns: 'SNIPER = AWM, M82B, Kar98k, M24, VSK94, VAGTOR',
  bannedCharacter: 'CHARACTER = Iris',
};

export const TOURNAMENT_RULES = [
  {
    title: '১. গাড়ি ব্যবহার নিষিদ্ধ ❌',
    description: 'ম্যাচে কোনো গাড়ি চালানো যাবে না ❌ যে গাড়ি চালাবে তাকে এই ম্যাচের রিওয়ার্ড দেওয়া হবে না ❌',
  },
  {
    title: '২. সাইট্যার, ফিমেল ক্যারেক্টার ও কিল লিমিট ❌',
    description: 'ম্যাচের মধ্যে কোন প্রকার সাইট্যার চালানো যাবে না ❌ যদি চালান তাহলে এই ম্যাচের রিওয়ার্ড দেওয়া হবে না ❌ ম্যাচ এ Female ক্যারেক্টার নিয়ে খেললে কোনো প্রকার রিওয়ার্ড পাবেন না ❌ ৮ এর অধিক/বেশি কিল করলে রিওয়ার্ড দেওয়া হবে না ❌',
  },
  {
    title: '৩. ডাবল ভেক্টর / কর্ট গান নিষিদ্ধ ❌',
    description: 'ম্যাচে ডাবল ভেক্টর / কর্ট গান চালানো যাবে না ❌ যে ডাবল ভেক্টর / কর্ট গান চালাবে তাকে এই ম্যাচের রিওয়ার্ড দেওয়া হবে না ❌',
  },
  {
    title: '৪. পাসওয়ার্ড ও জয়েনিং সংক্রান্ত নিয়ম ✅',
    description: 'কাস্টম রুম শুরু হওয়ার ৪-৫ মিনিট আগে পাসওয়ার্ড দেওয়া হবে✅ কাস্টম রুমে স্ক্রিন সমস্যা হলে স্ক্রিন রেকর্ড ভিডিও দিতে হবে। নেট সমস্যা বা সার্ভার প্রবলেম এর কারণে জয়েন করতে না পারলে কোন প্রকার রিফান্ড দেওয়া হবে না❌',
  },
  {
    title: '৫. লেভেল রিকোয়ারমেন্ট (Level 50+) ❌',
    description: 'আপনার ফ্রি ফায়ার আইডি লেভেল ৫০ এর নিচে হলে কাস্টম রুম থেকে কিক করা হবে এবং কোন প্রকার রিফান্ড দেওয়া হবে না❌',
  },
  {
    title: '৬. প্রাইভেসি ও ইনভাইট নিয়ম ❌',
    description: 'কাস্টম রুমে ঠিক টাইমে ঢুকতে না পারলে কোন রিফান্ড পাবেন না❌ ম্যাচে জয়েন ব্যতীত কোন বাইরের প্লেয়ার ইনভাইট করবেন না❌ কাস্টম রুমের আইডি এবং পাসওয়ার্ড অন্যদের মাঝে শেয়ার করবেন না।',
  },
  {
    title: '৭. রিওয়ার্ড / প্রাইজমানি ডিস্ট্রিবিউশন ✅',
    description: 'কাস্টম রুম শেষ হওয়ার ২০-২৫ মিনিটের মধ্যে সবার রিওয়ার্ড পেয়ে যাবেন। যদি ২০-২৫ মিনিটের মধ্যে রিওয়ার্ড না পান তাহলে ১ ঘণ্টা অপেক্ষা করবেন, তারপর না পাইলে আমাদের টেলিগ্রামে জানাবেন ✅',
  },
  {
    title: '৮. হ্যাক বা প্যানেল ব্যবহার ❌❌',
    description: 'যদি কোনো প্লেয়ার হ্যাক বা প্যানেল ব্যবহার করে তাহলে তাকে আজীবনের জন্য ব্যান করা হবে ❌❌',
  },
  {
    title: '৯. উইথড্র সীমাবদ্ধতা ❌',
    description: 'একদিনে একবারের বেশি উইথড্র দেওয়া যাবে না। কেউ একদিনে দুইবার উইথড্র রিকোয়েস্ট করলে উইথড্রর পুরো টাকা ডিপোজিট ব্যালেন্সে এড করে দেওয়া হবে❌',
  },
  {
    title: '১০. উইথড্র লিমিট ও সময়সূচী ✅',
    description: 'উইথড্র লিমিট সর্বনিম্ন ১০০ টাকা। ✅ উইথড্র এর টাকা বিকাশ দিয়ে ৩০ মিনিটের মধ্যে পেয়ে যাবেন আর নগদে দিলে ২ ঘণ্টার মধ্যে পেয়ে যাবেন। পারলে সবাই বিকাশে দেওয়ার চেষ্টা করবেন ✅',
  },
  {
    title: '১১. টেলিগ্রাম সাপোর্ট ✅',
    description: 'যেকোনো সমস্যার জন্য টেলিগ্রাম সাপোর্ট মেসেজ দিবেন✅',
  },
  {
    title: '১২. প্রশাসনিক সিদ্ধান্ত ⚖️',
    description: 'এডমিনের সিদ্ধান্ত চূড়ান্ত সিদ্ধান্ত।',
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

