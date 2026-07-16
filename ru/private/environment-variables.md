---
title: Переменные окружения
description: Полный справочник переменных окружения приватной версии
icon: sliders
---

Все переменные окружения задаются в `.env` и передаются в контейнер бота через секцию `environment` в `compose.yaml`. Переменные, отмеченные как **обязательные**, необходимы для запуска бота.

::: info Примечание
Платёжные системы, фичи-флаги, триалы, брендинг и другие настройки управляются через **Admin Panel UI** и хранятся в базе данных — здесь они не описаны.
:::


## Обязательные переменные

| Переменная | Описание | Пример |
|------------|----------|--------|
| `TELEGRAM_TOKEN` | Токен Telegram Bot API | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgres://user:pass@db:5432/postgres?sslmode=disable` |
| `BOT_ADMIN_URL` | Публичный HTTPS URL админ-панели | `https://bot.example.com` |
| `REMNAWAVE_URL` | URL API Remnawave | `http://remnawave:3000` или `https://panel.example.com` |
| `REMNAWAVE_TOKEN` | Токен API Remnawave | `eyJhbG...` |
| `ADMIN_ID` | Идентификаторы админов (через запятую) | `123456789,telegram:987654321,xxxxxxxx-xxxx-...` |
| `LICENSE_KEY` | Лицензионный ключ из личного кабинета | `LIC-XXXX-XXXX` |
| `JWT_SECRET` | Секрет для JWT-аутентификации панели | `openssl rand -hex 32` |

### Формат ADMIN_ID

`ADMIN_ID` поддерживает три формата, которые можно комбинировать через запятую:

| Формат | Пример | Описание |
|--------|--------|----------|
| Число | `123456789` | Telegram ID пользователя (обратная совместимость) |
| Префикс `telegram:` | `telegram:123456789` | Явный Telegram ID |
| UUID | `550e8400-e29b-41d4-a716-446655440000` | UUID клиента из базы данных |

```bash
# Один админ
ADMIN_ID=123456789

# Несколько админов, разные форматы
ADMIN_ID=123456789,telegram:987654321,550e8400-e29b-41d4-a716-446655440000
```

::: warning Внимание
`ADMIN_TELEGRAM_ID` устарела. Используйте `ADMIN_ID` — она поддерживает UUID и формат `telegram:ID` в дополнение к числовым Telegram ID.
:::


## Необязательные переменные

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `BOT_WORKERS` | Количество воркеров бота | `3` |
| `DEFAULT_LANGUAGE` | Язык интерфейса по умолчанию | `ru` |
| `HEALTH_CHECK_PORT` | HTTP-порт для проверки здоровья | `8080` |
| `REMNAWAVE_MODE` | Режим подключения: `remote` или `local` | `remote` |
| `TELEGRAM_PROXY_URL` | Прокси для Telegram Bot API (HTTP, HTTPS, SOCKS5) | — |
| `TELEGRAM_API_URL` | Адрес собственного сервера [telegram-bot-api](/ru/private/telegram-local-api). Пусто — `https://api.telegram.org` | — |
| `MOYNALOG_PROXY_URL` | Прокси для API «Мой налог» (lknpd.nalog.ru) (HTTP, HTTPS, SOCKS5) | — |

## Пользователь для модерации приложения {#review-user}

Для проверки приложения в App Store или Google Play можно задать один email с постоянным кодом входа. Такой пользователь проходит вход без доставки кода через SMTP и может создать учётную запись при первом входе.

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `REVIEW_USER_EMAIL` | Email проверяющего пользователя | — |
| `REVIEW_USER_OTP` | Постоянный одноразовый код: ровно 6 цифр | — |

Укажите **обе** переменные в `.env` и перезапустите сервис:

```bash
REVIEW_USER_EMAIL=reviewer@example.com
REVIEW_USER_OTP=123456
```

::: warning Внимание
Используйте отдельный email, который не принадлежит сотруднику или клиенту: для него будет действовать постоянный код. Не публикуйте этот код и не передавайте его за пределы процесса модерации. Чтобы отключить вход, удалите **обе** переменные и перезапустите сервис.
:::

::: tip Совет
Для работы сценария в админ-панели должен быть включён вход по email. Ограничения разрешённых доменов и настройка SMTP для этого единственного email не применяются.
:::

### Прокси для Telegram

