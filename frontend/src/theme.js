import { createTheme } from "@mui/material/styles";

/**
 * Grey-and-white design system. Near-black is the only "accent" — colour is
 * reserved for status (published / draft) and content-type chips, so a page of
 * chapters reads as structure first and colour second.
 */
export const tokens = {
  ink: "#171717", // headings, primary buttons, active tab underline
  body: "#3F3F46", // body copy
  muted: "#71717A", // captions, meta lines, inactive tabs
  faint: "#A1A1AA", // placeholders, disabled
  border: "#E5E5E5", // every hairline in the UI
  borderStrong: "#D4D4D8", // hover / focus edge
  surface: "#FFFFFF", // cards, drawers, app bar
  surfaceMuted: "#F7F7F8", // accordion headers, table heads, hover rows
  canvas: "#FBFBFC", // page background behind the cards
};

/**
 * Semantic status roles — the ONLY colours in the app that aren't grey.
 *
 * Five roles, each a light `bg` + a darker `fg` (never black, all ≥ 4.5:1 on
 * their own background) + a `solid` for dots, bars and filled buttons. Colour
 * here always encodes good / attention / bad / informational / no-judgement —
 * never decoration, variety or category. If a value needs a colour that isn't
 * one of these five, the answer is grey.
 *
 * Mirrored as --status-* custom properties in index.css for the few
 * student/guest components that still render with plain `style` attributes.
 */
export const statusTokens = {
  info: { bg: "#EAF2FF", fg: "#1D4ED8", solid: "#2563EB" }, // 6.9:1
  success: { bg: "#E7F6EC", fg: "#166534", solid: "#16A34A" }, // 6.9:1
  warning: { bg: "#FEF3E2", fg: "#B45309", solid: "#D97706" }, // 5.0:1
  danger: { bg: "#FEE9E9", fg: "#B91C1C", solid: "#DC2626" }, // 6.2:1
  neutral: { bg: "#F4F4F5", fg: "#52525B", solid: "#71717A" }, // 5.9:1
};

/**
 * Content-type chips. Type is a category, not a judgement, so these borrow the
 * status palette rather than introducing colours of their own — that keeps the
 * total count of non-grey values in the app at five.
 */
export const chipTones = {
  article: statusTokens.info,
  notes: statusTokens.success,
  quiz: statusTokens.warning,
  video: statusTokens.neutral,
  pdf: statusTokens.info,
};

export const theme = createTheme({
  palette: {
    mode: "light",
    // Accent blue drives everything interactive — buttons, links, tabs, focus
    // rings, active nav. Surfaces stay warm grey/white underneath it.
    primary: { main: statusTokens.info.solid, dark: "#1D4ED8", contrastText: "#FFFFFF" },
    secondary: { main: tokens.muted },
    // MUI's own semantic slots point at the same solids, so any stray
    // color="error" / "success" prop lands on the system rather than beside it.
    info: { main: statusTokens.info.solid },
    success: { main: statusTokens.success.solid },
    warning: { main: statusTokens.warning.solid },
    error: { main: statusTokens.danger.solid },
    divider: tokens.border,
    text: { primary: tokens.ink, secondary: tokens.muted, disabled: tokens.faint },
    background: { default: tokens.canvas, paper: tokens.surface },
  },

  typography: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: 15,
    h5: { fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontSize: "1.05rem", fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { fontSize: "0.95rem", fontWeight: 600 },
    subtitle2: { fontSize: "0.85rem", fontWeight: 600 },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem", color: tokens.muted },
    button: { textTransform: "none", fontWeight: 600 },
  },

  shape: { borderRadius: 8 },

  components: {
    // Flat by default — separation comes from 1px borders, not shadows.
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: tokens.border },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16 },
        containedPrimary: {
          backgroundColor: statusTokens.info.solid,
          "&:hover": { backgroundColor: statusTokens.info.fg },
        },
        outlinedPrimary: {
          borderColor: "#BFD5FF",
          color: statusTokens.info.fg,
          "&:hover": {
            borderColor: statusTokens.info.solid,
            backgroundColor: statusTokens.info.bg,
          },
        },
        textPrimary: {
          color: statusTokens.info.fg,
          "&:hover": { backgroundColor: statusTokens.info.bg },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44, borderBottom: `1px solid ${tokens.border}` },
        indicator: { backgroundColor: statusTokens.info.solid, height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: "10px 4px",
          marginRight: 28,
          minWidth: 0,
          fontWeight: 500,
          color: tokens.muted,
          "&.Mui-selected": { color: statusTokens.info.fg, fontWeight: 600 },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600, fontSize: "0.72rem" },
        sizeSmall: { height: 22 },
        outlined: { borderColor: tokens.border, color: tokens.body },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.borderStrong },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: statusTokens.info.solid,
            borderWidth: 1,
          },
        },
      },
    },
    // Field labels: muted at rest, accent while the field has focus. This
    // resolves through FormLabel — overriding InputLabel alone misses it.
    MuiFormLabel: {
      styleOverrides: {
        root: { color: tokens.muted, "&.Mui-focused": { color: statusTokens.info.fg } },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: tokens.body,
          "&:hover": { backgroundColor: statusTokens.info.bg },
        },
      },
    },
    // Icons keep whatever colour the menu item hands them.
    MuiListItemIcon: { styleOverrides: { root: { color: "inherit" } } },

    MuiDivider: { styleOverrides: { root: { borderColor: tokens.border } } },
    MuiTableCell: { styleOverrides: { root: { borderColor: tokens.border } } },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .Mui-checked": { color: statusTokens.info.solid },
          "& .Mui-checked + .MuiSwitch-track": { backgroundColor: statusTokens.info.solid },
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: { root: { color: statusTokens.info.fg } },
    },
    MuiAlert: { defaultProps: { variant: "outlined" } },
    MuiCircularProgress: { styleOverrides: { root: { color: statusTokens.info.solid } } },
    MuiIconButton: {
      styleOverrides: {
        root: { color: tokens.muted, "&:hover": { backgroundColor: statusTokens.info.bg } },
        colorPrimary: { color: statusTokens.info.solid },
        colorSuccess: { color: statusTokens.success.solid },
        colorWarning: { color: statusTokens.warning.solid },
        colorError: { color: statusTokens.danger.solid },
      },
    },
  },
});

export default theme;
