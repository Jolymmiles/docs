---
title: Защита от L7-атак (CrowdSec)
description: Детект флуда, брутфорса и сканеров по access-логу бота и блокировка на уровне файрвола
icon: shield-halved
---

Бот пишет JSON access-лог с реальным адресом клиента. CrowdSec читает этот лог, по сценариям находит злоупотребляющие IP, а *bouncer* на хосте блокирует их в файрволе до того, как трафик дойдёт до реверс-прокси и бота.

Что это закрывает: флуд с одного адреса, перебор кодов на auth/OTP/промо-эндпоинтах, долбёжку публичного checkout, сканеры уязвимостей и адреса из общего блоклиста сообщества. Что не закрывает: распределённую атаку с тысяч адресов. От неё защищает CDN/WAF перед сервером, CrowdSec его дополняет.

::: warning Требуется версия с полем `client_ip`
Поле `client_ip` в access-логе появилось в релизе с интеграцией CrowdSec. На более старых версиях в логе есть только `remote` с адресом прокси, и бан по нему заблокирует сам прокси.
:::

## Как это устроено

| Компонент | Где | Роль |
|---|---|---|
| Access-лог | stdout контейнера `rwp_shop` | JSON-строка на каждый HTTP-запрос |
| Acquisition | контейнер `crowdsec` | читает лог контейнера через Docker socket |
| Парсер | контейнер `crowdsec` | раскладывает JSON в поля CrowdSec (`source_ip`, `http_status` и т.д.) |
| Сценарии | контейнер `crowdsec` | правила детекта, наши плюс коллекции из хаба |
| Whitelist | контейнер `crowdsec` | никогда не банить свои хосты |
| Исключения для флуда | контейнер `crowdsec` | CGNAT-диапазоны, к которым не применяются флуд-сценарии |
| Firewall bouncer | **хост** | применяет баны в nftables |

Адрес клиента бот определяет сам: заголовки `X-Forwarded-For`/`X-Real-IP` учитываются только если TCP-соединение пришло из `TRUSTED_PROXIES` (по умолчанию loopback и Docker-сети). Сырой адрес соединения тоже пишется в поле `remote`, но банить по нему нельзя.

## Предварительные условия

