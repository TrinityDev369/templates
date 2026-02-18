import type { IconDefinition } from "./Icon";

const vb = "0 0 24 24";

// ── Navigation ──────────────────────────────────────────────────────────────

export const ChevronRight: IconDefinition = {
  name: "chevron-right",
  viewBox: vb,
  path: "M9 18l6-6-6-6",
};

export const ChevronDown: IconDefinition = {
  name: "chevron-down",
  viewBox: vb,
  path: "M6 9l6 6 6-6",
};

export const ChevronLeft: IconDefinition = {
  name: "chevron-left",
  viewBox: vb,
  path: "M15 18l-6-6 6-6",
};

export const ChevronUp: IconDefinition = {
  name: "chevron-up",
  viewBox: vb,
  path: "M18 15l-6-6-6 6",
};

export const ArrowRight: IconDefinition = {
  name: "arrow-right",
  viewBox: vb,
  path: "M5 12h14M12 5l7 7-7 7",
};

export const ArrowLeft: IconDefinition = {
  name: "arrow-left",
  viewBox: vb,
  path: "M19 12H5M12 19l-7-7 7-7",
};

export const ExternalLink: IconDefinition = {
  name: "external-link",
  viewBox: vb,
  path: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
};

export const Menu: IconDefinition = {
  name: "menu",
  viewBox: vb,
  path: "M4 12h16M4 6h16M4 18h16",
};

// ── Actions ─────────────────────────────────────────────────────────────────

export const X: IconDefinition = {
  name: "x",
  viewBox: vb,
  path: "M18 6L6 18M6 6l12 12",
};

export const Plus: IconDefinition = {
  name: "plus",
  viewBox: vb,
  path: "M12 5v14M5 12h14",
};

export const Minus: IconDefinition = {
  name: "minus",
  viewBox: vb,
  path: "M5 12h14",
};

export const Search: IconDefinition = {
  name: "search",
  viewBox: vb,
  path: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35",
};

export const Copy: IconDefinition = {
  name: "copy",
  viewBox: vb,
  path: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8z",
};

export const Check: IconDefinition = {
  name: "check",
  viewBox: vb,
  path: "M20 6L9 17l-5-5",
};

export const Edit: IconDefinition = {
  name: "edit",
  viewBox: vb,
  path: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
};

export const Trash: IconDefinition = {
  name: "trash",
  viewBox: vb,
  path: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
};

// ── Status ──────────────────────────────────────────────────────────────────

export const AlertCircle: IconDefinition = {
  name: "alert-circle",
  viewBox: vb,
  path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v4M12 16h.01",
};

export const CheckCircle: IconDefinition = {
  name: "check-circle",
  viewBox: vb,
  path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 12l2 2 4-4",
};

export const Info: IconDefinition = {
  name: "info",
  viewBox: vb,
  path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 16v-4M12 8h.01",
};

export const Loader: IconDefinition = {
  name: "loader",
  viewBox: vb,
  path: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

// ── Media ───────────────────────────────────────────────────────────────────

export const Sun: IconDefinition = {
  name: "sun",
  viewBox: vb,
  path: "M12 3a1 1 0 0 1 0 2 7 7 0 1 0 0 14 1 1 0 0 1 0 2M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
};

export const Moon: IconDefinition = {
  name: "moon",
  viewBox: vb,
  path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
};

export const Eye: IconDefinition = {
  name: "eye",
  viewBox: vb,
  path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
};

export const EyeOff: IconDefinition = {
  name: "eye-off",
  viewBox: vb,
  path: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22M10.59 10.59a3 3 0 0 0 4.24 4.24",
};
