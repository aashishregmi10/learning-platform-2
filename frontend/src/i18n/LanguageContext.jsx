import { createContext, useCallback, useContext, useMemo, useState } from "react";

import strings, { LANGUAGES } from "./strings";

const STORAGE_KEY = "bscnepal.lang";

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const saved = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    return saved && LANGUAGES[saved] ? saved : "en";
  });

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode / storage disabled — the choice just won't persist
    }
  }, []);

  /**
   * t("chapter.add") → the label in the active language.
   * Falls back to English, then to the key itself, so a missing translation
   * degrades to readable text rather than a blank button.
   */
  const t = useCallback(
    (key) => {
      const entry = strings[key];
      if (!entry) return key;
      return entry[lang] ?? entry.en ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

/** Shorthand for components that only need the translate function. */
export const useT = () => useContext(LanguageContext).t;

export default LanguageProvider;
