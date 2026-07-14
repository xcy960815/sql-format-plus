# Contributing to sql-format-plus

Thank you for helping improve `sql-format-plus`. This guide covers the local development workflow, formatter tests, and the checks expected before a pull request.

## Local development

The repository uses pnpm and requires Node.js 18 or later. Install dependencies from the repository root:

```bash
pnpm install
```

Start the local Vite demo while developing:

```bash
pnpm run dev
```

Run the verification commands as you work:

```bash
# Type-check the source and tests
pnpm run check

# Run the Vitest suite
pnpm run test

# Check lint rules, or apply automatic lint fixes
pnpm run lint
pnpm run lint:fix

# Build the distributable bundles and TypeScript declarations
pnpm run build
```

Do not edit generated files in `dist/` or `types/` by hand. `pnpm run build` regenerates them from the TypeScript source.

## Tests and SQL dialects

Formatter behavior is covered by dialect-specific Vitest files:

| Language option | SQL dialect    | Test file                          |
| --------------- | -------------- | ---------------------------------- |
| `sql`           | Standard SQL   | `test/StandardSqlFormatterTest.ts` |
| `n1ql`          | Couchbase N1QL | `test/N1qlFormatterTest.ts`        |
| `db2`           | IBM DB2        | `test/Db2FormatterTest.ts`         |
| `pl/sql`        | Oracle PL/SQL  | `test/PlSqlFormatterTest.ts`       |

When fixing a formatting bug, add a regression case to the corresponding dialect file. When adding dialect support, add coverage for that dialect's keywords, comments, strings, parentheses, and placeholders as applicable. Shared behavior that should apply to multiple dialects can be added to `test/behavesLikeSqlFormatter.ts`.

Formatting tests compare exact output, including whitespace, indentation, and line breaks. Keep the reproduction focused and assert the complete formatted string.

## Before submitting a pull request

Run the full local sequence:

```bash
pnpm run check
pnpm run test
pnpm run lint
pnpm run build
```

If documentation changes, also run `pnpm run docs:build`. Public API, option, or example changes should be reflected in both `README.md` and `README.zh-CN.md`, as well as both documentation locales when relevant.

## Pre-commit checks

Husky runs `lint-staged` before each commit. Staged JavaScript and TypeScript files are processed with ESLint (`eslint --fix`) and Prettier, while supported documentation and configuration files are formatted with Prettier.

If the hook changes a staged file, review the result and stage it again before committing.

## Commit messages

The repository does not currently enforce a commit-message convention. Follow the existing history where practical, using short, imperative messages. Prefixes such as `fix:`, `docs:`, and `chore:` are welcome when they describe the change clearly.
