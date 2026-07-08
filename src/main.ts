import sqlFormatter from './sql-format-plus'
import type { SqlDialect } from './sql-format-plus'
import { queryExamples, type QueryExample } from './demoExamples'

const input = document.querySelector<HTMLTextAreaElement>('#sql-input')
const output = document.querySelector<HTMLElement>('#sql-output')
const language = document.querySelector<HTMLSelectElement>('#sql-language')
const indent = document.querySelector<HTMLSelectElement>('#sql-indent')
const example = document.querySelector<HTMLSelectElement>('#sql-example')

const MAX_SYNC_INPUT_LENGTH = 50000

const debounce = (fn: () => void, delay: number): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined

  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
  }
}

const syncExample = (selectedExample: QueryExample): void => {
  if (!input || !language) {
    return
  }

  input.value = selectedExample.query
  language.value = selectedExample.language
}

const render = (): void => {
  if (!input || !output || !language || !indent) {
    return
  }

  if (input.value.length > MAX_SYNC_INPUT_LENGTH) {
    output.textContent =
      'Input is too large for live formatting. Shorten the SQL or format it through the library API.'
    return
  }

  output.textContent = sqlFormatter.format(input.value, {
    language: language.value as SqlDialect,
    indent: indent.value,
  })
}

const debouncedRender = debounce(render, 200)

input?.addEventListener('input', debouncedRender)
language?.addEventListener('change', render)
indent?.addEventListener('change', render)
example?.addEventListener('change', () => {
  const selectedExample = queryExamples[Number(example.value)]

  if (selectedExample) {
    syncExample(selectedExample)
    render()
  }
})

syncExample(queryExamples[0])
render()
