import type { Request, Response } from "express";
import GiftMessage from "../models/GiftMessage.js";

// POST /api/gift
export const createGift = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, content, senderId } = req.body;

    if (!type || !content) {
      res.status(400).json({ success: false, message: "type and content are required" });
      return;
    }

    const gift = await GiftMessage.create({ type, content, senderId });

    res.status(201).json({ success: true, giftId: gift._id });
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