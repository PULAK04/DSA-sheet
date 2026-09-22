import { Router } from 'express';
import {
  optionalAuth,
  verifyGoogleIdToken,
  createAppToken
} from '../middleware/auth.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const router = Router();


router.post('/google', async (req, res) => {
  try {
    const credential = String(
      req.body?.credential || ''
    ).trim();

    if (!credential) {
      return res.status(400).json({
        message: 'Google credential is required.'
      });
    }

    const payload = await verifyGoogleIdToken(credential);

    const email = String(payload.email).toLowerCase();

    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        googleId: payload.sub,
        name: payload.name || email,
        email,
        picture: payload.picture || ''
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    if (!env.jwtSecret) {
      return res.status(503).json({
        message: 'JWT authentication is not configured.'
      });
    }

    const token = createAppToken(user);

    const isAdmin =
      Boolean(
        env.adminEmail &&
        user.email === env.adminEmail
      );

    return res.json({
      authenticated: true,
      isAdmin,
      token,
      user
    });
  } catch (error) {
    console.error(
      'Google authentication error:',
      error.message
    );

    const status = error.statusCode || 500;

    return res.status(status).json({
      message:
        status === 500
          ? 'Authentication failed.'
          : error.message
    });
  }
});

/**
 * Restore the current application session.
 *
 * This now checks OUR JWT instead of Google's ID token.
 */
router.get('/me', optionalAuth, (req, res) => {
  res.json({
    authenticated: Boolean(req.user),

    isAdmin: Boolean(
      req.user &&
      env.adminEmail &&
      req.user.email === env.adminEmail
    ),

    user: req.user || null
  });
});

export default router;