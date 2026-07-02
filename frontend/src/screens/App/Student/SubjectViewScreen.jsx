import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ExpandMoreOutlined,
  PlayCircleOutlined,
  PictureAsPdfOutlined,
  NotesOutlined,
  LinkOutlined,
  HeadphonesOutlined,
  QuizOutlined,
  CheckCircle,
  LockOutlined,
  ForumOutlined,
  CloseOutlined,
} from "@mui/icons-material";

import { useGetSubjectContentQuery } from "../../../store/services/catalogApi";
import { useLazyPlayContentQuery } from "../../../store/services/contentApi";
import { useGetSubjectProgressQuery, useSaveProgressMutation } from "../../../store/services/progressApi";
import { useGetCertificateStatusQuery } from "../../../store/services/certificateApi";
import { useGetSubjectReviewsQuery } from "../../../store/services/reviewApi";
import { useGetChapterDoubtsQuery } from "../../../store/services/doubtApi";
import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import VideoPlayer from "../../../components/Student/VideoPlayer";
import RatingSummary from "../../../components/Student/RatingSummary";
import ReviewList from "../../../components/Student/ReviewList";
import ReviewForm from "../../../components/Student/ReviewForm";
import DoubtThread from "../../../components/Student/DoubtThread";
import DoubtComposer from "../../../components/Student/DoubtComposer";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const TYPE_ICON = {
  video: <PlayCircleOutlined fontSize="small" />,
  pdf: <PictureAsPdfOutlined fontSize="small" />,
  note: <NotesOutlined fontSize="small" />,
  link: <LinkOutlined fontSize="small" />,
  audio: <HeadphonesOutlined fontSize="small" />,
};

const ChapterDoubts = ({ chapterId }) => {
  const { data } = useGetChapterDoubtsQuery(chapterId);
  return (
    <div style={{ padding: "12px 16px", background: "#fafafa", borderTop: "1px solid #eeeeee", borderRadius: 8 }}>
      <DoubtThread doubts={data?.data} chapter={chapterId} />
      <div style={{ marginTop: 8 }}>
        <DoubtComposer chapter={chapterId} />
      </div>
    </div>
  );
};

const SubjectViewScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetSubjectContentQuery(id);
  const [triggerPlay] = useLazyPlayContentQuery();
  const [saveProgress] = useSaveProgressMutation();
  const [noteText, setNoteText] = useState(null);
  const [playing, setPlaying] = useState(null); // { contentId, url, lastPosition }
  const [openDoubts, setOpenDoubts] = useState({});

  const catalog = data?.data;
  const entitled = catalog?.subject?.entitled;

  const { data: progressRes } = useGetSubjectProgressQuery(id, { skip: !catalog });
  const progress = progressRes?.data ?? {};

  const { data: certStatusRes } = useGetCertificateStatusQuery(id, { skip: !entitled });
  const certStatus = certStatusRes?.data;

  const { data: reviewsRes, refetch: refetchReviews } = useGetSubjectReviewsQuery({ id }, { skip: !catalog });
  const reviewsData = reviewsRes?.data;

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
      const res = await saveProgress({ content: contentId, isCompleted: true }).unwrap();
      if (res.data.certificateIssued) toast.success("🎓 Certificate earned!");
    } catch (err) {
      toast.error(err?.data?.message || "Could not save progress");
    }
  };

  const open = async (item) => {
    if (item.locked) return;
    try {
      const res = await triggerPlay(item._id).unwrap();
      if (item.type === "note") return setNoteText({ content: res.data.note, contentId: item._id });
      if (item.type === "video" || item.type === "audio") {
        return setPlaying({
          contentId: item._id,
          url: res.data.url,
          lastPosition: progress[item._id]?.lastPosition || 0,
        });
      }
      const url = res.data.url || res.data.link;
      if (url) window.open(url, "_blank");
    } catch (err) {
      toast.error(err?.data?.message || "Cannot open this content");
    }
  };

  const onVideoProgress = ({ watchTime, lastPosition, isCompleted }) => {
    if (!playing) return;
    saveProgress({ content: playing.contentId, watchTime, lastPosition, isCompleted })
      .unwrap()
      .then((res) => {
        if (res.data.certificateIssued) toast.success("🎓 Certificate earned!");
      })
      .catch(() => {});
  };

  if (isLoading) {
    return (
      <BreadcrumbLayout breadcrumbs={[{ title: "Catalog", path: "/app/student" }, { title: "Loading…" }]} isBusy>
        <div />
      </BreadcrumbLayout>
    );
  }
  if (!catalog) return <div style={{ padding: 24 }}>Subject not found.</div>;

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Catalog", path: "/app/student" }, { title: catalog.subject.name }]}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            borderRadius: 16, overflow: "hidden", marginBottom: 20, padding: "26px 28px",
            background: "linear-gradient(120deg, var(--student-ink) 0%, var(--student-ink-2) 100%)", color: "#fff",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 27 }}>{catalog.subject.name}</h1>
          {entitled && certStatus && certStatus.total > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, opacity: 0.9 }}>
                <span>Your progress</span>
                <span>{certStatus.percent}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                <div style={{ width: `${certStatus.percent}%`, height: "100%", background: "var(--student-gold)", borderRadius: 4 }} />
              </div>
            </div>
          )}
        </div>

        {!entitled && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--primary-accent)", border: "1px solid var(--student-ink)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <span>Unlock every chapter, PDF, note and video in this subject.</span>
            <button onClick={enroll} style={{ background: "linear-gradient(120deg, var(--student-ink) 0%, var(--student-ink-2) 100%)", color: "#fff", border: 0, borderRadius: 999, padding: "8px 18px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
              Enroll — {money(catalog.subject.pricing?.discountedPrice)}
            </button>
          </div>
        )}
        {entitled && (
          <div style={{ background: "var(--success-accent)", border: "1px solid var(--success)", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#2e7d32" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
              <span>✓ You're enrolled — all content unlocked.</span>
            </div>
            {certStatus?.certificate && (
              <Link to="/app/student/certificates" style={{ color: "#2e7d32", fontSize: 14 }}>
                🎓 View your certificate →
              </Link>
            )}
          </div>
        )}

        {catalog.chapters.map((ch, idx) => (
          <Accordion key={ch._id} defaultExpanded={idx === 0} disableGutters sx={{ mb: 2, border: "1px solid var(--border)", borderRadius: "10px !important", "&:before": { display: "none" }, overflow: "hidden" }}>
            <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ bgcolor: "#f5f5f5" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 8 }}>
                <strong>{ch.chapterNumber}. {ch.title}</strong>
                {ch.isFreePreview && <Chip size="small" label="Free preview" sx={{ bgcolor: "var(--primary-accent)", color: "var(--student-ink-2)", fontWeight: 700 }} />}
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {(entitled || ch.isFreePreview) && (
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px" }}>
                  <Button
                    size="small"
                    startIcon={<ForumOutlined fontSize="small" />}
                    onClick={() => setOpenDoubts((s) => ({ ...s, [ch._id]: !s[ch._id] }))}
                  >
                    Doubts
                  </Button>
                </div>
              )}
              <List disablePadding>
                {ch.items.map((item) => {
                  const done = !!progress[item._id]?.isCompleted;
                  return (
                    <ListItem
                      key={item._id}
                      disablePadding
                      sx={{ borderTop: "1px solid #eeeeee" }}
                      secondaryAction={
                        item.locked ? (
                          <Chip size="small" icon={<LockOutlined fontSize="small" />} label="Locked" />
                        ) : (
                          <span style={{ display: "flex", gap: 8 }}>
                            {!done && (
                              <Button size="small" variant="outlined" sx={{ borderColor: "var(--student-ink)", color: "var(--student-ink)" }} onClick={() => markComplete(item._id)}>
                                Mark complete
                              </Button>
                            )}
                            <Button size="small" variant="contained" sx={{ bgcolor: "var(--student-ink)", "&:hover": { bgcolor: "var(--student-ink-2)" } }} onClick={() => open(item)}>
                              Open
                            </Button>
                          </span>
                        )
                      }
                    >
                      <ListItemButton disabled={item.locked} onClick={() => open(item)} sx={{ pr: 22 }}>
                        <ListItemIcon sx={{ minWidth: 34, color: item.locked ? "#9e9e9e" : "var(--student-ink)" }}>
                          {done ? <CheckCircle fontSize="small" sx={{ color: "var(--success)" }} /> : TYPE_ICON[item.type]}
                        </ListItemIcon>
                        <ListItemText primary={item.title} sx={{ color: item.locked ? "#9e9e9e" : "inherit" }} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
                {ch.items.length === 0 && (
                  <ListItem sx={{ borderTop: "1px solid #eeeeee" }}>
                    <ListItemText primary="No content yet." sx={{ color: "var(--muted)" }} />
                  </ListItem>
                )}

                {ch.quizzes?.map((q) => (
                  <ListItem
                    key={q._id}
                    disablePadding
                    sx={{ borderTop: "1px solid #eeeeee", bgcolor: "#fffdf5" }}
                    secondaryAction={
                      q.locked ? (
                        <Chip size="small" icon={<LockOutlined fontSize="small" />} label="Locked" />
                      ) : (
                        <Button size="small" variant="contained" sx={{ bgcolor: "#2D5A3D", "&:hover": { bgcolor: "#234a30" } }} onClick={() => navigate(`/app/student/quizzes/${q._id}`)}>
                          Take quiz
                        </Button>
                      )
                    }
                  >
                    <ListItemButton disabled={q.locked} onClick={() => !q.locked && navigate(`/app/student/quizzes/${q._id}`)} sx={{ pr: 20 }}>
                      <ListItemIcon sx={{ minWidth: 34, color: q.locked ? "#9e9e9e" : "var(--student-ink)" }}>
                        <QuizOutlined fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={q.title} sx={{ color: q.locked ? "#9e9e9e" : "inherit" }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {openDoubts[ch._id] && <ChapterDoubts chapterId={ch._id} />}
            </AccordionDetails>
          </Accordion>
        ))}

        <section style={{ marginTop: 32, marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Reviews</h2>
          <RatingSummary summary={reviewsData?.summary} />
          {entitled && (
            <div style={{ marginTop: 16 }}>
              <ReviewForm subjectId={id} onDone={refetchReviews} />
            </div>
          )}
          <ReviewList reviews={reviewsData?.reviews} />
        </section>

        <Dialog open={noteText !== null} onClose={() => setNoteText(null)} maxWidth="sm" fullWidth>
          <DialogContent>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton size="small" onClick={() => setNoteText(null)}><CloseOutlined fontSize="small" /></IconButton>
            </div>
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{noteText?.content}</p>
            <Button
              variant="contained"
              sx={{ mt: 2, bgcolor: "var(--student-ink)", "&:hover": { bgcolor: "var(--student-ink-2)" } }}
              onClick={() => { markComplete(noteText.contentId); setNoteText(null); }}
            >
              Mark as read & close
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={playing !== null} onClose={() => setPlaying(null)} maxWidth="md" fullWidth>
          <DialogContent>
            {playing && <VideoPlayer url={playing.url} initialPosition={playing.lastPosition} onProgress={onVideoProgress} />}
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setPlaying(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </BreadcrumbLayout>
  );
};

export default SubjectViewScreen;
