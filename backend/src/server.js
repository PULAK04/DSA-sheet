import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import dsaRoutes from './routes/dsa.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin, credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'dsa-sheet-backend' }));
app.use('/api/auth', authRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/upload', uploadRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

connectDB(env.mongoUri)
  .then(() => {
    app.listen(env.port, () => console.log(`Backend running on http://localhost:${env.port}`));
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
