import { useState } from "react";
import { toast } from "react-toastify";

import { useCreateDoubtMutation } from "../../store/services/doubtApi";

const DoubtComposer = ({ chapter, liveClass, parentDoubt, placeholder = "Ask a question…", onDone }) => {
  const [content, setContent] = useState("");
  const [createDoubt, { isLoading }] = useCreateDoubtMutation();

  const submit = async () => {
    if (!content.trim()) return;
    try {
      await createDoubt({ chapter, liveClass, parentDoubt, content }).unwrap();
      setContent("");
      onDone?.();
    } catch (err) {
      toast.error(err?.data?.message || "Could not post");
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #E7E0D4", fontFamily: "inherit" }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button
        onClick={submit}
        disabled={isLoading}
        style={{ background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6, padding: "8px 14px", cursor: "pointer" }}
      >
        Post
      </button>
    </div>
  );
};

export default DoubtComposer;
