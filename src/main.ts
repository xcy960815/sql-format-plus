import sqlFormatter from './sql-format-plus'
import type { SqlDialect } from './sql-format-plus'
import { queryExamples, type QueryExample } from './demoExamples'
import './style.css'

const input = document.querySelector<HTMLTextAreaElement>('#sql-input')
const output = document.querySelector<HTMLElement>('#sql-output code')
const outputContainer = document.querySelector<HTMLElement>('#sql-output')
const inputLines = document.querySelector<HTMLElement>('#input-lines')
const outputLines = document.querySelector<HTMLElement>('#output-lines')
const language = document.querySelector<HTMLSelectElement>('#sql-language')
const indent = document.querySelector<HTMLSelectElement>('#sql-indent')
const example = document.querySelector<HTMLSelectElement>('#sql-example')
const inputStats = document.querySelector<HTMLElement>('#input-stats')
const formatStatus = document.querySelector<HTMLElement>('#format-status')
const formatTime = document.querySelector<HTMLElement>('#format-time')
const statusBar = document.querySelector<HTMLElement>('.output-status')
const copyOutput = document.querySelector<HTMLButtonElement>('#copy-output')
const clearInput = document.querySelector<HTMLButtonElement>('#clear-input')
const installCopy = document.querySelector<HTMLButtonElement>('.install-copy')
const uiLocale = document.querySelector<HTMLSelectElement>('#ui-locale')

type Locale = 'en' | 'zh'

const translations: Record<Locale, Record<string, string>> = {
  en: {
    pageTitle: 'Playground · SQL Format Plus',
    documentation: 'Documentation',
    eyebrow: 'Open source SQL formatter',
    heroTitle: 'Untangle your SQL.',
    heroTitleMuted: 'Keep your flow.',
    heroDescription:
      'A fast, focused formatter for SQL, N1QL, DB2, and PL/SQL — running entirely in your browser.',
    installLabel: 'Install with npm',
    playground: 'Playground',
    example: 'Example',
    dialect: 'Dialect',
    indent: 'Indent',
    standardSql: 'Standard SQL',
    twoSpaces: '2 spaces',
    fourSpaces: '4 spaces',
    tab: 'Tab',
    query: 'Query',
    clear: 'Clear',
    shortcut: '⌘ Enter to format',
    formatted: 'Formatted',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    ready: 'Ready',
    formattedSuccessfully: 'Formatted successfully',
    formattingFailed: 'Formatting failed',
    liveFormatting: 'Live formatting',
    checkDialect: 'Check the selected dialect',
    inputLimitExceeded: 'Input limit exceeded',
    outputPlaceholder: 'Formatted SQL will appear here…',
    inputTooLarge:
      'Input is too large for live formatting. Shorten the SQL or format it through the library API.',
    unknownError: 'Unable to format this query.',
    line: 'line',
    lines: 'lines',
    chars: 'chars',
    limit: 'Limit',
    footerMessage: 'Made for people who care about readable queries.',
    mitLicensed: 'MIT licensed',
    zeroDependencies: 'Zero dependencies',
    runsLocally: 'Runs locally',
    interfaceLanguage: 'Interface language',
    sqlDialect: 'SQL dialect',
    indentationSize: 'Indentation size',
    exampleQuery: 'Example query',
    inputAria: 'SQL query to format',
    outputAria: 'Formatted SQL output',
    installCopyAria: 'Copy install command',
    installCopiedAria: 'Install command copied',
    copyOutputAria: 'Copy formatted SQL',
  },
  zh: {
    pageTitle: '在线演示 · SQL Format Plus',
    documentation: '文档',
    eyebrow: '开源 SQL 格式化工具',
    heroTitle: '理清复杂 SQL。',
    heroTitleMuted: '保持专注与流畅。',
    heroDescription:
      '快速、专注地格式化 SQL、N1QL、DB2 与 PL/SQL，所有处理都在浏览器本地完成。',
    installLabel: '使用 npm 安装',
    playground: '在线演示',
    example: '示例',
    dialect: '方言',
    indent: '缩进',
    standardSql: '标准 SQL',
    twoSpaces: '2 个空格',
    fourSpaces: '4 个空格',
    tab: '制表符',
    query: '查询语句',
    clear: '清空',
    shortcut: '⌘ Enter 立即格式化',
    formatted: '格式化结果',
    copy: '复制',
    copied: '已复制',
    copyFailed: '复制失败',
    ready: '就绪',
    formattedSuccessfully: '格式化成功',
    formattingFailed: '格式化失败',
    liveFormatting: '实时格式化',
    checkDialect: '请检查所选 SQL 方言',
    inputLimitExceeded: '输入内容超出限制',
    outputPlaceholder: '格式化结果将显示在这里…',
    inputTooLarge:
      '输入内容过长，无法实时格式化。请缩短 SQL，或通过库 API 进行处理。',
    unknownError: '无法格式化此查询语句。',
    line: '行',
    lines: '行',
    chars: '字符',
    limit: '限制',
    footerMessage: '为每一位重视查询可读性的开发者而做。',
    mitLicensed: 'MIT 许可证',
    zeroDependencies: '零依赖',
    runsLocally: '本地运行',
    interfaceLanguage: '界面语言',
    sqlDialect: 'SQL 方言',
    indentationSize: '缩进大小',
    exampleQuery: '示例查询',
    inputAria: '要格式化的 SQL 查询',
    outputAria: '格式化后的 SQL',
    installCopyAria: '复制安装命令',
    installCopiedAria: '安装命令已复制',
    copyOutputAria: '复制格式化后的 SQL',
  },
}

