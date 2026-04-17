import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../types/auth.js';
import type { PopulatedCartItem, UpdateOrderStatusBody } from '../types/cart.js';

// ─── POST /api/orders ─────────────────────────────────────────

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const cart = await Cart.findOne({ user: userId }).populate<{
      items: PopulatedCartItem[];
    }>('items.product', 'name price stock');

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your cart is empty.', 400));
    }

    // Validate stock
    const stockErrors: string[] = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        stockErrors.push(
          `"${item.product.name}" has only ${item.product.stock} unit(s).`
        );
      }
    }

    if (stockErrors.length > 0) {
      return next(new AppError(stockErrors.join(' '), 400));
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    const totalPrice = Number(
      items
        .reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
        .toFixed(2)
    );

    const order = await Order.create({
      user: userId,
      items,
      totalPrice,
      status: 'pending',
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    const populated = await Order.findById(order._id)
      .populate('items.product', 'name category')
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders ──────────────────────────────────────────

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const orderId = req.params.id;

    if (!orderId) {
      return next(new AppError('Order ID is required.', 400));
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return next(new AppError('Invalid order ID.', 400));
    }

    const order = await Order.findById(orderId)
      .populate('items.product', 'name category')
      .lean();

    if (!order) return next(new AppError('Order not found.', 404));

    if (order.user.toString() !== userId) {
      return next(new AppError('Not authorised.', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/orders/:id/status ─────────────────────────────

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return next(new AppError('Order ID is required.', 400));
    }

    if (!Types.ObjectId.isValid(orderId)) {
      return next(new AppError('Invalid order ID.', 400));
    }

    const { status } = req.body as UpdateOrderStatusBody;

    const validStatuses = [
      'pending',
      'paid',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return next(new AppError('Invalid status.', 400));
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('items.product', 'name category')
      .lean();

    if (!order) return next(new AppError('Order not found.', 404));

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};