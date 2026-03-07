<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'info' | 'warning' | 'tip'
}>(), { type: 'info' })

const icons: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  tip: '💡',
}
</script>

<template>
  <div class="callout" :class="`callout-${type}`">
    <slot />
  </div>
</template>

<style scoped>
.callout {
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border-left: 4px solid;
}
.callout-info {
  border-color: var(--vp-c-brand-1);
  background: rgba(11, 137, 248, 0.08);
}
.callout-warning {
  border-color: #e2b340;
  background: rgba(226, 179, 64, 0.08);
}
.callout-tip {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}
</style>
