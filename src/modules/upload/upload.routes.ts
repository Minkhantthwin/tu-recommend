import { Router } from "express";
import * as uploadController from "./upload.controller";
import * as uploadMiddleware from "./upload.middleware";
import { authenticate, adminOnly } from "../auth/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints for MinIO storage
 */

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload a profile photo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UploadResult'
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/profile",
  authenticate,
  uploadMiddleware.uploadProfilePhoto,
  uploadController.uploadProfilePhoto,
);

/**
 * @swagger
 * /api/upload/university/photo:
 *   post:
 *     summary: Upload a university photo (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: University photo (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/university/photo",
  authenticate,
  adminOnly,
  uploadMiddleware.uploadUniversityPhoto,
  uploadController.uploadUniversityPhoto,
);

/**
 * @swagger
 * /api/upload/university/logo:
 *   post:
 *     summary: Upload a university logo (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: University logo (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       201:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/university/logo",
  authenticate,
  adminOnly,
  uploadMiddleware.uploadUniversityLogo,
  uploadController.uploadUniversityLogo,
);

/**
 * @swagger
 * /api/upload/university/photos:
 *   post:
 *     summary: Upload multiple university photos (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photos
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: University photos (max 10 files, each max 5MB)
 *     responses:
 *       201:
 *         description: Photos uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post(
  "/university/photos",
  authenticate,
  adminOnly,
  uploadMiddleware.uploadUniversityPhotos,
  uploadController.uploadUniversityPhotos,
);

/**
 * @swagger
 * /api/upload/document:
 *   post:
 *     summary: Upload an application document
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file (JPEG, PNG, PDF - max 10MB)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/document",
  authenticate,
  uploadMiddleware.uploadSingleDocument,
  uploadController.uploadDocument,
);

/**
 * @swagger
 * /api/upload/documents:
 *   post:
 *     summary: Upload multiple application documents
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files (max 5 files, each max 10MB)
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/documents",
  authenticate,
  uploadMiddleware.uploadMultipleDocuments,
  uploadController.uploadDocuments,
);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a generic image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           enum: [profiles, universities, documents, misc]
 *         description: Target folder for the upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/image",
  authenticate,
  uploadMiddleware.uploadSingleImage,
  uploadController.uploadImage,
);

/**
 * @swagger
 * /api/upload/presigned/{key}:
 *   get:
 *     summary: Get a presigned URL for temporary file access
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The file key (URL encoded)
 *       - in: query
 *         name: expiry
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: URL expiry time in seconds (default 1 hour)
 *     responses:
 *       200:
 *         description: Presigned URL generated
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
 *                     url:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/presigned/:key(*)",
  authenticate,
  uploadController.getPresignedUrl,
);

/**
 * @swagger
 * /api/upload/{key}:
 *   delete:
 *     summary: Delete a file (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The file key to delete (URL encoded)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete("/:key(*)", authenticate, uploadController.deleteFile);

export default router;
