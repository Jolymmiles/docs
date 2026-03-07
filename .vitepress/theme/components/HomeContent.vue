<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  text: string
}

interface Section {
  badge: string
  title: string
  description: string
  features: Feature[]
  link: string
  linkText: string
}

defineProps<{ sections: Section[] }>()
</script>

<template>
  <div class="home-content">
    <div v-for="(section, si) in sections" :key="si" class="section">
      <div class="section-head">
        <span class="section-badge">{{ section.badge }}</span>
        <h2 class="section-title">{{ section.title }}</h2>
        <p class="section-desc">{{ section.description }}</p>
      </div>

      <div class="features-grid">
        <div v-for="(f, fi) in section.features" :key="fi" class="feature-card">
          <div class="feature-icon">
            <i :class="f.icon"></i>
          </div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-text">{{ f.text }}</p>
        </div>
      </div>

      <div class="section-cta">
        <a :href="section.link" class="cta-button">
          {{ section.linkText }} <span class="cta-arrow">&rarr;</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-content {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.section {
  margin-top: 80px;
}

.section-head {
  text-align: center;
  margin-bottom: 48px;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  background: rgba(11, 137, 248, 0.1);
  border: 1px solid rgba(11, 137, 248, 0.2);
  border-radius: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 16px;
  color: var(--vp-c-text-2);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 960px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(13, 17, 23, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.03) inset;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  border-color: rgba(11, 137, 248, 0.2);
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(11, 137, 248, 0.1);
  margin-bottom: 16px;
  font-size: 18px;
  color: var(--vp-c-brand-1);
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
}

.feature-text {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

.section-cta {
  text-align: center;
  margin-top: 32px;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.cta-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.cta-button:hover .cta-arrow {
  transform: translateX(3px);
}
</style>
