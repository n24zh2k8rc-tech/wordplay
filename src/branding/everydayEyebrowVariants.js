/**
 * Brand line: "English" + rotating word ≈ "everyday".
 * Sequence alternates English "Everyday." with each translation so it always
 * returns to English between other languages.
 */
const EYEBROW_EVERYDAY_ENGLISH = { text: "Everyday.", lang: "en" };

const EYEBROW_EVERYDAY_FOREIGN = [
  { text: "Diario.", lang: "es" },
  { text: "Quotidien.", lang: "fr" },
  { text: "Täglich.", lang: "de" },
  { text: "Quotidiano.", lang: "it" },
  { text: "Diário.", lang: "pt" },
  { text: "Codziennie.", lang: "pl" },
  { text: "Dagelijks.", lang: "nl" },
  { text: "ทุกวัน", lang: "th" },
];

/** [en, es, en, fr, en, de, …] */
export const EYEBROW_EVERYDAY_VARIANTS = EYEBROW_EVERYDAY_FOREIGN.flatMap((variant) => [
  EYEBROW_EVERYDAY_ENGLISH,
  variant,
]);
