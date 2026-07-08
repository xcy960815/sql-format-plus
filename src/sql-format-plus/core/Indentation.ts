const INDENT_TYPE_TOP_LEVEL = 'top-level'
const INDENT_TYPE_BLOCK_LEVEL = 'block-level'

type IndentType = typeof INDENT_TYPE_TOP_LEVEL | typeof INDENT_TYPE_BLOCK_LEVEL

/**
 * Manages indentation levels.
 *
 * There are two types of indentation levels:
 *
 * - BLOCK_LEVEL : increased by open-parenthesis
 * - TOP_LEVEL : increased by RESERVED_TOPLEVEL words
 */
export default class Indentation {
  private readonly indent: string

  private readonly indentTypes: IndentType[] = []

  constructor(indent?: string) {
    this.indent = indent || '  '
  }

  getIndent(): string {
    return this.indent.repeat(this.indentTypes.length)
  }

  increaseToplevel(): void {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL)
  }

  increaseBlockLevel(): void {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL)
  }

  decreaseTopLevel(): void {
    if (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_TOP_LEVEL
    ) {
      this.indentTypes.pop()
    }
  }

  decreaseBlockLevel(): void {
    while (this.indentTypes.length > 0) {
      const type = this.indentTypes.pop()
      if (type !== INDENT_TYPE_TOP_LEVEL) {
        break
      }
    }
  }
}