Если Telegram API недоступен напрямую, укажите прокси-сервер:

```bash
# SOCKS5
TELEGRAM_PROXY_URL=socks5://user:password@proxy.example.com:1080

# SOCKS5 без авторизации
TELEGRAM_PROXY_URL=socks5://proxy.example.com:1080

# HTTP прокси
TELEGRAM_PROXY_URL=http://proxy.example.com:8080
```

::: tip Совет
Поддерживаются протоколы `http://`, `https://` и `socks5://`. Если переменная не задана, бот подключается к Telegram API напрямую.
:::

### Прокси для «Мой налог»

Если API ФНS `lknpd.nalog.ru` недоступен напрямую (например, заблокирован на сервере), направьте запросы интеграции «Мой налог» через прокси:

```bash
# SOCKS5
MOYNALOG_PROXY_URL=socks5://user:password@proxy.example.com:1080

# HTTP прокси
MOYNALOG_PROXY_URL=http://proxy.example.com:8080
```

::: tip Совет
Поддерживаются протоколы `http://`, `https://` и `socks5://`. Через этот же прокси идёт и healthcheck-проверка «Мой налог», поэтому статус в мониторинге совпадает с реальным сетевым путём. Если переменная не задана — подключение напрямую.
:::

## AI-поддержка и база знаний

Модель, API-ключ, язык ответов и правила AI-поддержки настраиваются в админ-панели. Переменные окружения нужны только для отдельной базы знаний (RAG) и, при необходимости, прокси-сервера.

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `AI_KB_DATABASE_URL` | Строка подключения к отдельной pgvector-базе знаний. Пусто — база знаний и поиск по ней отключены, AI-поддержка без RAG продолжает работать | — |
| `AI_KB_POSTGRES_USER` | Пользователь PostgreSQL контейнера `kb-db` из Compose | `kb` |
| `AI_KB_POSTGRES_PASSWORD` | Пароль PostgreSQL контейнера `kb-db` | `kb` |
| `AI_KB_POSTGRES_DB` | Имя базы данных контейнера `kb-db` | `kb` |
| `AI_PROXY_URL` | HTTP(S) или SOCKS5-прокси для запросов к AI-провайдеру и сервису эмбеддингов | — |

### Включение базы знаний

При стандартном `docker-compose.yaml` используется отдельный сервис `kb-db`. Добавьте в `.env`:

```bash
# Учётные данные отдельной базы знаний
AI_KB_POSTGRES_USER=kb
AI_KB_POSTGRES_PASSWORD=change_this_password
AI_KB_POSTGRES_DB=kb

# Адрес используется контейнером бота: kb-db — имя сервиса в Compose
AI_KB_DATABASE_URL=postgres://kb:change_this_password@kb-db:5432/kb?sslmode=disable
```

После изменения перезапустите сервисы. Затем откройте настройки AI-поддержки в админ-панели, включите базу знаний и создайте или импортируйте статьи.

::: warning Внимание
Не используйте `localhost` в `AI_KB_DATABASE_URL`, если бот запущен в Docker: внутри контейнера `localhost` указывает на сам контейнер бота. Используйте имя сервиса `kb-db`.
:::

### Прокси для AI-провайдера

Если OpenRouter, OpenAI или другой AI-провайдер недоступен с сервера напрямую, направьте запросы через прокси:

```bash
# HTTP(S)-прокси
AI_PROXY_URL=http://user:password@proxy.example.com:8080

# или SOCKS5
AI_PROXY_URL=socks5://user:password@proxy.example.com:1080
```

В стандартном `docker-compose.yaml` добавьте переменную в секцию `bot.environment`, чтобы она попала внутрь контейнера:

```yaml
- AI_PROXY_URL=${AI_PROXY_URL:-}
```

Если переменная не задана, запросы к AI-провайдеру выполняются напрямую.


## Заголовки Remnawave

Пользовательские заголовки, отправляемые с каждым запросом к API Remnawave. Формат: `ключ:значение;ключ:значение`.

```bash
# Один заголовок
REMNAWAVE_HEADERS=X-Api-Key:your_secret_key

# Несколько заголовков
REMNAWAVE_HEADERS=X-Api-Key:secret123;X-Custom-Header:custom_value

# Cookie для Remnawave Reverse-Proxy (egames)
REMNAWAVE_HEADERS=Cookie:rEmnaprx=aBCDefgh
```

