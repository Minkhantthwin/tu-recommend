import { Request, Response } from "express";
import * as applicationService from "./application.service";
import { sendSuccess, sendCreated } from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

// ==================== User Application Controllers ====================

/**
 * Create a new application
 */
export const createApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await applicationService.createApplication(userId, req.body);
    return sendCreated(res, result, "Application created successfully");
  }
);

/**
 * Get current user's applications
 */
export const getMyApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await applicationService.getUserApplications(userId);
    return sendSuccess(res, result);
  }
);

/**
 * Get application by ID
 */
export const getApplicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.getApplicationById(id, userId);
    return sendSuccess(res, result);
  }
);

/**
 * Update application
 */
export const updateApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.updateApplication(id, userId, req.body);
    return sendSuccess(res, result, 200, "Application updated successfully");
  }
);

/**
 * Upload documents for application
 */
export const uploadDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.uploadDocuments(id, userId, req.body);
    return sendSuccess(res, result, 200, "Documents uploaded successfully");
  }
);

/**
 * Submit application
 */
export const submitApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.submitApplication(id, userId, req.body);
    return sendSuccess(res, result, 200, "Application submitted successfully");
  }
);

/**
 * Withdraw application
 */
export const withdrawApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.withdrawApplication(id, userId);
    return sendSuccess(res, result, 200, "Application withdrawn successfully");
  }
);

/**
 * Delete draft application
 */
export const deleteApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await applicationService.deleteApplication(id, userId);
    return sendSuccess(res, result);
  }
);

// ==================== Admin Application Controllers ====================

/**
 * Get all applications (Admin)
 */
export const getAllApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as any,
      userId: req.query.userId as string,
      programId: req.query.programId ? parseInt(req.query.programId as string) : undefined,
      universityId: req.query.universityId
        ? parseInt(req.query.universityId as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await applicationService.getAllApplications(filters);
    return sendSuccess(res, result);
  }
);

/**
 * Get application by ID (Admin)
 */
export const getApplicationByIdAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await applicationService.getApplicationByIdAdmin(id);
    return sendSuccess(res, result);
  }
);

/**
 * Review application (Admin)
 */
export const reviewApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await applicationService.reviewApplication(id, req.body);
    return sendSuccess(res, result, 200, "Application reviewed successfully");
  }
);

/**
 * Get application statistics (Admin)
 */
export const getApplicationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await applicationService.getApplicationStats();
    return sendSuccess(res, result);
  }
);
