import { prisma } from "../../config/database";
import { ApiError } from "../../common/utils/api-error";

// Interest to Program mapping for smart recommendations
const INTEREST_PROGRAM_MAPPING: Record<string, string[]> = {
  Electronics: ["EC", "EP", "MtE"],
  Programming: ["CEIT", "EC", "MtE"],
  Mathematics: ["CEIT", "EC", "EP", "ME", "MtE"],
  Physics: ["EP", "ME", "EC", "MtE", "PE"],
  Chemistry: ["ChE", "MetE", "PE", "MnE"],
  Construction: ["CE", "Arch"],
  Automotive: ["ME", "MtE"],
  Energy: ["EP", "PE", "ChE"],
  Manufacturing: ["ME", "MtE", "MetE", "TE"],
  Design: ["Arch", "ME", "MtE"],
  Research: ["CEIT", "ChE", "MetE"],
  Robotics: ["MtE", "EC", "CEIT"],
  "Artificial Intelligence": ["CEIT", "EC", "MtE"],
  Networking: ["CEIT", "EC"],
  "Oil & Gas": ["PE", "ChE", "MnE"],
  Mining: ["MnE", "MetE", "CE"],
  Architecture: ["Arch", "CE"],
  Textiles: ["TE", "ChE"],
};

// ==================== Recommendation Services ====================

