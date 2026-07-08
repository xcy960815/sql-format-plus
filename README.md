# sql-format-plus

[中文文档](./README.zh-CN.md)

- Documentation: [docs](./docs)

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
- `dist/sql-format-plus.umd.js`: UMD build for script-tag or legacy integration
- `dist/sql-format-plus.umd.min.js`: minified UMD build
- `types/sql-format-plus.d.ts`: bundled TypeScript declarations

Source maps and CommonJS output are intentionally not published.

## Development

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run docs:dev
```

## Project Structure

- `src/index.ts`: library entry
- `src/core`: tokenizer, formatter, indentation, inline-block, and params logic
- `src/languages`: dialect-specific formatter configuration
- `src/main.ts`: local demo entry
- `rollup.config.js`: Rollup build for library bundles and bundled declarations
- `vite.config.mts`: Vite config for the demo app
- `docs`: VitePress documentation

## License

[MIT](./LICENSE)
