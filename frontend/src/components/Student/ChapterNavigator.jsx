import { Box, LinearProgress, Typography } from "@mui/material";
import {
  CheckCircle,
  LockOutlined,
  PlayCircleFilled,
  RadioButtonUncheckedOutlined,
} from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";

/**
 * Course navigator — the right-hand rail beside the lesson.
 *
 * It sits on the right rather than the left so the left edge of the reading
 * column is flush against the app chrome, and the lesson keeps the optical
 * centre of the screen.
 *
 * Status is carried by ONE icon per row (done / current / locked) instead of a
 * different colour per content type — a wall of green, amber and red icons was
 * the main thing making this page feel like a free app.
 */
const StatusIcon = ({ done, active, locked }) => {
  if (locked) return <LockOutlined sx={{ fontSize: 17, color: tokens.faint }} />;
  if (done) return <CheckCircle sx={{ fontSize: 17, color: statusTokens.success.solid }} />;
  if (active) return <PlayCircleFilled sx={{ fontSize: 17, color: tokens.ink }} />;
  return <RadioButtonUncheckedOutlined sx={{ fontSize: 17, color: tokens.borderStrong }} />;
};

const Tag = ({ label, tone }) => (
  <Box
    component="span"
    sx={{
      flexShrink: 0,
      px: 0.75,
      py: "1px",
      borderRadius: 1,
      fontSize: "0.65rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      bgcolor: tone.bg,
      color: tone.fg,
    }}
  >
    {label}
  </Box>
);

const ChapterNavigator = ({ chapters, activeId, onSelect, progress, completion }) => (
  <Box
    sx={{
      width: { xs: "100%", lg: 320 },
      flexShrink: 0,
      alignSelf: "flex-start",
      position: { lg: "sticky" },
      top: { lg: 88 },
      maxHeight: { lg: "calc(100vh - 112px)" },
      overflowY: { lg: "auto" },
      bgcolor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 3,
    }}
  >
    {/* Progress — a real bar with a real number, not a footnote */}
    <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.border}` }}>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.25 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, letterSpacing: "0.07em", color: tokens.muted }}
        >
          COURSE PROGRESS
        </Typography>
        <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1, color: tokens.ink }}>
          {completion.percent}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={completion.percent}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: tokens.surfaceMuted,
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            bgcolor: completion.percent === 100 ? statusTokens.success.solid : tokens.ink,
          },
        }}
      />
      <Typography variant="caption" sx={{ display: "block", mt: 1, color: tokens.muted }}>
        {completion.done} of {completion.total} lessons complete
      </Typography>
    </Box>

    {chapters.map((ch) => {
      const rows = [
        ...ch.items.map((i) => ({ ...i, kind: i.type })),
        ...(ch.quizzes ?? []).map((q) => ({ ...q, kind: "quiz" })),
      ];

      return (
        <Box key={ch._id} sx={{ borderBottom: `1px solid ${tokens.border}`, "&:last-child": { border: 0 } }}>
          <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: tokens.muted, letterSpacing: "0.05em" }}
            >
              CHAPTER {ch.chapterNumber}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: tokens.ink, mt: 0.25 }}>
              {ch.title}
            </Typography>
          </Box>

          <Box sx={{ pb: 1.5 }}>
            {rows.map((row) => {
              const done = !!progress[row._id]?.isCompleted;
              const active = row._id === activeId;

              return (
                <Box
                  key={row._id}
                  onClick={() => !row.locked && onSelect(row)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    px: 2.5,
                    // Room to breathe — titles wrap to two lines instead of
                    // being truncated into uselessness.
                    py: 1.25,
                    cursor: row.locked ? "not-allowed" : "pointer",
                    borderLeft: `3px solid ${active ? tokens.ink : "transparent"}`,
                    bgcolor: active ? tokens.surfaceMuted : "transparent",
                    "&:hover": { bgcolor: row.locked ? "transparent" : tokens.surfaceMuted },
                  }}
                >
                  <Box sx={{ mt: "1px", flexShrink: 0, display: "flex" }}>
                    <StatusIcon done={done} active={active} locked={row.locked} />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      fontSize: "0.83rem",
                      lineHeight: 1.45,
                      color: row.locked ? tokens.faint : active ? tokens.ink : tokens.body,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {row.title}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 0.5, mt: "1px" }}>
                    {row.kind === "quiz" && <Tag label="QUIZ" tone={statusTokens.warning} />}
                    {row.isFree && <Tag label="FREE" tone={statusTokens.success} />}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    })}
  </Box>
);

export default ChapterNavigator;
