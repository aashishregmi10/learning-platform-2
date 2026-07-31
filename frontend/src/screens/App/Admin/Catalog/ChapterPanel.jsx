import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import {
  ExpandMore,
  Add,
  DeleteOutlined,
  Visibility,
  VisibilityOff,
  QuizOutlined,
  QuestionAnswerOutlined,
} from "@mui/icons-material";

import { statusTokens, tokens } from "../../../../theme";
import StatusBadge from "../../../../components/Shared/StatusBadge";
import { TypeChip, typeMeta } from "../../../../components/Shared/TypeChip";
import { relativeTime } from "../../../../utils/relativeTime";
import {
  useGetContentsQuery,
  useDeleteContentMutation,
} from "../../../../store/services/contentApi";
import {
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from "../../../../store/services/chapterApi";
import { useGetChapterDoubtsQuery } from "../../../../store/services/doubtApi";
import { useAuth } from "../../../../hooks/useAuth";
import ContentUploadForm from "./ContentUploadForm";
import DoubtThread from "../../../../components/Student/DoubtThread";
import DoubtComposer from "../../../../components/Student/DoubtComposer";

const ChapterPanel = ({ chapter }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data, isFetching } = useGetContentsQuery({ chapter: chapter._id });
  const [updateChapter] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [deleteContent] = useDeleteContentMutation();
  const [showUpload, setShowUpload] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);
  const { data: doubtsRes } = useGetChapterDoubtsQuery(chapter._id, { skip: !showDoubts });

  const contents = data?.data ?? [];
  const editedAt = relativeTime(chapter.updatedAt || chapter.createdAt);

  const togglePublish = async () => {
    try {
      await updateChapter({ id: chapter._id, isPublished: !chapter.isPublished }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  const removeChapter = async () => {
    if (!confirm("Delete this chapter?")) return;
    try {
      await deleteChapter(chapter._id).unwrap();
    } catch {
      toast.error("Could not delete this chapter");
    }
  };

  return (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ fontSize: 20, color: tokens.muted }} />}
        sx={{
          bgcolor: tokens.surfaceMuted,
          flexDirection: "row-reverse",
          gap: 1.5,
          px: 2,
          "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(180deg)" },
          "& .MuiAccordionSummary-content": { my: 1.5 },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: tokens.ink }}>
              Chapter {chapter.chapterNumber}: {chapter.title}
            </Typography>
            {/* Free preview is informational; an unpublished chapter needs action. */}
            {chapter.isFreePreview && <StatusBadge role="info" label="Free preview" />}
            {!chapter.isPublished && <StatusBadge role="warning" label="Draft" />}
          </Box>
          <Typography variant="caption" sx={{ display: "block", mt: 0.25 }}>
            {contents.length} topic{contents.length === 1 ? "" : "s"}
            {editedAt ? ` · Last edited ${editedAt}` : ""}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${tokens.border}` }}>
        <Box sx={{ px: 1, py: 1 }}>
          {contents.length === 0 && !isFetching && (
            <Typography variant="body2" sx={{ color: tokens.muted, px: 2, py: 1.5 }}>
              Nothing in this chapter yet — add the first topic.
            </Typography>
          )}
          {contents.map((c, i) => {
            const { Icon } = typeMeta(c.type);
            return (
              <Box
                key={c._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  "&:hover": { bgcolor: tokens.surfaceMuted },
                  "&:hover .row-actions": { opacity: 1 },
                }}
              >
                <Icon sx={{ fontSize: 18, color: tokens.faint }} />
                <Typography variant="body2" sx={{ color: tokens.body, flexGrow: 1 }}>
                  {chapter.chapterNumber}.{c.order || i + 1} {c.title}
                </Typography>
                {c.isFree && (
                  <Typography variant="caption" sx={{ color: statusTokens.info.fg, fontWeight: 600 }}>
                    Free
                  </Typography>
                )}
                <TypeChip type={c.type} />
                <IconButton
                  className="row-actions"
                  size="small"
                  color="error"
                  sx={{ opacity: 0, transition: "opacity .15s" }}
                  title="Delete"
                  onClick={async () => {
                    try {
                      await deleteContent(c._id).unwrap();
                    } catch {
                      toast.error("Could not delete");
                    }
                  }}
                >
                  <DeleteOutlined sx={{ fontSize: 17 }} />
                </IconButton>
              </Box>
            );
          })}
        </Box>

        {showUpload && (
          <Box sx={{ px: 2, pb: 2 }}>
            <ContentUploadForm chapterId={chapter._id} onDone={() => setShowUpload(false)} />
          </Box>
        )}

        {showDoubts && (
          <Box sx={{ mx: 2, mb: 2, p: 2, border: `1px solid ${tokens.border}`, borderRadius: 2 }}>
            <DoubtThread doubts={doubtsRes?.data} chapter={chapter._id} canResolve />
            <Box sx={{ mt: 1.5 }}>
              <DoubtComposer chapter={chapter._id} />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            borderTop: `1px solid ${tokens.border}`,
            bgcolor: tokens.surfaceMuted,
          }}
        >
          <Button
            size="small"
            startIcon={chapter.isPublished ? <VisibilityOff /> : <Visibility />}
            onClick={togglePublish}
          >
            {chapter.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              size="small"
              startIcon={<QuizOutlined />}
              onClick={() =>
                navigate(`/app/${role}/quizzes?chapter=${chapter._id}&subject=${chapter.subject}`)
              }
            >
              Quizzes{chapter.quizCount ? ` (${chapter.quizCount})` : ""}
            </Button>
            <Button size="small" startIcon={<Add />} onClick={() => setShowUpload((s) => !s)}>
              Add topic
            </Button>
            <Button
              size="small"
              startIcon={<QuestionAnswerOutlined />}
              onClick={() => setShowDoubts((s) => !s)}
            >
              Q&A
            </Button>
            <IconButton size="small" color="error" title="Delete chapter" onClick={removeChapter}>
              <DeleteOutlined sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChapterPanel;
