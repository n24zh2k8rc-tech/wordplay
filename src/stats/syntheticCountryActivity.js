import { demoHash32 } from "../utils/demoHash32.js";

/** Fixed salt so per-country “totals” stay stable (not tied to the calendar day). */
const ILLUSTRATIVE_TOTALS_SEED = 0x5eede5;

/**
 * Synthetic illustrative “total users” per country (ISO 3166-1 numeric id string).
 * Stable across days — not real global analytics; see UI disclaimer.
 */
export function syntheticTotalUsersForNumericCountry(numericIdStr) {
  const id = parseInt(String(numericIdStr), 10);
  if (!Number.isFinite(id) || id <= 0) return 0;
  const h = demoHash32(ILLUSTRATIVE_TOTALS_SEED + id * 7_919 + 31);
  return 6_000 + (h % 9_994_000);
}

export function buildCountryTotalsMap(features) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  let max = 0;
  let min = Infinity;
  for (const f of features) {
    const id = f.id != null ? String(f.id) : "";
    if (!id) continue;
    const n = syntheticTotalUsersForNumericCountry(id);
    counts.set(id, n);
    if (n > max) max = n;
    if (n < min) min = n;
  }
  if (min === Infinity) min = 0;
  return { counts, min, max };
}
