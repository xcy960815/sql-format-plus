const fs = require('fs')
const path = require('path')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')
const typescript = require('@rollup/plugin-typescript')
const { dts } = require('rollup-plugin-dts')
const terser = require('@rollup/plugin-terser')

const input = path.resolve(__dirname, 'src/sql-format-plus/index.ts')
const distDir = path.resolve(__dirname, 'dist')
const typesDir = path.resolve(__dirname, 'types')

fs.rmSync(distDir, { recursive: true, force: true })
fs.rmSync(typesDir, { recursive: true, force: true })
fs.mkdirSync(distDir, { recursive: true })
fs.mkdirSync(typesDir, { recursive: true })

module.exports = [
  {
    input,
    output: [
      {
        file: path.join(distDir, 'sql-format-plus.es.js'),
        format: 'es',
        exports: 'named',
      },
      {
        file: path.join(distDir, 'sql-format-plus.umd.js'),
        format: 'umd',
        name: 'SqlFormatPlus',
        exports: 'named',
      },
      {
        file: path.join(distDir, 'sql-format-plus.umd.min.js'),
        format: 'umd',
        name: 'SqlFormatPlus',
        exports: 'named',
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve.nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts'],
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.rollup.json',
      }),
    ],
  },
  {
    input,
    output: [
      {
        file: path.join(typesDir, 'sql-format-plus.d.ts'),
        format: 'es',
      },
    ],
    plugins: [
      dts({
        tsconfig: './tsconfig.rollup.json',
      }),
    ],
  },
]
