import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── POST /api/auth/google ────────────────────────────────────
// Receives either:
//   • A Google access_token (implicit flow) — verified via Google userinfo API
//   • A Google ID token (credential flow) — decoded from JWT payload
// Then finds/creates user and returns the existing app JWT.
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body as { token?: string };

    if (!token) {
      return next(new AppError('Google token is required.', 400));
    }

    let email: string | undefined;
    let name: string | undefined;

    // ── Strategy 1: try Google userinfo endpoint (access_token flow) ──
    try {
      const userInfoRes = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (userInfoRes.ok) {
        const info = (await userInfoRes.json()) as {
          email?: string;
          name?: string;
        };
        email = info.email;
        name = info.name;
      }
    } catch {
      // will fall through to Strategy 2
    }

    // ── Strategy 2: decode as JWT payload (ID token / credential flow) ──
    if (!email) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const decoded = Buffer.from(parts[1], 'base64url').toString('utf-8');
          const payload = JSON.parse(decoded) as {
            email?: string;
            name?: string;
          };
          email = payload.email;
          name = payload.name;
        } catch {
          // invalid token
        }
      }
    }

    if (!email) {
      return next(new AppError('Could not retrieve email from Google token.', 400));
    }

    const normalizedEmail = email.toLowerCase();

    // ── Find or create user ────────────────────────────────────
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: name ?? normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: 'google-auth-placeholder', // bcrypt hook hashes it — never used
        role: 'user',
      });
    }

    // ── Sign JWT with existing utility ─────────────────────────
    const jwtToken = signToken(String(user._id), user.role);

    res.status(200).json({
      success: true,
      data: {
        token: jwtToken,
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
