import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildProductFilter } from '../utils/productFilterBuilder.js';
import type { ProductQueryParams, PaginatedResponse } from '../types/productQuery.js';
import type { IProduct } from '../models/Product.js';

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