# Project Overview

## What This Repository Is

`sql-format-plus` is a TypeScript library for formatting SQL strings into a more
readable layout. It is published as a package named `sql-format-plus` and exposes
both:

- a default object export with `.format(...)`
- a named `format(...)` export

The package is designed for JavaScript and TypeScript consumers. It builds ESM
and UMD browser-compatible bundles, plus a bundled declaration file.

## Main User-Facing API

```ts
import sqlFormatter, { format } from 'sql-format-plus'

sqlFormatter.format('SELECT * FROM table1')
format('SELECT * FROM table1', {
  language: 'sql',
  indent: '  ',
  params: ['value'],
})
```

Options live in `src/sql-format-plus/types.ts`:

- `language?: 'sql' | 'n1ql' | 'db2' | 'pl/sql'`
- `indent?: string`
- `params?: Record<string, string | number | boolean | null> | Array<string | number | boolean | null>`

## Repository Layout

- `src/sql-format-plus/`: package source.
- `src/sql-format-plus/core/`: shared tokenizer and formatting engine.
- `src/sql-format-plus/languages/`: dialect-specific formatter setup.
- `src/main.ts`: browser demo entry that imports the library source.
- `index.html`: Vite demo page.
- `test/`: behavior examples and regression tests written with `describe`/`it`
  globals and Node `assert`.
- `docs/`: VitePress docs, with English files at the root and Chinese files under
  `docs/zh-CN/`.
- `rollup.config.js`: package build, including `dist/` and `types/` cleanup.
- `vite.config.mts`: Vite library/demo config.
- `eslint.config.mjs`: ESLint flat config for JS and TypeScript.

## Generated And Ignored Paths

Do not hand-edit these paths unless the task is specifically about generated
output:

- `dist/`
- `types/`
- `temp/`
- `node_modules/`
- `.pnpm-store/`
- `docs/.vitepress/cache/`
- `docs/.vitepress/dist/`
- `coverage/`

Use `pnpm run build` to regenerate package artifacts.

## Existing Documentation

- `README.md`: English README and public package overview.
- `README.zh-CN.md`: Simplified Chinese README.
- `docs/index.md`: English docs home.
- `docs/guide/*.md`: English install, API, and demo pages.
- `docs/zh-CN/index.md`: Chinese docs home.
- `docs/zh-CN/guide/*.md`: Chinese install, API, and demo pages.

When changing public API, options, examples, or package outputs, update both
README files and both docs locales when relevant.
