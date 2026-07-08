/**
 * 表示已解析的 SQL Token 类型的常量。
 */
const tokenTypes = {
  WHITESPACE: 'whitespace',
  WORD: 'word',
  STRING: 'string',
  RESERVED: 'reserved',
  RESERVED_TOPLEVEL: 'reserved-toplevel',
  RESERVED_NEWLINE: 'reserved-newline',
  RESERVED_KEYWORD_BLOCK_START: 'reserved-keyword-block-start',
  RESERVED_KEYWORD_BLOCK_END: 'reserved-keyword-block-end',
  OPERATOR: 'operator',
  OPEN_PAREN: 'open-paren',
  CLOSE_PAREN: 'close-paren',
  LINE_COMMENT: 'line-comment',
  BLOCK_COMMENT: 'block-comment',
  NUMBER: 'number',
  PLACEHOLDER: 'placeholder',
} as const

/**
 * 表示所有可能 Token 类型值的联合类型。
 */
export type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes]

export default tokenTypes
