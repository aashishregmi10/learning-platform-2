import mongoose from "mongoose";

/**
 * True if the student currently has an active entitlement for the subject.
 * The Entitlement model lands in Part 3; until then this safely returns false
 * (so only free/free-preview content is reachable).
 */
export const hasActiveEntitlement = async (studentId, subjectId) => {
  const Entitlement = mongoose.models.Entitlement;
  if (!Entitlement) return false;
  const exists = await Entitlement.exists({
    student: studentId,
    subject: subjectId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
  return !!exists;
};

/**
 * THE single access rule, used by every content/live endpoint:
 *   free content OR free-preview chapter OR active entitlement.
 * `content` and `chapter` are plain docs; `chapter.subject` is the subject id.
 */
export const canAccessContent = async ({ content, chapter, studentId }) => {
  if (content?.isFree) return true;
  if (chapter?.isFreePreview) return true;
  if (!studentId) return false;
  return hasActiveEntitlement(studentId, chapter.subject);
};

/** Chapter-level access (for quizzes, which attach to a chapter). */
export const canAccessChapter = async ({ chapter, studentId }) => {
  if (chapter?.isFreePreview) return true;
  if (!studentId) return false;
  return hasActiveEntitlement(studentId, chapter.subject);
};
