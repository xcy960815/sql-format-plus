import type { StringType } from '../types'
import tokenTypes, { type TokenType } from './tokenTypes'

export interface Token {
  type: TokenType
  value: string
  key?: string
}

export interface TokenizerConfig {
  reservedWords: string[]
  reservedToplevelWords: string[]
  reservedNewlineWords: string[]
  stringTypes: StringType[]
  openParens: string[]
  closeParens: string[]
  indexedPlaceholderTypes?: string[]
  namedPlaceholderTypes?: string[]
  lineCommentTypes: string[]
  specialWordChars?: string[]
}

type PlaceholderRegex = RegExp | false

const escapeRegExp = (value: string): string =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

export default class Tokenizer {
  private readonly WHITESPACE_REGEX = /^(\s+)/

  private readonly NUMBER_REGEX =
    /^((-\s*)?[0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)\b/

  private readonly OPERATOR_REGEX =
    /^(!=|<>|==|<=|>=|!<|!>|\|\||::|->>|->|~~\*|~~|!~~\*|!~~|~\*|!~\*|!~|.)/

  private readonly BLOCK_COMMENT_REGEX = /^(\/\*[^]*?(?:\*\/|$))/

  private readonly LINE_COMMENT_REGEX: RegExp

  private readonly RESERVED_TOPLEVEL_REGEX: RegExp

  private readonly RESERVED_NEWLINE_REGEX: RegExp

  private readonly RESERVED_PLAIN_REGEX: RegExp

  private readonly WORD_REGEX: RegExp

  private readonly STRING_REGEX: RegExp

  private readonly OPEN_PAREN_REGEX: RegExp

  private readonly CLOSE_PAREN_REGEX: RegExp

  private readonly INDEXED_PLACEHOLDER_REGEX: PlaceholderRegex

  private readonly IDENT_NAMED_PLACEHOLDER_REGEX: PlaceholderRegex

  private readonly STRING_NAMED_PLACEHOLDER_REGEX: PlaceholderRegex

  constructor(cfg: TokenizerConfig) {
    this.LINE_COMMENT_REGEX = this.createLineCommentRegex(cfg.lineCommentTypes)

    this.RESERVED_TOPLEVEL_REGEX = this.createReservedWordRegex(
      cfg.reservedToplevelWords,
    )
    this.RESERVED_NEWLINE_REGEX = this.createReservedWordRegex(
      cfg.reservedNewlineWords,
    )
    this.RESERVED_PLAIN_REGEX = this.createReservedWordRegex(cfg.reservedWords)

    this.WORD_REGEX = this.createWordRegex(cfg.specialWordChars)
    this.STRING_REGEX = this.createStringRegex(cfg.stringTypes)

    this.OPEN_PAREN_REGEX = this.createParenRegex(cfg.openParens)
    this.CLOSE_PAREN_REGEX = this.createParenRegex(cfg.closeParens)

    this.INDEXED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(
      cfg.indexedPlaceholderTypes,
      '[0-9]*',
    )
    this.IDENT_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(
      cfg.namedPlaceholderTypes,
      '[a-zA-Z0-9._$]+',
    )
    this.STRING_NAMED_PLACEHOLDER_REGEX = this.createPlaceholderRegex(
      cfg.namedPlaceholderTypes,
      this.createStringPattern(cfg.stringTypes),
    )
  }

  tokenize(input: string): Token[] {
    const tokens: Token[] = []
    let token: Token
    let previousToken: Token | undefined

    while (input.length) {
      token = this.getNextToken(input, previousToken)
      input = input.substring(token.value.length)

      tokens.push(token)
      previousToken = token
    }
    return tokens
  }

  private createLineCommentRegex(lineCommentTypes: string[]): RegExp {
    return new RegExp(
      `^((?:${lineCommentTypes.map((c) => escapeRegExp(c)).join('|')}).*?(?:\n|$))`,
    )
  }

  private createReservedWordRegex(reservedWords: string[]): RegExp {
    const reservedWordsPattern = reservedWords.join('|').replace(/ /g, '\\s+')
    return new RegExp(`^(${reservedWordsPattern})\\b`, 'i')
  }

  private createWordRegex(specialChars: string[] = []): RegExp {
    return new RegExp(
      `^([\\w${specialChars.map((c) => escapeRegExp(c)).join('')}]+)`,
    )
  }

  private createStringRegex(stringTypes: StringType[]): RegExp {
    return new RegExp(`^(${this.createStringPattern(stringTypes)})`)
  }

  private createStringPattern(stringTypes: StringType[]): string {
    const patterns: Record<StringType, string> = {
      '``': '((`[^`]*($|`))+)',
      '[]': '((\\[[^\\]]*($|\\]))(\\][^\\]]*($|\\]))*)',
      '""': '((\\"[^\\"\\\\]*(?:\\\\.[^\\"\\\\]*)*(\\"|$))+)',
      "''": "(('[^'\\\\]*(?:\\\\.[^'\\\\]*)*('|$))+)",
      "N''": "((N'[^N'\\\\]*(?:\\\\.[^N'\\\\]*)*('|$))+)",
    }

    return stringTypes.map((type) => patterns[type]).join('|')
  }

  private createParenRegex(parens: string[]): RegExp {
    return new RegExp(
      `^(${parens.map((p) => this.escapeParen(p)).join('|')})`,
      'i',
    )
  }

  private escapeParen(paren: string): string {
    if (paren.length === 1) {
      return escapeRegExp(paren)
    }
    return `\\b${paren}\\b`
  }

  private createPlaceholderRegex(
    types: string[] | undefined,
    pattern: string,
  ): PlaceholderRegex {
    if (!types || types.length === 0) {
      return false
    }
    const typesRegex = types.map((type) => escapeRegExp(type)).join('|')

    return new RegExp(`^((?:${typesRegex})(?:${pattern}))`)
  }

  private getNextToken(input: string, previousToken?: Token): Token {
    return (
      this.getWhitespaceToken(input) ||
      this.getCommentToken(input) ||
      this.getStringToken(input) ||
      this.getOpenParenToken(input) ||
      this.getCloseParenToken(input) ||
      this.getPlaceholderToken(input) ||
      this.getNumberToken(input) ||
      this.getReservedWordToken(input, previousToken) ||
      this.getWordToken(input) ||
      this.getOperatorToken(input)
    )
  }

  private getWhitespaceToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.WHITESPACE,
      regex: this.WHITESPACE_REGEX,
    })
  }

  private getCommentToken(input: string): Token | undefined {
    return this.getLineCommentToken(input) || this.getBlockCommentToken(input)
  }

  private getLineCommentToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.LINE_COMMENT,
      regex: this.LINE_COMMENT_REGEX,
    })
  }

  private getBlockCommentToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.BLOCK_COMMENT,
      regex: this.BLOCK_COMMENT_REGEX,
    })
  }

  private getStringToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.STRING,
      regex: this.STRING_REGEX,
    })
  }

  private getOpenParenToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.OPEN_PAREN,
      regex: this.OPEN_PAREN_REGEX,
    })
  }

  private getCloseParenToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.CLOSE_PAREN,
      regex: this.CLOSE_PAREN_REGEX,
    })
  }

  private getPlaceholderToken(input: string): Token | undefined {
    return (
      this.getIdentNamedPlaceholderToken(input) ||
      this.getStringNamedPlaceholderToken(input) ||
      this.getIndexedPlaceholderToken(input)
    )
  }

  private getIdentNamedPlaceholderToken(input: string): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.IDENT_NAMED_PLACEHOLDER_REGEX,
      parseKey: (value) => value.slice(1),
    })
  }

  private getStringNamedPlaceholderToken(input: string): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.STRING_NAMED_PLACEHOLDER_REGEX,
      parseKey: (value) =>
        this.getEscapedPlaceholderKey({
          key: value.slice(2, -1),
          quoteChar: value.slice(-1),
        }),
    })
  }

  private getIndexedPlaceholderToken(input: string): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      regex: this.INDEXED_PLACEHOLDER_REGEX,
      parseKey: (value) => value.slice(1),
    })
  }

  private getPlaceholderTokenWithKey({
    input,
    regex,
    parseKey,
  }: {
    input: string
    regex: PlaceholderRegex
    parseKey: (value: string) => string
  }): Token | undefined {
    const token = this.getTokenOnFirstMatch({
      input,
      regex,
      type: tokenTypes.PLACEHOLDER,
    })
    if (token) {
      token.key = parseKey(token.value)
    }
    return token
  }

  private getEscapedPlaceholderKey({
    key,
    quoteChar,
  }: {
    key: string
    quoteChar: string
  }): string {
    return key.replace(
      new RegExp(`${escapeRegExp('\\')}${quoteChar}`, 'g'),
      quoteChar,
    )
  }

  private getNumberToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.NUMBER,
      regex: this.NUMBER_REGEX,
    })
  }

  private getOperatorToken(input: string): Token {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.OPERATOR,
      regex: this.OPERATOR_REGEX,
    }) as Token
  }

  private getReservedWordToken(
    input: string,
    previousToken?: Token,
  ): Token | undefined {
    if (previousToken?.value === '.') {
      return undefined
    }
    return (
      this.getToplevelReservedToken(input) ||
      this.getNewlineReservedToken(input) ||
      this.getPlainReservedToken(input)
    )
  }

  private getToplevelReservedToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_TOPLEVEL,
      regex: this.RESERVED_TOPLEVEL_REGEX,
    })
  }

  private getNewlineReservedToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED_NEWLINE,
      regex: this.RESERVED_NEWLINE_REGEX,
    })
  }

  private getPlainReservedToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.RESERVED,
      regex: this.RESERVED_PLAIN_REGEX,
    })
  }

  private getWordToken(input: string): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      type: tokenTypes.WORD,
      regex: this.WORD_REGEX,
    })
  }

  private getTokenOnFirstMatch({
    input,
    type,
    regex,
  }: {
    input: string
    type: TokenType
    regex: RegExp | false
  }): Token | undefined {
    if (!regex) {
      return undefined
    }

    const matches = input.match(regex)

    if (matches) {
      return { type, value: matches[1] }
    }
    return undefined
  }
}
