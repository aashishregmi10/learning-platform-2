import { Chip } from "@mui/material";

import { statusTokens } from "../../theme";
import { roleFor } from "../../utils/statusRole";

/** Sentence-case a raw API status: "pending" → "Pending". */
const humanize = (s) =>
  String(s ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/**
 * The status badge for the whole app.
 *
 *   <StatusBadge status={order.status} />          resolves role + label
 *   <StatusBadge status="published" label="Live" /> keeps the role, own wording
 *   <StatusBadge role="danger" label="0 revenue" /> explicit role
 *
 * Pass `dot` for the small filled circle used in dense lists and sidebars.
 */
export const StatusBadge = ({ status, role, label, size = "small", dot = false, sx }) => {
  const tone = statusTokens[role ?? roleFor(status)] ?? statusTokens.neutral;
  const text = label ?? humanize(status);

  return (
    <Chip
      size={size}
      label={text}
      icon={
        dot ? (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: tone.solid,
              marginLeft: 8,
              marginRight: -2,
            }}
          />
        ) : undefined
      }
      sx={{ bgcolor: tone.bg, color: tone.fg, border: "none", ...sx }}
    />
  );
};

export default StatusBadge;
