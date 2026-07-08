import type { FormatOptions } from '../types'
import Indentation from './Indentation'
import InlineBlock from './InlineBlock'
import Params from './Params'
import type Tokenizer from './Tokenizer'
import type { Token } from './Tokenizer'
import tokenTypes from './tokenTypes'

class OutputBuffer {
  private readonly chunks: string[] = []

  append(value: string): void {
    if (value) {
      this.chunks.push(value)
    }
  }

  trimEnd(): void {
    while (this.chunks.length > 0) {
      const lastIndex = this.chunks.length - 1
      const chunk = this.chunks[lastIndex]
      const trimmed = chunk.replace(/\s+$/, '')

      if (trimmed.length === chunk.length) {
        return
      }
      if (trimmed.length > 0) {
        this.chunks[lastIndex] = trimmed
        return
      }
      this.chunks.pop()
    }
  }

  addNewline(indent: string): void {
    this.trimEnd()
    this.append(`\n${indent}`)
  }

  toString(): string {
    return this.chunks.join('')
  }
}

export default class Formatter {
  private readonly cfg: FormatOptions

  private readonly indentation: Indentation

  private readonly inlineBlock: InlineBlock

  private readonly params: Params

  private readonly tokenizer: Tokenizer

  private previousReservedWord: Partial<Token> = {}

  private keywordBlockEndPending = false

  constructor(cfg: FormatOptions, tokenizer: Tokenizer) {
    this.cfg = cfg || {}
    this.indentation = new Indentation(this.cfg.indent)
    this.inlineBlock = new InlineBlock()
    this.params = new Params(this.cfg.params)
    this.tokenizer = tokenizer
  }

  format(query: string): string {
    const tokens = this.tokenizer.tokenize(query)
    const formattedQuery = this.getFormattedQueryFromTokens(tokens)

    return formattedQuery.trim()
  }

  private getFormattedQueryFromTokens(tokens: Token[]): string {
    const query = new OutputBuffer()

    tokens.forEach((token, index) => {
      if (token.type === tokenTypes.WHITESPACE) {
        return
      }
      if (token.type === tokenTypes.LINE_COMMENT) {
        this.formatLineComment(token, query)
      } else if (token.type === tokenTypes.BLOCK_COMMENT) {
        this.formatBlockComment(token, query)
      } else if (token.type === tokenTypes.RESERVED_KEYWORD_BLOCK_START) {
        this.formatKeywordBlockStart(token, query)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED_KEYWORD_BLOCK_END) {
        this.formatKeywordBlockEnd(token, query)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED_TOPLEVEL) {
        this.formatToplevelReservedWord(token, query)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED_NEWLINE) {
        this.formatNewlineReservedWord(token, query)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED) {
        this.formatWithSpaces(token, query)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.OPEN_PAREN) {
        this.formatOpeningParentheses(tokens, index, query)
      } else if (token.type === tokenTypes.CLOSE_PAREN) {
        this.formatClosingParentheses(token, query)
      } else if (token.type === tokenTypes.PLACEHOLDER) {
        this.formatPlaceholder(token, query)
      } else if (token.value === ',') {
        this.formatComma(token, query)
      } else if (token.value === ':') {
        this.formatWithSpaceAfter(token, query)
      } else if (token.value === ';') {
        this.formatSemicolon(token, query)
      } else if (token.value === '.') {
        this.formatWithoutSpaces(token, query)
      } else {
        this.formatWithSpaces(token, query)
      }
    })
    return query.toString()
  }

  private formatLineComment(token: Token, query: OutputBuffer): void {
    query.append(token.value)
    this.addNewline(query)
  }

  private formatBlockComment(token: Token, query: OutputBuffer): void {
    this.addNewline(query)
    query.append(this.indentComment(token.value))
    this.addNewline(query)
  }

  private indentComment(comment: string): string {
    return comment.replace(/\n/g, `\n${this.indentation.getIndent()}`)
  }

  private formatKeywordBlockStart(token: Token, query: OutputBuffer): void {
    if (
      /^LOOP$/i.test(token.value) &&
      /^END$/i.test(this.previousReservedWord.value || '')
    ) {
      this.formatWithSpaces(token, query)
      this.keywordBlockEndPending = true
      return
    }

    this.indentation.decreaseTopLevel()
    this.addNewline(query)
    this.indentation.increaseKeywordBlock()
    query.append(this.equalizeWhitespace(token.value))
    this.addNewline(query)
  }

  private formatKeywordBlockEnd(token: Token, query: OutputBuffer): void {
    if (this.inlineBlock.isActive() || this.indentation.isBlockLevel()) {
      this.formatClosingParentheses(token, query)
      return
    }

    this.indentation.decreaseKeywordBlock()
    this.addNewline(query)
    query.append(`${this.equalizeWhitespace(token.value)} `)
    this.keywordBlockEndPending = true
  }

  private formatToplevelReservedWord(token: Token, query: OutputBuffer): void {
    this.indentation.decreaseTopLevel()
    this.addNewline(query)
    this.indentation.increaseToplevel()
    query.append(this.equalizeWhitespace(token.value))
    this.addNewline(query)
  }

  private formatNewlineReservedWord(token: Token, query: OutputBuffer): void {
    this.addNewline(query)
    query.append(`${this.equalizeWhitespace(token.value)} `)
  }

  private equalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ')
  }

  private formatOpeningParentheses(
    tokens: Token[],
    index: number,
    query: OutputBuffer,
  ): void {
    const previousToken = tokens[index - 1]
    if (
      previousToken &&
      previousToken.type !== tokenTypes.WHITESPACE &&
      previousToken.type !== tokenTypes.OPEN_PAREN
    ) {
      query.trimEnd()
    }
    query.append(tokens[index].value)

    this.inlineBlock.beginIfPossible(tokens, index)

    if (!this.inlineBlock.isActive()) {
      this.indentation.increaseBlockLevel()
      this.addNewline(query)
    }
  }

  private formatClosingParentheses(token: Token, query: OutputBuffer): void {
    if (this.inlineBlock.isActive()) {
      this.inlineBlock.end()
      this.formatWithSpaceAfter(token, query)
      return
    }

    this.indentation.decreaseBlockLevel()
    this.addNewline(query)
    this.formatWithSpaces(token, query)
  }

  private formatPlaceholder(token: Token, query: OutputBuffer): void {
    query.append(`${this.params.get(token)} `)
  }

  private formatComma(token: Token, query: OutputBuffer): void {
    query.trimEnd()
    query.append(`${token.value} `)

    if (this.inlineBlock.isActive()) {
      return
    }
    if (/^LIMIT$/i.test(this.previousReservedWord.value || '')) {
      return
    }
    this.addNewline(query)
  }

  private formatWithSpaceAfter(token: Token, query: OutputBuffer): void {
    query.trimEnd()
    query.append(`${token.value} `)
  }

  private formatWithoutSpaces(token: Token, query: OutputBuffer): void {
    query.trimEnd()
    query.append(token.value)
  }

  private formatSemicolon(token: Token, query: OutputBuffer): void {
    this.formatWithoutSpaces(token, query)

    if (this.keywordBlockEndPending) {
      this.addNewline(query)
      this.keywordBlockEndPending = false
    }
  }

  private formatWithSpaces(token: Token, query: OutputBuffer): void {
    query.append(`${token.value} `)
  }

  private addNewline(query: OutputBuffer): void {
    query.addNewline(this.indentation.getIndent())
  }
}
