import sanitize from "sanitize-html";

/**
 * Server-side sanitisation of teacher-authored note bodies.
 *
 * The React reader already runs DOMPurify, but that only protects THIS client.
 * Anything else that consumes the API — a future mobile app, an export, an
 * email digest, or simply a browser with JS quirks — would receive whatever
 * was stored. Sanitising on write means the database never holds an executable
 * payload in the first place, so the render-time pass is a second layer rather
 * than the only one.
 *
 * The allowlist is deliberately the same shape as the client's, so a teacher
 * never sees formatting silently disappear between saving and reading.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "code", "pre",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "span", "div",
];

export const sanitizeNoteHtml = (html) => {
  if (typeof html !== "string") return "";

  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "class"],
      "*": ["class"],
    },
    // http/https only: blocks javascript: and data: URI payloads.
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Inline styles are never needed — image placement uses align-* classes.
    allowedStyles: {},
    // Anything opening a new tab must not hand over window.opener.
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
    disallowedTagsMode: "discard",
  });
};

export default sanitizeNoteHtml;
