import { deepMerge } from "../deepMerge.js";
import { en } from "./en.js";
import { localeOverrides } from "./overrides.js";

export { en };

const BUNDLES = { en, ...localeOverrides };

export const UI_LANGUAGE_CODES = Object.keys(BUNDLES);

export function getMergedMessages(code) {
  const override = BUNDLES[code];
  if (!override || code === "en") return deepMerge({}, en);
  return deepMerge({}, en, override);
}
