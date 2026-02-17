import { Builder } from '@builder.io/react';
import appState, { ApplicationContext, Model } from '@builder.io/app-context';
import HippoCMSManager from '@application/HippoCMSManager';
import { pluginId, pluginIcon } from './constants';
import BuilderHelper from '@core/models/builder-helper';
import { ModelShape } from '@goldenhippo/builder-types';

interface OnSaveActions {
  updateSettings(partial: Record<string, any>): Promise<void>;
}

interface AppActions {
  triggerSettingsDialog(pluginId: string): Promise<void>;
}

function getModel(name: string, models: Model[]) {
  const match = models.find((model) => model.name === name);
  console.log(`[Hippo Commerce] Retrieved model "${name}" --->`, match?.id);
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
    console.log('[Hippo Commerce] Model update complete --->', shape.name, id);
    return id;
  } catch (e) {
    console.error(
      '[Hippo Commerce] Set model error',
      e instanceof Error ? { message: e.message, name: e.name, stack: e.stack } : e,
    );
    console.error('[Hippo Commerce] Failed model shape:', shape.name);
  }
  return current ? current.id : shape.name;
}

function getEditUrl(state: ApplicationContext): string {
  // @ts-expect-error not yet typed
  const pluginSettings = state.user.organization.value.settings.plugins?.get(pluginId);
  const editUrl = pluginSettings?.get('editUrl');
  return (editUrl as string) ?? '';
}

async function setHippoModels(currentState: ApplicationContext) {
  const editUrl = getEditUrl(currentState);
  const models = currentState.models.result;

  // Phase 1: Independent models (no dependencies)
  const ingredientModel = getModel(BuilderHelper.ingredientsModel.name, models);
  const categoryModel = getModel(BuilderHelper.categoryModel.name, models);
  const tagModel = getModel(BuilderHelper.productTagModel.name, models);
  const useCaseModel = getModel(BuilderHelper.useCaseModel.name, models);
  const ingredientModelId = await setModel(BuilderHelper.ingredientsModel, ingredientModel, currentState);
  const categoryModelId = await setModel(BuilderHelper.categoryModel, categoryModel, currentState);
  const tagModelId = await setModel(BuilderHelper.productTagModel, tagModel, currentState);
  const useCaseModelId = await setModel(BuilderHelper.useCaseModel, useCaseModel, currentState);

  if (!ingredientModelId || !categoryModelId || !tagModelId || !useCaseModelId) return;

  // Phase 2: Product (requires ingredient, category, tag, useCase)
  const productModelShape = BuilderHelper.productModel({
    ingredientsModelId: ingredientModelId,
    categoryModelId: categoryModelId,
    tagModelId: tagModelId,
    useCaseModelId: useCaseModelId,
  });
  const productModel = getModel(productModelShape.name, models);
  const productModelId = await setModel(productModelShape, productModel, currentState);
  if (!productModelId) return;

  // Phase 3: Models that depend on product or are independent
  const productGroupModelShape = BuilderHelper.productGroupModel(productModelId);
  const productGroupModel = getModel(productGroupModelShape.name, models);
  const productGroupModelId = await setModel(productGroupModelShape, productGroupModel, currentState);

  const bannerModelShape = BuilderHelper.siteBanner(editUrl);
  const bannerModel = getModel(bannerModelShape.name, models);
  const bannerModelId = await setModel(bannerModelShape, bannerModel, currentState);

  const blogCategoryModel = getModel(BuilderHelper.blogCategoryModel.name, models);
  const blogCategoryModelId = await setModel(BuilderHelper.blogCategoryModel, blogCategoryModel, currentState);

  if (!productGroupModelId || !bannerModelId || !blogCategoryModelId) return;

  // Phase 4: Page (requires product, productGroup, category, banner, blogCategory)
  const pageModelShape = BuilderHelper.pageModel({
    productModelId,
    productGroupModelId,
    categoryModelId,
    bannerModelId,
    blogCategoryModelId,
    editUrl,
  });
  const pageModel = getModel(pageModelShape.name, models);
  const pageModelId = await setModel(pageModelShape, pageModel, currentState);
  if (!pageModelId) return;

  // Phase 5: Blog comment (requires page)
  const blogCommentModelShape = BuilderHelper.blogCommentModel(pageModelId);
  const blogCommentModel = getModel(blogCommentModelShape.name, models);
  await setModel(blogCommentModelShape, blogCommentModel, currentState);

  // Phase 6: Grid config (requires category, useCase, ingredient, tag)
  const productGridConfigModelShape = BuilderHelper.productGridConfigModel({
    categoryId: categoryModelId,
    useCaseId: useCaseModelId,
    ingredientId: ingredientModelId,
    tagId: tagModelId,
  });
  const productGridConfigModel = getModel(productGridConfigModelShape.name, models);
  const productGridConfigModelId = await setModel(productGridConfigModelShape, productGridConfigModel, currentState);
  if (!productGridConfigModelId) return;

  // Phase 7: Brand config (requires gridConfig, banner)
  const brandConfigModelShape = BuilderHelper.brandConfig(productGridConfigModelId, bannerModelId);
  const brandConfigModel = getModel(brandConfigModelShape.name, models);
  await setModel(brandConfigModelShape, brandConfigModel, currentState);

  // Phase 8: Default website section
  const defaultWebsiteSectionModelShape = BuilderHelper.defaultWebsiteSection(editUrl);
  const defaultWebsiteSectionModel = getModel(defaultWebsiteSectionModelShape.name, models);
  await setModel(defaultWebsiteSectionModelShape, defaultWebsiteSectionModel, currentState);

  console.info('[Hippo Commerce] Model setup complete');
}

