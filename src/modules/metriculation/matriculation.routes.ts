import { Router } from "express";
import * as matriculationController from "./matriculation.controller";
import { validate } from "../../common/middleware";
import {
  createMatriculationSchema,
  updateMatriculationSchema,
} from "./matriculation.validation";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

// ==================== User Matriculation Routes ====================

/**
 * @swagger
 * /api/me/matriculation:
 *   get:
 *     tags: [Matriculation]
 *     summary: Get current user's matriculation result
 *     description: Retrieve the matriculation result for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matriculation result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MatriculationResult'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me/matriculation",
  authenticate,
  matriculationController.getMyMatriculation,
);

/**
 * @swagger
 * /api/me/matriculation:
 *   post:
 *     tags: [Matriculation]
 *     summary: Create matriculation result for current user
 *     description: Create a new matriculation result entry for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatriculation'
 *     responses:
 *       201:
 *         description: Matriculation result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MatriculationResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or matriculation already exists
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/me/matriculation",
  authenticate,
  validate(createMatriculationSchema),
  matriculationController.createMyMatriculation,
);

/**
 * @swagger
 * /api/me/matriculation:
 *   put:
 *     tags: [Matriculation]
 *     summary: Update current user's matriculation result
 *     description: Update the matriculation result for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMatriculation'
 *     responses:
 *       200:
 *         description: Matriculation result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MatriculationResult'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Matriculation result not found
 */
router.put(
  "/me/matriculation",
  authenticate,
  validate(updateMatriculationSchema),
  matriculationController.updateMyMatriculation,
);

/**
 * @swagger
 * /api/me/matriculation:
 *   delete:
 *     tags: [Matriculation]
 *     summary: Delete current user's matriculation result
 *     description: Delete the matriculation result for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Matriculation result deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Matriculation result not found
 */
router.delete(
  "/me/matriculation",
  authenticate,
  matriculationController.deleteMyMatriculation,
);

// ==================== Admin Routes ====================

/**
 * @swagger
 * /api/matriculations:
 *   get:
 *     tags: [Matriculation Admin]
 *     summary: Get all matriculation results (Admin only)
 *     description: Retrieve paginated list of all matriculation results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: examYear
 *         schema:
 *           type: integer
 *         description: Filter by exam year
 *       - in: query
 *         name: schoolRegion
 *         schema:
 *           type: string
 *         description: Filter by school region
 *     responses:
 *       200:
 *         description: Matriculation results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MatriculationWithUser'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/matriculations",
  authenticate,
  adminOnly,
  matriculationController.getAllMatriculations,
);

/**
 * @swagger
 * /api/matriculations/stats:
 *   get:
 *     tags: [Matriculation Admin]
 *     summary: Get matriculation statistics (Admin only)
 *     description: Retrieve aggregate statistics for matriculation results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examYear
 *         schema:
 *           type: integer
 *         description: Filter statistics by exam year
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MatriculationStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/matriculations/stats",
  authenticate,
  adminOnly,
  matriculationController.getMatriculationStats,
);

/**
 * @swagger
 * /api/matriculations/{id}:
 *   get:
 *     tags: [Matriculation Admin]
 *     summary: Get matriculation result by ID (Admin only)
 *     description: Retrieve a specific matriculation result by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Matriculation result ID
 *     responses:
 *       200:
 *         description: Matriculation result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MatriculationWithUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Matriculation result not found
 */
router.get(
  "/matriculations/:id",
  authenticate,
  adminOnly,
  matriculationController.getMatriculationById,
);

export default router;
