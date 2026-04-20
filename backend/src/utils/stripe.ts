import Stripe from 'stripe';
import { config } from '../config/env.js';

// Single shared Stripe instance — initialised once at startup
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
});