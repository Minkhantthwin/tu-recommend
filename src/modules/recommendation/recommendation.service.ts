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

export async function getEligiblePrograms(userId: string, region?: string) {
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
    programWhere.university = { region };
  }

  // Get all programs with requirements
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

  return {
    matriculation,
    eligiblePrograms: programsWithScore,
    totalEligible: programsWithScore.length,
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

  return {
    matriculation,
    eligiblePrograms,
    totalEligible: eligiblePrograms.length,
    recommendedPrograms: recommendedPrograms.slice(0, limit),
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
  return getEligiblePrograms(userId, region);
}

export async function getTopPrograms(userId: string, limit: number = 5) {
  const result = await getEligiblePrograms(userId);

  // Return only the top N programs by match score
  return {
    matriculation: result.matriculation,
    topPrograms: result.eligiblePrograms.slice(0, limit),
    totalEligible: result.totalEligible,
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
