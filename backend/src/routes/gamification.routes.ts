import { Router, type Request, type Response } from "express";
import { User } from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js"; // your existing auth middleware

const router = Router();

type ProtectedRequest = Request & {
  user?: {
    userId?: string;
    id?: string;
    _id?: string;
  };
  userId?: string;
};

// POST /api/user/redeem
router.post("/redeem", protect, async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.body;
    const authReq = req as ProtectedRequest;
    const userId = authReq.userId || authReq.user?.userId || authReq.user?.id || authReq.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Please log in again." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const reward = user.rewards.find((item) => {
      const id = (item as { _id?: { toString(): string } })._id;
      return id?.toString() === rewardId;
    });
    if (!reward) return res.status(404).json({ success: false, message: "Reward not found" });
    if (reward.used) return res.status(400).json({ success: false, message: "Reward already used" });
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Reward expired" });
    }

    reward.used = true;
    await user.save();

    res.json({
      success: true,
      reward,
      points: user.points ?? 0,
      streak: user.streak ?? 0,
      rewards: user.rewards ?? [],
      message: "Reward redeemed successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
