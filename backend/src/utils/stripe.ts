import Stripe from 'stripe';
import { config } from '../config/env.js';

// Single shared Stripe instance — initialised once at startup
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});