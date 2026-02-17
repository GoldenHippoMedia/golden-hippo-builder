import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            { sourceTag: 'scope:cart', onlyDependOnLibsWithTags: ['scope:cart', 'scope:shared'] },
            { sourceTag: 'scope:funnel', onlyDependOnLibsWithTags: ['scope:funnel', 'scope:shared'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'type:plugin', onlyDependOnLibsWithTags: ['type:plugin', 'type:schema', 'type:ui'] },
            { sourceTag: 'type:schema', onlyDependOnLibsWithTags: ['type:schema'] },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui'] },
          ],
        },
      ],
      // Disable rules that flag pre-existing code — this config is focused on module boundaries
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
