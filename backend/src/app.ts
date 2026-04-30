import express from 'express';
import type { Application } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// ✅ NEW
import hamperRoutes from './routes/hamperRoutes.js';

const app: Application = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    // ✅ Dynamic origin: allow localhost + any *.vercel.app URL (handles preview deploys)
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      // Allow requests with no origin (server-to-server, Postman)
      if (!origin) return callback(null, true);
      // Allow any Vercel deployment URL
      if (origin.endsWith(".vercel.app") || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Logging ──────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── RATE LIMITERS ───────────────────────────────────────────

// Strict limiter (writes)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Product read limiter
const productReadLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 500,
  message: {
    success: false,
    message: 'Too many product requests, please try again later.',
  },
});

// Apply limiters
app.use('/api/products', productReadLimiter);
app.use('/api/cart', limiter);
app.use('/api/orders', limiter);

// ✅ (OPTIONAL but recommended)
app.use('/api/hamper', limiter);

// ─── Routes ───────────────────────────────────────────────────

app.use('/api/payments', paymentRoutes);
app.use('/api/health', healthRoutes);

// Auth (no limiter)
app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// ✅ NEW HAMPPER ROUTE
app.use('/api/hamper', hamperRoutes);

// ─── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;