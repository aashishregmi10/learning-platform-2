const QuizResult = ({ quiz, result, onRetake, canRetake }) => (
  <div>
    <div
      style={{
        textAlign: "center", padding: "20px 16px", borderRadius: 10, marginBottom: 20,
        background: result.passed ? "var(--status-success-bg)" : "var(--status-danger-bg)",
        border: `1px solid ${result.passed ? "var(--status-success-solid)" : "var(--status-danger-solid)"}`,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "monospace" }}>{result.score}%</div>
      <div style={{ fontWeight: 600, color: result.passed ? "var(--status-success-fg)" : "var(--status-danger-fg)" }}>
        {result.passed ? "Passed" : "Not passed"}
      </div>
      <div style={{ color: "#71717A", fontSize: 14 }}>
        {result.earnedPoints} / {result.totalPoints} points
      </div>
    </div>

    {result.results.map((r) => {
      const q = quiz.questions[r.questionIndex];
      return (
        <div key={r.questionIndex} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #D4D4D8" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            {r.questionIndex + 1}. {q.questionText}{" "}
            <span style={{ color: r.isCorrect ? "var(--status-success-fg)" : "var(--status-danger-fg)" }}>{r.isCorrect ? "✓" : "✗"}</span>
          </p>
          {q.options.map((opt, oi) => {
            const isSelected = r.selectedOptionIndex === oi;
            const isCorrectOpt = r.correctOptionIndex === oi;
            return (
              <div
                key={oi}
                style={{
                  padding: "6px 10px", borderRadius: 6, marginBottom: 2,
                  background: isCorrectOpt ? "var(--status-success-bg)" : isSelected ? "var(--status-danger-bg)" : "transparent",
                  color: isCorrectOpt ? "var(--status-success-fg)" : isSelected ? "var(--status-danger-fg)" : "#171717",
                }}
              >
                {opt}
                {isCorrectOpt ? " (correct)" : isSelected ? " (your answer)" : ""}
              </div>
            );
          })}
          {r.explanation && (
            <p style={{ color: "#71717A", fontSize: 14, marginTop: 6 }}>{r.explanation}</p>
          )}
        </div>
      );
    })}

    {canRetake && (
      <button
        onClick={onRetake}
        style={{ background: "var(--primary)", color: "#fff", border: 0, borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
      >
        Retake quiz
      </button>
    )}
  </div>
);

export default QuizResult;