const MAX_SYNC_INPUT_LENGTH = 50000
const KEYWORDS = new Set(
  [
    'ADD',
    'ALL',
    'ALTER',
    'AND',
    'ANY',
    'AS',
    'ASC',
    'BEGIN',
    'BETWEEN',
    'BY',
    'CASE',
    'COMMIT',
    'CONNECT',
    'CREATE',
    'CROSS',
    'DELETE',
    'DESC',
    'DISTINCT',
    'DROP',
    'ELSE',
    'END',
    'EXCEPT',
    'EXISTS',
    'FETCH',
    'FIRST',
    'FOR',
    'FROM',
    'FULL',
    'GROUP',
    'HAVING',
    'IN',
    'INNER',
    'INSERT',
    'INTERSECT',
    'INTO',
    'IS',
    'JOIN',
    'LEFT',
    'LIKE',
    'LIMIT',
    'LOOP',
    'MERGE',
    'NOT',
    'NULL',
    'OFFSET',
    'ON',
    'OR',
    'ORDER',
    'OUTER',
    'OVER',
    'PARTITION',
    'RIGHT',
    'ROW',
    'ROWS',
    'SELECT',
    'SET',
    'THEN',
    'UNION',
    'UNNEST',
    'UPDATE',
    'USING',
    'VALUES',
    'WHEN',
    'WHERE',
    'WITH',
  ].map((keyword) => keyword.toUpperCase()),
)

let formattedSql = ''
let copyTimer: ReturnType<typeof setTimeout> | undefined
let currentLocale: Locale = 'en'

const t = (key: string): string => translations[currentLocale][key] ?? key

const detectLocale = (): Locale => {
  try {
    const savedLocale = localStorage.getItem('sql-format-plus-locale')
    if (savedLocale === 'en' || savedLocale === 'zh') return savedLocale
  } catch {
    // Local storage can be unavailable in privacy-focused browser modes.
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const debounce = (fn: () => void, delay: number): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | undefined

  return () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
  }
}

const populateExamples = (): void => {
  if (!example) return

  const selectedValue = example.value || '0'
  example.replaceChildren()

  queryExamples.forEach((item, index) => {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = currentLocale === 'zh' ? item.labelZh : item.label
    example.append(option)
  })

  example.value = selectedValue
}

