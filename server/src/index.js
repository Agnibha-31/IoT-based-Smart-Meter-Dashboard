import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ExcelJS from 'exceljs';

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigin = process.env.CORS_ORIGIN || '*';
const jwtSecret = process.env.JWT_SECRET || 'change_this_dev_secret';
const tokenTTLSeconds = Number(process.env.JWT_TTL_SECONDS || 60 * 60 * 8); // 8 hours

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(morgan('dev'));

// Database init
const db = new Database(process.env.DB_PATH || 'smart_meter.db');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT,
  api_key TEXT UNIQUE,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  voltage REAL,
  current REAL,
  power REAL,
  energy REAL,
  frequency REAL,
  power_factor REAL,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY(device_id) REFERENCES devices(id)
);

CREATE INDEX IF NOT EXISTS idx_readings_device_time ON readings(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at INTEGER DEFAULT (strftime('%s','now'))
);
`);

// Seed device if not exists
const defaultDeviceId = process.env.DEVICE_ID || 'device-001';
const defaultApiKey = process.env.DEVICE_API_KEY || 'CHANGE_ME_SECURE_API_KEY';
db.prepare(
  'INSERT OR IGNORE INTO devices(id, name, api_key) VALUES (?, ?, ?)' 
).run(defaultDeviceId, 'Main Meter', defaultApiKey);

// Seed admin user if not exists
const defaultAdminUser = process.env.ADMIN_USERNAME || 'admin';
const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin123!change';
const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get(defaultAdminUser);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(defaultAdminPass, 10);
  db.prepare('INSERT INTO users(username, password_hash, role) VALUES (?, ?, ?)')
    .run(defaultAdminUser, hash, 'admin');
  console.log(`[init] Seeded admin user '${defaultAdminUser}' with provided ADMIN_PASSWORD`);
}

// Simple auth middleware (per-device API key)
function requireDeviceKey(req, res, next) {
  const headerKey = req.header('x-api-key');
  if (!headerKey) return res.status(401).json({ error: 'Missing x-api-key' });
  const device = db.prepare('SELECT id FROM devices WHERE api_key = ?').get(headerKey);
  if (!device) return res.status(403).json({ error: 'Invalid API key' });
  req.deviceId = device.id;
  next();
}

// Server-Sent Events for live stream
const clients = new Set();
app.get('/api/stream', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(': connected\n\n');

  const client = { res };
  clients.add(client);
  req.on('close', () => {
    clients.delete(client);
  });
});

function broadcastReading(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const { res } of clients) {
    try { res.write(data); } catch {}
  }
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// JWT auth middleware
function requireAuth(req, res, next) {
  const hdr = req.header('authorization') || '';
  let token = '';
  if (hdr.toLowerCase().startsWith('bearer ')) token = hdr.slice(7).trim();
  // also support ?token= for SSE
  if (!token && req.query && req.query.token) token = String(req.query.token);
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.auth = { userId: payload.sub, username: payload.username, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: row.id, username: row.username, role: row.role }, jwtSecret, { expiresIn: tokenTTLSeconds });
  res.json({ token, user: { id: row.id, username: row.username, role: row.role } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.auth });
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) return res.status(400).json({ error: 'current_password and new_password required' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.auth.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const ok = bcrypt.compareSync(current_password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid current password' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  res.json({ success: true });
});

// Ingest endpoint
app.post('/api/readings', requireDeviceKey, (req, res) => {
  const deviceId = req.deviceId;
  const {
    voltage, current, power, energy, frequency, power_factor
  } = req.body || {};

  const stmt = db.prepare(`
    INSERT INTO readings(device_id, voltage, current, power, energy, frequency, power_factor)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    deviceId,
    Number(voltage) || null,
    Number(current) || null,
    Number(power) || null,
    Number(energy) || null,
    Number(frequency) || null,
    Number(power_factor) || null
  );

  const row = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid);
  broadcastReading(row);
  res.status(201).json({ success: true, reading: row });
});

// Latest reading per device
app.get('/api/readings/latest', requireAuth, (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const row = db.prepare(
    'SELECT * FROM readings WHERE device_id = ? ORDER BY created_at DESC, id DESC LIMIT 1'
  ).get(deviceId);
  res.json({ reading: row || null });
});

