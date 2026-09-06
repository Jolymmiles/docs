---
title: Переменные окружения
description: Полный справочник всех переменных конфигурации
icon: sliders
---

## Основная конфигурация

| Переменная | Описание                      | Пример |
|-----------|-------------------------------|---------|
| `TELEGRAM_TOKEN` | Токен API Telegram бота       | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `MENU_PHOTO_PATH` | Локальный JPEG/PNG для меню (с 5.1.0); пустое значение — без картинки | `/assets/menu.jpg` |
| `DATABASE_URL` | Строка подключения PostgreSQL | `postgresql://user:pass@postgres:5432/remnawave` |
| `REMNAWAVE_URL` | URL API панели Remnawave      | `https://panel.example.com` |
| `REMNAWAVE_TOKEN` | Токен API Remnawave           | `your_token` |
| `ADMIN_ID` | Идентификаторы админов (через запятую). Форматы: число (`123456789`), `telegram:ID`, UUID | `123456789,telegram:987654321` |

## Конфигурация ценообразования

```bash
PRICE_1=5
PRICE_3=12
PRICE_6=20
PRICE_12=35
DAYS_IN_MONTH=30
```

Для Telegram Stars:
```bash
STARS_PRICE_1=50
STARS_PRICE_3=120
STARS_PRICE_6=200
STARS_PRICE_12=350
```

## Параметры подписок и пробных периодов

```bash
REMNAWAVE_TAG=paying_user
TRIAL_REMNAWAVE_TAG=trial_user
TRIAL_DAYS=7
TRIAL_TRAFFIC_LIMIT=10
TRAFFIC_LIMIT=100
TRAFFIC_LIMIT_RESET_STRATEGY=MONTH
TRIAL_TRAFFIC_LIMIT_RESET_STRATEGY=MONTH
REFERRAL_DAYS=0
```

**Стратегия сброса лимита трафика:**
- `DAY` - Лимит трафика сбрасывается каждый день
- `WEEK` - Лимит трафика сбрасывается каждую неделю
- `MONTH` - Лимит трафика сбрасывается каждый месяц (по умолчанию)
- `NO_RESET` - Лимит трафика никогда не сбрасывается

## Платежные системы

### YooKassa
```bash
YOOKASA_ENABLED=true
YOOKASA_SHOP_ID=your_id
YOOKASA_SECRET_KEY=your_key
YOOKASA_EMAIL=your_email@example.com
YOOKASA_URL=https://payment.yandex.net
```

### CryptoPay
```bash
CRYPTO_PAY_ENABLED=true
CRYPTO_PAY_TOKEN=your_token
CRYPTO_PAY_URL=https://pay.crypt.bot
```

### Telegram Stars
```bash
TELEGRAM_STARS_ENABLED=true
REQUIRE_PAID_PURCHASE_FOR_STARS=false
```

### Tribute
```bash
TRIBUTE_WEBHOOK_URL=/tribute/webhook
TRIBUTE_API_KEY=your_key
TRIBUTE_PAYMENT_URL=https://t.me/tribute/app?startapp=...
HEALTH_CHECK_PORT=8080
```

## Мой налог (ФНС)

Автоматическая выдача чеков самозанятого при оплате через YooKassa. Подробнее — [Мой налог (ФНС)](/ru/features/moynalog).

```bash
MOYNALOG_ENABLED=false
MOYNALOG_USERNAME=
MOYNALOG_PASSWORD=
MOYNALOG_URL=https://lknpd.nalog.ru/api/v1
# Прокси для API (опционально): http://, https://, socks5://
MOYNALOG_PROXY_URL=
```

## Интерфейс и ссылки

```bash
DEFAULT_LANGUAGE=ru
IS_WEB_APP_LINK=false
MINI_APP_URL=https://example.com/app
SERVER_STATUS_URL=https://status.example.com
SUPPORT_URL=https://t.me/support
FEEDBACK_URL=https://example.com/feedback
CHANNEL_URL=https://t.me/channel
TOS_URL=https://example.com/tos
```

## Картинка меню {#menu-photo}

Начиная с **5.1.0**, публичный бот поддерживает одну общую картинку для `/start`, `/connect` и разделов, открываемых inline-кнопками. При переходах меняются подпись и клавиатура того же сообщения: картинка, ID сообщения и его закрепление сохраняются.

### Настройка файла

1. Поместите свой JPEG или PNG в `assets/menu.jpg` рядом с `docker-compose.yaml`. Каталог должен быть доступен для чтения и прохода, а файл — для чтения пользователю контейнера с UID 1000 (например, права `755` для каталога и `644` для картинки).
2. В существующий список `volumes` сервиса `bot` добавьте монтирование каталога. Не удаляйте монтирование переводов и другие настройки:

```yaml
services:
  bot:
    volumes:
      - ./translations:/translations
      - ./assets:/assets:ro
```

3. В `.env` укажите путь **внутри контейнера**, а не путь на хосте:

```dotenv
MENU_PHOTO_PATH=/assets/menu.jpg
```

