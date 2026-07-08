import tokenTypes from './tokenTypes'
import type { Token } from './Tokenizer'

const INLINE_MAX_LENGTH = 50

/**
 * 内联块的记账器。
 *
 * 内联块是短于最大长度（例如 50 个字符）的括号表达式。
 * 这些块会保持在单行上，以节省空间并提高可读性，而不是在括号后插入换行。
 */
export default class InlineBlock {
  private level = 0

  /**
   * 如果可能，开始将括号表达式作为内联块进行跟踪。
   *
   * @param {Token[]} tokens 查询中的所有 Token。
   * @param {number} index 当前左括号 Token 的索引。
   */
  beginIfPossible(tokens: Token[], index: number): void {
    if (this.level === 0 && this.isInlineBlock(tokens, index)) {
      this.level = 1
    } else if (this.level > 0) {
      this.level++
    } else {
      this.level = 0
    }
  }

  /**
   * 递减当前处于活动状态的嵌套内联块层级。
   */
  end(): void {
    this.level--
  }

  /**
   * 检查是否存在活动的内联块。
   *
   * @returns {boolean} 如果在内联块内则返回 true，否则返回 false。
   */
  isActive(): boolean {
    return this.level > 0
  }

  /**
   * 评估当前的括号组是否符合内联块的条件。
   *
   * 向前遍历 Token 直至匹配的右括号。
   * 如果超过最大长度或包含受限 Token（例如注释、换行符、顶级关键字），则取消内联块格式。
   *
   * @param {Token[]} tokens 查询中的 Token。
   * @param {number} index 当前左括号的索引。
   * @returns {boolean} 如果该组可以进行内联格式化则返回 true。
   */
  private isInlineBlock(tokens: Token[], index: number): boolean {
    let length = 0
    let level = 0
    const openingToken = tokens[index]

    for (let i = index; i < tokens.length; i++) {
      const token = tokens[i]
      length += token.value.length

      if (length > INLINE_MAX_LENGTH) {
        return false
      }

      if (token.type === tokenTypes.OPEN_PAREN) {
        level++
      } else if (this.isClosingToken(token, openingToken)) {
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

  /**
   * 检查 Token 是否在内联块中被禁用。
   *
   * 禁用的 Token 包括注释、顶级/换行保留字或分号。
   *
   * @param {Token} token 要检查的 Token。
   * @returns {boolean} 如果 Token 在内联块中被禁用则返回 true。
   */
  private isForbiddenToken({ type, value }: Token): boolean {
    return (
      type === tokenTypes.RESERVED_TOPLEVEL ||
      type === tokenTypes.RESERVED_NEWLINE ||
      type === tokenTypes.RESERVED_KEYWORD_BLOCK_START ||
      type === tokenTypes.LINE_COMMENT ||
      type === tokenTypes.BLOCK_COMMENT ||
      value === ';'
    )
  }

  private isClosingToken(token: Token, openingToken: Token): boolean {
    return (
      token.type === tokenTypes.CLOSE_PAREN ||
      (/^CASE$/i.test(openingToken.value) &&
        token.type === tokenTypes.RESERVED_KEYWORD_BLOCK_END)
    )
  }
}
