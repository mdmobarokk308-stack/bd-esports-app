export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  matchesJoined: number;
  totalWon: number;
  freeFireUid: string;
  freeFireIgn: string;
  avatar: string;
}

export type MatchCategoryKey =
  | 'br_match'
  | 'br_survival'
  | 'clash_squad'
  | 'cs_2v2'
  | 'lone_wolf'
  | 'free_match';

export interface MatchCategory {
  id: MatchCategoryKey;
  title: string;
  subtitle: string;
  image: string;
  matchCount: number;
  tag?: string;
}

export interface PlayerSlot {
  slot: number;
  username: string;
  ign: string;
  uid: string;
  avatar?: string;
}

export interface MatchResultItem {
  rank: number;
  ign: string;
  kills: number;
  prize: number;
  uid: string;
  slot: number;
}

export interface Match {
  id: string;
  title: string;
  category: MatchCategoryKey;
  categoryLabel: string;
  entryType: 'Solo' | 'Duo' | 'Squad';
  scheduleTime: string;
  winPrize: number;
  entryFee: number;
  perKill: number;
  map: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';
  version: 'MOBILE' | 'PC & MOBILE';
  totalSlots: number;
  joinedPlayers: PlayerSlot[];
  status: 'upcoming' | 'ongoing' | 'completed';
  roomId?: string;
  roomPass?: string;
  youtubeLiveUrl?: string;
  results?: MatchResultItem[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'match_entry' | 'match_prize' | 'topup_purchase';
  method?: 'bKash' | 'Nagad' | 'Rocket' | 'Upay';
  amount: number;
  senderNumber?: string;
  trxId?: string;
  targetUid?: string;
  packageName?: string;
  orderId?: string;
  accountDetails?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  description: string;
  deliveredCode?: string;
  voucherCostInfo?: string;
  isAutoDelivered?: boolean;
}

export interface TopupPackage {
  id: string;
  name: string;
  amount: string;
  price: number;
  originalPrice?: number;
  category: 'diamond' | 'special' | 'membership';
  icon: string;
  badge?: string;
}

export interface TopPlayer {
  rank: number;
  username: string;
  ign: string;
  totalEarnings: number;
  matchesWon: number;
  kills: number;
  avatar: string;
}

export interface AppNotice {
  enabled: boolean;
  title: string;
  content: string[];
}

export interface AppSettings {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  telegramLink: string;
  apkDownloadUrl: string;
  noticeText: string;
  adminPin: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  type: 'image' | 'video' | 'custom';
  mediaUrl?: string; // Image URL or Video URL
  videoEmbedUrl?: string; // YouTube embed URL
  bgGradient?: string;
  actionType: 'external_link' | 'telegram' | 'shop' | 'category' | 'wallet' | 'none';
  actionUrl?: string;
  actionCategory?: MatchCategoryKey;
  actionText?: string;
  active: boolean;
  order: number;
}

export interface VoucherVaultItem {
  id: string;
  code: string; // e.g. UPBD-XXXX-XXXX
  packageCategory: string; // e.g. '115 Diamonds', '240 Diamonds', 'Weekly Pass', 'Monthly Pass', 'General Voucher'
  addedDate: string;
  isUsed: boolean;
  usedForUid?: string;
  usedForOrderId?: string;
  usedDate?: string;
  note?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category?: 'match' | 'deposit' | 'system' | 'room' | 'offer';
  linkTab?: TabType;
}

export type TabType = 'shop' | 'play' | 'my_matches' | 'results' | 'profile';

