export interface BuilderFunnelConfig {
  /** Builder.io public API key */
  apiKey: string;
  /** Builder.io API host (default: 'https://cdn.builder.io') */
  apiHost?: string;
  /** Whether to enrich references by default (default: true) */
  enrich?: boolean;
  /** Default cache duration in seconds */
  cacheSeconds?: number;
  /** Custom fetch implementation (for SSR or testing) */
  fetch?: typeof globalThis.fetch;
}

let _config: BuilderFunnelConfig | null = null;

export function initBuilderFunnel(config: BuilderFunnelConfig): void {
  _config = config;
}

export function getBuilderFunnelConfig(): BuilderFunnelConfig {
  if (!_config) {
    throw new Error(
      'Builder funnel SDK not initialized. Call initBuilderFunnel({ apiKey: "..." }) before making content requests.',
    );
  }
  return _config;
}
