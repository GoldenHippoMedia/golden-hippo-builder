import { ApplicationContext, Model } from '@builder.io/app-context';
import BuilderHelper from '@core/models/builder-helper';
import { ModelShape } from '@goldenhippo/builder-types';
import { pluginId, SCHEMA_VERSION } from '../../constants';

export { SCHEMA_VERSION };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelDefinition {
  name: string;
  displayName: string;
  phase: number;
  dependencies: string[];
  /** Return the ModelShape — may need resolved IDs passed in via `idMap`. */
  getShape: (idMap: Record<string, string>, editUrl: string) => ModelShape;
}

export interface ModelStatus {
  name: string;
  displayName: string;
  phase: number;
  dependencies: string[];
  exists: boolean;
  modelId?: string;
}

export interface SyncResult {
  success: boolean;
  modelName: string;
  modelId?: string;
  error?: string;
}

/**
 * A model that exists on the brand's Builder.io space but is NOT defined by
 * this package. These are not managed by the sync and risk being orphaned.
 */
export interface UnmanagedModel {
  name: string;
  modelId: string;
  /** Builder.io model kind ('page' | 'component'/'section' | 'data'), when available. */
  kind?: string;
}
/** A model-level hook (e.g. `validate`) that the sync will add, remove, or overwrite. */
export interface HookChange {
  /** Hook key, e.g. `validate` or `change`. */
  key: string;
  change: 'added' | 'removed' | 'modified';
}

export interface FieldDiff {
  name: string;
  displayName: string;
  /** Field names the sync will add (in the package shape, not on the brand). */
  added: string[];
  /** Field names the sync will remove (on the brand, not in the package shape). */
  removed: string[];
  /** Hook keys whose value the sync will change. */
  hooks: HookChange[];
}

// ---------------------------------------------------------------------------
// Model definitions (all 13 models, ordered by phase)
// ---------------------------------------------------------------------------

