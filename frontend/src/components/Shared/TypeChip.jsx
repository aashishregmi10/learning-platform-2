import { Chip } from "@mui/material";
import {
  ArticleOutlined,
  ChatBubbleOutlineOutlined,
  HelpOutlineOutlined,
  OndemandVideoOutlined,
  PictureAsPdfOutlined,
} from "@mui/icons-material";

import { chipTones, statusTokens } from "../../theme";

/** Content-type vocabulary shared by the chapter rows and the upload form. */
export const CONTENT_TYPES = {
  video: { label: "Video", tone: chipTones.video, Icon: OndemandVideoOutlined },
  pdf: { label: "PDF", tone: chipTones.article, Icon: PictureAsPdfOutlined },
  article: { label: "Article", tone: chipTones.article, Icon: ArticleOutlined },
  note: { label: "Notes", tone: chipTones.notes, Icon: ChatBubbleOutlineOutlined },
  notes: { label: "Notes", tone: chipTones.notes, Icon: ChatBubbleOutlineOutlined },
  quiz: { label: "Quiz", tone: chipTones.quiz, Icon: HelpOutlineOutlined },
};

export const typeMeta = (type) =>
  CONTENT_TYPES[String(type ?? "").toLowerCase()] ?? {
    label: type || "Item",
    tone: statusTokens.neutral,
    Icon: ArticleOutlined,
  };

export const TypeChip = ({ type }) => {
  const { label, tone } = typeMeta(type);
  return (
    <Chip size="small" label={label} sx={{ bgcolor: tone.bg, color: tone.fg, border: "none" }} />
  );
};

export default TypeChip;
