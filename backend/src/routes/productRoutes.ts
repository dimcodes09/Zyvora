import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts,
} from "../controllers/productController.js";

import { Product } from "../models/Product.js";

const router = Router();

// ── BASE ROUTES ─────────────────────────────────────────

// GET all + CREATE
router.route("/").get(getProducts).post(createProduct);

// ── REELS ROUTE (IMPORTANT: BEFORE /:id) ────────────────

router.get("/reels", async (_req, res) => {
  try {
    const products = await Product.find(
      {
        reelVideo: { $exists: true, $nin: [null, ""] },
      },
      {
        name: 1,
        price: 1,
        image: 1,
        reelVideo: 1,
      }
    ).lean();

    res.json({ products });
  } catch (err) {
    console.error("[GET /api/products/reels]", err);
    res.status(500).json({ error: "Failed to fetch reel products" });
  }
});

// ── SIMILAR PRODUCTS (ALSO BEFORE /:id) ────────────────

router.get("/:id/similar", getSimilarProducts);

// ── SINGLE PRODUCT ROUTES ─────────────────────────────

router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;