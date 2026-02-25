export { isFunnelPreviewPath, isBuilderEditRequest } from './funnel-routes';

// Re-export route/resolution utilities from funnel-schemas
export {
  resolveDestinationConfig,
  type DestinationConfig,
  getFunnelIdFromPage,
} from '@goldenhippo/builder-funnel-schemas';
