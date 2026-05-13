import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  RegisterBody,
  LoginBody,
  AuthRequest,
} from '../types/auth.js';

// ✅ ADD THIS IMPORT (SAFE)
import { addUserPoints, updateUserStreak } from "../services/gamification.service.js";

// ─── POST /api/auth/register ──────────────────────────────────
export const register = async (
  req: Request<object, object, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    const token = signToken(String(user._id), user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

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

    const normalizedEmail = email.toLowerCase();

    const user = await User.findByEmail(normalizedEmail);

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = signToken(String(user._id), user.role);

    // ─── ✅ GAMIFICATION ADD (SAFE) ─────────────────────────

    const userId = String(user._id);

    await updateUserStreak(userId);
    await addUserPoints(userId, "LOGIN");

    // ───────────────────────────────────────────────────────

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      return next(new AppError('Not authorized', 401));
    }

    const user = await User.findById(userId)
      .select('-password -__v')
      .lean();

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points ?? 0,
        streak: user.streak ?? 0,
        lastActive: user.lastActive ?? null,
        rewards: user.rewards ?? [],
      },
    });

  } catch (error) {
    next(error);
  }
};
