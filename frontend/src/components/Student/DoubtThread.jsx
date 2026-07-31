import { useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import { ThumbUpOutlined } from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";
import { useUpvoteDoubtMutation, useResolveDoubtMutation } from "../../store/services/doubtApi";
import DoubtComposer from "./DoubtComposer";

const linkButtonSx = {
  minWidth: 0,
  p: 0,
  fontSize: "0.75rem",
  fontWeight: 500,
  color: tokens.muted,
  "&:hover": { background: "none", color: tokens.ink },
};

const DoubtRow = ({ doubt, chapter, liveClass, canResolve, reply = false }) => {
  const [upvote] = useUpvoteDoubtMutation();
  const [resolve] = useResolveDoubtMutation();
  const [replying, setReplying] = useState(false);

  return (
    <Box
      sx={{
        ml: reply ? 3 : 0,
        mt: reply ? 1 : 1.5,
        pt: reply ? 0 : 1.5,
        borderTop: reply ? "none" : `1px solid ${tokens.border}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box>
          <Typography component="span" variant="subtitle2">
            {doubt.author?.name}
          </Typography>{" "}
          <Typography component="span" variant="caption">
            {doubt.author?.role}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25, color: tokens.body }}>
            {doubt.content}
          </Typography>
        </Box>
        {doubt.isResolved && (
          <Chip
            size="small"
            label="Resolved"
            sx={{ bgcolor: statusTokens.success.bg, color: statusTokens.success.fg, flexShrink: 0 }}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 0.75, alignItems: "center" }}>
        <Button
          size="small"
          disableRipple
          startIcon={<ThumbUpOutlined sx={{ fontSize: 14 }} />}
          onClick={() => upvote(doubt._id)}
          sx={linkButtonSx}
        >
          {doubt.upvoteCount || 0}
        </Button>
        {!reply && (
          <Button size="small" disableRipple onClick={() => setReplying((s) => !s)} sx={linkButtonSx}>
            Reply
          </Button>
        )}
        {!reply && canResolve && !doubt.isResolved && (
          <Button
            size="small"
            disableRipple
            onClick={() => resolve(doubt._id)}
            sx={{ ...linkButtonSx, color: statusTokens.success.fg }}
          >
            Mark resolved
          </Button>
        )}
      </Box>

      {replying && (
        <Box sx={{ mt: 1, ml: 3 }}>
          <DoubtComposer
            chapter={chapter}
            liveClass={liveClass}
            parentDoubt={doubt._id}
            placeholder="Reply…"
            onDone={() => setReplying(false)}
          />
        </Box>
      )}

      {doubt.replies?.map((r) => (
        <DoubtRow
          key={r._id}
          doubt={r}
          chapter={chapter}
          liveClass={liveClass}
          canResolve={canResolve}
          reply
        />
      ))}
    </Box>
  );
};

const DoubtThread = ({ doubts, chapter, liveClass, canResolve = false, emptyText }) => {
  if (!doubts || doubts.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: tokens.muted }}>
        {emptyText || "No questions yet — ask the first one."}
      </Typography>
    );
  }
  return (
    <Box>
      {doubts.map((d) => (
        <DoubtRow
          key={d._id}
          doubt={d}
          chapter={chapter}
          liveClass={liveClass}
          canResolve={canResolve}
        />
      ))}
    </Box>
  );
};

export default DoubtThread;
