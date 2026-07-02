import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useGetQuizQuery, useSubmitQuizMutation } from "../../../store/services/quizApi";
import QuizRunner from "../../../components/Student/QuizRunner";
import QuizResult from "../../../components/Student/QuizResult";

const QuizScreen = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetQuizQuery(id);
  const [submitQuiz, { isLoading: submitting }] = useSubmitQuizMutation();
  const [result, setResult] = useState(null);

  const quiz = data?.data;

  const handleSubmit = async ({ answers, startedAt }) => {
    try {
      const res = await submitQuiz({ id, answers, startedAt }).unwrap();
      setResult(res.data);
    } catch (err) {
      toast.error(err?.data?.message || "Could not submit quiz");
    }
  };

  const retake = () => {
    setResult(null);
    refetch();
  };

  if (isLoading) return <div style={{ padding: 24, color: "#6b7280" }}>Loading…</div>;
  if (error) return <div style={{ padding: 24, color: "#b3261e" }}>{error?.data?.message || "This quiz isn't available."}</div>;
  if (!quiz) return null;

  const canRetake = quiz.maxAttempts === 0 || quiz.attemptsUsed + 1 < quiz.maxAttempts;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link to="/app/student" style={{ color: "#1976d3", fontSize: 14 }}>← Back to catalog</Link>
      <h1 style={{ color: "#1976d3", marginTop: 8, marginBottom: 20 }}>{quiz.title}</h1>
      {quiz.description && <p style={{ color: "#8C7B6B", marginTop: -12, marginBottom: 20 }}>{quiz.description}</p>}

      {result ? (
        <QuizResult quiz={quiz} result={result} canRetake={canRetake} onRetake={retake} />
      ) : (
        <QuizRunner quiz={quiz} onSubmit={handleSubmit} submitting={submitting} />
      )}
    </div>
  );
};

export default QuizScreen;
