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

```
