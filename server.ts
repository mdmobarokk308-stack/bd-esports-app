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
    bkashNumber: '01712345678',
    nagadNumber: '01812345678',
    rocketNumber: '019999888775',
    telegramLink: 'https://t.me/esportsclubbd',
    apkDownloadUrl: '/BD_ESPORTS_MS_v1.0.apk',
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
  matches: [],
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
  vouchers: [
    {
      id: 'VV-101',
      code: 'UPBD-FF115-8849-2109-7731',
      packageCategory: '115 Diamonds',
      addedDate: new Date().toLocaleDateString(),
      isUsed: false,
      note: 'UniPin BD Voucher (Stock)',
    },
    {
      id: 'VV-102',
      code: 'UPBD-FF240-9921-4321-1102',
      packageCategory: '240 Diamonds',
      addedDate: new Date().toLocaleDateString(),
      isUsed: false,
      note: 'UniPin BD Voucher (Stock)',
    },
    {
      id: 'VV-103',
      code: 'UPBD-WKLY-7712-9900-5544',
      packageCategory: 'Weekly Pass',
      addedDate: new Date().toLocaleDateString(),
      isUsed: false,
      note: 'UniPin BD Weekly Pass (Stock)',
    },
  ],
};

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...defaultData,
        ...parsed,
        settings: { ...defaultData.settings, ...(parsed.settings || {}) },
        notice: { ...defaultData.notice, ...(parsed.notice || {}) },
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

  // Transactions Endpoints
  app.get('/api/transactions', (req, res) => {
    res.json(dbMemory.transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { transaction, transactions } = req.body;
    if (transactions && Array.isArray(transactions)) {
      dbMemory.transactions = transactions;
    } else if (transaction) {
      const idx = dbMemory.transactions.findIndex((t) => t.id === transaction.id);
      if (idx >= 0) {
        dbMemory.transactions[idx] = transaction;
      } else {
        dbMemory.transactions.unshift(transaction);
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
