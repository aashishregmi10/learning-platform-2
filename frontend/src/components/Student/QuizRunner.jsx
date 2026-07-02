import { useEffect, useState } from "react";

const fmt = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

// Renders questions (no answer keys — server strips those), tracks a countdown
// when the quiz has a time limit, and enforces maxAttempts client-side too.
const QuizRunner = ({ quiz, onSubmit, submitting }) => {
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [secondsLeft, setSecondsLeft] = useState(
    quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null
  );

  const attemptsExhausted = quiz.maxAttempts > 0 && quiz.attemptsUsed >= quiz.maxAttempts;

  const submit = () => {
    const payload = Object.entries(answers).map(([questionIndex, selectedOptionIndex]) => ({
      questionIndex: Number(questionIndex),
      selectedOptionIndex,
    }));
    onSubmit({ answers: payload, startedAt });
  };

  useEffect(() => {
    if (secondsLeft === null || attemptsExhausted) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (attemptsExhausted) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#8C7B6B" }}>
        You've used all {quiz.maxAttempts} attempt{quiz.maxAttempts > 1 ? "s" : ""} for this quiz.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#8C7B6B", fontSize: 14 }}>
          {quiz.questions.length} question{quiz.questions.length > 1 ? "s" : ""} · passing score {quiz.passingScore}%
          {quiz.maxAttempts > 0 && ` · attempt ${quiz.attemptsUsed + 1}/${quiz.maxAttempts}`}
        </span>
        {secondsLeft !== null && (
          <span style={{ fontFamily: "monospace", fontWeight: 600, color: secondsLeft < 60 ? "#b3261e" : "#1C1C1C" }}>
            ⏱ {fmt(secondsLeft)}
          </span>
        )}
      </div>

      {quiz.questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #E7E0D4" }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>
            {qi + 1}. {q.questionText}
          </p>
          {q.options.map((opt, oi) => (
            <label
              key={oi}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                borderRadius: 6, cursor: "pointer",
                background: answers[qi] === oi ? "#edf5ff" : "transparent",
              }}
            >
              <input
                type="radio"
                name={`q${qi}`}
                checked={answers[qi] === oi}
                onChange={() => setAnswers({ ...answers, [qi]: oi })}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={submit}
        disabled={submitting}
        style={{
          background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6,
          padding: "10px 20px", cursor: submitting ? "default" : "pointer", fontWeight: 600,
        }}
      >
        {submitting ? "Submitting…" : "Submit quiz"}
      </button>
    </div>
  );
};

export default QuizRunner;
