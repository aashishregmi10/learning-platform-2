import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";
import {
  ArrowBackOutlined,
  ArrowForwardOutlined,
  ArticleOutlined,
  CheckCircle,
  CheckOutlined,
  DescriptionOutlined,
  ForumOutlined,
  LockOutlined,
  OpenInNewOutlined,
  PictureAsPdfOutlined,
  PlayCircleOutlined,
  QuizOutlined,
} from "@mui/icons-material";

import { useGetSubjectContentQuery } from "../../../store/services/catalogApi";
import { useLazyPlayContentQuery } from "../../../store/services/contentApi";
import {
  useGetSubjectProgressQuery,
  useSaveProgressMutation,
} from "../../../store/services/progressApi";
import { useGetChapterDoubtsQuery } from "../../../store/services/doubtApi";
import { statusTokens, tokens } from "../../../theme";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import RichText from "../../../components/Shared/RichText";
import ChapterNavigator from "../../../components/Student/ChapterNavigator";
import VideoPlayer from "../../../components/Student/VideoPlayer";
import DoubtThread from "../../../components/Student/DoubtThread";
import DoubtComposer from "../../../components/Student/DoubtComposer";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const KIND_LABEL = {
  note: "Reading",
  pdf: "PDF handout",
  video: "Video lesson",
  audio: "Audio lesson",
  link: "External resource",
  quiz: "Quiz",
};

const KIND_ICON = {
  note: ArticleOutlined,
  pdf: PictureAsPdfOutlined,
  video: PlayCircleOutlined,
  audio: PlayCircleOutlined,
  link: OpenInNewOutlined,
  quiz: QuizOutlined,
};

const fmtDuration = (s) => {
  if (!s) return null;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

/**
 * The cinematic frame at the top of a lesson.
 *
 * Every lesson gets one — even a plain reading — so a student always opens onto
 * something substantial rather than a blank white box. Video plays here; other
 * kinds get a dark 16:9 title card that names what they're about to open.
 */
const MediaStage = ({ lesson, payload, loading, onProgress, initialPosition }) => {
  const Icon = KIND_ICON[lesson.kind] ?? ArticleOutlined;
  const isPlayable = ["video", "audio"].includes(lesson.kind) && payload?.url;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        bgcolor: "#0B0D12",
        borderRadius: 3,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // A faint radial lift so the panel reads as a stage, not a dead rect.
        backgroundImage:
          "radial-gradient(120% 90% at 50% 0%, rgba(37,99,235,0.22) 0%, rgba(11,13,18,0) 60%)",
      }}
    >
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: "#161922" }} />
      ) : isPlayable ? (
        <Box sx={{ width: "100%", height: "100%", "& video, & iframe": { width: "100%", height: "100%" } }}>
          <VideoPlayer url={payload.url} initialPosition={initialPosition} onProgress={onProgress} />
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", px: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              mx: "auto",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <Icon sx={{ fontSize: 34, color: "rgba(255,255,255,0.92)" }} />
          </Box>
          <Typography
            sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em" }}
          >
            {(KIND_LABEL[lesson.kind] ?? "Lesson").toUpperCase()}
          </Typography>
          <Typography
            sx={{ color: "#fff", fontSize: { xs: "1.15rem", md: "1.5rem" }, fontWeight: 700, mt: 0.75, maxWidth: 620, mx: "auto" }}
          >
            {lesson.title}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const ChapterDoubts = ({ chapterId }) => {
  const { data } = useGetChapterDoubtsQuery(chapterId);
  const doubts = data?.data ?? [];

  return (
    <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${tokens.border}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <ForumOutlined sx={{ fontSize: 19, color: tokens.muted }} />
        <Typography sx={{ fontWeight: 700 }}>
          Questions {doubts.length > 0 && `(${doubts.length})`}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: tokens.muted, mb: 2.5 }}>
        Stuck on something? Your teacher answers here.
      </Typography>

      <DoubtComposer chapter={chapterId} placeholder="Have a doubt? Ask your teacher here…" />

      {doubts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <DoubtThread doubts={doubts} chapter={chapterId} />
        </Box>
      )}
    </Box>
  );
};

/**
 * The student's reading room.
 *
 * Layout is deliberately content-first: a 16:9 stage, then the lesson title and
 * metadata, then the body — with the course navigator parked on the right and
 * Q&A well below the fold. Reviews are NOT on this page; they belong on the
 * catalog where someone is deciding what to buy, not mid-lesson.
 */
const SubjectViewScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useGetSubjectContentQuery(id);
  const [triggerPlay] = useLazyPlayContentQuery();
  const [saveProgress] = useSaveProgressMutation();

  const catalog = data?.data;
  const entitled = catalog?.subject?.entitled;

  const { data: progressRes } = useGetSubjectProgressQuery(id, { skip: !catalog });
  const progress = progressRes?.data ?? {};

  const [activeId, setActiveId] = useState(null);
  const [payload, setPayload] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  const chapters = useMemo(() => catalog?.chapters ?? [], [catalog]);

  const flat = useMemo(
    () =>
      chapters.flatMap((ch) => [
        ...ch.items.map((i) => ({ ...i, kind: i.type, chapterId: ch._id })),
        ...(ch.quizzes ?? []).map((q) => ({ ...q, kind: "quiz", chapterId: ch._id })),
      ]),
    [chapters]
  );

  const completion = useMemo(() => {
    const items = chapters.flatMap((ch) => ch.items ?? []);
    const total = items.length;
    const done = items.filter((it) => progress[it._id]?.isCompleted).length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [chapters, progress]);

  const active = flat.find((l) => l._id === activeId) ?? null;
  const activeIndex = flat.findIndex((l) => l._id === activeId);
  const nextLesson = activeIndex >= 0 ? flat[activeIndex + 1] : null;
  const prevLesson = activeIndex > 0 ? flat[activeIndex - 1] : null;

  useEffect(() => {
    if (activeId || flat.length === 0) return;
    setActiveId((flat.find((l) => !l.locked) ?? flat[0])._id);
  }, [flat, activeId]);

  useEffect(() => {
    let cancelled = false;
    setPayload(null);
    if (!active || active.locked || active.kind === "quiz") return undefined;

    setLoadingLesson(true);
    triggerPlay(active._id)
      .unwrap()
      .then((res) => {
        if (!cancelled) setPayload({ note: res.data.note, url: res.data.url || res.data.link });
      })
      .catch((err) => {
        if (!cancelled) toast.error(err?.data?.message || "Cannot open this lesson");
      })
      .finally(() => !cancelled && setLoadingLesson(false));

    return () => {
      cancelled = true;
    };
  }, [active, triggerPlay]);

  const enroll = () =>
    navigate("/app/student/checkout", {
      state: {
        items: [
          {
            itemType: "subject",
            subject: catalog.subject._id,
            title: catalog.subject.name,
            price: catalog.subject.pricing?.discountedPrice,
          },
        ],
      },
    });

  const markComplete = async (contentId) => {
    try {
      await saveProgress({ content: contentId, isCompleted: true }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Could not save progress");
    }
  };

  const goNext = () => {
    if (active && !active.locked && active.kind !== "quiz" && !progress[active._id]?.isCompleted) {
      markComplete(active._id);
    }
    if (nextLesson) setActiveId(nextLesson._id);
  };

  if (isLoading) {
    return (
      <BreadcrumbLayout breadcrumbs={[{ title: "Catalog", path: "/app/student" }, { title: "…" }]} isBusy>
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", lg: "row" } }}>
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 3 }} />
            <Skeleton variant="text" height={44} sx={{ mt: 3, width: "60%" }} />
            <Skeleton variant="text" height={22} sx={{ width: "35%" }} />
          </Box>
          <Skeleton variant="rounded" height={520} sx={{ width: { xs: "100%", lg: 320 }, borderRadius: 3 }} />
        </Box>
      </BreadcrumbLayout>
    );
  }
  if (!catalog) return <Box sx={{ p: 3 }}>Subject not found.</Box>;

  const activeChapter = chapters.find((c) => c._id === active?.chapterId);
  const isDone = active ? !!progress[active._id]?.isCompleted : false;
  const duration = fmtDuration(active?.durationSeconds);

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Catalog", path: "/app/student" }, { title: catalog.subject.name }]}
    >
      {!entitled && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            p: 2.5,
            borderRadius: 3,
            bgcolor: statusTokens.info.bg,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: statusTokens.info.fg }}>
              You&apos;re previewing this subject
            </Typography>
            <Typography variant="body2" sx={{ color: statusTokens.info.fg, opacity: 0.85 }}>
              Enrol to unlock every chapter, note, PDF and video.
            </Typography>
          </Box>
          <Button variant="contained" size="large" onClick={enroll}>
            Enrol — {money(catalog.subject.pricing?.discountedPrice)}
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", lg: "row" } }}>
        {/* ---- The lesson itself ---- */}
        <Box sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
          {!active ? (
            <BreadcrumbLayout.Paper sx={{ p: 8, textAlign: "center" }}>
              <Typography sx={{ color: tokens.muted }}>This subject has no lessons yet.</Typography>
            </BreadcrumbLayout.Paper>
          ) : active.locked ? (
            <BreadcrumbLayout.Paper sx={{ p: { xs: 4, md: 8 }, textAlign: "center" }}>
              <LockOutlined sx={{ fontSize: 44, color: tokens.faint, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                This lesson is locked
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.muted, mb: 3 }}>
                Enrol once and every lesson in {catalog.subject.name} opens up.
              </Typography>
              <Button variant="contained" size="large" onClick={enroll}>
                Enrol — {money(catalog.subject.pricing?.discountedPrice)}
              </Button>
            </BreadcrumbLayout.Paper>
          ) : (
            <>
              <MediaStage
                lesson={active}
                payload={payload}
                loading={loadingLesson}
                initialPosition={progress[active._id]?.lastPosition || 0}
                onProgress={({ watchTime, lastPosition, isCompleted }) =>
                  saveProgress({ content: active._id, watchTime, lastPosition, isCompleted })
                    .unwrap()
                    .catch(() => {})
                }
              />

              {/* Title + metadata */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, letterSpacing: "0.07em", color: tokens.muted }}
                >
                  {activeChapter
                    ? `CHAPTER ${activeChapter.chapterNumber} · ${activeChapter.title.toUpperCase()}`
                    : ""}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    mt: 0.75,
                  }}
                >
                  {active.title}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mt: 1.5,
                    flexWrap: "wrap",
                    color: tokens.muted,
                    fontSize: "0.82rem",
                  }}
                >
                  <span>{KIND_LABEL[active.kind] ?? "Lesson"}</span>
                  {duration && (
                    <>
                      <Box component="span" sx={{ color: tokens.borderStrong }}>
                        ·
                      </Box>
                      <span>{duration}</span>
                    </>
                  )}
                  {active.isFree && (
                    <>
                      <Box component="span" sx={{ color: tokens.borderStrong }}>
                        ·
                      </Box>
                      <Box component="span" sx={{ color: statusTokens.success.fg, fontWeight: 700 }}>
                        Free preview
                      </Box>
                    </>
                  )}
                  {isDone && (
                    <>
                      <Box component="span" sx={{ color: tokens.borderStrong }}>
                        ·
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: statusTokens.success.fg,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 15 }} /> Completed
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Body */}
              {loadingLesson ? (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={24} width="94%" />
                  <Skeleton variant="text" height={24} width="88%" />
                  <Skeleton variant="rounded" height={200} sx={{ my: 1 }} />
                  <Skeleton variant="text" height={24} width="90%" />
                </Box>
              ) : (
                <>
                  {active.kind === "note" && (
                    <RichText html={payload?.note} sx={{ fontSize: "1.05rem", maxWidth: 760 }} />
                  )}

                  {["pdf", "link"].includes(active.kind) && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${tokens.border}`,
                        bgcolor: tokens.surfaceMuted,
                      }}
                    >
                      <DescriptionOutlined sx={{ fontSize: 34, color: tokens.muted }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{active.title}</Typography>
                        <Typography variant="body2" sx={{ color: tokens.muted }}>
                          Opens in a new tab.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!payload?.url}
                        onClick={() => window.open(payload.url, "_blank", "noopener")}
                      >
                        Open
                      </Button>
                    </Box>
                  )}

                  {active.kind === "quiz" && (
                    <Box sx={{ textAlign: "center", py: 5, px: 3, bgcolor: tokens.surfaceMuted, borderRadius: 3 }}>
                      <QuizOutlined sx={{ fontSize: 40, color: tokens.muted, mb: 1.5 }} />
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Ready to test yourself?</Typography>
                      <Typography variant="body2" sx={{ color: tokens.muted, mb: 3 }}>
                        Check what stuck from this chapter.
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(`/app/student/quizzes/${active._id}`)}
                      >
                        Start quiz
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {/* Course rhythm — Mark complete is the primary action here */}
              <Box
                sx={{
                  mt: 5,
                  pt: 3,
                  borderTop: `1px solid ${tokens.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  startIcon={<ArrowBackOutlined />}
                  disabled={!prevLesson}
                  onClick={() => prevLesson && setActiveId(prevLesson._id)}
                >
                  Previous
                </Button>

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                  {active.kind !== "quiz" &&
                    (isDone ? (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: statusTokens.success.bg,
                          color: statusTokens.success.fg,
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 19 }} /> Completed
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<CheckOutlined />}
                        onClick={() => markComplete(active._id)}
                        sx={{
                          bgcolor: tokens.ink,
                          px: 3,
                          "&:hover": { bgcolor: "#000" },
                        }}
                      >
                        Mark complete
                      </Button>
                    ))}
                  <Button
                    variant={isDone ? "contained" : "outlined"}
                    size="large"
                    endIcon={<ArrowForwardOutlined />}
                    disabled={!nextLesson}
                    onClick={goNext}
                  >
                    {nextLesson ? "Next lesson" : "You're at the end"}
                  </Button>
                </Box>
              </Box>

              {/* Q&A — present, but well below the lesson */}
              {activeChapter && <ChapterDoubts chapterId={activeChapter._id} />}
            </>
          )}
        </Box>

        {/* ---- Course navigator ---- */}
        <ChapterNavigator
          chapters={chapters}
          activeId={activeId}
          onSelect={(row) => setActiveId(row._id)}
          progress={progress}
          completion={completion}
        />
      </Box>
    </BreadcrumbLayout>
  );
};

export default SubjectViewScreen;
