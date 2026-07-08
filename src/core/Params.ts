import type { ParamsMap, ParamValue } from '../types'
import type { Token } from './Tokenizer'

export default class Params {
  private readonly params?: ParamsMap

  private index = 0

  constructor(params?: ParamsMap) {
    this.params = params
  }

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
