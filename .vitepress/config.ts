import { defineConfig } from 'vitepress'

// Helper to prefix sidebar text with a Font Awesome icon
const i = (icon: string, text: string) =>
  `<i class="fa-solid fa-${icon}"></i> ${text}`

export default defineConfig({
  title: 'RWP Docs',
  description: 'Полная документация по управлению VPN подписками через Telegram',
  lang: 'ru-RU',

  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],

  themeConfig: {
    logo: {
      light: '/logo/light.svg',
      dark: '/logo/dark.svg',
    },

    nav: [
      { text: 'Публичная версия', link: '/ru/', activeMatch: '/ru/(?!private)' },
      { text: 'Приватная версия', link: '/ru/private/releases', activeMatch: '/ru/private/' },
      { text: 'Telegram', link: 'https://t.me/remnawavetelegramshop' },
    ],

    sidebar: {
      '/ru/private/': [
        {
          text: 'Начало',
          items: [
            { text: i('clock-rotate-left', 'Что нового'), link: '/ru/private/releases' },
            { text: i('lock', 'Приватная версия'), link: '/ru/private/overview' },
            { text: i('download', 'Установка'), link: '/ru/private/installation' },
            { text: i('sliders', 'Переменные окружения'), link: '/ru/private/environment-variables' },
          ],
        },
        {
          text: 'Эксплуатация',
          items: [
            { text: i('arrow-up-right-dots', 'Обновление'), link: '/ru/private/update' },
            { text: i('hard-drive', 'Резервное копирование'), link: '/ru/private/backup' },
            { text: i('scroll', 'Логи доступа'), link: '/ru/private/access-logs' },
            { text: i('cloud-arrow-up', 'S3 хранилище'), link: '/ru/private/s3' },
          ],
        },
        {
          text: 'Настройка',
          items: [
            { text: i('fingerprint', 'Telegram OIDC'), link: '/ru/private/telegram-oidc' },
            { text: i('link', 'Прямые ссылки'), link: '/ru/private/direct-links' },
            { text: i('temperature-half', 'Lead Scoring'), link: '/ru/private/lead-scoring' },
          ],
        },
        {
          text: 'Справка',
          items: [
            { text: i('wrench', 'Устранение неполадок'), link: '/ru/private/troubleshooting' },
            { text: i('tags', 'Тарифы'), link: '/ru/private/faq' },
            { text: i('circle-question', 'Вопрос-ответ'), link: '/ru/private/qa' },
            { text: i('mobile-screen', 'Устройства'), link: '/ru/private/extra-devices' },
          ],
        },
      ],
      '/ru/': [
        {
          text: 'Начало',
          items: [
            { text: i('house', 'Главная'), link: '/ru/' },
            { text: i('book-open', 'Обзор'), link: '/ru/getting-started/overview' },
            { text: i('gear', 'Установка'), link: '/ru/getting-started/setup' },
          ],
        },
        {
          text: 'Конфигурация',
          items: [
            { text: i('sliders', 'Переменные'), link: '/ru/configuration/variables' },
            { text: i('users-rectangle', 'Отряды'), link: '/ru/configuration/squads' },
            { text: i('shield-halved', 'Безопасность'), link: '/ru/configuration/security' },
          ],
        },
        {
          text: 'Возможности',
          items: [
            { text: i('puzzle-piece', 'Основные'), link: '/ru/features/core' },
            { text: i('wallet', 'Платежи'), link: '/ru/features/payments' },
            { text: i('calendar-check', 'Подписки'), link: '/ru/features/subscriptions' },
          ],
        },
        {
          text: 'Платежные системы',
          items: [
            { text: i('credit-card', 'YooKassa'), link: '/ru/payments/yookassa' },
            { text: i('bitcoin-sign', 'CryptoPay'), link: '/ru/payments/cryptopay' },
            { text: i('star', 'Telegram Stars'), link: '/ru/payments/telegram-stars' },
            { text: i('repeat', 'Tribute'), link: '/ru/payments/tribute' },
          ],
        },
        {
          text: 'Администрирование',
          items: [
            { text: i('terminal', 'Команды'), link: '/ru/admin/commands' },
            { text: i('users', 'Пользователи'), link: '/ru/admin/users' },
            { text: i('chart-line', 'Мониторинг'), link: '/ru/admin/monitoring' },
            { text: i('screwdriver-wrench', 'Обслуживание'), link: '/ru/admin/maintenance' },
          ],
        },
        {
          text: 'Устранение неполадок',
          items: [
            { text: i('circle-exclamation', 'Проблемы'), link: '/ru/troubleshooting/issues' },
            { text: i('file-lines', 'Логи'), link: '/ru/troubleshooting/logs' },
          ],
        },
      ],
    },

    socialLinks: [],

    editLink: {
      pattern: 'https://github.com/Jolymmiles/docs/edit/main/:path',
      text: 'Редактировать эту страницу',
    },

    search: {
      provider: 'local',
    },

    outline: {
      label: 'На этой странице',
    },

    docFooter: {
      prev: 'Предыдущая',
      next: 'Следующая',
    },
  },
})
