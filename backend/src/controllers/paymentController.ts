import type { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { stripe } from '../utils/stripe.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../types/auth.js';
import type { PopulatedPaymentItem, CheckoutSessionMetadata } from '../types/payment.js';
import { config } from '../config/env.js';

// ─── POST /api/payments/create-checkout-session ───────────────
// Protected. Builds a Stripe session from DB prices — never from client.

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as unknown as AuthRequest;

    // ── 1. Load cart with live DB prices ──────────────────────
    const cart = await Cart.findOne({ user: userId }).populate<{
      items: PopulatedPaymentItem[];
    }>('items.product', 'name price stock');

    if (!cart || cart.items.length === 0) {
      next(new AppError('Your cart is empty.', 400));
      return;
    }

    // ── 2. Stock validation before any money moves ─────────────
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

    // ── 3. Snapshot order items from DB prices (never client) ──
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.product.price, // DB price — immutable snapshot
    }));

    const totalPrice = parseFloat(
      orderItems
        .reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
        .toFixed(2)
    );

    // ── 4. Persist the order BEFORE creating the Stripe session ─
    //    so orderId is available in session metadata
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    // ── 5. Build Stripe line_items from DB prices ──────────────
const lineItems = cart.items.map((item) => ({
  price_data: {
    currency: 'usd',
    product_data: {
      name: item.product.name,
    },
    unit_amount: Math.round(item.product.price * 100),
  },
  quantity: item.quantity,
}));

    // ── 6. Metadata ties the Stripe session back to the DB order ─
    const metadata: Record<string, string> = {
     orderId: String(order._id),
     userId,
    };

    // ── 7. Create Stripe checkout session ─────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Frontend redirects — session_id injected by Stripe automatically
      success_url: `${config.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.clientUrl}/payment/cancel`,
      metadata,
      // Attach metadata to the payment intent too (visible on Stripe dashboard)
      payment_intent_data: { metadata },
    });

    // ── 8. Stamp the order with the Stripe session ID ─────────
    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: session.id,
    });

    // ── 9. Clear cart — order is now the source of truth ──────
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    res.status(201).json({
      success: true,
      sessionUrl: session.url,
      orderId: String(order._id),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/payments/success?session_id=xxx ────────────────
// Protected. Called by the frontend after Stripe redirects back.

export const handlePaymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const sessionId = req.query['session_id'];

    if (!sessionId || typeof sessionId !== 'string') {
      next(new AppError('Missing session_id query parameter.', 400));
      return;
    }

    // ── Verify payment status directly with Stripe ─────────────
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      next(new AppError('Payment not completed. Please try again.', 402));
      return;
    }

    // ── Find the order linked to this session ──────────────────
    const order = await Order.findOne({ stripeSessionId: sessionId }).lean();

    if (!order) {
      next(new AppError('Order not found for this session.', 404));
      return;
    }

    // ── Ownership check — users can only verify their own orders ─
    if (order.user.toString() !== userId) {
      next(new AppError('Not authorised to access this order.', 403));
      return;
    }

    // ── Idempotent update — safe to call multiple times ────────
    if (order.status !== 'paid') {
      await Order.findByIdAndUpdate(order._id, {
        status: 'paid',
        ...(session.payment_intent && {
          stripePaymentIntentId: String(session.payment_intent),
        }),
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

// ─── GET /api/payments/cancel ────────────────────────────────
// Protected. Called by the frontend after user cancels on Stripe.

export const handlePaymentCancel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: false,
      message: 'Payment was cancelled. Your cart has not been charged.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/payments/webhook ───────────────────────────────
// PUBLIC — no JWT. Stripe signature is the authentication mechanism.
// Requires raw Buffer body (express.raw middleware mounted in app.ts).

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      next(new AppError('Missing Stripe signature.', 400));
      return;
    }

    // ── Construct and verify event from raw body ───────────────
    // req.body is a raw Buffer here — do NOT use express.json() for this route
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        config.stripe.webhookSecret
      );
    } catch {
      // Signature mismatch — reject immediately
      next(new AppError('Webhook signature verification failed.', 400));
      return;
    }

    // ── Route event types ──────────────────────────────────────
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Payment must be confirmed — async payment methods may not settle immediately
        if (session.payment_status !== 'paid') break;

        const meta = session.metadata as CheckoutSessionMetadata | null;
        if (!meta?.orderId) break;

        await Order.findByIdAndUpdate(meta.orderId, {
          status: 'paid',
          stripeSessionId: session.id,
          ...(session.payment_intent && {
            stripePaymentIntentId: String(session.payment_intent),
          }),
        });

        console.log(`✅ Order ${meta.orderId} marked as paid via webhook.`);
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        // Handles delayed payment methods (bank transfers, etc.)
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata as CheckoutSessionMetadata | null;
        if (!meta?.orderId) break;

        await Order.findByIdAndUpdate(meta.orderId, {
          status: 'paid',
          ...(session.payment_intent && {
            stripePaymentIntentId: String(session.payment_intent),
          }),
        });

        console.log(`✅ Order ${meta.orderId} paid via async payment.`);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata as CheckoutSessionMetadata | null;
        if (!meta?.orderId) break;

        await Order.findByIdAndUpdate(meta.orderId, { status: 'cancelled' });
        console.warn(`⚠️  Order ${meta.orderId} cancelled — async payment failed.`);
        break;
      }

      default:
        // Unhandled event types are silently acknowledged
        break;
    }

    // Stripe requires a 200 ack — any non-2xx triggers a retry
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};