export async function getEligiblePrograms(
  userId: string,
  region?: string,
  search?: string,
  universityId?: number,
  page: number = 1,
  limit: number = 10,
) {
  // Get user's matriculation result
  const matriculation = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  if (!matriculation) {
    throw ApiError.badRequest(
      "Please add your matriculation results to get recommendations",
    );
  }

  // Build program query
  const programWhere: any = {};
  if (region) {
    programWhere.university = { ...programWhere.university, region };
  }
  if (universityId) {
    programWhere.universityId = universityId;
  }
  if (search) {
    programWhere.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameMyanmar: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get all programs with requirements
  // Note: We fetch all matching programs first, then filter by eligibility in memory
  // This is because eligibility logic (checking specific subject scores against requirements)
  // is complex to express purely in Prisma/SQL queries
  const programs = await prisma.program.findMany({
    where: programWhere,
    include: {
      university: true,
      requirements: true,
    },
    orderBy: { minScore: "desc" },
  });

  // Filter eligible programs
  const eligiblePrograms = programs.filter((program) => {
    // Check minimum total score
    if (matriculation.totalScore < program.minScore) {
      return false;
    }

    // Check individual subject requirements
    for (const requirement of program.requirements) {
      if (requirement.myanmar && matriculation.myanmar < requirement.myanmar) {
        return false;
      }
      if (requirement.english && matriculation.english < requirement.english) {
        return false;
      }
      if (
        requirement.mathematics &&
        matriculation.mathematics < requirement.mathematics
      ) {
        return false;
      }
      if (requirement.physics && matriculation.physics < requirement.physics) {
        return false;
      }
      if (
        requirement.chemistry &&
        matriculation.chemistry < requirement.chemistry
      ) {
        return false;
      }
      if (
        requirement.biology &&
        matriculation.biology &&
        matriculation.biology < requirement.biology
      ) {
        return false;
      }
      if (
        requirement.minTotalScore &&
        matriculation.totalScore < requirement.minTotalScore
      ) {
        return false;
      }
    }

    return true;
  });

  // Calculate match score for each eligible program
  const programsWithScore = eligiblePrograms.map((program) => {
    const matchScore = calculateMatchScore(matriculation, program);
    return { ...program, matchScore };
  });

  // Sort by match score
  programsWithScore.sort((a, b) => b.matchScore - a.matchScore);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPrograms = programsWithScore.slice(startIndex, endIndex);

  return {
    matriculation,
    data: paginatedPrograms,
    pagination: {
      page,
      limit,
      total: programsWithScore.length,
      totalPages: Math.ceil(programsWithScore.length / limit),
    },
  };
}

export async function getRecommendedPrograms(
  userId: string,
  limit: number = 10,
) {
  // Get user's matriculation and interests
  const [matriculation, userInterests] = await Promise.all([
    prisma.matriculationResult.findUnique({
      where: { userId },
    }),
    prisma.userInterest.findMany({
      where: { userId },
      include: { interest: true },
    }),
  ]);

  if (!matriculation) {
    throw ApiError.badRequest(
      "Please add your matriculation results to get recommendations",
    );
  }

  // Get all programs with requirements
  const programs = await prisma.program.findMany({
    include: {
      university: true,
      requirements: true,
    },
    orderBy: { minScore: "desc" },
  });

  // Filter eligible programs and calculate scores
  const eligiblePrograms = programs.filter((program) => {
    if (matriculation.totalScore < program.minScore) {
      return false;
    }

    for (const requirement of program.requirements) {
      if (requirement.myanmar && matriculation.myanmar < requirement.myanmar) {
        return false;
      }
      if (requirement.english && matriculation.english < requirement.english) {
        return false;
      }
      if (
        requirement.mathematics &&
        matriculation.mathematics < requirement.mathematics
      ) {
        return false;
      }
      if (requirement.physics && matriculation.physics < requirement.physics) {
        return false;
      }
      if (
        requirement.chemistry &&
        matriculation.chemistry < requirement.chemistry
      ) {
        return false;
      }
      if (
        requirement.biology &&
        matriculation.biology &&
        matriculation.biology < requirement.biology
      ) {
        return false;
      }
      if (
        requirement.minTotalScore &&
        matriculation.totalScore < requirement.minTotalScore
      ) {
        return false;
      }
    }
    return true;
  });

  // Get user interest names
  const userInterestNames = userInterests.map((ui) => ui.interest.name);

  // Calculate recommendation score for each eligible program
  const recommendedPrograms = eligiblePrograms.map((program) => {
    const matchScore = calculateMatchScore(matriculation, program);
    const interestScore = calculateInterestScore(
      program.code,
      userInterestNames,
    );
    const combinedScore = matchScore * 0.6 + interestScore * 0.4;
    const matchReasons = getMatchReasons(
      matriculation,
      program,
      userInterestNames,
    );

    return {
      ...program,
      matchScore: Math.round(combinedScore),
      matchReasons,
    };
  });

  // Sort by combined score and limit
  recommendedPrograms.sort((a, b) => b.matchScore - a.matchScore);

  // Apply diversity filter to avoid too many repetitions of the same program
  const finalRecommendations: typeof recommendedPrograms = [];
  const programCounts: Record<string, number> = {};
  const skippedPrograms: typeof recommendedPrograms = [];
  const MAX_SAME_PROGRAM_COUNT = 2;

  for (const program of recommendedPrograms) {
    if (finalRecommendations.length >= limit) break;

    // Use code as primary key, fallback to name if code is missing
    const key = program.code || program.name;
    const count = programCounts[key] || 0;

    if (count < MAX_SAME_PROGRAM_COUNT) {
      finalRecommendations.push(program);
      programCounts[key] = count + 1;
    } else {
      skippedPrograms.push(program);
    }
  }

  // If we haven't reached the limit, fill up with skipped programs
  while (finalRecommendations.length < limit && skippedPrograms.length > 0) {
    finalRecommendations.push(skippedPrograms.shift()!);
  }

  return {
    matriculation,
    totalEligible: eligiblePrograms.length,
    recommendedPrograms: finalRecommendations,
  };
}

export async function comparePrograms(userId: string, programIds: number[]) {
  // Get user's matriculation
  const matriculation = await prisma.matriculationResult.findUnique({
    where: { userId },
  });

  if (!matriculation) {
    throw ApiError.badRequest(
      "Please add your matriculation results to compare programs",
    );
  }

  // Get the programs
  const programs = await prisma.program.findMany({
    where: { id: { in: programIds } },
    include: {
      university: true,
      requirements: true,
    },
  });

  if (programs.length !== programIds.length) {
    throw ApiError.badRequest("One or more programs not found");
  }

  // Calculate eligibility and match score for each program
  const comparisonResults = programs.map((program) => {
    const isEligible = checkEligibility(matriculation, program);
    const matchScore = isEligible
      ? calculateMatchScore(matriculation, program)
      : 0;

    return {
      id: program.id,
      name: program.name,
      nameMyanmar: program.nameMyanmar,
      code: program.code,
      university: {
        name: program.university.name,
        location: program.university.location,
      },
      minScore: program.minScore,
      quota: program.quota,
      requirements:
        program.requirements.length > 0
          ? {
              myanmar: program.requirements[0].myanmar,
              english: program.requirements[0].english,
              mathematics: program.requirements[0].mathematics,
              physics: program.requirements[0].physics,
              chemistry: program.requirements[0].chemistry,
              biology: program.requirements[0].biology,
              minTotalScore: program.requirements[0].minTotalScore,
            }
          : null,
      isEligible,
      matchScore,
    };
  });

  return {
    programs: comparisonResults,
    userMatriculation: {
      totalScore: matriculation.totalScore,
      myanmar: matriculation.myanmar,
      english: matriculation.english,
      mathematics: matriculation.mathematics,
      physics: matriculation.physics,
      chemistry: matriculation.chemistry,
      biology: matriculation.biology,
    },
  };
}

export async function getProgramsByRegion(userId: string, region: string) {
  const result = await getEligiblePrograms(userId, region);
  return result;
}

export async function getTopPrograms(userId: string, limit: number = 5) {
  const [result, userInterests] = await Promise.all([
    getEligiblePrograms(userId, undefined, undefined, undefined, 1, 1000), // Fetch more programs for top ranking
    prisma.userInterest.findMany({
      where: { userId },
      include: { interest: true },
    }),
  ]);

  const userInterestNames = userInterests.map((ui) => ui.interest.name);

  const enhancedPrograms = result.data.map((program) => {
    // Recalculate match score to include interest score
    // (getEligiblePrograms only calculates base score based on marks)
    const baseMatchScore = calculateMatchScore(result.matriculation, program);
    const interestScore = calculateInterestScore(
      program.code,
      userInterestNames,
    );

    const combinedScore = baseMatchScore * 0.6 + interestScore * 0.4;

    const matchReasons = getMatchReasons(
      result.matriculation,
      program,
      userInterestNames,
    );

    return {
      ...program,
      matchScore: Math.round(combinedScore),
      matchReasons,
    };
  });

  // Sort by combined score and limit
  enhancedPrograms.sort((a, b) => b.matchScore - a.matchScore);

  return {
    matriculation: result.matriculation,
    topPrograms: enhancedPrograms.slice(0, limit),
  };
}

// ==================== Helper Functions ====================

function checkEligibility(matriculation: any, program: any): boolean {
  if (matriculation.totalScore < program.minScore) {
    return false;
  }

  for (const requirement of program.requirements) {
    if (requirement.myanmar && matriculation.myanmar < requirement.myanmar) {
      return false;
    }
    if (requirement.english && matriculation.english < requirement.english) {
      return false;
    }
    if (
      requirement.mathematics &&
      matriculation.mathematics < requirement.mathematics
    ) {
      return false;
    }
    if (requirement.physics && matriculation.physics < requirement.physics) {
      return false;
    }
    if (
      requirement.chemistry &&
      matriculation.chemistry < requirement.chemistry
    ) {
      return false;
    }
    if (
      requirement.biology &&
      matriculation.biology &&
      matriculation.biology < requirement.biology
    ) {
      return false;
    }
    if (
      requirement.minTotalScore &&
      matriculation.totalScore < requirement.minTotalScore
    ) {
      return false;
    }
  }

  return true;
}

function calculateMatchScore(matriculation: any, program: any): number {
  // Base score: how much the total score exceeds the minimum
  const scoreMargin = matriculation.totalScore - program.minScore;
  const maxMargin = 200; // Maximum expected margin
  const baseScore = Math.min((scoreMargin / maxMargin) * 50, 50);

  // Subject score bonus
  let subjectBonus = 0;
  const requirement = program.requirements[0];

  if (requirement) {
    let totalBonus = 0;
    let subjectCount = 0;

    if (requirement.mathematics) {
      const margin = matriculation.mathematics - requirement.mathematics;
      totalBonus += Math.min(margin / 30, 1) * 10;
      subjectCount++;
    }
    if (requirement.physics) {
      const margin = matriculation.physics - requirement.physics;
      totalBonus += Math.min(margin / 30, 1) * 10;
      subjectCount++;
    }
    if (requirement.chemistry) {
      const margin = matriculation.chemistry - requirement.chemistry;
      totalBonus += Math.min(margin / 30, 1) * 10;
      subjectCount++;
    }
    if (requirement.english) {
      const margin = matriculation.english - requirement.english;
      totalBonus += Math.min(margin / 30, 1) * 10;
      subjectCount++;
    }

    if (subjectCount > 0) {
      subjectBonus = totalBonus / subjectCount;
    }
  }

  return Math.round(baseScore + subjectBonus);
}

function calculateInterestScore(
  programCode: string | null,
  userInterests: string[],
): number {
  if (!programCode || userInterests.length === 0) {
    return 0;
  }

  let matchCount = 0;

  for (const interest of userInterests) {
    const matchingPrograms = INTEREST_PROGRAM_MAPPING[interest] || [];
    if (matchingPrograms.includes(programCode)) {
      matchCount++;
    }
  }

  // Score based on how many interests match
  const maxScore = 100;
  const scorePerMatch = maxScore / Math.max(userInterests.length, 1);

  return Math.min(matchCount * scorePerMatch, maxScore);
}

function getMatchReasons(
  matriculation: any,
  program: any,
  userInterests: string[],
): string[] {
  const reasons: string[] = [];

  // Score margin reason
  const margin = matriculation.totalScore - program.minScore;
  if (margin >= 50) {
    reasons.push(`Your total score exceeds the minimum by ${margin} marks`);
  } else if (margin >= 20) {
    reasons.push(
      `You meet the minimum score requirement with ${margin} marks to spare`,
    );
  }

  // Strong subjects
  const requirement = program.requirements[0];
  if (requirement) {
    if (
      requirement.mathematics &&
      matriculation.mathematics >= requirement.mathematics + 20
    ) {
      reasons.push("Strong mathematics skills match program requirements");
    }
    if (
      requirement.physics &&
      matriculation.physics >= requirement.physics + 20
    ) {
      reasons.push("Strong physics skills match program requirements");
    }
    if (
      requirement.chemistry &&
      matriculation.chemistry >= requirement.chemistry + 20
    ) {
      reasons.push("Strong chemistry skills match program requirements");
    }
  }

  // Interest match
  if (program.code) {
    for (const interest of userInterests) {
      const matchingPrograms = INTEREST_PROGRAM_MAPPING[interest] || [];
      if (matchingPrograms.includes(program.code)) {
        reasons.push(`Matches your interest in ${interest}`);
      }
    }
  }

  return reasons.slice(0, 5); // Limit to 5 reasons
}
