<script setup lang="ts">
import {
  IconRocket,
  IconCloud,
  IconUsers,
  IconUserCog,
  IconCoin,
  IconAd2,
  IconMessages,
  IconPalette,
  IconAffiliate,
  IconUsersGroup,
  IconPlugConnected,
  IconShieldCheck,
  IconLink,
  IconBrandGithub,
  IconBrandTelegram,
} from '@tabler/icons-vue'

import { onMounted, onUnmounted } from 'vue'

let savedClass = ''

onMounted(() => {
  savedClass = document.documentElement.className
  document.documentElement.classList.add('dark')
})

onUnmounted(() => {
  document.documentElement.className = savedClass
})

const DOCS_BASE = '/ru/private'

const actionRows = [
  [
    { label: 'Открыть обзор', href: `${DOCS_BASE}/overview`, icon: IconRocket, tone: 'outline' },
    { label: 'Гайд по установке', href: `${DOCS_BASE}/installation`, icon: IconCloud, tone: 'soft' },
  ],
  [
    { label: 'Присоединиться', href: 'https://me.remnawavebot.dev', icon: IconUsers, tone: 'telegram', wide: true, external: true },
  ],
]

const stats = [
  { icon: IconUsers, value: '78', label: 'Активных лицензий', tone: 'violet' },
  { icon: IconCloud, value: '2', label: 'Сценария установки', tone: 'cyan' },
]

const features = [
  { title: 'Администрирование', text: 'Раздельные Admin UI и личный кабинет с RBAC-ролями, правами доступа и управлением пользователями.', icon: IconUserCog },
  { title: 'Платежи и биллинг', text: 'Интеграция с YooKassa, WATA, Platega, SeverPay, Stripe, Heleket, CryptoBot, Telegram Stars. Поддержка рекуррентных платежей, автоматическая отправка чеков в "Мой налог". Полная история и статистика оплат.', icon: IconCoin },
  { title: 'Подписки, трафик и устройства', text: 'Продажа подписок, докупка трафика и устройств, продления, смена тарифа и ограничения по лимитам.', icon: IconCloud },
  { title: 'Промокоды и блокировки тарифов', text: 'Промокоды: скидка/бесплатные дни. Поддержка скрытых тарифов, доступных через активацию промокода.', icon: IconAd2 },
  { title: 'Рассылки и рекламные кампании', text: 'Мощная система рассылки по группам пользователей (горячие/теплые/холодные лиды, с/без подписки), поддержка медиа-файлов и форматирования.', icon: IconRocket },
  { title: 'Поддержка', text: 'Поддержка осуществляется через систему тикетов. Пользователь может создать тикет через бота, браузер и PWA. Настраиваемый FAQ (ЧаВо) для клиентов, шаблоны сообщений в тикетах, настройка автоматических ответах по триггерам и временным правилам.', icon: IconMessages },
  { title: 'Брендинг, логотип и shader-эффекты', text: 'Полная кастомизация: цвета, логотип, PWA-иконки, фоновые GLSL/WebGL-эффекты для фирменной стилистики.', icon: IconPalette },
  { title: 'Реферальная программа', text: 'Учёт приглашений, начислений и активности рефералов с прозрачной аналитикой по привлечению.', icon: IconAffiliate },
  { title: 'Партнёрская программа', text: 'Отдельный партнёрский контур: заявки, комиссии, выплаты и партнёрский кабинет.', icon: IconUsersGroup },
  {
    title: 'Xray checker через REST API',
    text: 'Интеграция с xray-checker для мониторинга прокси и серверов через REST API.',
    icon: IconPlugConnected,
    links: [{ label: 'xray-checker', href: 'https://xray-checker.kutovoy.dev' }],
  },
  {
    title: 'Torrent blocker через webhook',
    text: 'Интеграция с xray-torrent-blocker: блокировка torrent-клиентов, события block/unblock и уведомления.',
    icon: IconShieldCheck,
    links: [{ label: 'xray-torrent-blocker', href: 'https://github.com/kutovoys/xray-torrent-blocker' }],
  },
  { title: 'Webhooks, Direct links, Storage', text: 'Direct links/startapp/hash-навигация, webhooks (включая Remnawave) и файловое хранилище S3/local.', icon: IconLink },
]
</script>

