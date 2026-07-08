# Testing And Verification Guide

## Current Test Shape

Tests live in `test/` and use `describe` / `it` globals with Node `assert`.
Custom global declarations are in `test/globals.d.ts`.

Important files:

- `test/behavesLikeSqlFormatter.ts`: shared behavior used by dialect tests.
- `test/StandardSqlFormatterTest.ts`: broad standard SQL coverage.
- `test/N1qlFormatterTest.ts`: N1QL behavior.
- `test/Db2FormatterTest.ts`: DB2 behavior.
- `test/PlSqlFormatterTest.ts`: PL/SQL behavior.
- `test/sqlFormatterTest.ts`: public dispatch/error behavior.

## Available Verification Commands

Use these commands from the repository root:

```bash
pnpm test
pnpm run check
pnpm run lint
pnpm run format:check
pnpm run build
pnpm run docs:build
```

`pnpm test` runs the existing formatter tests with Vitest:

```bash
vitest run
```

`pnpm run check` type-checks both source and test files:

```bash
tsc --noEmit && tsc -p tsconfig.test.json
```

For behavior changes, at minimum:

1. Add or update cases in the relevant `test/*FormatterTest.ts` file.
2. Run `pnpm test`.
3. Run `pnpm run check`.
4. Run `pnpm run lint` when touching source or tests.
5. Run `pnpm run build` before validating package output.

## Adding Or Changing Formatter Behavior

Prefer regression tests that compare exact formatted output. Existing tests use:

```ts
assert.equal(
  sqlFormatter.format('SELECT * FROM table1'),
  'SELECT\n' + '  *\n' + 'FROM\n' + '  table1',
)
```

When adding coverage:

- Put shared behavior in `behavesLikeSqlFormatter.ts` only if it should apply to
  multiple dialects.
- Put dialect-specific behavior in that dialect's test file.
- Include tricky placeholder, comment, string, parenthesis, and reserved-word
  cases when changing tokenizer rules.
- Preserve exact whitespace in expected strings; whitespace is the product.
