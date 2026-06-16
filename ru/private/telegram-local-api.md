---
title: Локальный Telegram Bot API
description: Запуск собственного сервера telegram-bot-api и подключение бота через TELEGRAM_API_URL
icon: server
---

# Локальный Telegram Bot API

По умолчанию бот обращается к публичному серверу Telegram `https://api.telegram.org`. Вы можете развернуть **собственный** сервер [telegram-bot-api](https://github.com/tdlib/telegram-bot-api) и направить бота на него через переменную окружения `TELEGRAM_API_URL`.

## Зачем это нужно

- **Большие файлы** — публичный API ограничивает загрузку до 20 МБ, скачивание до 20 МБ. Локальный сервер поднимает лимиты до 2 ГБ.
- **Локальные файлы** — локальный сервер отдаёт скачанные файлы прямым путём на диске, без повторной загрузки по сети.
- **Скорость и независимость** — нет общего rate-лимита публичного API, меньше задержек, работа при недоступности `api.telegram.org` напрямую.
- **Webhook и polling** на своей инфраструктуре.

::: tip
Если задача — только обойти блокировку `api.telegram.org`, проще использовать [`TELEGRAM_PROXY_URL`](/ru/private/environment-variables#прокси-для-telegram). Локальный API нужен прежде всего ради лимитов на файлы.
:::

## Получение api_id и api_hash

Локальный сервер требует ключей приложения Telegram (не путать с токеном бота):

1. Войдите на [my.telegram.org](https://my.telegram.org) под своим аккаунтом.
2. Откройте **API development tools**.
3. Создайте приложение — получите `api_id` (число) и `api_hash` (строка).

## Запуск сервера

### Docker Compose

Добавьте сервис в `docker-compose.yml` рядом с ботом:

```yaml
services:
  telegram-bot-api:
    image: aiogram/telegram-bot-api:latest
    environment:
      TELEGRAM_API_ID: "1234567"
      TELEGRAM_API_HASH: "abcdef0123456789abcdef0123456789"
      TELEGRAM_LOCAL: 1            # режим локальных файлов (прямые пути на диске)
    volumes:
      - telegram-bot-api-data:/var/lib/telegram-bot-api
    ports:
      - "8081:8081"
    restart: unless-stopped

volumes:
  telegram-bot-api-data:
```

::: warning TELEGRAM_LOCAL
`TELEGRAM_LOCAL=1` включает режим, в котором сервер возвращает локальные пути к файлам вместо URL для скачивания. Чтобы бот мог их читать, том `telegram-bot-api-data` должен быть смонтирован **и** в контейнер бота по тому же пути.
:::

### Бинарь

```bash
telegram-bot-api \
  --api-id=1234567 \
  --api-hash=abcdef0123456789abcdef0123456789 \
  --local \
  --http-port=8081
```

## Отвязка бота от облака Telegram (обязательно)

::: danger Без этого шага бот не запустится
Пока бот «прописан» на облачном `api.telegram.org`, ваш локальный сервер не может им управлять. Симптом — бот падает при старте:

```
create telegram bot: error call getMe, error decode response body
for method getMe, , unexpected end of JSON input
```

Это значит, что вызов `getMe` к локальному серверу вернул пустое тело — бот ещё не отвязан.
:::

Перед первым подключением к локальному серверу вызовите метод `logOut` на **облачном** API (именно на `api.telegram.org`, не на локальном сервере):

```bash
curl -X POST https://api.telegram.org/bot<TELEGRAM_TOKEN>/logOut
# {"ok":true,"result":true}
```

- Замените `<TELEGRAM_TOKEN>` на ваш токен из `TELEGRAM_TOKEN`.
- После `logOut` подождите ~10 минут. Если в ответ пришёл `429 Too Many Requests` — выждите указанное в `retry_after` время и повторите.
- Только после успешного `logOut` запускайте бота с `TELEGRAM_API_URL`.

## Подключение бота

Укажите адрес локального сервера в переменной окружения бота:

```bash
TELEGRAM_API_URL=http://telegram-bot-api:8081
```

- Внутри Docker-сети — имя сервиса: `http://telegram-bot-api:8081`.
- На том же хосте — `http://127.0.0.1:8081`.
- Без слеша в конце не обязательно — он обрезается автоматически.

Если переменная пуста или не задана, бот использует `https://api.telegram.org` (поведение по умолчанию).

При старте в логах появится строка подтверждения:

```
Telegram bot using custom API server  url=http://telegram-bot-api:8081
```

## Проверка

1. Перезапустите контейнер бота после установки `TELEGRAM_API_URL`.
2. Убедитесь, что в логах есть строка `Telegram bot using custom API server`.
3. Проверьте доступность сервера:

```bash
curl http://127.0.0.1:8081/
# Ответ "Unauthorized" — нормально: сервер жив, токен в запросе не передан
```

## Откат

Чтобы вернуться на публичный API, бота нужно так же **отвязать** — но теперь от локального сервера:

1. Остановите бота.
2. Вызовите `logOut` на **локальном** сервере:

   ```bash
   curl -X POST http://127.0.0.1:8081/bot<TELEGRAM_TOKEN>/logOut
   ```

3. Удалите `TELEGRAM_API_URL` (или оставьте пустым) и перезапустите бота — он снова подключится к `api.telegram.org`.

## Частые проблемы

| Симптом | Причина / решение |
|---------|-------------------|
| `getMe ... unexpected end of JSON input` при старте | Бот не отвязан от облака. Вызовите `logOut` на `api.telegram.org` (см. [раздел выше](#отвязка-бота-от-облака-telegram-обязательно)). |
| Бот не стартует, ошибки сети | Неверный `TELEGRAM_API_URL` или сервер недоступен из сети контейнера. Проверьте имя сервиса и порт. |
| `logOut` вернул `429` | Telegram ограничивает частоту. Подождите время из `retry_after` и повторите. |
| Файлы не читаются | При `TELEGRAM_LOCAL=1` том с файлами не примонтирован в контейнер бота по тому же пути. |
| Хочу обойти только блокировку | Используйте `TELEGRAM_PROXY_URL` вместо локального сервера. |

## См. также

- [Переменные окружения](/ru/private/environment-variables)
- [Устранение неполадок](/ru/private/troubleshooting)