<template>
  <div class="landing-wrapper">
    <div class="landing-container">
      <!-- Hero -->
      <section class="hero-block">
        <h1>
          <span class="hero-accent">RWP</span>
          <span class="hero-normal"> Shop</span>
        </h1>
        <p class="hero-description">
          Полнофункциональная панель для управления всеми аспектами VPN-сервиса: личный кабинет клиента, платежи, подписки, поддержка, партнёрская программа и аналитика. Доступно как в формате сайта в браузере, так и в виде Mini App в Telegram.
        </p>
      </section>

      <!-- Actions -->
      <section class="action-stack">
        <div v-for="(row, ri) in actionRows" :key="ri" class="action-row">
          <a
            v-for="btn in row"
            :key="btn.label"
            :href="btn.href"
            :target="btn.external ? '_blank' : undefined"
            :rel="btn.external ? 'noopener noreferrer' : undefined"
            :class="['cta-link', `tone-${btn.tone}`, { 'cta-wide': btn.wide }]"
          >
            <component :is="btn.icon" :size="20" :stroke-width="1.9" />
            <span>{{ btn.label }}</span>
          </a>
        </div>
      </section>

      <!-- Preview -->
      <section class="preview-block">
        <img
          src="/assets/panel-preview-user.webp"
          alt="RWP Shop Panel"
          loading="lazy"
          width="1304"
          height="856"
        />
      </section>

      <!-- Stats -->
      <section class="stats-grid">
        <article
          v-for="stat in stats"
          :key="stat.label"
          :class="['stat-card', `stat-${stat.tone}`]"
          :aria-label="`${stat.value} ${stat.label}`"
        >
          <div class="stat-icon">
            <component :is="stat.icon" :size="20" :stroke-width="1.85" />
          </div>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
        </article>
      </section>

      <!-- Features -->
      <section class="features-section">
        <div class="features-head">
          <span>ВОЗМОЖНОСТИ ПРОДУКТА</span>
          <h2>Что в private версии</h2>
        </div>

        <div class="features-grid">
          <article v-for="f in features" :key="f.title" class="feature-card">
            <span class="feature-icon">
              <component :is="f.icon" :size="22" :stroke-width="1.85" />
            </span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
            <div v-if="f.links?.length" class="feature-links">
              <a
                v-for="link in f.links"
                :key="link.href"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="feature-link"
              >
                {{ link.label }}
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-line" />
        <div class="footer-links">
          <a href="https://github.com/Jolymmiels/remnawave-telegram-shop" target="_blank" rel="noopener noreferrer" class="footer-link">
            <IconBrandGithub :size="17" :stroke-width="1.9" />
            <span>GitHub</span>
          </a>
          <a href="https://t.me/remnawavetelegramshop" target="_blank" rel="noopener noreferrer" class="footer-link">
            <IconBrandTelegram :size="17" :stroke-width="1.9" />
            <span>Telegram</span>
          </a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.landing-wrapper {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  color-scheme: dark;
}

.landing-container {
  width: min(1400px, calc(100% - 32px));
  padding: 4rem 32px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--landing-gap, 4rem);
}

/* Hero */
.hero-block {
  width: min(58rem, 100%);
  margin: 0 auto;
  text-align: center;
}

.hero-block h1 {
  margin: 0 0 16px;
  font-family: Unbounded, sans-serif;
  font-size: clamp(2rem, 8vw, 3.5rem);
  line-height: 1.2;
  color: #fff;
  font-weight: 600;
}

.hero-accent {
  color: #3bc9db;
}

.hero-normal {
  color: #fff;
}

.hero-description {
  margin: 0 auto;
  padding: 0 12px;
  max-width: 800px;
  color: #8b949e;
  font-family: Unbounded, sans-serif;
  font-size: clamp(0.95rem, 2.5vw, 1.25rem);
  line-height: 1.7;
}

