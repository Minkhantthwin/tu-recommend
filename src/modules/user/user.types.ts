import { Gender, Religion, MaritalStatus } from '@prisma/client';

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
}

// User Profile DTOs
export interface CreateUserProfileDto {
  // Personal Information
  nameMyanmar: string;
  nameEnglish: string;
  nrc: string;
  dateOfBirth: Date | string;
  gender: Gender;
  religion: Religion;
  ethnicity: string;
  nationality?: string;
  maritalStatus?: MaritalStatus;

  // Contact Information
  phone: string;
  alternatePhone?: string;

  // Permanent Address
  permanentAddress: string;
  permanentTownship: string;
  permanentRegion: string;

  // Current Address
  currentAddress?: string;
  currentTownship?: string;
  currentRegion?: string;

  // Parent Information
  fatherName: string;
  fatherNrc?: string;
  fatherOccupation?: string;
  fatherPhone?: string;

  motherName: string;
  motherNrc?: string;
  motherOccupation?: string;
  motherPhone?: string;

  // Guardian Information
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianAddress?: string;

  // Photo
  photoUrl?: string;
}

export interface UpdateUserProfileDto extends Partial<CreateUserProfileDto> {}

// Response types
export interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfileResponse extends UserResponse {
  profile: UserProfileResponse | null;
}

export interface UserProfileResponse {
  id: number;
  nameMyanmar: string;
  nameEnglish: string;
  nrc: string;
  dateOfBirth: Date;
  gender: Gender;
  religion: Religion;
  ethnicity: string;
  nationality: string;
  maritalStatus: MaritalStatus;
  phone: string;
  alternatePhone: string | null;
  permanentAddress: string;
  permanentTownship: string;
  permanentRegion: string;
  currentAddress: string | null;
  currentTownship: string | null;
  currentRegion: string | null;
  fatherName: string;
  fatherNrc: string | null;
  fatherOccupation: string | null;
  fatherPhone: string | null;
  motherName: string;
  motherNrc: string | null;
  motherOccupation: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  guardianAddress: string | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFullResponse extends UserResponse {
  profile: UserProfileResponse | null;
  matriculation: MatriculationResponse | null;
}

export interface MatriculationResponse {
  id: number;
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
}
