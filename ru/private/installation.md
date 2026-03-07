---
title: Установка
description: Пошаговая инструкция по установке приватной версии Remnawave Telegram Shop Bot
icon: download
---


::: warning Внимание
**Требуется бекап**
Перед любыми действиями ниже обязательно **[сделайте бекап базы данных](/ru/private/backup/)** и конфигурационных файлов.
:::


## Требования

- Linux сервер или VPS
- Установленные Docker и Docker Compose
- Доменное имя с SSL-сертификатом
- Реверс-прокси (Caddy или Nginx)
- Установленная и настроенная панель Remnawave
- Файл Docker образа приватной версии (`.tar`)

---

## Варианты установки

Выберите способ установки в зависимости от вашей конфигурации:

<Tabs>
<TabPanel title="На сервере с Remnawave">

Используйте этот способ, если бот будет работать на **том же сервере**, что и панель Remnawave. Бот подключается к Remnawave через внутреннюю Docker-сеть.

**Шаг 1: Создайте директорию проекта**

```bash
mkdir -p /opt/rwp-shop
cd /opt/rwp-shop
```

**Шаг 2: Загрузите Docker образ**

Скачайте файл образа с [me.remnawavebot.dev/releases](https://me.remnawavebot.dev/releases).

```bash
docker load -i rwp_shop-<VERSION>.tar
```

**Шаг 3: Создайте необходимые директории**

```bash
mkdir -p uploads translations
sudo chmod -R 777 uploads translations
```

**Шаг 4: Скачайте файлы переводов**

Скачайте `en.json` и `ru.json` из приватного канала и поместите в папку `translations`:

```bash
# Скопируйте скачанные файлы в директорию translations
cp en.json ru.json ./translations/
```

**Шаг 5: Создайте конфигурацию Docker Compose**

```bash
nano compose.yaml
```

```yaml
name: rwp_shop

services:
  bot:
    image: rwp_shop:<VERSION>
    container_name: rwp_shop
    restart: unless-stopped
    ports:
      - "127.0.0.1:9912:8080"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./translations:/translations
      - ./uploads:/uploads
      - /etc/machine-id:/etc/machine-id:ro
    environment:
      - REMNAWAVE_URL=${REMNAWAVE_URL}
      - REMNAWAVE_TOKEN=${REMNAWAVE_TOKEN}
      - TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
      - ADMIN_TELEGRAM_ID=${ADMIN_TELEGRAM_ID}
      - DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable
      - BOT_ADMIN_URL=${BOT_ADMIN_URL}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - ACCESS_LOG_ENABLED=${ACCESS_LOG_ENABLED:-true}
      - ACCESS_LOG_PATH=${ACCESS_LOG_PATH:-}
      - LICENSE_KEY=${LICENSE_KEY:-}
      - REMNAWAVE_HEADERS=${REMNAWAVE_HEADERS:-}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - remnawave-network

  db:
    image: postgres:17-alpine
    container_name: rwp_shop_db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - TZ=UTC
    ports:
      - "127.0.0.1:9999:5432"
    volumes:
      - rwp_shop_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 3s
      timeout: 10s
      retries: 3
    networks:
      - remnawave-network

volumes:
  rwp_shop_db_data:

networks:
  remnawave-network:
    name: remnawave-network
    external: true
```

::: info Примечание
Сеть `remnawave-network` создаётся панелью Remnawave. Параметр `external: true` подключает к существующей сети.
:::

**Шаг 6: Создайте файл окружения**

```bash
nano .env
```

```bash
# Подключение к Remnawave (внутренняя Docker-сеть)
REMNAWAVE_URL=http://remnawave:3000
REMNAWAVE_TOKEN=ваш_api_токен_remnawave

# Telegram
TELEGRAM_TOKEN=ваш_токен_telegram_бота
ADMIN_TELEGRAM_ID=123456789,987654321

# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# URL админ-панели (требуется HTTPS)
BOT_ADMIN_URL=https://bot.example.com

# Логирование (опционально)
# LOG_LEVEL=info
# ACCESS_LOG_ENABLED=true
# ACCESS_LOG_PATH=

LICENSE_KEY=

# JWT секрет для авторизации в панели бота
JWT_SECRET=

# Пользовательские заголовки для Remnawave API (опционально)
# REMNAWAVE_HEADERS=
```

::: tip Совет
`REMNAWAVE_URL=http://remnawave:3000` использует имя контейнера из Docker-сети Remnawave.
:::

::: tip Совет
**Remnawave Reverse-Proxy (egames)**
Если вы используете [Remnawave Reverse-Proxy от egames](https://wiki.egam.es/), добавьте cookie для авторизации:
```bash
REMNAWAVE_HEADERS=Cookie:rEmnaprx=aBCDefgh
```
Как получить cookie: [инструкция](https://wiki.egam.es/ru/troubleshooting/common-issues/#утерянный-cookie-пути-к-панели)
:::

::: info Примечание
**Переменные логирования**
- `LOG_LEVEL` — уровень логирования (debug, info, warn, error)
- `ACCESS_LOG_ENABLED` — включить/выключить access-логи (true/false)
- `ACCESS_LOG_PATH` — путь к файлу логов; если не указан, логи выводятся в консоль
:::

::: warning Внимание
**Лицензионный ключ**
`LICENSE_KEY` обязателен для работы бота. Вы можете получить его в личном кабинете на сервере лицензий после покупки подписки.
:::

::: warning Внимание
**JWT Secret**
`JWT_SECRET` обязателен для авторизации в панели бота. Сгенерируйте надёжный секрет командой:
```bash
openssl rand -hex 32
```
Скопируйте результат и вставьте как значение `JWT_SECRET` в `.env` файл.
:::

**Шаг 7: Добавьте volume machine-id для лицензии**

Лицензия привязана к уникальному идентификатору вашего сервера. Добавьте этот volume в `compose.yaml` в секцию `bot`:

```yaml
volumes:
  - ./translations:/translations
  - ./uploads:/uploads
  - /etc/machine-id:/etc/machine-id:ro
```

::: info Примечание
Это гарантирует, что лицензия останется действительной даже при пересоздании контейнера.
:::

**Шаг 8: Запустите бота**

```bash
docker compose up -d
```

</TabPanel>
<TabPanel title="На отдельном сервере">

Используйте этот способ, если бот будет работать на **другом сервере**, отличном от панели Remnawave. Бот подключается к Remnawave через внешний HTTPS URL.

**Шаг 1: Создайте директорию проекта**

```bash
mkdir -p /opt/rwp-shop
cd /opt/rwp-shop
```

**Шаг 2: Загрузите Docker образ**

Скачайте файл образа с [me.remnawavebot.dev/releases](https://me.remnawavebot.dev/releases).

```bash
docker load -i rwp_shop-<VERSION>.tar
```

**Шаг 3: Создайте необходимые директории**

```bash
mkdir -p uploads translations
sudo chmod -R 777 uploads translations
```

**Шаг 4: Скачайте файлы переводов**

Скачайте `en.json` и `ru.json` из приватного канала и поместите в папку `translations`:

```bash
# Скопируйте скачанные файлы в директорию translations
cp en.json ru.json ./translations/
```

**Шаг 5: Создайте конфигурацию Docker Compose**

```bash
nano compose.yaml
```

```yaml
name: rwp_shop

services:
  bot:
    image: rwp_shop:<VERSION>
    container_name: rwp_shop
    restart: unless-stopped
    ports:
      - "127.0.0.1:9912:8080"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./translations:/translations
      - ./uploads:/uploads
      - /etc/machine-id:/etc/machine-id:ro
    environment:
      - REMNAWAVE_URL=${REMNAWAVE_URL}
      - REMNAWAVE_TOKEN=${REMNAWAVE_TOKEN}
      - TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
      - ADMIN_TELEGRAM_ID=${ADMIN_TELEGRAM_ID}
      - DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable
      - BOT_ADMIN_URL=${BOT_ADMIN_URL}
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - ACCESS_LOG_ENABLED=${ACCESS_LOG_ENABLED:-true}
      - ACCESS_LOG_PATH=${ACCESS_LOG_PATH:-}
      - LICENSE_KEY=${LICENSE_KEY:-}
      - REMNAWAVE_HEADERS=${REMNAWAVE_HEADERS:-}
      - JWT_SECRET=${JWT_SECRET}

  db:
    image: postgres:17-alpine
    container_name: rwp_shop_db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - TZ=UTC
    ports:
      - "127.0.0.1:9999:5432"
    volumes:
      - rwp_shop_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 3s
      timeout: 10s
      retries: 3

volumes:
  rwp_shop_db_data:
```

**Шаг 6: Создайте файл окружения**

```bash
nano .env
```

```bash
# Подключение к Remnawave (внешний HTTPS URL)
REMNAWAVE_URL=https://panel.example.com
REMNAWAVE_TOKEN=ваш_api_токен_remnawave

# Telegram
TELEGRAM_TOKEN=ваш_токен_telegram_бота
ADMIN_TELEGRAM_ID=123456789,987654321

# База данных
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

# URL админ-панели (требуется HTTPS)
BOT_ADMIN_URL=https://bot.example.com

# Логирование (опционально)
# LOG_LEVEL=info
# ACCESS_LOG_ENABLED=true
# ACCESS_LOG_PATH=

LICENSE_KEY=

# JWT секрет для авторизации в панели бота
JWT_SECRET=

# Пользовательские заголовки для Remnawave API (опционально)
# REMNAWAVE_HEADERS=
```

::: warning Внимание
`REMNAWAVE_URL` должен быть **внешним HTTPS URL** вашей панели Remnawave (например, `https://panel.example.com`).
:::

::: tip Совет
**Remnawave Reverse-Proxy (egames)**
Если вы используете [Remnawave Reverse-Proxy от egames](https://wiki.egam.es/), добавьте cookie для авторизации:
```bash
REMNAWAVE_HEADERS=Cookie:rEmnaprx=aBCDefgh
```
Как получить cookie: [инструкция](https://wiki.egam.es/ru/troubleshooting/common-issues/#утерянный-cookie-пути-к-панели)
:::

::: info Примечание
**Переменные логирования**
- `LOG_LEVEL` — уровень логирования (debug, info, warn, error)
- `ACCESS_LOG_ENABLED` — включить/выключить access-логи (true/false)
- `ACCESS_LOG_PATH` — путь к файлу логов; если не указан, логи выводятся в консоль
:::

::: warning Внимание
**Лицензионный ключ**
`LICENSE_KEY` обязателен для работы бота. Вы можете получить его в личном кабинете на сервере лицензий после покупки подписки.
:::

::: warning Внимание
**JWT Secret**
`JWT_SECRET` обязателен для авторизации в панели бота. Сгенерируйте надёжный секрет командой:
```bash
openssl rand -hex 32
```
Скопируйте результат и вставьте как значение `JWT_SECRET` в `.env` файл.
:::

**Шаг 7: Добавьте volume machine-id для лицензии**

Лицензия привязана к уникальному идентификатору вашего сервера. Добавьте этот volume в `compose.yaml` в секцию `bot`:

```yaml
volumes:
  - ./translations:/translations
  - ./uploads:/uploads
  - /etc/machine-id:/etc/machine-id:ro
```

::: info Примечание
Это гарантирует, что лицензия останется действительной даже при пересоздании контейнера.
:::

**Шаг 8: Запустите бота**

```bash
docker compose up -d
```

</TabPanel>
</Tabs>

---

## Настройка реверс-прокси

::: info Примечание
**Кеширование**
Конфигурации ниже включают правила кеширования для защиты Mini App от ошибок загрузки после обновлений:
- HTML-файлы не кешируются (всегда актуальная версия)
- Статические ресурсы `/assets/` кешируются на год (имеют уникальные хеши)
:::


::: warning Внимание
**Для отдельного сервера**
Примеры ниже предназначены для **системной установки** Caddy/Nginx (через systemd). Если вы используете Caddy/Nginx в Docker-контейнере, вам нужно либо объединить их в одну Docker-сеть и скрыть порты, либо использовать `host.docker.internal` вместо `127.0.0.1`.
:::


::: code-group

```txt [Caddy]
(security_headers) {
    header * {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        -X-Frame-Options
        Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://webk.telegram.org https://webz.telegram.org https://*.telegram.org"
        X-XSS-Protection "1; mode=block"
        -Server
        Referrer-Policy strict-origin-when-cross-origin
        X-Robots-Tag "noindex, nofollow"
    }
}

bot.example.com {
    import security_headers

    @html path_regexp \.html$|^/$
    header @html Cache-Control "no-cache, no-store, must-revalidate"

    @assets_js path /assets/*.js
    header @assets_js Cache-Control "no-cache, no-store, must-revalidate"

    @immutable {
        path /assets/*
        not path *.js
    }
    header @immutable Cache-Control "public, max-age=31536000, immutable"

    reverse_proxy 127.0.0.1:9912
}
```

```nginx [Nginx]
server {
    listen 80;
    server_name bot.example.com;
    add_header Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://webk.telegram.org https://webz.telegram.org https://*.telegram.org" always;
    proxy_hide_header X-Frame-Options;

    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* ^/assets/.*\.js$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 50M;
    }
}
```

:::

**Перезапуск:**

::: code-group

```bash [Caddy]
sudo systemctl reload caddy
```

```bash [Nginx]
sudo ln -s /etc/nginx/sites-available/bot.example.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

:::


---

## Проверка установки

```bash
docker compose logs -f bot
```

---

Нужны access-логи с ротацией? Смотрите [Настройка access-логов](/ru/private/access-logs/).

Нужны прямые ссылки? Смотрите [Вход через браузер (direct links)](/ru/private/direct-links/).

---

Нужно S3 хранилище? Смотрите [Настройка S3](/ru/private/s3/).

## Справка по портам

| Сервис | Внутренний порт | Рекомендуемый внешний |
|--------|-----------------|----------------------|
| Bot HTTP | 8080 | 9912 или 12345 |
| PostgreSQL | 5432 | - |

---

## После установки

После установки:

1. Откройте `https://bot.example.com` в Telegram Mini App
2. Войдите с вашим админским Telegram-аккаунтом
3. Настройте параметры в админ-панели:
   - Платёжные системы
   - Тарифные планы
   - Брендинг
   - Роли и разрешения

Все остальные настройки управляются через **UI админ-панели**.

---

## Полезные советы

::: tip Совет
**Возникли проблемы?**
Смотрите страницу [Устранение неполадок](/ru/private/troubleshooting/) для решения распространённых проблем.
:::


### Добавление кнопки меню в Telegram

Чтобы добавить кнопку "Open" в Telegram, которая открывает личный кабинет вместо набора команд:

1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Перейдите в **Bot Settings** → **Menu Button**
4. Укажите URL вашего дашборда:
   ```
   https://bot.example.com
   ```

Это добавит кнопку в чате Telegram, которая открывает Mini App с личным кабинетом пользователя.

### Настройка кнопки Mini App

Чтобы добавить Mini App как кнопку, которая появляется при нажатии на меню или команде `/start`:

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newapp`
3. Выберите вашего бота из списка
4. Следуйте инструкциям:
   - **Title**: Введите название приложения (например, "Личный кабинет")
   - **Description**: Краткое описание приложения
   - **Photo**: Загрузите изображение 640x360 для превью
   - **GIF** (опционально): Загрузите демо-анимацию
   - **Web App URL**: Введите URL вашего дашборда (например, `https://bot.example.com`)
5. После создания отправьте `/myapps` для управления Mini Apps

::: tip Совет
Вы также можете использовать `/setmenubutton` для настройки кнопки меню напрямую без создания полной записи Mini App.
:::

