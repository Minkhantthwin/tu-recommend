import { z } from "zod";

const distinctChoices = <
  T extends {
    firstChoiceId?: number;
    secondChoiceId?: number | null;
    thirdChoiceId?: number | null;
  },
>(
  choices: T,
) => {
  const ids = [
    choices.firstChoiceId,
    choices.secondChoiceId,
    choices.thirdChoiceId,
  ].filter((id): id is number => id != null);
  return new Set(ids).size === ids.length;
};

export const createApplicationSchema = z
  .object({
    firstChoiceId: z
      .number()
      .int()
      .positive("First choice program ID must be a positive integer"),
    secondChoiceId: z
      .number()
      .int()
      .positive("Second choice program ID must be a positive integer")
      .optional(),
    thirdChoiceId: z
      .number()
      .int()
      .positive("Third choice program ID must be a positive integer")
      .optional(),
  })
  .refine(distinctChoices, { message: "Program choices must be unique" });

export const updateApplicationSchema = z
  .object({
    firstChoiceId: z
      .number()
      .int()
      .positive("First choice program ID must be a positive integer")
      .optional(),
    secondChoiceId: z
      .number()
      .int()
      .positive("Second choice program ID must be a positive integer")
      .nullable()
      .optional(),
    thirdChoiceId: z
      .number()
      .int()
      .positive("Third choice program ID must be a positive integer")
      .nullable()
      .optional(),
  })
  .refine(distinctChoices, { message: "Program choices must be unique" });

export const submitApplicationSchema = z.object({
  declarationAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the declaration to submit the application",
    }),
  }),
});

export const uploadDocumentsSchema = z.object({
  photoUrl: z.string().url("Invalid photo URL").optional(),
  nrcFrontUrl: z.string().url("Invalid NRC front URL").optional(),
  nrcBackUrl: z.string().url("Invalid NRC back URL").optional(),
  matricCertificateUrl: z
    .string()
    .url("Invalid matriculation certificate URL")
    .optional(),
  recommendationUrl: z.string().url("Invalid recommendation URL").optional(),
});

export const applicationIdSchema = z.object({
  id: z.string().uuid("Invalid application ID format"),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED"], {
    errorMap: () => ({
      message: "Status must be UNDER_REVIEW, ACCEPTED, or REJECTED",
    }),
  }),
  acceptedProgramId: z
    .number()
    .int()
    .positive("Accepted program ID must be a positive integer")
    .optional(),
  remarks: z
    .string()
    .max(1000, "Remarks must be 1000 characters or less")
    .optional(),
  rejectionReason: z
    .string()
    .max(500, "Rejection reason must be 500 characters or less")
    .optional(),
});

export const applicationFilterSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "SUBMITTED",
      "UNDER_REVIEW",
      "ACCEPTED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
  userId: z.string().uuid().optional(),
  programId: z.coerce.number().int().positive().optional(),
  universityId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});
