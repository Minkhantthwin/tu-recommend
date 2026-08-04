import { prisma } from "../../config/database";
import { ApiError } from "../../common/utils/api-error";
import { isProgramEligible } from "../recommendation/recommendation.service";
import {
  CreateApplicationDTO,
  UpdateApplicationDTO,
  SubmitApplicationDTO,
  UploadDocumentsDTO,
  ReviewApplicationDTO,
  ApplicationFilterDTO,
} from "./application.types";

// Program include for queries
const programInclude = {
  university: {
    select: {
      id: true,
      name: true,
      nameMyanmar: true,
      code: true,
      location: true,
      region: true,
    },
  },
};

const applicationInclude = {
  firstChoice: { include: programInclude },
  secondChoice: { include: programInclude },
  thirdChoice: { include: programInclude },
  acceptedProgram: { include: programInclude },
};

async function validateProgramChoices(
  matriculation: NonNullable<
    Awaited<ReturnType<typeof prisma.matriculationResult.findUnique>>
  >,
  programIds: number[],
) {
  if (new Set(programIds).size !== programIds.length) {
    throw ApiError.badRequest("Program choices must be unique");
  }

  const programs = await prisma.program.findMany({
    where: { id: { in: programIds } },
    include: { requirements: true },
  });

  if (programs.length !== programIds.length) {
    throw ApiError.badRequest("One or more selected programs do not exist");
  }

  const ineligible = programs.find(
    (program) => !isProgramEligible(matriculation, program),
  );
  if (ineligible) {
    throw ApiError.badRequest(
      `${ineligible.name} is inactive or does not match your matriculation results`,
    );
  }
}

// ==================== Application Services ====================

/**
 * Create a new application (draft)
 */
export async function createApplication(
  userId: string,
  data: CreateApplicationDTO,
) {
  // Check if user has profile and matriculation
  const [profile, matriculation] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.matriculationResult.findUnique({ where: { userId } }),
  ]);

  if (!profile) {
    throw ApiError.badRequest(
      "Please complete your profile before creating an application",
    );
  }

  if (!matriculation) {
    throw ApiError.badRequest(
      "Please add your matriculation results before creating an application",
    );
  }

  // Check for existing draft application
  const existingDraft = await prisma.application.findFirst({
    where: {
      userId,
      status: "DRAFT",
    },
  });

  if (existingDraft) {
    throw ApiError.badRequest(
      "You already have a draft application. Please update or submit it.",
    );
  }

  // Verify all program choices exist and user is eligible
  const programIds = [
    data.firstChoiceId,
    data.secondChoiceId,
    data.thirdChoiceId,
  ].filter(Boolean) as number[];

  await validateProgramChoices(matriculation, programIds);

  // Create the application
  const application = await prisma.application.create({
    data: {
      userId,
      firstChoiceId: data.firstChoiceId,
      secondChoiceId: data.secondChoiceId,
      thirdChoiceId: data.thirdChoiceId,
      status: "DRAFT",
    },
    include: applicationInclude,
  });

  return application;
}

/**
 * Get user's applications
 */
export async function getUserApplications(userId: string) {
  const applications = await prisma.application.findMany({
    where: { userId },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });

  return {
    applications,
    total: applications.length,
  };
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  applicationId: string,
  userId: string,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      ...applicationInclude,
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  // Users can only view their own applications (unless admin - handled in controller)
  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to view this application",
    );
  }

  return application;
}

/**
 * Update application (only DRAFT status)
 */
export async function updateApplication(
  applicationId: string,
  userId: string,
  data: UpdateApplicationDTO,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to update this application",
    );
  }

  if (application.status !== "DRAFT") {
    throw ApiError.badRequest(
      "Only draft applications can be updated. Please withdraw and create a new application.",
    );
  }

  const matriculation = await prisma.matriculationResult.findUnique({
    where: { userId },
  });
  if (!matriculation) {
    throw ApiError.badRequest("Matriculation results not found");
  }

  const programIds = [
    data.firstChoiceId ?? application.firstChoiceId,
    data.secondChoiceId === undefined
      ? application.secondChoiceId
      : data.secondChoiceId,
    data.thirdChoiceId === undefined
      ? application.thirdChoiceId
      : data.thirdChoiceId,
  ].filter((id): id is number => id !== null);
  await validateProgramChoices(matriculation, programIds);

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...(data.firstChoiceId && { firstChoiceId: data.firstChoiceId }),
      ...(data.secondChoiceId !== undefined && {
        secondChoiceId: data.secondChoiceId,
      }),
      ...(data.thirdChoiceId !== undefined && {
        thirdChoiceId: data.thirdChoiceId,
      }),
    },
    include: applicationInclude,
  });

  return updatedApplication;
}

