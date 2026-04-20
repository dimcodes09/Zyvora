import { Router } from 'express';
import express from 'express';

import { protect } from '../middleware/authMiddleware.js';

import {
  createCheckoutSession,
  handlePaymentSuccess,
  handlePaymentCancel,
  handleWebhook,
} from '../controllers/paymentController.js';

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/razorpayController.js';

const router = Router();

// ─── Stripe: Webhook (PUBLIC) ────────────────────────────────
// Must be raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// ─── Stripe: Protected Routes ────────────────────────────────
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/success', protect, handlePaymentSuccess);
router.get('/cancel', protect, handlePaymentCancel);

// ─── Razorpay: Protected Routes ──────────────────────────────
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;