import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'content/index': 'src/content/index.ts',
    'routing/index': 'src/routing/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  external: [
    '@goldenhippo/builder-funnel-schemas',
    '@goldenhippo/builder-shared-schemas',
    '@goldenhippo/builder-types',
  ],
});
