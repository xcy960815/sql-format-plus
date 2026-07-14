<template>
  <div class="sql-playground">
    <div class="sql-playground__topbar">
      <div class="window-controls" aria-hidden="true">
        <i></i><i></i><i></i>
      </div>
      <div class="playground-title"><i></i> {{ text.playground }}</div>
      <div class="playground-options">
        <label>
          <span>{{ text.example }}</span>
          <select v-model="selectedExampleIndex" aria-label="Example query">
            <option
              v-for="(example, index) in queryExamples"
              :key="example.label"
              :value="index"
            >
              {{ isZh ? example.labelZh : example.label }}
            </option>
          </select>
        </label>

        <label>
          <span>{{ text.dialect }}</span>
          <select v-model="language" aria-label="SQL dialect">
            <option value="sql">{{ text.standardSql }}</option>
            <option value="n1ql">N1QL</option>
            <option value="db2">IBM DB2</option>
            <option value="pl/sql">Oracle PL/SQL</option>
          </select>
        </label>

        <label>
          <span>{{ text.indent }}</span>
          <select v-model="indent" aria-label="Indentation size">
            <option value="  ">{{ text.twoSpaces }}</option>
            <option value="    ">{{ text.fourSpaces }}</option>
            <option value="	">{{ text.tab }}</option>
          </select>
        </label>
      </div>
    </div>

    <div class="sql-playground__workspace">
      <section class="editor-pane input-pane" aria-label="SQL input">
        <div class="pane-heading">
          <div>
            <span class="file-type file-type--input">IN</span>
            <strong>{{ text.query }}</strong>
            <small>input.sql</small>
          </div>
          <button type="button" class="clear-button" @click="clearInput">
            {{ text.clear }}
          </button>
        </div>

        <div class="editor-body">
          <div ref="inputLineNumbers" class="line-numbers" aria-hidden="true">
            {{ inputLineNumbersText }}
          </div>
          <textarea
            ref="inputTextarea"
            v-model="inputValue"
            aria-label="SQL query to format"
            autocomplete="off"
            autocapitalize="off"
            :placeholder="text.inputPlaceholder"
            spellcheck="false"
            @scroll="syncInputScroll"
          ></textarea>
        </div>

        <div class="pane-footer">
          <span
            >{{ inputLineCount }}
            {{ inputLineCount === 1 ? text.line : text.lines }} ·
            {{ inputValue.length }} {{ text.chars }}</span
          >
          <span>{{ text.liveInput }}</span>
        </div>
      </section>

      <section
        class="editor-pane output-pane"
        aria-label="Formatted SQL output"
      >
        <div class="pane-heading">
          <div>
            <span class="file-type file-type--output">OUT</span>
            <strong>{{ text.formatted }}</strong>
            <small>output.sql</small>
          </div>
          <button
            type="button"
            class="copy-button"
            :class="{ copied: copyState === 'copied' }"
            :disabled="!formattedOutput"
            @click="copyFormattedSql"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="8" y="8" width="11" height="11" rx="2" />
              <path
                d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
              />
            </svg>
            {{ copyLabel }}
          </button>
        </div>

        <div class="editor-body output-body">
          <div
            ref="outputLineNumbersElement"
            class="line-numbers"
            aria-hidden="true"
          >
            {{ outputLineNumbers }}
          </div>
          <pre
            ref="outputPre"
            :class="{ 'has-error': formatError }"
            @scroll="syncOutputScroll"
          ><code v-if="formattedOutput"><template
                v-for="(token, index) in highlightedOutput"
                :key="`${index}-${token.value}`"
              ><span :class="token.className">{{ token.value }}</span></template></code><code v-else class="empty-output">{{ outputPlaceholder }}</code></pre>
        </div>

        <div
          class="pane-footer output-footer"
          :class="{ 'has-error': formatError }"
        >
          <span
            ><i></i
            >{{
              formatError ? text.formattingFailed : text.formattedSuccessfully
            }}</span
          >
          <span>{{ languageLabel }} · {{ text.runsLocally }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { format, type SqlDialect } from '../../../src/sql-format-plus'
import { queryExamples } from '../../../src/demoExamples'

type HighlightToken = {
  value: string
  className?: string
}

const MAX_SYNC_INPUT_LENGTH = 50000
const KEYWORDS = new Set([
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
])

const selectedExampleIndex = ref(0)
const language = ref<SqlDialect>(queryExamples[0].language)
const indent = ref('  ')
const inputValue = ref(queryExamples[0].query)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
const inputTextarea = ref<HTMLTextAreaElement>()
const inputLineNumbers = ref<HTMLElement>()
const outputPre = ref<HTMLElement>()
const outputLineNumbersElement = ref<HTMLElement>()
const { lang } = useData()
const isZh = computed(() => lang.value.toLowerCase().startsWith('zh'))
const text = computed(() =>
  isZh.value
    ? {
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
        inputPlaceholder: '在这里粘贴 SQL…',
        line: '行',
        lines: '行',
        chars: '字符',
        liveInput: '实时输入',
        formatted: '格式化结果',
        copy: '复制',
        copied: '已复制',
        copyFailed: '复制失败',
        formattingFailed: '格式化失败',
        formattedSuccessfully: '格式化成功',
        runsLocally: '本地运行',
        outputPlaceholder: '格式化结果将显示在这里…',
        inputTooLarge: `输入内容过长，无法实时格式化。字符限制为 ${MAX_SYNC_INPUT_LENGTH.toLocaleString()}。`,
        unknownError: '无法格式化此查询语句。',
      }
    : {
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
        inputPlaceholder: 'Paste your SQL here…',
        line: 'line',
        lines: 'lines',
        chars: 'chars',
        liveInput: 'Live input',
        formatted: 'Formatted',
        copy: 'Copy',
        copied: 'Copied',
        copyFailed: 'Copy failed',
        formattingFailed: 'Formatting failed',
        formattedSuccessfully: 'Formatted successfully',
        runsLocally: 'Runs locally',
        outputPlaceholder: 'Formatted SQL will appear here…',
        inputTooLarge: `Input is too large for live formatting. The limit is ${MAX_SYNC_INPUT_LENGTH.toLocaleString()} characters.`,
        unknownError: 'Unable to format this query.',
      },
)

watch(selectedExampleIndex, (index) => {
  const selectedExample = queryExamples[index]

  if (selectedExample) {
    inputValue.value = selectedExample.query
    language.value = selectedExample.language
  }
})

const formattedResult = computed(() => {
  if (inputValue.value.length > MAX_SYNC_INPUT_LENGTH) {
    return {
      output: '',
      error: text.value.inputTooLarge,
    }
  }

  if (!inputValue.value.trim()) return { output: '', error: '' }

  try {
    return {
      output: format(inputValue.value, {
        language: language.value,
        indent: indent.value,
      }),
      error: '',
    }
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : text.value.unknownError,
    }
  }
})

