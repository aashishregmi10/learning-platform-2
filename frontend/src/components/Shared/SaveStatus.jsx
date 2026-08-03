import { Box, CircularProgress, Typography } from "@mui/material";
import { CheckCircleOutlined, ErrorOutlineOutlined } from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";

/**
 * The quiet half of autosave: a teacher types, this says "Saved". It occupies
 * a fixed slot so the layout doesn't jump as it appears and fades.
 */
export const SaveStatus = ({ status }) => {
  const t = useT();

  const view = {
    saving: {
      icon: <CircularProgress size={13} thickness={6} sx={{ color: tokens.muted }} />,
      text: t("action.saving"),
      color: tokens.muted,
    },
    saved: {
      icon: <CheckCircleOutlined sx={{ fontSize: 15 }} />,
      text: t("action.saved"),
      color: statusTokens.success.fg,
    },
    error: {
      icon: <ErrorOutlineOutlined sx={{ fontSize: 15 }} />,
      text: t("action.saveFailed"),
      color: statusTokens.danger.fg,
    },
  }[status];

  return (
    <Box
      aria-live="polite"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.625,
        minHeight: 20,
        minWidth: 88,
        opacity: view ? 1 : 0,
        transition: "opacity .2s ease",
        color: view?.color,
      }}
    >
      {view?.icon}
      <Typography variant="caption" sx={{ color: "inherit", fontWeight: 600 }}>
        {view?.text}
      </Typography>
    </Box>
  );
};

export default SaveStatus;
