import { Router } from "express";
import { createGift, getGift } from "../controllers/giftController.js";

const router = Router();

router.post("/", createGift);
router.get("/:id", getGift);

export default router;