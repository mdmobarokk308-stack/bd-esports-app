import { AppNotice, AppNotification, AppSettings, Match, Transaction } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  bkashNumber: '01612456053',
  nagadNumber: '01612456053',
  rocketNumber: '01612456053',
  telegramLink: 'https://t.me/esportsclubbd',
  apkDownloadUrl: 'https://www.mediafire.com/file/voizwproy208l5j/app-release.apk/file',
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

// Resolve backend API URL (supports APK WebView, file:// protocol, and standard web preview)
export const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'file:' || !window.location.host || window.location.host === 'localhost') {
      return 'https://ais-dev-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app';
    }
  }
  return '';
};

export async function fetchRemoteSettings(): Promise<{ settings: AppSettings; notice: AppNotice } | null> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        // Read existing locally saved permanent numbers and links
        const localBkash = localStorage.getItem('permanent_owner_bkash') || localStorage.getItem('admin_bkash_number');
        const localNagad = localStorage.getItem('permanent_owner_nagad') || localStorage.getItem('admin_nagad_number');
        const localRocket = localStorage.getItem('permanent_owner_rocket') || localStorage.getItem('admin_rocket_number');
        const localTelegram = localStorage.getItem('permanent_owner_telegram') || localStorage.getItem('admin_telegram_link');
        const localApk = localStorage.getItem('permanent_owner_apk_url') || localStorage.getItem('admin_apk_download_url');
        const localNoticeText = localStorage.getItem('permanent_owner_notice') || localStorage.getItem('admin_notice_text');
        const localPin = localStorage.getItem('permanent_owner_pin') || localStorage.getItem('owner_admin_pin');

        const finalBkash = (data.settings.bkashNumber && !DUMMY_PLACEHOLDERS.includes(data.settings.bkashNumber))
          ? data.settings.bkashNumber
          : (localBkash && !DUMMY_PLACEHOLDERS.includes(localBkash) ? localBkash : DEFAULT_SETTINGS.bkashNumber);

        const finalNagad = (data.settings.nagadNumber && !DUMMY_PLACEHOLDERS.includes(data.settings.nagadNumber))
          ? data.settings.nagadNumber
          : (localNagad && !DUMMY_PLACEHOLDERS.includes(localNagad) ? localNagad : DEFAULT_SETTINGS.nagadNumber);

        const finalRocket = (data.settings.rocketNumber && !DUMMY_PLACEHOLDERS.includes(data.settings.rocketNumber))
          ? data.settings.rocketNumber
          : (localRocket && !DUMMY_PLACEHOLDERS.includes(localRocket) ? localRocket : DEFAULT_SETTINGS.rocketNumber);

        // Prioritize custom saved telegram link so it is NEVER lost or reverted
        const finalTelegram = (localTelegram && localTelegram.trim() !== '')
          ? localTelegram.trim()
          : (data.settings.telegramLink && data.settings.telegramLink.trim() !== '' ? data.settings.telegramLink.trim() : DEFAULT_SETTINGS.telegramLink);

        // Prioritize custom saved apk download link so it is NEVER lost or reverted
        const finalApk = (localApk && localApk.trim() !== '')
          ? localApk.trim()
          : (data.settings.apkDownloadUrl && data.settings.apkDownloadUrl.trim() !== '' ? data.settings.apkDownloadUrl.trim() : DEFAULT_SETTINGS.apkDownloadUrl);

        const finalNoticeText = (localNoticeText && localNoticeText.trim() !== '')
          ? localNoticeText.trim()
          : (data.settings.noticeText !== undefined ? data.settings.noticeText : DEFAULT_SETTINGS.noticeText);

        const mergedSettings: AppSettings = {
          ...data.settings,
          bkashNumber: finalBkash,
          nagadNumber: finalNagad,
          rocketNumber: finalRocket,
          telegramLink: finalTelegram,
          apkDownloadUrl: finalApk,
          noticeText: finalNoticeText,
          adminPin: localPin || data.settings.adminPin || DEFAULT_SETTINGS.adminPin,
        };

        // Persist permanently in local storage across all backup keys
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

        // Always sync back to server so server DB holds the permanent custom settings
        if (
          !data.settings.bkashNumber ||
          DUMMY_PLACEHOLDERS.includes(data.settings.bkashNumber) ||
          data.settings.bkashNumber !== mergedSettings.bkashNumber ||
          data.settings.telegramLink !== mergedSettings.telegramLink ||
          data.settings.apkDownloadUrl !== mergedSettings.apkDownloadUrl
        ) {
          saveRemoteSettings(mergedSettings);
        }

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

  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/settings`, {
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
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        // Discard any legacy dummy match IDs
        const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];
        const cleanList = list.filter((m: any) => !dummyIds.includes(m.id));
        localStorage.setItem(MATCHES_KEY, JSON.stringify(cleanList));
        return cleanList;
      }
    }
  } catch (err) {
    console.warn('Could not fetch matches from server:', err);
  }
  return null;
}

export async function syncMatchesToServer(matches: Match[]): Promise<boolean> {
  try {
    // Discard any legacy dummy match IDs before saving
    const dummyIds = ['m-101', 'm-102', 'm-103', 'm-104', 'm-105', 'm-106', 'm-106b', 'm-107', 'm-901', 'm-902', 'm-903'];
    const cleanMatches = matches.filter((m) => !dummyIds.includes(m.id));
    localStorage.setItem(MATCHES_KEY, JSON.stringify(cleanMatches));
    
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches: cleanMatches }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync matches to server:', err);
    return false;
  }
}

export async function updateMatchRemote(match: Match): Promise<boolean> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches/${match.id}`, {
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
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/matches/${matchId}`, {
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
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/transactions`);
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
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/transactions`, {
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
    const res = await fetch(`${baseUrl}/api/notifications`);
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
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/notifications`, {
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
    const res = await fetch(`${baseUrl}/api/vouchers`);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        localStorage.setItem('admin_voucher_vault', JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Could not fetch vouchers from server:', err);
  }
  return null;
}

export async function syncVouchersToServer(vouchers: any[]): Promise<boolean> {
  try {
    localStorage.setItem('admin_voucher_vault', JSON.stringify(vouchers));
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vouchers }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not sync vouchers to server:', err);
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


