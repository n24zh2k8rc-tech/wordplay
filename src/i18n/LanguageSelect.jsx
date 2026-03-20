import { useEffect, useId, useRef, useState } from "react";
import { UI_LANGUAGES } from "./languageOptions.jsx";

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.value
 * @param {(code: string) => void} props.onChange
 * @param {string} [props.labelledBy] - id of label element (settings form)
 * @param {string} [props.ariaLabel] - when no labelledBy (e.g. nav)
 * @param {"default" | "nav"} [props.variant]
 */
export function LanguageSelect({ id, value, onChange, labelledBy, ariaLabel, variant = "default" }) {
  const autoId = useId();
  const listId = `${autoId}-list`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = UI_LANGUAGES.find((l) => l.code === value) || UI_LANGUAGES[0];
  const { Flag: CurrentFlag } = current;
  const isNav = variant === "nav";

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rootClass = `language-select${isNav ? " language-select--nav" : ""}`;

  return (
    <div className={rootClass} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={`language-select-trigger${isNav ? " language-select-trigger--nav" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy || undefined}
        aria-label={!labelledBy ? ariaLabel : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="language-select-flag" aria-hidden="true">
          <CurrentFlag className="language-flag-svg" />
        </span>
        {isNav ? (
          <span className="language-select-label language-select-label--nav-pill">{current.label}</span>
        ) : (
          <span className="language-select-label">{current.label}</span>
        )}
        <span className="language-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          className={`language-select-menu${isNav ? " language-select-menu--nav" : ""}`}
          role="listbox"
          aria-activedescendant={`${id}-opt-${value}`}
        >
          {UI_LANGUAGES.map((lang) => {
            const { Flag } = lang;
            const selected = lang.code === value;
            return (
              <li key={lang.code} role="presentation">
                <button
                  type="button"
                  id={`${id}-opt-${lang.code}`}
                  role="option"
                  aria-selected={selected}
                  className={`language-select-option${selected ? " selected" : ""}${isNav ? " language-select-option--nav" : ""}`}
                  onClick={() => {
                    onChange(lang.code);
                    setOpen(false);
                  }}
                >
                  <span className="language-select-flag" aria-hidden="true">
                    <Flag className="language-flag-svg" />
                  </span>
                  {isNav ? (
                    <span className="language-select-option-text language-select-label--full">{lang.label}</span>
                  ) : (
                    <span>{lang.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
