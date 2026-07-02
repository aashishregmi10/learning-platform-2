import { useState } from "react";

import { useUpvoteDoubtMutation, useResolveDoubtMutation } from "../../store/services/doubtApi";
import DoubtComposer from "./DoubtComposer";

const DoubtRow = ({ doubt, chapter, liveClass, canResolve, reply = false }) => {
  const [upvote] = useUpvoteDoubtMutation();
  const [resolve] = useResolveDoubtMutation();
  const [replying, setReplying] = useState(false);

  return (
    <div style={{ marginLeft: reply ? 24 : 0, marginTop: reply ? 8 : 12, paddingTop: reply ? 0 : 12, borderTop: reply ? "none" : "1px solid #E7E0D4" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <strong style={{ fontSize: 14 }}>{doubt.author?.name}</strong>{" "}
          <span style={{ color: "#8C7B6B", fontSize: 12 }}>{doubt.author?.role}</span>
          <p style={{ margin: "2px 0" }}>{doubt.content}</p>
        </div>
        {doubt.isResolved && <span style={{ color: "#2D5A3D", fontSize: 12, fontWeight: 600 }}>✓ Resolved</span>}
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#8C7B6B" }}>
        <button onClick={() => upvote(doubt._id)} style={{ background: "none", border: 0, color: "#8C7B6B", cursor: "pointer", padding: 0 }}>
          👍 {doubt.upvoteCount || 0}
        </button>
        {!reply && (
          <button onClick={() => setReplying((s) => !s)} style={{ background: "none", border: 0, color: "#8C7B6B", cursor: "pointer", padding: 0 }}>
            Reply
          </button>
        )}
        {!reply && canResolve && !doubt.isResolved && (
          <button onClick={() => resolve(doubt._id)} style={{ background: "none", border: 0, color: "#2D5A3D", cursor: "pointer", padding: 0 }}>
            Mark resolved
          </button>
        )}
      </div>
      {replying && (
        <div style={{ marginTop: 6, marginLeft: 24 }}>
          <DoubtComposer chapter={chapter} liveClass={liveClass} parentDoubt={doubt._id} placeholder="Reply…" onDone={() => setReplying(false)} />
        </div>
      )}
      {doubt.replies?.map((r) => (
        <DoubtRow key={r._id} doubt={r} chapter={chapter} liveClass={liveClass} canResolve={canResolve} reply />
      ))}
    </div>
  );
};

const DoubtThread = ({ doubts, chapter, liveClass, canResolve = false }) => {
  if (!doubts || doubts.length === 0) {
    return <p style={{ color: "#8C7B6B", fontSize: 14 }}>No doubts yet — ask the first question.</p>;
  }
  return (
    <div>
      {doubts.map((d) => (
        <DoubtRow key={d._id} doubt={d} chapter={chapter} liveClass={liveClass} canResolve={canResolve} />
      ))}
    </div>
  );
};

export default DoubtThread;
