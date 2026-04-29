import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../types/auth.js';
import type {
  AddToCartBody,
  UpdateQuantityBody,
  PopulatedCartItem,
} from '../types/cart.js';

// ─── Helper ───────────────────────────────────────────────────

const getPopulatedCart = (userId: string) =>
  Cart.findOne({ user: userId }).populate<{ items: PopulatedCartItem[] }>(
    'items.product',
    'name price stock image'
  );

// ─── GET /api/cart ────────────────────────────────────────────

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const cart = await getPopulatedCart(userId);

    if (!cart || cart.items.length === 0) {
       res
        .status(200)
        .json({ success: true, data: { items: [], subtotal: 0 },
         });
         return;
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: { items: cart.items, subtotal: Number(subtotal.toFixed(2)) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/cart ───────────────────────────────────────────

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { productId, quantity } = req.body as AddToCartBody;

    if (!productId || !quantity || quantity < 1) {
      return next(new AppError('productId and quantity ≥ 1 required.', 400));
    }

    if (!Types.ObjectId.isValid(productId)) {
      return next(new AppError('Invalid product ID.', 400));
    }

    const product = await Product.findById(productId).lean();
    if (!product) return next(new AppError('Product not found.', 404));

    if (product.stock < quantity) {
      return next(new AppError(`Only ${product.stock} in stock.`, 400));
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      const existingItem = cart.items[existingIndex];

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;

        if (product.stock < newQty) {
          return next(new AppError('Stock exceeded.', 400));
        }

        existingItem.quantity = newQty;
      }
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId as string),
        quantity,
      });
    }

    await cart.save();

    const populated = await getPopulatedCart(userId);

    const subtotal =
      populated?.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ) ?? 0;

    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: {
        items: populated?.items ?? [],
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/cart/:productId ───────────────────────────────

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const productId = req.params.productId;

    if (!productId) {
      return next(new AppError('Product ID is required.', 400));
    }

    if (!Types.ObjectId.isValid(productId)) {
      return next(new AppError('Invalid product ID.', 400));
    }

    const { quantity } = req.body as UpdateQuantityBody;

    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1.', 400));
    }

    const product = await Product.findById(productId).lean();
    if (!product) return next(new AppError('Product not found.', 404));

    if (product.stock < quantity) {
      return next(new AppError(`Only ${product.stock} in stock.`, 400));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return next(new AppError('Cart not found.', 404));

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) return next(new AppError('Product not in cart.', 404));

    item.quantity = quantity;
    await cart.save();

    const populated = await getPopulatedCart(userId);

    const subtotal =
      populated?.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ) ?? 0;

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: {
        items: populated?.items ?? [],
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/cart/:productId ──────────────────────────────

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const productId = req.params.productId;

    if (!productId) {
      return next(new AppError('Product ID is required.', 400));
    }

    if (!Types.ObjectId.isValid(productId)) {
      return next(new AppError('Invalid product ID.', 400));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return next(new AppError('Cart not found.', 404));

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return next(new AppError('Product not in cart.', 404));
    }

    await cart.save();

    const populated = await getPopulatedCart(userId);

    const subtotal =
      populated?.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ) ?? 0;

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      data: {
        items: populated?.items ?? [],
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/cart ─────────────────────────────────────────

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      data: { items: [], subtotal: 0 },
    });
  } catch (error) {
    next(error);
  }
};