import { AppNotice, AppNotification, AppSettings, Match, Transaction } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  bkashNumber: '01612456053',
  nagadNumber: '01612456053',
  rocketNumber: '01612456053',
  telegramLink: 't.me/mdmobaro55',
  apkDownloadUrl: 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
  noticeText: 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!',
  adminPin: '7788',
};

// Local storage backup keys
const SETTINGS_KEY = 'bd_esports_settings';
const MATCHES_KEY = 'ff_tournament_matches';
const TRANSACTIONS_KEY = 'ff_tournament_transactions';
const NOTIFICATIONS_KEY = 'ff_app_notifications';
const NOTICE_KEY = 'ff_app_entry_notice';

const DUMMY_PLACEHOLDERS = ['01712345678', '01812345678', '019999888775', '01700000000'];

const TARGET_SERVERS = [
  '',
  'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
  'https://ais-dev-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
  'https://bd-esports-ms-free-fire-tournament.ai.studio',
];

const LIVE_SERVER_URL = 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';

// Resolve backend API URL (guarantees APK WebView, external Chrome browser, preview iframe & production all connect smoothly)
export const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return '';
    }
  }
  return LIVE_SERVER_URL;
};

// Broadcast POST helper across all container environments
async function broadcastPost(endpoint: string, payload: any): Promise<boolean> {
  const promises = TARGET_SERVERS.map(async (serverUrl) => {
    try {
      const url = serverUrl ? `${serverUrl}${endpoint}` : endpoint;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  });
  const results = await Promise.allSettled(promises);
  return results.some((r) => r.status === 'fulfilled' && r.value === true);
}

export async function fetchRemoteSettings(): Promise<{ settings: AppSettings; notice: AppNotice } | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/settings?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        const s = data.settings;
        const localApk = localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url');
        const localTelegram = localStorage.getItem('permanent_owner_telegram') || localStorage.getItem('admin_telegram_link');
        const localBkash = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number');
        const localNagad = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number');
        const localRocket = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number');
        const localNotice = localStorage.getItem('permanent_owner_notice') || localStorage.getItem('admin_notice_text');
        const localPin = localStorage.getItem('permanent_owner_pin') || localStorage.getItem('owner_admin_pin');

        const mergedSettings: AppSettings = {
          bkashNumber: localBkash || ((s.bkashNumber && !DUMMY_PLACEHOLDERS.includes(s.bkashNumber)) ? s.bkashNumber : DEFAULT_SETTINGS.bkashNumber),
          nagadNumber: localNagad || ((s.nagadNumber && !DUMMY_PLACEHOLDERS.includes(s.nagadNumber)) ? s.nagadNumber : DEFAULT_SETTINGS.nagadNumber),
          rocketNumber: localRocket || ((s.rocketNumber && !DUMMY_PLACEHOLDERS.includes(s.rocketNumber)) ? s.rocketNumber : DEFAULT_SETTINGS.rocketNumber),
          telegramLink: localTelegram || ((s.telegramLink && s.telegramLink.trim() !== '') ? s.telegramLink.trim() : DEFAULT_SETTINGS.telegramLink),
          apkDownloadUrl: localApk || ((s.apkDownloadUrl && s.apkDownloadUrl.trim() !== '' && s.apkDownloadUrl !== '/BD_ESPORTS_MS_v1.0.apk') ? s.apkDownloadUrl.trim() : DEFAULT_SETTINGS.apkDownloadUrl),
          noticeText: localNotice || (s.noticeText !== undefined ? s.noticeText : DEFAULT_SETTINGS.noticeText),
          adminPin: localPin || ((s.adminPin && s.adminPin.trim() !== '') ? s.adminPin.trim() : DEFAULT_SETTINGS.adminPin),
        };

        // Cache into local storage as offline backup
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
        localStorage.setItem('admin_bkash_number', mergedSettings.bkashNumber);
        localStorage.setItem('permanent_owner_bkash', mergedSettings.bkashNumber);
        localStorage.setItem('admin_nagad_number', mergedSettings.nagadNumber);
        localStorage.setItem('permanent_owner_nagad', mergedSettings.nagadNumber);
        localStorage.setItem('admin_rocket_number', mergedSettings.rocketNumber);
        localStorage.setItem('permanent_owner_rocket', mergedSettings.rocketNumber);
        localStorage.setItem('admin_telegram_link', mergedSettings.telegramLink);
        localStorage.setItem('permanent_owner_telegram', mergedSettings.telegramLink);
        localStorage.setItem('admin_apk_download_url', mergedSettings.apkDownloadUrl);
        localStorage.setItem('permanent_owner_apk_url', mergedSettings.apkDownloadUrl);
        localStorage.setItem('admin_notice_text', mergedSettings.noticeText);
        localStorage.setItem('permanent_owner_notice', mergedSettings.noticeText);
        localStorage.setItem('owner_admin_pin', mergedSettings.adminPin);
        localStorage.setItem('permanent_owner_pin', mergedSettings.adminPin);

        data.settings = mergedSettings;
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
  // Update local storage immediately & permanently
  if (settings.bkashNumber) {
    localStorage.setItem('admin_bkash_number', settings.bkashNumber);
    localStorage.setItem('permanent_owner_bkash', settings.bkashNumber);
  }
  if (settings.nagadNumber) {
    localStorage.setItem('admin_nagad_number', settings.nagadNumber);
    localStorage.setItem('permanent_owner_nagad', settings.nagadNumber);
  }
  if (settings.rocketNumber) {
    localStorage.setItem('admin_rocket_number', settings.rocketNumber);
    localStorage.setItem('permanent_owner_nagad', settings.rocketNumber);
    localStorage.setItem('permanent_owner_rocket', settings.rocketNumber);
  }
  if (settings.telegramLink) {
    localStorage.setItem('admin_telegram_link', settings.telegramLink);
    localStorage.setItem('permanent_owner_telegram', settings.telegramLink);
  }
  if (settings.apkDownloadUrl) {
    localStorage.setItem('admin_apk_download_url', settings.apkDownloadUrl);
    localStorage.setItem('permanent_owner_apk_url', settings.apkDownloadUrl);
  }
  if (settings.noticeText) {
    localStorage.setItem('admin_notice_text', settings.noticeText);
    localStorage.setItem('permanent_owner_notice', settings.noticeText);
  }
  if (settings.adminPin) {
    localStorage.setItem('owner_admin_pin', settings.adminPin);
    localStorage.setItem('permanent_owner_pin', settings.adminPin);
  }
  if (notice) localStorage.setItem(NOTICE_KEY, JSON.stringify(notice));

  return await broadcastPost('/api/settings', { settings, notice });
}