const formattedOutput = computed(() => formattedResult.value.output)
const formatError = computed(() => formattedResult.value.error)
const outputPlaceholder = computed(
  () => formatError.value || text.value.outputPlaceholder,
)
const inputLineCount = computed(() =>
  inputValue.value ? inputValue.value.split('\n').length : 0,
)
const inputLineNumbersText = computed(() =>
  Array.from(
    { length: Math.max(1, inputLineCount.value) },
    (_, index) => index + 1,
  ).join('\n'),
)
const outputLineNumbers = computed(() => {
  const lineCount = Math.max(1, formattedOutput.value.split('\n').length)
  return Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')
})
const languageLabel = computed(() => {
  if (language.value === 'sql') return text.value.standardSql

  return {
    n1ql: 'N1QL',
    db2: 'IBM DB2',
    'pl/sql': 'Oracle PL/SQL',
  }[language.value]
})
const copyLabel = computed(() => {
  if (copyState.value === 'copied') return text.value.copied
  if (copyState.value === 'failed') return text.value.copyFailed
  return text.value.copy
})

const highlightedOutput = computed<HighlightToken[]>(() => {
  const sql = formattedOutput.value
  const tokens: HighlightToken[] = []
  const pattern =
    /(\/\*[\s\S]*?\*\/|--[^\n]*|'(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\B[@:?$][\w$]+|\b\d+(?:\.\d+)?\b|<>|!=|<=|>=|:=|[-+*/%=<>]|\b[A-Za-z_][\w$]*\b)/g
  let lastIndex = 0
  let match = pattern.exec(sql)

  while (match) {
    const value = match[0]
    tokens.push({ value: sql.slice(lastIndex, match.index) })

    let className: string | undefined

    if (value.startsWith('--') || value.startsWith('/*'))
      className = 'token-comment'
    else if (/^['"`]/.test(value)) className = 'token-string'
    else if (/^\B[@:?$]/.test(value)) className = 'token-placeholder'
    else if (/^\d/.test(value)) className = 'token-number'
    else if (/^(?:<>|!=|<=|>=|:=|[-+*/%=<>])$/.test(value))
      className = 'token-operator'
    else if (KEYWORDS.has(value.toUpperCase())) className = 'token-keyword'

    tokens.push({ value, className })
    lastIndex = match.index + value.length
    match = pattern.exec(sql)
  }

  tokens.push({ value: sql.slice(lastIndex) })
  return tokens
})

const clearInput = (): void => {
  inputValue.value = ''
}

const syncInputScroll = (): void => {
  if (inputTextarea.value && inputLineNumbers.value)
    inputLineNumbers.value.scrollTop = inputTextarea.value.scrollTop
}

const syncOutputScroll = (): void => {
  if (outputPre.value && outputLineNumbersElement.value)
    outputLineNumbersElement.value.scrollTop = outputPre.value.scrollTop
}

const copyFormattedSql = async (): Promise<void> => {
  if (!formattedOutput.value) return

  try {
    await navigator.clipboard.writeText(formattedOutput.value)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }

  window.setTimeout(() => {
    copyState.value = 'idle'
  }, 1600)
}
</script>

<style scoped>
.sql-playground {
  --demo-bg: #0b0f14;
  --demo-surface: #10151c;
  --demo-line: #222b36;
  --demo-line-soft: #171e27;
  --demo-text: #d8dee5;
  --demo-muted: #65717e;
  --demo-green: #9af068;
  --demo-purple: #bca7ff;
  --demo-cyan: #70d7e6;
  --demo-yellow: #f0ce72;
  overflow: hidden;
  border: 1px solid var(--demo-line);
  border-radius: 16px;
  background: var(--demo-bg);
  box-shadow: 0 28px 70px rgb(0 0 0 / 22%);
}

.sql-playground button,
.sql-playground select,
.sql-playground textarea {
  font: inherit;
}

.sql-playground__topbar {
  display: grid;
  min-height: 68px;
  padding: 11px 14px 11px 18px;
  border-bottom: 1px solid var(--demo-line);
  grid-template-columns: 92px 1fr auto;
  align-items: center;
  background: var(--demo-surface);
}

.window-controls {
  display: flex;
  gap: 7px;
}

.window-controls i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #303944;
}

.window-controls i:first-child {
  background: #5d6875;
}

.playground-title {
  display: flex;
  gap: 9px;
  align-items: center;
  color: #b8c0c9;
  font-size: 12px;
  font-weight: 650;
}

.playground-title i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--demo-green);
  box-shadow: 0 0 10px rgb(154 240 104 / 65%);
}

