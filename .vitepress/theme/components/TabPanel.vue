<script setup lang="ts">
import { inject, ref, onMounted } from 'vue'

const props = defineProps<{ title: string }>()
const activeTab = inject<import('vue').Ref<number>>('activeTab', ref(0))
const tabIndex = inject<{ value: number }>('tabIndexCounter', { value: 0 })

const myIndex = ref(0)
onMounted(() => {
  // noop, index is set in setup
})

// Each TabPanel grabs the next index from the counter
const idx = tabIndex.value++
myIndex.value = idx
</script>

<template>
  <div class="tab-panel" v-show="activeTab === myIndex">
    <slot />
  </div>
</template>
