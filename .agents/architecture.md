# Architecture Guide

## Public Entry Points

The main package entry is `src/sql-format-plus/index.ts`.

It exports:

- `format(query: string, cfg: FormatOptions = {}): string`
- a default object: `{ format }`
- public types from `src/sql-format-plus/types.ts`

`src/sql-format-plus/sqlFormatter.ts` re-exports the default, named `format`, and
types. Tests currently import from this compatibility file.

## Format Flow

The high-level pipeline is:

1. `format(query, options)` chooses a dialect formatter by `options.language`.
2. The dialect formatter constructs a shared `Formatter` with a configured
   `Tokenizer`.
3. `Tokenizer.tokenize(query)` converts input text into ordered tokens.
4. `Formatter` walks tokens and builds the formatted SQL string.
5. `Params` replaces placeholder tokens when `options.params` is provided.
6. The final string is trimmed and returned.

Unsupported dialect values throw:

```txt
Unsupported SQL dialect: <value>
```

## Core Modules

- `core/Tokenizer.ts`: regex-based lexer for whitespace, comments, strings,
  parentheses, placeholders, numbers, reserved words, words, and operators.
- `core/Formatter.ts`: token-to-output formatter. Handles newline placement,
  indentation, comments, commas, parentheses, placeholders, and reserved words.
- `core/Indentation.ts`: tracks top-level and block-level indentation.
- `core/InlineBlock.ts`: keeps short parenthesized expressions on one line when
  possible. Current inline threshold is 50 token-value characters.
- `core/Params.ts`: replaces named and indexed placeholders.
- `core/tokenTypes.ts`: shared token type constants.

## Dialect Modules

Dialect files live in `src/sql-format-plus/languages/`:

- `StandardSqlFormatter.ts`
- `N1qlFormatter.ts`
- `Db2Formatter.ts`
- `PlSqlFormatter.ts`

Each dialect defines tokenizer configuration such as:

- `reservedWords`
- `reservedToplevelWords`
- `reservedNewlineWords`
- `stringTypes`
- `openParens`
- `closeParens`
- `indexedPlaceholderTypes`
- `namedPlaceholderTypes`
- `lineCommentTypes`
- `specialWordChars`

When adding a dialect or changing dialect behavior, prefer editing the relevant
dialect configuration first. Only change shared core logic when the behavior
should apply across dialects.

## Placeholder Behavior

Placeholders are tokenized with a `key` when possible:

- Indexed placeholders like `?`, `?1`, `?25`.
- Named placeholders such as `@name`, `:name`, and quoted forms depending on the
  dialect configuration.

`Params.get()` behavior:

- Without `params`, the original placeholder text is preserved.
- With an array, unkeyed placeholders consume values sequentially.
- With a key and an array, the key is converted to a number and used as an index.
- With an object, keyed placeholders use the object key.
- Missing values preserve the original placeholder text.

## Formatting Behavior To Preserve

- Keyword casing is preserved from the input.
- Dot-qualified words should not treat the word after `.` as a reserved keyword.
- `LIMIT 5, 10` stays on one line after `LIMIT`.
- Short parenthesized expressions can stay inline; longer or complex blocks
  become multiline.
- Block comments are indented line by line.
- Public `language` string values are part of the API; changing them is a
  breaking change.

## Build Architecture

`rollup.config.js` is the authoritative package build. It uses:

- `@rollup/plugin-node-resolve`
- `@rollup/plugin-commonjs`
- `@rollup/plugin-typescript`
- `@rollup/plugin-terser`
- `rollup-plugin-dts`

It builds from `src/sql-format-plus/index.ts` and emits package artifacts to
`dist/` and `types/`.