::: tip Совет
Пробелы вокруг ключей и значений обрезаются автоматически. Некорректные пары игнорируются.
:::


## Логирование

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `LOG_LEVEL` | Уровень логирования: `debug`, `info`, `warn`, `error` | `info` |
| `ACCESS_LOG_ENABLED` | Включить HTTP access-логи (`true`/`false`) | `false` |
| `ACCESS_LOG_PATH` | Путь к файлу access-лога; пусто = вывод в консоль | — |

```bash
LOG_LEVEL=info
ACCESS_LOG_ENABLED=true
ACCESS_LOG_PATH=/var/log/rwp-shop/access.log
```

::: tip Совет
Настройка ротации логов описана в разделе [Access-логи с ротацией](/ru/private/access-logs/).
:::


## CORS

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `CORS_ALLOWED_ORIGINS` | Разрешённые источники через запятую | Fallback на `BOT_ADMIN_URL` |

```bash
# Один источник
CORS_ALLOWED_ORIGINS=https://bot.example.com

# Несколько источников
CORS_ALLOWED_ORIGINS=https://bot.example.com,https://admin.example.com
```

::: info Примечание
Если не заданы ни `CORS_ALLOWED_ORIGINS`, ни `BOT_ADMIN_URL`, CORS будет отклонять все кросс-доменные запросы.
:::


## S3 хранилище

| Переменная | Описание | По умолчанию |
|------------|----------|-------------|
| `S3_ENABLED` | Включить S3-совместимое хранилище (`true`/`false`) | `false` |
| `S3_ENDPOINT` | Эндпоинт S3 API | — |
| `S3_ACCESS_KEY` | Ключ доступа S3 | — |
| `S3_SECRET_KEY` | Секретный ключ S3 | — |
| `S3_PUBLIC_URL` | Публичный HTTPS URL для presigned-ссылок | — |
| `S3_BUCKET` | Имя родительского бакета (опционально) | — |
| `S3_REGION` | Регион S3 | `us-east-1` |
| `S3_FORCE_PATH_STYLE` | Адресация бакета: path-style (`endpoint/bucket/key`) включена по умолчанию; только точное значение `false` переключает на virtual-hosted style (`bucket.endpoint/key`) | `true` |

::: tip Совет
Подробная настройка S3, примеры провайдеров (RustFS, Cloudflare R2) и режим родительского бакета описаны в разделе [Настройка S3 хранилища](/ru/private/s3/).
:::


## Краткая справка

```bash
# === Обязательные ===
TELEGRAM_TOKEN=
DATABASE_URL=postgres://user:pass@db:5432/postgres?sslmode=disable
BOT_ADMIN_URL=https://bot.example.com
REMNAWAVE_URL=http://remnawave:3000
REMNAWAVE_TOKEN=
ADMIN_ID=123456789
LICENSE_KEY=
JWT_SECRET=

# === Необязательные ===
BOT_WORKERS=3
DEFAULT_LANGUAGE=ru
HEALTH_CHECK_PORT=8080
REMNAWAVE_MODE=remote
# REMNAWAVE_HEADERS=
# TELEGRAM_PROXY_URL=socks5://proxy:1080
# TELEGRAM_API_URL=http://telegram-bot-api:8081

# === Пользователь для модерации приложения ===
# REVIEW_USER_EMAIL=reviewer@example.com
# REVIEW_USER_OTP=123456

# === AI-поддержка и база знаний ===
# AI_KB_DATABASE_URL=postgres://kb:password@kb-db:5432/kb?sslmode=disable
# AI_KB_POSTGRES_USER=kb
# AI_KB_POSTGRES_PASSWORD=
# AI_KB_POSTGRES_DB=kb
# AI_PROXY_URL=socks5://proxy:1080

# === Логирование ===
LOG_LEVEL=info
ACCESS_LOG_ENABLED=false
# ACCESS_LOG_PATH=

# === CORS ===
# CORS_ALLOWED_ORIGINS=https://bot.example.com

# === S3 хранилище ===
# S3_ENABLED=false
# S3_ENDPOINT=
# S3_ACCESS_KEY=
# S3_SECRET_KEY=
# S3_PUBLIC_URL=
# S3_BUCKET=
# S3_REGION=us-east-1
# S3_FORCE_PATH_STYLE=true

```
