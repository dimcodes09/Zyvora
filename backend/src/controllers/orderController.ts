import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../types/auth.js';
import type { UpdateOrderStatusBody } from '../types/cart.js';
import {
  buildCheckoutOrderData,
  clearCheckoutSource,
  getCheckoutSource,
} from '../utils/checkoutSource.js';
import { addUserPoints } from "../services/gamification.service.js"; // ✅ already present

// ─── POST /api/orders ─────────────────────────────────────────

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const source = getCheckoutSource(req.body?.source);

    const checkout = await buildCheckoutOrderData(userId, source);

    const order = await Order.create({
      user: userId,
      ...(checkout.seller ? { seller: checkout.seller } : {}),
      items: checkout.items,
      totalPrice: checkout.totalPrice,
      status: 'pending',
      paymentMethod: 'cod',
      ...(checkout.notes ? { notes: checkout.notes } : {}),
    });

    // ─── ✅ GAMIFICATION ADD (SAFE) ─────────────────────────

    await addUserPoints(userId, "ORDER");

    // check if first order
    const orderCount = await Order.countDocuments({ user: userId });
    if (orderCount === 1) {
      await addUserPoints(userId, "FIRST_ORDER");
    }

    // ───────────────────────────────────────────────────────

    await clearCheckoutSource(userId, source);

    const populated = await Order.findById(order._id)
      .populate('items.product', 'name category price image')
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
      .populate('items.product', 'name category price image')
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
      .populate('items.product', 'name category price image')
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
      'accepted',
      'packed',
      'delivered',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return next(new AppError('Invalid status.', 400));
    }

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) return next(new AppError('Order not found.', 404));

    const transitions: Record<string, string[]> = {
      pending: ['accepted', 'cancelled'],
      paid: ['accepted', 'cancelled'],
      accepted: ['packed', 'cancelled'],
      packed: ['delivered'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const allowedNextStatuses = transitions[existingOrder.status] ?? [];

    if (!allowedNextStatuses.includes(status)) {
      return next(
        new AppError(
          `Cannot move order from '${existingOrder.status}' to '${status}'.`,
          400
        )
      );
    }

    existingOrder.status = status;
    await existingOrder.save();

    const order = await Order.findById(existingOrder._id)
      .populate('items.product', 'name category price image')
      .lean();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};