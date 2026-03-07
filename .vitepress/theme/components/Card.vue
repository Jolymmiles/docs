<script setup lang="ts">
const props = defineProps<{
  title: string
  icon?: string
  href?: string
}>()
</script>

<template>
  <div class="custom-card">
    <component :is="href ? 'a' : 'div'" :href="href">
      <div class="card-title">{{ title }}</div>
      <div class="card-description">
        <slot />
      </div>
    </component>
  </div>
</template>
