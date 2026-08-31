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

const LIVE_SERVER_URL = 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';

// Resolve backend API URL (guarantees APK WebView, external Chrome browser, Vercel & preview iframe all connect to central server)
export const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('ais-dev') || origin.includes('ais-pre')) {
      return '';
    }
  }
  return LIVE_SERVER_URL;
};

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

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, notice }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchRemoteMatches(): Promise<Match[] | null> {
  const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches?t=${Date.now()}`, {
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
    // Ignore error
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

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches: cleanMatches }),
    });
    return res.ok;
  } catch {
    return false;
  }
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

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match),
    });
    return res.ok;
  } catch {
    return false;
  }
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

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches/${matchId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
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
  // Update local storage first
  const saved = localStorage.getItem(TRANSACTIONS_KEY);
  if (saved) {
    try {
      const parsed: Transaction[] = JSON.parse(saved);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([txn, ...parsed]));
    } catch {}
  }

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: txn }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
  // Update local storage first
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) {
    try {
      const parsed: AppNotification[] = JSON.parse(saved);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([notification, ...parsed]));
    } catch {}
  }

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vouchers }),
    });
    return res.ok;
  } catch {
    return false;
  }
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

// Banners and Video Slider Sync
export async function fetchRemoteBanners(): Promise<BannerSlide[] | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/banners?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(BANNERS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch banners from server, using local fallback:', err);
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
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banners }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not save banners to server:', err);
    return false;
  }
}

export async function updateBannerRemote(banner: BannerSlide): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/banners/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not update banner on server:', err);
    return false;
  }
}

export async function deleteBannerRemote(bannerId: string): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/banners/${bannerId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not delete banner on server:', err);
    return false;
  }
}



