import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  registerSeller,
  getProfile,
  updateProfile,
  addProduct,
  getSellerProducts,
  updateProduct,
  getSellerOrders,
  updateOrderStatus,
  getDashboardStats,
} from "../controllers/sellerController.js";
import { protectSeller } from "../middleware/sellerAuth.js";

const router = Router();

// ─── Public (no auth needed) ─────────────────────────────────────────────────
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", registerSeller);

// ─── Protected (JWT required) ────────────────────────────────────────────────
router.use(protectSeller);

// Profile
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products
router.get("/products", getSellerProducts);
router.post("/products", addProduct);
router.patch("/products/:id", updateProduct);

// Orders
router.get("/orders", getSellerOrders);
router.patch("/orders/:id", updateOrderStatus);

export default router;
