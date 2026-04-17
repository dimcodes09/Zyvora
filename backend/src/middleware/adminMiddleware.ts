import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../types/auth.js';

export const adminOnly = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const user = req as AuthRequest;

    if (!user.userId) {
      return next(new AppError('Not authenticated.', 401));
    }

    if (user.role !== 'admin') {
      return next(new AppError('Admin access only.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};