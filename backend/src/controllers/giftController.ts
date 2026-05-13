import type { Request, Response } from "express";
import GiftMessage from "../models/GiftMessage.js";

const GIFT_TYPES = ["text", "audio", "video"] as const;

const isPublicHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// POST /api/gift
export const createGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, content, senderId } = req.body;

    if (!type || !content) {
      res.status(400).json({ success: false, message: "type and content are required" });
      return;
    }

    if (!GIFT_TYPES.includes(type)) {
      res.status(400).json({
        success: false,
        message: "type must be one of: text, audio, video",
      });
      return;
    }

    if ((type === "audio" || type === "video") && !isPublicHttpUrl(content)) {
      res.status(400).json({
        success: false,
        message: "Audio and video gifts must use a public http/https URL, such as a Cloudinary link.",
      });
      return;
    }

    const gift = await GiftMessage.create({ type, content, senderId });

    res.status(201).json({ success: true, giftId: gift._id, data: gift });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create gift" });
  }
};

// GET /api/gift/:id
export const getGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const gift = await GiftMessage.findById(req.params.id);

    if (!gift) {
      res.status(404).json({ success: false, message: "Gift not found" });
      return;
    }

    res.status(200).json({ success: true, data: gift });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch gift" });
  }
};
