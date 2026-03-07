<script setup lang="ts">
import { ref, provide, reactive, useSlots, computed, onBeforeMount } from 'vue'

const activeIndex = ref(0)
const indexCounter = reactive({ value: 0 })

provide('activeTab', activeIndex)
provide('tabIndexCounter', indexCounter)

const slots = useSlots()
const tabTitles = computed(() => {
  const children = slots.default?.() ?? []
  return children
    .filter((c: any) => c.props?.title)
    .map((c: any) => c.props.title)
})

// Reset counter before each render
onBeforeMount(() => {
  indexCounter.value = 0
})
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="(title, i) in tabTitles"
        :key="i"
        class="tab-button"
        :class="{ active: activeIndex === i }"
        @click="activeIndex = i"
      >
        {{ title }}
      </button>
    </div>
    <slot />
  </div>
</template>
