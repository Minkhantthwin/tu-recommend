import { Request, Response } from "express";
import * as matriculationService from "./matriculation.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

// ==================== User Matriculation Controllers ====================

export const getMyMatriculation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const matriculation =
      await matriculationService.getMatriculationByUserId(userId);

    if (!matriculation) {
      return sendSuccess(res, null, 200);
    }

    return sendSuccess(res, matriculation);
  },
);

export const createMyMatriculation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const matriculation = await matriculationService.createMatriculation(
      userId,
      req.body,
    );
    return sendCreated(
      res,
      matriculation,
      "Matriculation result created successfully",
    );
  },
);

export const updateMyMatriculation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const matriculation = await matriculationService.updateMatriculation(
      userId,
      req.body,
    );
    return sendSuccess(res, matriculation, 200);
  },
);

export const deleteMyMatriculation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await matriculationService.deleteMatriculation(userId);
    return sendNoContent(res);
  },
);

// ==================== Admin Controllers ====================

export const getAllMatriculations = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await matriculationService.getAllMatriculations(req.query);
    return sendSuccess(res, result);
  },
);

export const getMatriculationById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const matriculation = await matriculationService.getMatriculationById(id);
    return sendSuccess(res, matriculation);
  },
);

export const getMatriculationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const examYear = req.query.examYear
      ? parseInt(req.query.examYear as string)
      : undefined;
    const stats = await matriculationService.getMatriculationStats(examYear);
    return sendSuccess(res, stats);
  },
);
