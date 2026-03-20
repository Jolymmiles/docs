---
title: Вход через Telegram OIDC
description: Настройка Telegram OpenID Connect для авторизации
icon: fingerprint
---

## Настройка домена в BotFather

<StepCarousel :steps="[
  {
    title: 'Настройки бота',
    description: 'Перейдите в <a href=&quot;https://t.me/BotFather&quot;>@BotFather</a>, выберите вашего бота и нажмите <strong>Bot Settings</strong>.',
    image: '/images/private/direct-links/step1.webp'
  },
  {
    title: 'Удалите домен',
    description: 'Если в разделе <strong>Web Login</strong> уже указан домен — удалите его.',
    image: '/images/private/direct-links/step2.webp'
  },
  {
    title: 'OpenID Connect',
    description: 'Нажмите кнопку <strong>Switch to OpenID Connect Login</strong>.',
    image: '/images/private/direct-links/step3.webp'
  },
  {
    title: 'Allowed URL',
    description: 'Нажмите <strong>Add an Allowed URL</strong>.',
    image: '/images/private/direct-links/step5.webp'
  },
  {
    title: 'Origins и URIs',
    description: 'Укажите следующие значения:<br><br><strong>Trusted Origins:</strong> <code>https://bot.example.com/</code><br><strong>Redirect URIs:</strong> <code>https://bot.example.com/api/auth/telegram-login</code>',
    image: '/images/private/direct-links/step6.webp'
  },
  {
    title: 'Настройка в админке Mini App',
    description: 'После настройки в BotFather, откройте Telegram Mini App админку и перейдите в раздел <strong>Вход в систему</strong>.<br><br>Заполните данные для OIDC авторизации через Telegram.',
    note: 'Этот шаг обязателен — без настройки секретов в админке авторизация работать не будет.'
  }
]" />
