---
title: Direct links
description: Поддерживаемые startapp параметры и прямые ссылки
icon: link
---

### Настройка  Mini App под прямые ссылки(deep links)
1. Откройте **Mini App** [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Перейдите в **Mini Apps** → **Mini App**
4. Укажите URL вашего дашборда:
   ```
   https://bot.example.com
   ```
Без данной прямые ссылки(deep links) работать не будут

## Поддерживаемые startapp параметры

Используйте deep links Telegram, чтобы открывать конкретные разделы Mini App:

```
https://t.me/<bot_username>?startapp=<value>
```

### Параметризованные ссылки

| Значение `startapp` | Открывает | Пример |
|---|---|---|
| *(пусто)* | Стартовый экран (редирект по ролям) | `https://t.me/<bot_username>?startapp` |
| `user_<user_id>` | Карточку пользователя (админ) | `https://t.me/<bot_username>?startapp=user_123456789` |
| `support_ticket_<ticket_id>` | Тикет поддержки (для админа — в панели поддержки, для клиента — в его чате) | `https://t.me/<bot_username>?startapp=support_ticket_42` |
| `buy_<plan_id>_<period>` | Конфигурацию покупки тарифа на период (в месяцах) | `https://t.me/<bot_username>?startapp=buy_12_3` |
| `buy_<plan_id>_<period>_<unit>` | То же, но с указанием единицы периода: `days`, `weeks` или `months` | `https://t.me/<bot_username>?startapp=buy_12_14_days` |
| `sub_<subscription_id>` | ЛК с выбранной подпиской | `https://t.me/<bot_username>?startapp=sub_98765` |
| `renew_<subscription_id>_<plan_id>` | Конфигурацию продления подписки по указанному тарифу (1 месяц по умолчанию) | `https://t.me/<bot_username>?startapp=renew_98765_12` |
| `buytraffic_<subscription_id>` | ЛК с открытым окном докупки трафика для подписки | `https://t.me/<bot_username>?startapp=buytraffic_98765` |
| `install_<subscription_id>` | Инструкцию по установке для конкретной подписки | `https://t.me/<bot_username>?startapp=install_98765` |
| `broadcast_<broadcast_id>` | Просмотр рассылки по ссылке | `https://t.me/<bot_username>?startapp=broadcast_42` |
| `partner_app_<application_id>` | Заявку партнёра (требуется право `view_partners`) | `https://t.me/<bot_username>?startapp=partner_app_15` |
| `partner_wd_<withdrawal_id>` | Заявку на вывод партнёра (требуется право `view_partners`) | `https://t.me/<bot_username>?startapp=partner_wd_77` |

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

### Разделы личного кабинета

| Страница | Прямая ссылка |
|---|---|
| Личный кабинет | `https://bot.example.com/#/my-dashboard` |
| История покупок | `https://bot.example.com/#/my-purchases` |
| Выбор тарифа | `https://bot.example.com/#/plans` |
| Конфигурация тарифа | `https://bot.example.com/#/plans/configure` |
| Смена тарифа | `https://bot.example.com/#/change-plan` |
| Оплата | `https://bot.example.com/#/payment` |
| История промокодов | `https://bot.example.com/#/my-promos` |
| Рефералы | `https://bot.example.com/#/my-referrals` |
| Биллинг | `https://bot.example.com/#/my-billing` |
| Безопасность | `https://bot.example.com/#/my-security` |
| Кабинет | `https://bot.example.com/#/cabinet` |
| Passkeys | `https://bot.example.com/#/my-passkeys` |
| Статус серверов | `https://bot.example.com/#/server-status` |
| Докупить трафик | `https://bot.example.com/#/buy-extra-traffic` |
| Добавить устройства | `https://bot.example.com/#/buy-extra-devices` |
| Инструкция по установке | `https://bot.example.com/#/installation-guide` |
| Мастер установки | `https://bot.example.com/#/installation-guide/wizard` |
| Выбор платформы | `https://bot.example.com/#/installation-guide/platforms` |
| Выбор приложения | `https://bot.example.com/#/installation-guide/apps` |
| Добавить на рабочий стол | `https://bot.example.com/#/add-to-home-screen` |
| Справка / FAQ | `https://bot.example.com/#/faq-help` |
| Привязка email | `https://bot.example.com/#/link-email` |
| Привязка Telegram | `https://bot.example.com/#/link-telegram` |
| Привязка Google | `https://bot.example.com/#/link-google` |
| Привязка Яндекс | `https://bot.example.com/#/link-yandex` |
| Привязка VK | `https://bot.example.com/#/link-vk` |
| Поддержка | `https://bot.example.com/#/support-chat` |
| Новое обращение | `https://bot.example.com/#/support-chat/new` |
| Чат поддержки | `https://bot.example.com/#/support-chat/ticket/<ticket_id>` |
| Мои рассылки | `https://bot.example.com/#/my-broadcasts` |
| Просмотр рассылки | `https://bot.example.com/#/broadcast/<broadcast_id>` |
| Партнёрский кабинет | `https://bot.example.com/#/partner-dashboard` |
| Детали вывода | `https://bot.example.com/#/partner-dashboard/withdrawals/<withdrawal_id>` |
| Deeplink redirect | `https://bot.example.com/#/deeplink` |
