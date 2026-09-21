import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/signature', optionalAuth, requireAdmin, (_req, res) => {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    return res.status(503).json({ message: 'Cloudinary is not configured.' });
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
  });

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp }, env.cloudinary.apiSecret);
  res.json({ signature, timestamp, cloudName: env.cloudinary.cloudName, apiKey: env.cloudinary.apiKey });
});

export default router;
