---
title: Настройка access-логов с ротацией
description: Запись access-логов в файл с автоматической ротацией
icon: scroll
---

Используйте эту настройку, если нужно хранить access-логи на диске и автоматически ротировать их.

## Настройка


**Шаг 1: Создайте директорию для логов**

```bash
  mkdir -p logs
  sudo chmod 777 logs
  ```

  **Шаг 2: Добавьте volume в compose.yaml**

В секции `bot` добавьте:
  ```yaml
  volumes:
    - ./translations:/translations
    - ./uploads:/uploads
    - ./logs:/logs
  ```

  **Шаг 3: Укажите путь к логам в .env**

```bash
  ACCESS_LOG_PATH=/logs/access.log
  ```

  **Шаг 4: Перезапустите бота**

```bash
  docker compose up -d
  ```

  **Шаг 5: Установите logrotate**

(если не установлен)
  ```bash
  # Debian/Ubuntu
  sudo apt update && sudo apt install -y logrotate

  # CentOS/RHEL/Fedora
  sudo dnf install -y logrotate
  ```

  **Шаг 6: Создайте конфиг logrotate**

```bash
  sudo nano /etc/logrotate.d/rwp-shop
  ```

  ```txt
  /opt/rwp-shop/logs/access.log {
      daily
      rotate 14
      compress
      delaycompress
      missingok
      notifempty
      copytruncate
  }
  ```

  ::: info Примечание
Замените путь `/opt/rwp-shop/logs/access.log` на ваш фактический путь установки.
:::

  **Шаг 7: Проверьте конфигурацию**

```bash
  sudo logrotate -d /etc/logrotate.d/rwp-shop
  ```

  Флаг `-d` запускает в debug-режиме без реальной ротации.

  **Шаг 8: Тестовый запуск ротации**

```bash
  sudo logrotate -f /etc/logrotate.d/rwp-shop
  ```

  Флаг `-f` принудительно выполняет ротацию.


::: tip Совет
`copytruncate` позволяет ротировать логи без перезапуска контейнера — файл обрезается на месте после копирования.
:::


::: info Примечание
**Автоматический запуск**
Logrotate обычно запускается автоматически через cron или systemd timer (ежедневно). Проверить можно:
```bash
# Для systemd
systemctl status logrotate.timer

# Для cron
cat /etc/cron.daily/logrotate
```
:::


| Параметр | Описание |
|----------|----------|
| `daily` | Ротация раз в день |
| `rotate 14` | Хранить 14 архивов |
| `compress` | Сжимать архивы gzip |
| `delaycompress` | Сжимать со второго архива |
| `missingok` | Не ругаться если файла нет |
| `notifempty` | Не ротировать пустой файл |
| `copytruncate` | Копировать и обрезать без перезапуска |
