import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import PageHeader from './components/PageHeader.vue'
import StepCarousel from './components/StepCarousel.vue'
import HomeContent from './components/HomeContent.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PageHeader),
    })
  },
  enhanceApp({ app }) {
    app.component('StepCarousel', StepCarousel)
    app.component('HomeContent', HomeContent)
  },
} satisfies Theme
