import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "./auth.service";
import { ApiError } from "../../common/utils/api-error";

/**
 * Middleware to authenticate JWT token
 * Extracts user info from token and attaches to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to authorize specific roles
 * Must be used after authenticate middleware
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          "You do not have permission to access this resource",
        ),
      );
    }

    next();
  };
}

/**
 * Middleware for admin-only routes
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.unauthorized("Not authenticated"));
  }

  if (req.user.role !== "ADMIN") {
    return next(ApiError.forbidden("Admin access required"));
  }

  next();
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work differently for authenticated vs anonymous users
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Token is invalid but we don't fail - just proceed without user
    next();
  }
}
