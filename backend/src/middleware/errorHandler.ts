import type { Request, Response, NextFunction } from 'express';

// ─── Custom error class ───────────────────────────────────────
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── 404 handler ─────────────────────────────────────────────
export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// ─── Global error handler ─────────────────────────────────────
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Fallback
  console.error('Unexpected error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
};
