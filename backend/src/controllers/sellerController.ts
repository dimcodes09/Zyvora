import type { Request, Response } from "express";
import { Types, type FilterQuery } from "mongoose";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import { Order } from "../models/Order.js";
import type { IOrder } from "../models/Order.js";
import type { SellerRequest } from "../middleware/sellerAuth.js";

// ─── Utility ────────────────────────────────────────────────────────────────
const signToken = (id: string, phone: string) => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as NonNullable<
    SignOptions["expiresIn"]
  >;

  return jwt.sign({ id, phone, role: "seller" }, secret, {
    expiresIn,
  });
};

// ─── OTP Store (in-memory for Phase 1 — replace with Redis in production) ───
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── AUTH ────────────────────────────────────────────────────────────────────

// POST /api/seller/send-otp
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400).json({ success: false, message: "Enter a valid 10-digit phone number" });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phone, { otp, expiresAt });

    // TODO: Integrate SMS provider (Twilio / MSG91 / Fast2SMS)
    // await sendSMS(phone, `Your Zyvora seller OTP is: ${otp}`);

    // DEV ONLY — remove in production
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // Remove 'otp' in production:
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// POST /api/seller/verify-otp  (login existing seller)
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const stored = otpStore.get(phone);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    const seller = await Seller.findOne({ phone });
    if (!seller) {
      res.status(200).json({
        success: true,
        message: "No seller account found. Please register first.",
        needsRegistration: true,
      });
      return;
    }

    if (!seller.isActive) {
      res.status(403).json({ success: false, message: "Account deactivated. Contact support." });
      return;
    }

    otpStore.delete(phone);

    const token = signToken(seller._id.toString(), seller.phone);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        shopName: seller.shopName,
        isVerified: seller.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// POST /api/seller/register
export const registerSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, name, shopName, location, gst, upiId } = req.body;

    // Re-verify OTP for registration too
    const stored = otpStore.get(phone);
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    const existing = await Seller.findOne({ phone });
    if (existing) {
      res.status(409).json({ success: false, message: "Seller already registered with this phone" });
      return;
    }

    if (!name || !shopName || !location) {
      res.status(400).json({ success: false, message: "Name, shop name, and location are required" });
      return;
    }

    otpStore.delete(phone);

    const seller = await Seller.create({
      name: name.trim(),
      phone,
      shopName: shopName.trim(),
      location: location.trim(),
      gst: gst?.trim(),
      upiId: upiId?.trim(),
    });

    const token = signToken(seller._id.toString(), seller.phone);

    res.status(201).json({
      success: true,
      message: "Seller account created! Awaiting verification.",
      token,
      seller: {
        id: seller._id,
        name: seller.name,
        shopName: seller.shopName,
        isVerified: seller.isVerified,
      },
    });
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      res.status(409).json({ success: false, message: "Phone number already registered" });
      return;
    }
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────

// GET /api/seller/profile
export const getProfile = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const seller = await Seller.findById(req.seller?.id).select("-__v");
    if (!seller) {
      res.status(404).json({ success: false, message: "Seller not found" });
      return;
    }
    res.status(200).json({ success: true, seller });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// PATCH /api/seller/profile
export const updateProfile = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { name, shopName, location, gst, upiId, bankDetails } = req.body;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name.trim();
    if (shopName) updates.shopName = shopName.trim();
    if (location) updates.location = location.trim();
    if (gst !== undefined) updates.gst = gst?.trim();
    if (upiId !== undefined) updates.upiId = upiId?.trim();
    if (bankDetails) updates.bankDetails = bankDetails;

    const seller = await Seller.findByIdAndUpdate(req.seller?.id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");

    res.status(200).json({ success: true, message: "Profile updated", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// POST /api/seller/products
export const addProduct = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    // Dynamic import to avoid circular deps with existing Product model
    const { Product } = await import("../models/Product.js");

    const { name, description, price, stock, category, image } = req.body;

    if (!name || !price || stock === undefined) {
      res.status(400).json({ success: false, message: "Name, price, and stock are required" });
      return;
    }

    if (!category?.trim()) {
      res.status(400).json({ success: false, message: "Category is required" });
      return;
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim(),
      price: Number(price),
      stock: Number(stock),
      category: category.trim(),
      image,
      sellerId: req.seller?.id,
      isActive: true,
    });

    res.status(201).json({ success: true, message: "Product added", product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, message: "Failed to add product", error: msg });
  }
};

// GET /api/seller/products
export const getSellerProducts = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { Product } = await import("../models/Product.js");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ sellerId: req.seller?.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Product.countDocuments({ sellerId: req.seller?.id }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// PATCH /api/seller/products/:id
export const updateProduct = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { Product } = await import("../models/Product.js");

    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.seller?.id,
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found or not yours" });
      return;
    }

    const { name, description, price, stock, category, image, isActive } = req.body;
    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    res.status(200).json({ success: true, message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

// GET /api/seller/orders
export const getSellerOrders = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { status, date } = req.query;
    const sellerId = req.seller?.id;

    if (!sellerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const filter: FilterQuery<IOrder> = { seller: sellerId };
    if (status) filter.status = status;
    if (date === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start };
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 })
      .lean()
      .limit(100);

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// PATCH /api/seller/orders/:id
export const updateOrderStatus = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ["accepted", "packed", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    const order = await Order.findOne({
      _id: req.params.id,
      seller: req.seller?.id,
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Prevent illegal transitions
    const transitions: Record<string, string[]> = {
      pending: ["accepted", "cancelled"],
      paid: ["accepted", "cancelled"],
      accepted: ["packed", "cancelled"],
      packed: ["delivered"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    const allowedNextStatuses = transitions[order.status] ?? [];

    if (!allowedNextStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Cannot move order from '${order.status}' to '${status}'`,
      });
      return;
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name image")
      .lean();

    res.status(200).json({ success: true, message: "Order updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

// GET /api/seller/dashboard
export const getDashboardStats = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    const { Product } = await import("../models/Product.js");
    const sellerId = req.seller?.id;

    if (!sellerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaysOrders, totalOrders, products, earnings] = await Promise.all([
      Order.find({ seller: sellerId, createdAt: { $gte: todayStart } })
        .select("status totalPrice items createdAt")
        .sort({ createdAt: -1 }),
      Order.countDocuments({ seller: sellerId }),
      Product.find({ sellerId }).select("name stock price isActive"),
      Order.aggregate([
        { $match: { seller: new Types.ObjectId(sellerId), status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    const todayRevenue = todaysOrders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const outOfStock = products.filter((p) => p.stock === 0);

    res.status(200).json({
      success: true,
      stats: {
        todaysOrders: todaysOrders.length,
        todayRevenue,
        totalOrders,
        totalProducts: products.length,
        totalEarnings: earnings[0]?.total || 0,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStock.length,
      },
      recentOrders: todaysOrders.slice(0, 10),
      lowStock: lowStockProducts.slice(0, 5).map((p) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
};
