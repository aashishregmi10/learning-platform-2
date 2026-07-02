import multer from "multer";

// In-memory storage — we stream the buffer straight to Cloudinary.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB cap for videos
});
