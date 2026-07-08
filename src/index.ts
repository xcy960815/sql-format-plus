import Db2Formatter from './languages/Db2Formatter'
import N1qlFormatter from './languages/N1qlFormatter'
import PlSqlFormatter from './languages/PlSqlFormatter'
import StandardSqlFormatter from './languages/StandardSqlFormatter'
import type { FormatOptions } from './types'

export type { FormatOptions, ParamValue, ParamsMap, SqlDialect } from './types'

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

const sqlFormatter = {
  format,
}

export default sqlFormatter
