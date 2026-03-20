/**
 * Brand line: "English" + rotating word ≈ "everyday".
 * After each English "Everyday.", two different language variants play
 * before English returns — avoids feeling like back-to-back "English Everyday."
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
  { text: "毎日", lang: "ja" },
  { text: "매일", lang: "ko" },
];

/** Pairs of foreign lines, each preceded by English: en, A, B, en, C, D, … */
function buildEyebrowSequence() {
  const en = EYEBROW_EVERYDAY_ENGLISH;
  const out = [];
  for (let i = 0; i < EYEBROW_EVERYDAY_FOREIGN.length; i += 2) {
    const first = EYEBROW_EVERYDAY_FOREIGN[i];
    const second = EYEBROW_EVERYDAY_FOREIGN[i + 1];
    out.push(en, first);
    if (second) out.push(second);
  }
  return out;
}

export const EYEBROW_EVERYDAY_VARIANTS = buildEyebrowSequence();
