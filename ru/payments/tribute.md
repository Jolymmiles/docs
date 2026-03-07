---
title: Настройка Tribute
description: Настройте Tribute для управления подписками
icon: repeat
---


Tribute обеспечивает управление повторяющимися подписками через Telegram с автоматическим продлением.

## Критические требования

⚠️ **У вас должен быть публичный домен** с действительным SSL сертификатом (например, `bot.example.com`). Вебхуки НЕ будут работать на localhost или частных IP адресах.

## Инструкции по настройке


**Шаг 1: Создайте канал Tribute**

- Откройте приложение Tribute в Telegram
  - Создайте канал
  - В "Channels and Groups" → Добавьте ваш канал
  - Создайте новую подписку

  **Шаг 2: Получите ссылку подписки**

- В Tribute: Subscription → Links
  - Скопируйте "Telegram Link"
  - Должна выглядеть так: `https://t.me/tribute/app?startapp=...`

  **Шаг 3: Настройте переменные окружения**

```bash
  TRIBUTE_WEBHOOK_URL=/tribute/webhook
  TRIBUTE_API_KEY=ваш_api_ключ_из_tribute
  TRIBUTE_PAYMENT_URL=https://t.me/tribute/app?startapp=...
  HEALTH_CHECK_PORT=8080
  ```

  **Шаг 4: Настройте обратный прокси**

Настройте Nginx или Traefik для перенаправления HTTPS запросов боту:8080

  ```nginx
  server {
    server_name bot.example.com;
    listen 443 ssl;

    ssl_certificate /путь/к/cert.pem;
    ssl_certificate_key /путь/к/key.pem;

    location / {
      proxy_pass http://localhost:8080;
    }
  }
  ```

  **Шаг 5: Перезагрузите бота**

```bash
  docker compose down && docker compose up -d
  ```

  **Шаг 6: Протестируйте вебхук**

```bash
  curl https://bot.example.com/tribute/webhook
  ```


## Как это работает

1. Пользователь нажимает кнопку платежа
2. Перенаправляется на страницу подписки Tribute
3. Пользователь завершает подписку в Telegram
4. Tribute отправляет вебхук на ваш бот
5. Бот активирует подписку для пользователя

## Переменные конфигурации

| Переменная | Описание |
|----------|-------------|
| `TRIBUTE_WEBHOOK_URL` | Путь вебхука (например, `/tribute/webhook`) |
| `TRIBUTE_API_KEY` | API ключ из настроек Tribute |
| `TRIBUTE_PAYMENT_URL` | Ссылка подписки из Tribute |
| `HEALTH_CHECK_PORT` | Порт для вебхука (обычно 8080) |

## Получение API ключа

1. Откройте приложение Tribute
2. Settings → API Settings
3. Создайте новый API ключ
4. Скопируйте и вставьте в `.env`

## Варианты SSL сертификата

### Let's Encrypt (Бесплатно)
```bash
# Используя Certbot с Nginx
sudo certbot certonly --standalone -d bot.example.com
```

## Поддержка

- **Справка Tribute**: Встроенная поддержка
- **Telegram сообщества**: Группы платежей криптовалютой
