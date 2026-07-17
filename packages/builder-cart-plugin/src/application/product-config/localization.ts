// ---------------------------------------------------------------------------
// Builder.io localization helpers.
//
// Builder stores a localized field as a "LocalizedValue" object:
//   { '@type': '@builder.io/core:LocalizedValue', Default: <v>, 'en-US': <v>, … }
//
// Non-localized fields are stored as plain values. To edit safely we must
// fetch content RAW (without ?locale=…), read the slice for the active locale,
// and write back by MERGING into the existing object so other locales survive.
// ---------------------------------------------------------------------------

export const LOCALIZED_TYPE = '@builder.io/core:LocalizedValue';
export const DEFAULT_LOCALE = 'Default';

type LocalizedValue = { '@type': string; Default?: unknown; [locale: string]: unknown };

/** True when a value is a Builder LocalizedValue object. */
export const isLocalizedValue = (v: unknown): v is LocalizedValue =>
  typeof v === 'object' && v !== null && (v as { '@type'?: string })['@type'] === LOCALIZED_TYPE;

/**
 * Resolve a (possibly localized) value to the given locale, falling back to the
 * Default slice. Plain (non-localized) values pass through unchanged.
 */
export const localize = <T = unknown>(value: unknown, locale: string = DEFAULT_LOCALE): T | undefined => {
  if (!isLocalizedValue(value)) return value as T | undefined;
  return ((locale in value ? value[locale] : undefined) ?? value.Default) as T | undefined;
};

/**
 * Merge a value for one locale into an existing LocalizedValue, preserving all
 * other locales. If the existing value isn't localized yet, it's wrapped (its
 * prior plain value becomes Default).
 */
export const setLocalized = (existing: unknown, locale: string, value: unknown): LocalizedValue => {
  const base: LocalizedValue = isLocalizedValue(existing)
    ? { ...existing }
    : { '@type': LOCALIZED_TYPE, Default: existing };
  base['@type'] = LOCALIZED_TYPE;
  base[locale] = value;
  return base;
};

/**
 * A LocalizedValue is keyed by locale identifiers (plus `@type`/`Default`), but
 * Builder also stores non-locale metadata on some localized fields — notably
 * localized images carry `altText`/`title` siblings. Only treat BCP-47-style
 * codes (e.g. `en`, `en-CA`, `zh-Hans-CN`) as locales so that metadata doesn't
 * leak into the picker.
 */
const LOCALE_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const isLocaleCode = (key: string): boolean => key !== '@type' && key !== DEFAULT_LOCALE && LOCALE_CODE.test(key);

//Recursively grab all the locales in use
const collectLocalesInto = (value: unknown, found: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectLocalesInto(item, found);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  if (isLocalizedValue(value)) {
    for (const key of Object.keys(value)) {
      if (isLocaleCode(key)) found.add(key);
    }
  }
  // Recurse into every nested value, including a LocalizedValue's own slices
  // (which may themselves hold nested localized fields, e.g. localized lists).
  for (const nested of Object.values(value)) collectLocalesInto(nested, found);
};

// Grab all locales currently in use for locale picker
export const collectLocales = (entries: Array<{ data?: Record<string, unknown> }>): string[] => {
  const found = new Set<string>();
  for (const entry of entries) collectLocalesInto(entry.data ?? {}, found);
  return [DEFAULT_LOCALE, ...Array.from(found).sort()];
};
