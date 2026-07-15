import { describe, it, expect } from 'vitest';
import * as CartSchemas from '@goldenhippo/builder-cart-schemas';
import { MODEL_DEFINITIONS } from './model-sync';

// Consistency guards for the plugin's model registry (MODEL_DEFINITIONS). These
// fail only when two places disagree — e.g. a model exists in the schema but
// isn't registered, or a dependency is wired to a model that won't be
// provisioned in time. They do NOT fire on ordinary, intentional edits (that's
// what PR review is for); they catch the "added it here, forgot the matching
// spot over there" class of mistake.

// A tolerant stand-in for any factory argument: property access and calls return
// itself, and it coerces to a harmless string. This lets us invoke every schema
// factory regardless of its argument shape purely to read the model name it
// produces — names are string literals, independent of the arguments.
const anyArg: any = new Proxy(
  function noop() {
    /* callable proxy target */
  },
  {
    get: (_t, prop) => {
      if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') return () => 'dummy-id';
      if (prop === Symbol.toStringTag) return 'dummy-id';
      return anyArg;
    },
    apply: () => anyArg,
  },
);

// Models the schema exports but the cart plugin intentionally does NOT provision.
// Keep this empty; add a name here (with a comment explaining why) only for a
// model that is deliberately unmanaged by this plugin.
const UNMANAGED_BY_CART = new Set<string>([]);

// Build every `create*Model` the schema package exports and collect the model
// names they produce.
const schemaModelNames = (): string[] => {
  const names = new Set<string>();
  for (const [key, value] of Object.entries(CartSchemas)) {
    if (typeof value === 'function' && /^create[A-Za-z0-9]*Model$/.test(key)) {
      const shape = (value as (...args: unknown[]) => { name?: string })(anyArg, anyArg, anyArg);
      if (shape?.name) names.add(shape.name);
    }
  }
  return [...names];
};

// Seed enough context for getShape(): dependency IDs (any non-empty string works
// for building the shape) and an editUrl. Mirrors how getFieldDiffs builds shapes.
const idMap = Object.fromEntries(MODEL_DEFINITIONS.map((d) => [d.name, `id-${d.name}`]));
const EDIT_URL = 'https://editor.example.com';

describe('MODEL_DEFINITIONS completeness', () => {
  it('registers exactly the models the schema package defines', () => {
    const defined = new Set(schemaModelNames());
    // Guard against a vacuous pass if factory enumeration ever breaks.
    expect(defined.size, 'no schema model factories were discovered — the enumeration is broken').toBeGreaterThan(0);

    const registered = new Set(MODEL_DEFINITIONS.map((d) => d.name));

    const unregistered = [...defined].filter((n) => !registered.has(n) && !UNMANAGED_BY_CART.has(n));
    expect(
      unregistered,
      'schema defines these models but MODEL_DEFINITIONS does not register them — wire them into ' +
        `builder-helper.ts + MODEL_DEFINITIONS, or add to UNMANAGED_BY_CART: ${unregistered.join(', ')}`,
    ).toEqual([]);

    const stale = [...registered].filter((n) => !defined.has(n));
    expect(
      stale,
      `MODEL_DEFINITIONS registers these but no schema factory produces them (stale entry?): ${stale.join(', ')}`,
    ).toEqual([]);
  });

  it('builds each registered model to a shape whose name matches its definition', () => {
    for (const def of MODEL_DEFINITIONS) {
      const shape = def.getShape(idMap, EDIT_URL);
      expect(shape.name, `${def.name}: getShape().name should equal the registered name`).toBe(def.name);
    }
  });

  it('has no duplicate model names', () => {
    const names = MODEL_DEFINITIONS.map((d) => d.name);
    expect(new Set(names).size, 'duplicate model names in MODEL_DEFINITIONS').toBe(names.length);
  });
});

describe('MODEL_DEFINITIONS dependency graph', () => {
  const registered = new Set(MODEL_DEFINITIONS.map((d) => d.name));
  const phaseByName = new Map(MODEL_DEFINITIONS.map((d) => [d.name, d.phase]));

  it('only declares dependencies on registered models', () => {
    const dangling = MODEL_DEFINITIONS.flatMap((d) =>
      d.dependencies.filter((dep) => !registered.has(dep)).map((dep) => `${d.name} → ${dep}`),
    );
    expect(dangling, `dependencies naming models that aren't registered: ${dangling.join(', ')}`).toEqual([]);
  });

  it('has no model depending on itself', () => {
    const selfDeps = MODEL_DEFINITIONS.filter((d) => d.dependencies.includes(d.name)).map((d) => d.name);
    expect(selfDeps, `models declaring a dependency on themselves: ${selfDeps.join(', ')}`).toEqual([]);
  });

  it('provisions every dependency in an earlier phase than its dependents', () => {
    // syncAllModels runs phase-ascending, so a dependency must sit in a strictly
    // earlier phase or its ID won't exist when the dependent is created.
    const outOfOrder = MODEL_DEFINITIONS.flatMap((d) =>
      d.dependencies
        .filter((dep) => phaseByName.has(dep) && phaseByName.get(dep)! >= d.phase)
        .map((dep) => `${d.name} (phase ${d.phase}) depends on ${dep} (phase ${phaseByName.get(dep)})`),
    );
    expect(outOfOrder, `dependencies not provisioned before their dependents: ${outOfOrder.join('; ')}`).toEqual([]);
  });
});
