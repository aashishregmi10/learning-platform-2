import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Chip, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Add, DeleteOutlined, EditOutlined, Visibility, VisibilityOff } from "@mui/icons-material";

import BreadcrumbLayout from "../../../../components/Shared/BreadcrumbLayout";
import { useAuth } from "../../../../hooks/useAuth";
import {
  useListQuizzesQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from "../../../../store/services/quizApi";

const QuizListScreen = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const chapter = params.get("chapter");
  const subject = params.get("subject");

  const { data, isFetching, error } = useListQuizzesQuery({ chapter }, { skip: !chapter });
  const [updateQuiz] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();

  const quizzes = data?.data ?? [];

  const togglePublish = async (quiz) => {
    try {
      await updateQuiz({ id: quiz._id, isPublished: !quiz.isPublished }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  return (
    <BreadcrumbLayout
      breadcrumbs={[
        ...(subject ? [{ title: "Subject", path: `/app/${role}/${role === "admin" ? "catalog/subjects" : "subjects"}/${subject}` }] : []),
        { title: "Quizzes" },
      ]}
      isBusy={isFetching}
      headerActions={
        chapter && (
          <Button
            component={Link}
            to={`/app/${role}/quizzes/create?chapter=${chapter}${subject ? `&subject=${subject}` : ""}`}
            startIcon={<Add />}
            variant="contained"
            sx={{ bgcolor: "#1976d3" }}
          >
            New Quiz
          </Button>
        )
      }
    >
      <BreadcrumbLayout.Error error={error} />
      {!chapter && <Typography sx={{ p: 2, color: "#6b7280" }}>No chapter selected.</Typography>}

      <BreadcrumbLayout.Paper>
        <List dense>
          {chapter && quizzes.length === 0 && !isFetching && (
            <Typography sx={{ p: 2, color: "#6b7280" }}>No quizzes yet — add the first one.</Typography>
          )}
          {quizzes.map((q) => (
            <ListItem
              key={q._id}
              secondaryAction={
                <>
                  <IconButton size="small" title={q.isPublished ? "Unpublish" : "Publish"} onClick={() => togglePublish(q)}>
                    {q.isPublished ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Edit"
                    onClick={() => navigate(`/app/${role}/quizzes/${q._id}/edit?chapter=${chapter}${subject ? `&subject=${subject}` : ""}`)}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    title="Delete"
                    onClick={async () => {
                      if (confirm(`Delete "${q.title}"?`)) {
                        try {
                          await deleteQuiz(q._id).unwrap();
                        } catch {
                          toast.error("Failed to delete");
                        }
                      }
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </>
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ListItemText primary={q.title} secondary={`${q.questions.length} question${q.questions.length !== 1 ? "s" : ""} · passing ${q.passingScore}%`} />
                <Chip size="small" label={q.isPublished ? "Published" : "Draft"} color={q.isPublished ? "success" : "default"} />
              </Box>
            </ListItem>
          ))}
        </List>
      </BreadcrumbLayout.Paper>
    </BreadcrumbLayout>
  );
};

export default QuizListScreen;
