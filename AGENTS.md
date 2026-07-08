# AGENTS.md

This file is the entry index for AI agents working on this repository. Read it
first, then open the focused files under `.agents/` before making changes.

## Project Snapshot

`sql-format-plus` is a lightweight TypeScript SQL formatting library. It exposes
a `format(query, options)` API, supports several SQL dialects, ships ESM and UMD
bundles, and includes VitePress docs plus a local Vite demo.

Supported dialects:

- Standard SQL: `language: 'sql'`
- Couchbase N1QL: `language: 'n1ql'`
- IBM DB2: `language: 'db2'`
- Oracle PL/SQL: `language: 'pl/sql'`

## Start Here

- `.agents/project-overview.md`: repository purpose, package shape, and important
  directories.
- `.agents/development.md`: install, build, type-check, lint, format, docs, and
  demo commands.
- `.agents/architecture.md`: public API, formatter pipeline, tokenizer rules,
  dialect configuration, and build outputs.
- `.agents/testing.md`: current test layout, available verification commands, and
  how to add coverage safely.

## High-Value Paths

- `src/sql-format-plus/index.ts`: public entry point and dialect dispatch.
- `src/sql-format-plus/sqlFormatter.ts`: compatibility re-export for the package
  API.
- `src/sql-format-plus/types.ts`: exported option and dialect types.
- `src/sql-format-plus/core/`: tokenizer, formatting, indentation, inline block,
  parameter replacement, and token type logic.
- `src/sql-format-plus/languages/`: dialect-specific reserved words, comments,
  placeholders, string types, and parenthesis rules.
- `test/`: formatter behavior examples and regression coverage.
- `docs/`: VitePress documentation in English and Simplified Chinese.
- `src/main.ts` and `index.html`: local browser demo.
- `rollup.config.js`: library build and declaration bundling.

## Default Workflow For AI Agents

1. Read this file and the relevant `.agents/*` guide.
2. Inspect the code around the target behavior before editing.
3. Prefer the existing formatter/tokenizer/dialect patterns over new abstractions.
4. Update or add tests when behavior changes.
5. Run focused verification first, then broader checks when practical.
6. Do not manually edit generated outputs in `dist/` or `types/`; regenerate them
   with `pnpm run build`.

## Common Commands

```bash
pnpm install
pnpm run check
pnpm run lint
pnpm run build
pnpm run docs:build
pnpm run dev
pnpm run docs:dev
```

There is currently no dedicated `test` script in `package.json`. See
`.agents/testing.md` before assuming a runtime test command exists.

## Important Constraints

- Source is TypeScript with strict mode enabled, but `noImplicitAny` is currently
  disabled.
- Formatting style is controlled by Prettier: no semicolons and single quotes.
- Keep public API compatibility for the default export and named `format` export.
- Preserve existing README and docs behavior when changing public options or
  examples.
- Treat `dist/`, `types/`, `temp/`, docs build output, and dependency directories
  as generated or ignored artifacts.