/**
 * Upload documents for application
 */
export async function uploadDocuments(
  applicationId: string,
  userId: string,
  data: UploadDocumentsDTO,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to upload documents for this application",
    );
  }

  if (application.status !== "DRAFT") {
    throw ApiError.badRequest(
      "Documents can only be uploaded for draft applications",
    );
  }

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...(data.photoUrl && { photoUrl: data.photoUrl }),
      ...(data.nrcFrontUrl && { nrcFrontUrl: data.nrcFrontUrl }),
      ...(data.nrcBackUrl && { nrcBackUrl: data.nrcBackUrl }),
      ...(data.matricCertificateUrl && {
        matricCertificateUrl: data.matricCertificateUrl,
      }),
      ...(data.recommendationUrl && {
        recommendationUrl: data.recommendationUrl,
      }),
    },
    include: applicationInclude,
  });

  return updatedApplication;
}

/**
 * Submit application
 */
export async function submitApplication(
  applicationId: string,
  userId: string,
  data: SubmitApplicationDTO,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: applicationInclude,
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to submit this application",
    );
  }

  if (application.status !== "DRAFT") {
    throw ApiError.badRequest("This application has already been submitted");
  }

  // Validate required documents
  if (!application.photoUrl) {
    throw ApiError.badRequest("Photo is required before submission");
  }

  if (!application.nrcFrontUrl || !application.nrcBackUrl) {
    throw ApiError.badRequest(
      "NRC front and back photos are required before submission",
    );
  }

  if (!application.matricCertificateUrl) {
    throw ApiError.badRequest(
      "Matriculation certificate is required before submission",
    );
  }

  if (!data.declarationAccepted) {
    throw ApiError.badRequest(
      "You must accept the declaration to submit the application",
    );
  }

  const [profile, matriculation] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.matriculationResult.findUnique({ where: { userId } }),
  ]);
  if (!profile || !matriculation) {
    throw ApiError.badRequest(
      "A complete profile and matriculation result are required before submission",
    );
  }
  await validateProgramChoices(
    matriculation,
    [
      application.firstChoiceId,
      application.secondChoiceId,
      application.thirdChoiceId,
    ].filter((id): id is number => id !== null),
  );

  // Generate application number
  const year = new Date().getFullYear();
  const applicationNumber = `TU-${year}-${application.id}`;

  const submittedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "SUBMITTED",
      applicationNumber,
      declarationAccepted: true,
      declarationDate: new Date(),
      submittedAt: new Date(),
    },
    include: applicationInclude,
  });

  return submittedApplication;
}

/**
 * Withdraw application
 */
export async function withdrawApplication(
  applicationId: string,
  userId: string,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to withdraw this application",
    );
  }

  if (
    application.status === "ACCEPTED" ||
    application.status === "REJECTED" ||
    application.status === "WITHDRAWN"
  ) {
    throw ApiError.badRequest(
      `Cannot withdraw an application with status: ${application.status}`,
    );
  }

  const withdrawnApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
    },
    include: applicationInclude,
  });

  return withdrawnApplication;
}

/**
 * Delete draft application
 */
export async function deleteApplication(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (application.userId !== userId) {
    throw ApiError.forbidden(
      "You do not have permission to delete this application",
    );
  }

  if (application.status !== "DRAFT") {
    throw ApiError.badRequest("Only draft applications can be deleted");
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  return { message: "Application deleted successfully" };
}

// ==================== Admin Services ====================

/**
 * Get all applications (Admin)
 */
export async function getAllApplications(filters: ApplicationFilterDTO) {
  const {
    status,
    userId,
    programId,
    universityId,
    page = 1,
    limit = 20,
  } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (userId) {
    where.userId = userId;
  }

  if (programId) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { firstChoiceId: programId },
          { secondChoiceId: programId },
          { thirdChoiceId: programId },
        ],
      },
    ];
  }

  if (universityId) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { firstChoice: { universityId } },
          { secondChoice: { universityId } },
          { thirdChoice: { universityId } },
        ],
      },
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        ...applicationInclude,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nameEnglish: true,
                nameMyanmar: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get application by ID (Admin - can view any application)
 */
