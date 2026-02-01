// Matriculation DTOs

export interface CreateMatriculationDto {
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
  biology?: number;
}

export interface UpdateMatriculationDto {
  examYear?: number;
  rollNumber?: string;
  schoolName?: string;
  schoolTownship?: string;
  schoolRegion?: string;
  myanmar?: number;
  english?: number;
  mathematics?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
}

export interface MatriculationResponse {
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
  createdAt: Date;
  updatedAt: Date;
}
