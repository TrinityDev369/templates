"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme if nothing is stored. Defaults to "system". */
  defaultTheme?: Theme;
  /** localStorage key. Defaults to "theme". */
  storageKey?: string;
  /** HTML attribute to set on <html>. Defaults to "class". */
  attribute?: "class" | "data-theme";
  /** Enable smooth transition when switching themes. Defaults to true. */
  enableTransition?: boolean;
}

const VALID_THEMES: ReadonlySet<string> = new Set(["light", "dark", "system"]);

function getStoredTheme(key: string, fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored && VALID_THEMES.has(stored)) return stored as Theme;
  } catch {
    // localStorage unavailable (private browsing, storage disabled)
  }
  return fallback;
}

function setStoredTheme(key: string, value: Theme): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableTransition = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getStoredTheme(storageKey, defaultTheme)
  );

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === "system") return getSystemTheme();
    return theme;
  });

  const applyTheme = useCallback(
    (resolved: ResolvedTheme, animate: boolean) => {
      const root = document.documentElement;

      if (animate && enableTransition) {
        root.classList.add("theme-transition");
        // Remove transition class after animation completes
        window.setTimeout(() => root.classList.remove("theme-transition"), 250);
      }

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      } else {
        root.setAttribute("data-theme", resolved);
      }
      root.style.colorScheme = resolved;
    },
    [attribute, enableTransition]
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      setStoredTheme(storageKey, newTheme);
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
      setResolvedTheme(resolved);
      applyTheme(resolved, true);
    },
    [storageKey, applyTheme]
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved, true);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  // Apply on mount (no transition on initial load)
  useEffect(() => {
    applyTheme(resolvedTheme, false);
  }, [applyTheme, resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
