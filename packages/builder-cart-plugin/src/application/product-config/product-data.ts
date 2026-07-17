import { localize, setLocalized } from './localization';
import { isProductFieldLocalized, type ProductFormField } from './product-fields';

/** Buffer slot used for the (single, global) value of a non-localized field. */
export const FLAT = '__flat__';

export const asStr = (v: unknown): string => (typeof v === 'string' ? v : '');
export const asArr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
export const asIds = (v: unknown, refKey: string): string[] =>
  (Array.isArray(v) ? v : []).map((entry) => entry?.[refKey]?.id).filter((id): id is string => Boolean(id));

export const getByPath = (obj: any, path: string): any => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/**
 * Write `value` at dot-`path` into `patch`, copying siblings from `raw` at each
 * level so an object patch preserves untouched keys. Does not mutate `raw`.
 */
export const setByPath = (patch: Record<string, any>, raw: any, path: string, value: unknown): void => {
  const parts = path.split('.');
  let target = patch;
  let rawLevel = raw;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    rawLevel = rawLevel == null ? undefined : rawLevel[k];
    if (!(k in target) || typeof target[k] !== 'object' || target[k] === null) {
      target[k] = { ...(rawLevel ?? {}) };
    }
    target = target[k];
  }
  target[parts[parts.length - 1]] = value;
};

export const readFieldValue = (data: any, d: ProductFormField, locale: string): unknown => {
  const rawAt = getByPath(data, d.modelField);
  const resolved = isProductFieldLocalized(d.modelField) ? localize(rawAt, locale) : rawAt;
  switch (d.control) {
    case 'text':
    case 'textarea':
      return asStr(resolved);
    case 'tags':
      return asArr(resolved);
    case 'toggle':
      return Boolean(resolved);
    case 'refs':
      return asIds(resolved, d.refKey!);
    default: {
      // Exhaustiveness guard: a new FieldControl must be handled here or this
      // fails to compile.
      const _exhaustive: never = d.control;
      return _exhaustive;
    }
  }
};

export const buildReference = (id: string, model: string) => ({
  '@type': '@builder.io/core:Reference',
  id,
  model,
});

/** Convert an edited value into its stored shape (refs → Builder reference entries). */
export const toStored = (d: ProductFormField, value: unknown): unknown =>
  d.control === 'refs' ? (value as string[]).map((id) => ({ [d.refKey!]: buildReference(id, d.refModel!) })) : value;

/**
 * Fold a field's buffered edits into the value stored at its model path.
 * Localized fields merge each edited locale into the existing LocalizedValue
 * (other locales survive); non-localized fields take the single FLAT edit.
 */
export const buildFieldPatch = (d: ProductFormField, raw: any, edits: Record<string, unknown>): unknown => {
  if (isProductFieldLocalized(d.modelField)) {
    let merged = getByPath(raw, d.modelField);
    for (const [loc, val] of Object.entries(edits)) merged = setLocalized(merged, loc, toStored(d, val));
    return merged;
  }
  return toStored(d, edits[FLAT]);
};
