import sqlFormatter from './index'
import type { SqlDialect } from './types'

const input = document.querySelector<HTMLTextAreaElement>('#sql-input')
const output = document.querySelector<HTMLElement>('#sql-output')
const language = document.querySelector<HTMLSelectElement>('#sql-language')
const indent = document.querySelector<HTMLSelectElement>('#sql-indent')

const render = (): void => {
  if (!input || !output || !language || !indent) {
    return
  }

  output.textContent = sqlFormatter.format(input.value, {
    language: language.value as SqlDialect,
    indent: indent.value,
  })
}

input?.addEventListener('input', render)
language?.addEventListener('change', render)
indent?.addEventListener('change', render)

render()
