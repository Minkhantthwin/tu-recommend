import { UserRole } from "@prisma/client";

// Request DTOs
export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: "access" | "refresh";
}

// Response types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  tokens: AuthTokens;
}

// Extended Express Request with user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
