/** Deterministic 32-bit mix for seeded demo / synthetic data (per day, etc.). */
export function demoHash32(n) {
  let x = n >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
