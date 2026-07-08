import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
}

export default [
  {
    ignores: [
      'dist/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      'node_modules/**',
      'types/**',
      'temp/**',
      '.husky/**',
      'test/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: sharedGlobals,
    },
  },
  {
    files: ['rollup.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,d.ts}'],
    languageOptions: {
      ...config.languageOptions,
      globals: sharedGlobals,
    },
  })),
  prettierConfig,
]
