import { makePRNG, seededShuffle } from "./prng.js";
import { ALL_WORD_MATCH } from "./wordMatchPool.js";
import { ALL_SENTENCE_BUILDER } from "./sentenceBuilderPool.js";
import { ALL_FILL_STORIES } from "./fillStoriesPool.js";

/** Number of distinct daily bundles before the cycle repeats (per game). */
export const CONTENT_ROTATION_DAYS = 90;

if (ALL_FILL_STORIES.length !== CONTENT_ROTATION_DAYS) {
  // eslint-disable-next-line no-console
  console.warn(`fillStoriesPool: expected ${CONTENT_ROTATION_DAYS} stories, got ${ALL_FILL_STORIES.length}`);
}

function dailyIndexFromSeed(seed) {
  const n = Number(seed);
  if (!Number.isFinite(n)) return 0;
  const x = (Math.imul(n | 0, 2654435761) + Math.floor(n / 1000000)) >>> 0;
  return x % CONTENT_ROTATION_DAYS;
}

function buildDailyPacks(pool, pick, salt) {
  return Array.from({ length: CONTENT_ROTATION_DAYS }, (_, d) => {
    const rng = makePRNG(salt ^ (d * 200021) ^ (d << 16));
    return seededShuffle([...pool], rng).slice(0, pick);
  });
}

const WORD_MATCH_PACKS = buildDailyPacks(ALL_WORD_MATCH, 6, 0x5eedcafe);
const SENTENCE_PACKS = buildDailyPacks(ALL_SENTENCE_BUILDER, 5, 0xc0ffee01);

/**
 * Deterministic content for calendar day `seed` (YYYYMMDD as integer).
 * Same date always maps to the same bundle; cycles every CONTENT_ROTATION_DAYS.
 */
export function getDailyData(seed) {
  const idx = dailyIndexFromSeed(seed);
  return {
    wordMatch: WORD_MATCH_PACKS[idx],
    sentenceBuilder: SENTENCE_PACKS[idx],
    fillStory: ALL_FILL_STORIES[idx],
  };
}
