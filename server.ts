import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'db.json') 
  : path.join(__dirname, 'db.json');

// Initial DB state
const initialData = {
  users: {}, 
  recharges: [], 
  webhookLogs: [], 
  winners: [],
  inbox: {},
  currentEnvelope: null,
  activeShakeEvent: false,
  vouchers: {
    'BENTOFREE': { amount: 5000, qty: 100, usedBy: [] },
    'QUATANG': { amount: 10000, qty: 50, usedBy: [] }
  },
  config: {
    winRate: 0.01, 
    jackpotAmount: 1000000,
    upgradeRate: 0.40,
    scheduleWinRate: {
        enabled: false,
        schedules: []
    },
    spinRates: {
      none: 0.45,
      coin10k: 0.25,
      coin20k: 0.15,
      coin50k: 0.10,
      item: 0.04,
      jackpot: 0.01
    },
    prices: [
      { id: 'box50', name: 'Túi Mù 50k', price: 50000, color: 'bg-red-500' },
      { id: 'box100', name: 'Túi Mù 100k', price: 100000, color: 'bg-yellow-500' },
      { id: 'box200', name: 'Túi Mù 200k', price: 200000, color: 'bg-blue-500' },
      { id: 'ipad99', name: 'iPad M4 99k', price: 99000, color: 'bg-emerald-500' },
      { id: 'ipad199', name: 'iPad M4 199k', price: 199000, color: 'bg-cyan-500' },
      { id: 'ipad499', name: 'iPad M4 499k', price: 499000, color: 'bg-fuchsia-500' },
    ],
    paymentInfo: {
      momo: { phone: '0987654321', name: 'NGUYEN VAN A', qrUrl: '' },
      bank: { account: '0123456789', name: 'NGUYEN VAN A', bankName: 'MB BANK', bankBin: '970422', qrUrl: '' }
    }
  },
  publicHistory: [
    { tiktokId: '@annguyen', prize: 'iPhone 15', time: new Date().toISOString() },
    { tiktokId: '@hoang_game', prize: 'Rất tiếc', time: new Date().toISOString() },
  ]
};

import { initializeApp as initAdminApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp as initClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, doc as docClient, getDoc as getDocClient, setDoc as setDocClient } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));
const isRemixed = firebaseConfig.projectId === 'remixed-project-id' || !firebaseConfig.projectId;

let dbClient: any = null;
let dbAdmin: any = null;

if (!isRemixed) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     try {
       let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
       if ((serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) || (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"'))) {
         serviceAccountStr = serviceAccountStr.slice(1, -1);
       }
       if (serviceAccountStr.startsWith('ew')) { // base64 encoded starts with ew
         try {
           serviceAccountStr = Buffer.from(serviceAccountStr, 'base64').toString('utf8');
         } catch(e) {}
       }
       let serviceAccount;
       try {
         serviceAccount = JSON.parse(serviceAccountStr);
         while (typeof serviceAccount === 'string') {
           serviceAccount = JSON.parse(serviceAccount);
         }
       } catch (e) {
           throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ' + (e as Error).message);
       }
       if (typeof serviceAccount !== 'object' || serviceAccount === null || !serviceAccount.project_id) {
           throw new Error('Service account must be a valid object with project_id');
       }
       const adminApp = initAdminApp({
         credential: cert(serviceAccount),
         projectId: firebaseConfig.projectId,
       });
       // Need to handle databaseId for admin SDK if possible, but Firestore constructor supports it
       dbAdmin = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
       console.log('Firebase initialized securely with Admin SDK');
     } catch (e) {
       console.error('Failed to initialize Firebase Admin, fallback to client mode', (e as Error).message);
     }
  } 
  
  if (!dbAdmin) {
     const clientApp = initClientApp(firebaseConfig);
     dbClient = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);
     console.warn('WARNING: Running Firebase via unauthenticated client SDK. Requires open Firestore Rules. Add FIREBASE_SERVICE_ACCOUNT_KEY to secure.');
  }
}

function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In server.ts we throw the error so the API can return 500
  throw new Error(JSON.stringify(errInfo));
}

let localDbCache = initialData;
const LOCAL_DB_PATH = '/tmp/db.json';

async function readDB() {
  if (isRemixed) {
     try {
       if (fs.existsSync(LOCAL_DB_PATH)) {
         return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
       }
       return localDbCache;
     } catch(e) {
       return localDbCache;
     }
  }

  try {
    if (dbAdmin) {
       const docSnap = await dbAdmin.collection('app').doc('db').get();
       if (docSnap.exists) {
         return docSnap.data();
       } else {
         await dbAdmin.collection('app').doc('db').set(initialData);
         return initialData;
       }
    } else {
       const docRef = docClient(dbClient, 'app', 'db');
       const docSnap = await getDocClient(docRef);
       if (docSnap.exists()) {
         return docSnap.data();
       } else {
         await setDocClient(docRef, initialData);
         return initialData;
       }
    }
  } catch (e) {
    handleFirestoreError(e, 'get', 'app/db');
    return initialData; // fallback gracefully
  }
}

