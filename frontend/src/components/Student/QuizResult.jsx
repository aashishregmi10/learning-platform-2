const QuizResult = ({ quiz, result, onRetake, canRetake }) => (
  <div>
    <div
      style={{
        textAlign: "center", padding: "20px 16px", borderRadius: 10, marginBottom: 20,
        background: result.passed ? "#defbe6" : "#fdecea",
        border: `1px solid ${result.passed ? "#66bb6a" : "#e57373"}`,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "monospace" }}>{result.score}%</div>
      <div style={{ fontWeight: 600, color: result.passed ? "#2e7d32" : "#b3261e" }}>
        {result.passed ? "Passed" : "Not passed"}
      </div>
      <div style={{ color: "#8C7B6B", fontSize: 14 }}>
        {result.earnedPoints} / {result.totalPoints} points
      </div>
    </div>

    {result.results.map((r) => {
      const q = quiz.questions[r.questionIndex];
      return (
        <div key={r.questionIndex} style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #E7E0D4" }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            {r.questionIndex + 1}. {q.questionText}{" "}
            <span style={{ color: r.isCorrect ? "#2e7d32" : "#b3261e" }}>{r.isCorrect ? "✓" : "✗"}</span>
          </p>
          {q.options.map((opt, oi) => {
            const isSelected = r.selectedOptionIndex === oi;
            const isCorrectOpt = r.correctOptionIndex === oi;
            return (
              <div
                key={oi}
                style={{
                  padding: "6px 10px", borderRadius: 6, marginBottom: 2,
                  background: isCorrectOpt ? "#defbe6" : isSelected ? "#fdecea" : "transparent",
                  color: isCorrectOpt ? "#2e7d32" : isSelected ? "#b3261e" : "#1C1C1C",
                }}
              >
                {opt}
                {isCorrectOpt ? " (correct)" : isSelected ? " (your answer)" : ""}
              </div>
            );
          })}
          {r.explanation && (
            <p style={{ color: "#8C7B6B", fontSize: 14, marginTop: 6 }}>{r.explanation}</p>
          )}
        </div>
      );
    })}

    {canRetake && (
      <button
        onClick={onRetake}
        style={{ background: "#2D5A3D", color: "#fff", border: 0, borderRadius: 6, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}
      >
        Retake quiz
      </button>
    )}
  </div>
);

export default QuizResult;
