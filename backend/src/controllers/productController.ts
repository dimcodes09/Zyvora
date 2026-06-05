import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildProductFilter } from '../utils/productFilterBuilder.js';
import type { ProductQueryParams, PaginatedResponse } from '../types/productQuery.js';
import type { IProduct } from '../models/Product.js';
import { addUserPoints } from '../services/gamification.service.js'; // ✅ NEW

// ─── GET /api/products ────────────────────────────────────────
export const getProducts = async (
  req: Request<object, object, object, ProductQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filter, pagination } = buildProductFilter(req.query);
    const { page, limit, skip } = pagination;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const response: PaginatedResponse<IProduct> = {
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products as unknown as IProduct[],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/products/:id ────────────────────────────────────
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid product ID', 400));
    }

    // ─── ANALYTICS: track unique authenticated viewers ────────
    // Fire-and-forget — never blocks or breaks the response
    const userId = (req as any).userId || (req as any).user?.userId;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      Product.findByIdAndUpdate(id, {
        $addToSet: { uniqueViewers: new mongoose.Types.ObjectId(userId) },
      }).catch(() => { /* silent — analytics must never break product fetch */ });
    }

    const product = await Product.findById(id).select('-__v').lean();

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/products ───────────────────────────────────────
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/products/:id ────────────────────────────────────
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/products/:id ─────────────────────────────────
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/products/:id/similar ───────────────────────────
export const getSimilarProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid product ID', 400));
    }

    const product = await Product.findById(id).select('category price').lean();

    if (!product) return next(new AppError('Product not found', 404));

    const { category, price } = product as unknown as { category: string; price: number };

    const priceFloor = price * 0.7;
    const priceCeil = price * 1.3;

    const similar = await Product.find({
      _id: { $ne: id },
      category: category,
      price: { $gte: priceFloor, $lte: priceCeil },
    })
      .select('-__v')
      .lean();

    const sorted = similar
      .sort((a, b) => {
        const aPrice = (a as unknown as { price: number }).price;
        const bPrice = (b as unknown as { price: number }).price;
        return Math.abs(aPrice - price) - Math.abs(bPrice - price);
      })
      .slice(0, 8);

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/products/search ───────────────────────────
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query as { q?: string };

    if (!q) {
      res.status(400).json({ success: false });
      return;
    }

    const products = await Product.find({
      $or: [
        { name:     { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-__v')
      .limit(3)
      .lean();

    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/products/:id/review ─────────────────────────── ✅ NEW
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = (req as any).user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new AppError('Invalid product ID', 400));
    }

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product not found', 404));

    // Prevent duplicate reviews
    const alreadyReviewed = (product as any).reviews?.some(
      (r: any) => r.user.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    // Push new review
    (product as any).reviews = (product as any).reviews ?? [];
    (product as any).reviews.push({
      user: userId,
      rating: Number(rating),
      comment: comment ?? '',
    });

    await product.save();

    // ✅ Award +5 points for review
    await addUserPoints(userId.toString(), 'REVIEW');

    res.status(201).json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    next(error);
  }
};
