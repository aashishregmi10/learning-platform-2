import {
  ScienceOutlined, BiotechOutlined, BoltOutlined, PetsOutlined, MenuBookOutlined,
} from "@mui/icons-material";

// Maps a subject name to a static illustration under /public/images/subjects
// so cards show a real cover image instead of a bare letter/blank box.
const SUBJECT_IMAGES = {
  Chemistry: "/images/subjects/chemistry.svg",
  Biology: "/images/subjects/biology.svg",
  Physics: "/images/subjects/physics.svg",
  Zoology: "/images/subjects/zoology.svg",
};

// Icon fallback for subjects without a dedicated illustration yet.
const SUBJECT_ICONS = {
  Chemistry: ScienceOutlined,
  Biology: BiotechOutlined,
  Physics: BoltOutlined,
  Zoology: PetsOutlined,
};

export const getSubjectImage = (name) => SUBJECT_IMAGES[name] || null;
export const getSubjectIcon = (name) => SUBJECT_ICONS[name] || MenuBookOutlined;
