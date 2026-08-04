import { Router } from "express";
import * as applicationController from "./application.controller";
import { validate } from "../../common/middleware";
import {
  createApplicationSchema,
  updateApplicationSchema,
  submitApplicationSchema,
  uploadDocumentsSchema,
  applicationIdSchema,
  reviewApplicationSchema,
  applicationFilterSchema,
} from "./application.validation";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

// ==================== User Application Routes ====================

/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Applications]
 *     summary: Create a new application
 *     description: Create a new university application (draft status). User must have completed profile and matriculation results.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstChoiceId
 *             properties:
 *               firstChoiceId:
 *                 type: integer
 *                 description: Program ID for first choice
 *               secondChoiceId:
 *                 type: integer
 *                 description: Program ID for second choice (optional)
 *               thirdChoiceId:
 *                 type: integer
 *                 description: Program ID for third choice (optional)
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         description: Validation error or user not eligible
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/applications",
  authenticate,
  validate(createApplicationSchema),
  applicationController.createApplication,
);

/**
 * @swagger
 * /api/applications:
 *   get:
 *     tags: [Applications]
 *     summary: Get my applications
 *     description: Get all applications for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApplicationResponse'
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/applications",
  authenticate,
  applicationController.getMyApplications,
);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Get application by ID
 *     description: Get a specific application by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your application
 *       404:
 *         description: Application not found
 */
router.get(
  "/applications/:id",
  authenticate,
  validate(applicationIdSchema, "params"),
  applicationController.getApplicationById,
);

/**
 * @swagger
 * /api/applications/{id}:
 *   patch:
 *     tags: [Applications]
 *     summary: Update application
 *     description: Update an application (only DRAFT status applications can be updated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstChoiceId:
 *                 type: integer
 *               secondChoiceId:
 *                 type: integer
 *                 nullable: true
 *               thirdChoiceId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Application updated successfully
 *       400:
 *         description: Cannot update non-draft application
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.patch(
  "/applications/:id",
  authenticate,
  validate(applicationIdSchema, "params"),
  validate(updateApplicationSchema),
  applicationController.updateApplication,
);

/**
 * @swagger
 * /api/applications/{id}/documents:
 *   post:
 *     tags: [Applications]
 *     summary: Upload documents for application
 *     description: Upload required documents (photo, NRC, certificates) for the application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of uploaded photo
 *               nrcFrontUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of NRC front image
 *               nrcBackUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of NRC back image
 *               matricCertificateUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of matriculation certificate
 *               recommendationUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of recommendation letter (optional)
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Invalid URLs or non-draft application
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.post(
  "/applications/:id/documents",
  authenticate,
  validate(applicationIdSchema, "params"),
  validate(uploadDocumentsSchema),
  applicationController.uploadDocuments,
);

/**
 * @swagger
 * /api/applications/{id}/submit:
 *   post:
 *     tags: [Applications]
 *     summary: Submit application
 *     description: Submit the application for review. All required documents must be uploaded and declaration must be accepted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - declarationAccepted
 *             properties:
 *               declarationAccepted:
 *                 type: boolean
 *                 description: Must be true to submit
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ApplicationResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing documents or declaration not accepted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.post(
  "/applications/:id/submit",
  authenticate,
  validate(applicationIdSchema, "params"),
  validate(submitApplicationSchema),
  applicationController.submitApplication,
);

/**
 * @swagger
 * /api/applications/{id}/withdraw:
 *   post:
 *     tags: [Applications]
 *     summary: Withdraw application
 *     description: Withdraw a submitted or under-review application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *       400:
 *         description: Cannot withdraw application with current status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.post(
  "/applications/:id/withdraw",
  authenticate,
  validate(applicationIdSchema, "params"),
  applicationController.withdrawApplication,
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     tags: [Applications]
 *     summary: Delete draft application
 *     description: Delete a draft application. Only DRAFT applications can be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       400:
 *         description: Only draft applications can be deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.delete(
  "/applications/:id",
  authenticate,
  validate(applicationIdSchema, "params"),
  applicationController.deleteApplication,
);

// ==================== Admin Application Routes ====================

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: Get all applications (Admin)
 *     description: Get all applications with optional filters. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WITHDRAWN]
 *         description: Filter by application status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: programId
 *         schema:
 *           type: integer
 *         description: Filter by program ID (any choice)
 *       - in: query
 *         name: universityId
 *         schema:
 *           type: integer
 *         description: Filter by university ID
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
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApplicationResponse'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/applications",
  authenticate,
  adminOnly,
  validate(applicationFilterSchema, "query"),
  applicationController.getAllApplications,
);

/**
 * @swagger
 * /api/admin/applications/stats:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: Get application statistics (Admin)
 *     description: Get application statistics including status counts and program popularity. Admin only.
 *     security:
 *       - bearerAuth: []
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
 *                   type: object
 *                   properties:
 *                     statusCounts:
 *                       type: object
 *                       properties:
 *                         DRAFT:
 *                           type: integer
 *                         SUBMITTED:
 *                           type: integer
 *                         UNDER_REVIEW:
 *                           type: integer
 *                         ACCEPTED:
 *                           type: integer
 *                         REJECTED:
 *                           type: integer
 *                         WITHDRAWN:
 *                           type: integer
 *                     totalApplications:
 *                       type: integer
 *                     recentApplications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ApplicationResponse'
 *                     programApplications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           code:
 *                             type: string
 *                           university:
 *                             type: string
 *                           quota:
 *                             type: integer
 *                           totalApplications:
 *                             type: integer
 *                           firstChoiceCount:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/applications/stats",
  authenticate,
  adminOnly,
  applicationController.getApplicationStats,
);

/**
 * @swagger
 * /api/admin/applications/{id}:
 *   get:
 *     tags: [Admin - Applications]
 *     summary: Get application by ID (Admin)
 *     description: Get detailed application information including user profile and matriculation. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Application not found
 */
router.get(
  "/admin/applications/:id",
  authenticate,
  adminOnly,
  validate(applicationIdSchema, "params"),
  applicationController.getApplicationByIdAdmin,
);

/**
 * @swagger
 * /api/admin/applications/{id}/review:
 *   post:
 *     tags: [Admin - Applications]
 *     summary: Review application (Admin)
 *     description: Review and update application status (accept/reject/under review). Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UNDER_REVIEW, ACCEPTED, REJECTED]
 *                 description: New status for the application
 *               acceptedProgramId:
 *                 type: integer
 *                 description: Required when status is ACCEPTED - must be one of the applicant's choices
 *               remarks:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Optional remarks for the applicant
 *               rejectionReason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Required when status is REJECTED
 *     responses:
 *       200:
 *         description: Application reviewed successfully
 *       400:
 *         description: Invalid status transition or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Application not found
 */
router.post(
  "/admin/applications/:id/review",
  authenticate,
  adminOnly,
  validate(applicationIdSchema, "params"),
  validate(reviewApplicationSchema),
  applicationController.reviewApplication,
);

export default router;
