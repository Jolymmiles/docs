---
title: Настройка CryptoPay
description: Настройте CryptoPay для платежей криптовалютой
icon: bitcoin-sign
---


CryptoPay позволяет принимать платежи криптовалютой (Bitcoin, Ethereum, USDT и другие) прямо через Telegram.

## Поддерживаемые криптовалюты

- Bitcoin (BTC)
- Ethereum (ETH)
- TON Coin (TON)
- USDT (Tether)
- Плюс 10+ других альткойнов

## Требования

- Аккаунт Telegram
- Торговый аккаунт CryptoPay
- Сгенерированный API токен

## Инструкции по настройке


**Шаг 1: Создайте аккаунт CryptoPay**

- Откройте [@CryptoBot](https://t.me/CryptoBot) в Telegram
  - Запустите бота
  - Перейдите в раздел "Merchant"
  - Примите условия

  **Шаг 2: Сгенерируйте API токен**

- В панели CryptoPay для торговцев
  - Перейдите в "API Settings"
  - Создайте новый API токен
  - Скопируйте токен

  **Шаг 3: Настройте переменные окружения**

```bash
  CRYPTO_PAY_ENABLED=true
  CRYPTO_PAY_TOKEN=ваш_токен_здесь
  CRYPTO_PAY_URL=https://pay.crypt.bot
  ```

  **Шаг 4: Перезагрузите бота**

```bash
  docker compose down && docker compose up -d
  ```

  **Шаг 5: Протестируйте платеж**

- Отправьте `/start` боту
  - Выберите подписку
  - Выберите CryptoPay
  - Завершите тестовую транзакцию


## Переменные конфигурации

| Переменная | Описание |
|----------|-------------|
| `CRYPTO_PAY_ENABLED` | Включить/отключить CryptoPay |
| `CRYPTO_PAY_TOKEN` | Ваш API токен |
| `CRYPTO_PAY_URL` | Endpoint API |

## Поддержка

- **Справка CryptoPay**: [@CryptoBot](https://t.me/CryptoBot)
- **API документация**: Доступна в панели торговца
- **Сообщество**: Telegram крипто сообщества
