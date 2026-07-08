# sql-format-plus

[English README](./README.md)

- 文档地址：[docs](./docs)

`sql-format-plus` 是一个轻量级 JavaScript 和 TypeScript SQL 格式化库。

它支持：

- Standard SQL
- Couchbase N1QL
- IBM DB2
- Oracle PL/SQL

## 功能特性

- 使用 TypeScript 编写，并内置打包后的类型声明
- 输出 ESM 和 UMD 构建产物
- 支持自定义缩进
- 支持命名占位符和索引占位符替换
- 按 SQL 方言配置 tokenizer
- 使用 VitePress 生成文档
- 使用 Vite 提供本地 demo

## 安装

```bash
npm install sql-format-plus
```

```bash
pnpm add sql-format-plus
```

## 快速开始

```ts
import sqlFormatter from 'sql-format-plus'

console.log(sqlFormatter.format('SELECT * FROM table1'))
```

输出：

```sql
SELECT
  *
FROM
  table1
```

也可以使用命名导出：

```ts
import { format } from 'sql-format-plus'

format('SELECT * FROM table1', {
  language: 'sql',
  indent: '    ',
})
```

## 占位符替换

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

| 参数       | 类型                                                                                                | 默认值      | 说明                     |
| ---------- | --------------------------------------------------------------------------------------------------- | ----------- | ------------------------ |
| `language` | `'sql' \| 'n1ql' \| 'db2' \| 'pl/sql'`                                                              | `'sql'`     | SQL 方言配置。           |
| `indent`   | `string`                                                                                            | `'  '`      | 一个缩进层级使用的字符。 |
| `params`   | `Record<string, string \| number \| boolean \| null> \| Array<string \| number \| boolean \| null>` | `undefined` | 占位符替换值。           |

## CDN / UMD 用法

```html
<script src="https://unpkg.com/sql-format-plus/dist/sql-format-plus.umd.min.js"></script>
<script>
  const result = window.SqlFormatPlus.format('SELECT * FROM table1')
</script>
```

## 构建产物说明

发布包包含：

- `dist/sql-format-plus.es.js`：给现代 bundler 使用的 ESM 版本
- `dist/sql-format-plus.umd.js`：给 script 标签或传统接入方式使用的 UMD 版本
- `dist/sql-format-plus.umd.min.js`：压缩后的 UMD 版本
- `types/sql-format-plus.d.ts`：打包后的 TypeScript 类型声明

源码映射文件和 CommonJS 构建产物不会进入最终发布包。

## 本地开发

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run docs:dev
```

## 项目结构

- `src/sql-format-plus/index.ts`：库入口
- `src/sql-format-plus/core`：分词、格式化、缩进、内联块和参数替换逻辑
- `src/sql-format-plus/languages`：不同 SQL 方言的 formatter 配置
- `src/main.ts`：本地 demo 入口
- `rollup.config.js`：库构建和类型打包配置
- `vite.config.mts`：demo 开发配置
- `docs`：VitePress 文档

## License

[MIT](./LICENSE)
