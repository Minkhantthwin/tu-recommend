import { Router } from "express";
import * as recommendationController from "./recommendation.controller";
import { validate } from "../../common/middleware";
import { programComparisonSchema } from "./recommendation.validation";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// ==================== Recommendation Routes ====================

/**
 * @swagger
 * /api/recommendations/eligible-programs:
 *   get:
 *     tags: [Recommendations]
 *     summary: Get eligible programs for current user
 *     description: Get list of programs the user is eligible for based on their matriculation results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by university region (e.g., Yangon, Mandalay)
 *     responses:
 *       200:
 *         description: Eligible programs retrieved successfully
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
 *                     matriculation:
 *                       $ref: '#/components/schemas/MatriculationResult'
 *                     eligiblePrograms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProgramWithUniversity'
 *                     totalEligible:
 *                       type: integer
 *       400:
 *         description: Matriculation results not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/recommendations/eligible-programs",
  authenticate,
  recommendationController.getEligiblePrograms,
);

/**
 * @swagger
 * /api/recommendations/suggested:
 *   get:
 *     tags: [Recommendations]
 *     summary: Get AI-recommended programs for current user
 *     description: Get personalized program recommendations based on matriculation results AND user interests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Recommended programs retrieved successfully
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
 *                     matriculation:
 *                       $ref: '#/components/schemas/MatriculationResult'
 *                     eligiblePrograms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProgramWithUniversity'
 *                     totalEligible:
 *                       type: integer
 *                     recommendedPrograms:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/ProgramWithUniversity'
 *                           - type: object
 *                             properties:
 *                               matchScore:
 *                                 type: integer
 *                                 description: How well the program matches (0-100)
 *                               matchReasons:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 description: Reasons why this program is recommended
 *       400:
 *         description: Matriculation results not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/recommendations/suggested",
  authenticate,
  recommendationController.getRecommendedPrograms,
);

/**
 * @swagger
 * /api/recommendations/top:
 *   get:
 *     tags: [Recommendations]
 *     summary: Get top programs for current user
 *     description: Get the top N programs based on match score
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of top programs to return
 *     responses:
 *       200:
 *         description: Top programs retrieved successfully
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
 *                     matriculation:
 *                       $ref: '#/components/schemas/MatriculationResult'
 *                     topPrograms:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/ProgramWithUniversity'
 *                           - type: object
 *                             properties:
 *                               matchScore:
 *                                 type: integer
 *                     totalEligible:
 *                       type: integer
 *       400:
 *         description: Matriculation results not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/recommendations/top",
  authenticate,
  recommendationController.getTopPrograms,
);

/**
 * @swagger
 * /api/recommendations/compare:
 *   post:
 *     tags: [Recommendations]
 *     summary: Compare multiple programs
 *     description: Compare 2-5 programs side by side with eligibility check
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramComparison'
 *     responses:
 *       200:
 *         description: Program comparison retrieved successfully
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
 *                     programs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           nameMyanmar:
 *                             type: string
 *                             nullable: true
 *                           code:
 *                             type: string
 *                             nullable: true
 *                           university:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               location:
 *                                 type: string
 *                           minScore:
 *                             type: integer
 *                           quota:
 *                             type: integer
 *                             nullable: true
 *                           requirements:
 *                             $ref: '#/components/schemas/ProgramRequirement'
 *                           isEligible:
 *                             type: boolean
 *                           matchScore:
 *                             type: integer
 *                     userMatriculation:
 *                       type: object
 *                       properties:
 *                         totalScore:
 *                           type: integer
 *                         myanmar:
 *                           type: integer
 *                         english:
 *                           type: integer
 *                         mathematics:
 *                           type: integer
 *                         physics:
 *                           type: integer
 *                         chemistry:
 *                           type: integer
 *                         biology:
 *                           type: integer
 *                           nullable: true
 *       400:
 *         description: Validation error or matriculation not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/recommendations/compare",
  authenticate,
  validate(programComparisonSchema),
  recommendationController.comparePrograms,
);

export default router;
