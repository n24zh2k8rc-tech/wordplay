/** Deep-merge plain objects (for locale overrides over English). */
export function deepMerge(target, ...sources) {
  const out = target && typeof target === "object" ? { ...target } : {};
  for (const src of sources) {
    if (!src || typeof src !== "object") continue;
    for (const key of Object.keys(src)) {
      const sv = src[key];
      const ov = out[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv)) {
        out[key] = deepMerge(ov && typeof ov === "object" && !Array.isArray(ov) ? ov : {}, sv);
      } else {
        out[key] = sv;
      }
    }
  }
  return out;
}

function getByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(str, vars) {
  if (!vars || typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export function makeTranslator(dict) {
  return function t(key, vars) {
    const v = getByPath(dict, key);
    if (v !== undefined) return interpolate(v, vars);
    return key;
  };
}
