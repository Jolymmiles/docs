---
title: Настройка Platega
description: Настройте Platega для приема оплаты через СБП, карты и криптовалюту
icon: money-bill-transfer
---


Platega — платежный агрегатор с поддержкой нескольких методов оплаты: СБП (QR-код), российские карты, карточный эквайринг, международные карты и криптовалюта.

## Требования

- Аккаунт мерчанта Platega ([app.platega.io](https://app.platega.io))
- Merchant ID и секретный ключ
- Публичный HTTPS-домен бота для приема вебхуков

## Как это работает

1. Пользователь выбирает тариф и один из методов Platega — бот создает транзакцию через API Platega (`POST /transaction/process`) и выдает ссылку на оплату.
2. После оплаты Platega отправляет вебхук на адрес `PLATEGA_WEBHOOK_URL`. Бот проверяет заголовки `X-MerchantId` и `X-Secret`.
3. При статусе `CONFIRMED` бот активирует подписку через Remnawave; при `CANCELED` / `CHARGEBACKED` покупка отменяется.

::: warning Важно
Без настроенного вебхука платежи не будут подтверждаться автоматически. Также необходимо включить хотя бы один метод оплаты (`PLATEGA_*_ENABLED`), иначе кнопки Platega не появятся в меню.
:::

## Инструкции по настройке

**Шаг 1: Получите учетные данные**

- Зарегистрируйтесь на [app.platega.io](https://app.platega.io)
- Получите Merchant ID и Secret в личном кабинете

**Шаг 2: Настройте переменные окружения**

```bash
PLATEGA_ENABLED=true
PLATEGA_MERCHANT_ID=ваш_merchant_id
PLATEGA_SECRET=ваш_секрет
PLATEGA_WEBHOOK_URL=/webhook/platega/СЛУЧАЙНЫЙ_СЕКРЕТ

# Включите нужные методы оплаты (минимум один)
PLATEGA_SBP_ENABLED=true
PLATEGA_CARDS_ENABLED=true
PLATEGA_ACQUIRING_ENABLED=false
PLATEGA_WORLDWIDE_ENABLED=false
PLATEGA_CRYPTO_ENABLED=false
```

Случайный секрет для пути вебхука сгенерируйте командой:

```bash
openssl rand -hex 32
```

**Шаг 3: Зарегистрируйте вебхук в Platega**

В личном кабинете Platega укажите URL для уведомлений:

```
https://ваш-домен.com/webhook/platega/СЛУЧАЙНЫЙ_СЕКРЕТ
```

**Шаг 4: Перезагрузите бота**

```bash
docker compose down && docker compose up -d
```

**Шаг 5: Протестируйте платеж**

- Отправьте `/start` боту
- Выберите подписку
- Выберите один из методов Platega (например, СБП)
- Оплатите и убедитесь, что подписка активировалась

## Переменные конфигурации

| Переменная | Обязательна | Описание |
|----------|-------------|-------------|
| `PLATEGA_ENABLED` | да | Включить/отключить Platega (`true`/`false`) |
| `PLATEGA_MERCHANT_ID` | да | Идентификатор мерчанта |
| `PLATEGA_SECRET` | да | Секретный ключ (также используется для проверки вебхуков) |
| `PLATEGA_WEBHOOK_URL` | да | Путь вебхука, например `/webhook/platega/секрет` |
| `PLATEGA_SBP_ENABLED` | нет | Оплата через СБП (QR-код) |
| `PLATEGA_CARDS_ENABLED` | нет | Российские банковские карты |
| `PLATEGA_ACQUIRING_ENABLED` | нет | Карточный эквайринг |
| `PLATEGA_WORLDWIDE_ENABLED` | нет | Международные карты |
| `PLATEGA_CRYPTO_ENABLED` | нет | Криптовалюта |

Каждый включенный метод отображается отдельной кнопкой в меню оплаты бота.

## Безопасность вебхука

Бот проверяет каждый входящий вебхук:
- Заголовки `X-MerchantId` и `X-Secret` должны совпадать с `PLATEGA_MERCHANT_ID` и `PLATEGA_SECRET` — иначе запрос отклоняется с кодом 401
- Используйте длинный случайный сегмент в пути `PLATEGA_WEBHOOK_URL`

## Устранение неполадок

### Платеж завис в статусе «ожидание»
- Проверьте, что `PLATEGA_WEBHOOK_URL` задан и URL зарегистрирован в кабинете Platega
- Проверьте, что домен бота доступен извне по HTTPS
- Просмотрите логи бота: `docker compose logs -f remnawave-telegram-shop-bot`

### Кнопки Platega не отображаются
- Убедитесь, что `PLATEGA_ENABLED=true`
- Включите хотя бы один метод: `PLATEGA_SBP_ENABLED=true` и т.д.
- Перезапустите бота после изменения `.env`

### Вебхук возвращает 401
- Проверьте, что Merchant ID и Secret в кабинете Platega совпадают со значениями в `.env`

## Поддержка

- **Platega**: [app.platega.io](https://app.platega.io)
- **Проблемы**: Сообщайте на GitHub
