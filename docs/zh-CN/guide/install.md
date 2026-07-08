# 安装

```bash
npm install sql-format-plus
```

```bash
pnpm add sql-format-plus
```

## 快速开始

```ts
import sqlFormatter from 'sql-format-plus'

const result = sqlFormatter.format('SELECT * FROM table1')
console.log(result)
```

输出：

```sql
SELECT
  *
FROM
  table1
```

## 命名导出

```ts
import { format } from 'sql-format-plus'

format('SELECT * FROM table1', {
  language: 'sql',
  indent: '    ',
})
```

## UMD

```html
<script src="https://unpkg.com/sql-format-plus/dist/sql-format-plus.umd.min.js"></script>
<script>
  const result = window.SqlFormatPlus.format('SELECT * FROM table1')
</script>
```
