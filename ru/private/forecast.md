---
title: Прогнозирование (Prophet)
description: Подключение микросервиса прогноза прибыли на Prophet
icon: chart-line
---

Опциональный сервис прогноза на Prophet. Если не подключён — прогноз продолжает работать на встроенном движке.

## 1. `.env`

```bash
FORECAST_SERVICE_URL=http://forecast:8000
```

## 2. `docker-compose.yaml`

Добавьте сервис:

```yaml
forecast:
  image: rwp_shop_forecast:1.0.0
  container_name: rwp_shop_forecast
  restart: unless-stopped
  ports:
    - "127.0.0.1:8000:8000"
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2).status == 200 else 1)"]
    interval: 30s
    timeout: 5s
    retries: 3
    start_period: 60s
```

И прокиньте переменную в сервис бота:

```yaml
environment:
  - FORECAST_SERVICE_URL=${FORECAST_SERVICE_URL:-}
```

## 3. Запуск

```bash
docker compose up -d forecast
docker compose up -d --force-recreate <bot-service-name>
```
