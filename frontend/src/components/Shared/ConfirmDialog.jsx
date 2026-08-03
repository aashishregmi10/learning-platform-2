import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { WarningAmberOutlined } from "@mui/icons-material";

import { useT } from "../../i18n/LanguageContext";
import { statusTokens, tokens } from "../../theme";

/**
 * Destructive-action guard. Nothing in the teacher UI deletes without one of
 * these, and it always names the exact thing being deleted — "Delete '1.3
 * Matter Waves'?" tells a teacher whether they clicked the row they meant.
 *
 * The confirm button is red and the cancel button is the wider, calmer one, so
 * a mis-tap lands on the safe option.
 */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  itemName,
  title,
  body,
  confirmLabel,
  busy = false,
}) => {
  const t = useT();

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "1.05rem" }}>
        <WarningAmberOutlined sx={{ color: statusTokens.danger.solid }} />
        {title || t("confirm.title")}
      </DialogTitle>
      <DialogContent>
        {itemName && (
          <Typography
            sx={{
              fontWeight: 700,
              color: tokens.ink,
              bgcolor: tokens.surfaceMuted,
              border: `1px solid ${tokens.border}`,
              borderRadius: 2,
              px: 1.5,
              py: 1.25,
              mb: 1.5,
              wordBreak: "break-word",
            }}
          >
            {itemName}
          </Typography>
        )}
        {body && (
          <Typography variant="body2" sx={{ color: tokens.body, mb: 0.5 }}>
            {body}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: statusTokens.danger.fg, fontWeight: 600 }}>
          {t("confirm.cannotUndo")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} variant="outlined" sx={{ flex: 1 }}>
          {t("action.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={busy}
          variant="contained"
          sx={{
            bgcolor: statusTokens.danger.solid,
            "&:hover": { bgcolor: statusTokens.danger.fg },
          }}
        >
          {confirmLabel || t("action.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
