import { describe, it, expect } from 'vitest';
import { Model } from '@builder.io/app-context';
import { MODEL_DEFINITIONS, diffFieldTrees, diffHooks, getUnmanagedModels, type NamedField } from './model-sync';

// Guards that warn admins, before a sync, about content they could lose:
//  - getUnmanagedModels: models on the brand this package doesn't define
//  - diffFieldTrees: fields the sync would add/remove on an existing model
//  - diffHooks: model-level hooks (e.g. validate) the sync would add/remove/overwrite

const model = (name: string, kind?: string): Model =>
  ({ id: `id-${name}`, name, kind, fields: [] }) as unknown as Model;

describe('getUnmanagedModels', () => {
  it('flags only models that this package does not define', () => {
    const managed = MODEL_DEFINITIONS[0].name; // a real package-managed model
    const models = [model(managed), model('legacy-hero-banner', 'component'), model('promo-countdown', 'data')];

    const result = getUnmanagedModels(models);

    expect(result.map((m) => m.name)).toEqual(['legacy-hero-banner', 'promo-countdown']);
  });

  it('excludes native Builder.io models such as symbol', () => {
    const result = getUnmanagedModels([model('symbol'), model('page')]);
    // `page` is package-managed and `symbol` is native — neither is unmanaged.
    expect(result).toEqual([]);
  });

  it('carries through the model id and runtime kind', () => {
    const [unmanaged] = getUnmanagedModels([model('custom-thing', 'page')]);
    expect(unmanaged).toEqual({ name: 'custom-thing', modelId: 'id-custom-thing', kind: 'page' });
  });

  it('returns nothing when every model is managed', () => {
    expect(getUnmanagedModels(MODEL_DEFINITIONS.map((d) => model(d.name)))).toEqual([]);
  });
});

describe('diffFieldTrees', () => {
  const f = (name: string, subFields?: NamedField[]): NamedField => ({ name, subFields });

  it('reports top-level added and removed fields', () => {
    const desired = [f('keep'), f('subscriptionDiscount')];
    const current = [f('keep'), f('legacySku')];

    expect(diffFieldTrees(desired, current)).toEqual({
      added: ['subscriptionDiscount'],
      removed: ['legacySku'],
    });
  });

  it('returns empty when the trees match', () => {
    const fields = [f('a'), f('b', [f('c')])];
    expect(diffFieldTrees(fields, fields)).toEqual({ added: [], removed: [] });
  });

  it('recurses into subfields and reports dotted paths', () => {
    const desired = [f('packaging', [f('recyclable'), f('dimensions', [f('width')])])];
    const current = [f('packaging', [f('dimensions', [f('width'), f('depth')])])];

    expect(diffFieldTrees(desired, current)).toEqual({
      added: ['packaging.recyclable'],
      removed: ['packaging.dimensions.depth'],
    });
  });

  it('reports only the root path when a whole subtree is added or removed', () => {
    const desired = [f('newObject', [f('a'), f('b')])];
    const current: NamedField[] = [f('oldObject', [f('x'), f('y')])];

    expect(diffFieldTrees(desired, current)).toEqual({
      added: ['newObject'],
      removed: ['oldObject'],
    });
  });

  it('descends even when one side has no subfields (field gained children)', () => {
    const desired = [f('config', [f('liveChatEnabled')])];
    const current = [f('config')];

    expect(diffFieldTrees(desired, current)).toEqual({
      added: ['config.liveChatEnabled'],
      removed: [],
    });
  });
});

describe('diffHooks', () => {
  it('flags a hook the package adds when the brand has none (null live hooks)', () => {
    expect(diffHooks({ validate: 'return run();' }, null)).toEqual([{ key: 'validate', change: 'added' }]);
  });

  it('treats an empty live value the same as absent (added)', () => {
    expect(diffHooks({ validate: 'code' }, { validate: '' })).toEqual([{ key: 'validate', change: 'added' }]);
  });

  it('flags a hook removed when the package no longer defines it', () => {
    expect(diffHooks(undefined, { validate: 'code' })).toEqual([{ key: 'validate', change: 'removed' }]);
  });

  it('flags a modified hook when the source differs', () => {
    expect(diffHooks({ validate: 'a' }, { validate: 'b' })).toEqual([{ key: 'validate', change: 'modified' }]);
  });

  it('ignores insignificant surrounding whitespace', () => {
    expect(diffHooks({ validate: 'code' }, { validate: '\n  code  \n' })).toEqual([]);
  });

  it('returns nothing when hooks match', () => {
    expect(diffHooks({ validate: 'code' }, { validate: 'code' })).toEqual([]);
  });

  it('reports multiple hook keys sorted by key', () => {
    expect(diffHooks({ validate: 'v', change: 'c' }, null)).toEqual([
      { key: 'change', change: 'added' },
      { key: 'validate', change: 'added' },
    ]);
  });
});
