---
title: Обновление
description: Инструкция по обновлению приватной версии Remnawave Telegram Shop Bot
icon: arrow-up-right-dots
---


::: warning Внимание
**Требуется бекап**
Перед обновлением обязательно **[сделайте бекап базы данных](/ru/private/backup/)**.
:::


## Обновление до новой версии


**Шаг 1: Скачайте новый образ**

Скачайте новый файл образа с [me.remnawavebot.dev/releases](https://me.remnawavebot.dev/releases).

  **Шаг 2: Загрузите новый образ**

```bash
  docker load -i rwp_shop-<VERSION>.tar
  ```

  **Шаг 3: Обновите версию в compose.yaml**

Измените версию образа:
  ```yaml
  image: rwp_shop:<VERSION>
  ```

  **Шаг 4: Перезапустите бота**

```bash
  docker compose up -d
  ```


---

## Обновление с публичной версии

Если у вас уже установлена публичная версия:


**Шаг 5: Перейдите в директорию бота**

```bash
  cd /opt/remnawave-telegram-shop
  ```
  ::: info Примечание
Замените на ваш фактический путь установки бота, если он отличается.
:::

  **Шаг 6: Остановите текущего бота**

```bash
  docker compose down
  ```

  **Шаг 7: Загрузите новый образ**

```bash
  docker load -i rwp_shop-<VERSION>.tar
  ```

  **Шаг 8: Создайте директорию uploads**

```bash
  mkdir -p uploads
  sudo chmod -R 777 uploads
  ```

  **Шаг 9: Обновите docker-compose.yaml**

Измените образ и добавьте порты:
  ```yaml
  name: rwp_shop

  services:
    bot:
      image: rwp_shop:<VERSION>
      container_name: rwp_shop
      restart: unless-stopped
      ports:
        - "127.0.0.1:12345:8080"
      depends_on:
        db:
          condition: service_healthy
      volumes:
        - ./translations:/translations
        - ./uploads:/uploads
        - /etc/machine-id:/etc/machine-id:ro
  ```

  ::: info Примечание
Volume `/etc/machine-id` необходим для привязки лицензии. Он гарантирует, что лицензия останется действительной при пересоздании контейнера.
:::

  **Шаг 10: Добавьте лицензионный ключ и URL админки в .env**

```bash
  echo "LICENSE_KEY=your-license-key" >> .env
  echo "BOT_ADMIN_URL=https://bot.example.com" >> .env
  ```

  ::: warning Внимание
**Лицензионный ключ**
  `LICENSE_KEY` обязателен для работы бота. Вы можете получить его в личном кабинете на сервере лицензий после покупки подписки.
:::

  **Шаг 11: Настройте реверс-прокси**

Направьте `bot.example.com` на `127.0.0.1:12345` (см. [Настройка реверс-прокси](/ru/private/installation/#настройка-реверс-прокси))

  **Шаг 12: Запустите бота**

```bash
  docker compose up -d
  ```


---

## Проверка обновления

После обновления проверьте:

```bash
# Статус контейнеров
docker compose ps

# Логи бота
docker compose logs -f bot

# Версия образа
docker images | grep rwp_shop
```

::: tip Совет
**Возникли проблемы?**
Смотрите страницу [Устранение неполадок](/ru/private/troubleshooting/) для решения распространённых проблем.
:::

