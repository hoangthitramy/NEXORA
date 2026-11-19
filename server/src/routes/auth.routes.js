import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/departments', authController.getDepartments);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
