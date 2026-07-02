import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, IconButton, List,
  ListItem, ListItemText, Switch, Tooltip, Typography,
} from "@mui/material";
import {
  ExpandMore, Add, DeleteOutlined, Visibility, VisibilityOff,
  OndemandVideo, PictureAsPdf, Notes, Link as LinkIcon, QuizOutlined,
} from "@mui/icons-material";

import {
  useGetContentsQuery,
  useDeleteContentMutation,
} from "../../../../store/services/contentApi";
import { useUpdateChapterMutation, useDeleteChapterMutation } from "../../../../store/services/chapterApi";
import { useAuth } from "../../../../hooks/useAuth";
import ContentUploadForm from "./ContentUploadForm";

const ICON = { video: <OndemandVideo fontSize="small" />, pdf: <PictureAsPdf fontSize="small" />, note: <Notes fontSize="small" />, link: <LinkIcon fontSize="small" />, audio: <OndemandVideo fontSize="small" /> };

const ChapterPanel = ({ chapter }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data, isFetching } = useGetContentsQuery({ chapter: chapter._id });
  const [updateChapter] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [deleteContent] = useDeleteContentMutation();
  const [showUpload, setShowUpload] = useState(false);

  const contents = data?.data ?? [];

  const togglePublish = async () => {
    try {
      await updateChapter({ id: chapter._id, isPublished: !chapter.isPublished }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  return (
    <Accordion variant="outlined" disableGutters>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>
            {chapter.chapterNumber}. {chapter.title}
          </Typography>
          {chapter.isFreePreview && <Chip size="small" color="success" label="Free preview" />}
          <Chip size="small" variant="outlined" label={chapter.isPublished ? "Published" : "Draft"} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Tooltip title={chapter.isPublished ? "Unpublish" : "Publish"}>
            <Button size="small" startIcon={chapter.isPublished ? <VisibilityOff /> : <Visibility />} onClick={togglePublish}>
              {chapter.isPublished ? "Unpublish" : "Publish"}
            </Button>
          </Tooltip>
          <Box>
            <Button
              size="small"
              startIcon={<QuizOutlined />}
              onClick={() => navigate(`/app/${role}/quizzes?chapter=${chapter._id}&subject=${chapter.subject}`)}
            >
              Quizzes{chapter.quizCount ? ` (${chapter.quizCount})` : ""}
            </Button>
            <Button size="small" startIcon={<Add />} onClick={() => setShowUpload((s) => !s)}>Add content</Button>
            <IconButton size="small" color="error" title="Delete chapter" onClick={async () => {
              if (confirm("Delete this chapter?")) {
                try { await deleteChapter(chapter._id).unwrap(); } catch (e) { toast.error("Failed"); }
              }
            }}>
              <DeleteOutlined fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {showUpload && (
          <ContentUploadForm chapterId={chapter._id} onDone={() => setShowUpload(false)} />
        )}

        <List dense>
          {contents.length === 0 && !isFetching && (
            <Typography variant="body2" sx={{ color: "#6b7280", px: 2 }}>No content yet.</Typography>
          )}
          {contents.map((c) => (
            <ListItem
              key={c._id}
              secondaryAction={
                <IconButton edge="end" size="small" color="error" onClick={async () => {
                  try { await deleteContent(c._id).unwrap(); } catch (e) { toast.error("Failed"); }
                }}>
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              }
            >
              <Box sx={{ mr: 1.5, color: "#6b7280" }}>{ICON[c.type]}</Box>
              <ListItemText
                primary={`${c.order ? c.order + ". " : ""}${c.title}`}
                secondary={`${c.type}${c.isFree ? " · free" : ""} · ${c.status}`}
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChapterPanel;
