import { Request, Response } from "express";
import * as adminService from "./admin.service";
import { sendSuccess } from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats);
  },
);
