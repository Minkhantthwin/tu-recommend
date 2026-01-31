import { Request, Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/utils/api-response';
import { asyncHandler } from '../../common/utils/async-handler';

// User Controllers
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  return sendSuccess(res, users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  return sendSuccess(res, user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  return sendCreated(res, user, 'User created successfully');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.updateUser(id, req.body);
  return sendSuccess(res, user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  return sendNoContent(res);
});

// User Profile Controllers
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await userService.getUserProfile(id);
  return sendSuccess(res, profile);
});

export const createUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await userService.createUserProfile(id, req.body);
  return sendCreated(res, profile, 'User profile created successfully');
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = await userService.updateUserProfile(id, req.body);
  return sendSuccess(res, profile);
});

export const deleteUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUserProfile(id);
  return sendNoContent(res);
});