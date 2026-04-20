import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import { razorpay } from '../utils/razorpay.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';

import type { AuthRequest } from '../types/auth.js';
import type { PopulatedPaymentItem, RazorpayVerifyBody } from '../types/payment.js';

import { config } from '../config/env.js';

// ─── CREATE RAZORPAY ORDER ───────────────────────────────────

export const createRazorpayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as unknown as AuthRequest;

    const cart = await Cart.findOne({ user: userId }).populate<{
      items: PopulatedPaymentItem[];
    }>('items.product', 'name price stock');

    if (!cart || cart.items.length === 0) {
      next(new AppError('Your cart is empty.', 400));
      return;
    }

    const stockErrors: string[] = [];
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        stockErrors.push(
          `"${item.product.name}" has only ${item.product.stock} unit(s) in stock.`
        );
      }
    }

    if (stockErrors.length > 0) {
      next(new AppError(stockErrors.join(' '), 400));
      return;
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    const totalPrice = parseFloat(
      orderItems
        .reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
        .toFixed(2)
    );

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: 'INR',
      receipt: String(order._id),
      notes: {
        orderId: String(order._id),
        userId,
      },
    });

    await Order.findByIdAndUpdate(order._id, {
      razorpayOrderId: razorpayOrder.id,
    });

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: String(order._id),
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY PAYMENT ──────────────────────────────────────────

export const verifyRazorpayPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as unknown as AuthRequest;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body as RazorpayVerifyBody;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      next(
        new AppError(
          'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
          400
        )
      );
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      next(new AppError('Invalid payment signature.', 400));
      return;
    }

    // 🔥 SECURE: ensure user owns this order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
    });

    if (!order) {
      next(new AppError('Order not found or not authorised.', 404));
      return;
    }

    if (order.status !== 'paid') {
      await Order.findByIdAndUpdate(order._id, {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      orderId: String(order._id),
      status: 'paid',
    });
  } catch (error) {
    next(error);
  }
};