import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import PageHeader from './components/PageHeader.vue'
import StepCarousel from './components/StepCarousel.vue'
import HomeContent from './components/HomeContent.vue'
import LandingHome from './components/LandingHome.vue'
import NavBarTitle from './components/NavBarTitle.vue'
import NavBarCta from './components/NavBarCta.vue'
import Tabs from './components/Tabs.vue'
import TabPanel from './components/TabPanel.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PageHeader),
      'nav-bar-title-after': () => h(NavBarTitle),
      'nav-bar-content-after': () => h(NavBarCta),
      'nav-screen-content-after': () => h('a', {
        href: 'https://me.remnawavebot.dev/',
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'nav-screen-cta',
      }, 'Личный кабинет ›'),
    })
  },
  enhanceApp({ app }) {
    app.component('StepCarousel', StepCarousel)
    app.component('HomeContent', HomeContent)
    app.component('LandingHome', LandingHome)
    app.component('Tabs', Tabs)
    app.component('TabPanel', TabPanel)
  },
} satisfies Theme
