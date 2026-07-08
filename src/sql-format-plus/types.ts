export type SqlDialect = 'sql' | 'n1ql' | 'db2' | 'pl/sql'

export type ParamValue = string | number | boolean | null

export type ParamsMap = Record<string, ParamValue> | ParamValue[]

export interface FormatOptions {
  language?: SqlDialect
  indent?: string
  params?: ParamsMap
}

export type StringType = '""' | "''" | '``' | '[]' | "N''"