async function writeDB(data: any) {
  if (isRemixed) {
    localDbCache = data;
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data));
    } catch(e) {}
    return;
  }

  try {
    if (dbAdmin) {
       await dbAdmin.collection('app').doc('db').set(data);
    } else {
       const docRef = docClient(dbClient, 'app', 'db');
       await setDocClient(docRef, data);
    }
  } catch (e) {
    handleFirestoreError(e, 'write', 'app/db');
  }
}

const globalEvents: { id: string, message: string, timestamp: number }[] = [];

function pushEvent(message: string) {
  globalEvents.push({ id: Date.now().toString() + Math.random(), message, timestamp: Date.now() });
  if (globalEvents.length > 50) globalEvents.shift();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  app.get('/api/global-events', async (req, res) => {
    const since = parseInt(req.query.since as string) || 0;
    const newEvents = globalEvents.filter(e => e.timestamp > since);
    res.json(newEvents);
  });
  
  app.post('/api/daily-checkin', async (req, res) => {
    const { tiktokId } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const last = user.lastCheckin ? new Date(user.lastCheckin) : null;
    
    if (last && now.getTime() - last.getTime() < 24 * 60 * 60 * 1000) {
      const waitTime = Math.ceil((24 * 60 * 60 * 1000 - (now.getTime() - last.getTime())) / (60 * 60 * 1000));
      return res.status(400).json({ error: `Bạn đã điểm danh rồi. Thử lại sau ${waitTime} giờ.` });
    }

    if (last && now.getTime() - last.getTime() > 48 * 60 * 60 * 1000) {
      user.checkinStreak = 0;
    }
    user.checkinStreak = (user.checkinStreak || 0) + 1;

    const reward = 500 + Math.floor(Math.random() * 501); 
    user.balance += reward;
    user.lastCheckin = now.toISOString();
    
    let bonusStr = "";
    if (user.checkinStreak >= 7) {
       user.fragments = (user.fragments || 0) + 10;
       user.checkinStreak = 0;
       bonusStr = " & Quà chuỗi 7 ngày: +10 Mảnh ghép iPhone!";
    }

    await writeDB(db);
    res.json({ success: true, reward, balance: user.balance, streak: user.checkinStreak, message: `Điểm danh thành công! +${reward}đ${bonusStr}` });
  });

  app.post('/api/admin/clear-logs', async (req, res) => {
    const db = await readDB();
    db.webhookLogs = [];
    await writeDB(db);
    res.json({ success: true });
  });

  app.post('/api/withdraw', async (req, res) => {
    const { tiktokId, amount, bank, account } = req.body;
    if (!tiktokId || !amount || !bank || !account) return res.status(400).json({ error: 'Missing information' });
    const db = await readDB();
    const searchId = tiktokId.toLowerCase().replace(/^@/, '');
    const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === searchId);
    
    if (!userKey) return res.status(404).json({ error: 'User not found' });
    const user = db.users[userKey];
    
    if (user.balance < amount) return res.status(400).json({ error: 'Insuffient balance' });
    
    user.balance -= amount;
    
    if (!db.withdrawals) db.withdrawals = [];
    db.withdrawals.push({
       id: `W_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
       tiktokId: userKey,
       amount,
       bank,
       account,
       status: 'pending',
       createdAt: new Date().toISOString()
    });
    
    await writeDB(db);
    res.json({ success: true, balance: user.balance });
  });

  app.post('/api/use-voucher', async (req, res) => {
    const { tiktokId, code } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const voucher = db.vouchers[code.toUpperCase()];
    if (!voucher) return res.status(400).json({ error: 'Mã voucher không tồn tại' });
    if (voucher.qty <= 0) return res.status(400).json({ error: 'Mã voucher đã hết lượt sử dụng' });
    if (voucher.usedBy.includes(tiktokId)) return res.status(400).json({ error: 'Bạn đã sử dụng voucher này rồi' });

    user.balance += voucher.amount;
    voucher.qty -= 1;
    voucher.usedBy.push(tiktokId);
    await writeDB(db);
    res.json({ success: true, amount: voucher.amount, balance: user.balance });
  });

  // Admin Vouchers List
  app.get('/api/admin/vouchers', async (req, res) => {
    const db = await readDB();
    res.json(db.vouchers || {});
  });

  // Admin Create Voucher
  app.post('/api/admin/vouchers', async (req, res) => {
    const { code, amount, qty } = req.body;
    if (!code || !amount || !qty) return res.status(400).json({ error: 'Thiếu thông tin' });
    const db = await readDB();
    if (!db.vouchers) db.vouchers = {};
    db.vouchers[code.toUpperCase()] = {
      amount: parseInt(amount),
      qty: parseInt(qty),
      usedBy: []
    };
    await writeDB(db);
    res.json({ success: true });
  });

  // Admin Delete Voucher
  app.delete('/api/admin/vouchers/:code', async (req, res) => {
    const db = await readDB();
    const code = req.params.code.toUpperCase();
    if (db.vouchers && db.vouchers[code]) {
      delete db.vouchers[code];
      await writeDB(db);
    }
    res.json({ success: true });
  });

  app.get('/api/admin/stats', async (req, res) => {
    const db = await readDB();
    const stats = {
      totalUsers: Object.keys(db.users).length,
      totalBalance: Object.values(db.users).reduce((acc: number, u: any) => acc + (u.balance || 0), 0),
      totalWinners: db.winners.length,
      pendingRecharges: db.recharges.filter((r: any) => r.status === 'waiting').length,
      totalRevenue: db.recharges.filter((r: any) => r.status === 'success').reduce((acc: number, r: any) => acc + (r.amount || 0), 0)
    };
    res.json(stats);
  });

  app.post('/api/login', async (req, res) => {
    const { tiktokId, pin, referredBy } = req.body;
    if (!tiktokId) return res.status(400).json({ error: 'TikTok ID is required' });

    const db = await readDB();
    const user = db.users[tiktokId];

    // Cấp quyền admin trực tiếp nếu Tiktok ID là một trong số những ID admin
    const isAdmin = tiktokId.toLowerCase() === 'admin' 
      || tiktokId.toLowerCase() === 'thinhkhongvuihhh1' 
      || tiktokId.toLowerCase() === 'thaonhi03032014';

    if (!user) {
      if (!pin) return res.json({ tiktokId, needsPin: true, isNew: true });
      
      db.users[tiktokId] = { 
        balance: 0, 
        winners: [], 
        pin, 
        lastCheckin: null, 
        referrals: 0, 
        referralHistory: [],
        referredBy: (referredBy && referredBy !== tiktokId && db.users[referredBy]) ? referredBy : null,
        role: isAdmin ? 'admin' : 'user',
        referralCode: tiktokId.toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()
      };
      
      pushEvent(`Thành viên mới ${tiktokId} vừa gia nhập cộng đồng! 👋`);
      await writeDB(db);
      return res.json({ tiktokId, ...db.users[tiktokId], notifications: [] });
    }

    if (!pin) return res.json({ tiktokId, needsPin: true, isNew: false });
    
    if (user.pin !== pin) {
      return res.status(401).json({ error: 'Mã PIN không chính xác' });
    }

    // Auto update role to admin if matching
    if (isAdmin && user.role !== 'admin') {
      user.role = 'admin';
    }
    
    // Ensure referralCode exists
    if (!user.referralCode) {
        user.referralCode = tiktokId.toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        await writeDB(db);
    }

    const notifications = user.notifications || [];
    user.notifications = []; 
    await writeDB(db);
    res.json({ tiktokId, ...user, notifications });
  });

  app.post('/api/webhook/payment', async (req, res) => {
    console.log('[PAYMENT] Webhook received:', JSON.stringify(req.body));

    const db = await readDB();
    if (!db.webhookLogs) db.webhookLogs = [];
    db.webhookLogs.unshift({
      time: new Date().toISOString(),
      body: req.body,
      ip: req.ip
    });
    if (db.webhookLogs.length > 50) db.webhookLogs.pop(); 
    await writeDB(db); 

    let transactions = [];
    if (req.body.data) {
      transactions = Array.isArray(req.body.data) ? req.body.data : [req.body.data];
    } else if (Array.isArray(req.body)) {
      transactions = req.body;
    } else {
      transactions = [req.body];
    }

    let successCount = 0;

    for (const trx of transactions) {
      const rawAmount = trx.amount ?? trx.amount_in ?? trx.value ?? trx.transaction_amount ?? 0;
      const amount = parseInt(rawAmount.toString().replace(/[^0-9]/g, '')) || 0;
      const description = (trx.description ?? trx.content ?? trx.memo ?? trx.transaction_content ?? '').toString().toUpperCase();
      const status = (trx.status ?? trx.status_name ?? trx.success ?? '').toString().toUpperCase();
      const referenceId = (trx.referenceId ?? trx.id ?? trx.tid ?? Date.now().toString()).toString();

      const isDuplicate = db.recharges.some((r: any) => r.referenceId === referenceId && r.status === 'success');
      if (isDuplicate) continue;

      const isPaid = status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED' || status === 'TRUE' || status === '1' || !status;

      if (!isPaid || amount <= 0) continue;

      const match = description.match(/(?:NAP|MD)[\s:\-_]+([@A-Z0-9_.]+)?/i);
      if (match && match[1]) {
        const rawId = match[1].toLowerCase().replace(/^@/, '');
        const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === rawId);
        
        if (userKey) {
          const user = db.users[userKey];
          user.balance += amount;
          
          if (user.referredBy && db.users[user.referredBy]) {
            const referrer = db.users[user.referredBy];
            const commission = Math.floor(amount * 0.1); 
            referrer.balance += commission;
            if (!referrer.notifications) referrer.notifications = [];
            referrer.notifications.push(`🎉 Hoa hồng giới thiệu: +${commission.toLocaleString()}đ (từ ${userKey})`);
            if (!referrer.referralHistory) referrer.referralHistory = [];
            referrer.referralHistory.push({
              invitedUser: userKey,
              bonus: commission,
              date: new Date().toISOString()
            });
            referrer.referrals = (referrer.referrals || 0) + 1;
          }
          
          db.recharges.push({
            id: 'AUTO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            referenceId: referenceId, 
            tiktokId: userKey,
            type: 'BANK_AUTO',
            amount: amount,
            code: description,
            status: 'success',
            createdAt: new Date().toISOString()
          });
          
          successCount++;
        }
      }
    }

    if (successCount > 0) await writeDB(db);
    res.json({ success: true, processed: successCount });
  });

  app.get('/api/notifications/:id', async (req, res) => {
    const db = await readDB();
    const searchId = req.params.id.toLowerCase().replace(/^@/, '');
    const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === searchId);
    const user = userKey ? db.users[userKey] : null;
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const notifications = user.notifications || [];
    user.notifications = []; 
    await writeDB(db);
    res.json(notifications);
  });

  app.get('/api/admin/webhook-logs', async (req, res) => {
    const db = await readDB();
    res.json(db.webhookLogs || []);
  });

  app.get('/api/user/:id', async (req, res) => {
    const db = await readDB();
    const searchId = req.params.id.toLowerCase().replace(/^@/, '');
    const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === searchId);
    const user = userKey ? db.users[userKey] : null;
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ tiktokId: userKey, ...user });
  });

  app.post('/api/update-profile', async (req, res) => {
    const { tiktokId, shopName, avatarUrl, phone, address } = req.body;
    if (!tiktokId) return res.status(400).json({ error: 'TikTok ID required' });
    const db = await readDB();
    const searchId = tiktokId.toLowerCase().replace(/^@/, '');
    const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === searchId);
    
    if (!userKey) return res.status(404).json({ error: 'User not found' });
    
    if (shopName !== undefined) db.users[userKey].shopName = shopName;
    if (avatarUrl !== undefined) db.users[userKey].avatarUrl = avatarUrl;
    if (phone !== undefined) db.users[userKey].phone = phone;
    if (address !== undefined) db.users[userKey].address = address;
    
    await writeDB(db);
    res.json({ success: true, user: { tiktokId: userKey, ...db.users[userKey] } });
  });

  app.post('/api/mission/claim', async (req, res) => {
    const { tiktokId, missionId } = req.body;
    if (!tiktokId || !missionId) return res.status(400).json({ error: 'Missing parameters' });
    
    const db = await readDB();
    const searchId = tiktokId.toLowerCase().replace(/^@/, '');
    const userKey = Object.keys(db.users).find(k => k.toLowerCase().replace(/^@/, '') === searchId);
    
    if (!userKey) return res.status(404).json({ error: 'User not found' });
    const user = db.users[userKey];
    
    if (!user.claimedMissions) user.claimedMissions = [];

    if (user.claimedMissions.includes(missionId)) {
       return res.status(400).json({ error: 'Bạn đã nhận thưởng nhiệm vụ này rồi!' });
    }

    let reward = 0;
    let message = '';

    if (missionId === 'first_recharge') {
       const hasRecharged = db.recharges.some((r: any) => r.tiktokId === userKey && r.status === 'success');
       if (!hasRecharged) return res.status(400).json({ error: 'Vui lòng nạp lần đầu để hoàn thành nhiệm vụ!' });
       reward = 50000;
       message = 'Hoàn thành nhiệm vụ Nạp Lần Đầu! Nhận 50,000đ.';
    } else if (missionId === 'share_friend') {
       if (!user.referrals || user.referrals < 1) {
          return res.status(400).json({ error: 'Vui lòng mời ít nhất 1 bạn bè để hoàn thành!' });
       }
       reward = 20000;
       message = 'Hoàn thành nhiệm vụ Chia Sẻ! Nhận 20,000đ.';
    } else {
       return res.status(400).json({ error: 'Nhiệm vụ không tồn tại.' });
    }

    user.balance += reward;
    user.claimedMissions.push(missionId);
    
    await writeDB(db);
    res.json({ success: true, message, balance: user.balance, claimedMissions: user.claimedMissions });
  });

  app.post('/api/blind-box', async (req, res) => {
    const { tiktokId, boxId, count = 1, insurance = false } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    const box = db.config.prices.find((b: any) => b.id === boxId);

    if (!user || !box) return res.status(400).json({ error: 'Invalid request' });
    
    let discount = 0;
    if (count === 5) discount = 0.05;
    if (count === 10) discount = 0.10;
    
    const extraCost = insurance ? 5000 * count : 0;
    const totalCost = box.price * count * (1 - discount) + extraCost;
    
    if (user.balance < totalCost) return res.status(400).json({ error: 'Không đủ số dư' });

    user.balance -= totalCost;
    user.totalSpent = (user.totalSpent || 0) + totalCost;
    
    const charms = [
      { id: 'bb_mini', name: 'Bearbrick Mini', rarity: 'common', icon: '🧸', value: 5000, imageUrl: 'https://images.unsplash.com/photo-1549298240-0d8e60513026?auto=format&fit=crop&w=200&h=200' },
      { id: 'labubu_m', name: 'Labubu Macaron', rarity: 'rare', icon: '🐰', value: 15000, imageUrl: 'https://images.unsplash.com/photo-1558298715-38435d8e9fc7?auto=format&fit=crop&w=200&h=200' },
      { id: 'skull_p', name: 'Skullpanda', rarity: 'epic', icon: '🎭', value: 50000, imageUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=200&h=200' },
      { id: 'hirono_s', name: 'Hirono Secret', rarity: 'legendary', icon: '👤', value: 200000, imageUrl: 'https://images.unsplash.com/photo-1520627977056-c307aebc1b18?auto=format&fit=crop&w=200&h=200' }
    ];

    const results = [];
    user.lossStreak = user.lossStreak || 0;
    user.insuredLossStreak = user.insuredLossStreak || 0;
    let jackpotJacked = 0;

    for (let i = 0; i < count; i++) {
        const chance = Math.random();
        
        if (chance < db.config.winRate) {
          const jackpotPrize = db.config.jackpotAmount || 0;
          jackpotJacked += jackpotPrize;
          user.balance += jackpotPrize; 
          db.config.jackpotAmount = 1000000; 

          let deviceName = 'iPhone 15 Pro Max';
          if (box.id.includes('ipad')) deviceName = 'iPad Pro M4';

          const resultStr = `${deviceName} + Hũ ${jackpotPrize.toLocaleString()}đ`;
          user.iphonesWon = (user.iphonesWon || 0) + 1; 
          const winner = {
            id: Date.now().toString() + i,
            tiktokId,
            prize: resultStr,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          db.winners.push(winner);
          db.publicHistory.unshift({ tiktokId, prize: resultStr, time: new Date().toISOString() });
          pushEvent(`🔥 KINH HOÀNG! ${tiktokId} vừa khui trúng ${resultStr}! Tới công chuyện luôn!!`);
          
          results.push({ result: resultStr, type: 'jackpot', jackpotAmount: jackpotPrize });
          user.lossStreak = 0;
          user.insuredLossStreak = 0;
        } else {
          const charmChance = Math.random();
          if (charmChance < 0.1) {
            const subChance = Math.random();
            let rewardItem;
            if (subChance < 0.05) rewardItem = charms[3];
            else if (subChance < 0.15) rewardItem = charms[2];
            else if (subChance < 0.45) rewardItem = charms[1];
            else rewardItem = charms[0];

            user.itemsValue = (user.itemsValue || 0) + rewardItem.value;
            if (!user.inventory) user.inventory = [];
            user.inventory.push({ ...rewardItem, id: rewardItem.id + '_' + Date.now() + i });
            db.publicHistory.unshift({ tiktokId: tiktokId.slice(0, 3) + '...', prize: rewardItem.name, time: new Date().toISOString() });
            
            if (subChance < 0.15) {
                pushEvent(`🍀 ${tiktokId} vừa nhặt được linh vật hiếm: ${rewardItem.name}!`);
            }
            results.push({ result: `Bạn nhận được: ${rewardItem.name}`, type: 'item', item: rewardItem });
            user.lossStreak = 0; 
            user.insuredLossStreak = 0;
          } else {
             user.fragments = (user.fragments || 0) + 1;
             
             if (insurance) {
                user.insuredLossStreak = (user.insuredLossStreak || 0) + 1;
             } else {
                user.lossStreak += 1;
                user.insuredLossStreak = 0; // break safe streak
             }

             let bonusStr = "";
             if (insurance && user.insuredLossStreak >= 10) {
                 user.insuredLossStreak = 0;
                 user.balance += 50000;
                 if (!user.notifications) user.notifications = [];
                 user.notifications.push("🛡️ Bảo hiểm kích hoạt! Hoàn 50.000đ.");
                 bonusStr = " + Hoàn bảo hiểm 50k!";
                 results.push({ result: `Mảnh ghép iPhone${bonusStr}`, type: 'rescue', amount: 50000, fragments: 1 });
             } else {
                 results.push({ result: `Mảnh ghép iPhone${bonusStr}`, type: 'fragment', fragments: 1 });
             }
             db.config.jackpotAmount = (db.config.jackpotAmount || 1000000) + 2000;
          }
        }
    }

    if (db.publicHistory.length > 30) db.publicHistory = db.publicHistory.slice(0, 30);
    
    await writeDB(db);
    res.json({ results, balance: user.balance, jackpot: db.config.jackpotAmount });
  });

  app.get('/api/jackpot', async (req, res) => {
    const db = await readDB();
    res.json({ jackpotAmount: db.config.jackpotAmount || 1000000 });
  });

  app.get('/api/leaderboard', async (req, res) => {
    const db = await readDB();
    const users = Object.values(db.users) as any[];
    const topUsers = users
      .filter(u => u.role !== 'admin' && u.tiktokId !== 'admin')
      .map(u => ({
        tiktokId: u.tiktokId,
        iphonesWon: u.iphonesWon || 0,
        itemsValue: u.itemsValue || 0,
        totalSpent: u.totalSpent || 0
      }))
      .sort((a, b) => b.iphonesWon - a.iphonesWon || b.itemsValue - a.itemsValue || b.totalSpent - a.totalSpent)
      .slice(0, 10);
    res.json(topUsers);
  });

  app.post('/api/recharge', async (req, res) => {
    const { tiktokId, type, amount, serial, code, accountNumber, bankName } = req.body;
    const db = await readDB();
    const recharge = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      tiktokId,
      type, 
      amount: parseInt(amount),
      serial: serial || '',
      code: code || '',
      accountNumber: accountNumber || '',
      bankName: bankName || '',
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    db.recharges.push(recharge);
    await writeDB(db);
    res.json({ success: true });
  });

  app.get('/api/admin/recharges', async (req, res) => {
    const db = await readDB();
    res.json(db.recharges.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.get('/api/admin/withdrawals', async (req, res) => {
    const db = await readDB();
    res.json((db.withdrawals || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post('/api/admin/withdraw/:id', async (req, res) => {
    const { status } = req.body;
    const db = await readDB();
    const withdraw = (db.withdrawals || []).find((w: any) => w.id === req.params.id);
    
    if (!withdraw) return res.status(404).json({ error: 'Not found' });
    
    if (withdraw.status === 'pending' && status === 'success') {
      withdraw.status = 'success';
      await writeDB(db);
      res.json({ success: true });
    } else if (status === 'rejected') {
      const userKey = Object.keys(db.users).find(k => k.toLowerCase() === withdraw.tiktokId.toLowerCase());
      if (userKey) {
        db.users[userKey].balance += withdraw.amount;
      }
      withdraw.status = 'rejected';
      await writeDB(db);
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Invalid operation' });
    }
  });

  app.post('/api/admin/recharge/:id', async (req, res) => {
    const { status } = req.body;
    const db = await readDB();
    const recharge = db.recharges.find((r: any) => r.id === req.params.id);
    
    if (!recharge) return res.status(404).json({ error: 'Not found' });
    
    if (recharge.status === 'waiting' && status === 'success') {
      const userKey = Object.keys(db.users).find(k => k.toLowerCase() === recharge.tiktokId.toLowerCase());
      if (userKey) {
        const user = db.users[userKey];
        user.balance += recharge.amount;
        
        if (user.referredBy && db.users[user.referredBy]) {
           const referrer = db.users[user.referredBy];
           const commission = Math.floor(recharge.amount * 0.1); 
           referrer.balance += commission;
           if (!referrer.notifications) referrer.notifications = [];
           referrer.notifications.push(`🎉 Hoa hồng giới thiệu: +${commission.toLocaleString()}đ (từ ${userKey})`);
           if (!referrer.referralHistory) referrer.referralHistory = [];
           referrer.referralHistory.push({
             invitedUser: userKey,
             bonus: commission,
             date: new Date().toISOString()
           });
           referrer.referrals = (referrer.referrals || 0) + 1;
        }

        if (!user.notifications) user.notifications = [];
        user.notifications.push(`💳 Nạp thành công ${recharge.amount.toLocaleString()}đ`);
      }
    }
    
    recharge.status = status;
    await writeDB(db);
    res.json({ success: true });
  });

  app.post('/api/recharge/update', async (req, res) => {
    const { id, serial, code } = req.body;
    const db = await readDB();
    const recharge = db.recharges.find((r: any) => r.id === id);
    if (!recharge) return res.status(404).json({ error: 'Not found' });
    
    recharge.serial = serial;
    recharge.code = code;
    recharge.status = 'waiting';
    await writeDB(db);
    res.json({ success: true });
  });


  app.post('/api/spin', async (req, res) => {
    const { tiktokId } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.balance < 20000) return res.status(400).json({ error: 'Cần tối thiểu 20,000đ để quay' });
    
    user.balance -= 20000;
    user.totalSpent = (user.totalSpent || 0) + 20000;

    const r = Math.random();
    let result = '';
    let rewardValue = 0;
    let rewardType = 'none';
    const config = db.config.spinRates;

    if (r < config.jackpot) { 
       const jackpotPrize = Math.floor((db.config.jackpotAmount || 1000000) * 0.2); 
       user.balance += jackpotPrize;
       db.config.jackpotAmount = (db.config.jackpotAmount || 1000000) - jackpotPrize;
       
       result = `NỔ HŨ +${jackpotPrize.toLocaleString()}đ !`;
       rewardValue = jackpotPrize;
       rewardType = 'jackpot';
       pushEvent(`🎉 XỈU NGANG! ${tiktokId} vừa NỔ HŨ VÒNG QUAY gom về ${jackpotPrize.toLocaleString()}đ!`);
       db.publicHistory.unshift({ tiktokId, prize: `Nổ Hũ Vòng Quay`, time: new Date().toISOString() });
    } else if (r < config.jackpot + config.item) { 
       const items = ['Móc Khóa Gấu', 'Sticker Cute', 'Voucher 50K', 'Labubu Mini'];
       const item = items[Math.floor(Math.random()*items.length)];
       result = item;
       rewardType = 'item';
       user.itemsValue = (user.itemsValue || 0) + 20000;
       if (!user.inventory) user.inventory = [];
       user.inventory.push({ id: 'spin_item_'+Date.now(), name: item, rarity: 'common', icon: '🎁', value: 20000, imageUrl: '' });
    } else if (r < config.jackpot + config.item + config.coin50k) { 
       user.balance += 50000;
       rewardValue = 50000;
       rewardType = 'coin';
       result = '50,000đ';
    } else if (r < config.jackpot + config.item + config.coin50k + config.coin20k) { 
       user.balance += 20000;
       rewardValue = 20000;
       rewardType = 'coin';
       result = '20,000đ';
    } else if (r < config.jackpot + config.item + config.coin50k + config.coin20k + config.coin10k) { 
       user.balance += 10000;
       rewardValue = 10000;
       rewardType = 'coin';
       result = '10,000đ';
    } else { 
       result = 'Rất tiếc';
       rewardType = 'none';
       db.config.jackpotAmount = (db.config.jackpotAmount || 1000000) + 1000; 
    }

    if (db.publicHistory.length > 30) db.publicHistory = db.publicHistory.slice(0, 30);
    await writeDB(db);

    res.json({ result, rewardValue, rewardType, balance: user.balance, inventory: user.inventory });
  });

  app.get('/api/history', async (req, res) => {
    const db = await readDB();
    res.json(db.publicHistory || []);
  });

  app.get('/api/admin/config', async (req, res) => {
    const db = await readDB();
    res.json(db.config);
  });

  app.post('/api/admin/config', async (req, res) => {
    const db = await readDB();
    db.config = { ...db.config, ...req.body };
    await writeDB(db);
    res.json({ success: true });
  });

  // Admin Get Users
  app.get('/api/admin/users', async (req, res) => {
    const db = await readDB();
    const users = Object.keys(db.users).map(tiktokId => ({
        tiktokId,
        ...db.users[tiktokId]
    }));
    res.json(users);
  });

  // Admin Update User Balance
  app.post('/api/admin/users/balance', async (req, res) => {
    const { tiktokId, balance } = req.body;
    const db = await readDB();
    if (db.users[tiktokId]) {
      db.users[tiktokId].balance = balance;
      await writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.get('/api/admin/winners', async (req, res) => {
    const db = await readDB();
    const populatedWinners = db.winners.map((w: any) => {
      const user = db.users[w.tiktokId];
      return {
        ...w,
        phone: w.phone || user?.phone || '',
        address: w.address || user?.address || ''
      };
    });
    res.json(populatedWinners);
  });

  // --- CHAT WIDGET ROUTES ---
  app.get('/api/chat/:id', async (req, res) => {
    const db = await readDB();
    const id = req.params.id;
    const chat = db.inbox?.[id] || { messages: [], unreadAdmin: 0, unreadUser: 0 };
    res.json(chat);
  });
  app.post('/api/chat/:id', async (req, res) => {
    const { role, text } = req.body;
    const id = req.params.id;
    const db = await readDB();
    if (!db.inbox) db.inbox = {};
    if (!db.inbox[id]) db.inbox[id] = { messages: [], unreadAdmin: 0, unreadUser: 0 };
    db.inbox[id].messages.push({ role, text, time: new Date().toISOString() });
    if (role === 'user') db.inbox[id].unreadAdmin += 1;
    if (role === 'admin') db.inbox[id].unreadUser += 1;
    await writeDB(db);
    res.json(db.inbox[id]);
  });
  app.post('/api/chat/read/:id', async (req, res) => {
    const { role } = req.body;
    const id = req.params.id;
    const db = await readDB();
    if (db.inbox && db.inbox[id]) {
      if (role === 'user') db.inbox[id].unreadUser = 0;
      if (role === 'admin') db.inbox[id].unreadAdmin = 0;
      await writeDB(db);
    }
    res.json({ success: true });
  });
  app.get('/api/admin/chats', async (req, res) => {
    const db = await readDB();
    res.json(db.inbox || {});
  });


  app.post('/api/update-winner-info', async (req, res) => {
    const { winnerId, address, phone } = req.body;
    const db = await readDB();
    const winner = db.winners.find((w: any) => w.id === winnerId);
    if (winner) {
      winner.address = address;
      winner.phone = phone;
      winner.status = 'updated';
      await writeDB(db);
    }
    res.json({ success: true });
  });

  app.post('/api/user/update-profile', async (req, res) => {
    const { tiktokId, phone, address, notificationsEnabled } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    if (user) {
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;
      await writeDB(db);
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/admin/broadcast', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const db = await readDB();
    let sentCount = 0;
    
    Object.values(db.users).forEach((user: any) => {
      // Only send if notifications are not explicitly disabled
      if (user.notificationsEnabled !== false) {
        if (!user.notifications) user.notifications = [];
        user.notifications.push(`🔔 THÔNG BÁO: ${message}`);
        sentCount++;
      }
    });

    await writeDB(db);
    res.json({ success: true, sentCount });
  });

  // LÌ XÌ TỔNG
  app.post('/api/admin/envelope', async (req, res) => {
    const { amount, maxUsers } = req.body;
    const db = await readDB();
    db.currentEnvelope = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      remainingAmount: parseInt(amount),
      maxUsers: parseInt(maxUsers),
      claimedUsers: [],
      active: true
    };
    pushEvent(`🧧 LÌ XÌ TỔNG ${parseInt(amount).toLocaleString()}đ cho ${maxUsers} người! Chớp lấy ngay!`);
    await writeDB(db);
    res.json({ success: true });
  });

  app.get('/api/events-state', async (req, res) => {
     const db = await readDB();
     res.json({
         envelope: db.currentEnvelope?.active ? {
            id: db.currentEnvelope.id,
            remains: db.currentEnvelope.maxUsers - db.currentEnvelope.claimedUsers.length
         } : null,
         shakeEventActive: db.activeShakeEvent
     });
  });

  app.post('/api/claim-envelope', async (req, res) => {
    const { tiktokId } = req.body;
    const db = await readDB();
    const env = db.currentEnvelope;
    if (!env || !env.active) return res.status(400).json({ error: 'Không có bao lì xì nào' });
    if (env.claimedUsers.includes(tiktokId)) return res.status(400).json({ error: 'Bạn đã nhận lì xì này rồi' });
    if (env.claimedUsers.length >= env.maxUsers) {
      env.active = false;
      await writeDB(db);
      return res.status(400).json({ error: 'Lì xì đã hết lượt trúng' });
    }

    const user = db.users[tiktokId];
    if (!user) return res.status(400).json({ error: 'User not found' });

    let prize = Math.floor(env.remainingAmount / (env.maxUsers - env.claimedUsers.length));
    prize = Math.max(1000, prize + Math.floor((Math.random() - 0.5) * prize * 0.5));
    if (env.claimedUsers.length === env.maxUsers - 1) {
      prize = env.remainingAmount;
    }

    env.remainingAmount -= prize;
    env.claimedUsers.push(tiktokId);
    user.balance += prize;
    
    if (env.claimedUsers.length >= env.maxUsers) {
        env.active = false;
    }
    await writeDB(db);
    res.json({ success: true, prize, balance: user.balance });
  });

  app.post('/api/admin/shake-event', async (req, res) => {
    const { active } = req.body;
    const db = await readDB();
    db.activeShakeEvent = active;
    if (active) {
       db.shakeEventId = Date.now().toString();
       pushEvent(`🔔 Khung Giờ Vàng! Sự kiện Lắc Điện Thoại Nhận Quà Đang Bắt Đầu!`);
    } else {
       pushEvent(`🔔 Sự kiện Lắc Quà đã kết thúc. Hẹn gặp lại!`);
    }
    await writeDB(db);
    res.json({ success: true });
  });

  app.post('/api/shake-claim', async (req, res) => {
    const { tiktokId } = req.body;
    const db = await readDB();
    if (!db.activeShakeEvent) return res.status(400).json({ error: 'Sự kiện chưa diễn ra' });
    
    const user = db.users[tiktokId];
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (user.lastShakeId === db.shakeEventId) {
       return res.status(400).json({ error: 'Bạn đã nhận quà sự kiện này rồi!' });
    }

    const reward = 2000 + Math.floor(Math.random() * 3000);
    user.balance += reward;
    user.lastShakeId = db.shakeEventId; 
    await writeDB(db);
    res.json({ success: true, reward, balance: user.balance });
  });

  app.post('/api/exchange-fragments', async (req, res) => {
    const { tiktokId } = req.body;
    const db = await readDB();
    const user = db.users[tiktokId];
    if (!user) return res.status(404).json({ error: 'User not found' });
    if ((user.fragments || 0) < 100) return res.status(400).json({ error: 'Không đủ 100 Mảnh ghép' });

    user.fragments -= 100;
    const resultStr = `iPhone 15 Pro Max (Đổi Mảnh)`;
    user.iphonesWon = (user.iphonesWon || 0) + 1; 
    db.winners.push({
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 4),
      tiktokId,
      prize: resultStr,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    pushEvent(`🏆 Hú hồn! ${tiktokId} đã ghép thành công 1 ${resultStr} từ Shop!`);
    await writeDB(db);
    res.json({ success: true, balance: user.balance, fragments: user.fragments });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    setInterval(() => {
      const names = ['@nguyenvanA', '@hoang123', '@linh_cute', '@tuan_anh09', '@boy_lanh_lung', '@thuytinh2k', '@daigia_99'];
      const actions = [
        () => `💸 ${names[Math.floor(Math.random()*names.length)]} vừa nạp ${(Math.floor(Math.random()*20)*50 + 50)}k`,
        () => `🔥 Kinh hoàng! ${names[Math.floor(Math.random()*names.length)]} vừa khui trúng siêu phẩm iPhone 15 Pro Max!`,
        () => `🍀 ${names[Math.floor(Math.random()*names.length)]} vừa nhặt được linh vật hiếm: Skullpanda!`,
        () => `🎉 Xỉu ngang! ${names[Math.floor(Math.random()*names.length)]} vừa nổ hũ Vòng Quay!`
      ];
      pushEvent(actions[Math.floor(Math.random()*actions.length)]());
    }, 15000);
  });
}

startServer();
