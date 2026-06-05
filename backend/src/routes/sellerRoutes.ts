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
  generateDeliveryOTP,
  verifyDeliveryOTP,
} from "../controllers/sellerController.js";
import { getSellerAnalytics } from "../controllers/analyticsController.js";
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

// Analytics
router.get("/analytics", getSellerAnalytics);

// Products
router.get("/products", getSellerProducts);
router.post("/products", addProduct);
router.patch("/products/:id", updateProduct);

// Orders
router.get("/orders", getSellerOrders);
router.patch("/orders/:id", updateOrderStatus);
router.post("/orders/:id/generate-otp", generateDeliveryOTP);
router.post("/orders/:id/verify-otp",   verifyDeliveryOTP);

export default router;
