import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import {
  issueToken,
  sanitizeUser,
  findUserByEmail,
  createUser,
  verifyPassword,
  updateUserProfile,
  changePassword,
  countUsers,
} from '../services/authService.js';

const router = Router();

// Check if this is the first user (for showing register vs login)
router.get(
  '/check-first-user',
  asyncHandler(async (req, res) => {
    const userCount = await countUsers();
    res.json({ isFirstUser: userCount === 0 });
  }),
);

// Check if email already exists (for real-time validation during registration)
router.post(
  '/check-email',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const existing = await findUserByEmail(email.trim());
    res.json({ exists: !!existing });
  }),
);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    // Only allow first user to register
    if (await countUsers()) {
      return res.status(403).json({ error: 'Registration is disabled' });
    }
    const payload = registerSchema.parse(req.body);
    const existing = await findUserByEmail(payload.email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const user = await createUser(payload);
    const token = issueToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  }),
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = issueToken(user);
    res.json({ token, user: sanitizeUser(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);

const preferenceSchema = z.object({
  name: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  base_tariff: z.number().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z.record(z.boolean()).optional(),
  autosave: z.boolean().optional(),
  refresh_rate: z.number().int().positive().optional(),
  data_retention: z.enum(['7days','30days','90days','6months','1year','2years','forever']).optional(),
});

router.patch(
  '/preferences',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updates = preferenceSchema.parse(req.body);
    const user = await updateUserProfile(req.user.id, updates);
    res.json({ user: sanitizeUser(user) });
  }),
);

const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    await changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true });
  }),
);

export default router;

