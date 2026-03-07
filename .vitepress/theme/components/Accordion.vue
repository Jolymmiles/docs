<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ title: string }>()
const isOpen = ref(false)
</script>

<template>
  <div class="accordion-item">
    <button class="accordion-trigger" :class="{ open: isOpen }" @click="isOpen = !isOpen">
      <span>{{ title }}</span>
      <span class="arrow">&#9654;</span>
    </button>
    <div v-show="isOpen" class="accordion-content">
      <slot />
    </div>
  </div>
</template>
