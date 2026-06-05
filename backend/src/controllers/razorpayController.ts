import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

import { razorpay } from '../utils/razorpay.js';
import { Order } from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';

import type { AuthRequest } from '../types/auth.js';
import type { RazorpayVerifyBody } from '../types/payment.js';

import { config } from '../config/env.js';
import {
  buildCheckoutOrderData,
  clearCheckoutSource,
  getCheckoutSource,
} from '../utils/checkoutSource.js';

// ─── CREATE RAZORPAY ORDER ───────────────────────────────────

export const createRazorpayOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const source = getCheckoutSource(req.body?.source);

    // ─── BUYER CONTACT ─────────────────────────────────────
    const { name, phone, address, city, state, pincode } = req.body as {
      name?: string; phone?: string; address?: string;
      city?: string; state?: string; pincode?: string;
    };

    const checkout = await buildCheckoutOrderData(userId, source);

    const order = await Order.create({
      user: userId,
      ...(checkout.seller ? { seller: checkout.seller } : {}),
      items: checkout.items,
      totalPrice: checkout.totalPrice,
      status: 'pending',
      paymentMethod: 'razorpay',
      ...(checkout.notes ? { notes: checkout.notes } : {}),
      // ── buyer contact ──
      ...(name    ? { buyerName: name }       : {}),
      ...(phone   ? { buyerPhone: phone }     : {}),
      ...(address ? { buyerAddress: address } : {}),
      ...(city    ? { buyerCity: city }       : {}),
      ...(state   ? { buyerState: state }     : {}),
      ...(pincode ? { buyerPincode: pincode } : {}),
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(checkout.totalPrice * 100),
      currency: 'INR',
      receipt: String(order._id),
      notes: {
        orderId: String(order._id),
        userId,
        source,
      },
    });

    await Order.findByIdAndUpdate(order._id, {
      razorpayOrderId: razorpayOrder.id,
    });

    await clearCheckoutSource(userId, source);

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
