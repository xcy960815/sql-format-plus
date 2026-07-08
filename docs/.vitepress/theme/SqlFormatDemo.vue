<template>
  <div class="sql-format-demo">
    <div class="sql-format-demo__toolbar">
      <label>
        <span>Example</span>
        <select v-model="selectedExampleIndex">
          <option
            v-for="(example, index) in queryExamples"
            :key="example.label"
            :value="index"
          >
            {{ example.label }}
          </option>
        </select>
      </label>

      <label>
        <span>Language</span>
        <select v-model="language">
          <option value="sql">SQL</option>
          <option value="n1ql">N1QL</option>
          <option value="db2">DB2</option>
          <option value="pl/sql">PL/SQL</option>
        </select>
      </label>

      <label>
        <span>Indent</span>
        <select v-model="indent">
          <option value="  ">2 spaces</option>
          <option value="    ">4 spaces</option>
          <option value="	">Tab</option>
        </select>
      </label>
    </div>

    <div class="sql-format-demo__workspace">
      <label class="sql-format-demo__pane">
        <span>Input</span>
        <textarea v-model="inputValue" spellcheck="false" />
      </label>

      <div class="sql-format-demo__pane">
        <span>Formatted</span>
        <pre>{{ formattedOutput }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { format, type SqlDialect } from '../../../src/sql-format-plus'
import { queryExamples } from '../../../src/demoExamples'

const MAX_SYNC_INPUT_LENGTH = 50000

const selectedExampleIndex = ref(0)
const language = ref<SqlDialect>(queryExamples[0].language)
const indent = ref('  ')
const inputValue = ref(queryExamples[0].query)

watch(selectedExampleIndex, (index) => {
  const selectedExample = queryExamples[index]

  if (selectedExample) {
    inputValue.value = selectedExample.query
    language.value = selectedExample.language
  }
})

const formattedOutput = computed(() => {
  if (inputValue.value.length > MAX_SYNC_INPUT_LENGTH) {
    return 'Input is too large for live formatting. Shorten the SQL or format it through the library API.'
  }

  return format(inputValue.value, {
    language: language.value,
    indent: indent.value,
  })
})
</script>

<style scoped>
.sql-format-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.sql-format-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.sql-format-demo__toolbar label,
.sql-format-demo__pane {
  display: grid;
  gap: 6px;
}

.sql-format-demo__toolbar label {
  min-width: 150px;
}

.sql-format-demo__toolbar label:first-child {
  min-width: min(280px, 100%);
}

.sql-format-demo span {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.sql-format-demo select,
.sql-format-demo textarea,
.sql-format-demo pre {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  box-sizing: border-box;
  font: inherit;
}

.sql-format-demo select {
  min-height: 36px;
  padding: 6px 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.sql-format-demo__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0;
}

.sql-format-demo__pane {
  min-width: 0;
  padding: 16px;
}

.sql-format-demo__pane:first-child {
  border-right: 1px solid var(--vp-c-divider);
}

.sql-format-demo textarea,
.sql-format-demo pre {
  min-height: 420px;
  margin: 0;
  padding: 14px;
  overflow: auto;
  font:
    13px/1.55 'SFMono-Regular',
    Consolas,
    'Liberation Mono',
    monospace;
}

.sql-format-demo textarea {
  resize: vertical;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.sql-format-demo pre {
  white-space: pre;
  background: #101828;
  color: #e7edf7;
}

@media (max-width: 820px) {
  .sql-format-demo__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .sql-format-demo__pane:first-child {
    border-right: 0;
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
