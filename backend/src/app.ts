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
import sellerRoutes from "./routes/sellerRoutes.js";
// In backend/src/app.ts — add alongside your existing routes
import gamificationRoutes from "./routes/gamification.routes.js";
import giftRoutes from "./routes/giftRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

const app: Application = express();

const allowedOrigins = new Set(
  [
    config.clientUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    // Production Vercel deployments
    "https://zyvoras.vercel.app",
    "https://www.zyvoras.vercel.app",
    "https://zyvora-livid.vercel.app",
    "https://www.zyvora-livid.vercel.app",
    process.env.PUBLIC_CLIENT_URL,
    process.env.NGROK_URL,
  ].filter((origin): origin is string => Boolean(origin))
);

const isLocalDevOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin) ||
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
  /^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/.test(origin) ||
  // Allow all Vercel preview deployments automatically
  /^https:\/\/[a-z0-9-]+-[a-z0-9]+\.vercel\.app$/.test(origin) ||
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/.test(origin);

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Logging ──────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

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

app.use("/api/seller", sellerRoutes);

app.use("/api/user", gamificationRoutes);

app.use("/api/gift", giftRoutes);
app.use("/api/support", supportRoutes);


// ─── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
