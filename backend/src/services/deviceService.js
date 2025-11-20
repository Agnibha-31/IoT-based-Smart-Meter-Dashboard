import { randomUUID } from 'crypto';
import config from '../config.js';
import { db } from '../db.js';

const nowSeconds = () => Math.floor(Date.now() / 1000);

export const ensureDefaultDevice = async () => {
  const existing = await db.get('SELECT * FROM devices WHERE id = ?', [config.deviceDefaultId]);
  const timestamp = nowSeconds();
  if (!existing) {
    await db.run(
      `INSERT INTO devices (id, name, api_key, timezone, location, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        config.deviceDefaultId,
        'Primary Smart Meter',
        config.deviceApiKey,
        'UTC',
        'US-NY',
        timestamp,
        timestamp,
      ],
    );
    return db.get('SELECT * FROM devices WHERE id = ?', [config.deviceDefaultId]);
  }

  if (existing.api_key !== config.deviceApiKey) {
    await db.run(
      'UPDATE devices SET api_key = ?, updated_at = ? WHERE id = ?',
      [config.deviceApiKey, timestamp, config.deviceDefaultId],
    );
  }

  return db.get('SELECT * FROM devices WHERE id = ?', [config.deviceDefaultId]);
};

export const listDevices = async () =>
  db.all('SELECT * FROM devices ORDER BY created_at DESC');

export const createDevice = async ({ name, timezone = 'UTC', location = 'US-NY' }) => {
  const id = `dev-${randomUUID()}`;
  const apiKey = randomUUID();
  const timestamp = nowSeconds();
  await db.run(
    `INSERT INTO devices (id, name, api_key, timezone, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, apiKey, timezone, location, timestamp, timestamp],
  );
  return db.get('SELECT * FROM devices WHERE id = ?', [id]);
};

export const getDeviceById = async (id) =>
  db.get('SELECT * FROM devices WHERE id = ?', [id]);

export const updateDeviceLastSeen = async (deviceId, timestamp = nowSeconds()) => {
  await db.run(
    'UPDATE devices SET last_seen = ?, updated_at = ? WHERE id = ?',
    [timestamp, timestamp, deviceId],
  );
};

