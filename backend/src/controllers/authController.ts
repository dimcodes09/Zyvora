import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  RegisterBody,
  LoginBody,
  AuthRequest,
} from '../types/auth.js';

// ─── POST /api/auth/register ──────────────────────────────────
export const register = async (
  req: Request<object, object, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ validation
    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }

    // ✅ normalize email
    const normalizedEmail = email.toLowerCase();

    // ✅ check existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    // ✅ create user
    const user = await User.create({
  name,
  email: normalizedEmail,
  password,
  role: role === "admin" ? "admin" : "user", // ✅ ADD THIS
});

    // ✅ generate token
    const token = signToken(String(user._id), user.role);

    // ✅ correct response format (frontend compatible)
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role, // ✅ ADD THIS
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

    // ✅ validation
    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const normalizedEmail = email.toLowerCase();

    // ✅ find user
    const user = await User.findByEmail(normalizedEmail);

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // ✅ token
    const token = signToken(String(user._id), user.role);

    // ✅ consistent response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role, // ✅ ADD THIS
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

    // ✅ FORCE return role
    res.status(200).json({
      success: true,
      data: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role, // 🔥 THIS FIXES NAVBAR
      },
    });

  } catch (error) {
    next(error);
  }
};