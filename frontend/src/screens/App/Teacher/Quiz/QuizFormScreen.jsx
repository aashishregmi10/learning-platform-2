import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box, Button, Divider, FormControlLabel, IconButton, Radio, Switch, TextField, Typography,
} from "@mui/material";
import { Add, DeleteOutlined } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useListQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
} from "../../../../store/services/quizApi";

const emptyQuestion = () => ({ questionText: "", options: ["", ""], correctOptionIndex: 0, explanation: "", points: 1 });
const empty = { title: "", description: "", passingScore: 50, timeLimitMinutes: "", maxAttempts: 0, isPublished: false, questions: [emptyQuestion()] };

const QuizFormScreen = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const chapter = params.get("chapter");
  const subject = params.get("subject");
  const isEdit = !!id;

  const { data } = useListQuizzesQuery({ chapter }, { skip: !isEdit || !chapter });
  const [createQuiz, { isLoading: creating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: updating }] = useUpdateQuizMutation();

  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isEdit) return;
    const existing = data?.data?.find((q) => q._id === id);
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description || "",
        passingScore: existing.passingScore,
        timeLimitMinutes: existing.timeLimitMinutes || "",
        maxAttempts: existing.maxAttempts,
        isPublished: existing.isPublished,
        questions: existing.questions.map((q) => ({ ...q, options: [...q.options] })),
      });
    }
  }, [data, id, isEdit]);

  const backTo = () => navigate(`/app/${role}/quizzes?chapter=${chapter}${subject ? `&subject=${subject}` : ""}`);

  const updateQuestion = (qi, patch) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) }));

  const updateOption = (qi, oi, value) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q)),
    }));

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (qi) => setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));
  const addOption = (qi) => updateQuestion(qi, { options: [...form.questions[qi].options, ""] });
  const removeOption = (qi, oi) => {
    const q = form.questions[qi];
    if (q.options.length <= 2) return;
    updateQuestion(qi, {
      options: q.options.filter((_, j) => j !== oi),
      correctOptionIndex: q.correctOptionIndex >= oi ? Math.max(0, q.correctOptionIndex - 1) : q.correctOptionIndex,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()))) {
      toast.error("Every question needs text and all options filled in");
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      passingScore: Number(form.passingScore),
      timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
      maxAttempts: Number(form.maxAttempts),
      isPublished: form.isPublished,
      questions: form.questions.map((q) => ({ ...q, points: Number(q.points) || 1 })),
    };
    try {
      if (isEdit) await updateQuiz({ id, ...payload }).unwrap();
      else await createQuiz({ chapter, ...payload }).unwrap();
      toast.success(`Quiz ${isEdit ? "updated" : "created"}`);
      backTo();
    } catch (err) {
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[{ title: "Quizzes", path: `/app/${role}/quizzes?chapter=${chapter}${subject ? `&subject=${subject}` : ""}` }, { title: isEdit ? "Edit" : "New" }]}
      isBusy={creating || updating}
    >
      <BreadcrumbLayout.Paper>
        <Box component="form" onSubmit={submit} sx={{ p: 3, display: "grid", gap: 2 }}>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <TextField required size="small" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField size="small" type="number" label="Passing score (%)" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} />
            <TextField size="small" type="number" label="Time limit (minutes, blank = none)" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} />
            <TextField size="small" type="number" label="Max attempts (0 = unlimited)" value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} />
            <TextField sx={{ gridColumn: "1 / -1" }} multiline minRows={2} size="small" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel
              control={<Switch checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />}
              label="Published (visible to entitled students)"
            />
          </Box>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">Questions</Typography>

          {form.questions.map((q, qi) => (
            <Box key={qi} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, display: "grid", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <TextField
                  fullWidth size="small" label={`Question ${qi + 1}`} value={q.questionText}
                  onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
                />
                <TextField
                  size="small" type="number" label="Points" sx={{ width: 100 }} value={q.points}
                  onChange={(e) => updateQuestion(qi, { points: e.target.value })}
                />
                <IconButton size="small" color="error" onClick={() => removeQuestion(qi)} disabled={form.questions.length <= 1}>
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Box>

              {q.options.map((opt, oi) => (
                <Box key={oi} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Radio size="small" checked={q.correctOptionIndex === oi} onChange={() => updateQuestion(qi, { correctOptionIndex: oi })} title="Correct answer" />
                  <TextField fullWidth size="small" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
                  <IconButton size="small" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => addOption(qi)} sx={{ justifySelf: "start" }}>
                Add option
              </Button>

              <TextField
                size="small" label="Explanation (shown after submit)" value={q.explanation}
                onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
              />
            </Box>
          ))}

          <Button startIcon={<Add />} onClick={addQuestion} sx={{ justifySelf: "start" }}>
            Add question
          </Button>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
            <Button onClick={backTo}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#1976d3" }}>{isEdit ? "Update" : "Create"}</Button>
          </Box>
        </Box>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default QuizFormScreen;
