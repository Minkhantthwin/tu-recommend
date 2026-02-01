import { Router } from "express";
import * as interestController from "./interest.controller";
import { validate } from "../../common/middleware";
import {
  createInterestSchema,
  updateInterestSchema,
  addUserInterestSchema,
  addMultipleUserInterestsSchema,
} from "./interest.validation";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

// ==================== Interest Routes (Public & Admin) ====================

/**
 * @swagger
 * /api/interests:
 *   get:
 *     tags: [Interests]
 *     summary: Get all interests
 *     description: Retrieve a list of all available interests
 *     responses:
 *       200:
 *         description: List of interests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interest'
 */
router.get("/interests", interestController.getAllInterests);

/**
 * @swagger
 * /api/interests/{id}:
 *   get:
 *     tags: [Interests]
 *     summary: Get interest by ID
 *     description: Retrieve a single interest by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Interest ID
 *     responses:
 *       200:
 *         description: Interest retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Interest'
 *       404:
 *         description: Interest not found
 */
router.get("/interests/:id", interestController.getInterestById);

/**
 * @swagger
 * /api/interests:
 *   post:
 *     tags: [Interests]
 *     summary: Create a new interest (Admin only)
 *     description: Create a new interest category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInterest'
 *     responses:
 *       201:
 *         description: Interest created successfully
 *       400:
 *         description: Validation error or interest already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/interests",
  authenticate,
  adminOnly,
  validate(createInterestSchema),
  interestController.createInterest,
);

/**
 * @swagger
 * /api/interests/{id}:
 *   put:
 *     tags: [Interests]
 *     summary: Update an interest (Admin only)
 *     description: Update an existing interest
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Interest ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInterest'
 *     responses:
 *       200:
 *         description: Interest updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Interest not found
 */
router.put(
  "/interests/:id",
  authenticate,
  adminOnly,
  validate(updateInterestSchema),
  interestController.updateInterest,
);

/**
 * @swagger
 * /api/interests/{id}:
 *   delete:
 *     tags: [Interests]
 *     summary: Delete an interest (Admin only)
 *     description: Delete an existing interest (only if no users have it)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Interest ID
 *     responses:
 *       204:
 *         description: Interest deleted successfully
 *       400:
 *         description: Cannot delete interest with associated users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Interest not found
 */
router.delete(
  "/interests/:id",
  authenticate,
  adminOnly,
  interestController.deleteInterest,
);

// ==================== User Interest Routes ====================

/**
 * @swagger
 * /api/me/interests:
 *   get:
 *     tags: [User Interests]
 *     summary: Get current user's interests
 *     description: Retrieve all interests for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User interests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interest'
 *       401:
 *         description: Unauthorized
 */
router.get("/me/interests", authenticate, interestController.getMyInterests);

/**
 * @swagger
 * /api/me/interests:
 *   post:
 *     tags: [User Interests]
 *     summary: Add an interest to current user
 *     description: Add a single interest to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddUserInterest'
 *     responses:
 *       201:
 *         description: Interest added successfully
 *       400:
 *         description: User already has this interest
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Interest not found
 */
router.post(
  "/me/interests",
  authenticate,
  validate(addUserInterestSchema),
  interestController.addMyInterest,
);

/**
 * @swagger
 * /api/me/interests/bulk:
 *   post:
 *     tags: [User Interests]
 *     summary: Add multiple interests to current user
 *     description: Add multiple interests to the authenticated user at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMultipleUserInterests'
 *     responses:
 *       200:
 *         description: Interests added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or interests not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/me/interests/bulk",
  authenticate,
  validate(addMultipleUserInterestsSchema),
  interestController.addMyInterests,
);

/**
 * @swagger
 * /api/me/interests:
 *   put:
 *     tags: [User Interests]
 *     summary: Replace all user interests
 *     description: Replace all interests for the authenticated user with a new set
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMultipleUserInterests'
 *     responses:
 *       200:
 *         description: Interests replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or interests not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/me/interests",
  authenticate,
  validate(addMultipleUserInterestsSchema),
  interestController.replaceMyInterests,
);

/**
 * @swagger
 * /api/me/interests/{interestId}:
 *   delete:
 *     tags: [User Interests]
 *     summary: Remove an interest from current user
 *     description: Remove a single interest from the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Interest ID to remove
 *     responses:
 *       204:
 *         description: Interest removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User does not have this interest
 */
router.delete(
  "/me/interests/:interestId",
  authenticate,
  interestController.removeMyInterest,
);

export default router;
