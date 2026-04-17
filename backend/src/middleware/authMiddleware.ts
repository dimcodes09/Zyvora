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

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('No token provided. Authorization denied.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Malformed token. Authorization denied.', 401));
    }

    const decoded = verifyToken(token);

    // ✅ attach BOTH userId + role
    (req as AuthRequest).userId = decoded.userId;
    (req as AuthRequest).role = decoded.role; // 🔥 THIS LINE FIXES YOUR ERROR

    next();
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'TokenExpiredError'
        ? 'Token expired. Please log in again.'
        : 'Invalid token. Authorization denied.';

    next(new AppError(message, 401));
  }
};