import mongoose from "mongoose";

const { Schema } = mongoose;

const ContentSchema = new Schema(
  {
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["video", "pdf", "note", "audio", "link"],
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    order: { type: Number, default: 0 }, // sequence within the chapter

    // Processing lifecycle (distinct from isDeleted).
    status: {
      type: String,
      enum: ["uploading", "processing", "ready", "failed"],
      default: "uploading",
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // Private storage reference — NEVER a public URL. The API mints a
    // short-TTL signed URL per playback/download from this key.
    storage: {
      provider: {
        type: String,
        enum: ["cloudinary", "s3", "cloudflare-stream", "gumlet", "bunny", "local"],
        default: "cloudinary",
      },
      fileKey: { type: String }, // Cloudinary public_id
      resourceType: { type: String }, // image | video | raw (cloudinary)
      fileSize: { type: Number },
      fileFormat: { type: String },
    },

    videoData: {
      durationSeconds: { type: Number },
      resolution: { type: String },
      thumbnailUrl: { type: String }, // poster image — ok to be public
      subtitlesUrl: { type: String },
      watermarkEnabled: { type: Boolean, default: true },
    },

    pdfData: {
      pageCount: { type: Number },
      previewUrl: { type: String },
      isDownloadable: { type: Boolean, default: false },
    },

    noteData: {
      content: { type: String }, // rich text / markdown
      isDownloadable: { type: Boolean, default: true },
    },

    // Standalone free item, outside a free-preview chapter.
    isFree: { type: Boolean, default: false },

    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

ContentSchema.index({ chapter: 1, type: 1 });
ContentSchema.index({ chapter: 1, order: 1 });
ContentSchema.index({ uploadedBy: 1 });

export default mongoose.model("Content", ContentSchema);
