# API

## `format(query, options)`

格式化 SQL 查询里的空白、换行和缩进。

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

## 配置项

| 参数       | 类型                                                                                                | 默认值      | 说明                     |
| ---------- | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------ |
| `language` | `'sql' \| 'n1ql' \| 'db2' \| 'pl/sql'`                                                              | `'sql'`     | SQL 方言配置。           |
| `indent`   | `string`                                                                                            | `'  '`      | 一个缩进层级使用的字符。 |
| `params`   | `Record<string, string \| number \| boolean \| null> \| Array<string \| number \| boolean \| null>` | `undefined` | 占位符替换值。           |

## 方言

- `sql`：Standard SQL
- `n1ql`：Couchbase N1QL
- `db2`：IBM DB2
- `pl/sql`：Oracle PL/SQL

## 占位符替换

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