// History query
app.get('/api/readings/history', requireAuth, (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const since = Number(req.query.since) || 0; // epoch seconds
  const until = Number(req.query.until) || Math.floor(Date.now() / 1000);
  const limit = Math.min(Number(req.query.limit) || 5000, 20000);
  const rows = db.prepare(
    'SELECT * FROM readings WHERE device_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC LIMIT ?'
  ).all(deviceId, since, until, limit);
  res.json({ readings: rows });
});

// Metrics and analytics for a time range
function clampNum(n, min, max) { return Math.max(min, Math.min(max, n)); }
function calcAggregates(rows) {
  if (!rows || rows.length === 0) return null;
  let vMin = Infinity, vMax = -Infinity, vSum = 0;
  let iMin = Infinity, iMax = -Infinity, iSum = 0, iSqSum = 0;
  let pMin = Infinity, pMax = -Infinity, pSum = 0;
  let pfSum = 0, pfCount = 0;
  let energyStart = null, energyEnd = null;
  const series = [];
  for (const r of rows) {
    const v = Number(r.voltage) || 0;
    const i = Number(r.current) || 0;
    const p = Number(r.power) || 0; // assume W
    const e = Number(r.energy);
    const pf = Number(r.power_factor);
    vMin = Math.min(vMin, v || vMin);
    vMax = Math.max(vMax, v || vMax);
    iMin = Math.min(iMin, i || iMin);
    iMax = Math.max(iMax, i || iMax);
    pMin = Math.min(pMin, p || pMin);
    pMax = Math.max(pMax, p || pMax);
    vSum += v;
    iSum += i;
    iSqSum += i * i;
    pSum += p;
    if (!Number.isNaN(pf)) { pfSum += pf; pfCount++; }
    if (Number.isFinite(e)) {
      if (energyStart === null) energyStart = e;
      energyEnd = e;
    }
    // Apparent and reactive instantaneous
    const S = pf ? (p / clampNum(pf, 0.01, 1)) : (v * i);
    const Q = Math.sqrt(Math.max(0, S * S - p * p));
    series.push({ t: r.created_at, voltage: v, current: i, power: p, pf: pf || null, apparent: S, reactive: Q });
  }
  const n = rows.length;
  const vAvg = vSum / n;
  const iAvg = iSum / n;
  const iRms = Math.sqrt(iSqSum / n);
  const pAvgW = pSum / n; // W
  const pfAvg = pfCount ? (pfSum / pfCount) : null;
  const energyDelta = (Number.isFinite(energyStart) && Number.isFinite(energyEnd)) ? Math.max(0, energyEnd - energyStart) : null; // kWh if device reports cumulative kWh
  // Load factor = average load / peak load
  const loadFactor = pMax > 0 ? (pAvgW / pMax) : null;
  // Efficiency score: simple composite of pf and load factor
  const effScore = Math.round(clampNum(((clampNum(pfAvg || 0.8, 0, 1) * 0.7) + (clampNum(loadFactor || 0.5, 0, 1) * 0.3)) * 100, 0, 100));
  return { vMin, vMax, vAvg, iMin, iMax, iAvg, iRms, pMin, pMax, pAvgW, pfAvg, energyDelta, loadFactor, efficiencyScore: effScore, series };
}

