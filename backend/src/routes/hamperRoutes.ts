import { Router } from "express";
import { getHamper, saveHamper } from "../controllers/hamperController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = Router();

// 🔒 All routes protected
router.use(protect);

// 📦 Routes
router.get("/", getHamper);    // GET  /api/hamper
router.post("/", saveHamper);  // POST /api/hamper

export default router;