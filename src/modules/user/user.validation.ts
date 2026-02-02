import { z } from "zod";

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

// User Profile validation schemas
export const createUserProfileSchema = z.object({
  // Personal Information
  nameMyanmar: z.string().min(1, "Myanmar name is required"),
  nameEnglish: z.string().min(1, "English name is required"),
  nrc: z.string().min(1, "NRC is required"),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(["MALE", "FEMALE"]),
  religion: z.enum(["BUDDHIST", "CHRISTIAN", "HINDU", "ISLAM", "OTHER"]),
  ethnicity: z.string().min(1, "Ethnicity is required"),
  nationality: z.string().optional().default("Myanmar"),
  maritalStatus: z.enum(["SINGLE", "MARRIED"]).optional().default("SINGLE"),

  // Contact Information
  phone: z.string().min(1, "Phone number is required"),
  alternatePhone: z.string().optional(),

  // Permanent Address
  permanentAddress: z.string().min(1, "Permanent address is required"),
  permanentTownship: z.string().min(1, "Permanent township is required"),
  permanentRegion: z.string().min(1, "Permanent region is required"),

  // Current Address
  currentAddress: z.string().optional(),
  currentTownship: z.string().optional(),
  currentRegion: z.string().optional(),

  // Parent Information
  fatherName: z.string().min(1, "Father name is required"),
  fatherNrc: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().optional(),

  motherName: z.string().min(1, "Mother name is required"),
  motherNrc: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),

  // Guardian Information
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianAddress: z.string().optional(),

  // Photo
  photoUrl: z.string().url().optional(),
});

export const updateUserProfileSchema = createUserProfileSchema.partial();
