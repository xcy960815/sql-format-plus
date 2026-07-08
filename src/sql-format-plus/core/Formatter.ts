import type { FormatOptions } from '../types'
import Indentation from './Indentation'
import InlineBlock from './InlineBlock'
import Params from './Params'
import type Tokenizer from './Tokenizer'
import type { Token } from './Tokenizer'
import tokenTypes from './tokenTypes'

const trimEnd = (value: string): string => value.replace(/\s+$/, '')

export default class Formatter {
  private readonly cfg: FormatOptions

  private readonly indentation: Indentation

  private readonly inlineBlock: InlineBlock

  private readonly params: Params

  private readonly tokenizer: Tokenizer

  private previousReservedWord: Partial<Token> = {}

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
    let formattedQuery = ''

    tokens.forEach((token, index) => {
      if (token.type === tokenTypes.WHITESPACE) {
        return
      }
      if (token.type === tokenTypes.LINE_COMMENT) {
        formattedQuery = this.formatLineComment(token, formattedQuery)
      } else if (token.type === tokenTypes.BLOCK_COMMENT) {
        formattedQuery = this.formatBlockComment(token, formattedQuery)
      } else if (token.type === tokenTypes.RESERVED_TOPLEVEL) {
        formattedQuery = this.formatToplevelReservedWord(token, formattedQuery)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED_NEWLINE) {
        formattedQuery = this.formatNewlineReservedWord(token, formattedQuery)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.RESERVED) {
        formattedQuery = this.formatWithSpaces(token, formattedQuery)
        this.previousReservedWord = token
      } else if (token.type === tokenTypes.OPEN_PAREN) {
        formattedQuery = this.formatOpeningParentheses(
          tokens,
          index,
          formattedQuery,
        )
      } else if (token.type === tokenTypes.CLOSE_PAREN) {
        formattedQuery = this.formatClosingParentheses(token, formattedQuery)
      } else if (token.type === tokenTypes.PLACEHOLDER) {
        formattedQuery = this.formatPlaceholder(token, formattedQuery)
      } else if (token.value === ',') {
        formattedQuery = this.formatComma(token, formattedQuery)
      } else if (token.value === ':') {
        formattedQuery = this.formatWithSpaceAfter(token, formattedQuery)
      } else if (token.value === '.' || token.value === ';') {
        formattedQuery = this.formatWithoutSpaces(token, formattedQuery)
      } else {
        formattedQuery = this.formatWithSpaces(token, formattedQuery)
      }
    })
    return formattedQuery
  }

  private formatLineComment(token: Token, query: string): string {
    return this.addNewline(query + token.value)
  }

  private formatBlockComment(token: Token, query: string): string {
    return this.addNewline(
      this.addNewline(query) + this.indentComment(token.value),
    )
  }

  private indentComment(comment: string): string {
    return comment.replace(/\n/g, `\n${this.indentation.getIndent()}`)
  }

  private formatToplevelReservedWord(token: Token, query: string): string {
    this.indentation.decreaseTopLevel()

    query = this.addNewline(query)

    this.indentation.increaseToplevel()

    query += this.equalizeWhitespace(token.value)
    return this.addNewline(query)
  }

  private formatNewlineReservedWord(token: Token, query: string): string {
    return `${this.addNewline(query)}${this.equalizeWhitespace(token.value)} `
  }

  private equalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ')
  }

  private formatOpeningParentheses(
    tokens: Token[],
    index: number,
    query: string,
  ): string {
    const previousToken = tokens[index - 1]
    if (
      previousToken &&
      previousToken.type !== tokenTypes.WHITESPACE &&
      previousToken.type !== tokenTypes.OPEN_PAREN
    ) {
      query = trimEnd(query)
    }
    query += tokens[index].value

    this.inlineBlock.beginIfPossible(tokens, index)

    if (!this.inlineBlock.isActive()) {
      this.indentation.increaseBlockLevel()
      query = this.addNewline(query)
    }
    return query
  }

  private formatClosingParentheses(token: Token, query: string): string {
    if (this.inlineBlock.isActive()) {
      this.inlineBlock.end()
      return this.formatWithSpaceAfter(token, query)
    }

    this.indentation.decreaseBlockLevel()
    return this.formatWithSpaces(token, this.addNewline(query))
  }

  private formatPlaceholder(token: Token, query: string): string {
    return `${query}${this.params.get(token)} `
  }

  private formatComma(token: Token, query: string): string {
    query = `${trimEnd(query)}${token.value} `

    if (this.inlineBlock.isActive()) {
      return query
    }
    if (/^LIMIT$/i.test(this.previousReservedWord.value || '')) {
      return query
    }
    return this.addNewline(query)
  }

  private formatWithSpaceAfter(token: Token, query: string): string {
    return `${trimEnd(query)}${token.value} `
  }

  private formatWithoutSpaces(token: Token, query: string): string {
    return trimEnd(query) + token.value
  }

  private formatWithSpaces(token: Token, query: string): string {
    return `${query}${token.value} `
  }

  private addNewline(query: string): string {
    return `${trimEnd(query)}\n${this.indentation.getIndent()}`
  }
}
