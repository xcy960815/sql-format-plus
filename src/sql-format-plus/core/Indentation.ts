const INDENT_TYPE_TOP_LEVEL = 'top-level'
const INDENT_TYPE_BLOCK_LEVEL = 'block-level'
const INDENT_TYPE_KEYWORD_BLOCK = 'keyword-block'

type IndentType =
  | typeof INDENT_TYPE_TOP_LEVEL
  | typeof INDENT_TYPE_BLOCK_LEVEL
  | typeof INDENT_TYPE_KEYWORD_BLOCK

/**
 * 管理 SQL 格式化的缩进层级。
 *
 * 跟踪嵌套的格式化层级以计算缩进前缀字符串。
 * 支持三种不同的层级类型：
 * - `block-level`：由左括号增加
 * - `top-level`：由顶级保留关键字（例如 SELECT、FROM）增加
 * - `keyword-block`：由 BEGIN、LOOP 等方言关键字块增加
 */
export default class Indentation {
  private readonly indent: string

  private readonly indentTypes: IndentType[] = []

  /**
   * 初始化缩进管理器。
   *
   * @param {string} [indent] 缩进字符/字符串（默认为两个空格：'  '）。
   */
  constructor(indent?: string) {
    this.indent = indent || '  '
  }

  /**
   * 根据当前处于活动状态的缩进层级生成缩进前缀字符串。
   *
   * @returns {string} 累积的缩进空格或制表符。
   */
  getIndent(): string {
    return this.indent.repeat(this.indentTypes.length)
  }

  /**
   * 增加顶级保留字的缩进层级。
   */
  increaseToplevel(): void {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL)
  }

  /**
   * 增加括号块的缩进层级。
   */
  increaseBlockLevel(): void {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL)
  }

  /**
   * 增加关键字块的缩进层级。
   */
  increaseKeywordBlock(): void {
    this.indentTypes.push(INDENT_TYPE_KEYWORD_BLOCK)
  }

  /**
   * 通过弹出最后一个顶级项来减少顶级缩进层级。
   */
  decreaseTopLevel(): void {
    if (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_TOP_LEVEL
    ) {
      this.indentTypes.pop()
    }
  }

  /**
   * 减少块级缩进。
   * 弹出所有尾部的顶级缩进，直到移除最近的块级缩进。
   */
  decreaseBlockLevel(): void {
    while (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_TOP_LEVEL
    ) {
      this.indentTypes.pop()
    }

    if (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_BLOCK_LEVEL
    ) {
      this.indentTypes.pop()
    }
  }

  /**
   * 只在栈顶确实是关键字块时减少缩进，避免污染括号层级。
   */
  decreaseKeywordBlock(): void {
    while (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_TOP_LEVEL
    ) {
      this.indentTypes.pop()
    }

    if (
      this.indentTypes[this.indentTypes.length - 1] ===
      INDENT_TYPE_KEYWORD_BLOCK
    ) {
      this.indentTypes.pop()
    }
  }

  isBlockLevel(): boolean {
    return (
      this.indentTypes[this.indentTypes.length - 1] === INDENT_TYPE_BLOCK_LEVEL
    )
  }
}
