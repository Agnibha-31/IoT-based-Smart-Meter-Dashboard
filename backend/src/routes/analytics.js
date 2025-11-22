import { Router } from 'express';
import config from '../config.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { readingsInRange } from '../services/readingService.js';
import { buildSummary, buildCostProjection, bucketizeReadings } from '../services/analyticsService.js';
import { resolveRange, granularityForRange } from '../utils/time.js';

const router = Router();

router.get(
  '/summary',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    
    // Verify device belongs to user
    const { getDeviceByIdAndUser } = await import('../services/deviceService.js');
    const device = await getDeviceByIdAndUser(deviceId, req.user.id);
    if (!device) {
      return res.status(403).json({ error: 'Access denied to this device' });
    }
    
    const { from, to, durationSeconds } = resolveRange({
      period: req.query.period,
      from: req.query.from,
      to: req.query.to,
      timezone: req.user?.timezone || 'UTC',
    });
    const rows = await readingsInRange(deviceId, from, to);
    const intervalSeconds = granularityForRange(durationSeconds);
    const summary = buildSummary(rows, {
      timezone: req.user?.timezone || 'UTC',
      intervalSeconds,
    });
    res.json({
      device_id: deviceId,
      from,
      to,
      intervalSeconds,
      summary,
    });
  }),
);

router.get(
  '/voltage-history',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    
    // Verify device belongs to user
    const { getDeviceByIdAndUser } = await import('../services/deviceService.js');
    const device = await getDeviceByIdAndUser(deviceId, req.user.id);
    if (!device) {
      return res.status(403).json({ error: 'Access denied to this device' });
    }
    
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
      peak: bucket.peakVoltage,
      minimum: bucket.minVoltage,
    }));
    res.json({
      device_id: deviceId,
      from,
      to,
      intervalSeconds,
      points: series,
    });
  }),
);

router.get(
  '/cost',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deviceId = req.query.device_id || config.deviceDefaultId;
    
    // Verify device belongs to user
    const { getDeviceByIdAndUser } = await import('../services/deviceService.js');
    const device = await getDeviceByIdAndUser(deviceId, req.user.id);
    if (!device) {
      return res.status(403).json({ error: 'Access denied to this device' });
    }
    
    const { from, to } = resolveRange({
      period: req.query.period || 'month',
      from: req.query.from,
      to: req.query.to,
      timezone: req.user?.timezone || 'UTC',
    });
    const rows = await readingsInRange(deviceId, from, to);
    const baseRate = req.user?.base_tariff ?? config.baseTariff;
    const projection = buildCostProjection(rows, {
      baseTariff: baseRate,
      currencySymbol: req.query.symbol || '₹',
    });
    res.json({
      device_id: deviceId,
      from,
      to,
      projection,
    });
  }),
);

export default router;

