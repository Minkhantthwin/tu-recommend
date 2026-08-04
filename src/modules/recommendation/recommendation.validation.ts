import { z } from "zod";

export const programComparisonSchema = z.object({
  programIds: z
    .array(z.number().int().positive("Program ID must be a positive integer"))
    .min(2, "At least 2 programs are required for comparison")
    .max(5, "Cannot compare more than 5 programs at once")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Program IDs must be unique",
    }),
});

export const eligibleProgramsQuerySchema = z.object({
  region: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  universityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const recommendationLimitSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});
