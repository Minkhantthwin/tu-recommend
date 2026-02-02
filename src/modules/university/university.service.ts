import { prisma } from "../../config/database";
import { ApiError } from "../../common/utils/api-error";
import {
  CreateUniversityDto,
  UpdateUniversityDto,
  CreateProgramDto,
  UpdateProgramDto,
  CreateProgramRequirementDto,
  UpdateProgramRequirementDto,
  UniversityQueryDto,
  ProgramQueryDto,
} from "./university.types";

// ==================== University Services ====================

export async function getAllUniversities(query: UniversityQueryDto) {
  const { search, region, page = 1, limit = 10 } = query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameMyanmar: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  if (region) {
    where.region = region;
  }

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        _count: {
          select: { programs: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.university.count({ where }),
  ]);

  return {
    data: universities,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getUniversityById(id: number) {
  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      programs: {
        include: {
          requirements: true,
        },
      },
    },
  });

  if (!university) {
    throw ApiError.notFound("University not found");
  }

  return university;
}

export async function createUniversity(data: CreateUniversityDto) {
  return prisma.university.create({
    data,
  });
}

export async function updateUniversity(id: number, data: UpdateUniversityDto) {
  const university = await prisma.university.findUnique({ where: { id } });

  if (!university) {
    throw ApiError.notFound("University not found");
  }

  return prisma.university.update({
    where: { id },
    data,
  });
}

export async function deleteUniversity(id: number) {
  const university = await prisma.university.findUnique({
    where: { id },
    include: { programs: true },
  });

  if (!university) {
    throw ApiError.notFound("University not found");
  }

  if (university.programs.length > 0) {
    throw ApiError.badRequest(
      "Cannot delete university with existing programs. Delete programs first.",
    );
  }

  return prisma.university.delete({ where: { id } });
}

// ==================== Program Services ====================

export async function getAllPrograms(query: ProgramQueryDto) {
  const {
    search,
    universityId,
    minScore,
    maxScore,
    region,
    page = 1,
    limit = 10,
  } = query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameMyanmar: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  if (universityId) {
    where.universityId = universityId;
  }

  if (region) {
    where.university = { region };
  }

  if (minScore !== undefined) {
    where.minScore = { ...where.minScore, gte: minScore };
  }

  if (maxScore !== undefined) {
    where.minScore = { ...where.minScore, lte: maxScore };
  }

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        university: {
          select: {
            id: true,
            name: true,
            nameMyanmar: true,
            code: true,
            location: true,
          },
        },
        requirements: true,
      },
      orderBy: [{ university: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.program.count({ where }),
  ]);

  return {
    data: programs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getProgramById(id: number) {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      university: true,
      requirements: true,
    },
  });

  if (!program) {
    throw ApiError.notFound("Program not found");
  }

  return program;
}

export async function getProgramsByUniversity(universityId: number) {
  const university = await prisma.university.findUnique({
    where: { id: universityId },
  });

  if (!university) {
    throw ApiError.notFound("University not found");
  }

  return prisma.program.findMany({
    where: { universityId },
    include: {
      requirements: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function createProgram(data: CreateProgramDto) {
  const { requirements, ...programData } = data;
  return prisma.program.create({
    data: {
      ...programData,
      requirements: requirements
        ? {
            create: requirements,
          }
        : undefined,
    },
    include: {
      requirements: true,
    },
  });
}

export async function updateProgram(id: number, data: UpdateProgramDto) {
  const program = await prisma.program.findUnique({ where: { id } });

  if (!program) {
    throw ApiError.notFound("Program not found");
  }

  const { requirements, ...programData } = data;

  // Update program basic info
  await prisma.program.update({
    where: { id },
    data: programData,
  });

  // Handle requirements if provided
  if (requirements) {
    const existingReq = await prisma.programRequirement.findFirst({
      where: { programId: id },
    });

    if (existingReq) {
      await prisma.programRequirement.update({
        where: { id: existingReq.id },
        data: requirements,
      });
    } else {
      await prisma.programRequirement.create({
        data: {
          ...requirements,
          programId: id,
        },
      });
    }
  }

  return prisma.program.findUnique({
    where: { id },
    include: { requirements: true },
  });
}

export async function deleteProgram(id: number) {
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      firstChoices: true,
      secondChoices: true,
      thirdChoices: true,
    },
  });

  if (!program) {
    throw ApiError.notFound("Program not found");
  }

  const hasApplications =
    program.firstChoices.length > 0 ||
    program.secondChoices.length > 0 ||
    program.thirdChoices.length > 0;

  if (hasApplications) {
    throw ApiError.badRequest(
      "Cannot delete program with existing applications",
    );
  }

  // Delete requirements first
  await prisma.programRequirement.deleteMany({
    where: { programId: id },
  });

  return prisma.program.delete({ where: { id } });
}

// ==================== Program Requirement Services ====================

export async function createProgramRequirement(
  data: CreateProgramRequirementDto,
) {
  const program = await prisma.program.findUnique({
    where: { id: data.programId },
  });

  if (!program) {
    throw ApiError.notFound("Program not found");
  }

  return prisma.programRequirement.create({
    data,
    include: {
      program: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateProgramRequirement(
  id: number,
  data: UpdateProgramRequirementDto,
) {
  const requirement = await prisma.programRequirement.findUnique({
    where: { id },
  });

  if (!requirement) {
    throw ApiError.notFound("Program requirement not found");
  }

  return prisma.programRequirement.update({
    where: { id },
    data,
    include: {
      program: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function deleteProgramRequirement(id: number) {
  const requirement = await prisma.programRequirement.findUnique({
    where: { id },
  });

  if (!requirement) {
    throw ApiError.notFound("Program requirement not found");
  }

  return prisma.programRequirement.delete({ where: { id } });
}
