import { useMemo } from "react";
import { Box } from "@mui/material";
import DOMPurify from "dompurify";

import { tokens } from "../../theme";

/**
 * Renders a note body.
 *
 * This is the ONLY place note HTML is turned into pixels — the teacher's
 * preview and the student's reader both go through it, so "what you see is
 * what they get" is a property of the code rather than a promise. If you change
 * how notes look, both sides move together.
 *
 * The HTML is author-generated (staff only), but a compromised teacher account
 * must not be able to run script on a student's page, so everything is
 * sanitised on the way out with a narrow tag/attribute allowlist.
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

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class"];

export const sanitizeNote = (html) =>
  DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // No inline styles: placement is expressed with the align-* classes below,
    // which keeps a stray `position:fixed` from escaping the note.
    FORBID_ATTR: ["style", "onerror", "onload"],
    ADD_ATTR: ["target"],
  });

/** Shared look for note bodies, including how images sit in the text. */
export const richTextSx = {
  color: tokens.body,
  lineHeight: 1.7,
  fontSize: "1rem",
  wordBreak: "break-word",
  "& > *:first-of-type": { marginTop: 0 },
  "& > *:last-child": { marginBottom: 0 },
  "& h1, & h2, & h3, & h4": {
    color: tokens.ink,
    lineHeight: 1.3,
    marginTop: "1.4em",
    marginBottom: "0.5em",
  },
  "& h1": { fontSize: "1.5rem" },
  "& h2": { fontSize: "1.25rem" },
  "& h3": { fontSize: "1.1rem" },
  "& p": { margin: "0 0 1em" },
  "& ul, & ol": { paddingLeft: "1.4em", margin: "0 0 1em" },
  "& li": { margin: "0.3em 0" },
  "& a": { color: "var(--primary)" },
  "& blockquote": {
    margin: "0 0 1em",
    padding: "0.5em 1em",
    borderLeft: `3px solid ${tokens.borderStrong}`,
    color: tokens.muted,
  },
  "& code": {
    fontFamily: "monospace",
    background: tokens.surfaceMuted,
    padding: "0.1em 0.35em",
    borderRadius: 4,
    fontSize: "0.9em",
  },
  "& table": { borderCollapse: "collapse", width: "100%", margin: "0 0 1em" },
  "& th, & td": { border: `1px solid ${tokens.border}`, padding: "6px 10px", textAlign: "left" },
  "& th": { background: tokens.surfaceMuted },

  // --- image placement -----------------------------------------------------
  // Teachers choose one of three placements; these classes are what the editor
  // writes and what the student page reads.
  "& img": {
    maxWidth: "100%",
    height: "auto",
    borderRadius: 8,
    display: "block",
    margin: "1em 0",
  },
  "& img.align-left": {
    float: "left",
    maxWidth: "45%",
    margin: "0.3em 1.2em 0.8em 0",
  },
  "& img.align-right": {
    float: "right",
    maxWidth: "45%",
    margin: "0.3em 0 0.8em 1.2em",
  },
  "& img.align-center": { marginInline: "auto" },
  // Stop a floated image bleeding past the end of the note.
  "&::after": { content: '""', display: "table", clear: "both" },

  "@media (max-width: 600px)": {
    "& img.align-left, & img.align-right": {
      float: "none",
      maxWidth: "100%",
      marginInline: 0,
    },
  },
};

export const RichText = ({ html, sx }) => {
  const clean = useMemo(() => sanitizeNote(html), [html]);

  return (
    <Box
      sx={{ ...richTextSx, ...sx }}
      // Sanitised directly above with a narrow allowlist.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default RichText;
