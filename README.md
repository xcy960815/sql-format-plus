# sql-format-plus

[![npm version](https://img.shields.io/npm/v/sql-format-plus.svg)](https://www.npmjs.com/package/sql-format-plus)
[![npm downloads](https://img.shields.io/npm/dw/sql-format-plus.svg)](https://www.npmjs.com/package/sql-format-plus)
[![CI](https://github.com/xcy960815/sql-format-plus/actions/workflows/ci.yml/badge.svg)](https://github.com/xcy960815/sql-format-plus/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/sql-format-plus.svg)](./LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/xcy960815/sql-format-plus.svg)](https://github.com/xcy960815/sql-format-plus/issues)
[![GitHub stars](https://img.shields.io/github/stars/xcy960815/sql-format-plus.svg?style=social&label=Stars)](https://github.com/xcy960815/sql-format-plus)
[![GitHub forks](https://img.shields.io/github/forks/xcy960815/sql-format-plus.svg?style=social&label=Fork)](https://github.com/xcy960815/sql-format-plus)

[中文文档](./README.zh-CN.md)

- Documentation: [https://xcy960815.github.io/sql-format-plus/](https://xcy960815.github.io/sql-format-plus/)
- Online Demo: [https://xcy960815.github.io/sql-format-plus/guide/demo](https://xcy960815.github.io/sql-format-plus/guide/demo)

`sql-format-plus` is a lightweight JavaScript and TypeScript library for pretty-printing SQL queries.

It supports:

- Standard SQL
- Couchbase N1QL
- IBM DB2
- Oracle PL/SQL

## Features

- TypeScript source and bundled declaration files
- ESM and UMD build artifacts
- Configurable indentation
- Named and indexed placeholder replacement
- Dialect-specific tokenizer configuration
- VitePress documentation
- Local Vite demo

## Installation

```bash
npm install sql-format-plus
```

```bash
pnpm add sql-format-plus
```

## Quick Start

```ts
import sqlFormatter from 'sql-format-plus'

console.log(sqlFormatter.format('SELECT * FROM table1'))
```

Output:

```sql
SELECT
  *
FROM
  table1
```

You can also use the named export:

```ts
import { format } from 'sql-format-plus'

format('SELECT * FROM table1', {
  language: 'sql',
  indent: '    ',
})
```

## Placeholder Replacement

```ts
import { format } from 'sql-format-plus'

format('SELECT * FROM tbl WHERE foo = @foo', {
  params: {
    foo: "'bar'",
  },
})
```

```ts
format('SELECT * FROM tbl WHERE foo = ?', {
  params: ["'bar'"],
})
```

## API

### `format(query, options)`

| Option     | Type                                                                                                | Default     | Description                                |
| ---------- | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `language` | `'sql' \| 'n1ql' \| 'db2' \| 'pl/sql'`                                                              | `'sql'`     | SQL dialect configuration.                 |
| `indent`   | `string`                                                                                            | `'  '`      | Characters used for one indentation level. |
| `params`   | `Record<string, string \| number \| boolean \| null> \| Array<string \| number \| boolean \| null>` | `undefined` | Placeholder replacement values.            |

## CDN / UMD Example

```html
<script src="https://unpkg.com/sql-format-plus/dist/sql-format-plus.umd.min.js"></script>
<script>
  const result = window.SqlFormatPlus.format('SELECT * FROM table1')
</script>
```

## Build Artifacts

The published package includes:

- `dist/sql-format-plus.es.js`: ESM build for modern bundlers
- `dist/sql-format-plus.cjs`: CommonJS build for `require()`
- `dist/sql-format-plus.umd.js`: UMD build for script-tag or legacy integration
- `dist/sql-format-plus.umd.min.js`: minified UMD build
- `types/sql-format-plus.d.ts`: bundled TypeScript declarations

Source maps are intentionally not published.

## Development

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run test
pnpm run lint
pnpm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete development workflow, dialect-specific test locations, and contribution guidelines.

## Project Structure

- `src/sql-format-plus/index.ts`: library entry
- `src/sql-format-plus/core`: tokenizer, formatter, indentation, inline-block, and params logic
- `src/sql-format-plus/languages`: dialect-specific formatter configuration
- `src/main.ts`: local demo entry
- `rollup.config.cjs`: Rollup build for library bundles and bundled declarations
- `vite.config.mts`: Vite config for the demo app
- `docs`: VitePress documentation

## License

[MIT](./LICENSE)
