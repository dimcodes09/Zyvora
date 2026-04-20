import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import type { AuthRequest } from '../types/auth.js';

export const protect = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided. Authorization denied.', 401));
    }

    const token = authHeader.split(' ')[1];

    // ❌ Invalid format
    if (!token) {
      return next(new AppError('Malformed token. Authorization denied.', 401));
    }

    // ✅ Decode safely
    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    };

    // ❌ Missing payload safety
    if (!decoded?.userId) {
      return next(new AppError('Invalid token payload.', 401));
    }

    // ✅ Attach to request
    (req as AuthRequest).userId = decoded.userId;
    (req as AuthRequest).role = decoded.role;

    next();
  } catch (err: any) {
    // ✅ Better error handling
    let message = 'Invalid token. Authorization denied.';

    if (err?.name === 'TokenExpiredError') {
      message = 'Token expired. Please log in again.';
    }

    next(new AppError(message, 401));
  }
};