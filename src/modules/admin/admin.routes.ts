import { Router } from "express";
import * as adminController from "./admin.controller";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard statistics
 *     description: Retrieve aggregated statistics for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/stats",
  authenticate,
  adminOnly,
  adminController.getDashboardStats,
);

export default router;
