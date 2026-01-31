/* eslint-disable @typescript-eslint/no-explicit-any */
import multer from "multer";
import { ApiError } from "../../common/utils/api-error";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
} from "./upload.types";

// Use memory storage for MinIO uploads
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      ),
    );
  }
};

// File filter for documents (images + PDF)
const documentFileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type. Allowed: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
      ),
    );
  }
};

// Multer instance for single image upload
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("image");

// Multer instance for multiple images upload
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 10, // Maximum 10 files
  },
}).array("images", 10);

// Multer instance for single document upload
export const uploadSingleDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
}).single("document");

// Multer instance for multiple documents upload
export const uploadMultipleDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 5, // Maximum 5 files
  },
}).array("documents", 5);

// Multer instance for profile photo
export const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("photo");

// Multer instance for university photo
export const uploadUniversityPhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("photo");

// Multer instance for university logo
export const uploadUniversityLogo = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
}).single("logo");

// Multer instance for multiple university photos
export const uploadUniversityPhotos = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 10,
  },
}).array("photos", 10);
