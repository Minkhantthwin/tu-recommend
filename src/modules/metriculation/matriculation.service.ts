import { prisma } from "../../config/database";
import { ApiError } from "../../common/utils/api-error";
import {
  CreateMatriculationDto,
  UpdateMatriculationDto,
} from "./matriculation.types";

// ==================== Matriculation Services ====================

export async function getMatriculationByUserId(userId: string) {
  const matriculation = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  return matriculation;
}

export async function createMatriculation(
  userId: string,
  data: CreateMatriculationDto,
) {
  // Check if user already has matriculation result
  const existing = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  if (existing) {
    throw ApiError.badRequest(
      "Matriculation result already exists. Use update instead.",
    );
  }

  // Calculate total score
  const totalScore =
    data.myanmar +
    data.english +
    data.mathematics +
    data.physics +
    data.chemistry +
    (data.biology || 0);

  // Determine total marks based on whether biology is provided
  const totalMarks = data.biology !== undefined ? 600 : 500;

  const matriculation = await prisma.matriculationResult.create({
    data: {
      userId,
      examYear: data.examYear,
      rollNumber: data.rollNumber,
      schoolName: data.schoolName,
      schoolTownship: data.schoolTownship,
      schoolRegion: data.schoolRegion,
      myanmar: data.myanmar,
      english: data.english,
      mathematics: data.mathematics,
      physics: data.physics,
      chemistry: data.chemistry,
      biology: data.biology,
      totalScore,
      totalMarks,
    },
  });

  return matriculation;
}

export async function updateMatriculation(
  userId: string,
  data: UpdateMatriculationDto,
) {
  // Check if matriculation exists
  const existing = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw ApiError.notFound("Matriculation result not found");
  }

  // Calculate new scores
  const myanmar = data.myanmar ?? existing.myanmar;
  const english = data.english ?? existing.english;
  const mathematics = data.mathematics ?? existing.mathematics;
  const physics = data.physics ?? existing.physics;
  const chemistry = data.chemistry ?? existing.chemistry;
  const biology = data.biology !== undefined ? data.biology : existing.biology;

  // Recalculate total score
  const totalScore =
    myanmar + english + mathematics + physics + chemistry + (biology || 0);

  // Determine total marks
  const totalMarks = biology !== null ? 600 : 500;

  const matriculation = await prisma.matriculationResult.update({
    where: { userId },
    data: {
      ...data,
      totalScore,
      totalMarks,
    },
  });

  return matriculation;
}

export async function deleteMatriculation(userId: string) {
  // Check if matriculation exists
  const existing = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw ApiError.notFound("Matriculation result not found");
  }

  await prisma.matriculationResult.delete({
    where: { userId },
  });
}

// ==================== Admin Services ====================

export async function getAllMatriculations(query: {
  page?: number;
  limit?: number;
  examYear?: number;
  schoolRegion?: string;
}) {
  const { page = 1, limit = 10, examYear, schoolRegion } = query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (examYear) {
    where.examYear = Number(examYear);
  }

  if (schoolRegion) {
    where.schoolRegion = schoolRegion;
  }

  const [matriculations, total] = await Promise.all([
    prisma.matriculationResult.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                nameEnglish: true,
                nameMyanmar: true,
              },
            },
          },
        },
      },
      orderBy: { totalScore: "desc" },
    }),
    prisma.matriculationResult.count({ where }),
  ]);

  return {
    data: matriculations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

export async function getMatriculationById(id: number) {
  const matriculation = await prisma.matriculationResult.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              nameEnglish: true,
              nameMyanmar: true,
              nrc: true,
            },
          },
        },
      },
    },
  });

  if (!matriculation) {
    throw ApiError.notFound("Matriculation result not found");
  }

  return matriculation;
}

export async function getMatriculationStats(examYear?: number) {
  const where: any = {};
  if (examYear) {
    where.examYear = Number(examYear);
  }

  const stats = await prisma.matriculationResult.aggregate({
    where,
    _count: { id: true },
    _avg: {
      totalScore: true,
      myanmar: true,
      english: true,
      mathematics: true,
      physics: true,
      chemistry: true,
    },
    _max: { totalScore: true },
    _min: { totalScore: true },
  });

  // Get distribution by region
  const regionDistribution = await prisma.matriculationResult.groupBy({
    by: ["schoolRegion"],
    where,
    _count: { id: true },
    _avg: { totalScore: true },
  });

  return {
    totalStudents: stats._count.id,
    averages: {
      totalScore: Math.round(stats._avg.totalScore || 0),
      myanmar: Math.round(stats._avg.myanmar || 0),
      english: Math.round(stats._avg.english || 0),
      mathematics: Math.round(stats._avg.mathematics || 0),
      physics: Math.round(stats._avg.physics || 0),
      chemistry: Math.round(stats._avg.chemistry || 0),
    },
    highestScore: stats._max.totalScore,
    lowestScore: stats._min.totalScore,
    byRegion: regionDistribution.map((r) => ({
      region: r.schoolRegion,
      count: r._count.id,
      averageScore: Math.round(r._avg.totalScore || 0),
    })),
  };
}
