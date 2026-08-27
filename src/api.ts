import { AppNotice, AppNotification, AppSettings, Match, Transaction } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  bkashNumber: '01712345678',
  nagadNumber: '01812345678',
  rocketNumber: '019999888775',
  telegramLink: 'https://t.me/esportsclubbd',
  apkDownloadUrl: '/BD_ESPORTS_MS_v1.0.apk',
  noticeText: 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!',
  adminPin: '7788',
};

// Local storage backup keys
const SETTINGS_KEY = 'bd_esports_settings';
const MATCHES_KEY = 'ff_tournament_matches';
const TRANSACTIONS_KEY = 'ff_tournament_transactions';
const NOTIFICATIONS_KEY = 'ff_app_notifications';
const NOTICE_KEY = 'ff_app_entry_notice';

export async function fetchRemoteSettings(): Promise<{ settings: AppSettings; notice: AppNotice } | null> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
        localStorage.setItem('admin_bkash_number', data.settings.bkashNumber);
        localStorage.setItem('admin_nagad_number', data.settings.nagadNumber);
        localStorage.setItem('admin_rocket_number', data.settings.rocketNumber);
        localStorage.setItem('admin_telegram_link', data.settings.telegramLink);
        localStorage.setItem('admin_apk_download_url', data.settings.apkDownloadUrl);
        localStorage.setItem('admin_notice_text', data.settings.noticeText);
        localStorage.setItem('owner_admin_pin', data.settings.adminPin);
      }
      if (data.notice) {
        localStorage.setItem(NOTICE_KEY, JSON.stringify(data.notice));
      }
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch settings from server, using local fallback:', err);
  }
  return null;
}

export async function saveRemoteSettings(
  settings: Partial<AppSettings>,
  notice?: AppNotice
): Promise<boolean> {
  // Update local storage immediately
  if (settings.bkashNumber) localStorage.setItem('admin_bkash_number', settings.bkashNumber);
  if (settings.nagadNumber) localStorage.setItem('admin_nagad_number', settings.nagadNumber);
  if (settings.rocketNumber) localStorage.setItem('admin_rocket_number', settings.rocketNumber);
  if (settings.telegramLink) localStorage.setItem('admin_telegram_link', settings.telegramLink);
  if (settings.apkDownloadUrl) localStorage.setItem('admin_apk_download_url', settings.apkDownloadUrl);
  if (settings.noticeText) localStorage.setItem('admin_notice_text', settings.noticeText);
  if (settings.adminPin) localStorage.setItem('owner_admin_pin', settings.adminPin);
  if (notice) localStorage.setItem(NOTICE_KEY, JSON.stringify(notice));

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, notice }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save settings to server:', err);
    return false;
  }
}

export async function fetchRemoteMatches(): Promise<Match[] | null> {
  try {
    const res = await fetch('/api/matches');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(MATCHES_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch matches from server:', err);
  }
  return null;
}

export async function syncMatchesToServer(matches: Match[]): Promise<boolean> {
  try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync matches to server:', err);
    return false;
  }
}

export async function updateMatchRemote(match: Match): Promise<boolean> {
  try {
    const res = await fetch(`/api/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not update match on server:', err);
    return false;
  }
}

export async function deleteMatchRemote(matchId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/matches/${matchId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete match on server:', err);
    return false;
  }
}

export async function fetchRemoteTransactions(): Promise<Transaction[] | null> {
  try {
    const res = await fetch('/api/transactions');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch transactions from server:', err);
  }
  return null;
}

export async function saveTransactionRemote(txn: Transaction): Promise<boolean> {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: txn }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save transaction to server:', err);
    return false;
  }
}

export async function updateTransactionStatusRemote(txnId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  try {
    const res = await fetch(`/api/transactions/${txnId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not update transaction on server:', err);
    return false;
  }
}

export async function fetchRemoteNotifications(): Promise<AppNotification[] | null> {
  try {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch notifications from server:', err);
  }
  return null;
}

export async function broadcastNotificationRemote(notification: AppNotification): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not broadcast notification to server:', err);
    return false;
  }
}

export async function deleteNotificationRemote(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete notification from server:', err);
    return false;
  }
}
