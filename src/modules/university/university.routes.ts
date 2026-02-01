import { Router } from "express";
import * as universityController from "./university.controller";
import { validate } from "../../common/middleware";
import {
  createUniversitySchema,
  updateUniversitySchema,
  createProgramSchema,
  updateProgramSchema,
  createProgramRequirementSchema,
  updateProgramRequirementSchema,
} from "./university.validation";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

// ==================== University Routes ====================

/**
 * @swagger
 * /api/universities:
 *   get:
 *     tags: [Universities]
 *     summary: Get all universities
 *     description: Retrieve a paginated list of universities with optional filters
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, Myanmar name, or code
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
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
 *     responses:
 *       200:
 *         description: List of universities retrieved successfully
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
 *                         $ref: '#/components/schemas/University'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get("/universities", universityController.getUniversities);

/**
 * @swagger
 * /api/universities/{id}:
 *   get:
 *     tags: [Universities]
 *     summary: Get university by ID
 *     description: Retrieve a single university with its programs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: University ID
 *     responses:
 *       200:
 *         description: University retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UniversityWithPrograms'
 *       404:
 *         description: University not found
 */
router.get("/universities/:id", universityController.getUniversityById);

/**
 * @swagger
 * /api/universities/{universityId}/programs:
 *   get:
 *     tags: [Universities]
 *     summary: Get programs by university
 *     description: Retrieve all programs for a specific university
 *     parameters:
 *       - in: path
 *         name: universityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: University ID
 *     responses:
 *       200:
 *         description: Programs retrieved successfully
 *       404:
 *         description: University not found
 */
router.get(
  "/universities/:universityId/programs",
  universityController.getProgramsByUniversity,
);

/**
 * @swagger
 * /api/universities:
 *   post:
 *     tags: [Universities]
 *     summary: Create a new university (Admin only)
 *     description: Create a new university entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUniversity'
 *     responses:
 *       201:
 *         description: University created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/universities",
  authenticate,
  adminOnly,
  validate(createUniversitySchema),
  universityController.createUniversity,
);

/**
 * @swagger
 * /api/universities/{id}:
 *   put:
 *     tags: [Universities]
 *     summary: Update a university (Admin only)
 *     description: Update an existing university
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: University ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUniversity'
 *     responses:
 *       200:
 *         description: University updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: University not found
 */
router.put(
  "/universities/:id",
  authenticate,
  adminOnly,
  validate(updateUniversitySchema),
  universityController.updateUniversity,
);

/**
 * @swagger
 * /api/universities/{id}:
 *   delete:
 *     tags: [Universities]
 *     summary: Delete a university (Admin only)
 *     description: Delete an existing university (only if no programs exist)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: University ID
 *     responses:
 *       204:
 *         description: University deleted successfully
 *       400:
 *         description: Cannot delete university with existing programs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: University not found
 */
router.delete(
  "/universities/:id",
  authenticate,
  adminOnly,
  universityController.deleteUniversity,
);

// ==================== Program Routes ====================

/**
 * @swagger
 * /api/programs:
 *   get:
 *     tags: [Programs]
 *     summary: Get all programs
 *     description: Retrieve a paginated list of programs with optional filters
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, Myanmar name, or code
 *       - in: query
 *         name: universityId
 *         schema:
 *           type: integer
 *         description: Filter by university ID
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *         description: Filter by minimum score (greater than or equal)
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: integer
 *         description: Filter by maximum score (less than or equal)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of programs retrieved successfully
 */
router.get("/programs", universityController.getPrograms);

/**
 * @swagger
 * /api/programs/{id}:
 *   get:
 *     tags: [Programs]
 *     summary: Get program by ID
 *     description: Retrieve a single program with its university and requirements
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Program retrieved successfully
 *       404:
 *         description: Program not found
 */
router.get("/programs/:id", universityController.getProgramById);

/**
 * @swagger
 * /api/programs:
 *   post:
 *     tags: [Programs]
 *     summary: Create a new program (Admin only)
 *     description: Create a new program for a university
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProgram'
 *     responses:
 *       201:
 *         description: Program created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: University not found
 */
router.post(
  "/programs",
  authenticate,
  adminOnly,
  validate(createProgramSchema),
  universityController.createProgram,
);

/**
 * @swagger
 * /api/programs/{id}:
 *   put:
 *     tags: [Programs]
 *     summary: Update a program (Admin only)
 *     description: Update an existing program
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProgram'
 *     responses:
 *       200:
 *         description: Program updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Program not found
 */
router.put(
  "/programs/:id",
  authenticate,
  adminOnly,
  validate(updateProgramSchema),
  universityController.updateProgram,
);

/**
 * @swagger
 * /api/programs/{id}:
 *   delete:
 *     tags: [Programs]
 *     summary: Delete a program (Admin only)
 *     description: Delete an existing program (only if no applications exist)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       204:
 *         description: Program deleted successfully
 *       400:
 *         description: Cannot delete program with existing applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Program not found
 */
router.delete(
  "/programs/:id",
  authenticate,
  adminOnly,
  universityController.deleteProgram,
);

// ==================== Program Requirement Routes ====================

/**
 * @swagger
 * /api/programs/requirements:
 *   post:
 *     tags: [Program Requirements]
 *     summary: Create program requirement (Admin only)
 *     description: Create subject score requirements for a program
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProgramRequirement'
 *     responses:
 *       201:
 *         description: Requirement created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Program not found
 */
router.post(
  "/programs/requirements",
  authenticate,
  adminOnly,
  validate(createProgramRequirementSchema),
  universityController.createProgramRequirement,
);

/**
 * @swagger
 * /api/programs/requirements/{id}:
 *   put:
 *     tags: [Program Requirements]
 *     summary: Update program requirement (Admin only)
 *     description: Update subject score requirements for a program
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Requirement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProgramRequirement'
 *     responses:
 *       200:
 *         description: Requirement updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Requirement not found
 */
router.put(
  "/programs/requirements/:id",
  authenticate,
  adminOnly,
  validate(updateProgramRequirementSchema),
  universityController.updateProgramRequirement,
);

/**
 * @swagger
 * /api/programs/requirements/{id}:
 *   delete:
 *     tags: [Program Requirements]
 *     summary: Delete program requirement (Admin only)
 *     description: Delete subject score requirements for a program
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Requirement ID
 *     responses:
 *       204:
 *         description: Requirement deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Requirement not found
 */
router.delete(
  "/programs/requirements/:id",
  authenticate,
  adminOnly,
  universityController.deleteProgramRequirement,
);

export default router;
