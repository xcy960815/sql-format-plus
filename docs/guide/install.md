# Installation

```bash
npm install sql-format-plus
```

```bash
pnpm add sql-format-plus
```

## Quick Start

```ts
import sqlFormatter from 'sql-format-plus'

const result = sqlFormatter.format('SELECT * FROM table1')
console.log(result)
```

Output:

```sql
SELECT
  *
FROM
  table1
```

## Named Export

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