export const MODEL_DEFINITIONS: ModelDefinition[] = [
  // Phase 1 — no dependencies
  {
    name: 'product-ingredient',
    displayName: 'Product Ingredient',
    phase: 1,
    dependencies: [],
    getShape: () => BuilderHelper.ingredientsModel,
  },
  {
    name: 'product-category',
    displayName: 'Product Category',
    phase: 1,
    dependencies: [],
    getShape: () => BuilderHelper.categoryModel,
  },
  {
    name: 'product-tag',
    displayName: 'Product Tag',
    phase: 1,
    dependencies: [],
    getShape: () => BuilderHelper.productTagModel,
  },
  {
    name: 'product-use-case',
    displayName: 'Product Use Case',
    phase: 1,
    dependencies: [],
    getShape: () => BuilderHelper.useCaseModel,
  },
  {
    name: 'profile-reference-rule',
    displayName: 'Profile Reference Rule',
    phase: 1,
    dependencies: [],
    getShape: () => BuilderHelper.profileReferenceRuleModel,
  },
  // Phase 2 — needs phase 1 IDs
  {
    name: 'recommendation-config',
    displayName: 'Recommendation Config',
    phase: 2,
    dependencies: ['product-tag'],
    getShape: () => BuilderHelper.recommendationConfigModel,
  },
  {
    name: 'product',
    displayName: 'Product',
    phase: 2,
    dependencies: ['product-ingredient', 'product-category', 'product-tag', 'product-use-case'],
    getShape: (ids) =>
      BuilderHelper.productModel({
        ingredientsModelId: ids['product-ingredient'],
        categoryModelId: ids['product-category'],
        tagModelId: ids['product-tag'],
        useCaseModelId: ids['product-use-case'],
      }),
  },

  // Phase 3 — needs editUrl
  {
    name: 'banner',
    displayName: 'Site Banner',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.siteBanner(editUrl),
  },
  {
    name: 'blog-category',
    displayName: 'Blog Category',
    phase: 3,
    dependencies: [],
    getShape: () => BuilderHelper.blogCategoryModel,
  },
  {
    name: 'default-website-section',
    displayName: 'Default Website Section',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.defaultWebsiteSection(editUrl),
  },
  {
    name: 'subscription-cancellation-panel',
    displayName: 'Subscription Cancellation Panel',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.subscriptionCancellationPanel(editUrl),
  },
  {
    name: 'upsell-template',
    displayName: 'Upsell Template',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.upsellTemplate(editUrl),
  },
  {
    name: 'header',
    displayName: 'Header',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.headerModel(editUrl),
  },
  {
    name: 'footer',
    displayName: 'Footer',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.footerModel(editUrl),
  },
  {
    name: 'offer-selector-content',
    displayName: 'Offer Selector Content',
    phase: 3,
    dependencies: [],
    getShape: (_ids, editUrl) => BuilderHelper.offerSelectorContentModel(editUrl),
  },
  {
    name: 'promotional-card',
    displayName: 'Promotional Card',
    phase: 4,
    dependencies: ['product'],
    getShape: (ids, editUrl) => BuilderHelper.promotionalCardModel(ids['product'], editUrl),
  },

  // Phase 3b — needs product + section
  {
    name: 'product-group',
    displayName: 'Product Group',
    phase: 3.5,
    dependencies: ['product', 'default-website-section'],
    getShape: (ids) => BuilderHelper.productGroupModel(ids['product'], ids['default-website-section']),
  },

  // Phase 4 — needs many
  {
    name: 'page',
    displayName: 'Page',
    phase: 4,
    dependencies: [
      'product',
      'product-group',
      'product-category',
      'banner',
      'blog-category',
      'default-website-section',
    ],
    getShape: (ids, editUrl) =>
      BuilderHelper.pageModel({
        productModelId: ids['product'],
        productGroupModelId: ids['product-group'],
        categoryModelId: ids['product-category'],
        bannerModelId: ids['banner'],
        blogCategoryModelId: ids['blog-category'],
        sectionModelId: ids['default-website-section'],
        editUrl,
      }),
  },

  // Phase 5 — needs page
  {
    name: 'blog-comment',
    displayName: 'Blog Comment',
    phase: 5,
    dependencies: ['page'],
    getShape: (ids) => BuilderHelper.blogCommentModel(ids['page']),
  },

  // Phase 6 — needs phase 1 IDs
  {
    name: 'product-grid-filter-group',
    displayName: 'Product Grid Filter Group',
    phase: 6,
    dependencies: ['product-category', 'product-use-case', 'product-ingredient', 'product-tag'],
    getShape: (ids) =>
      BuilderHelper.productGridConfigModel({
        categoryId: ids['product-category'],
        useCaseId: ids['product-use-case'],
        ingredientId: ids['product-ingredient'],
        tagId: ids['product-tag'],
      }),
  },

  // Phase 7 — needs gridFilter + banner
  {
    name: 'gh-brand-config',
    displayName: 'Brand Configuration',
    phase: 7,
    dependencies: ['product-grid-filter-group', 'banner', 'recommendation-config'],
    getShape: (ids) => BuilderHelper.brandConfig(ids['product-grid-filter-group'], ids['banner']),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModel(name: string, models: Model[]): Model | undefined {
  const match = models.find((model) => model.name === name);
  console.log(`[Hippo Commerce - CART] Retrieved model "${name}" --->`, match?.id);
  return match;
}

async function setModel(
  shape: ModelShape,
  current: Model | undefined,
  currentState: ApplicationContext,
): Promise<string | undefined> {
  const randomId = crypto.randomUUID().toString();
  try {
    // @ts-expect-error incomplete types
    await currentState.models.update({
      ...shape,
      id: current ? current.id : randomId,
    });
    const id = current ? current.id : randomId;
    console.log('[Hippo Commerce - CART] Model update complete --->', shape.name, id);
    return id;
  } catch (e) {
    console.error(
      '[Hippo Commerce - CART] Set model error',
      e instanceof Error ? { message: e.message, name: e.name, stack: e.stack } : e,
    );
    console.error('[Hippo Commerce - CART] Failed model shape:', shape.name);
  }
  return current ? current.id : shape.name;
}

function getEditUrl(state: ApplicationContext): string {
  // @ts-expect-error not yet typed
  const pluginSettings = state.user.organization.value.settings.plugins?.get(pluginId);
  const editUrl = pluginSettings?.get('editUrl');
  return (editUrl as string) ?? '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check which models already exist in the space.
 */
export function getModelStatuses(models: Model[]): ModelStatus[] {
  return MODEL_DEFINITIONS.map((def) => {
    const existing = models.find((m) => m.name === def.name);
    return {
      name: def.name,
      displayName: def.displayName,
      phase: def.phase,
      dependencies: def.dependencies,
      exists: !!existing,
      modelId: existing?.id,
    };
  });
}

/**
 * Native Builder.io models that ship with every space. They aren't defined by
 * this package but are never dropped by the sync and don't need tracking, so we
 * exclude them from the unmanaged-model warning. Add new native names here.
 */
const NATIVE_MODEL_NAMES = new Set(['symbol']);

//Get models that are not managed by this package
export function getUnmanagedModels(models: Model[]): UnmanagedModel[] {
  const managed = new Set(MODEL_DEFINITIONS.map((def) => def.name));
  return models
    .filter((m) => m.name && !managed.has(m.name) && !NATIVE_MODEL_NAMES.has(m.name))
    .map((m) => ({
      name: m.name,
      modelId: m.id,
      // `kind` exists at runtime but isn't in the published Model type.
      kind: (m as { kind?: string }).kind,
    }));
}

/** Minimal shape shared by package fields (BuilderIOFieldTypes) and brand fields (Input). */
export interface NamedField {
  name: string;
  subFields?: readonly NamedField[];
}

//Helper function to recursively diff fields and subfields against their current values
//Refactor a bit for test compatibilityx
export function diffFieldTrees(
  desired: readonly NamedField[],
  current: readonly NamedField[],
): { added: string[]; removed: string[] } {
  const added: string[] = [];
  const removed: string[] = [];

  const walk = (d: readonly NamedField[], c: readonly NamedField[], prefix: string): void => {
    const currentByName = new Map(c.map((f) => [f.name, f]));
    const desiredByName = new Map(d.map((f) => [f.name, f]));

    for (const f of d) {
      const path = prefix ? `${prefix}.${f.name}` : f.name;
      const match = currentByName.get(f.name);
      if (!match) {
        added.push(path);
      } else if (f.subFields?.length || match.subFields?.length) {
        walk(f.subFields ?? [], match.subFields ?? [], path);
      }
    }
    for (const f of c) {
      if (!desiredByName.has(f.name)) {
        removed.push(prefix ? `${prefix}.${f.name}` : f.name);
      }
    }
  };

  walk(desired, current, '');
  return { added, removed };
}

/**
 * Normalize a model's `hooks` into a plain `{ key: trimmedSource }` record.
 *
 * The live value is not the tidy JSON the Admin API returns: at runtime Builder
 * stores hooks as a MobX/MST map (accessed via `.get()`/`.set()`), while the
 * package shape is a plain object. This accepts either (anything exposing
 * `.entries()` is treated as a map) and drops non-string / empty values so the
 * diff never trips over an unexpected shape.
 */
function toHookRecord(hooks: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!hooks || typeof hooks !== 'object') return out;

  const maybeMap = hooks as { entries?: unknown };
  const entries: Iterable<[string, unknown]> =
    typeof maybeMap.entries === 'function'
      ? (maybeMap.entries() as Iterable<[string, unknown]>)
      : Object.entries(hooks as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}

/**
 * Diff model-level hooks (e.g. the `validate` validation hook). Hook values are
 * function-source strings, compared trimmed so insignificant surrounding
 * whitespace doesn't register as a change. A `null`/absent/empty live value
 * means the hook isn't set on the brand.
 */
export function diffHooks(desired: unknown, current: unknown): HookChange[] {
  const d = toHookRecord(desired);
  const c = toHookRecord(current);
  const changes: HookChange[] = [];

  for (const key of new Set([...Object.keys(d), ...Object.keys(c)])) {
    const inDesired = key in d;
    const inCurrent = key in c;

    if (inDesired && !inCurrent) changes.push({ key, change: 'added' });
    else if (!inDesired && inCurrent) changes.push({ key, change: 'removed' });
    else if (d[key] !== c[key]) changes.push({ key, change: 'modified' });
  }

  return changes.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * For every managed model that already exists on the brand, diff its current
 * fields against the fields this package defines, recursing into subfields.
 */
export function getFieldDiffs(context: ApplicationContext): FieldDiff[] {
  const editUrl = getEditUrl(context);
  const models = context.models.result;

  // Seed idMap so getShape() can resolve dependency references.
  const idMap: Record<string, string> = {};
  for (const def of MODEL_DEFINITIONS) {
    const existing = models.find((m) => m.name === def.name);
    if (existing?.id) {
      idMap[def.name] = existing.id;
    }
  }

  const diffs: FieldDiff[] = [];
  for (const def of MODEL_DEFINITIONS) {
    const existing = models.find((m) => m.name === def.name);
    if (!existing) continue;

    let desiredShape: ModelShape;
    try {
      desiredShape = def.getShape(idMap, editUrl);
    } catch {
      // If the shape can't be built (e.g. unresolved dependency), skip it
      // rather than reporting a misleading diff.
      continue;
    }

    const { added, removed } = diffFieldTrees(
      (desiredShape.fields ?? []) as readonly NamedField[],
      (existing.fields ?? []) as readonly NamedField[],
    );
    const hooks = diffHooks(desiredShape.hooks, (existing as { hooks?: unknown }).hooks);

    if (added.length > 0 || removed.length > 0 || hooks.length > 0) {
      diffs.push({ name: def.name, displayName: def.displayName, added, removed, hooks });
    }
  }

  return diffs;
}

/**
 * Sync all 13 models in dependency order (phased).
 */
export async function syncAllModels(
  context: ApplicationContext,
  onProgress?: (modelName: string) => void,
): Promise<SyncResult[]> {
  const editUrl = getEditUrl(context);
  const models = context.models.result;
  const idMap: Record<string, string> = {};
  const results: SyncResult[] = [];

  // Seed idMap with existing model IDs
  for (const def of MODEL_DEFINITIONS) {
    const existing = getModel(def.name, models);
    if (existing?.id) {
      idMap[def.name] = existing.id;
    }
  }

  // Sort by phase
  const sorted = [...MODEL_DEFINITIONS].sort((a, b) => a.phase - b.phase);

  for (const def of sorted) {
    onProgress?.(def.name);

    // Check dependencies
    const missingDeps = def.dependencies.filter((dep) => !idMap[dep]);
    if (missingDeps.length > 0) {
      results.push({
        success: false,
        modelName: def.name,
        error: `Missing dependencies: ${missingDeps.join(', ')}`,
      });
      continue;
    }

    try {
      const shape = def.getShape(idMap, editUrl);
      const existing = getModel(def.name, models);
      const modelId = await setModel(shape, existing, context);
      if (modelId) {
        idMap[def.name] = modelId;
        results.push({ success: true, modelName: def.name, modelId });
      } else {
        results.push({ success: false, modelName: def.name, error: 'setModel returned undefined' });
      }
    } catch (e) {
      results.push({
        success: false,
        modelName: def.name,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.info('[Hippo Commerce - CART] Model sync complete');
  return results;
}

/**
 * Sync a single model by name. Resolves dependency IDs from existing models.
 */
export async function syncSingleModel(modelName: string, context: ApplicationContext): Promise<SyncResult> {
  const def = MODEL_DEFINITIONS.find((d) => d.name === modelName);
  if (!def) {
    return { success: false, modelName, error: `Unknown model: ${modelName}` };
  }

  const editUrl = getEditUrl(context);
  const models = context.models.result;
  const idMap: Record<string, string> = {};

  // Build idMap from existing models
  for (const d of MODEL_DEFINITIONS) {
    const existing = models.find((m) => m.name === d.name);
    if (existing?.id) {
      idMap[d.name] = existing.id;
    }
  }

  // Check dependencies
  const missingDeps = def.dependencies.filter((dep) => !idMap[dep]);
  if (missingDeps.length > 0) {
    return {
      success: false,
      modelName,
      error: `Missing dependencies: ${missingDeps.join(', ')}`,
    };
  }

  try {
    const shape = def.getShape(idMap, editUrl);
    const existing = getModel(def.name, models);
    const modelId = await setModel(shape, existing, context);
    if (modelId) {
      return { success: true, modelName, modelId };
    }
    return { success: false, modelName, error: 'setModel returned undefined' };
  } catch (e) {
    return {
      success: false,
      modelName,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