/* Actions */
.action-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.action-row {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.cta-link {
  min-width: 185px;
  height: 42px;
  border-radius: 8px;
  padding: 0 22px 0 14.6667px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  line-height: 16px;
  font-weight: 600;
  border: 1px solid transparent;
  text-decoration: none;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.cta-link:hover {
  filter: brightness(1.08);
}

.tone-outline:hover {
  background: rgba(60, 201, 219, 0.05);
}

.tone-soft:hover {
  background: rgba(21, 170, 191, 0.2);
}

.tone-telegram:hover {
  background: #0077b3;
}

.cta-wide {
  min-width: 232px;
}

.tone-outline {
  border-color: #3bc9db;
  color: #3bc9db;
  background: transparent;
}

.tone-soft {
  color: rgb(102, 217, 232);
  background: rgba(21, 170, 191, 0.15);
}

.tone-telegram {
  color: #fff;
  background: #0088cc;
}

/* Preview */
.preview-block {
  width: min(1304px, 100%);
  margin: 0 auto;
}

.preview-block img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

@media (hover: hover) {
  .preview-block img:hover {
    transform: scale(1.02);
  }
}

/* Stats */
.stats-grid {
  width: min(652px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.stat-card {
  border-radius: 32px;
  min-height: 274px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid transparent;
}

.stat-violet {
  border-color: rgba(151, 117, 250, 0.2);
  background: linear-gradient(135deg, rgba(151, 117, 250, 0.1) 0%, rgba(132, 94, 247, 0.05) 100%);
}

.stat-cyan {
  border-color: rgba(34, 211, 238, 0.2);
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(34, 211, 238, 0.1);
}

.stat-value {
  margin: 0;
  font-family: Unbounded, sans-serif;
  font-size: 56px;
  line-height: 1.55;
  font-weight: 700;
  white-space: nowrap;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-violet .stat-value {
  background-image: linear-gradient(135deg, rgb(151, 117, 250) 0%, rgb(132, 94, 247) 100%);
}

.stat-cyan .stat-value {
  font-size: 48px;
  background-image: linear-gradient(135deg, rgb(34, 211, 238) 0%, rgb(6, 182, 212) 100%);
}

.stat-label {
  margin: 0;
  color: #8b949e;
  font-size: 16px;
  line-height: 24.8px;
  font-weight: 600;
}

/* Features */
.features-section {
  width: 100%;
}

.features-head {
  text-align: center;
  margin-bottom: 26px;
}

.features-head > span {
  display: inline-block;
  font-size: 13px;
  line-height: 24px;
  letter-spacing: 0.25px;
  font-weight: 700;
  color: #22d3ee;
  text-transform: uppercase;
  padding: 0 12px;
  border-radius: 1000px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  background: rgba(34, 211, 238, 0.1);
  margin-bottom: 12px;
}

.features-head h2 {
  margin: 0;
  font-family: Unbounded, sans-serif;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  line-height: 1.2;
  color: #fff;
  letter-spacing: -0.02em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.feature-card {
  min-height: 220px;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(34, 211, 238, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(34, 211, 238, 0.1);
}

.feature-card h3 {
  margin: 0;
  font-family: Unbounded, sans-serif;
  font-size: 24px;
  line-height: 33.6px;
  font-weight: 600;
  color: #fff;
}

.feature-card p {
  margin: 0;
  color: #8b949e;
  font-size: 14px;
  line-height: 22.4px;
}

.feature-links {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.38);
  background: rgba(34, 211, 238, 0.08);
  color: #67e8f9;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.feature-link:hover {
  background: rgba(34, 211, 238, 0.16);
  border-color: rgba(34, 211, 238, 0.6);
  color: #a5f3fc;
}

/* Footer */
.site-footer {
  padding-top: 4px;
  text-align: center;
}

.footer-line {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 15px 0;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
}

/* Responsive */
@media (min-width: 48em) {
  .landing-container {
    --landing-gap: 3rem;
  }
}

@media (min-width: 62em) {
  .landing-container {
    --landing-gap: 4rem;
  }
}

@media (max-width: 1200px) {
  .landing-container {
    width: min(1400px, calc(100% - 24px));
    padding: 4rem 24px;
  }

  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .landing-container {
    width: calc(100% - 16px);
    padding: 2.5rem 8px;
    gap: 32px;
  }

  .action-row {
    flex-wrap: wrap;
  }

  .cta-link,
  .cta-wide {
    min-width: 100%;
  }

  .stats-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 160px;
    border-radius: 18px;
  }

  .feature-card {
    min-height: 170px;
  }
}
</style>
