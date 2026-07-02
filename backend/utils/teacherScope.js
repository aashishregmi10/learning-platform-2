import TeacherProfile from "../models/TeacherProfile.js";

/**
 * Returns the set of subject ids a teacher may write to. Admins get null
 * (meaning "no restriction"). Throws 403-style if a teacher has no profile.
 */
export const getWritableSubjectIds = async (user) => {
  if (user.role === "admin") return null; // unrestricted
  const profile = await TeacherProfile.findOne({ user: user._id }).select(
    "assignedSubjects"
  );
  return (profile?.assignedSubjects ?? []).map((id) => id.toString());
};

/** Assert a user may write to a given subject; throws with res.status set. */
export const assertSubjectWritable = async (user, subjectId, res) => {
  if (user.role === "admin") return;
  const allowed = await getWritableSubjectIds(user);
  if (!allowed.includes(subjectId.toString())) {
    res.status(403);
    throw new Error("You are not assigned to this subject");
  }
};
