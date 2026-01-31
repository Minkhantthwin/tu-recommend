import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendCreated } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  return sendCreated(res, result, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 200, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  return sendSuccess(res, tokens, 200, 'Token refreshed successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await authService.changePassword(userId, req.body);
  return sendSuccess(res, null, 200, 'Password changed successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getMe(userId);
  return sendSuccess(res, user);
});

// Admin only: Create a new admin user
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.createAdminUser(email, password);
  return sendCreated(res, result, 'Admin user created successfully');
});
