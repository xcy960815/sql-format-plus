# Development Guide

## Package Manager

Use `pnpm`. The repository includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

```bash
pnpm install
```

## Scripts

From `package.json`:

```bash
pnpm run dev
pnpm run build
pnpm run check
pnpm run docs:dev
pnpm run docs:build
pnpm run docs:preview
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:check
pnpm run preview
pnpm run serve
```

## What Each Command Does

- `pnpm run dev`: starts the Vite demo app.
- `pnpm run build`: runs Rollup, removes and recreates `dist/` and `types/`, then
  emits ESM, UMD, minified UMD, and bundled TypeScript declarations.
- `pnpm run check`: runs TypeScript checking for source and test files.
- `pnpm run docs:dev`: starts VitePress docs locally.
- `pnpm run docs:build`: builds the VitePress site.
- `pnpm run docs:preview`: previews the built VitePress site.
- `pnpm run lint`: runs ESLint across the repository.
- `pnpm run lint:fix`: applies ESLint fixes.
- `pnpm run format`: applies Prettier formatting.
- `pnpm run format:check`: checks Prettier formatting.
- `pnpm run preview` / `pnpm run serve`: Vite preview aliases.

## Style And Tooling

- `.editorconfig`: LF endings, UTF-8, final newline, trimmed trailing whitespace,
  2-space indentation.
- `.prettierrc.json`: no semicolons and single quotes.
- `eslint.config.mjs`: ignores generated output and applies recommended JS and
  TypeScript rules.
- TypeScript uses `strict: true`; `noImplicitAny` is currently `false`.

## Build Outputs

`pnpm run build` emits:

- `dist/sql-format-plus.es.js`
- `dist/sql-format-plus.umd.js`
- `dist/sql-format-plus.umd.min.js`
- `types/sql-format-plus.d.ts`

The Rollup config deletes `dist/` and `types/` at the start of the build. Do not
place source files or manually maintained assets in those directories.

## Local Demo

The demo uses:

- `index.html`
- `src/main.ts`
- `vite.config.mts`

It exercises several dialect examples in the browser. If changing the public API
or dialect names, update `src/main.ts` and docs examples together.

## Docs

VitePress config lives in `docs/.vitepress/config.mts`. The configured base path
is `/sql-format-plus/`, so keep that in mind when changing deployment behavior.

Docs are bilingual. Prefer updating English and Simplified Chinese docs in the
same change when public behavior changes.
