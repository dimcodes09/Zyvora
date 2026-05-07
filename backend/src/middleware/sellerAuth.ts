import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

interface SellerJwtPayload {
  id: string;
  phone: string;
  role: string;
}

export interface SellerRequest extends Request {
  seller?: {
    id: string;
    phone: string;
    role: "seller";
  };
}

// ─── Verify Seller JWT ──────────────────────────────────────────────────────
export const protectSeller = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      return;
    }

    if (!secret) {
      res.status(500).json({ success: false, message: "Server misconfiguration" });
      return;
    }

    const decoded = jwt.verify(token, secret) as unknown as SellerJwtPayload;

    if (decoded.role !== "seller") {
      res.status(403).json({ success: false, message: "Forbidden: Seller access required" });
      return;
    }

    // Verify seller still exists and is active
    const seller = await Seller.findById(decoded.id).select("_id phone isActive");
    if (!seller || !seller.isActive) {
      res.status(401).json({ success: false, message: "Seller account not found or deactivated" });
      return;
    }

    req.seller = { id: decoded.id, phone: decoded.phone, role: "seller" };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ─── Verified Sellers Only ──────────────────────────────────────────────────
export const requireVerified = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const seller = await Seller.findById(req.seller?.id).select("isVerified");
  if (!seller?.isVerified) {
    res.status(403).json({
      success: false,
      message: "Account pending verification. Please wait for admin approval.",
    });
    return;
  }
  next();
};
