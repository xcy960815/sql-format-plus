import Db2Formatter from './languages/Db2Formatter'
import N1qlFormatter from './languages/N1qlFormatter'
import PlSqlFormatter from './languages/PlSqlFormatter'
import StandardSqlFormatter from './languages/StandardSqlFormatter'
import type { FormatOptions } from './types'

export type { FormatOptions, ParamValue, ParamsMap, SqlDialect } from './types'

/**
 * 格式化 SQL 查询字符串以提高其可读性。
 *
 * 根据提供的配置选项，分发给标准 SQL 或特定方言的格式化器（db2、n1ql、pl/sql）。
 *
 * @param {string} query 要格式化的 SQL 查询字符串。
 * @param {FormatOptions} [cfg={}] 格式化配置选项。
 * @returns {string} 格式化后的 SQL 查询。
 * @throws {Error} 如果配置中指定了不支持的 SQL 方言，则抛出错误。
 */
export function format(query: string, cfg: FormatOptions = {}): string {
  switch (cfg.language) {
    case 'db2':
      return new Db2Formatter(cfg).format(query)
    case 'n1ql':
      return new N1qlFormatter(cfg).format(query)
    case 'pl/sql':
      return new PlSqlFormatter(cfg).format(query)
    case 'sql':
    case undefined:
      return new StandardSqlFormatter(cfg).format(query)
    default:
      throw Error(`Unsupported SQL dialect: ${String(cfg.language)}`)
  }
}

/**
 * 默认导出，提供 SQL 格式化函数。
 */
const sqlFormatter = {
  format,
}

export default sqlFormatter
