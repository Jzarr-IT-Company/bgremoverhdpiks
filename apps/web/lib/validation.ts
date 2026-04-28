export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload a PNG, JPG, JPEG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Please upload an image smaller than ${MAX_FILE_SIZE_MB} MB.`;
  }

  return null;
}