4. Для уже работающей установки примените изменение окружения и mount пересозданием контейнера:

```bash
docker compose up -d --no-deps --force-recreate bot
```

Для новой установки выполните обычный `docker compose up -d`. Имена сервисов здесь соответствуют `docker-compose.yaml` из репозитория; если вы переименовали сервис бота, подставьте своё имя.

Без Docker укажите локальный путь, например `MENU_PHOTO_PATH=./assets/menu.jpg`. Пустое значение `MENU_PHOTO_PATH=` сохраняет текстовое меню. Старые текстовые сообщения остаются рабочими; новое меню с фото появится после `/start`.

### Кеширование и замена картинки

- При первой отправке меню бот загружает картинку в Telegram, затем повторно использует её `file_id` без загрузки файла в каждом сообщении.
- `file_id`, хеш содержимого и ID бота сохраняются в PostgreSQL. Кеш не имеет TTL и переживает перезапуск при сохранённой БД; у разных ботов отдельные записи.
- Чтобы заменить фото, обновите исходный файл и перезапустите бота. Изменение содержимого обнаруживается по хешу, новая версия загружается при следующей отправке. В ранее отправленных меню остаётся прежнее фото — используйте `/start` для нового.
- Если Telegram отклонит кешированный ID, работающий бот попробует повторно загрузить источник из памяти. Сохраняйте каталог `assets` и включайте его в резервные копии вместе с БД.
- Если после перезапуска исходный файл отсутствует, но в БД есть кеш для того же пути, бот продолжит использовать `file_id`. Если этот ID также перестанет работать, восстановите файл и перезапустите бота. Отсутствующий файл без кеша или некорректная картинка приводят к понятной ошибке запуска.

::: warning Ограничения Telegram
JPEG/PNG — не больше **10 МБ**. Сумма ширины и высоты — не больше **10000 пикселей**, соотношение сторон — не больше **20:1**. Подписи всех разделов, включая изменённые переводы и данные подключения, должны укладываться в **1024 символа после обработки HTML**. Бот не обрезает текст автоматически.
:::

### Закрепление главного меню

Каждый `/start` отправляет новое меню и закрепляет его без уведомления, а затем открепляет ранее отслеживаемые меню этого бота в том же чате. Это работает и без картинки. Чужие и вручную закреплённые посторонние сообщения не затрагиваются.

Если отправка или закрепление нового меню не удалось, прежнее закрепление остаётся. Нехватка прав на закрепление не мешает пользоваться уже отправленным меню; в группе нужны соответствующие права администратора для бота. Неудачные открепления сохраняются в БД и повторяются при следующем `/start`, в том числе после перезапуска. На один токен предполагается один запущенный polling-экземпляр.

Команда `/connect` использует ту же картинку, но не меняет закрепление `/start`. После оплаты меню больше не удаляется: обновляются кнопки, изображение и закрепление остаются.

Подробнее: [обновление и резервные копии](/ru/admin/maintenance#update-5-1-0), [диагностика картинки и закрепления](/ru/troubleshooting/issues#menu-photo).

## Управление пользователями

```bash
BLOCKED_TELEGRAM_IDS=123456789,987654321
WHITELISTED_TELEGRAM_IDS=111111111,222222222
```

## Конфигурация БД

```bash
POSTGRES_USER=remnawave
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=remnawave
```

## Конфигурация сервера

```bash
HEALTH_CHECK_PORT=8080
REMNAWAVE_MODE=remote
```

## Заголовки API Remnawave

Настройте пользовательские заголовки для всех запросов к API Remnawave:

```bash
REMNAWAVE_HEADERS=X-Api-Key:your_api_key;X-Custom-Header:value
```

**Формат:** `key1:value1;key2:value2;key3:value3`

**Примеры:**

```bash
# С API Key
REMNAWAVE_HEADERS=X-Api-Key:your_secret_key

# Несколько заголовков
REMNAWAVE_HEADERS=X-Api-Key:secret123;X-Custom-Header:custom_value

# С авторизацией
REMNAWAVE_HEADERS=Authorization:Bearer token123;X-Request-ID:12345

# Cookie для Remnawave Reverse-Proxy (egames)
# Получить cookie: https://wiki.egam.es/ru/troubleshooting/common-issues/#утерянный-cookie-пути-к-панели
REMNAWAVE_HEADERS=Cookie:rEmnaprx=aBCDefgh
```

**Возможности:**
- Поддержка неограниченного количества пользовательских заголовков
- Заголовки применяются ко всем запросам к API Remnawave
- Пробелы вокруг ключей и значений автоматически удаляются
- Некорректные заголовки пропускаются
- Количество загруженных заголовков логируется при запуске

**Миграция с X_API_KEY:**

Если вы использовали переменную `X_API_KEY`, выполните миграцию на `REMNAWAVE_HEADERS`:

```bash
# Старая конфигурация
X_API_KEY=your_key

# Новая конфигурация
REMNAWAVE_HEADERS=X-Api-Key:your_key
```
