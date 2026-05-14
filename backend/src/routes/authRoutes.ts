import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { googleAuth } from '../controllers/googleAuthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// ✅ Google OAuth — minimal drop-in, no passport
router.post('/google', googleAuth);

// ✅ FIXED (add slash + remove "auth")
router.get('/me', protect, getMe);

export default router;