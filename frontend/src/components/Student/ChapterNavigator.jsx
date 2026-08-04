import { useEffect, useState } from "react";
import { Box, Collapse, IconButton, LinearProgress, Tooltip, Typography } from "@mui/material";
import {
  CheckCircle,
  ExpandMoreOutlined,
  KeyboardDoubleArrowLeftOutlined,
  KeyboardDoubleArrowRightOutlined,
  LockOutlined,
  MenuBookOutlined,
  PlayCircleFilled,
  RadioButtonUncheckedOutlined,
} from "@mui/icons-material";

import { statusTokens, tokens } from "../../theme";

const STORAGE_KEY = "atomica.navCollapsed";

/**
 * Course navigator — the right-hand rail beside the lesson.
 *
 * Collapses left-to-right into a narrow strip so the reading column can take
 * the full width, and each chapter folds independently so a 12-chapter subject
 * stays scannable. Both states persist.
 *
 * Status is one icon per row (done / current / locked) rather than a colour
 * per content type — a wall of green, amber and red was the main thing making
 * this page feel like a free app.
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

const ChapterNavigator = ({ chapters, activeId, onSelect, progress, completion }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  // Undefined means "not touched" → open. Only explicit false closes a chapter.
  const [openChapters, setOpenChapters] = useState({});

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // storage disabled — the choice just won't persist
      }
      return next;
    });
  };

  // Whichever chapter holds the active lesson always opens, so jumping via
  // Next never leaves the current lesson hidden inside a folded section.
  useEffect(() => {
    const owner = chapters.find((ch) =>
      [...ch.items, ...(ch.quizzes ?? [])].some((r) => r._id === activeId)
    );
    if (owner) setOpenChapters((s) => ({ ...s, [owner._id]: true }));
  }, [activeId, chapters]);

  if (collapsed) {
    return (
      <Box
        sx={{
          width: 56,
          flexShrink: 0,
          alignSelf: "flex-start",
          position: { lg: "sticky" },
          top: { lg: 88 },
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 3,
          py: 1.5,
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Tooltip title="Show chapters" placement="left">
          <IconButton size="small" onClick={toggleCollapsed} sx={{ color: tokens.muted }}>
            <KeyboardDoubleArrowLeftOutlined fontSize="small" />
          </IconButton>
        </Tooltip>

        <MenuBookOutlined sx={{ fontSize: 20, color: tokens.faint }} />

        {/* Vertical progress so the rail still says something while narrow */}
        <Box
          sx={{
            width: 6,
            flexGrow: 1,
            minHeight: 120,
            borderRadius: 3,
            bgcolor: tokens.surfaceMuted,
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: `${completion.percent}%`,
              bgcolor:
                completion.percent === 100 ? statusTokens.success.solid : tokens.ink,
              borderRadius: 3,
              transition: "height .3s ease",
            }}
          />
        </Box>

        <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: tokens.ink }}>
          {completion.percent}%
        </Typography>
      </Box>
    );
  }

  return (
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: "0.07em", color: tokens.muted }}
          >
            COURSE PROGRESS
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1, color: tokens.ink }}>
              {completion.percent}%
            </Typography>
            <Tooltip title="Hide chapters" placement="left">
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                sx={{ color: tokens.muted, display: { xs: "none", lg: "inline-flex" } }}
              >
                <KeyboardDoubleArrowRightOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
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
        const isOpen = openChapters[ch._id] !== false;
        const doneCount = ch.items.filter((i) => progress[i._id]?.isCompleted).length;

        return (
          <Box key={ch._id} sx={{ borderBottom: `1px solid ${tokens.border}`, "&:last-child": { border: 0 } }}>
            <Box
              onClick={() => setOpenChapters((s) => ({ ...s, [ch._id]: !isOpen }))}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                px: 2.5,
                py: 1.75,
                cursor: "pointer",
                "&:hover": { bgcolor: tokens.surfaceMuted },
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: tokens.muted, letterSpacing: "0.05em" }}
                >
                  CHAPTER {ch.chapterNumber}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: tokens.ink, mt: 0.25 }}>
                  {ch.title}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.muted }}>
                  {doneCount}/{ch.items.length} done
                </Typography>
              </Box>
              <ExpandMoreOutlined
                sx={{
                  fontSize: 19,
                  color: tokens.faint,
                  mt: 0.5,
                  flexShrink: 0,
                  transition: "transform .2s",
                  transform: isOpen ? "rotate(180deg)" : "none",
                }}
              />
            </Box>

            <Collapse in={isOpen} unmountOnExit>
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
                        // Room to breathe — titles wrap instead of truncating.
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
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};

export default ChapterNavigator;
