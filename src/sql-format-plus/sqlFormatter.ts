/**
 * 用于 sql-format-plus 公共 API 的兼容性重新导出。
 * 提供默认的格式化器对象、命名的 format 函数以及选项类型。
 */

export { default, format } from './index'
export type { FormatOptions, ParamValue, ParamsMap, SqlDialect } from './index'
