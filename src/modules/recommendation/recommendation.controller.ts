import { Request, Response } from "express";
import * as recommendationService from "./recommendation.service";
import { sendSuccess } from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

// ==================== Recommendation Controllers ====================

export const getEligiblePrograms = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const region = req.query.region as string | undefined;
    const result = await recommendationService.getEligiblePrograms(
      userId,
      region,
    );
    return sendSuccess(res, result);
  },
);

export const getRecommendedPrograms = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await recommendationService.getRecommendedPrograms(
      userId,
      limit,
    );
    return sendSuccess(res, result);
  },
);

export const comparePrograms = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { programIds } = req.body;
    const result = await recommendationService.comparePrograms(
      userId,
      programIds,
    );
    return sendSuccess(res, result);
  },
);

export const getTopPrograms = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const result = await recommendationService.getTopPrograms(userId, limit);
    return sendSuccess(res, result);
  },
);