export async function getApplicationByIdAdmin(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      ...applicationInclude,
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
          matriculation: true,
        },
      },
    },
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  return application;
}

/**
 * Review application (Admin)
 */
export async function reviewApplication(
  applicationId: string,
  data: ReviewApplicationDTO,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: applicationInclude,
  });

  if (!application) {
    throw ApiError.notFound("Application not found");
  }

  if (
    application.status !== "SUBMITTED" &&
    application.status !== "UNDER_REVIEW"
  ) {
    throw ApiError.badRequest(
      `Cannot review an application with status: ${application.status}`,
    );
  }

  // Validate accepted program if status is ACCEPTED
  if (data.status === "ACCEPTED") {
    if (!data.acceptedProgramId) {
      throw ApiError.badRequest(
        "Accepted program ID is required when accepting an application",
      );
    }

    // Verify the accepted program is one of the choices
    const validProgramIds = [
      application.firstChoiceId,
      application.secondChoiceId,
      application.thirdChoiceId,
    ].filter(Boolean);

    if (!validProgramIds.includes(data.acceptedProgramId)) {
      throw ApiError.badRequest(
        "Accepted program must be one of the applicant's choices",
      );
    }

    // ponytail: this check is not race-proof; use a DB-backed seat reservation if concurrent reviews become common.
    const program = await prisma.program.findUnique({
      where: { id: data.acceptedProgramId },
      select: {
        status: true,
        quota: true,
        _count: { select: { acceptedPrograms: true } },
      },
    });
    if (program?.status !== "ACTIVE") {
      throw ApiError.badRequest("The accepted program is not active");
    }
    if (
      program?.quota != null &&
      program._count.acceptedPrograms >= program.quota
    ) {
      throw ApiError.badRequest("The accepted program has reached its quota");
    }
  }

  // Validate rejection reason if status is REJECTED
  if (data.status === "REJECTED" && !data.rejectionReason) {
    throw ApiError.badRequest(
      "Rejection reason is required when rejecting an application",
    );
  }

  const reviewedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: data.status,
      acceptedProgramId:
        data.status === "ACCEPTED" ? data.acceptedProgramId : null,
      ...(data.remarks && { remarks: data.remarks }),
      rejectionReason: data.status === "REJECTED" ? data.rejectionReason : null,
      reviewedAt: new Date(),
    },
    include: applicationInclude,
  });

  return reviewedApplication;
}

/**
 * Get application statistics (Admin)
 */
export async function getApplicationStats() {
  const [statusCounts, recentApplications, programStats] = await Promise.all([
    prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.application.findMany({
      where: { status: "SUBMITTED" },
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: { nameEnglish: true },
            },
          },
        },
        firstChoice: {
          include: {
            university: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.program.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        quota: true,
        university: {
          select: { name: true },
        },
        _count: {
          select: {
            firstChoices: { where: { status: { not: "DRAFT" } } },
            secondChoices: { where: { status: { not: "DRAFT" } } },
            thirdChoices: { where: { status: { not: "DRAFT" } } },
          },
        },
      },
    }),
  ]);

  // Transform status counts
  const stats: Record<string, number> = {
    DRAFT: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  for (const item of statusCounts) {
    stats[item.status] = item._count.status;
  }

  // Calculate total applications per program
  const programApplications = programStats.map((program) => ({
    id: program.id,
    name: program.name,
    code: program.code,
    university: program.university.name,
    quota: program.quota,
    totalApplications:
      program._count.firstChoices +
      program._count.secondChoices +
      program._count.thirdChoices,
    firstChoiceCount: program._count.firstChoices,
  }));

  return {
    statusCounts: stats,
    totalApplications: Object.values(stats).reduce((a, b) => a + b, 0),
    recentApplications,
    programApplications: programApplications.sort(
      (a, b) => b.totalApplications - a.totalApplications,
    ),
  };
}
