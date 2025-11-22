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
  
  // Check if there are any users - if yes, system is already set up
  const userCount = await db.get('SELECT COUNT(*) as total FROM users');
  if (userCount && userCount.total > 0) {
    console.log(`Multi-user system ready with ${userCount.total} user(s)`);
  } else {
    console.log('No users found - waiting for first user registration');
  }
  
  // Ensure default device exists if there's a legacy setup
  // This is for backward compatibility with single-user setups
  const existingDevice = await db.get('SELECT * FROM devices WHERE id = ?', [config.deviceDefaultId]);
  if (existingDevice && !existingDevice.user_id) {
    // Assign orphaned device to first user if exists
    const firstUser = await db.get('SELECT id FROM users LIMIT 1');
    if (firstUser) {
      await db.run('UPDATE devices SET user_id = ? WHERE id = ?', [firstUser.id, config.deviceDefaultId]);
      console.log(`Assigned default device to user ${firstUser.id}`);
    }
  }
  
  app.listen(config.port, () => {
    console.log(`Smart Meter backend ready on http://localhost:${config.port}`);
  });
};

bootstrap().catch((err) => {
  console.error('Failed to bootstrap backend', err);
  process.exit(1);
});

