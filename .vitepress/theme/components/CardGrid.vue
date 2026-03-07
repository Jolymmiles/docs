<script setup lang="ts">
const props = withDefaults(defineProps<{ cols?: number }>(), { cols: 2 })
</script>

<template>
  <div class="card-grid" :data-cols="cols">
    <slot />
  </div>
</template>
