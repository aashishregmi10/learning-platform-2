import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useGetSubjectContentQuery } from "../../../store/services/catalogApi";
import { useLazyPlayContentQuery } from "../../../store/services/contentApi";
import { useGetSubjectProgressQuery, useSaveProgressMutation } from "../../../store/services/progressApi";
import { useGetCertificateStatusQuery } from "../../../store/services/certificateApi";
import VideoPlayer from "../../../components/Student/VideoPlayer";

const money = (n) => `NPR ${Number(n || 0).toLocaleString()}`;

const TYPE_LABEL = { video: "▶ Video", pdf: "📄 PDF", note: "📝 Note", link: "🔗 Link", audio: "🎧 Audio" };

const SubjectViewScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetSubjectContentQuery(id);
  const [triggerPlay] = useLazyPlayContentQuery();
  const [saveProgress] = useSaveProgressMutation();
  const [noteText, setNoteText] = useState(null);
  const [playing, setPlaying] = useState(null); // { contentId, url, lastPosition }

  const catalog = data?.data;
  const entitled = catalog?.subject?.entitled;

  const { data: progressRes } = useGetSubjectProgressQuery(id, { skip: !catalog });
  const progress = progressRes?.data ?? {};

  const { data: certStatusRes } = useGetCertificateStatusQuery(id, { skip: !entitled });
  const certStatus = certStatusRes?.data;

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

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading…</div>;
  if (!catalog) return <div style={{ padding: 24 }}>Subject not found.</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <Link to="/app/student" style={{ color: "#1976d3", fontSize: 14 }}>← Back to catalog</Link>
      <h1 style={{ color: "#1976d3", marginTop: 8 }}>{catalog.subject.name}</h1>

      {!entitled && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#edf5ff", border: "1px solid #1976d3", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
          <span>Unlock every chapter, PDF, note and video in this subject.</span>
          <button onClick={enroll} style={{ background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
            Enroll — {money(catalog.subject.pricing?.discountedPrice)}
          </button>
        </div>
      )}
      {entitled && (
        <div style={{ background: "#defbe6", border: "1px solid #66bb6a", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#2e7d32" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600 }}>
            <span>✓ You're enrolled — all content unlocked.</span>
            {certStatus && certStatus.total > 0 && <span>{certStatus.percent}% complete</span>}
          </div>
          {certStatus?.certificate && (
            <Link to="/app/student/certificates" style={{ color: "#2e7d32", fontSize: 14 }}>
              🎓 View your certificate →
            </Link>
          )}
        </div>
      )}

      {catalog.chapters.map((ch) => (
        <section key={ch._id} style={{ marginBottom: 20, border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: "#f5f5f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{ch.chapterNumber}. {ch.title}</strong>
            {ch.isFreePreview && <span style={{ fontSize: 12, color: "#1976d3", fontWeight: 600 }}>Free preview</span>}
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ch.items.map((item) => {
              const done = !!progress[item._id]?.isCompleted;
              return (
                <li key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "1px solid #eeeeee" }}>
                  <span style={{ color: item.locked ? "#9e9e9e" : "#1C1C1C" }}>
                    {done ? "✅" : TYPE_LABEL[item.type]} &nbsp; {item.title}
                  </span>
                  {item.locked ? (
                    <span title="Purchase required" style={{ color: "#9e9e9e", fontSize: 13 }}>🔒 Locked</span>
                  ) : (
                    <span style={{ display: "flex", gap: 8 }}>
                      {!done && (
                        <button onClick={() => markComplete(item._id)} style={{ background: "transparent", color: "#1976d3", border: "1px solid #1976d3", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>
                          Mark complete
                        </button>
                      )}
                      <button onClick={() => open(item)} style={{ background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>
                        Open
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
            {ch.items.length === 0 && <li style={{ padding: "10px 16px", color: "#6b7280" }}>No content yet.</li>}

            {ch.quizzes?.map((q) => (
              <li key={q._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "1px solid #eeeeee", background: "#fffdf5" }}>
                <span style={{ color: q.locked ? "#9e9e9e" : "#1C1C1C" }}>📝 Quiz &nbsp; {q.title}</span>
                {q.locked ? (
                  <span title="Purchase required" style={{ color: "#9e9e9e", fontSize: 13 }}>🔒 Locked</span>
                ) : (
                  <button onClick={() => navigate(`/app/student/quizzes/${q._id}`)} style={{ background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>
                    Take quiz
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {noteText !== null && (
        <div onClick={() => setNoteText(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "grid", placeItems: "center", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 24, borderRadius: 10, maxWidth: 600, maxHeight: "70vh", overflow: "auto" }}>
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{noteText.content}</p>
            <button onClick={() => { markComplete(noteText.contentId); setNoteText(null); }} style={{ marginTop: 16, background: "#1976d3", color: "#fff", border: 0, borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>
              Mark as read & close
            </button>
          </div>
        </div>
      )}

      {playing !== null && (
        <div onClick={() => setPlaying(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center", zIndex: 50, padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", padding: 16, borderRadius: 10, maxWidth: 900, width: "100%" }}>
            <VideoPlayer url={playing.url} initialPosition={playing.lastPosition} onProgress={onVideoProgress} />
            <button onClick={() => setPlaying(null)} style={{ marginTop: 12, background: "transparent", border: "1px solid #ccc", borderRadius: 6, padding: "8px 16px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectViewScreen;
