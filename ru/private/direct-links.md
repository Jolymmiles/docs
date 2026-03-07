---
title: Direct links
description: Поддерживаемые startapp параметры и прямые ссылки
icon: link
---

## Поддерживаемые startapp параметры

Используйте deep links Telegram, чтобы открывать конкретные разделы Mini App:

```
https://t.me/<bot_username>?startapp=<value>
```

### Параметризованные ссылки

| Значение `startapp` | Открывает | Пример |
|---|---|---|
| *(пусто)* | Стартовый экран (редирект по ролям) | `https://t.me/<bot_username>?startapp` |
| `user_<telegram_id>` | Карточку пользователя (админ) | `https://t.me/<bot_username>?startapp=user_123456789` |
| `support_ticket_<ticket_id>` | Тикет поддержки (админ) | `https://t.me/<bot_username>?startapp=support_ticket_42` |
| `buy_<plan_id>_<months>` | Оплату тарифа на период | `https://t.me/<bot_username>?startapp=buy_12_3` |
| `sub_<subscription_id>` | ЛК с выбранной подпиской | `https://t.me/<bot_username>?startapp=sub_98765` |

### Разделы личного кабинета

| Значение `startapp` | Открывает | Пример |
|---|---|---|
| `dashboard` | Личный кабинет | `https://t.me/<bot_username>?startapp=dashboard` |
| `purchases` | История покупок | `https://t.me/<bot_username>?startapp=purchases` |
| `plans` | Выбор тарифа | `https://t.me/<bot_username>?startapp=plans` |
| `promos` | История промокодов | `https://t.me/<bot_username>?startapp=promos` |
| `referrals` | Рефералы | `https://t.me/<bot_username>?startapp=referrals` |
| `cabinet` | Кабинет | `https://t.me/<bot_username>?startapp=cabinet` |
| `billing` | Биллинг | `https://t.me/<bot_username>?startapp=billing` |
| `security` | Безопасность | `https://t.me/<bot_username>?startapp=security` |
| `server_status` | Статус серверов | `https://t.me/<bot_username>?startapp=server_status` |
| `support` | Поддержка | `https://t.me/<bot_username>?startapp=support` |
| `support_new` | Новое обращение | `https://t.me/<bot_username>?startapp=support_new` |
| `partner` | Партнёрский кабинет | `https://t.me/<bot_username>?startapp=partner` |
| `guide` | Инструкция по установке | `https://t.me/<bot_username>?startapp=guide` |

## Прямые ссылки в браузере (https://bot.example.com)

Mini App использует hash-роутинг. Для прямых ссылок используйте префикс `/#/`:

```
https://bot.example.com/#/<path>
```

### Разделы Admin UI

| Страница | Прямая ссылка |
|---|---|
| Покупки | `https://bot.example.com/#/purchases` |
| Пользователи | `https://bot.example.com/#/users` |
| Рассылки | `https://bot.example.com/#/broadcasts` |
| Промокоды | `https://bot.example.com/#/promos` |
| Кампании | `https://bot.example.com/#/campaigns` |
| Детали кампании | `https://bot.example.com/#/campaigns/<id>` |
| Аналитика | `https://bot.example.com/#/analytics` |
| Детали промокода | `https://bot.example.com/#/promos/<promo_id>` |
| Управление пользователями | `https://bot.example.com/#/user-management` |
| Пользователь | `https://bot.example.com/#/user/<telegram_id>` |
| Платежи пользователя | `https://bot.example.com/#/user/<telegram_id>/payments` |
| Промокоды пользователя | `https://bot.example.com/#/user/<telegram_id>/promos` |
| Реферальные бонусы | `https://bot.example.com/#/user/<telegram_id>/referral-bonuses` |
| История смены тарифов | `https://bot.example.com/#/user/<telegram_id>/plan-changes` |
| Рефералы | `https://bot.example.com/#/user/<telegram_id>/referrals` |
| Тикеты пользователя | `https://bot.example.com/#/user/<telegram_id>/tickets` |
| Настройки | `https://bot.example.com/#/settings` |
| Тарифы | `https://bot.example.com/#/plans` |
| Платежи (настройки) | `https://bot.example.com/#/payments` |
| Список платежей | `https://bot.example.com/#/payments-list` |
| Брендинг | `https://bot.example.com/#/branding` |
| Remnawave webhooks | `https://bot.example.com/#/remnawave-webhooks` |
| Torrent Blocker | `https://bot.example.com/#/torrent-blocker` |
| Безопасность | `https://bot.example.com/#/security` |
| Роли | `https://bot.example.com/#/roles` |
| Редактирование роли | `https://bot.example.com/#/roles/<id>` |
| Поддержка | `https://bot.example.com/#/support` |
| Тикет поддержки | `https://bot.example.com/#/support/ticket/<ticket_id>` |
| Новый чат поддержки | `https://bot.example.com/#/support/new/<telegram_id>` |
| FAQ | `https://bot.example.com/#/faq` |
| Шаблоны | `https://bot.example.com/#/templates` |
| Автоответы | `https://bot.example.com/#/autoreply` |
| Партнёры | `https://bot.example.com/#/partners` |
| Список партнёров | `https://bot.example.com/#/partners/list` |
| Заявки | `https://bot.example.com/#/partners/applications` |
| Детали заявки | `https://bot.example.com/#/partners/applications/<app_id>` |
| Выводы | `https://bot.example.com/#/partners/withdrawals` |
| Детали вывода | `https://bot.example.com/#/partners/withdrawals/<withdrawal_id>` |
| Партнёр | `https://bot.example.com/#/partners/<partner_id>` |
| Клиенты партнёра | `https://bot.example.com/#/partners/<partner_id>/clients` |
| Комиссии партнёра | `https://bot.example.com/#/partners/<partner_id>/commissions` |
| Выводы партнёра | `https://bot.example.com/#/partners/<partner_id>/withdrawals` |

### Разделы личного кабинета

| Страница | Прямая ссылка |
|---|---|
| Личный кабинет | `https://bot.example.com/#/my-dashboard` |
| История покупок | `https://bot.example.com/#/my-purchases` |
| Выбор тарифа | `https://bot.example.com/#/my-plans` |
| Смена тарифа | `https://bot.example.com/#/change-plan` |
| Оплата | `https://bot.example.com/#/payment` |
| История промокодов | `https://bot.example.com/#/my-promos` |
| Рефералы | `https://bot.example.com/#/my-referrals` |
| Кабинет | `https://bot.example.com/#/cabinet` |
| Passkeys | `https://bot.example.com/#/my-passkeys` |
| Статус серверов | `https://bot.example.com/#/server-status` |
| Докупить трафик | `https://bot.example.com/#/buy-extra-traffic` |
| Добавить устройства | `https://bot.example.com/#/buy-extra-devices` |
| Выбор устройства | `https://bot.example.com/#/installation-guide` |
| Инструкция | `https://bot.example.com/#/installation-guide/apps` |
| Добавить на рабочий стол | `https://bot.example.com/#/add-to-home-screen` |
| Поддержка | `https://bot.example.com/#/support-chat` |
| Новое обращение | `https://bot.example.com/#/support-chat/new` |
| Чат поддержки | `https://bot.example.com/#/support-chat/ticket/<ticket_id>` |
| Партнёрский кабинет | `https://bot.example.com/#/partner-dashboard` |
| Детали вывода | `https://bot.example.com/#/partner-dashboard/withdrawals/<withdrawal_id>` |
| Deeplink redirect | `https://bot.example.com/#/deeplink` |
