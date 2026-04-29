// routes/hamperRoutes.ts
import { Router } from "express";
import { protect }               from "../middleware/authMiddleware.js";
import { getHamper, saveHamper } from "../controllers/hamperController.js";

const router = Router();

router.use(protect);

router.get("/",  getHamper);   // GET  /api/hamper
router.post("/", saveHamper);  // POST /api/hamper

export default router;