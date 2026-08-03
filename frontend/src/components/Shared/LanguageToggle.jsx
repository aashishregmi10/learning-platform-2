import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

import { useLanguage } from "../../i18n/LanguageContext";
import { LANGUAGES } from "../../i18n/strings";
import { statusTokens, tokens } from "../../theme";

/**
 * English / Nepali switch. Sits in the app bar so it's reachable from every
 * screen — a teacher who can't read the English labels shouldn't have to
 * navigate anywhere to fix that.
 */
export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  return (
    <Tooltip title="Language / भाषा">
      <ToggleButtonGroup
        size="small"
        exclusive
        value={lang}
        onChange={(_, next) => next && setLang(next)}
        sx={{
          mr: 1,
          "& .MuiToggleButton-root": {
            px: 1.25,
            py: 0.25,
            fontSize: "0.75rem",
            fontWeight: 700,
            color: tokens.muted,
            borderColor: tokens.border,
            "&.Mui-selected": {
              bgcolor: statusTokens.info.bg,
              color: statusTokens.info.fg,
              "&:hover": { bgcolor: statusTokens.info.bg },
            },
          },
        }}
      >
        {Object.entries(LANGUAGES).map(([code, meta]) => (
          <ToggleButton key={code} value={code} aria-label={meta.label}>
            {meta.short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Tooltip>
  );
};

export default LanguageToggle;
