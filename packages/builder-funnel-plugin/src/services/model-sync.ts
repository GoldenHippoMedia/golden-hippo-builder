import { Model } from '@builder.io/app-context';
import { ModelShape } from '@goldenhippo/builder-types';
import FunnelBuilderHelper from '../core/models/funnel-builder-helper';
import { pluginId } from '../constants';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';

function getModel(name: string, models: Model[]) {
  const match = models.find((model) => model.name === name);
  console.log(`[Hippo Commerce - FUNNEL] Retrieved model "${name}" --->`, match?.id);
  return match;
}

async function setModel(
  shape: ModelShape,
  current: Model | undefined,
  context: ExtendedApplicationContext,
): Promise<string | undefined> {
  const randomId = crypto.randomUUID().toString();
  try {
    // @ts-expect-error incomplete types — ModelShape is compatible but not typed as Model
    await context.models.update({
      ...shape,
      id: current ? current.id : randomId,
    });
    const id = current ? current.id : randomId;
    console.log('[Hippo Commerce - FUNNEL] Model update complete --->', shape.name, id);
    return id;
  } catch (e) {
    console.error(
      '[Hippo Commerce - FUNNEL] Set model error',
      e instanceof Error ? { message: e.message, name: e.name, stack: e.stack } : e,
    );
    console.error('[Hippo Commerce - FUNNEL] Failed model shape:', shape.name);
  }
  return current ? current.id : shape.name;
}

function getEditUrl(context: ExtendedApplicationContext): string {
  // @ts-expect-error not yet typed — plugins is a MobX observable map
  const pluginSettings = context.user.organization.value.settings.plugins?.get(pluginId);
  const editUrl = pluginSettings?.get('editUrl');
  return (editUrl as string) ?? '';
}

export interface SyncModelProgress {
  phase: string;
  total: number;
  current: number;
}

/**
 * Syncs all funnel model definitions to Builder.io.
 * Creates models that don't exist yet and updates existing ones with the latest field schemas.
 *
 * @param context - The Builder.io application context
 * @param onProgress - Optional callback invoked after each phase completes
 */
export async function syncFunnelModels(
  context: ExtendedApplicationContext,
  onProgress?: (progress: SyncModelProgress) => void,
): Promise<void> {
  const editUrl = getEditUrl(context);
  const models = context.models.result;
  const total = 10; // total model count across all phases
  let current = 0;

  const report = (phase: string) => {
    current++;
    onProgress?.({ phase, total, current });
  };

  // Phase 1: Independent models (shared with cart — check-or-create)
  const ingredientModel = getModel(FunnelBuilderHelper.ingredientsModel.name, models);
  const categoryModel = getModel(FunnelBuilderHelper.categoryModel.name, models);
  const tagModel = getModel(FunnelBuilderHelper.productTagModel.name, models);
  const useCaseModel = getModel(FunnelBuilderHelper.useCaseModel.name, models);
  const ingredientModelId = await setModel(FunnelBuilderHelper.ingredientsModel, ingredientModel, context);
  report('Ingredient');
  const categoryModelId = await setModel(FunnelBuilderHelper.categoryModel, categoryModel, context);
  report('Category');
  const tagModelId = await setModel(FunnelBuilderHelper.productTagModel, tagModel, context);
  report('Tag');
  const useCaseModelId = await setModel(FunnelBuilderHelper.useCaseModel, useCaseModel, context);
  report('Use Case');

  if (!ingredientModelId || !categoryModelId || !tagModelId || !useCaseModelId) {
    throw new Error('Failed to create base models (ingredient, category, tag, or use-case)');
  }

  // Phase 2: Product (shared with cart — check-or-create)
  const productModelShape = FunnelBuilderHelper.productModel({
    ingredientsModelId: ingredientModelId,
    categoryModelId,
    tagModelId,
    useCaseModelId,
  });
  const productModel = getModel(productModelShape.name, models);
  const productModelId = await setModel(productModelShape, productModel, context);
  report('Product');
  if (!productModelId) throw new Error('Failed to create Product model');

  const funnelModelShape = FunnelBuilderHelper.funnelModel;
  const funnelModel = getModel(funnelModelShape.name, models);
  const funnelModelId = await setModel(funnelModelShape, funnelModel, context);
  report('Funnel');
  if (!funnelModelId) throw new Error('Failed to create Funnel model');

  const funnelPageModelShape = FunnelBuilderHelper.funnelPageModel(editUrl, funnelModelId);
  const funnelPageModel = getModel(funnelPageModelShape.name, models);
  const funnelPageModelId = await setModel(funnelPageModelShape, funnelPageModel, context);
  report('Funnel Page');
  if (!funnelPageModelId) throw new Error('Failed to create Funnel Page model');

  // Phase 6: Destination (depends on offer + funnel, optionally split test)
  const destinationModelShape = FunnelBuilderHelper.funnelDestinationModel(funnelModelId);
  const destinationModel = getModel(destinationModelShape.name, models);
  const destinationModelId = await setModel(destinationModelShape, destinationModel, context);
  report('Destination');
  if (!destinationModelId) throw new Error('Failed to create Destination model');

  console.info('[Hippo Commerce - FUNNEL] Model sync complete');
}
