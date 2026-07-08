# API

## `format(query, options)`

Formats whitespace in a SQL query.

```ts
import { format } from 'sql-format-plus'

format('SELECT * FROM table1 WHERE id = @id', {
  language: 'sql',
  indent: '  ',
  params: {
    id: 10,
  },
})
```

## Options

| Option     | Type                                                                                                | Default     | Description                                |
| ---------- | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `language` | `'sql' \| 'n1ql' \| 'db2' \| 'pl/sql'`                                                              | `'sql'`     | SQL dialect configuration.                 |
| `indent`   | `string`                                                                                            | `'  '`      | Characters used for one indentation level. |
| `params`   | `Record<string, string \| number \| boolean \| null> \| Array<string \| number \| boolean \| null>` | `undefined` | Placeholder replacement values.            |

## Dialects

- `sql`: Standard SQL
- `n1ql`: Couchbase N1QL
- `db2`: IBM DB2
- `pl/sql`: Oracle PL/SQL

## Placeholder Replacement

```ts
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
