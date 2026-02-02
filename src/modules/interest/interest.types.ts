// Interest DTOs
export interface CreateInterestDto {
  name: string;
}

export interface UpdateInterestDto {
  name?: string;
}

export interface InterestQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

// User Interest DTOs
export interface AddUserInterestDto {
  interestId: number;
}

export interface AddMultipleUserInterestsDto {
  interestIds: number[];
}

export interface RemoveUserInterestDto {
  interestId: number;
}
