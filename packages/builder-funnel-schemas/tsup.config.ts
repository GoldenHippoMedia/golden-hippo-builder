import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'data/index': 'src/data/index.ts',
    'section/index': 'src/section/index.ts',
    'page/index': 'src/page/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  external: ['@goldenhippo/builder-types'],
});