app.get('/api/metrics/summary', requireAuth, (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const start = Number(req.query.start) || (Math.floor(new Date(new Date().toDateString()).getTime() / 1000)); // default today 00:00
  const end = Number(req.query.end) || Math.floor(Date.now() / 1000);
  const rows = db.prepare(
    'SELECT * FROM readings WHERE device_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
  ).all(deviceId, start, end);
  const agg = calcAggregates(rows) || {};
  // Peak/off-peak split
  let peakKWh = 0, offPeakKWh = 0;
  let last = null;
  for (const r of rows) {
    if (last && Number.isFinite(r.energy) && Number.isFinite(last.energy)) {
      const delta = Math.max(0, r.energy - last.energy);
      const hour = new Date(r.created_at * 1000).getHours();
      const isOff = (hour < 6) || (hour >= 22);
      if (isOff) offPeakKWh += delta; else peakKWh += delta;
    }
    last = r;
  }
  // Power distribution using instantaneous averages
  const activeKW = (agg.pAvgW || 0) / 1000;
  const apparentKVA = agg.series && agg.series.length ? (agg.series.reduce((a, s) => a + s.apparent, 0) / agg.series.length) / 1000 : 0;
  const reactiveKVAR = Math.sqrt(Math.max(0, (apparentKVA * apparentKVA) - (activeKW * activeKW)));
  const powerDistribution = {
    active_kw: Number(activeKW.toFixed(3)),
    reactive_kvar: Number(reactiveKVAR.toFixed(3)),
    apparent_kva: Number(apparentKVA.toFixed(3))
  };
  res.json({
    range: { start, end },
    voltage: { min: agg.vMin ?? null, max: agg.vMax ?? null, avg: agg.vAvg ?? null },
    current: { min: agg.iMin ?? null, max: agg.iMax ?? null, avg: agg.iAvg ?? null, rms: agg.iRms ?? null },
    power: { min_w: agg.pMin ?? null, max_w: agg.pMax ?? null, avg_w: agg.pAvgW ?? null, factor_avg: agg.pfAvg ?? null },
    energy: { delta_kwh: agg.energyDelta ?? null, peak_kwh: Number(peakKWh.toFixed(3)), offpeak_kwh: Number(offPeakKWh.toFixed(3)) },
    load_factor: agg.loadFactor ?? null,
    efficiency_score: agg.efficiencyScore ?? null,
    power_distribution: powerDistribution
  });
});

// Voltage history for charting
app.get('/api/metrics/voltage-history', requireAuth, (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const start = Number(req.query.start) || (Math.floor(Date.now()/1000) - 3600);
  const end = Number(req.query.end) || Math.floor(Date.now() / 1000);
  const rows = db.prepare(
    'SELECT created_at, voltage FROM readings WHERE device_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
  ).all(deviceId, start, end);
  res.json({ points: rows });
});

// CSV export
app.get('/api/export.csv', requireAuth, (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const start = Number(req.query.start) || 0;
  const end = Number(req.query.end) || Math.floor(Date.now() / 1000);
  const rows = db.prepare(
    'SELECT * FROM readings WHERE device_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
  ).all(deviceId, start, end);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="readings_${deviceId}_${start}_${end}.csv"`);
  const header = 'id,device_id,created_at,voltage,current,power,energy,frequency,power_factor\n';
  res.write(header);
  for (const r of rows) {
    res.write([
      r.id, r.device_id, r.created_at, r.voltage ?? '', r.current ?? '', r.power ?? '', r.energy ?? '', r.frequency ?? '', r.power_factor ?? ''
    ].join(',') + '\n');
  }
  res.end();
});

// Excel export
app.get('/api/export.xlsx', requireAuth, async (req, res) => {
  const deviceId = req.query.device_id || defaultDeviceId;
  const start = Number(req.query.start) || 0;
  const end = Number(req.query.end) || Math.floor(Date.now() / 1000);
  const rows = db.prepare(
    'SELECT * FROM readings WHERE device_id = ? AND created_at >= ? AND created_at <= ? ORDER BY created_at ASC'
  ).all(deviceId, start, end);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Readings');
  ws.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Device', key: 'device_id', width: 15 },
    { header: 'Timestamp (s)', key: 'created_at', width: 18 },
    { header: 'Voltage (V)', key: 'voltage', width: 15 },
    { header: 'Current (A)', key: 'current', width: 15 },
    { header: 'Power (W)', key: 'power', width: 15 },
    { header: 'Energy (kWh)', key: 'energy', width: 15 },
    { header: 'Frequency (Hz)', key: 'frequency', width: 15 },
    { header: 'Power Factor', key: 'power_factor', width: 15 }
  ];
  rows.forEach(r => ws.addRow(r));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="readings_${deviceId}_${start}_${end}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

app.listen(port, () => {
  console.log(`Smart Meter backend listening on http://localhost:${port}`);
});


