import { v4 as uuidv4 } from "uuid";
import { minioClient, MINIO_BUCKET } from "../../config/minio";
import { ApiError } from "../../common/utils/api-error";
import {
  UploadedFile,
  UploadResult,
  UploadFolder,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
} from "./upload.types";

/**
 * Generate a unique filename with original extension
 */
function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split(".").pop() || "";
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}.${extension}`;
}

/**
 * Get the public URL for a file
 */
export function getFileUrl(key: string): string {
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PORT || "9000";
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const protocol = useSSL ? "https" : "http";

  return `${protocol}://${endpoint}:${port}/${MINIO_BUCKET}/${key}`;
}

/**
 * Upload a single image file
 */
export async function uploadImage(
  file: UploadedFile,
  folder: UploadFolder = "misc",
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    );
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    throw ApiError.badRequest(
      `File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    );
  }

  const filename = generateUniqueFilename(file.originalname);
  const key = `${folder}/${filename}`;

  try {
    await minioClient.putObject(MINIO_BUCKET, key, file.buffer, file.size, {
      "Content-Type": file.mimetype,
      "x-amz-acl": "public-read",
    });

    return {
      url: getFileUrl(key),
      key,
      bucket: MINIO_BUCKET,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw ApiError.internal("Failed to upload file");
  }
}

/**
 * Upload a document file (image or PDF)
 */
export async function uploadDocument(
  file: UploadedFile,
  folder: UploadFolder = "documents",
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    throw ApiError.badRequest(
      `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
    );
  }

  // Validate file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw ApiError.badRequest(
      `File too large. Maximum size: ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
    );
  }

  const filename = generateUniqueFilename(file.originalname);
  const key = `${folder}/${filename}`;

  try {
    await minioClient.putObject(MINIO_BUCKET, key, file.buffer, file.size, {
      "Content-Type": file.mimetype,
      "x-amz-acl": "public-read",
    });

    return {
      url: getFileUrl(key),
      key,
      bucket: MINIO_BUCKET,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
    };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw ApiError.internal("Failed to upload file");
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: UploadedFile[],
  folder: UploadFolder = "misc",
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    await minioClient.removeObject(MINIO_BUCKET, key);
  } catch (error) {
    console.error("MinIO delete error:", error);
    throw ApiError.internal("Failed to delete file");
  }
}

/**
 * Delete multiple files from MinIO
 */
export async function deleteMultipleFiles(keys: string[]): Promise<void> {
  try {
    await minioClient.removeObjects(MINIO_BUCKET, keys);
  } catch (error) {
    console.error("MinIO delete error:", error);
    throw ApiError.internal("Failed to delete files");
  }
}

/**
 * Get a presigned URL for temporary access
 */
export async function getPresignedUrl(
  key: string,
  expirySeconds: number = 3600,
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(
      MINIO_BUCKET,
      key,
      expirySeconds,
    );
  } catch (error) {
    console.error("MinIO presigned URL error:", error);
    throw ApiError.internal("Failed to generate presigned URL");
  }
}

/**
 * Check if a file exists in MinIO
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await minioClient.statObject(MINIO_BUCKET, key);
    return true;
  } catch (error) {
    return false;
  }
}
