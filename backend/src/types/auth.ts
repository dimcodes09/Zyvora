import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

// ─── JWT ──────────────────────────────────────────────────────

export interface TokenPayload extends JwtPayload {
  userId: string;
}

// ─── Extended Request ─────────────────────────────────────────

// Attached by authMiddleware — available on all protected routes
export interface AuthRequest extends Request {
  userId: string;
  role?: string;
}

// ─── Controller Bodies ────────────────────────────────────────

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

// ─── Token Response ───────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}