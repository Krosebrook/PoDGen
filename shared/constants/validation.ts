/**
 * File Validation Configuration Constants
 * 
 * These constants define limits and validation rules for file uploads.
 */

/** Maximum file size in bytes (10 MB) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Maximum file size in megabytes for display purposes */
export const MAX_FILE_SIZE_MB = 10;

/** Allowed image MIME types for upload */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
] as const;

/** Allowed file extensions for image uploads */
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.heic',
] as const;

/** Maximum image dimension for upload validation */
export const MAX_IMAGE_DIMENSION = 4096;

/** Minimum image dimension to ensure quality */
export const MIN_IMAGE_DIMENSION = 64;
