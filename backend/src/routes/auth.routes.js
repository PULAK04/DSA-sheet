import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/me', optionalAuth, (req, res) => {
  res.json({
    authenticated: Boolean(req.user),
    isAdmin: Boolean(req.user && env.adminEmail && req.user.email === env.adminEmail),
    user: req.user || null
  });
});

export default router;
