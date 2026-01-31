import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../common/middleware';
import { authenticate, adminOnly } from './auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();

// ==================== Public Routes ====================
// POST /api/auth/register - Register new user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Login user
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

// ==================== Protected Routes ====================
// GET /api/auth/me - Get current user info
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/change-password - Change password
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

// ==================== Admin Routes ====================
// POST /api/auth/admin/create - Create admin user (admin only)
router.post(
  '/admin/create',
  authenticate,
  adminOnly,
  validate(registerSchema),
  authController.createAdmin
);

export default router;
