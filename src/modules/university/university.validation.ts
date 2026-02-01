import { z } from "zod";

// University validation schemas
export const createUniversitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  nameMyanmar: z.string().optional(),
  code: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  region: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().url("Invalid photo URL").optional(),
  logoUrl: z.string().url("Invalid logo URL").optional(),
});

export const updateUniversitySchema = createUniversitySchema.partial();

// Program validation schemas
export const createProgramSchema = z.object({
  universityId: z.number().int().positive("University ID is required"),
  name: z.string().min(1, "Program name is required"),
  nameMyanmar: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  minScore: z
    .number()
    .int()
    .min(0, "Minimum score cannot be negative")
    .max(600, "Minimum score cannot exceed 600"),
  quota: z.number().int().positive("Quota must be positive").optional(),
});

export const updateProgramSchema = z.object({
  name: z.string().min(1, "Program name is required").optional(),
  nameMyanmar: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  minScore: z
    .number()
    .int()
    .min(0, "Minimum score cannot be negative")
    .max(600, "Minimum score cannot exceed 600")
    .optional(),
  quota: z.number().int().positive("Quota must be positive").optional(),
});

// Program Requirement validation schemas
export const createProgramRequirementSchema = z.object({
  programId: z.number().int().positive("Program ID is required"),
  myanmar: z.number().int().min(0).max(100).optional(),
  english: z.number().int().min(0).max(100).optional(),
  mathematics: z.number().int().min(0).max(100).optional(),
  physics: z.number().int().min(0).max(100).optional(),
  chemistry: z.number().int().min(0).max(100).optional(),
  biology: z.number().int().min(0).max(100).optional(),
  minTotalScore: z.number().int().min(0).max(600).optional(),
});

export const updateProgramRequirementSchema =
  createProgramRequirementSchema.partial();

// Query validation schemas
export const universityQuerySchema = z.object({
  search: z.string().optional(),
  region: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const programQuerySchema = z.object({
  search: z.string().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  minScore: z.coerce.number().int().min(0).optional(),
  maxScore: z.coerce.number().int().max(600).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});