const applyLocale = (locale: Locale): void => {
  currentLocale = locale
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  document.title = t('pageTitle')
  if (uiLocale) uiLocale.value = locale

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n
    if (key) element.textContent = t(key)
  })

  populateExamples()
  updateInputStats()

  example?.setAttribute('aria-label', t('exampleQuery'))
  language?.setAttribute('aria-label', t('sqlDialect'))
  indent?.setAttribute('aria-label', t('indentationSize'))
  uiLocale?.setAttribute('aria-label', t('interfaceLanguage'))
  input?.setAttribute('aria-label', t('inputAria'))
  outputContainer?.setAttribute('aria-label', t('outputAria'))
  copyOutput?.setAttribute('aria-label', t('copyOutputAria'))
  installCopy?.setAttribute('aria-label', t('installCopyAria'))
}

const syncExample = (selectedExample: QueryExample): void => {
  if (!input || !language) return

  input.value = selectedExample.query
  input.scrollTop = 0
  language.value = selectedExample.language
  updateInputStats()
}

const updateInputStats = (): void => {
  if (!input || !inputStats) return

  const lineCount = input.value ? input.value.split('\n').length : 0
  inputStats.textContent = `${lineCount} ${t(lineCount === 1 ? 'line' : 'lines')} · ${input.value.length} ${t('chars')}`
  if (inputLines) {
    inputLines.textContent = Array.from(
      { length: Math.max(1, lineCount) },
      (_, index) => index + 1,
    ).join('\n')
  }
}

const appendToken = (value: string, className?: string): void => {
  if (!output) return

  if (!className) {
    output.append(document.createTextNode(value))
    return
  }

  const token = document.createElement('span')
  token.className = className
  token.textContent = value
  output.append(token)
}

const highlightSql = (sql: string): void => {
  if (!output) return

  output.replaceChildren()
  output.className = ''

  if (!sql) {
    output.className = 'output-empty'
    output.textContent = t('outputPlaceholder')
    return
  }

  const tokenPattern =
    /(\/\*[\s\S]*?\*\/|--[^\n]*|'(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\B[@:?$][\w$]+|\b\d+(?:\.\d+)?\b|<>|!=|<=|>=|:=|[-+*/%=<>]|\b[A-Za-z_][\w$]*\b)/g
  let lastIndex = 0
  let match = tokenPattern.exec(sql)

  while (match) {
    const index = match.index
    const value = match[0]

    appendToken(sql.slice(lastIndex, index))

    if (value.startsWith('--') || value.startsWith('/*')) {
      appendToken(value, 'token-comment')
    } else if (/^['"`]/.test(value)) {
      appendToken(value, 'token-string')
    } else if (/^\B[@:?$]/.test(value)) {
      appendToken(value, 'token-placeholder')
    } else if (/^\d/.test(value)) {
      appendToken(value, 'token-number')
    } else if (/^(?:<>|!=|<=|>=|:=|[-+*/%=<>])$/.test(value)) {
      appendToken(value, 'token-operator')
    } else if (KEYWORDS.has(value.toUpperCase())) {
      appendToken(value, 'token-keyword')
    } else {
      appendToken(value)
    }

    lastIndex = index + value.length
    match = tokenPattern.exec(sql)
  }

  appendToken(sql.slice(lastIndex))
}

const updateOutputLines = (sql: string): void => {
  if (!outputLines) return

  const lineCount = Math.max(1, sql.split('\n').length)
  outputLines.textContent = Array.from(
    { length: lineCount },
    (_, index) => index + 1,
  ).join('\n')
}

const setStatus = (message: string, hasError = false): void => {
  if (formatStatus) formatStatus.textContent = message
  statusBar?.classList.toggle('has-error', hasError)
}

const render = (): void => {
  if (!input || !output || !language || !indent) return

  updateInputStats()

  if (input.value.length > MAX_SYNC_INPUT_LENGTH) {
    formattedSql = ''
    if (copyOutput) copyOutput.disabled = true
    output.className = 'output-error'
    output.textContent = t('inputTooLarge')
    updateOutputLines('')
    setStatus(t('inputLimitExceeded'), true)
    if (formatTime)
      formatTime.textContent = `${t('limit')}: ${MAX_SYNC_INPUT_LENGTH.toLocaleString()} ${t('chars')}`
    return
  }

  const startedAt = performance.now()

  try {
    formattedSql = sqlFormatter.format(input.value, {
      language: language.value as SqlDialect,
      indent: indent.value,
    })
    if (copyOutput) copyOutput.disabled = !formattedSql

    highlightSql(formattedSql)
    updateOutputLines(formattedSql)
    setStatus(input.value ? t('formattedSuccessfully') : t('ready'))
    const elapsed = Math.max(0.1, performance.now() - startedAt)
    if (formatTime)
      formatTime.textContent = `${elapsed.toFixed(1)} ms · ${t('liveFormatting')}`
  } catch (error) {
    formattedSql = ''
    if (copyOutput) copyOutput.disabled = true
    output.replaceChildren()
    output.className = 'output-error'
    output.textContent =
      error instanceof Error ? error.message : t('unknownError')
    updateOutputLines('')
    setStatus(t('formattingFailed'), true)
    if (formatTime) formatTime.textContent = t('checkDialect')
  }
}

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const showCopyFeedback = (
  button: HTMLButtonElement,
  label: string,
  copied: boolean,
): void => {
  const text = button.querySelector('span')

  button.classList.toggle('copied', copied)
  if (text) text.textContent = label
  button.setAttribute('aria-label', label)

  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    button.classList.remove('copied')
    if (text) text.textContent = t('copy')
    button.setAttribute('aria-label', t('copyOutputAria'))
  }, 1600)
}

