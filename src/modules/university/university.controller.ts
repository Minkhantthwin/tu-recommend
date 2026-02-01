import { Request, Response } from "express";
import * as universityService from "./university.service";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
} from "../../common/utils/api-response";
import { asyncHandler } from "../../common/utils/async-handler";

// ==================== University Controllers ====================

export const getUniversities = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await universityService.getAllUniversities(req.query);
    return sendSuccess(res, result);
  },
);

export const getUniversityById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const university = await universityService.getUniversityById(id);
    return sendSuccess(res, university);
  },
);

export const createUniversity = asyncHandler(
  async (req: Request, res: Response) => {
    const university = await universityService.createUniversity(req.body);
    return sendCreated(res, university, "University created successfully");
  },
);

export const updateUniversity = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const university = await universityService.updateUniversity(id, req.body);
    return sendSuccess(res, university, 204);
  },
);

export const deleteUniversity = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await universityService.deleteUniversity(id);
    return sendNoContent(res);
  },
);

// ==================== Program Controllers ====================

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  const result = await universityService.getAllPrograms(req.query);
  return sendSuccess(res, result);
});

export const getProgramById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const program = await universityService.getProgramById(id);
    return sendSuccess(res, program);
  },
);

export const getProgramsByUniversity = asyncHandler(
  async (req: Request, res: Response) => {
    const universityId = parseInt(req.params.universityId);
    const programs =
      await universityService.getProgramsByUniversity(universityId);
    return sendSuccess(res, programs);
  },
);

export const createProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const program = await universityService.createProgram(req.body);
    return sendCreated(res, program, "Program created successfully");
  },
);

export const updateProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const program = await universityService.updateProgram(id, req.body);
    return sendSuccess(res, program, 204);
  },
);

export const deleteProgram = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await universityService.deleteProgram(id);
    return sendNoContent(res);
  },
);

// ==================== Program Requirement Controllers ====================

export const createProgramRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const requirement = await universityService.createProgramRequirement(
      req.body,
    );
    return sendCreated(
      res,
      requirement,
      "Program requirement created successfully",
    );
  },
);

export const updateProgramRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const requirement = await universityService.updateProgramRequirement(
      id,
      req.body,
    );
    return sendSuccess(res, requirement, 204);
  },
);

export const deleteProgramRequirement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await universityService.deleteProgramRequirement(id);
    return sendNoContent(res);
  },
);
