import { statusTokens } from "../theme";

/**
 * The one place a domain status becomes a colour.
 *
 * Every status string the API can return maps to exactly one of the five
 * semantic roles. Before this existed the same mapping was copy-pasted into
 * seven `STATUS_COLOR` objects that had already drifted apart (a live class was
 * green in one screen and red in another), so add new statuses here — never
 * inline at the call site.
 */
const ROLE_BY_STATUS = {
  // Publishing / availability
  published: "success",
  active: "success",
  approved: "success",
  ready: "success",
  live: "success",
  enrolled: "success",
  resolved: "success",
  paid: "success",
  completed: "success",
  verified: "success",

  // Needs someone to act
  draft: "warning",
  unpublished: "warning",
  pending: "warning",
  "pending approval": "warning",
  expired: "warning",
  uploading: "warning",
  processing_content: "warning",
  overdue: "warning",

  // Went wrong or was undone
  failed: "danger",
  error: "danger",
  cancelled: "danger",
  canceled: "danger",
  refunded: "danger",
  inactive: "danger",
  suspended: "danger",
  rejected: "danger",

  // Informational, in-flight, no judgement attached
  processing: "info",
  "free preview": "info",
  free: "info",

  // Descriptive states that carry no good/bad signal
  scheduled: "neutral",
  ended: "neutral",
  upcoming: "neutral",
  off: "neutral",
  archived: "neutral",
};

/** Resolve a status string to a role name. Unknown statuses read as neutral. */
export const roleFor = (status, fallback = "neutral") =>
  ROLE_BY_STATUS[String(status ?? "").trim().toLowerCase()] ?? fallback;

/** Resolve a status string straight to its { bg, fg, solid } triple. */
export const toneFor = (status, fallback = "neutral") => statusTokens[roleFor(status, fallback)];

/** Role for a boolean flag — the isActive / isPublished pattern used all over. */
export const roleForFlag = (on, { onRole = "success", offRole = "warning" } = {}) =>
  on ? onRole : offRole;

export default roleFor;
