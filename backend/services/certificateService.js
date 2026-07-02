import Chapter from "../models/Chapter.js";
import Content from "../models/Content.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";

const genCertNumber = () => {
  const d = new Date();
  return `BSC-CERT-${d.getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
};

/** Fraction (0..1) of a subject's published content the student has completed. */
export const subjectCompletion = async (studentId, subjectId) => {
  const chapters = await Chapter.find({ subject: subjectId, isPublished: true, isDeleted: false }).select("_id");
  const chapterIds = chapters.map((c) => c._id);
  const total = await Content.countDocuments({ chapter: { $in: chapterIds }, isPublished: true, isDeleted: false });
  if (total === 0) return { total: 0, done: 0, percent: 0 };

  const contentIds = (await Content.find({ chapter: { $in: chapterIds }, isPublished: true, isDeleted: false }).select("_id")).map((c) => c._id);
  const done = await Progress.countDocuments({ student: studentId, content: { $in: contentIds }, isCompleted: true });
  return { total, done, percent: Math.round((done / total) * 100) };
};

/**
 * Issue a certificate once the student has completed 100% of a subject.
 * Idempotent (unique student+subject). Returns the certificate or null.
 */
export const maybeIssueCertificate = async ({ studentId, subjectId }) => {
  const existing = await Certificate.findOne({ student: studentId, subject: subjectId });
  if (existing) return existing;

  const { percent, total } = await subjectCompletion(studentId, subjectId);
  if (total === 0 || percent < 100) return null;

  return Certificate.create({
    student: studentId,
    subject: subjectId,
    certificateNumber: genCertNumber(),
    completionPercentage: 100,
  });
};
