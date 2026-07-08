/**
 * 支持格式化的 SQL 方言选项。
 */
export type SqlDialect = 'sql' | 'n1ql' | 'db2' | 'pl/sql'

/**
 * 占位符替换值的有效类型。
 */
export type ParamValue = string | number | boolean | null

/**
 * 格式化参数的表示形式。对于索引占位符，可以是一个数组；
 * 对于命名占位符，可以是一个将键名映射到值的对象。
 */
export type ParamsMap = Record<string, ParamValue> | ParamValue[]

/**
 * SQL 格式化器的配置选项。
 */
export interface FormatOptions {
  /**
   * 要格式化的 SQL 方言。默认为 'sql' (标准 SQL)。
   */
  language?: SqlDialect

  /**
   * 用于缩进的字符串，例如 '  ' 或 '\t'。默认为 '  '。
   */
  indent?: string

  /**
   * 用于替换查询中占位符参数的值。
   */
  params?: ParamsMap
}

/**
 * 支持的 SQL 字符串字面量引号/括号类型。
 */
export type StringType = '""' | "''" | '``' | '[]' | "N''"
