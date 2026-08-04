import multer from "multer";

/**
 * Uploads are held in memory and streamed straight to Cloudinary — nothing
 * ever touches our disk, so a path-traversal filename can't hurt us.
 *
 * Two things this guards against:
 *  - MIME allowlist: multer's `mimetype` comes from the client and is only a
 *    first filter; Cloudinary re-derives the real type on ingest and rejects
 *    mismatches, so this pair means a .exe renamed to .pdf fails one or both.
 *  - Size cap per kind: a single 500MB in-memory buffer per request was an
 *    easy way to exhaust the process. Video still needs headroom, but images
 *    and PDFs are held to something sane.
 */
const ALLOWED = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  document: ["application/pdf"],
  video: ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"],
};

const ALL_ALLOWED = Object.values(ALLOWED).flat();

const fileFilter = (allowed) => (req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  const err = new Error(`Unsupported file type: ${file.mimetype}`);
  err.status = 422;
  cb(err);
};

/** General upload — any supported media. Capped at 300MB for video. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter(ALL_ALLOWED),
});

/** Images only (note pictures, subject covers, avatars). 8MB is plenty. */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter(ALLOWED.image),
});

export default upload;
