import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const googleClient = new OAuth2Client(env.googleClientId);

/**
 * Verify a Google ID token.
 *
 * This is only used during the initial Google sign-in.
 * We do NOT use the Google token for normal API authentication.
 */
export async function verifyGoogleIdToken(idToken) {
  if (!env.googleClientId) {
    const error = new Error('Google authentication is not configured.');
    error.statusCode = 503;
    throw error;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId
    });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload?.email ||
      payload.email_verified !== true
    ) {
      const error = new Error('Invalid Google account information.');
      error.statusCode = 401;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.statusCode) throw error;

    const authError = new Error('Invalid or expired Google credential.');
    authError.statusCode = 401;
    throw authError;
  }
}

/**
 * Create our application's JWT.
 *
 * The Google ID token is NOT stored in this JWT.
 * We only keep the application's user ID as the subject.
 */
export function createAppToken(user) {
  if (!env.jwtSecret) {
    const error = new Error('JWT authentication is not configured.');
    error.statusCode = 503;
    throw error;
  }

  return jwt.sign(
    {
      sub: user._id.toString()
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}


export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';

    const token = header.startsWith('Bearer ')
      ? header.slice(7).trim()
      : null;

    if (!token || !env.jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !decoded.sub
    ) {
      return next();
    }

    const user = await User.findById(decoded.sub).lean();

    if (!user) {
      return next();
    }

    req.user = user;

    next();
  } catch {
    /*
     * Invalid/expired JWT simply means the request is unauthenticated.
     * Public routes can continue normally.
     *
     * Protected routes using requireAdmin() will return 401.
     */
    next();
  }
}

/**
 * Only the configured DSA Sheet admin can modify content.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Sign-in required.'
    });
  }

  if (
    !env.adminEmail ||
    req.user.email !== env.adminEmail
  ) {
    return res.status(403).json({
      message:
        'Only the configured DSA Sheet admin can edit content.'
    });
  }

  next();
}