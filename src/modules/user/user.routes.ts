import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../common/middleware';
import { 
  createUserSchema, 
  updateUserSchema,
  createUserProfileSchema,
  updateUserProfileSchema 
} from './user.validation';

const router = Router();

// ==================== User Routes ====================
// GET /api/users - Get all users
router.get('/', userController.getUsers);

// GET /api/users/:id - Get user by ID (includes profile and matriculation)
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', validate(createUserSchema), userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', validate(updateUserSchema), userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

// ==================== User Profile Routes ====================
// GET /api/users/:id/profile - Get user profile
router.get('/:id/profile', userController.getUserProfile);

// POST /api/users/:id/profile - Create user profile
router.post('/:id/profile', validate(createUserProfileSchema), userController.createUserProfile);

// PUT /api/users/:id/profile - Update user profile
router.put('/:id/profile', validate(updateUserProfileSchema), userController.updateUserProfile);

// DELETE /api/users/:id/profile - Delete user profile
router.delete('/:id/profile', userController.deleteUserProfile);

export default router;