export async function fetchRemoteMatches(): Promise<Match[] | null> {
  const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];

  // 1. Query all candidate server targets in parallel to get the latest match list
  for (const serverUrl of TARGET_SERVERS) {
    try {
      const url = serverUrl ? `${serverUrl}/api/matches?t=${Date.now()}` : `/api/matches?t=${Date.now()}`;
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          const cleanList = list.filter((m: any) => m && m.id && !dummyIds.includes(m.id));
          localStorage.setItem(MATCHES_KEY, JSON.stringify(cleanList));
          return cleanList;
        }
      }
    } catch {
      // Ignore and continue checking next server URL
    }
  }

  // 2. Fallback to localStorage cache if network is unavailable
  const saved = localStorage.getItem(MATCHES_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }

  return null;
}

export async function syncMatchesToServer(matches: Match[]): Promise<boolean> {
  const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];
  const cleanMatches = matches.filter((m) => !dummyIds.includes(m.id));
  localStorage.setItem(MATCHES_KEY, JSON.stringify(cleanMatches));

  // Broadcast to all backend targets simultaneously
  return await broadcastPost('/api/matches', { matches: cleanMatches });
}

export async function updateMatchRemote(match: Match): Promise<boolean> {
  const promises = TARGET_SERVERS.map(async (serverUrl) => {
    try {
      const url = serverUrl ? `${serverUrl}/api/matches/${match.id}` : `/api/matches/${match.id}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
      });
      return res.ok;
    } catch {
      return false;
    }
  });
  const results = await Promise.allSettled(promises);
  return results.some((r) => r.status === 'fulfilled' && r.value === true);
}

export async function deleteMatchRemote(matchId: string): Promise<boolean> {
  const promises = TARGET_SERVERS.map(async (serverUrl) => {
    try {
      const url = serverUrl ? `${serverUrl}/api/matches/${matchId}` : `/api/matches/${matchId}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  });
  const results = await Promise.allSettled(promises);
  return results.some((r) => r.status === 'fulfilled' && r.value === true);
}

export async function fetchRemoteTransactions(): Promise<Transaction[] | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/transactions?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
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
  return await broadcastPost('/api/transactions', { transaction: txn });
}

export async function updateTransactionStatusRemote(txnId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/transactions/${txnId}`, {
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
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/notifications?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
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
  return await broadcastPost('/api/notifications', { notification });
}

export async function deleteNotificationRemote(id: string): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/notifications/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete notification from server:', err);
    return false;
  }
}

export async function fetchRemoteVouchers(): Promise<any[] | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/vouchers?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        const realList = list.filter(
          (v: any) => v && v.code &&
          !['UPBD-FF115-8849-2109-7731', 'UPBD-FF240-9921-4321-1102', 'UPBD-WKLY-7712-9900-5544'].includes(v.code) &&
          !v.code.startsWith('UPBD-FF') && !v.code.startsWith('UPBD-WKLY')
        );
        localStorage.setItem('admin_voucher_vault', JSON.stringify(realList));
        return realList;
      }
    }
  } catch (err) {
    console.warn('Could not fetch vouchers from server:', err);
  }
  return null;
}

export async function syncVouchersToServer(vouchers: any[]): Promise<boolean> {
  localStorage.setItem('admin_voucher_vault', JSON.stringify(vouchers));
  return await broadcastPost('/api/vouchers', { vouchers });
}

export async function deleteVoucherRemote(id: string): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/vouchers/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete voucher on server:', err);
    return false;
  }
}

export async function executeAutoBotTopup(payload: {
  orderId: string;
  playerUid: string;
  packageCategory?: string;
  voucherCode?: string;
  apiProvider?: string;
}): Promise<{ success: boolean; message: string; deliveredCode?: string } | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/bot/auto-topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not execute auto bot topup on server:', err);
  }
  return null;
}


