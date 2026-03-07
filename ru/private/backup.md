---
title: Резервное копирование
description: Инструкция по созданию и восстановлению резервных копий базы данных
icon: hard-drive
---


## Создание резервной копии


**Шаг 1: Перейдите в директорию проекта**

```bash
  cd /opt/rwp-shop
  ```

  **Шаг 2: Создайте бекап базы данных**

```bash
  docker compose exec db pg_dump -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql
  ```


::: tip Совет
**Имя файла**
Команда автоматически добавляет дату и время в имя файла, например: `backup_20251227_141530.sql`
:::


---

## Восстановление из резервной копии

::: warning Внимание
**Внимание**
Восстановление полностью заменит текущие данные в базе. Убедитесь, что вы восстанавливаете правильный бекап.
:::


**Шаг 3: Остановите бота**

```bash
  docker compose stop bot
  ```

  **Шаг 4: Очистите текущую базу данных**

```bash
  docker compose exec db psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  ```

  **Шаг 5: Восстановите данные из бекапа**

```bash
  docker compose exec -T db psql -U postgres postgres < backup_20251227_141530.sql
  ```

  ::: info Примечание
Замените `backup_20251227_141530.sql` на имя вашего файла бекапа.
:::

  **Шаг 6: Запустите бота**

```bash
  docker compose up -d
  ```


---

## Автоматическое резервное копирование

Для автоматического создания бекапов по расписанию:


**Шаг 7: Создайте директорию для бекапов**

```bash
  mkdir -p /opt/rwp-shop/backups
  ```

  **Шаг 8: Создайте скрипт бекапа**

```bash
  nano /opt/rwp-shop/backup.sh
  ```

  ```bash
  #!/bin/bash

  BACKUP_DIR="/opt/rwp-shop/backups"
  PROJECT_DIR="/opt/rwp-shop"
  RETENTION_DAYS=14

  cd "$PROJECT_DIR"

  # Создание бекапа
  docker compose exec -T db pg_dump -U postgres postgres > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

  # Удаление старых бекапов
  find "$BACKUP_DIR" -name "backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
  ```

  **Шаг 9: Сделайте скрипт исполняемым**

```bash
  chmod +x /opt/rwp-shop/backup.sh
  ```

  **Шаг 10: Добавьте задачу в cron**

```bash
  crontab -e
  ```

  Добавьте строку для ежедневного бекапа в 3:00:
  ```txt
  0 3 * * * /opt/rwp-shop/backup.sh
  ```


| Параметр | Описание |
|----------|----------|
| `BACKUP_DIR` | Директория для хранения бекапов |
| `PROJECT_DIR` | Директория проекта с compose.yaml |
| `RETENTION_DAYS` | Количество дней хранения бекапов |

---

## Проверка бекапа

Для проверки целостности бекапа без восстановления:

```bash
# Проверка синтаксиса SQL
head -100 backup_20251227_141530.sql

# Проверка размера файла
ls -lh backup_20251227_141530.sql
```

::: tip Совет
Регулярно проверяйте, что бекапы создаются и имеют ненулевой размер.
:::

