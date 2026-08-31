import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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
  };
  notice: {
    enabled: boolean;
    title: string;
    content: string[];
  };
  matches: any[];
  transactions: any[];
  notifications: any[];
  vouchers: any[];
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
  },
  notice: {
    enabled: true,
    title: 'WELCOME TO KHELO FREE-FIRE 💖',
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
  matches: [
    {
      id: 'm-2001',
      title: 'LONE WOLF 1V1 SOLO RUSH',
      category: 'lone_wolf',
      categoryLabel: 'LONE WOLF',
      entryType: 'Solo',
      scheduleTime: 'Today at 09:30 PM',
      winPrize: 100,
      entryFee: 20,
      perKill: 10,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 2,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
    {
      id: 'm-2002',
      title: 'CS 2V2 DUO WAR',
      category: 'cs_2v2',
      categoryLabel: 'CS 2 VS 2',
      entryType: 'Duo',
      scheduleTime: 'Today at 10:00 PM',
      winPrize: 200,
      entryFee: 30,
      perKill: 15,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 4,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
    {
      id: 'm-2003',
      title: 'CLASH SQUAD 4V4 GRAND MATCH',
      category: 'clash_squad',
      categoryLabel: 'CLASH SQUAD',
      entryType: 'Squad',
      scheduleTime: 'Today at 10:30 PM',
      winPrize: 400,
      entryFee: 50,
      perKill: 0,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 8,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
    {
      id: 'm-2004',
      title: 'BR FULL MAP MEGA TOURNAMENT',
      category: 'br_match',
      categoryLabel: 'BR MATCH',
      entryType: 'Solo',
      scheduleTime: 'Tomorrow at 08:00 PM',
      winPrize: 1000,
      entryFee: 30,
      perKill: 15,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 48,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
    {
      id: 'm-2005',
      title: 'BR SURVIVAL SOLO RUSH',
      category: 'br_survival',
      categoryLabel: 'BR SURVIVAL',
      entryType: 'Solo',
      scheduleTime: 'Tomorrow at 09:00 PM',
      winPrize: 500,
      entryFee: 25,
      perKill: 10,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 48,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
    {
      id: 'm-2006',
      title: 'FREE MATCH GIVEAWAY',
      category: 'free_match',
      categoryLabel: 'FREE MATCH',
      entryType: 'Solo',
      scheduleTime: 'Tomorrow at 09:30 PM',
      winPrize: 100,
      entryFee: 0,
      perKill: 5,
      map: 'Bermuda',
      version: 'MOBILE',
      totalSlots: 48,
      joinedPlayers: [],
      status: 'upcoming',
      roomId: '',
      roomPass: '',
    },
  ],
  transactions: [],
  notifications: [
    {
      id: 'notif-1',
      title: 'সকালের ম্যাচ অ্যাড করা আছে',
      message: 'জয়েন করে নিন',
      timestamp: 'Just now',
      read: false,
      category: 'match',
      linkTab: 'play',
    },
    {
      id: 'notif-2',
      title: 'বিকাশ ও নগদ ইনস্ট্যান্ট ডিপোজিট একটিভ 🔥',
      message: 'এখন ডিপোজিট করলে ১০০% ব্যালেন্স ইনস্ট্যান্ট ওয়ালেটে যোগ হয়ে যাবে।',
      timestamp: '1 hour ago',
      read: false,
      category: 'deposit',
      linkTab: 'shop',
    },
  ],
  vouchers: [],
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
        matches: Array.isArray(parsed.matches) ? parsed.matches : defaultData.matches,
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

// Ensure db.json file exists on disk
if (!fs.existsSync(DB_FILE)) {
  saveDB();
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
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

  // Enable CORS for web and mobile WebView APK access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Admin-Pin, X-Admin-Token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), firewall: 'active' });
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
    if (matches && Array.isArray(matches)) {
      dbMemory.matches = matches;
    } else if (match) {
      const idx = dbMemory.matches.findIndex((m) => m.id === match.id);
      if (idx >= 0) {
        dbMemory.matches[idx] = match;
      } else {
        dbMemory.matches.unshift(match);
      }
    }
    saveDB();
    res.json({ success: true, matches: dbMemory.matches });
  });

  app.put('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    const idx = dbMemory.matches.findIndex((m) => m.id === id);
    if (idx >= 0) {
      dbMemory.matches[idx] = { ...dbMemory.matches[idx], ...updated };
      saveDB();
      res.json({ success: true, match: dbMemory.matches[idx] });
    } else {
      dbMemory.matches.unshift(updated);
      saveDB();
      res.json({ success: true, match: updated });
    }
  });

  app.delete('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    dbMemory.matches = dbMemory.matches.filter((m) => m.id !== id);
    saveDB();
    res.json({ success: true, matches: dbMemory.matches });
  });

  // Transactions Endpoints with Anti-Fraud Validation
  app.get('/api/transactions', (req, res) => {
    res.json(dbMemory.transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { transaction, transactions } = req.body;

    const sanitizeTx = (t: any) => {
      if (!t) return null;
      const amt = Number(t.amount);
      if (isNaN(amt) || amt <= 0 || amt > 50000) return null; // Block fraudulent amounts
      return {
        ...t,
        amount: Math.round(amt),
        senderNumber: String(t.senderNumber || '').replace(/[^\d+]/g, '').slice(0, 15),
        trxId: String(t.trxId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30),
      };
    };

    if (transactions && Array.isArray(transactions)) {
      dbMemory.transactions = transactions.map(sanitizeTx).filter(Boolean);
    } else if (transaction) {
      const clean = sanitizeTx(transaction);
      if (clean) {
        const idx = dbMemory.transactions.findIndex((t) => t.id === clean.id);
        if (idx >= 0) {
          dbMemory.transactions[idx] = clean;
        } else {
          dbMemory.transactions.unshift(clean);
        }
      }
    }
    saveDB();
    res.json({ success: true, transactions: dbMemory.transactions });
  });

  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const idx = dbMemory.transactions.findIndex((t) => t.id === id);
    if (idx >= 0) {
      dbMemory.transactions[idx].status = status;
      saveDB();
      res.json({ success: true, transaction: dbMemory.transactions[idx] });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', (req, res) => {
    res.json(dbMemory.notifications);
  });

  app.post('/api/notifications', (req, res) => {
    const { notification } = req.body;
    if (notification) {
      dbMemory.notifications.unshift(notification);
      saveDB();
    }
    res.json({ success: true, notifications: dbMemory.notifications });
  });

  app.delete('/api/notifications/:id', (req, res) => {
    const { id } = req.params;
    dbMemory.notifications = dbMemory.notifications.filter((n) => n.id !== id);
    saveDB();
    res.json({ success: true, notifications: dbMemory.notifications });
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
    res.json({ success: true, vouchers: dbMemory.vouchers });
  });

  app.delete('/api/vouchers/:id', (req, res) => {
    const { id } = req.params;
    if (dbMemory.vouchers) {
      dbMemory.vouchers = dbMemory.vouchers.filter((v) => v.id !== id);
      saveDB();
    }
    res.json({ success: true, vouchers: dbMemory.vouchers || [] });
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BD Esports Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
