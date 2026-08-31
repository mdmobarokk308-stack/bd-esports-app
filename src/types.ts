export interface User {
  id: string;
  name: string;
  phone: string;
  balance: number;
  winBalance: number;
  referralCode: string;
  isAdmin?: boolean;
}

export interface Match {
  id: string;
  title: string;
  map: string;
  type: string; // BR Solo, BR Squad, Clash Squad 4v4, Lone Wolf
  version: string; // TPP / FPP
  time: string;
  prizePool: number;
  entryFee: number;
  perKill: number;
  totalSpots: number;
  joinedCount: number;
  roomId?: string;
  roomPass?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image?: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'match' | 'wallet' | 'broadcast' | 'notice';
}

export interface TopupItem {
  id: string;
  title: string;
  diamonds: number;
  price: number;
  bonus?: string;
  image?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'match_join' | 'match_win' | 'topup';
  amount: number;
  method: string;
  accountNo: string;
  trxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}
