import { useCallback, useEffect, useMemo, useState } from "react";
import { makeTranslator } from "./deepMerge.js";
import { I18nContext } from "./I18nContext.js";
import { getMergedMessages, UI_LANGUAGE_CODES } from "./messages/index.js";

const STORAGE_KEY = "wordplay-ui-language";
const IPAPI_URL = "https://ipapi.co/json/";

function readStoredLanguage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && UI_LANGUAGE_CODES.includes(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function languageFromCountryCode(countryCode) {
  if (!countryCode || typeof countryCode !== "string") return "en";
  const upper = countryCode.toUpperCase();
  if (upper === "ES") return "es";
  if (upper === "FR") return "fr";
  if (upper === "TH") return "th";
  return "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => readStoredLanguage() ?? "en");

  const setLanguage = useCallback((code) => {
    const next = UI_LANGUAGE_CODES.includes(code) ? code : "en";
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (readStoredLanguage() !== null) return;

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(IPAPI_URL, {
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (ac.signal.aborted) return;
        const next = languageFromCountryCode(data.country_code);
        setLanguageState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        /* network / parse error — keep initial English */
      }
    })();

    return () => ac.abort();
  }, []);

  const dict = useMemo(() => getMergedMessages(language), [language]);

  const t = useMemo(() => makeTranslator(dict), [dict]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dict,
    }),
    [language, setLanguage, t, dict],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
