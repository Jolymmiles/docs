<script setup lang="ts">
import { ref, computed } from 'vue'

interface Step {
  title: string
  description: string
  image?: string
  note?: string
}

const props = defineProps<{ steps: Step[] }>()

const current = ref(0)
const total = computed(() => props.steps.length)
const step = computed(() => props.steps[current.value])

function prev() {
  if (current.value > 0) current.value--
}
function next() {
  if (current.value < total.value - 1) current.value++
}
function goTo(i: number) {
  current.value = i
}
</script>

<template>
  <div class="step-carousel">
    <div class="step-progress">
      <button
        v-for="(s, i) in steps"
        :key="i"
        :class="['step-dot', { active: i === current, done: i < current }]"
        @click="goTo(i)"
        :title="s.title"
      >
        <span class="dot-number">{{ i + 1 }}</span>
      </button>
      <div class="progress-line">
        <div class="progress-fill" :style="{ width: ((current / (total - 1)) * 100) + '%' }" />
      </div>
    </div>

    <div class="step-content">
      <div class="step-header">
        <span class="step-counter">{{ current + 1 }} / {{ total }}</span>
        <h3 class="step-title">{{ step.title }}</h3>
      </div>

      <div class="step-body" v-html="step.description" />

      <div class="step-image" v-if="step.image">
        <img :src="step.image" :alt="step.title" />
      </div>

      <div class="step-note" v-if="step.note" v-html="step.note" />
    </div>

    <div class="step-nav">
      <button class="nav-btn" :disabled="current === 0" @click="prev">
        <span class="nav-arrow">&larr;</span> Назад
      </button>
      <button class="nav-btn primary" :disabled="current === total - 1" @click="next">
        Далее <span class="nav-arrow">&rarr;</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-carousel {
  margin: 24px 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: rgba(13, 17, 23, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.03) inset;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 20px 24px 16px;
  position: relative;
}

.progress-line {
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 2px;
  background: var(--vp-c-divider);
  transform: translateY(-2px);
  z-index: 0;
  border-radius: 1px;
}

.progress-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 1px;
  transition: width 0.3s ease;
}

.step-dot {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.step-dot:not(:last-child) {
  margin-right: auto;
}

.step-dot:last-child {
  margin-left: 0;
}

/* distribute dots evenly */
.step-progress {
  justify-content: space-between;
}

.dot-number {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  transition: color 0.2s ease;
}

.step-dot.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  transform: scale(1.15);
  box-shadow: 0 0 12px rgba(11, 137, 248, 0.4);
}

.step-dot.active .dot-number {
  color: #fff;
}

.step-dot.done {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}

.step-dot.done .dot-number {
  color: #fff;
}

.step-dot:hover:not(.active) {
  border-color: var(--vp-c-brand-2);
  transform: scale(1.1);
}

.step-content {
  padding: 0 24px 16px;
}

.step-header {
  margin-bottom: 12px;
}

.step-counter {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.step-title {
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.step-body {
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.step-body :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.step-body :deep(a:hover) {
  text-decoration: underline;
}

.step-body :deep(code) {
  background: var(--vp-c-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.step-image {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}

.step-image img {
  max-width: 70%;
  border-radius: 8px;
  border: none;
  background: transparent;
  box-shadow: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.step-image img:hover {
  transform: translateY(-6px);
}

.step-note {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(11, 137, 248, 0.08);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 8px 8px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.step-nav {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: none;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.nav-btn.primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

.nav-arrow {
  font-size: 16px;
}
</style>
