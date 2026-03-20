import { useContext } from "react";
import { deepMerge, makeTranslator } from "./deepMerge.js";
import { en } from "./messages/en.js";
import { I18nContext } from "./I18nContext.js";

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const fallbackT = makeTranslator(deepMerge({}, en));
    return {
      language: "en",
      setLanguage: () => {},
      t: fallbackT,
      dict: en,
    };
  }
  return ctx;
}
