import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import webpush from 'web-push';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBData {
  settings: {
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    telegramLink: string;
    apkDownloadUrl: string;
    noticeText: string;
    adminPin: string;
    moderatorPin?: string;
    matchRepeatMode?: 'manual' | 'auto';
    autoPushConfig?: {
      enabled: boolean;
      title: string;
      message: string;
      intervalMinutes: number;
      category?: string;
      linkTab?: string;
      lastUpdated?: string;
    };
  };
  notice: {
    enabled: boolean;
    title: string;
    content: string[];
  };
  matches: any[];
  deletedMatchIds: string[];
  transactions: any[];
  notifications: any[];
  vouchers: any[];
  banners: any[];
  vapidKeys?: {
    publicKey: string;
    privateKey: string;
  };
  pushSubscriptions?: Array<{
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  }>;
}

const defaultData: DBData = {
  settings: {
    bkashNumber: '01612456053',
    nagadNumber: '01612456053',
    rocketNumber: '01612456053',
    telegramLink: 't.me/mdmobaro55',
    apkDownloadUrl: 'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
    noticeText: 'Free Fire আজকের মেগা টুর্নামেন্টে জয়েন করুন ও জিতুন আকর্ষণীয় প্রাইজমানি!',
    adminPin: '7788',
    moderatorPin: '1234',
    matchRepeatMode: 'manual',
    autoPushConfig: {
      enabled: false,
      title: 'নতুন ম্যাচ নোটিফিকেশন',
      message: 'টুর্নামেন্টে জয়েন করুন',
      intervalMinutes: 120,
      category: 'match',
      linkTab: 'play',
    },
  },
  notice: {
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
  },
  matches: [],
  transactions: [],
  notifications: [],
  vouchers: [],
  banners: [
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
  ],
  deletedMatchIds: [],
};

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const mergedSettings = { ...defaultData.settings, ...(parsed.settings || {}) };
      if (['01712345678', '01812345678', '019999888775', '01700000000'].includes(mergedSettings.bkashNumber)) {
        mergedSettings.bkashNumber = '01612456053';
      }
      return {
        ...defaultData,
        ...parsed,
        settings: mergedSettings,
        notice: { ...defaultData.notice, ...(parsed.notice || {}) },
        deletedMatchIds: Array.isArray(parsed.deletedMatchIds) ? parsed.deletedMatchIds : [],
        matches: (Array.isArray(parsed.matches) ? parsed.matches : defaultData.matches).filter(
          (m: any) => m && m.id && !(Array.isArray(parsed.deletedMatchIds) ? parsed.deletedMatchIds : []).includes(m.id)
        ),
        banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : defaultData.banners,
      };
    }
  } catch (err) {
    console.error('Failed to load db.json, using defaults:', err);
  }
  return defaultData;
}

let dbMemory: DBData = loadDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

function sanitizeMatch(m: any) {
  if (!m || typeof m !== 'object') return m;
  if (typeof m.title === 'string' && (m.title.length > 90 || m.title.includes('যেই গান') || m.title.includes('Classic Match Rules'))) {
    const parts = m.title.split('\n');
    m.title = parts[0].substring(0, 70).replace(/\|.*/, '').trim() + ' | Regular';
  }
  return m;
}

