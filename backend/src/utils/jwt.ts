import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { TokenPayload } from '../types/auth.js';

export const signToken = (userId: string, role: string): string => {
  const payload: TokenPayload = { userId, role };

  return jwt.sign(
    payload as object,              // ✅ FORCE correct overload
    config.jwt.secret as string,   // ✅ keep simple
    {
      expiresIn: config.jwt.expiresIn as any, // ✅ bypass strict TS bug
    }
  );
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    config.jwt.secret as string
  ) as TokenPayload;
};