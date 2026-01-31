import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils";
import { sendSuccess, sendCreated } from "../../common/utils/api-response";
import { ApiError } from "../../common/utils/api-error";
import * as uploadService from "./upload.service";
import { UploadedFile, UploadFolder } from "./upload.types";

/**
 * Upload a single profile photo
 * POST /api/upload/profile
 */
export const uploadProfilePhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const result = await uploadService.uploadImage(
      file as UploadedFile,
      "profiles",
    );

    sendCreated(res, result, "Profile photo uploaded successfully");
  },
);

/**
 * Upload a university photo
 * POST /api/upload/university/photo
 */
export const uploadUniversityPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const result = await uploadService.uploadImage(
      file as UploadedFile,
      "universities",
    );

    sendCreated(res, result, "University photo uploaded successfully");
  },
);

/**
 * Upload a university logo
 * POST /api/upload/university/logo
 */
export const uploadUniversityLogo = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const result = await uploadService.uploadImage(
      file as UploadedFile,
      "universities",
    );

    sendCreated(res, result, "University logo uploaded successfully");
  },
);

/**
 * Upload multiple university photos
 * POST /api/upload/university/photos
 */
export const uploadUniversityPhotos = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req as any).files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw ApiError.badRequest("No files uploaded");
    }

    const results = await uploadService.uploadMultipleImages(
      files as UploadedFile[],
      "universities",
    );

    sendCreated(res, results, "University photos uploaded successfully");
  },
);

/**
 * Upload an application document (NRC, certificate, etc.)
 * POST /api/upload/document
 */
export const uploadDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const result = await uploadService.uploadDocument(
      file as UploadedFile,
      "documents",
    );

    sendCreated(res, result, "Document uploaded successfully");
  },
);

/**
 * Upload multiple application documents
 * POST /api/upload/documents
 */
export const uploadDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req as any).files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw ApiError.badRequest("No files uploaded");
    }

    const results = await Promise.all(
      (files as UploadedFile[]).map((file) =>
        uploadService.uploadDocument(file, "documents"),
      ),
    );

    sendCreated(res, results, "Documents uploaded successfully");
  },
);

/**
 * Upload a generic image
 * POST /api/upload/image
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    throw ApiError.badRequest("No file uploaded");
  }

  const folder = (req.query.folder as UploadFolder) || "misc";
  const result = await uploadService.uploadImage(file as UploadedFile, folder);

  sendCreated(res, result, "Image uploaded successfully");
});

/**
 * Delete a file
 * DELETE /api/upload/:key
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  if (!key) {
    throw ApiError.badRequest("File key is required");
  }

  // URL decode the key (in case it contains slashes)
  const decodedKey = decodeURIComponent(key);

  const exists = await uploadService.fileExists(decodedKey);
  if (!exists) {
    throw ApiError.notFound("File not found");
  }

  await uploadService.deleteFile(decodedKey);

  sendSuccess(res, null, 200, "File deleted successfully");
});

/**
 * Get a presigned URL for a file
 * GET /api/upload/presigned/:key
 */
export const getPresignedUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { key } = req.params;
    const expiry = parseInt(req.query.expiry as string) || 3600;

    if (!key) {
      throw ApiError.badRequest("File key is required");
    }

    const decodedKey = decodeURIComponent(key);

    const exists = await uploadService.fileExists(decodedKey);
    if (!exists) {
      throw ApiError.notFound("File not found");
    }

    const url = await uploadService.getPresignedUrl(decodedKey, expiry);

    sendSuccess(
      res,
      { url, expiresIn: expiry },
      200,
      "Presigned URL generated",
    );
  },
);
