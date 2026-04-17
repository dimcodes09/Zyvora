import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

// Apply auth middleware
router.use(protect);

// Routes
router.route('/')
  .get(getUserOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById);

// Admin-only
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;