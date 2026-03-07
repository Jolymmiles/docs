<script setup lang="ts">
const props = defineProps<{
  title: string
  step?: number
}>()
</script>

<template>
  <div class="step-item" :data-step="step ?? ''">
    <div class="step-title">{{ title }}</div>
    <slot />
  </div>
</template>
