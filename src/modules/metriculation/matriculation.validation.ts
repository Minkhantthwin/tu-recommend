import { z } from "zod";

const scoreValidation = z
  .number()
  .int("Score must be an integer")
  .min(0, "Score cannot be negative")
  .max(100, "Score cannot exceed 100");

export const createMatriculationSchema = z.object({
  body: z.object({
    examYear: z
      .number()
      .int("Exam year must be an integer")
      .min(2000, "Exam year must be 2000 or later")
      .max(new Date().getFullYear(), "Exam year cannot be in the future"),
    rollNumber: z
      .string()
      .min(1, "Roll number is required")
      .max(50, "Roll number must be less than 50 characters"),
    schoolName: z
      .string()
      .min(1, "School name is required")
      .max(200, "School name must be less than 200 characters"),
    schoolTownship: z
      .string()
      .min(1, "School township is required")
      .max(100, "School township must be less than 100 characters"),
    schoolRegion: z
      .string()
      .min(1, "School region is required")
      .max(100, "School region must be less than 100 characters"),
    myanmar: scoreValidation,
    english: scoreValidation,
    mathematics: scoreValidation,
    physics: scoreValidation,
    chemistry: scoreValidation,
    biology: scoreValidation.optional(),
  }),
});

export const updateMatriculationSchema = z.object({
  body: z.object({
    examYear: z
      .number()
      .int("Exam year must be an integer")
      .min(2000, "Exam year must be 2000 or later")
      .max(new Date().getFullYear(), "Exam year cannot be in the future")
      .optional(),
    rollNumber: z
      .string()
      .min(1, "Roll number is required")
      .max(50, "Roll number must be less than 50 characters")
      .optional(),
    schoolName: z
      .string()
      .min(1, "School name is required")
      .max(200, "School name must be less than 200 characters")
      .optional(),
    schoolTownship: z
      .string()
      .min(1, "School township is required")
      .max(100, "School township must be less than 100 characters")
      .optional(),
    schoolRegion: z
      .string()
      .min(1, "School region is required")
      .max(100, "School region must be less than 100 characters")
      .optional(),
    myanmar: scoreValidation.optional(),
    english: scoreValidation.optional(),
    mathematics: scoreValidation.optional(),
    physics: scoreValidation.optional(),
    chemistry: scoreValidation.optional(),
    biology: scoreValidation.optional().nullable(),
  }),
});
