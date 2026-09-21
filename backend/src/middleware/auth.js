import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const client = new OAuth2Client(env.googleClientId);

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token || !env.googleClientId) return next();

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) return next();

    const email = payload.email.toLowerCase();
    const user = await User.findOneAndUpdate(
      { googleId: payload.sub },
      {
        googleId: payload.sub,
        name: payload.name || email,
        email,
        picture: payload.picture || ''
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    req.user = user;
    next();
  } catch {
    next();
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Google sign-in required.' });
  }

  if (!env.adminEmail || req.user.email !== env.adminEmail) {
    return res.status(403).json({ message: 'Only the configured DSA Sheet admin can edit content.' });
  }

  next();
}
