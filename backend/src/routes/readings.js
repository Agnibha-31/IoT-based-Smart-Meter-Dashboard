import { Router } from 'express';
import { z } from 'zod';
import config from '../config.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireDeviceKey, requireAuth } from '../middleware/auth.js';
import {
  ingestReading,
  latestReading,
  readingsInRange,
  deleteReadingsBefore,
} from '../services/readingService.js';
import { resolveRange, granularityForRange } from '../utils/time.js';
import { bucketizeReadings } from '../services/analyticsService.js';
import bus from '../utils/bus.js';

const router = Router();

const ingestSchema = z.object({
  voltage: z.number().optional(),
  current: z.number().optional(),
  power: z.number().optional(),
  energy: z.number().optional(),
  frequency: z.number().optional(),
  timestamp: z.number().optional(),
  power_factor: z.number().optional(),
  apparent_power: z.number().optional(),
  apparentPower: z.number().optional(),
  powerFactor: z.number().optional(),
  reactive_power: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

router.post(
  '/',
  requireDeviceKey,
  asyncHandler(async (req, res) => {
    const rawPayload = ingestSchema.parse(req.body ?? {});
    const payload = {
      ...rawPayload,
      power_factor: rawPayload.power_factor ?? rawPayload.powerFactor,
      apparent_power: rawPayload.apparent_power ?? rawPayload.apparentPower,
    };
    const reading = await ingestReading({
      deviceId: req.device.id,
      payload,
    });
    bus.emit('reading:new', reading);
    res.status(201).json({ reading });
  }),
);

router.get(
  '/latest',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    const reading = await latestReading(deviceId);
    res.json({ reading });
  }),
);

router.get(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    const { from, to, durationSeconds } = resolveRange({
      period: req.query.period,
      from: req.query.from,
      to: req.query.to,
      timezone: req.user?.timezone || 'UTC',
    });
    const rows = await readingsInRange(deviceId, from, to);
    const intervalSeconds = Number(req.query.interval_seconds) || granularityForRange(durationSeconds);
    const series = bucketizeReadings(rows, intervalSeconds).map((bucket) => ({
      timestamp: bucket.timestamp,
      voltage: bucket.voltage,
      peakVoltage: bucket.peakVoltage,
      minVoltage: bucket.minVoltage,
      current: bucket.current,
      realPowerKw: bucket.realPower,
      energyKwh: bucket.energy,
      powerFactor: bucket.powerFactor,
    }));

    res.json({
      device_id: deviceId,
      from,
      to,
      intervalSeconds,
      points: series,
      rawCount: rows.length,
    });
  }),
);

router.delete(
  '/history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    const before = Number(req.query.before) || Math.floor(Date.now() / 1000);
    await deleteReadingsBefore(deviceId, before);
    res.json({ success: true });
  }),
);

export default router;

