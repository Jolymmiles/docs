<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page, theme } = useData()

const title = computed(() => frontmatter.value.title)
const description = computed(() => frontmatter.value.description)

const sectionName = computed(() => {
  const sidebar = theme.value.sidebar
  if (!sidebar) return null
  const path = page.value.relativePath.replace(/\.md$/, '')
  const link = '/' + path

  for (const key of Object.keys(sidebar)) {
    const groups = sidebar[key]
    if (!Array.isArray(groups)) continue
    for (const group of groups) {
      if (!group.items) continue
      for (const item of group.items) {
        if (item.link === link) return group.text
      }
    }
  }
  return null
})
</script>

<template>
  <div class="page-header" v-if="title">
    <span class="page-section" v-if="sectionName">{{ sectionName }}</span>
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-description" v-if="description">{{ description }}</p>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-section {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.02em;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-description {
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
