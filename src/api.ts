import { AppNotice, AppNotification, AppSettings, BannerSlide, Match, Transaction } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  bkashNumber: '01612456053',
  nagadNumber: '01612456053',
  rocketNumber: '01612456053',
  telegramLink: 't.me/mdmobaro55',
  apkDownloadUrl: 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
  noticeText: 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!',
  adminPin: '7788',
  autoPushConfig: {
    enabled: true,
    title: 'সকালের ম্যাচ অ্যাড করা আছে',
    message: 'জয়েন করে নিন',
    intervalMinutes: 60,
    category: 'match',
    linkTab: 'play',
  },
};

// Local storage backup keys
const SETTINGS_KEY = 'bd_esports_settings';
const MATCHES_KEY = 'ff_tournament_matches';
const TRANSACTIONS_KEY = 'ff_tournament_transactions';
const NOTIFICATIONS_KEY = 'ff_app_notifications';
const NOTICE_KEY = 'ff_app_entry_notice';
const BANNERS_KEY = 'bd_esports_banners';

const DUMMY_PLACEHOLDERS = ['01712345678', '01812345678', '019999888775', '01700000000'];

// Multi-endpoint live cloud sync targets for 100% synchronization across AI Studio Dev, Chrome, Shared App, and APK
const DEV_SERVER_URL = 'https://ais-dev-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';
const PRE_SERVER_URL = 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';
const LIVE_SERVER_URL = PRE_SERVER_URL;

// Get all sync endpoints to broadcast mutations across both Dev & Pre Cloud Run instances
export const getSyncEndpoints = (): string[] => {
  const endpoints: string[] = [''];
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      endpoints.push(origin);
    }
  }
  endpoints.push(DEV_SERVER_URL);
  endpoints.push(PRE_SERVER_URL);
  return Array.from(new Set(endpoints));
};

// Resolve single backend API URL fallback
export const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('ais-dev') || origin.includes('ais-pre')) {
      return '';
    }
  }
  return LIVE_SERVER_URL;
};

// Parallel multi-server write helpers
async function multiPost(path: string, body: any): Promise<boolean> {
  const endpoints = getSyncEndpoints();
  let anySuccess = false;
  await Promise.allSettled(
    endpoints.map(async (base) => {
      try {
        const url = `${base}${path}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) anySuccess = true;
      } catch {}
    })
  );
  return anySuccess;
}

async function multiPut(path: string, body: any): Promise<boolean> {
  const endpoints = getSyncEndpoints();
  let anySuccess = false;
  await Promise.allSettled(
    endpoints.map(async (base) => {
      try {
        const url = `${base}${path}`;
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) anySuccess = true;
      } catch {}
    })
  );
  return anySuccess;
}

async function multiDelete(path: string): Promise<boolean> {
  const endpoints = getSyncEndpoints();
  let anySuccess = false;
  await Promise.allSettled(
    endpoints.map(async (base) => {
      try {
        const url = `${base}${path}`;
        const res = await fetch(url, {
          method: 'DELETE',
        });
        if (res.ok) anySuccess = true;
      } catch {}
    })
  );
  return anySuccess;
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
        let localAutoPush = null;
        try {
          const raw = localStorage.getItem('admin_auto_push_config');
          if (raw) localAutoPush = JSON.parse(raw);
        } catch {}

        const mergedSettings: AppSettings = {
          bkashNumber: localBkash || ((s.bkashNumber && !DUMMY_PLACEHOLDERS.includes(s.bkashNumber)) ? s.bkashNumber : DEFAULT_SETTINGS.bkashNumber),
          nagadNumber: localNagad || ((s.nagadNumber && !DUMMY_PLACEHOLDERS.includes(s.nagadNumber)) ? s.nagadNumber : DEFAULT_SETTINGS.nagadNumber),
          rocketNumber: localRocket || ((s.rocketNumber && !DUMMY_PLACEHOLDERS.includes(s.rocketNumber)) ? s.rocketNumber : DEFAULT_SETTINGS.rocketNumber),
          telegramLink: localTelegram || ((s.telegramLink && s.telegramLink.trim() !== '') ? s.telegramLink.trim() : DEFAULT_SETTINGS.telegramLink),
          apkDownloadUrl: localApk || ((s.apkDownloadUrl && s.apkDownloadUrl.trim() !== '' && s.apkDownloadUrl !== '/BD_ESPORTS_MS_v1.0.apk') ? s.apkDownloadUrl.trim() : DEFAULT_SETTINGS.apkDownloadUrl),
          noticeText: localNotice || (s.noticeText !== undefined ? s.noticeText : DEFAULT_SETTINGS.noticeText),
          adminPin: localPin || ((s.adminPin && s.adminPin.trim() !== '') ? s.adminPin.trim() : DEFAULT_SETTINGS.adminPin),
          autoPushConfig: localAutoPush || s.autoPushConfig || DEFAULT_SETTINGS.autoPushConfig,
        };

        // Cache into local storage as offline backup
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
        if (mergedSettings.autoPushConfig) {
          localStorage.setItem('admin_auto_push_config', JSON.stringify(mergedSettings.autoPushConfig));
        }
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
  if (settings.autoPushConfig) {
    localStorage.setItem('admin_auto_push_config', JSON.stringify(settings.autoPushConfig));
  }
  if (notice) localStorage.setItem(NOTICE_KEY, JSON.stringify(notice));

  return await multiPost('/api/settings', { settings, notice });
}

export async function fetchRemoteMatches(): Promise<Match[] | null> {
  const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];
  const endpoints = getSyncEndpoints();

  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/matches?t=${Date.now()}`, {
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
      // try next endpoint
    }
  }

  // Fallback to localStorage cache if network is unavailable
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

export async function saveMatchesRemote(matches: Match[]): Promise<boolean> {
  const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];
  const cleanMatches = matches.filter((m) => !dummyIds.includes(m.id));
  localStorage.setItem(MATCHES_KEY, JSON.stringify(cleanMatches));

  return await multiPost('/api/matches', { matches: cleanMatches });
}

export const syncMatchesToServer = saveMatchesRemote;

export async function updateMatchRemote(match: Match): Promise<boolean> {
  // Update local storage first
  const saved = localStorage.getItem(MATCHES_KEY);
  if (saved) {
    try {
      const parsed: Match[] = JSON.parse(saved);
      const updated = parsed.map((m) => (m.id === match.id ? match : m));
      localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));
    } catch {}
  }

  const putPromise = multiPut(`/api/matches/${match.id}`, match);
  const postPromise = multiPost('/api/matches', { match });
  const [putOk, postOk] = await Promise.all([putPromise, postPromise]);
  return putOk || postOk;
}

export async function deleteMatchRemote(matchId: string): Promise<boolean> {
  // Update local storage first
  const saved = localStorage.getItem(MATCHES_KEY);
  if (saved) {
    try {
      const parsed: Match[] = JSON.parse(saved);
      const updated = parsed.filter((m) => m.id !== matchId);
      localStorage.setItem(MATCHES_KEY, JSON.stringify(updated));
    } catch {}
  }

  return await multiDelete(`/api/matches/${matchId}`);
}

export async function fetchRemoteTransactions(): Promise<Transaction[] | null> {
  const endpoints = getSyncEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/transactions?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
          return list;
        }
      }
    } catch {}
  }
  return null;
}

