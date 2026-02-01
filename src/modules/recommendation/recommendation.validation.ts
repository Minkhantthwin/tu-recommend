import { z } from "zod";

export const programComparisonSchema = z.object({
  body: z.object({
    programIds: z
      .array(z.number().int().positive("Program ID must be a positive integer"))
      .min(2, "At least 2 programs are required for comparison")
      .max(5, "Cannot compare more than 5 programs at once"),
  }),
});

export const regionFilterSchema = z.object({
  query: z.object({
    region: z.string().optional(),
    limit: z.coerce.number().int().positive().default(20).optional(),
  }),
});
