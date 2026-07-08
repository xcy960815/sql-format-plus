import type { ParamsMap, ParamValue } from '../types'
import type { Token } from './Tokenizer'

/**
 * 处理 SQL 查询字符串中占位符与参数值的替换。
 */
export default class Params {
  private readonly params?: ParamsMap

  private index = 0

  /**
   * 初始化参数管理器。
   *
   * @param {ParamsMap} [params] 可选的参数映射（数组或键值对对象）。
   */
  constructor(params?: ParamsMap) {
    this.params = params
  }

  /**
   * 获取与给定 Token 对应的参数值。
   *
   * 如果未提供 `params`，则返回原始 Token 值。
   * 对于索引占位符，返回顺序参数或解析索引处的参数值。
   * 对于命名占位符，返回与解析名称匹配的参数值。
   *
   * @param {Token} token 占位符 Token。
   * @returns {string} 字符串形式的参数值或原始占位符。
   */
  get({ key, value }: Token): string {
    if (!this.params) {
      return value
    }

    let param: ParamValue | undefined

    if (Array.isArray(this.params)) {
      param = key ? this.params[Number(key)] : this.params[this.index++]
    } else if (key) {
      param = this.params[key]
    } else {
      param = this.params[this.index++]
    }

    return param === undefined ? value : String(param)
  }
}