export async function saveTransactionRemote(txn: Transaction): Promise<boolean> {
  // Update local storage first
  const saved = localStorage.getItem(TRANSACTIONS_KEY);
  if (saved) {
    try {
      const parsed: Transaction[] = JSON.parse(saved);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([txn, ...parsed]));
    } catch {}
  }

  return await multiPost('/api/transactions', { transaction: txn });
}

export async function updateTransactionStatusRemote(txnId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  return await multiPut(`/api/transactions/${txnId}`, { status });
}

export async function fetchRemoteNotifications(): Promise<AppNotification[] | null> {
  const endpoints = getSyncEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/notifications?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
          return list;
        }
      }
    } catch {}
  }
  return null;
}

export async function broadcastNotificationRemote(notification: AppNotification): Promise<boolean> {
  // Update local storage first
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) {
    try {
      const parsed: AppNotification[] = JSON.parse(saved);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([notification, ...parsed]));
    } catch {}
  }

  return await multiPost('/api/notifications', { notification });
}

export async function deleteNotificationRemote(id: string): Promise<boolean> {
  return await multiDelete(`/api/notifications/${id}`);
}

export async function fetchRemoteVouchers(): Promise<any[] | null> {
  const endpoints = getSyncEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/vouchers?t=${Date.now()}`, {
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
    } catch {}
  }
  return null;
}

export async function syncVouchersToServer(vouchers: any[]): Promise<boolean> {
  localStorage.setItem('admin_voucher_vault', JSON.stringify(vouchers));
  return await multiPost('/api/vouchers', { vouchers });
}

export async function deleteVoucherRemote(id: string): Promise<boolean> {
  return await multiDelete(`/api/vouchers/${id}`);
}

export async function executeAutoBotTopup(payload: {
  orderId: string;
  playerUid: string;
  packageCategory?: string;
  voucherCode?: string;
  apiProvider?: string;
}): Promise<{ success: boolean; message: string; deliveredCode?: string } | null> {
  const endpoints = getSyncEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/bot/auto-topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
  }
  return null;
}

// Banners and Video Slider Sync
export async function fetchRemoteBanners(): Promise<BannerSlide[] | null> {
  const endpoints = getSyncEndpoints();
  for (const base of endpoints) {
    try {
      const res = await fetch(`${base}/api/banners?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(BANNERS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {}
  }
  const saved = localStorage.getItem(BANNERS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return null;
}

export async function saveBannersRemote(banners: BannerSlide[]): Promise<boolean> {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
  return await multiPost('/api/banners', { banners });
}

export async function updateBannerRemote(banner: BannerSlide): Promise<boolean> {
  return await multiPut(`/api/banners/${banner.id}`, banner);
}

export async function deleteBannerRemote(bannerId: string): Promise<boolean> {
  return await multiDelete(`/api/banners/${bannerId}`);
}