.playground-options {
  display: flex;
  gap: 8px;
}

.playground-options label {
  display: flex;
  height: 40px;
  border: 1px solid #28323e;
  border-radius: 8px;
  align-items: center;
  background: #151b23;
  color: #64707d;
}

.playground-options label > span {
  padding-left: 11px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playground-options select {
  max-width: 178px;
  height: 100%;
  padding: 0 9px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #d6dce1;
  font-size: 11px;
  font-weight: 600;
}

.sql-playground__workspace {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
}

.editor-pane {
  display: grid;
  min-width: 0;
  min-height: 480px;
  grid-template-rows: 52px minmax(390px, 1fr) 34px;
}

.input-pane {
  border-right: 1px solid var(--demo-line);
  background: #0d1117;
}

.pane-heading {
  display: flex;
  padding: 0 15px;
  border-bottom: 1px solid var(--demo-line-soft);
  align-items: center;
  justify-content: space-between;
}

.pane-heading > div {
  display: flex;
  gap: 9px;
  align-items: center;
}

.pane-heading strong {
  color: #c8cfd6;
  font-size: 12px;
  font-weight: 650;
}

.pane-heading small {
  color: #56616e;
  font:
    9px/1 'SFMono-Regular',
    Consolas,
    monospace;
}

.file-type {
  display: inline-flex;
  width: 25px;
  height: 20px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  font:
    700 7px/1 'SFMono-Regular',
    Consolas,
    monospace;
  letter-spacing: 0.04em;
}

.file-type--input {
  background: rgb(188 167 255 / 11%);
  color: var(--demo-purple);
}

.file-type--output {
  background: rgb(154 240 104 / 10%);
  color: var(--demo-green);
}

.clear-button,
.copy-button {
  cursor: pointer;
}

.clear-button {
  padding: 6px 8px;
  border: 0;
  background: transparent;
  color: #798593;
  font-size: 11px;
  font-weight: 650;
}

.clear-button:hover {
  color: #d8dee4;
}

.copy-button {
  display: flex;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #293440;
  border-radius: 7px;
  align-items: center;
  background: #141b23;
  color: #798593;
  font-size: 11px;
  font-weight: 650;
}

.copy-button:hover:not(:disabled) {
  border-color: #3b4958;
  color: #e2e7eb;
}

.copy-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.copy-button.copied {
  border-color: rgb(154 240 104 / 32%);
  color: var(--demo-green);
}

.copy-button svg {
  width: 14px;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.editor-body {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-columns: 44px minmax(0, 1fr);
}

.line-numbers {
  padding-top: 18px;
  overflow: hidden;
  border-right: 1px solid #151b22;
  color: #3f4955;
  background: rgb(8 11 15 / 30%);
  font:
    12px/1.75 'SFMono-Regular',
    Consolas,
    monospace;
  text-align: center;
  white-space: pre;
  user-select: none;
}

.sql-playground textarea,
.sql-playground pre {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 18px 21px;
  overflow: auto;
  border: 0;
  border-radius: 0;
  outline: 0;
  background: transparent;
  color: var(--demo-text);
  font:
    12px/1.75 'SFMono-Regular',
    Consolas,
    'Liberation Mono',
    monospace;
  font-variant-ligatures: none;
  tab-size: 2;
}

.sql-playground textarea {
  resize: none;
  caret-color: var(--demo-green);
}

.sql-playground textarea::placeholder,
.empty-output {
  color: #45505c;
}

.sql-playground pre {
  white-space: pre;
}

.sql-playground pre code {
  font: inherit;
}

.sql-playground pre.has-error,
.sql-playground pre.has-error .empty-output {
  color: #ff8f88;
}

.token-keyword {
  color: var(--demo-purple);
  font-weight: 600;
}

.token-string {
  color: var(--demo-green);
}

.token-number {
  color: var(--demo-yellow);
}

.token-comment {
  color: #596775;
  font-style: italic;
}

.token-placeholder {
  color: var(--demo-cyan);
}

.token-operator {
  color: #8ea0b2;
}

.pane-footer {
  display: flex;
  padding: 0 14px;
  border-top: 1px solid var(--demo-line-soft);
  align-items: center;
  justify-content: space-between;
  color: #4e5a67;
  background: #0c1015;
  font:
    9px/1 'SFMono-Regular',
    Consolas,
    monospace;
}

.output-footer > span:first-child {
  display: flex;
  gap: 7px;
  align-items: center;
  color: #61705f;
}

.output-footer i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #73dc41;
  box-shadow: 0 0 7px rgb(115 220 65 / 50%);
}

.output-footer.has-error > span:first-child {
  color: #a85f5a;
}

.output-footer.has-error i {
  background: #ff756d;
}

@media (max-width: 900px) {
  .sql-playground__topbar {
    grid-template-columns: 64px 1fr;
  }

  .playground-title {
    display: none;
  }

  .playground-options {
    justify-content: flex-end;
  }

  .playground-options label > span {
    display: none;
  }
}

@media (max-width: 700px) {
  .sql-playground__topbar {
    display: block;
    padding: 12px;
  }

  .window-controls {
    display: none;
  }

  .playground-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .playground-options label:first-child {
    grid-column: 1 / -1;
  }

  .playground-options select {
    width: 100%;
    max-width: none;
  }

  .sql-playground__workspace {
    grid-template-columns: 1fr;
  }

  .editor-pane {
    min-height: 370px;
    grid-template-rows: 48px minmax(290px, 1fr) 32px;
  }

  .input-pane {
    border-right: 0;
    border-bottom: 1px solid var(--demo-line);
  }
}
</style>
