/**
 * Small request-shape guards.
 *
 * express-mongo-sanitize already neuters `$`-operators, but a body like
 * `{ email: { $ne: null } }` still arrives as an OBJECT — which then blows up
 * somewhere downstream as a 500 TypeError instead of being rejected cleanly.
 * These assert the type first so bad input fails as a 422 with a useful
 * message, and controllers can assume they're holding strings.
 */

/** Assert a value is a non-empty string; returns it trimmed. */
export const requireString = (value, field, res, { max = 500 } = {}) => {
  if (typeof value !== "string" || !value.trim()) {
    res.status(422);
    throw new Error(`${field} is required`);
  }
  if (value.length > max) {
    res.status(422);
    throw new Error(`${field} is too long`);
  }
  return value.trim();
};

/** Same, but tolerates absence — returns undefined when not provided. */
export const optionalString = (value, field, res, { max = 500 } = {}) => {
  if (value === undefined || value === null || value === "") return undefined;
  return requireString(value, field, res, { max });
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireEmail = (value, res) => {
  const email = requireString(value, "email", res, { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    res.status(422);
    throw new Error("That doesn't look like a valid email address");
  }
  return email;
};
