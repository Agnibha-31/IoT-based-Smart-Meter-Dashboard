import { Router } from 'express';
import { db } from '../db.js';
import config from '../config.js';

const router = Router();

// Admin route to reset all users - DANGEROUS, use with caution
router.post('/reset-users', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin key check (you can set this in environment variables)
    const expectedKey = process.env.ADMIN_RESET_KEY || 'RESET_KEY_CHANGE_ME';
    
    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: 'Invalid admin key' });
    }
    
    // Delete all users
    const result = await db.run('DELETE FROM users');
    
    res.json({ 
      success: true, 
      message: 'All user accounts have been deleted',
      deletedCount: result.changes || 0
    });
  } catch (error) {
    console.error('Reset users error:', error);
    res.status(500).json({ error: 'Failed to reset users' });
  }
});

export default router;
