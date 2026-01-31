export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export type UploadFolder =
  | "profiles" // User profile photos
  | "universities" // University photos and logos
  | "documents" // Application documents (NRC, certificates)
  | "misc"; // Other uploads

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
