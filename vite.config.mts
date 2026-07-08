import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SqlFormatPlus',
      formats: ['es', 'umd'],
      fileName: (format: string) => {
        if (format === 'es') return 'sql-format-plus.es.js'
        return 'sql-format-plus.umd.js'
      },
    },
  },
})
