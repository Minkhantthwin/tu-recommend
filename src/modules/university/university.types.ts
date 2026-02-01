// University DTOs
export interface CreateUniversityDto {
  name: string;
  nameMyanmar?: string;
  code?: string;
  location: string;
  region?: string;
  description?: string;
  photoUrl?: string;
  logoUrl?: string;
}

export interface UpdateUniversityDto {
  name?: string;
  nameMyanmar?: string;
  code?: string;
  location?: string;
  region?: string;
  description?: string;
  photoUrl?: string;
  logoUrl?: string;
}

// Program DTOs
export interface CreateProgramDto {
  universityId: number;
  name: string;
  nameMyanmar?: string;
  code?: string;
  description?: string;
  minScore: number;
  quota?: number;
}

export interface UpdateProgramDto {
  name?: string;
  nameMyanmar?: string;
  code?: string;
  description?: string;
  minScore?: number;
  quota?: number;
}

// Program Requirement DTOs
export interface CreateProgramRequirementDto {
  programId: number;
  myanmar?: number;
  english?: number;
  mathematics?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  minTotalScore?: number;
}

export interface UpdateProgramRequirementDto {
  myanmar?: number;
  english?: number;
  mathematics?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
  minTotalScore?: number;
}

// Query DTOs
export interface UniversityQueryDto {
  search?: string;
  region?: string;
  page?: number;
  limit?: number;
}

export interface ProgramQueryDto {
  search?: string;
  universityId?: number;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}
