<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ href: string; filename: string }>()
const busy = ref(false)

async function download(e: MouseEvent) {
  e.preventDefault()
  busy.value = true
  try {
    const res = await fetch(props.href, { mode: 'cors' })
    if (!res.ok) throw new Error(String(res.status))
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    window.open(props.href, '_blank', 'noopener')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <a class="dl-btn" :href="href" :download="filename" :aria-busy="busy" @click="download">
    <i :class="busy ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-download'"></i>
    {{ filename }}
  </a>
</template>
