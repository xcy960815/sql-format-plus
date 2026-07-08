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
  keywordBlockStarts?: string[]
  keywordBlockEnds?: string[]
  indexedPlaceholderTypes?: string[]
  namedPlaceholderTypes?: string[]
  lineCommentTypes: string[]
  specialWordChars?: string[]
}

type OptionalRegex = RegExp | false
type PlaceholderRegex = OptionalRegex

const escapeRegExp = (value: string): string =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

export default class Tokenizer {
  private readonly WHITESPACE_REGEX = /(\s+)/y

  private readonly NUMBER_REGEX =
    /([0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)\b/y

  private readonly SIGNED_NUMBER_REGEX =
    /(-\s*(?:[0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)\b)/y

  private readonly ASSIGNMENT_REGEX = /(:=)/y

  private readonly OPERATOR_REGEX =
    /(!=|<>|==|<=|>=|!<|!>|\|\||::|->>|->|~~\*|~~|!~~\*|!~~|~\*|!~\*|!~|.)/y

  private readonly BLOCK_COMMENT_REGEX = /(\/\*[^]*?(?:\*\/|$))/y

  private readonly LINE_COMMENT_REGEX: RegExp

  private readonly RESERVED_TOPLEVEL_REGEX: RegExp

  private readonly RESERVED_NEWLINE_REGEX: RegExp

  private readonly RESERVED_PLAIN_REGEX: RegExp

  private readonly KEYWORD_BLOCK_START_REGEX: OptionalRegex

  private readonly KEYWORD_BLOCK_END_REGEX: OptionalRegex

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
    this.KEYWORD_BLOCK_START_REGEX = this.createOptionalReservedWordRegex(
      cfg.keywordBlockStarts,
    )
    this.KEYWORD_BLOCK_END_REGEX = this.createOptionalReservedWordRegex(
      cfg.keywordBlockEnds,
    )

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
    let previousSignificantToken: Token | undefined
    let index = 0

    while (index < input.length) {
      const token = this.getNextToken(input, index, previousSignificantToken)
      index += token.value.length

      tokens.push(token)
      if (token.type !== tokenTypes.WHITESPACE) {
        previousSignificantToken = token
      }
    }
    return tokens
  }

  private createLineCommentRegex(lineCommentTypes: string[]): RegExp {
    return new RegExp(
      `((?:${lineCommentTypes.map((c) => escapeRegExp(c)).join('|')}).*?(?:\n|$))`,
      'y',
    )
  }

  private createReservedWordRegex(reservedWords: string[]): RegExp {
    const reservedWordsPattern = reservedWords.join('|').replace(/ /g, '\\s+')
    return new RegExp(`(${reservedWordsPattern})\\b`, 'iy')
  }

  private createOptionalReservedWordRegex(
    reservedWords: string[] | undefined,
  ): OptionalRegex {
    if (!reservedWords || reservedWords.length === 0) {
      return false
    }
    return this.createReservedWordRegex(reservedWords)
  }

  private createWordRegex(specialChars: string[] = []): RegExp {
    return new RegExp(
      `([\\w${specialChars.map((c) => escapeRegExp(c)).join('')}]+)`,
      'y',
    )
  }

  private createStringRegex(stringTypes: StringType[]): RegExp {
    return new RegExp(`(${this.createStringPattern(stringTypes)})`, 'y')
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
      `(${parens.map((p) => this.escapeParen(p)).join('|')})`,
      'iy',
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

    return new RegExp(`((?:${typesRegex})(?:${pattern}))`, 'y')
  }

  private getNextToken(
    input: string,
    index: number,
    previousToken?: Token,
  ): Token {
    return (
      this.getWhitespaceToken(input, index) ||
      this.getCommentToken(input, index) ||
      this.getStringToken(input, index) ||
      this.getOpenParenToken(input, index) ||
      this.getCloseParenToken(input, index) ||
      this.getAssignmentToken(input, index) ||
      this.getPlaceholderToken(input, index) ||
      this.getNumberToken(input, index, previousToken) ||
      this.getKeywordBlockToken(input, index) ||
      this.getReservedWordToken(input, index, previousToken) ||
      this.getWordToken(input, index) ||
      this.getOperatorToken(input, index)
    )
  }

  private getWhitespaceToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.WHITESPACE,
      regex: this.WHITESPACE_REGEX,
    })
  }

  private getCommentToken(input: string, index: number): Token | undefined {
    return (
      this.getLineCommentToken(input, index) ||
      this.getBlockCommentToken(input, index)
    )
  }

  private getLineCommentToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.LINE_COMMENT,
      regex: this.LINE_COMMENT_REGEX,
    })
  }

  private getBlockCommentToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.BLOCK_COMMENT,
      regex: this.BLOCK_COMMENT_REGEX,
    })
  }

  private getStringToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.STRING,
      regex: this.STRING_REGEX,
    })
  }

  private getOpenParenToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.OPEN_PAREN,
      regex: this.OPEN_PAREN_REGEX,
    })
  }

  private getCloseParenToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.CLOSE_PAREN,
      regex: this.CLOSE_PAREN_REGEX,
    })
  }

  private getAssignmentToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.OPERATOR,
      regex: this.ASSIGNMENT_REGEX,
    })
  }

  private getPlaceholderToken(input: string, index: number): Token | undefined {
    return (
      this.getIdentNamedPlaceholderToken(input, index) ||
      this.getStringNamedPlaceholderToken(input, index) ||
      this.getIndexedPlaceholderToken(input, index)
    )
  }

  private getIdentNamedPlaceholderToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      index,
      regex: this.IDENT_NAMED_PLACEHOLDER_REGEX,
      parseKey: (value) => value.slice(1),
    })
  }

  private getStringNamedPlaceholderToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      index,
      regex: this.STRING_NAMED_PLACEHOLDER_REGEX,
      parseKey: (value) =>
        this.getEscapedPlaceholderKey({
          key: value.slice(2, -1),
          quoteChar: value.slice(-1),
        }),
    })
  }

  private getIndexedPlaceholderToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getPlaceholderTokenWithKey({
      input,
      index,
      regex: this.INDEXED_PLACEHOLDER_REGEX,
      parseKey: (value) => value.slice(1),
    })
  }

  private getPlaceholderTokenWithKey({
    input,
    index,
    regex,
    parseKey,
  }: {
    input: string
    index: number
    regex: PlaceholderRegex
    parseKey: (value: string) => string
  }): Token | undefined {
    const token = this.getTokenOnFirstMatch({
      input,
      index,
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

  private getNumberToken(
    input: string,
    index: number,
    previousToken?: Token,
  ): Token | undefined {
    const signedNumber = this.canReadSignedNumber(previousToken)
      ? this.getTokenOnFirstMatch({
          input,
          index,
          type: tokenTypes.NUMBER,
          regex: this.SIGNED_NUMBER_REGEX,
        })
      : undefined

    if (signedNumber) {
      return signedNumber
    }

    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.NUMBER,
      regex: this.NUMBER_REGEX,
    })
  }

  private canReadSignedNumber(previousToken?: Token): boolean {
    return (
      !previousToken ||
      previousToken.type === tokenTypes.OPERATOR ||
      previousToken.type === tokenTypes.OPEN_PAREN ||
      previousToken.value === ','
    )
  }

  private getOperatorToken(input: string, index: number): Token {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.OPERATOR,
      regex: this.OPERATOR_REGEX,
    }) as Token
  }

  private getKeywordBlockToken(
    input: string,
    index: number,
  ): Token | undefined {
    return (
      this.getTokenOnFirstMatch({
        input,
        index,
        type: tokenTypes.RESERVED_KEYWORD_BLOCK_END,
        regex: this.KEYWORD_BLOCK_END_REGEX,
      }) ||
      this.getTokenOnFirstMatch({
        input,
        index,
        type: tokenTypes.RESERVED_KEYWORD_BLOCK_START,
        regex: this.KEYWORD_BLOCK_START_REGEX,
      })
    )
  }

  private getReservedWordToken(
    input: string,
    index: number,
    previousToken?: Token,
  ): Token | undefined {
    if (previousToken?.value === '.') {
      return undefined
    }
    return (
      this.getToplevelReservedToken(input, index) ||
      this.getNewlineReservedToken(input, index) ||
      this.getPlainReservedToken(input, index)
    )
  }

  private getToplevelReservedToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.RESERVED_TOPLEVEL,
      regex: this.RESERVED_TOPLEVEL_REGEX,
    })
  }

  private getNewlineReservedToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.RESERVED_NEWLINE,
      regex: this.RESERVED_NEWLINE_REGEX,
    })
  }

  private getPlainReservedToken(
    input: string,
    index: number,
  ): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.RESERVED,
      regex: this.RESERVED_PLAIN_REGEX,
    })
  }

  private getWordToken(input: string, index: number): Token | undefined {
    return this.getTokenOnFirstMatch({
      input,
      index,
      type: tokenTypes.WORD,
      regex: this.WORD_REGEX,
    })
  }

  private getTokenOnFirstMatch({
    input,
    index,
    type,
    regex,
  }: {
    input: string
    index: number
    type: TokenType
    regex: RegExp | false
  }): Token | undefined {
    if (!regex) {
      return undefined
    }

    regex.lastIndex = index
    const matches = regex.exec(input)

    if (matches && matches.index === index) {
      return { type, value: matches[1] }
    }
    return undefined
  }
}
