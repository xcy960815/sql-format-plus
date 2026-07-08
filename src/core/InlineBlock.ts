import tokenTypes from './tokenTypes'
import type { Token } from './Tokenizer'

const INLINE_MAX_LENGTH = 50

/**
 * Bookkeeper for inline blocks.
 *
 * Inline blocks are parenthized expressions that are shorter than INLINE_MAX_LENGTH.
 * These blocks are formatted on a single line, unlike longer parenthized
 * expressions where open-parenthesis causes newline and increase of indentation.
 */
export default class InlineBlock {
  private level = 0

  beginIfPossible(tokens: Token[], index: number): void {
    if (this.level === 0 && this.isInlineBlock(tokens, index)) {
      this.level = 1
    } else if (this.level > 0) {
      this.level++
    } else {
      this.level = 0
    }
  }

  end(): void {
    this.level--
  }

  isActive(): boolean {
    return this.level > 0
  }

  private isInlineBlock(tokens: Token[], index: number): boolean {
    let length = 0
    let level = 0

    for (let i = index; i < tokens.length; i++) {
      const token = tokens[i]
      length += token.value.length

      if (length > INLINE_MAX_LENGTH) {
        return false
      }

      if (token.type === tokenTypes.OPEN_PAREN) {
        level++
      } else if (token.type === tokenTypes.CLOSE_PAREN) {
        level--
        if (level === 0) {
          return true
        }
      }

      if (this.isForbiddenToken(token)) {
        return false
      }
    }
    return false
  }

  private isForbiddenToken({ type, value }: Token): boolean {
    return (
      type === tokenTypes.RESERVED_TOPLEVEL ||
      type === tokenTypes.RESERVED_NEWLINE ||
      type === tokenTypes.LINE_COMMENT ||
      type === tokenTypes.BLOCK_COMMENT ||
      value === ';'
    )
  }
}
