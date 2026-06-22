/**
 * Trinity Mail — tiny locale helper (standalone)
 *
 * German-first (`de` default), English (`en`) fallback. Each template owns a
 * small dictionary of `{ de, en }` strings; `t(dict, locale)` resolves the
 * right copy, always falling back to German if a locale string is missing.
 *
 * No i18n library — this stays dependency-free on purpose so the template
 * vendors cleanly into any tenant repo.
 */

export type Locale = 'de' | 'en';

export const DEFAULT_LOCALE: Locale = 'de';

/** A single translatable string: German required, English optional fallback. */
export interface Translatable {
  de: string;
  en?: string;
}

/** Per-template dictionary: keys → translatable strings. */
export type Dictionary = Record<string, Translatable>;

/**
 * Resolve one string from a dictionary for the given locale.
 * Falls back: requested locale → German → empty string.
 */
export function t<D extends Dictionary>(
  dict: D,
  key: keyof D,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const entry = dict[key];
  if (!entry) return '';
  if (locale === 'en') return entry.en ?? entry.de;
  return entry.de;
}

/**
 * Build a bound translator for one dictionary + locale, so a template can call
 * `tr('headline')` instead of `t(dict, 'headline', locale)` repeatedly.
 */
export function translator<D extends Dictionary>(dict: D, locale: Locale = DEFAULT_LOCALE) {
  return (key: keyof D): string => t(dict, key, locale);
}

/** Interpolate `{name}`-style placeholders into a resolved string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
