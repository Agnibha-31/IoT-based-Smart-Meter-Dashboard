import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { listDevices, createDevice } from '../services/deviceService.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const devices = await listDevices();
    res.json({ devices });
  }),
);

const createSchema = z.object({
  name: z.string().min(3),
  timezone: z.string().optional(),
  location: z.string().optional(),
});

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin role required' });
    }
    const payload = createSchema.parse(req.body);
    const device = await createDevice(payload);
    res.status(201).json({ device });
  }),
);

export default router;