- `ACCESS_LOG_ENABLED=true` (значение по умолчанию) и пустой `ACCESS_LOG_PATH`, чтобы лог шёл в stdout контейнера. Если вы настроили [запись логов в файл](/ru/private/access-logs), в acquisition ниже замените источник `docker` на `file` с путём к файлу.
- Реверс-прокси передаёт адрес клиента. Nginx-конфиг из [установки](/ru/private/installation/#настройка-реверс-прокси) уже содержит `proxy_set_header X-Real-IP` и `X-Forwarded-For`; Caddy добавляет `X-Forwarded-For` сам.
- Если прокси стоит не на loopback и не в Docker-сети этого же хоста, задайте `TRUSTED_PROXIES` с его адресом или CIDR. Иначе все запросы будут приписаны прокси и ничего полезного забанено не будет.
- Контейнер бота называется `rwp_shop` (как в стандартном `compose.yaml`).

## Шаг 1: Файлы конфигурации

Создайте каталог `crowdsec` рядом с `compose.yaml` и положите в него файлы ниже.

::: details `crowdsec/acquis.yaml`
```yaml
# CrowdSec acquisition for rwp-shop.
# The bot writes its JSON access log to container stdout (ACCESS_LOG_ENABLED=true,
# ACCESS_LOG_PATH empty), so the engine reads it through the Docker socket.
source: docker
container_name:
  - rwp_shop
labels:
  type: rwp-shop
```
:::

::: details `crowdsec/parsers/rwp-shop-access.yaml`
```yaml
# Parses the JSON access log emitted by AccessLogMiddleware
# (backend/internal/http/server.go). Application logs share the same stdout but
# are plain text, so only JSON lines with msg=="request" pass the filter.
name: rwp-shop/access-log
description: "Parse rwp-shop JSON access log"
filter: >-
  evt.Parsed.program == 'rwp-shop' && evt.Line.Raw startsWith '{' &&
  evt.Line.Raw matches `"msg":\s*"request"`
onsuccess: next_stage
nodes:
  - statics:
      - parsed: json
        expression: UnmarshalJSON(evt.Line.Raw, evt.Unmarshaled, "rwp")
statics:
  - target: evt.StrTime
    expression: evt.Unmarshaled.rwp.time
  - meta: log_type
    value: http_access-log
  - meta: service
    value: http
  # client_ip is resolved by the app with TRUSTED_PROXIES awareness; "remote"
  # is the raw TCP peer (the reverse proxy) and must never be used for bans.
  - meta: source_ip
    expression: evt.Unmarshaled.rwp.client_ip
  - meta: http_verb
    expression: evt.Unmarshaled.rwp.method
  - meta: http_path
    expression: evt.Unmarshaled.rwp.path
  # JSON numbers decode as floats; hub scenarios compare http_status to
  # strings such as '404', so cast to an integer before stringification.
  - meta: http_status
    expression: string(int(evt.Unmarshaled.rwp.status))
  - meta: http_user_agent
    expression: evt.Unmarshaled.rwp.user_agent
  - parsed: verb
    expression: evt.Unmarshaled.rwp.method
  - parsed: request
    expression: evt.Unmarshaled.rwp.path
  - parsed: status
    expression: string(int(evt.Unmarshaled.rwp.status))
  - parsed: http_user_agent
    expression: evt.Unmarshaled.rwp.user_agent
  - parsed: duration_ms
    expression: string(int(evt.Unmarshaled.rwp.duration_ms))
```
:::

::: details `crowdsec/scenarios/rwp-shop-rate-limited.yaml`
```yaml
# An IP that keeps tripping the app's own admission limiter (HTTP 429) is
# hammering auth/OTP/promo endpoints. The app already refuses those requests;
# this moves the refusal to the firewall so the Go process stops paying for it.
type: leaky
name: rwp-shop/rate-limited-flood
description: "Repeated 429 responses from one IP"
filter: "evt.Meta.log_type == 'http_access-log' && evt.Meta.http_status == '429'"
groupby: evt.Meta.source_ip
capacity: 20
leakspeed: 30s
blackhole: 5m
labels:
  service: http
  type: bruteforce
  remediation: true
  confidence: 3
  spoofable: 0
  behavior: "http:bruteforce"
  label: "rwp-shop rate-limit flood"
```
:::

::: details `crowdsec/scenarios/rwp-shop-checkout-flood.yaml`
```yaml
# Public checkout endpoints trigger payment-provider work per
# request. A single client has no legitimate reason to call them in bursts.
type: leaky
name: rwp-shop/checkout-flood
description: "Burst on public checkout and payment endpoints"
filter: >
  evt.Meta.log_type == 'http_access-log' &&
  (evt.Meta.http_path startsWith '/api/public/subscriptions/' || evt.Meta.http_path startsWith '/pay/')
groupby: evt.Meta.source_ip
capacity: 40
leakspeed: 10s
blackhole: 5m
labels:
  service: http
  type: flood
  remediation: true
  confidence: 3
  spoofable: 0
  behavior: "http:scan"
  label: "rwp-shop checkout flood"
```
:::

::: details `crowdsec/scenarios/rwp-shop-api-flood.yaml`
```yaml
# Volumetric L7 flood on API routes from one IP. Static assets are excluded:
# an SPA cold load legitimately fetches dozens of files at once.
type: leaky
name: rwp-shop/api-flood
description: "High request rate on API routes from one IP"
filter: >
  evt.Meta.log_type == 'http_access-log' &&
  evt.Meta.http_path startsWith '/api/' &&
  not (evt.Meta.http_path startsWith '/api/health')
groupby: evt.Meta.source_ip
capacity: 150
leakspeed: 200ms
blackhole: 5m
labels:
  service: http
  type: flood
  remediation: true
  confidence: 2
  spoofable: 0
  behavior: "http:dos"
  label: "rwp-shop api flood"
```
:::

::: details `crowdsec/scenarios/rwp-shop-5xx-burst.yaml`
```yaml
# One IP steadily producing server errors is probing for a crashing input or
# exhausting a dependency (database, panel, payment provider). 502/503/504 are
# excluded: when the log comes from the reverse proxy they mean the bot itself
# was unavailable (restart, deploy), which every legitimate client sees at once.
type: leaky
name: rwp-shop/server-error-burst
description: "Burst of 5xx responses from one IP"
filter: >
  evt.Meta.log_type == 'http_access-log' &&
  evt.Meta.http_status startsWith '5' &&
  evt.Meta.http_status not in ['502', '503', '504']
groupby: evt.Meta.source_ip
capacity: 15
leakspeed: 10s
blackhole: 5m
labels:
  service: http
  type: exploit
  remediation: true
  confidence: 2
  spoofable: 0
  behavior: "http:exploit"
  label: "rwp-shop 5xx burst"
```
:::

::: details `crowdsec/rwp-shop-flood-exemptions.yaml`
```yaml
# Postoverflow that exempts carrier-grade NAT ranges from the rwp-shop *flood*
# scenarios only. Mobile carriers put thousands of Telegram users behind one
# address, so per-IP rate thresholds cannot tell a flood from a busy carrier.
# Probing, CVE and brute-force scenarios still apply to these ranges.
#
# Fill the list from your own logs: an address with hundreds of distinct
# User-Agents and a sustained high rate is a CGNAT egress, not an attacker.
# Loaded into postoverflows/s01-whitelist.
name: rwp-shop/flood-exemptions
description: "Exempt CGNAT ranges from rwp-shop flood scenarios"
filter: "evt.Overflow.Alert.Scenario startsWith 'rwp-shop/'"
whitelist:
  reason: "carrier-grade NAT egress, per-IP flood thresholds do not apply"
  cidr:
    # Placeholder (TEST-NET-1); replace with real ranges, e.g. 185.242.18.0/24
    - 192.0.2.0/24
```
:::

::: details `crowdsec/rwp-shop-whitelist.yaml`
```yaml
# Postoverflow whitelist: never ban the health checker or the reverse proxy
# itself. Add monitoring hosts here. Loaded into postoverflows/s01-whitelist.
name: rwp-shop/whitelist
description: "Never ban operator-owned hosts"
whitelist:
  reason: "operator-owned host"
  ip:
    - 127.0.0.1
    - "::1"
  cidr:
    - 172.16.0.0/12
    - 192.168.0.0/16
```
:::

## Шаг 2: Сервис в compose.yaml

Добавьте в `.env`:

```bash
# GID группы-владельца docker.sock: stat -c %g /var/run/docker.sock
CROWDSEC_DOCKER_GID=999
# Ключ для bouncer'а: openssl rand -hex 32
CROWDSEC_FIREWALL_BOUNCER_KEY=
# Необязательно: ключ из https://app.crowdsec.net для блоклиста сообщества и консоли
CROWDSEC_ENROLL_KEY=
```

Добавьте сервис и volumes в `compose.yaml`:

```yaml
services:
  crowdsec:
    image: crowdsecurity/crowdsec:v1.8.0
    container_name: rwp_crowdsec
    restart: unless-stopped
    environment:
      GID: ${CROWDSEC_DOCKER_GID:-999}
      COLLECTIONS: "crowdsecurity/base-http-scenarios crowdsecurity/http-cve"
      BOUNCER_KEY_firewall: ${CROWDSEC_FIREWALL_BOUNCER_KEY:?set CROWDSEC_FIREWALL_BOUNCER_KEY in .env}
      ENROLL_KEY: ${CROWDSEC_ENROLL_KEY:-}
      ENROLL_INSTANCE_NAME: rwp-shop
    ports:
      - "127.0.0.1:8085:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./crowdsec/acquis.yaml:/etc/crowdsec/acquis.yaml:ro
      - ./crowdsec/parsers/rwp-shop-access.yaml:/etc/crowdsec/parsers/s01-parse/rwp-shop-access.yaml:ro
      - ./crowdsec/scenarios:/etc/crowdsec/scenarios/rwp-shop:ro
      - ./crowdsec/rwp-shop-whitelist.yaml:/etc/crowdsec/postoverflows/s01-whitelist/rwp-shop-whitelist.yaml:ro
      - ./crowdsec/rwp-shop-flood-exemptions.yaml:/etc/crowdsec/postoverflows/s01-whitelist/rwp-shop-flood-exemptions.yaml:ro
      - crowdsec-config:/etc/crowdsec
      - crowdsec-data:/var/lib/crowdsec/data

volumes:
  crowdsec-config:
  crowdsec-data:
```

Запустите и проверьте, что лог читается и наши элементы загружены:

```bash
docker compose up -d crowdsec
docker exec rwp_crowdsec cscli metrics show acquisition
docker exec rwp_crowdsec cscli parsers list | grep rwp-shop
docker exec rwp_crowdsec cscli scenarios list | grep rwp-shop
```

В таблице acquisition у `docker:rwp_shop` должен расти счётчик строк, парсер должен быть в статусе `enabled,local`.

## Шаг 3: Bouncer на хосте

Сам движок ничего не блокирует. Firewall bouncer на хосте опрашивает Local API движка (опубликован на `127.0.0.1:8085`) и добавляет правила nftables, так что забаненные адреса отбрасываются ещё до nginx/Caddy.

```bash
curl -s https://install.crowdsec.net | sudo sh
sudo apt install crowdsec-firewall-bouncer-nftables
```

Отредактируйте `/etc/crowdsec/bouncers/crowdsec-firewall-bouncer.yaml`:

```yaml
mode: nftables
api_url: http://127.0.0.1:8085/
api_key: <значение CROWDSEC_FIREWALL_BOUNCER_KEY>
update_frequency: 10s
```

```bash
sudo systemctl enable --now crowdsec-firewall-bouncer
docker exec rwp_crowdsec cscli bouncers list
```

Bouncer должен появиться в списке со свежим временем последнего опроса.

::: info Альтернатива: блокировка на прокси
Если удобнее блокировать на уровне прокси, поставьте `crowdsec-nginx-bouncer` (или аналог для Caddy/Traefik) с теми же `api_url` и `api_key`. Для второго bouncer'а зарегистрируйте отдельный ключ: `docker exec rwp_crowdsec cscli bouncers add nginx`.
:::

## Шаг 4: Проверка

С постороннего сервера (не с рабочей машины, иначе забаните себя на 4 часа):

```bash
for i in $(seq 1 30); do curl -s -o /dev/null -X POST https://bot.example.com/api/auth/email/send-otp; done
docker exec rwp_crowdsec cscli alerts list
docker exec rwp_crowdsec cscli decisions list
```

Ожидается алерт `rwp-shop/rate-limited-flood` и решение `ban`. Снять бан:

```bash
docker exec rwp_crowdsec cscli decisions delete --ip <адрес>
```

## Сценарии

| Сценарий | Порог на один IP | Зачем |
|---|---|---|
| `rwp-shop/rate-limited-flood` | 20 ответов 429 за ~30 с | встроенный лимитер бота уже отказал этим запросам, переносим отказ в файрвол |
| `rwp-shop/checkout-flood` | 40 запросов к `/api/public/subscriptions/*` или `/pay/*` за 10 с | каждый вызов обращается к платёжному провайдеру |
| `rwp-shop/api-flood` | всплеск ~150 запросов, далее 5 rps на `/api/*` | объёмный L7-флуд; статика исключена |
| `rwp-shop/server-error-burst` | 15 ответов 5xx за 10 с, кроме 502/503/504 | поиск ломающего ввода или истощение зависимости; 502/503/504 исключены, потому что в логе прокси они означают недоступность самого бота при рестарте |

Коллекции из хаба: `crowdsecurity/base-http-scenarios` (сканирование, плохие User-Agent, чувствительные файлы, обход, generic-брутфорс) и `crowdsecurity/http-cve`. Обогащение `http-logs` и whitelist приватных сетей входят в базовый образ.

::: warning CGNAT: обязательно проверьте перед включением банов
Аудитория Telegram мобильная, и оператор связи выпускает тысячи пользователей через один адрес. Замер на боевом edge: одна сеть /24 оператора дала больше половины всех запросов, с одного адреса до нескольких сотен API-запросов в секунду и сотни разных User-Agent. Per-IP порог не отличит это от атаки, и бан отрежет всех абонентов оператора.

Такие диапазоны вносятся в `rwp-shop-flood-exemptions.yaml`: они исключаются только из сценариев `rwp-shop/*`, детекты сканеров, CVE и брутфорса продолжают работать. Признаки CGNAT в логе: сотни User-Agent с одного адреса, 429 на `/api/auth/refresh` от обычных клиентов, всплески 5xx в момент деплоя. Дополнительно защитите такие адреса и от блоклиста сообщества:

```bash
docker exec rwp_crowdsec cscli allowlists create shared-egress -d "shared carrier egress"
docker exec rwp_crowdsec cscli allowlists add shared-egress 185.242.18.0/24 -d "example carrier range"
```
:::

::: info Лог прокси вместо лога бота
Сценарии используют только стандартные поля `http_access-log`, поэтому работают и на логах nginx/Caddy/Traefik, разобранных коллекциями хаба (`crowdsecurity/nginx` и т.п.). Так удобнее, если бот и публичный прокси на разных хостах или версия бота ещё не пишет `client_ip`: движок ставится на каждый публичный edge и читает его собственный лог прокси.
:::

Если легитимный трафик задевает порог, поднимите `capacity` или `leakspeed` в файле сценария и перезапустите контейнер. Сначала посмотрите `cscli alerts list`, чтобы понять, какой именно сценарий срабатывает.

## Эксплуатация

- Бан по умолчанию на 4 часа. Снять: `cscli decisions delete --ip <адрес>`.
- Мониторинг и офисные адреса добавляйте в `rwp-shop-whitelist.yaml`, после правок `docker compose restart crowdsec`.
- Алерты видны в консоли app.crowdsec.net при enroll или через `cscli alerts list`.
- Состояние движка живёт в volume `crowdsec-config` и `crowdsec-data`. Файлы из каталога `crowdsec/` перекрывают копии внутри.

::: tip Проверка конфигов без хоста
`cscli explain --file <лог> --type rwp-shop -v` показывает, какие парсеры и сценарии достигает каждая строка. Числа из JSON приходят как float, поэтому парсер приводит `status` через `int()`; сохраняйте это при добавлении полей.
:::
