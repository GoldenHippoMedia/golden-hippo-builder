import { describe, it, expect } from 'vitest';
import { asIds, buildFieldPatch, getByPath, readFieldValue, setByPath, toStored, FLAT } from './product-data';
import { PRODUCT_FORM_FIELD_BY_KEY, type ProductFormField } from './product-fields';
import { LOCALIZED_TYPE } from './localization';

const field = (key: string): ProductFormField => {
  const d = PRODUCT_FORM_FIELD_BY_KEY.get(key);
  if (!d) throw new Error(`test setup: no form field "${key}"`);
  return d;
};

// displayName is localized text; featuredImage is a global (non-localized) URL;
// packagingLabels.singular is a localized object subfield; tagIds is a ref list.
const displayName = field('displayName');
const featuredImage = field('featuredImage');
const packagingSingular = field('packagingSingular');
const tagIds = field('tagIds');

describe('getByPath', () => {
  it('reads nested dot-paths and short-circuits on nullish', () => {
    expect(getByPath({ a: { b: 'x' } }, 'a.b')).toBe('x');
    // Short-circuits on the nullish it hits (returns null, not the leaf).
    expect(getByPath({ a: null }, 'a.b')).toBeNull();
    expect(getByPath({}, 'a.b.c')).toBeUndefined();
  });
});

describe('setByPath', () => {
  it('preserves siblings at every level and does not mutate raw', () => {
    const raw = { packagingLabels: { singular: 'bottle', plural: 'bottles' }, displayName: 'Vits' };
    const patch: Record<string, any> = {};

    setByPath(patch, raw, 'packagingLabels.singular', 'jar');

    // Edited leaf changed; sibling within the object and top-level sibling kept.
    expect(patch.packagingLabels.singular).toBe('jar');
    expect(patch.packagingLabels.plural).toBe('bottles');
    // raw is untouched.
    expect(raw.packagingLabels.singular).toBe('bottle');
    expect(patch.packagingLabels).not.toBe(raw.packagingLabels);
  });

  it('accumulates two writes into the same parent object', () => {
    const raw = { packagingLabels: { singular: 'bottle', plural: 'bottles' } };
    const patch: Record<string, any> = {};

    setByPath(patch, raw, 'packagingLabels.singular', 'jar');
    setByPath(patch, raw, 'packagingLabels.plural', 'jars');

    expect(patch.packagingLabels).toEqual({ singular: 'jar', plural: 'jars' });
  });

  it('writes a top-level leaf', () => {
    const patch: Record<string, any> = {};
    setByPath(patch, {}, 'displayName', 'Hello');
    expect(patch).toEqual({ displayName: 'Hello' });
  });
});

describe('asIds ↔ toStored round-trip (refs)', () => {
  it('extracts ids from reference entries', () => {
    const stored = [
      { tag: { '@type': '@builder.io/core:Reference', id: 't1', model: 'product-tag' } },
      { tag: { '@type': '@builder.io/core:Reference', id: 't2', model: 'product-tag' } },
    ];
    expect(asIds(stored, 'tag')).toEqual(['t1', 't2']);
  });

  it('drops entries missing an id', () => {
    expect(asIds([{ tag: {} }, { tag: { id: 't2' } }, {}], 'tag')).toEqual(['t2']);
  });

  it('coerces non-arrays to []', () => {
    expect(asIds(undefined, 'tag')).toEqual([]);
    expect(asIds('nope', 'tag')).toEqual([]);
  });

  it('reads back exactly what toStored writes', () => {
    const ids = ['t1', 't2', 't3'];
    const stored = toStored(tagIds, ids);
    expect(asIds(stored, tagIds.refKey!)).toEqual(ids);
  });

  it('stores ids as Builder reference entries under refKey', () => {
    expect(toStored(tagIds, ['t1'])).toEqual([
      { tag: { '@type': '@builder.io/core:Reference', id: 't1', model: 'product-tag' } },
    ]);
  });

  it('passes non-ref values through unchanged', () => {
    expect(toStored(displayName, 'Hello')).toBe('Hello');
  });
});

describe('readFieldValue', () => {
  it('resolves a localized text field to the requested locale, falling back to Default', () => {
    const data = { displayName: { '@type': LOCALIZED_TYPE, Default: 'Vitamins', 'es-ES': 'Vitaminas' } };
    expect(readFieldValue(data, displayName, 'es-ES')).toBe('Vitaminas');
    expect(readFieldValue(data, displayName, 'fr-FR')).toBe('Vitamins'); // fallback
  });

  it('reads a global field ignoring locale', () => {
    const data = { featuredImage: 'https://cdn/x.png' };
    expect(readFieldValue(data, featuredImage, 'es-ES')).toBe('https://cdn/x.png');
  });

  it('reads a localized object subfield by dot-path', () => {
    const data = { packagingLabels: { singular: { '@type': LOCALIZED_TYPE, Default: 'bottle', 'es-ES': 'botella' } } };
    expect(readFieldValue(data, packagingSingular, 'es-ES')).toBe('botella');
  });

  it('coerces missing/typed values per control', () => {
    expect(readFieldValue({}, displayName, 'Default')).toBe(''); // text → ''
    expect(readFieldValue({}, featuredImage, 'Default')).toBe(''); // text → ''
    expect(readFieldValue({}, tagIds, 'Default')).toEqual([]); // refs → []
  });
});

describe('buildFieldPatch', () => {
  it('merges an edited locale into an existing LocalizedValue, preserving other locales', () => {
    const raw = { displayName: { '@type': LOCALIZED_TYPE, Default: 'Vitamins', 'fr-FR': 'Vitamines' } };
    const edits = { 'es-ES': 'Vitaminas' };

    const patch = buildFieldPatch(displayName, raw, edits) as Record<string, unknown>;

    expect(patch['es-ES']).toBe('Vitaminas'); // new locale added
    expect(patch['fr-FR']).toBe('Vitamines'); // untouched locale survives
    expect(patch.Default).toBe('Vitamins'); // default survives
    expect(patch['@type']).toBe(LOCALIZED_TYPE);
  });

  it('wraps a previously-plain value into a LocalizedValue when first localized edit lands', () => {
    const raw = { displayName: 'Vitamins' };
    const patch = buildFieldPatch(displayName, raw, { 'es-ES': 'Vitaminas' }) as Record<string, unknown>;

    expect(patch['@type']).toBe(LOCALIZED_TYPE);
    expect(patch.Default).toBe('Vitamins'); // prior plain value becomes Default
    expect(patch['es-ES']).toBe('Vitaminas');
  });

  it('takes the FLAT edit for a non-localized field', () => {
    expect(buildFieldPatch(featuredImage, {}, { [FLAT]: 'https://cdn/y.png' })).toBe('https://cdn/y.png');
  });

  it('stores ref edits as reference entries within a localized merge', () => {
    const patch = buildFieldPatch(tagIds, {}, { Default: ['t1'] }) as Record<string, unknown>;
    expect(patch.Default).toEqual([{ tag: { '@type': '@builder.io/core:Reference', id: 't1', model: 'product-tag' } }]);
  });
});
