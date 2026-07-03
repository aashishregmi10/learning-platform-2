import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// The SDK auto-reads CLOUDINARY_URL; force secure (https) delivery.
cloudinary.config({ secure: true });

const FOLDER = "bsc-nepal";

/** Upload a buffer as an AUTHENTICATED asset (not publicly deliverable). */
export const uploadBuffer = (buffer, { resourceType = "auto", folder = FOLDER } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, type: "authenticated", folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * Upload a buffer as a PUBLIC asset — for cover images that must render in a
 * plain <img src> for anonymous visitors (e.g. subject thumbnails), unlike
 * paid media which stays behind signed URLs via uploadBuffer above.
 */
export const uploadPublicImage = (buffer, { folder = `${FOLDER}/subjects` } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/**
 * Mint a signed, short-TTL delivery URL for an authenticated asset.
 * The signature can't be forged, so paid media isn't publicly guessable.
 */
export const signedDeliveryUrl = (
  publicId,
  { resourceType = "image", expiresInSeconds = 300, attachment = false } = {}
) => {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.utils.private_download_url(publicId, null, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: expiresAt,
    attachment,
  });
};

/** Inline signed URL (for players) — signed, non-expiring but unforgeable. */
export const signedInlineUrl = (publicId, { resourceType = "video" } = {}) =>
  cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    sign_url: true,
    secure: true,
  });

export const destroyAsset = (publicId, resourceType = "image") =>
  cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "authenticated",
  });

export default cloudinary;