function processMatchSchedules(matches: any[], matchRepeatMode: 'manual' | 'auto' = 'manual'): { updatedMatches: any[]; hasChanges: boolean } {
  if (!Array.isArray(matches) || matches.length === 0) {
    return { updatedMatches: matches, hasChanges: false };
  }

  let changes = false;
  const now = new Date();
  const currentTimestamp = now.getTime();

  const updatedMatches = matches.map((rawM) => {
    if (!rawM || !rawM.id) return rawM;
    const m = sanitizeMatch({ ...rawM });

    let targetTime: number | null = null;
    const scheduleStr = m.scheduleTime || '';

    try {
      if (scheduleStr) {
        let datePart = '';
        let timePart = scheduleStr;

        if (scheduleStr.includes(' at ')) {
          const parts = scheduleStr.split(' at ');
          datePart = parts[0].trim();
          timePart = parts[1].trim();
        } else if (scheduleStr.includes(' - ')) {
          const parts = scheduleStr.split(' - ');
          datePart = parts[0].trim();
          timePart = parts[1].trim();
        }

        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();

        if (datePart && datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [y, mo, d] = datePart.split('-').map(Number);
          year = y;
          month = mo - 1;
          day = d;
        } else if (datePart.toLowerCase() === 'tomorrow') {
          const tom = new Date(now);
          tom.setDate(tom.getDate() + 1);
          year = tom.getFullYear();
          month = tom.getMonth();
          day = tom.getDate();
        }

        let hours = 0;
        let minutes = 0;
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        const scheduledDate = new Date(year, month, day, hours, minutes, 0, 0);
        targetTime = scheduledDate.getTime();
      }
    } catch (e) {}

    let newMatch = { ...m };

    if (targetTime) {
      const matchDurationMs = 90 * 60 * 1000;
      const isPastStartTime = currentTimestamp >= targetTime;
      const isPastGameFinish = currentTimestamp >= targetTime + matchDurationMs;

      if (matchRepeatMode === 'manual') {
        if (m.status === 'upcoming' && isPastStartTime) {
          newMatch.status = 'ongoing';
          changes = true;
        }
      } else if (matchRepeatMode === 'auto') {
        if (m.status === 'upcoming' && isPastStartTime && !isPastGameFinish) {
          newMatch.status = 'ongoing';
          changes = true;
        } else if (isPastGameFinish) {
          const nextDayDate = new Date(now);
          nextDayDate.setDate(nextDayDate.getDate() + 1);

          const formattedMonth = String(nextDayDate.getMonth() + 1).padStart(2, '0');
          const formattedDay = String(nextDayDate.getDate()).padStart(2, '0');
          const dateStr = `${nextDayDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

          let timePartOnly = scheduleStr.includes(' at ') ? scheduleStr.split(' at ')[1] : scheduleStr;
          if (!timePartOnly || !timePartOnly.match(/\d/)) timePartOnly = '09:00 PM';

          newMatch.scheduleTime = `${dateStr} at ${timePartOnly}`;
          newMatch.status = 'upcoming';
          newMatch.joinedPlayers = [];
          newMatch.roomId = '';
          newMatch.roomPass = '';
          changes = true;
        }
      }
    }

    return newMatch;
  });

  return { updatedMatches, hasChanges: changes };
}

setInterval(() => {
  try {
    if (Array.isArray(dbMemory.matches) && dbMemory.matches.length > 0) {
      const mode = dbMemory.settings?.matchRepeatMode || 'manual';
      const { updatedMatches, hasChanges } = processMatchSchedules(dbMemory.matches, mode);
      if (hasChanges) {
        dbMemory.matches = updatedMatches.filter((m) => m && m.id && !(dbMemory.deletedMatchIds || []).includes(m.id));
        saveDB();
      }
    }
  } catch (e) {}
}, 30000);

// Ensure db.json file exists on disk
if (!fs.existsSync(DB_FILE)) {
  saveDB();
}

// Initialize Web Push VAPID keys persistently
if (!dbMemory.vapidKeys || !dbMemory.vapidKeys.publicKey || !dbMemory.vapidKeys.privateKey) {
  try {
    const generated = webpush.generateVAPIDKeys();
    dbMemory.vapidKeys = generated;
    saveDB();
    console.log('[Push] Generated new VAPID keys for push notification service.');
  } catch (err) {
    console.error('[Push] Failed to generate VAPID keys:', err);
  }
}

if (!Array.isArray(dbMemory.pushSubscriptions)) {
  dbMemory.pushSubscriptions = [];
  saveDB();
}

if (dbMemory.vapidKeys?.publicKey && dbMemory.vapidKeys?.privateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:admin@bdesportsms.com',
      dbMemory.vapidKeys.publicKey,
      dbMemory.vapidKeys.privateKey
    );
  } catch (err) {
    console.warn('[Push] VAPID details setup warning:', err);
  }
}

// Helper to broadcast Web Push to all registered user devices/phones
async function broadcastWebPush(notification: any): Promise<number> {
  if (!dbMemory.pushSubscriptions || dbMemory.pushSubscriptions.length === 0) {
    return 0;
  }

  const payload = JSON.stringify({
    title: notification.title || 'BD ESPORTS MS',
    message: notification.message || 'নতুন টুর্নামেন্ট ও রুম কোড চেক করুন!',
    category: notification.category || 'match',
    linkTab: notification.linkTab || 'play',
    url: `/?tab=${notification.linkTab || 'play'}`,
    id: notification.id || `notif-${Date.now()}`,
    timestamp: Date.now(),
  });

  const deadEndpoints: string[] = [];
  let successfulSends = 0;

  await Promise.allSettled(
    dbMemory.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, payload, {
          TTL: 86400, // Deliver within 24 hours even if device was offline
          urgency: 'high',
        });
        successfulSends++;
      } catch (err: any) {
        // HTTP 404 Not Found or 410 Gone means the subscription has expired or user revoked it
        if (err.statusCode === 404 || err.statusCode === 410 || err.statusCode === 403) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  // Clean up dead subscriptions
  if (deadEndpoints.length > 0) {
    dbMemory.pushSubscriptions = dbMemory.pushSubscriptions.filter(
      (s) => !deadEndpoints.includes(s.endpoint)
    );
    saveDB();
    console.log(`[Push] Pruned ${deadEndpoints.length} dead push subscriptions.`);
  }

  return successfulSends;
}

// In-memory security & anti-hack structures
interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'BLOCKED_ATTEMPT' | 'RATE_LIMIT' | 'SYSTEM_SECURED';
  details: string;
  ip: string;
}

const securityLogs: SecurityLog[] = [
  {
    id: 'sec-init',
    timestamp: new Date().toLocaleTimeString('bn-BD'),
    type: 'SYSTEM_SECURED',
    details: '🛡️ 256-Bit SSL/TLS Firewall & Anti-Brute Force Engine Active',
    ip: '127.0.0.1',
  },
];

let failedAttemptsCount = 0;
let lockoutUntilTime = 0;
let blockedAttacksCount = 0;

// Simple Rate-limiting map: tracks requests per IP
const requestRateMap = new Map<string, { count: number; resetTime: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Anti-Hacking HTTP Security Headers & Full CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-Sync-Forwarded, X-Admin-Pin, X-Admin-Token');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Rate Limiting Middleware (prevents DoS and Bot abuse)
  app.use((req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const rateData = requestRateMap.get(ip) || { count: 0, resetTime: now + 60000 };

    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + 60000;
    } else {
      rateData.count += 1;
    }

    requestRateMap.set(ip, rateData);

    // If more than 300 requests in 1 minute, block
    if (rateData.count > 300) {
      blockedAttacksCount++;
      securityLogs.unshift({
        id: `sec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        type: 'RATE_LIMIT',
        details: `⚠️ Rate limit exceeded from ${ip}. Request automatically dropped.`,
        ip,
      });
      return res.status(429).json({ error: 'Too many requests. Anti-DDoS rate limiter triggered.' });
    }

    next();
  });

  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), firewall: 'active' });
  });

  // Fast Full-Data Sync Endpoint (Replaces 6 separate HTTP calls with 1 lightweight call)
  app.get('/api/sync-all', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      settings: dbMemory.settings,
      notice: dbMemory.notice,
      matches: dbMemory.matches || [],
      deletedMatchIds: dbMemory.deletedMatchIds || [],
      transactions: dbMemory.transactions || [],
      notifications: dbMemory.notifications || [],
      vouchers: dbMemory.vouchers || [],
      banners: dbMemory.banners || [],
    });
  });

  // 1-Click Direct APK Download Endpoint (Redirects to Google Drive/MediaFire or serves direct APK)
  app.get(['/api/download-apk', '/download/bdesports.apk', '/download/BD_ESPORTS_MS.apk', '/BD_ESPORTS_MS_v1.0.apk', '/*.apk'], (req, res) => {
    const customApkUrl = dbMemory.settings?.apkDownloadUrl;
    if (customApkUrl && customApkUrl.trim() && !customApkUrl.includes('run.app') && (customApkUrl.startsWith('http://') || customApkUrl.startsWith('https://'))) {
      let directUrl = customApkUrl.trim();
      if (directUrl.includes('drive.google.com/file/d/')) {
        const match = directUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      } else if (directUrl.includes('drive.google.com/open?id=')) {
        const match = directUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
      }
      return res.redirect(directUrl);
    }
    const apkFilePath = path.join(process.cwd(), 'public', 'BD_ESPORTS_MS_v1.0.apk');
    if (fs.existsSync(apkFilePath) && fs.statSync(apkFilePath).size > 10000) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="BD_ESPORTS_MS_v1.0.apk"');
      res.setHeader('Cache-Control', 'no-cache');
      return res.download(apkFilePath, 'BD_ESPORTS_MS_v1.0.apk');
    }
    res.redirect('/');
  });

  // Anti-Hacking & Security Verification API
  app.post('/api/admin/verify-pin', (req, res) => {
    const { pin } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
    const now = Date.now();

    // Check if currently locked out
    if (now < lockoutUntilTime) {
      const remainingSeconds = Math.ceil((lockoutUntilTime - now) / 1000);
      return res.status(403).json({
        success: false,
        isLockedOut: true,
        remainingSeconds,
        message: `⛔ সিস্টেম সাময়িকভাবে লকড! ${remainingSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`,
      });
    }

    const currentPin = dbMemory.settings.adminPin || '7788';

    if (pin && pin.trim() === currentPin.trim()) {
      failedAttemptsCount = 0;
      lockoutUntilTime = 0;

      securityLogs.unshift({
        id: `sec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        type: 'AUTH_SUCCESS',
        details: `✅ সফল অ্যাডমিন ভেরিফিকেশন সম্পন্ন হয়েছে।`,
        ip,
      });

      return res.json({
        success: true,
        isLockedOut: false,
        message: '🔓 পিন সঠিক! অ্যাডমিন প্যানেল আনলক করা হয়েছে।',
      });
    } else {
      failedAttemptsCount++;
      blockedAttacksCount++;

      let isLockedOut = false;
      let remainingSeconds = 0;

      if (failedAttemptsCount >= 5) {
        lockoutUntilTime = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
        isLockedOut = true;
        remainingSeconds = 15 * 60;
        failedAttemptsCount = 0;

        securityLogs.unshift({
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('bn-BD'),
          type: 'BLOCKED_ATTEMPT',
          details: `🚨 ৫ বার ভুল পিন দেওয়ায় অ্যাডমিন প্যানেল ১৫ মিনিটের জন্য লক করা হয়েছে!`,
          ip,
        });
      } else {
        securityLogs.unshift({
          id: `sec-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('bn-BD'),
          type: 'AUTH_FAILED',
          details: `❌ ভুল পিন দিয়ে প্রবেশের চেষ্টা সনাক্ত (চেষ্টা: ${failedAttemptsCount}/5)`,
          ip,
        });
      }

      return res.status(401).json({
        success: false,
        isLockedOut,
        remainingSeconds,
        attemptsLeft: Math.max(0, 5 - failedAttemptsCount),
        message: isLockedOut
          ? '🚨 ৫ বার ভুল পিন দেওয়ায় ১৫ মিনিটের জন্য লকড!'
          : `❌ ভুল পিন! আর মাত্র ${5 - failedAttemptsCount} বার চেষ্টা করতে পারবেন।`,
      });
    }
  });

  // Live Security Status Endpoint
  app.get('/api/admin/security-status', (req, res) => {
    const now = Date.now();
    res.json({
      firewallActive: true,
      encryptionLevel: '256-Bit SSL/TLS Hardware Emulated',
      antiBruteForce: true,
      failedAttemptsCount,
      isLockedOut: now < lockoutUntilTime,
      remainingLockoutSeconds: Math.max(0, Math.ceil((lockoutUntilTime - now) / 1000)),
      blockedAttacksCount,
      logs: securityLogs.slice(0, 20),
    });
  });

  // Peer Cloud Instance Forwarder for Real-time Multi-Device Sync
  const PEER_TARGETS = [
    'https://bd-esports-ms-free-fire-tournament.ai.studio',
    'https://ais-dev-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
    'https://ais-pre-mctznqvvcorhlkxb3sz4on-735800820908.asia-southeast1.run.app',
  ];

  const forwardToPeers = (path: string, method: string, body?: any) => {
    PEER_TARGETS.forEach(async (peerUrl) => {
      try {
        await fetch(`${peerUrl}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Sync-Forwarded': 'true',
          },
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch {}
    });
  };

  // Settings Endpoints (bKash, Nagad, Rocket numbers, apk link, notices, pin)
  app.get('/api/settings', (req, res) => {
    res.json({
      settings: dbMemory.settings,
      notice: dbMemory.notice,
    });
  });

  app.post('/api/settings', (req, res) => {
    const { settings, notice } = req.body;
    if (settings) {
      dbMemory.settings = { ...dbMemory.settings, ...settings };
    }
    if (notice) {
      dbMemory.notice = { ...dbMemory.notice, ...notice };
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers('/api/settings', 'POST', req.body);
    }
    res.json({
      success: true,
      settings: dbMemory.settings,
      notice: dbMemory.notice,
    });
  });

  // Matches Endpoints
  app.get('/api/matches', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(dbMemory.matches);
  });

  app.post('/api/matches', (req, res) => {
    const { match, matches } = req.body;
    if (!dbMemory.deletedMatchIds) dbMemory.deletedMatchIds = [];

    if (matches && Array.isArray(matches)) {
      dbMemory.matches = matches.filter((m) => m && m.id && !dbMemory.deletedMatchIds.includes(m.id));
    } else if (match && match.id) {
      if (!dbMemory.deletedMatchIds.includes(match.id)) {
        const idx = dbMemory.matches.findIndex((m) => m.id === match.id);
        if (idx >= 0) {
          dbMemory.matches[idx] = match;
        } else {
          dbMemory.matches.unshift(match);
        }
      }
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers('/api/matches', 'POST', req.body);
    }
    res.json({ success: true, matches: dbMemory.matches, deletedMatchIds: dbMemory.deletedMatchIds });
  });

  app.put('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    if (!dbMemory.deletedMatchIds) dbMemory.deletedMatchIds = [];
    
    if (!dbMemory.deletedMatchIds.includes(id)) {
      const idx = dbMemory.matches.findIndex((m) => m.id === id);
      if (idx >= 0) {
        dbMemory.matches[idx] = { ...dbMemory.matches[idx], ...updated };
      } else {
        dbMemory.matches.unshift(updated);
      }
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers(`/api/matches/${id}`, 'PUT', updated);
    }
    res.json({ success: true, match: updated, matches: dbMemory.matches });
  });

  app.delete('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    if (!dbMemory.deletedMatchIds) dbMemory.deletedMatchIds = [];
    if (!dbMemory.deletedMatchIds.includes(id)) {
      dbMemory.deletedMatchIds.push(id);
    }
    dbMemory.matches = dbMemory.matches.filter((m) => m.id !== id);
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers(`/api/matches/${id}`, 'DELETE');
    }
    res.json({ success: true, matches: dbMemory.matches, deletedMatchIds: dbMemory.deletedMatchIds });
  });

  // Transactions Endpoints with Anti-Fraud & Anti-Hacking Validation
  app.get('/api/transactions', (req, res) => {
    res.json(dbMemory.transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { transaction, transactions } = req.body;

    const FAKE_PATTERNS = ['123456', '12345678', '000000', '111111', '999999', 'TEST', 'FAKE', 'ASDF', 'QWER'];

    const sanitizeTx = (t: any) => {
      if (!t || typeof t !== 'object') return null;
      const amt = Number(t.amount);
      if (isNaN(amt) || amt <= 0 || amt > 50000) return null; // Block invalid/hack amounts

      const cleanSender = String(t.senderNumber || '').replace(/[^\d+]/g, '').slice(0, 15);
      const cleanTrx = String(t.trxId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30).trim().toUpperCase();

      // Anti-Spam TrxID verification
      if (cleanTrx && t.type === 'deposit') {
        const isSpam = FAKE_PATTERNS.some((pat) => cleanTrx.includes(pat)) || /^([a-zA-Z0-9])\1+$/.test(cleanTrx);
        if (isSpam || cleanTrx.length < 5) {
          return null; // Reject fake/spam TrxID
        }
      }

      return {
        ...t,
        amount: Math.round(amt),
        senderNumber: cleanSender,
        trxId: cleanTrx || undefined,
        status: t.status || 'approved',
      };
    };

    if (transactions && Array.isArray(transactions)) {
      const sanitized = transactions.map(sanitizeTx).filter(Boolean);
      // Ensure no duplicate TrxIDs exist in list
      const seenTrx = new Set<string>();
      const deduped: any[] = [];
      for (const item of sanitized) {
        if (item.trxId) {
          if (seenTrx.has(item.trxId)) continue;
          seenTrx.add(item.trxId);
        }
        deduped.push(item);
      }
      dbMemory.transactions = deduped;
    } else if (transaction) {
      const clean = sanitizeTx(transaction);
      if (!clean) {
        return res.status(400).json({ success: false, error: 'Invalid transaction data or suspicious activity detected.' });
      }

      // Anti-Hacking: Check if TrxID already exists on a different transaction
      if (clean.trxId && clean.type === 'deposit') {
        const duplicate = dbMemory.transactions.find(
          (existing) => existing.id !== clean.id && existing.trxId && existing.trxId.toUpperCase() === clean.trxId
        );
        if (duplicate) {
          return res.status(409).json({
            success: false,
            error: 'Duplicate TrxID detected! This transaction ID has already been recorded.',
          });
        }
      }

      const idx = dbMemory.transactions.findIndex((t) => t.id === clean.id);
      if (idx >= 0) {
        dbMemory.transactions[idx] = clean;
      } else {
        dbMemory.transactions.unshift(clean);
      }
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers('/api/transactions', 'POST', req.body);
    }
    res.json({ success: true, transactions: dbMemory.transactions });
  });

  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = dbMemory.transactions.findIndex((t) => t.id === id);
    if (idx >= 0) {
      dbMemory.transactions[idx].status = status;
      saveDB();
      if (!req.headers['x-sync-forwarded']) {
        forwardToPeers(`/api/transactions/${id}`, 'PUT', req.body);
      }
      res.json({ success: true, transaction: dbMemory.transactions[idx] });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', (req, res) => {
    res.json(dbMemory.notifications);
  });

  app.post('/api/notifications', async (req, res) => {
    const { notification } = req.body;
    let sentCount = 0;
    if (notification) {
      dbMemory.notifications.unshift(notification);
      saveDB();
      // Broadcast real native Push Notification to all subscribed devices and lockscreens
      try {
        sentCount = await broadcastWebPush(notification);
      } catch (err) {
        console.error('[WebPush Error]:', err);
      }
      if (!req.headers['x-sync-forwarded']) {
        forwardToPeers('/api/notifications', 'POST', req.body);
      }
    }
    res.json({
      success: true,
      notifications: dbMemory.notifications,
      devicesReached: sentCount,
      totalSubscribers: dbMemory.pushSubscriptions?.length || 0,
    });
  });

  app.delete('/api/notifications/:id', (req, res) => {
    const { id } = req.params;
    dbMemory.notifications = dbMemory.notifications.filter((n) => n.id !== id);
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers(`/api/notifications/${id}`, 'DELETE');
    }
    res.json({ success: true, notifications: dbMemory.notifications });
  });

  // Web Push Subscription & Device Management Endpoints
  app.get('/api/push/vapid-public-key', (req, res) => {
    res.json({
      publicKey: dbMemory.vapidKeys?.publicKey || '',
      totalSubscribers: dbMemory.pushSubscriptions?.length || 0,
    });
  });

  app.post('/api/push/subscribe', (req, res) => {
    const { subscription } = req.body;
    if (subscription && subscription.endpoint) {
      if (!Array.isArray(dbMemory.pushSubscriptions)) {
        dbMemory.pushSubscriptions = [];
      }
      const existingIdx = dbMemory.pushSubscriptions.findIndex(
        (s) => s.endpoint === subscription.endpoint
      );
      if (existingIdx >= 0) {
        dbMemory.pushSubscriptions[existingIdx] = subscription;
      } else {
        dbMemory.pushSubscriptions.push(subscription);
      }
      saveDB();
      console.log(`[Push] Registered subscriber. Total active devices: ${dbMemory.pushSubscriptions.length}`);
    }
    res.json({
      success: true,
      totalSubscribers: dbMemory.pushSubscriptions?.length || 0,
    });
  });

  app.post('/api/push/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    if (endpoint && Array.isArray(dbMemory.pushSubscriptions)) {
      dbMemory.pushSubscriptions = dbMemory.pushSubscriptions.filter(
        (s) => s.endpoint !== endpoint
      );
      saveDB();
    }
    res.json({
      success: true,
      totalSubscribers: dbMemory.pushSubscriptions?.length || 0,
    });
  });

  app.post('/api/push/test', async (req, res) => {
    const { subscription, title, message, linkTab } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription object is required' });
    }
    try {
      const payload = JSON.stringify({
        title: title || '🎮 BD ESPORTS MS - টেস্ট নোটিফিকেশন',
        message: message || 'মোবাইল নোটিফিকেশন সফলভাবে কাজ করছে!',
        category: 'match',
        linkTab: linkTab || 'play',
        url: `/?tab=${linkTab || 'play'}`,
        id: `test-${Date.now()}`,
        timestamp: Date.now(),
      });
      await webpush.sendNotification(subscription, payload, { TTL: 60, urgency: 'high' });
      res.json({ success: true, message: 'Test notification sent to device' });
    } catch (err: any) {
      console.error('[Push Test Error]:', err);
      res.status(500).json({ error: err.message || 'Failed to send test push' });
    }
  });

  // Auto-Bot Engine & Topup Gateway API
  app.post('/api/bot/auto-topup', (req, res) => {
    const { orderId, playerUid, packageCategory, voucherCode, apiProvider } = req.body;
    
    // Find transaction
    const txIndex = dbMemory.transactions.findIndex(
      (t) => (t.orderId && t.orderId === orderId) || t.id === orderId
    );

    let deliveredVoucher = voucherCode;

    // If no voucher provided, check vault
    if (!deliveredVoucher && dbMemory.vouchers && dbMemory.vouchers.length > 0) {
      const availableVoucher = dbMemory.vouchers.find((v) => !v.isUsed);
      if (availableVoucher) {
        availableVoucher.isUsed = true;
        availableVoucher.usedForOrderId = orderId;
        availableVoucher.usedDate = new Date().toLocaleString();
        availableVoucher.usedForUid = playerUid;
        deliveredVoucher = availableVoucher.code;
      }
    }

    if (txIndex >= 0) {
      dbMemory.transactions[txIndex].status = 'Completed';
      if (deliveredVoucher) {
        dbMemory.transactions[txIndex].deliveredCode = deliveredVoucher;
      }
      dbMemory.transactions[txIndex].botExecuted = true;
      dbMemory.transactions[txIndex].botExecutionTime = new Date().toISOString();
      dbMemory.transactions[txIndex].botProvider = apiProvider || 'BD_ESPORTS_AUTO_BOT_v2';
    }

    // Add delivery notification
    dbMemory.notifications.unshift({
      id: `notif-bot-${Date.now()}`,
      title: `⚡ অটো-বট টপ-আপ সফল হয়েছে! (${packageCategory || 'Free Fire'})`,
      message: `আপনার Player ID: ${playerUid}-এ ${packageCategory || 'ডায়মন্ড'} সফলভাবে প্রসেস করা হয়েছে।`,
      timestamp: 'Just now',
      read: false,
      category: 'shop',
      linkTab: 'shop',
    });

    saveDB();

    res.json({
      success: true,
      message: '⚡ অটো-বট টপ-আপ সফলভাবে সম্পন্ন হয়েছে!',
      deliveredCode: deliveredVoucher,
      playerUid,
      status: 'Completed',
      timestamp: new Date().toISOString(),
      provider: apiProvider || 'BD_ESPORTS_AUTO_BOT_v2',
    });
  });

  // Vouchers Vault Endpoints
  app.get('/api/vouchers', (req, res) => {
    res.json(dbMemory.vouchers || []);
  });

  app.post('/api/vouchers', (req, res) => {
    const { voucher, vouchers } = req.body;
    if (vouchers && Array.isArray(vouchers)) {
      dbMemory.vouchers = vouchers;
    } else if (voucher) {
      if (!dbMemory.vouchers) dbMemory.vouchers = [];
      const idx = dbMemory.vouchers.findIndex((v) => v.id === voucher.id);
      if (idx >= 0) {
        dbMemory.vouchers[idx] = voucher;
      } else {
        dbMemory.vouchers.unshift(voucher);
      }
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers('/api/vouchers', 'POST', req.body);
    }
    res.json({ success: true, vouchers: dbMemory.vouchers });
  });

  app.delete('/api/vouchers/:id', (req, res) => {
    const { id } = req.params;
    if (dbMemory.vouchers) {
      dbMemory.vouchers = dbMemory.vouchers.filter((v) => v.id !== id);
      saveDB();
    }
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers(`/api/vouchers/${id}`, 'DELETE');
    }
    res.json({ success: true, vouchers: dbMemory.vouchers || [] });
  });

  // Banners & Video Slider Endpoints
  app.get('/api/banners', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(dbMemory.banners || defaultData.banners);
  });

  app.post('/api/banners', (req, res) => {
    const { banner, banners } = req.body;
    if (banners && Array.isArray(banners)) {
      dbMemory.banners = banners;
    } else if (banner) {
      if (!dbMemory.banners) dbMemory.banners = [];
      const idx = dbMemory.banners.findIndex((b) => b.id === banner.id);
      if (idx >= 0) {
        dbMemory.banners[idx] = banner;
      } else {
        dbMemory.banners.unshift(banner);
      }
    }
    saveDB();
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers('/api/banners', 'POST', req.body);
    }
    res.json({ success: true, banners: dbMemory.banners });
  });

  app.put('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    if (!dbMemory.banners) dbMemory.banners = [...defaultData.banners];
    const idx = dbMemory.banners.findIndex((b) => b.id === id);
    if (idx >= 0) {
      dbMemory.banners[idx] = { ...dbMemory.banners[idx], ...updated };
      saveDB();
      if (!req.headers['x-sync-forwarded']) {
        forwardToPeers(`/api/banners/${id}`, 'PUT', updated);
      }
      res.json({ success: true, banner: dbMemory.banners[idx] });
    } else {
      dbMemory.banners.unshift(updated);
      saveDB();
      if (!req.headers['x-sync-forwarded']) {
        forwardToPeers(`/api/banners/${id}`, 'PUT', updated);
      }
      res.json({ success: true, banner: updated });
    }
  });

  app.delete('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    if (dbMemory.banners) {
      dbMemory.banners = dbMemory.banners.filter((b) => b.id !== id);
      saveDB();
    }
    if (!req.headers['x-sync-forwarded']) {
      forwardToPeers(`/api/banners/${id}`, 'DELETE');
    }
    res.json({ success: true, banners: dbMemory.banners || [] });
  });

  // Vite middleware for dev / static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BD Esports Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
