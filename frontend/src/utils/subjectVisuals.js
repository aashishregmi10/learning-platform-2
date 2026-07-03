import {
  ScienceOutlined, BiotechOutlined, BoltOutlined, PetsOutlined, MenuBookOutlined,
} from "@mui/icons-material";

// Maps a subject name to a representative icon so cards show a static
// illustration instead of a bare letter/blank box. Falls back to a generic
// book icon for subjects outside the known set.
const SUBJECT_ICONS = {
  Chemistry: ScienceOutlined,
  Biology: BiotechOutlined,
  Physics: BoltOutlined,
  Zoology: PetsOutlined,
};

export const getSubjectIcon = (name) => SUBJECT_ICONS[name] || MenuBookOutlined;
