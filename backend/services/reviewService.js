import Review from "../models/Review.js";
import Subject from "../models/Subject.js";
import TeacherProfile from "../models/TeacherProfile.js";

/** Recompute the cached ratingAverage/ratingCount for a subject or teacher target. */
export const recomputeRating = async ({ targetType, subjectId, teacherId }) => {
  const match =
    targetType === "subject"
      ? { targetType: "subject", subject: subjectId, isVisible: true }
      : { targetType: "teacher", teacher: teacherId, isVisible: true };

  const [stats] = await Review.aggregate([
    { $match: match },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const ratingAverage = stats ? Math.round(stats.average * 10) / 10 : 0;
  const ratingCount = stats?.count ?? 0;

  if (targetType === "subject") {
    await Subject.findByIdAndUpdate(subjectId, { ratingAverage, ratingCount });
  } else {
    await TeacherProfile.findOneAndUpdate({ user: teacherId }, { ratingAverage, ratingCount });
  }
};

/** Rating distribution ({5:40,4:12,...}) + summary for a subject or teacher's visible reviews. */
export const ratingSummary = async ({ targetType, subjectId, teacherId }) => {
  const match =
    targetType === "subject"
      ? { targetType: "subject", subject: subjectId, isVisible: true }
      : { targetType: "teacher", teacher: teacherId, isVisible: true };

  const rows = await Review.aggregate([{ $match: match }, { $group: { _id: "$rating", count: { $sum: 1 } } }]);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  rows.forEach((r) => {
    distribution[r._id] = r.count;
    total += r.count;
    sum += r._id * r.count;
  });

  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total, distribution };
};
