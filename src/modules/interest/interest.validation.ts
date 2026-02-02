import { z } from "zod";

// Interest Schemas
export const createInterestSchema = z.object({
  name: z
    .string()
    .min(1, "Interest name is required")
    .max(100, "Interest name must be less than 100 characters"),
});

export const updateInterestSchema = z.object({
  name: z
    .string()
    .min(1, "Interest name is required")
    .max(100, "Interest name must be less than 100 characters")
    .optional(),
});

// User Interest Schemas
export const addUserInterestSchema = z.object({
  interestId: z
    .number()
    .int()
    .positive("Interest ID must be a positive integer"),
});

export const addMultipleUserInterestsSchema = z.object({
  interestIds: z
    .array(z.number().int().positive("Interest ID must be a positive integer"))
    .min(1, "At least one interest must be provided")
    .max(20, "Cannot add more than 20 interests at once"),
});

export const removeUserInterestSchema = z.object({
  interestId: z
    .number()
    .int()
    .positive("Interest ID must be a positive integer"),
});
