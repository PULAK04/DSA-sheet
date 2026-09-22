import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),

  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/dsa_sheet',

  googleClientId:
    process.env.GOOGLE_CLIENT_ID || '',

  adminEmail:
    (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),

  frontendOrigin:
    process.env.FRONTEND_ORIGIN ||
    'http://localhost:5173',

  jwtSecret:
    process.env.JWT_SECRET || '',

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN || '30d',

  cloudinary: {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME || '',

    apiKey:
      process.env.CLOUDINARY_API_KEY || '',

    apiSecret:
      process.env.CLOUDINARY_API_SECRET || ''
  }
};