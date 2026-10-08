import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authController.logout);

export default router;
