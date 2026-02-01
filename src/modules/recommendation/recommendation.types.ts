// Recommendation DTOs

export interface EligibleProgramsResponse {
  matriculation: {
    id: number;
    userId: string;
    examYear: number;
    rollNumber: string;
    schoolName: string;
    schoolTownship: string;
    schoolRegion: string;
    myanmar: number;
    english: number;
    mathematics: number;
    physics: number;
    chemistry: number;
    biology: number | null;
    totalScore: number;
    totalMarks: number;
  };
  eligiblePrograms: Array<{
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
    requirements: Array<{
      id: number;
      programId: number;
      myanmar: number | null;
      english: number | null;
      mathematics: number | null;
      physics: number | null;
      chemistry: number | null;
      biology: number | null;
      minTotalScore: number | null;
    }>;
    matchScore?: number; // How well the student matches this program
  }>;
  totalEligible: number;
}

export interface RecommendedProgramsResponse extends EligibleProgramsResponse {
  recommendedPrograms: Array<{
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
    matchScore: number;
    matchReasons: string[];
  }>;
}

export interface ProgramComparisonDto {
  programIds: number[];
}

export interface ProgramComparisonResult {
  programs: Array<{
    id: number;
    name: string;
    nameMyanmar: string | null;
    code: string | null;
    university: {
      name: string;
      location: string;
    };
    minScore: number;
    quota: number | null;
    requirements: {
      myanmar: number | null;
      english: number | null;
      mathematics: number | null;
      physics: number | null;
      chemistry: number | null;
      biology: number | null;
      minTotalScore: number | null;
    } | null;
    isEligible: boolean;
    matchScore: number;
  }>;
  userMatriculation: {
    totalScore: number;
    myanmar: number;
    english: number;
    mathematics: number;
    physics: number;
    chemistry: number;
    biology: number | null;
  };
}
