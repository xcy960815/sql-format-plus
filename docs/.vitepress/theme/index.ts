import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import SqlFormatDemo from './SqlFormatDemo.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SqlFormatDemo', SqlFormatDemo)
  },
} satisfies Theme
