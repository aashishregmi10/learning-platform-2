import { Box, Collapse, LinearProgress, Typography } from "@mui/material";
import {
  CheckCircle,
  ExpandMoreOutlined,
  HeadphonesOutlined,
  LinkOutlined,
  LockOutlined,
  NotesOutlined,
  PictureAsPdfOutlined,
  PlayCircleOutlined,
  QuizOutlined,
} from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";

const TYPE_ICON = {
  video: PlayCircleOutlined,
  pdf: PictureAsPdfOutlined,
  note: NotesOutlined,
  link: LinkOutlined,
  audio: HeadphonesOutlined,
  quiz: QuizOutlined,
};

/**
 * The course navigation rail — the spine of the reading experience.
 *
 * A paying student should always know where they are, what's left, and be one
 * click from any lesson. The old screen buried this in accordions that closed
 * every time you opened a lesson in a modal.
 */
const LessonRail = ({
  chapters,
  activeId,
  onSelect,
  progress,
  completion,
  openChapters,
  onToggleChapter,
  subjectName,
}) => (
  <Box
    sx={{
      width: { xs: "100%", md: 320 },
      flexShrink: 0,
      borderRight: { md: `1px solid ${tokens.border}` },
      bgcolor: tokens.surface,
      alignSelf: "flex-start",
      position: { md: "sticky" },
      top: { md: 88 },
      maxHeight: { md: "calc(100vh - 112px)" },
      overflowY: { md: "auto" },
      borderRadius: 3,
      border: { xs: `1px solid ${tokens.border}`, md: undefined },
    }}
  >
    {/* Progress header */}
    <Box sx={{ p: 2.5, borderBottom: `1px solid ${tokens.border}` }}>
      <Typography variant="caption" sx={{ color: tokens.muted, fontWeight: 700, letterSpacing: "0.06em" }}>
        YOUR PROGRESS
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5, mb: 1.25 }}>
        <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
          {completion.percent}%
        </Typography>
        <Typography variant="caption" sx={{ color: tokens.muted }}>
          {completion.done} of {completion.total} lessons
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={completion.percent}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: tokens.surfaceMuted,
          "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: statusTokens.success.solid },
        }}
      />
      <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: tokens.muted }} noWrap>
        {subjectName}
      </Typography>
    </Box>

    {chapters.map((ch) => {
      const rows = [
        ...ch.items.map((i) => ({ ...i, kind: i.type })),
        ...(ch.quizzes ?? []).map((q) => ({ ...q, kind: "quiz" })),
      ];
      const doneCount = ch.items.filter((i) => progress[i._id]?.isCompleted).length;
      const isOpen = openChapters[ch._id] !== false;

      return (
        <Box key={ch._id} sx={{ borderBottom: `1px solid ${tokens.border}` }}>
          <Box
            onClick={() => onToggleChapter(ch._id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1.75,
              cursor: "pointer",
              "&:hover": { bgcolor: tokens.surfaceMuted },
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: tokens.ink }}>
                {ch.chapterNumber}. {ch.title}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.muted }}>
                {doneCount}/{ch.items.length} done
                {ch.isFreePreview ? " · Free preview" : ""}
              </Typography>
            </Box>
            <ExpandMoreOutlined
              sx={{
                fontSize: 18,
                color: tokens.faint,
                transition: "transform .2s",
                transform: isOpen ? "rotate(180deg)" : "none",
              }}
            />
          </Box>

          <Collapse in={isOpen}>
            <Box sx={{ pb: 1 }}>
              {rows.map((row) => {
                const Icon = TYPE_ICON[row.kind] ?? NotesOutlined;
                const done = !!progress[row._id]?.isCompleted;
                const active = row._id === activeId;

                return (
                  <Box
                    key={row._id}
                    onClick={() => onSelect(row)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      pl: 2.5,
                      pr: 2,
                      py: 1.1,
                      cursor: row.locked ? "not-allowed" : "pointer",
                      borderLeft: `3px solid ${active ? statusTokens.info.solid : "transparent"}`,
                      bgcolor: active ? statusTokens.info.bg : "transparent",
                      opacity: row.locked ? 0.55 : 1,
                      "&:hover": { bgcolor: active ? statusTokens.info.bg : tokens.surfaceMuted },
                    }}
                  >
                    {row.locked ? (
                      <LockOutlined sx={{ fontSize: 16, color: tokens.faint, flexShrink: 0 }} />
                    ) : done ? (
                      <CheckCircle sx={{ fontSize: 16, color: statusTokens.success.solid, flexShrink: 0 }} />
                    ) : (
                      <Icon sx={{ fontSize: 16, color: tokens.faint, flexShrink: 0 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        fontSize: "0.83rem",
                        color: active ? statusTokens.info.fg : tokens.body,
                        fontWeight: active ? 600 : 400,
                      }}
                      noWrap
                    >
                      {row.title}
                    </Typography>
                    {row.isFree && row.locked === false && !done && (
                      <Typography
                        variant="caption"
                        sx={{ color: statusTokens.success.fg, fontWeight: 700, flexShrink: 0 }}
                      >
                        Free
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      );
    })}
  </Box>
);

export default LessonRail;
