import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";
import {
  ArrowBackOutlined,
  ArrowForwardOutlined,
  CheckCircle,
  CheckCircleOutlineOutlined,
  ForumOutlined,
  LockOutlined,
  OpenInNewOutlined,
  PictureAsPdfOutlined,
  QuizOutlined,
} from "@mui/icons-material";

import { useGetSubjectContentQuery } from "../../../store/services/catalogApi";
import { useLazyPlayContentQuery } from "../../../store/services/contentApi";
import {
  useGetSubjectProgressQuery,
  useSaveProgressMutation,
} from "../../../store/services/progressApi";
import { useGetSubjectReviewsQuery } from "../../../store/services/reviewApi";
import { useGetChapterDoubtsQuery } from "../../../store/services/doubtApi";
import { statusTokens, tokens } from "../../../theme";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import RichText from "../../../components/Shared/RichText";
import LessonRail from "../../../components/Student/LessonRail";
import VideoPlayer from "../../../components/Student/VideoPlayer";
import RatingSummary from "../../../components/Student/RatingSummary";
import ReviewList from "../../../components/Student/ReviewList";
import ReviewForm from "../../../components/Student/ReviewForm";
import DoubtThread from "../../../components/Student/DoubtThread";
import DoubtComposer from "../../../components/Student/DoubtComposer";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const ChapterDoubts = ({ chapterId }) => {
  const { data } = useGetChapterDoubtsQuery(chapterId);
  return (
    <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${tokens.border}` }}>
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <ForumOutlined sx={{ fontSize: 20, color: statusTokens.info.solid }} />
        Ask about this chapter
      </Typography>
      <DoubtThread doubts={data?.data} chapter={chapterId} />
      <Box sx={{ mt: 2 }}>
        <DoubtComposer chapter={chapterId} />
      </Box>
    </Box>
  );
};

/**
 * The student's reading room.
 *
 * Rebuilt from an accordion-plus-modal list into a two-pane learning module:
 * a persistent chapter rail on the left, the lesson itself rendered inline on
 * the right in a proper reading column. Students are the paying users here, so
 * the lesson gets the whole stage rather than a cramped dialog.
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
  const [payload, setPayload] = useState(null); // { kind, note, url }
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [openChapters, setOpenChapters] = useState({});

  const chapters = useMemo(() => catalog?.chapters ?? [], [catalog]);

  /** Flat reading order, so "next lesson" crosses chapter boundaries. */
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

  // Land on the first thing the student can actually open.
  useEffect(() => {
    if (activeId || flat.length === 0) return;
    setActiveId((flat.find((l) => !l.locked) ?? flat[0])._id);
  }, [flat, activeId]);

  const { data: reviewsRes, refetch: refetchReviews } = useGetSubjectReviewsQuery(
    { id },
    { skip: !catalog }
  );
  const reviewsData = reviewsRes?.data;

  // Load whatever the active lesson needs to render.
  useEffect(() => {
    let cancelled = false;
    setPayload(null);
    if (!active || active.locked || active.kind === "quiz") return undefined;

    setLoadingLesson(true);
    triggerPlay(active._id)
      .unwrap()
      .then((res) => {
        if (cancelled) return;
        setPayload({ note: res.data.note, url: res.data.url || res.data.link });
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
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
          <Skeleton variant="rounded" height={520} sx={{ width: { xs: "100%", md: 320 }, borderRadius: 3 }} />
          <Skeleton variant="rounded" height={520} sx={{ flexGrow: 1, borderRadius: 3 }} />
        </Box>
      </BreadcrumbLayout>
    );
  }
  if (!catalog) return <Box sx={{ p: 3 }}>Subject not found.</Box>;

  const activeChapter = chapters.find((c) => c._id === active?.chapterId);
  const isDone = active ? !!progress[active._id]?.isCompleted : false;

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

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
        <LessonRail
          chapters={chapters}
          activeId={activeId}
          onSelect={(row) => !row.locked && setActiveId(row._id)}
          progress={progress}
          completion={completion}
          openChapters={openChapters}
          onToggleChapter={(cid) =>
            setOpenChapters((s) => ({ ...s, [cid]: s[cid] === false ? true : false }))
          }
          subjectName={catalog.subject.name}
        />

        {/* Reading pane */}
        <Box sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
          <BreadcrumbLayout.Paper sx={{ p: { xs: 2.5, md: 5 } }}>
            {!active ? (
              <Typography sx={{ color: tokens.muted, textAlign: "center", py: 8 }}>
                This subject has no lessons yet.
              </Typography>
            ) : (
              <Box sx={{ maxWidth: 760, mx: "auto" }}>
                <Typography
                  variant="caption"
                  sx={{ color: statusTokens.info.fg, fontWeight: 700, letterSpacing: "0.06em" }}
                >
                  {activeChapter ? `CHAPTER ${activeChapter.chapterNumber} · ${activeChapter.title}` : ""}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 700, mt: 1, mb: 3, letterSpacing: "-0.02em" }}
                >
                  {active.title}
                </Typography>

                {/* Locked — a clean upsell, not a dead end */}
                {active.locked && (
                  <Box sx={{ textAlign: "center", py: 6, px: 3, bgcolor: tokens.surfaceMuted, borderRadius: 3 }}>
                    <LockOutlined sx={{ fontSize: 40, color: tokens.faint, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>This lesson is locked</Typography>
                    <Typography variant="body2" sx={{ color: tokens.muted, mb: 3 }}>
                      Enrol once and every lesson in {catalog.subject.name} opens up.
                    </Typography>
                    <Button variant="contained" size="large" onClick={enroll}>
                      Enrol — {money(catalog.subject.pricing?.discountedPrice)}
                    </Button>
                  </Box>
                )}

                {!active.locked && loadingLesson && (
                  <Box sx={{ display: "grid", gap: 1.5 }}>
                    <Skeleton variant="text" height={26} />
                    <Skeleton variant="text" height={26} width="92%" />
                    <Skeleton variant="rounded" height={220} />
                    <Skeleton variant="text" height={26} width="85%" />
                  </Box>
                )}

                {/* Notes — the same renderer the teacher wrote them in */}
                {!active.locked && !loadingLesson && active.kind === "note" && (
                  <RichText html={payload?.note} sx={{ fontSize: "1.05rem" }} />
                )}

                {/* Video / audio */}
                {!active.locked && !loadingLesson && ["video", "audio"].includes(active.kind) && payload?.url && (
                  <VideoPlayer
                    url={payload.url}
                    initialPosition={progress[active._id]?.lastPosition || 0}
                    onProgress={({ watchTime, lastPosition, isCompleted }) =>
                      saveProgress({ content: active._id, watchTime, lastPosition, isCompleted })
                        .unwrap()
                        .catch(() => {})
                    }
                  />
                )}

                {/* PDF / link open in a new tab — say so rather than failing silently */}
                {!active.locked && !loadingLesson && ["pdf", "link"].includes(active.kind) && (
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
                    {active.kind === "pdf" ? (
                      <PictureAsPdfOutlined sx={{ fontSize: 36, color: statusTokens.danger.solid }} />
                    ) : (
                      <OpenInNewOutlined sx={{ fontSize: 36, color: statusTokens.warning.solid }} />
                    )}
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

                {/* Quiz */}
                {!active.locked && active.kind === "quiz" && (
                  <Box sx={{ textAlign: "center", py: 5, px: 3, bgcolor: statusTokens.warning.bg, borderRadius: 3 }}>
                    <QuizOutlined sx={{ fontSize: 40, color: statusTokens.warning.solid, mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Ready to test yourself?</Typography>
                    <Typography variant="body2" sx={{ color: statusTokens.warning.fg, mb: 3 }}>
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

                {/* Footer nav — the rhythm of moving through a course */}
                {!active.locked && (
                  <>
                    <Divider sx={{ my: 4 }} />
                    <Box
                      sx={{
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

                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        {active.kind !== "quiz" &&
                          (isDone ? (
                            <Typography
                              variant="body2"
                              sx={{ display: "flex", alignItems: "center", gap: 0.75, color: statusTokens.success.fg, fontWeight: 600 }}
                            >
                              <CheckCircle sx={{ fontSize: 18 }} /> Completed
                            </Typography>
                          ) : (
                            <Button
                              variant="outlined"
                              startIcon={<CheckCircleOutlineOutlined />}
                              onClick={() => markComplete(active._id)}
                            >
                              Mark complete
                            </Button>
                          ))}
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardOutlined />}
                          disabled={!nextLesson}
                          onClick={goNext}
                        >
                          {nextLesson ? "Next lesson" : "You're at the end"}
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}

                {!active.locked && activeChapter && <ChapterDoubts chapterId={activeChapter._id} />}
              </Box>
            )}
          </BreadcrumbLayout.Paper>

          <BreadcrumbLayout.Paper sx={{ p: { xs: 2.5, md: 4 }, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reviews
            </Typography>
            <RatingSummary summary={reviewsData?.summary} />
            {entitled && (
              <Box sx={{ mt: 2 }}>
                <ReviewForm subjectId={id} onDone={refetchReviews} />
              </Box>
            )}
            <ReviewList reviews={reviewsData?.reviews} />
          </BreadcrumbLayout.Paper>
        </Box>
      </Box>
    </BreadcrumbLayout>
  );
};

export default SubjectViewScreen;
