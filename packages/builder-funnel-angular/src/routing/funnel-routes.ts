const DEFAULT_PREVIEW_BASE = '/f/preview';

/**
 * Check if a URL path is a Builder.io funnel preview/editing path.
 */
export function isFunnelPreviewPath(urlPath: string, previewBase = DEFAULT_PREVIEW_BASE): boolean {
  return urlPath.startsWith(previewBase);
}

/**
 * Check if the current request is from the Builder.io visual editor.
 * Works in both browser and SSR contexts by inspecting URL query params.
 */
export function isBuilderEditRequest(url: string): boolean {
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.searchParams.has('builder.preview') || parsed.searchParams.has('builder.editing');
  } catch {
    return false;
  }
}
