import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  RegisterBody,
  LoginBody,
  AuthResponse,
  AuthRequest,
} from '../types/auth.js';

// ─── POST /api/auth/register ──────────────────────────────────
export const register = async (
  req: Request<object, object, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({ name, email, password });

    const token = signToken(String(user._id), user.role);

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────
export const login = async (
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = signToken(String(user._id), user.role);

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me (protected) ────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId; // ✅ correct way

    if (!userId) {
      return next(new AppError('Not authorized', 401));
    }

    const user = await User.findById(userId).select('-__v').lean();

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};