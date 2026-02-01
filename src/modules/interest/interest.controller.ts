import { Request, Response } from "express";
import * as interestService from "./interest.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

// ==================== Interest Controllers ====================

export const getAllInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const interests = await interestService.getAllInterests();
    return sendSuccess(res, interests);
  },
);

export const getInterestById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const interest = await interestService.getInterestById(id);
    return sendSuccess(res, interest);
  },
);

export const createInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const interest = await interestService.createInterest(req.body);
    return sendCreated(res, interest, "Interest created successfully");
  },
);

export const updateInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const interest = await interestService.updateInterest(id, req.body);
    return sendSuccess(res, interest, 204);
  },
);

export const deleteInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await interestService.deleteInterest(id);
    return sendNoContent(res);
  },
);

// ==================== User Interest Controllers ====================

export const getMyInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const interests = await interestService.getUserInterests(userId);
    return sendSuccess(res, interests);
  },
);

export const addMyInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const interest = await interestService.addUserInterest(userId, req.body);
    return sendCreated(res, interest, "Interest added successfully");
  },
);

export const addMyInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const interests = await interestService.addMultipleUserInterests(
      userId,
      req.body,
    );
    return sendSuccess(res, interests, 204);
  },
);

export const removeMyInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const interestId = parseInt(req.params.interestId);
    await interestService.removeUserInterest(userId, interestId);
    return sendNoContent(res);
  },
);

export const replaceMyInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const interests = await interestService.replaceUserInterests(
      userId,
      req.body.interestIds,
    );
    return sendSuccess(res, interests, 204);
  },
);
