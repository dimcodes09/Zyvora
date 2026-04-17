import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';

const router = Router();

// Apply auth middleware
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .patch(updateQuantity)
  .delete(removeFromCart);

export default router;