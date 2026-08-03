import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounced autosave. Teachers shouldn't have to know when to press Save —
 * they type, we persist, and a small "Saved" appears.
 *
 *   const { status, save } = useAutosave((value) => updateChapter({ id, title: value }).unwrap());
 *   <TextField onChange={(e) => save(e.target.value)} />
 *   <SaveStatus status={status} />
 *
 * status: "idle" | "saving" | "saved" | "error"
 */
export const useAutosave = (persist, { delay = 800, resetAfter = 2000 } = {}) => {
  const [status, setStatus] = useState("idle");
  const timer = useRef(null);
  const resetTimer = useRef(null);
  const persistRef = useRef(persist);
  persistRef.current = persist;

  // Ignore a late response from a save that a newer keystroke superseded.
  const runId = useRef(0);

  const flush = useCallback(async (value) => {
    const id = ++runId.current;
    setStatus("saving");
    try {
      await persistRef.current(value);
      if (id !== runId.current) return;
      setStatus("saved");
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setStatus("idle"), resetAfter);
    } catch {
      if (id !== runId.current) return;
      setStatus("error");
    }
  }, [resetAfter]);

  const save = useCallback(
    (value) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => flush(value), delay);
    },
    [flush, delay]
  );

  /** Persist immediately — for blur, or closing a dialog. */
  const saveNow = useCallback(
    (value) => {
      clearTimeout(timer.current);
      return flush(value);
    },
    [flush]
  );

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(resetTimer.current);
    },
    []
  );

  return { status, save, saveNow };
};

export default useAutosave;
