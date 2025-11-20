import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import config from './config.js';
import { db } from './db.js';
import { ensureDefaultDevice } from './services/deviceService.js';
import authRoutes from './routes/auth.js';
import readingsRoutes from './routes/readings.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import devicesRoutes from './routes/devices.js';
import adminRoutes from './routes/admin.js';
import bus from './utils/bus.js';

const app = express();
const clients = new Set();

app.use(cors({ 
  origin: config.corsOrigin === '*' ? '*' : config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

app.get('/api/stream', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).end();
  }
  try {
    jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return res.status(401).end();
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();
  res.write(': connected\n\n');
  const client = { res };
  clients.add(client);
  req.on('close', () => {
    clients.delete(client);
  });
});

bus.on('reading:new', (reading) => {
  const payload = `data: ${JSON.stringify(reading)}\n\n`;
  clients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch {
      clients.delete(client);
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('[API_ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const bootstrap = async () => {
  await db.init();
  await ensureDefaultDevice();
  app.listen(config.port, () => {
    console.log(`Smart Meter backend ready on http://localhost:${config.port}`);
  });
};

bootstrap().catch((err) => {
  console.error('Failed to bootstrap backend', err);
  process.exit(1);
});