const debouncedRender = debounce(render, 180)

input?.addEventListener('input', () => {
  updateInputStats()
  debouncedRender()
})

input?.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    render()
  }
})

language?.addEventListener('change', render)
indent?.addEventListener('change', render)
example?.addEventListener('change', () => {
  const selectedExample = queryExamples[Number(example.value)]

  if (selectedExample) {
    syncExample(selectedExample)
    render()
  }
})

clearInput?.addEventListener('click', () => {
  if (!input) return

  input.value = ''
  input.focus()
  render()
})

copyOutput?.addEventListener('click', async () => {
  if (!formattedSql || !copyOutput) return

  const copied = await copyText(formattedSql)
  showCopyFeedback(copyOutput, copied ? t('copied') : t('copyFailed'), copied)
})

installCopy?.addEventListener('click', async () => {
  if (!installCopy) return

  const copied = await copyText('npm i sql-format-plus')
  installCopy.style.color = copied ? 'var(--accent)' : '#ff8f88'
  installCopy.setAttribute(
    'aria-label',
    copied ? t('installCopiedAria') : t('copyFailed'),
  )

  setTimeout(() => {
    installCopy.style.color = ''
    installCopy.setAttribute('aria-label', t('installCopyAria'))
  }, 1600)
})

outputContainer?.addEventListener('scroll', () => {
  if (outputLines && outputContainer)
    outputLines.scrollTop = outputContainer.scrollTop
})

input?.addEventListener('scroll', () => {
  if (inputLines) inputLines.scrollTop = input.scrollTop
})

uiLocale?.addEventListener('change', () => {
  const locale = uiLocale.value === 'zh' ? 'zh' : 'en'
  applyLocale(locale)

  try {
    localStorage.setItem('sql-format-plus-locale', locale)
  } catch {
    // The selected language still applies for the current session.
  }

  render()
})

applyLocale(detectLocale())
syncExample(queryExamples[0])
render()