Builder.register('plugin', {
  id: pluginId,
  name: 'Hippo Commerce',
  settings: [
    {
      type: 'select',
      enum: ['Gundry MD', 'Dr. Marty', 'Driven Entrepreneur', 'Other'],
      name: 'brand',
      friendlyName: 'Brand',
      helperText: "Select your brand. If you select 'Other', provide your brand under the advanced settings.",
      required: true,
    },
    {
      type: 'text',
      name: 'editUrl',
      friendlyName: 'Development Site URL',
      helperText: 'Provide the URL to your development site.',
      required: true,
    },
    {
      type: 'text',
      name: 'apiUrl',
      friendlyName: 'API URL',
      helperText: 'Provide the URL to your instance of the Hippo Commerce API.',
      required: true,
    },
    {
      type: 'text',
      name: 'apiUser',
      friendlyName: 'API User',
      helperText: 'Provide your Hippo Commerce API User.',
      required: true,
    },
    {
      type: 'password',
      name: 'apiPassword',
      friendlyName: 'API Password',
      helperText: 'Provide your Hippo Commerce API Password.',
      required: true,
    },
    {
      type: 'text',
      name: 'otherBrand',
      friendlyName: 'Custom Brand',
      helperText: 'Provide your brand exactly as it is configured in your Hippo Commerce API.',
      required: false,
      advanced: true,
    },
  ],
  ctaText: 'Save & Create Models',
  async onSave(actions: OnSaveActions) {
    await actions.updateSettings({
      hasConnected: true,
    });
    await setHippoModels(appState as ApplicationContext);
    // @ts-expect-error types are not complete
    await appState.dialogs.alert('Hippo Commerce settings saved.');
  },
});

Builder.register('app.onLoad', async ({ triggerSettingsDialog }: AppActions) => {
  // @ts-expect-error incomplete types
  const pluginSettings = appState.user.organization.value.settings.plugins?.get(pluginId);
  const hasConnected = pluginSettings?.get('hasConnected');
  const brand = pluginSettings?.get('brand');
  const apiUser = pluginSettings?.get('apiUser');
  const apiPassword = pluginSettings?.get('apiPassword');
  const apiUrl = pluginSettings?.get('apiUrl');
  const editUrl = pluginSettings?.get('editUrl');
  if (!hasConnected || !brand || !apiUser || !apiPassword || !apiUrl || !editUrl) {
    await triggerSettingsDialog(pluginId);
  }
});

// Builder.register('appTab', {
//   name: 'Hippo Commerce',
//   path: 'hippo-commerce',
//   icon: pluginIcon,
//   component: HippoCMSManager,
// });
