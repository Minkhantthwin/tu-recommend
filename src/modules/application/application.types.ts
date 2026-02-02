import { ApplicationStatus } from "@prisma/client";

// Application DTOs

export interface CreateApplicationDTO {
  firstChoiceId: number;
  secondChoiceId?: number;
  thirdChoiceId?: number;
}

export interface UpdateApplicationDTO {
  firstChoiceId?: number;
  secondChoiceId?: number | null;
  thirdChoiceId?: number | null;
}

export interface SubmitApplicationDTO {
  declarationAccepted: boolean;
}

export interface UploadDocumentsDTO {
  photoUrl?: string;
  nrcFrontUrl?: string;
  nrcBackUrl?: string;
  matricCertificateUrl?: string;
  recommendationUrl?: string;
}

export interface ApplicationResponse {
  id: string;
  userId: string;
  applicationNumber: string | null;
  status: ApplicationStatus;
  firstChoiceId: number;
  secondChoiceId: number | null;
  thirdChoiceId: number | null;
  acceptedProgramId: number | null;
  declarationAccepted: boolean;
  declarationDate: Date | null;
  photoUrl: string | null;
  nrcFrontUrl: string | null;
  nrcBackUrl: string | null;
  matricCertificateUrl: string | null;
  recommendationUrl: string | null;
  remarks: string | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  firstChoice: ProgramWithUniversity;
  secondChoice?: ProgramWithUniversity | null;
  thirdChoice?: ProgramWithUniversity | null;
  acceptedProgram?: ProgramWithUniversity | null;
}

export interface ProgramWithUniversity {
  id: number;
  name: string;
  nameMyanmar: string | null;
  code: string | null;
  description: string | null;
  minScore: number;
  quota: number | null;
  university: {
    id: number;
    name: string;
    nameMyanmar: string | null;
    code: string | null;
    location: string;
    region: string | null;
  };
}

export interface ApplicationListResponse {
  applications: ApplicationResponse[];
  total: number;
}

// Admin DTOs
export interface ReviewApplicationDTO {
  status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  acceptedProgramId?: number;
  remarks?: string;
  rejectionReason?: string;
}

export interface ApplicationFilterDTO {
  status?: ApplicationStatus;
  userId?: string;
  programId?: number;
  universityId?: number;
  page?: number;
  limit?: number;
}
