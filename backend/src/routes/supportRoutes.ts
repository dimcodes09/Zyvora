import { Router } from 'express';
import { handleSupportRequest } from '../controllers/supportController.js';

const router = Router();

router.post('/', handleSupportRequest);

export default router;
