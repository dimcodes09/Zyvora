// controllers/hamperController.ts
import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth.js";
import { Hamper } from "../models/Hamper.js";
import { Types } from "mongoose";

// ─── GET /api/hamper ──────────────────────────────────────────────────────────
// Returns the authenticated user's hamper.
// If no hamper exists yet, returns an empty items array (never 404).
// ─────────────────────────────────────────────────────────────────────────────

export const getHamper = async (
  req: Request,           // ← standard Request so router.get() is happy
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthRequest;  // ← cast inside; protect() guarantees this exists
    const userObjectId = new Types.ObjectId(userId);

    const hamper = await Hamper.findOne({ userId: userObjectId })
      .populate("items.productId", "name price image category")
      .lean();

    if (!hamper) {
      res.status(200).json({
        success: true,
        data: { userId, items: [], updatedAt: null },
      });
      return;
    }

    res.status(200).json({ success: true, data: hamper });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};

// ─── POST /api/hamper ─────────────────────────────────────────────────────────
// Full-replace: accepts { items: [{ productId, quantity }] } and upserts.
// Returns the saved (and populated) hamper document.
// ─────────────────────────────────────────────────────────────────────────────

export const saveHamper = async (
  req: Request,           // ← standard Request
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthRequest;  // ← cast inside
    const userObjectId = new Types.ObjectId(userId);

    const { items } = req.body as {
      items?: Array<{ productId: string; quantity: number }>;
    };

    if (!Array.isArray(items)) {
      res.status(400).json({ success: false, message: "`items` must be an array." });
      return;
    }

    const sanitised = items
      .filter((i) => i.productId && i.quantity >= 1)
      .map((i) => ({
        productId: new Types.ObjectId(i.productId),
        quantity:  Math.floor(i.quantity),
      }));

    const hamper = await Hamper.findOneAndUpdate(
      { userId: userObjectId },
      { $set: { items: sanitised } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("items.productId", "name price image category");

    res.status(200).json({ success: true, data: hamper });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
};