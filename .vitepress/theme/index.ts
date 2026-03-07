import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import PageHeader from './components/PageHeader.vue'
import StepCarousel from './components/StepCarousel.vue'
import HomeContent from './components/HomeContent.vue'
import LandingHome from './components/LandingHome.vue'
import NavBarTitle from './components/NavBarTitle.vue'
import NavBarCta from './components/NavBarCta.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PageHeader),
      'nav-bar-title-after': () => h(NavBarTitle),
      'nav-bar-content-after': () => h(NavBarCta),
    })
  },
  enhanceApp({ app }) {
    app.component('StepCarousel', StepCarousel)
    app.component('HomeContent', HomeContent)
    app.component('LandingHome', LandingHome)
  },
} satisfies Theme
