import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth.js";
import { Hamper } from "../models/Hamper.js";
import { Types } from "mongoose";

// ─── Helper: sanitise + deduplicate items ─────────────────────

const sanitiseItems = (items: any[] = []) => {
  const map = new Map<string, number>();

  for (const item of items) {
    const id = item.productId?.toString();
    if (!id) continue;

    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty < 1) continue;

    map.set(id, (map.get(id) ?? 0) + qty);
  }

  return Array.from(map.entries()).map(([productId, quantity]) => ({
    productId: new Types.ObjectId(productId),
    quantity,
  }));
};

// ─── GET /api/hamper ─────────────────────────────────────────

export const getHamper = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthRequest;
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

    res.status(200).json({
      success: true,
      data: hamper,
    });
  } catch (err: any) {
    console.error("[GET /api/hamper]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve hamper",
    });
  }
};

// ─── POST /api/hamper ────────────────────────────────────────

export const saveHamper = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthRequest;
    const userObjectId = new Types.ObjectId(userId);

    const { items } = req.body as {
      items?: Array<{ productId: string; quantity: number }>;
    };

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: "`items` must be an array.",
      });
      return;
    }

    const cleanItems = sanitiseItems(items);

    const hamper = await Hamper.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set: {
          items: cleanItems,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate("items.productId", "name price image category");

    res.status(200).json({
      success: true,
      message: "Hamper saved successfully",
      data: hamper,
    });
  } catch (err: any) {
    console.error("[POST /api/hamper]", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: err.message || "Failed to save hamper",
    });
  }
};