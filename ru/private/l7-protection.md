---
title: Защита от L7-атак
description: Три варианта защиты от флуда и брутфорса — лимиты в Nginx, лимиты в Caddy и CrowdSec по access-логу бота
icon: shield-halved
---

Публичные эндпоинты бота — авторизация, OTP, промокоды, checkout — открыты в интернет и стоят дорого: каждый вызов checkout дёргает платёжного провайдера, каждый OTP отправляет письмо. Без ограничений один адрес может занять весь бот.

На этой странице три варианта защиты: два простых на уровне реверс-прокси и один полноценный с детектом и банами. Они не исключают друг друга — [их можно совмещать](#комбинирование).

::: warning Что не закрывает ни один из вариантов
Распределённую атаку с тысяч адресов. Все три варианта считают запросы **по одному IP**, а ботнет приходит с тысяч сразу. От такой атаки защищает только CDN/WAF перед сервером (Cloudflare и аналоги). Варианты ниже дополняют его, а не заменяют.
:::

## Какой вариант выбрать

| | Nginx `limit_req` | Caddy `rate_limit` | CrowdSec |
|---|---|---|---|
| Что делает | отдаёт 429 сверх лимита | отдаёт 429 сверх лимита | детектит и **банит** IP целиком |
| Источник данных | — | — | лог бота, Nginx **или** Caddy |
| Установка | встроено, только конфиг | сторонний плагин, своя сборка | контейнер + bouncer на хосте |
| Где отсекается | в прокси, после TLS | в прокси, после TLS | в **файрволе**, до TLS |
| Память о нарушителе | нет | нет | да, бан на 4 часа |
| Блоклист сообщества | нет | нет | да |
| Детект сканеров и CVE | нет | нет | да |
| Настройка | 10 минут | 30 минут | час-полтора |

**Коротко:** если у вас Nginx — начните с варианта 1, это десять минут и покрывает типовой флуд. Если Caddy — вариант 2, но учтите сборку с плагином. Если бот уже ловит регулярные атаки или вам нужны баны, сканер-детект и общий блоклист — вариант 3; он читает лог бота, Nginx или Caddy на выбор.

### Плюсы и минусы

**Вариант 1 — лимиты в Nginx**

- Плюсы: ничего не нужно ставить, модуль встроен; не падает при ошибке (лимит просто не срабатывает); нулевая нагрузка; конфиг живёт рядом с остальным прокси-конфигом.
- Минусы: только throttling — нарушитель продолжает открывать соединения и жечь TLS-хендшейки; нет памяти между всплесками; нет детекта сканеров и CVE; пороги подбираются вручную и вслепую.

**Вариант 2 — лимиты в Caddy**

- Плюсы: конфиг выразительнее nginx-овского (несколько зон с разными ключами и окнами); умеет распределённый режим на нескольких edge-серверах; `{client_ip}` корректно разворачивает `X-Forwarded-For` через `trusted_proxies`.
- Минусы: **не входит в Caddy** — нужен сторонний плагин и собственная сборка образа; плагин не имеет стабильного релиза, API может поменяться; при обновлении Caddy образ надо пересобирать; в остальном те же ограничения, что у варианта 1.

**Вариант 3 — CrowdSec**

- Плюсы: банит адрес целиком в nftables — трафик отбрасывается до прокси и до TLS; помнит нарушителей; готовые коллекции детекта сканеров, CVE и брутфорса; общий блоклист сообщества; видно, что именно сработало (`cscli alerts list`).
- Минусы: самый сложный в установке — отдельный контейнер и агент на хосте; при чтении лога бота требует версии с полем `client_ip` (на логах прокси — нет); **на CGNAT-диапазонах бан отрезает всех абонентов оператора** — исключения обязательны; ещё один сервис, который нужно обновлять и мониторить.

## Вариант 1: Лимиты в Nginx

Модуль `limit_req` входит в стандартную сборку Nginx — ставить ничего не нужно. Конфиг дополняет пример из [настройки реверс-прокси](/ru/private/installation/#настройка-реверс-прокси).

**Шаг 1.** Зоны объявляются в контексте `http{}`. Создайте `/etc/nginx/conf.d/rwp-shop-limits.conf`:

```nginx
# Дорогие эндпоинты: авторизация, OTP, промокоды. Человек обращается к ним
# единицы раз, поэтому лимит жёсткий — 10 запросов в минуту с адреса.
limit_req_zone $binary_remote_addr zone=rwp_auth:10m rate=10r/m;

# Остальной API. 10 rps с запасом покрывает активную работу в Mini App.
limit_req_zone $binary_remote_addr zone=rwp_api:10m rate=10r/s;

# Одновременные соединения с одного адреса.
limit_conn_zone $binary_remote_addr zone=rwp_conn:10m;

# По умолчанию nginx отдаёт 503. 429 честнее и его понимает клиент.
limit_req_status 429;
limit_conn_status 429;
```

Зоны в 10 МБ хватает примерно на 160 тысяч адресов.

**Шаг 2.** В `server{}`-блоке добавьте два `location` **перед** общим `location /`:

```nginx
    location /api/auth/ {
        limit_req zone=rwp_auth burst=5 nodelay;
        limit_conn rwp_conn 20;

        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        limit_req zone=rwp_api burst=50;
        limit_conn rwp_conn 20;

        proxy_pass http://127.0.0.1:9912;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

::: info Про `burst` и `nodelay`
`rate` — это средняя скорость, `burst` — сколько запросов сверх неё можно накопить. Без `nodelay` nginx задерживает их до нужного темпа, с `nodelay` — пропускает сразу, а лишние отбивает. Для API берите вариант с задержкой (плавнее для Mini App), для auth — `nodelay`, чтобы перебор кодов получал отказ мгновенно.
:::

**Шаг 3.** Проверьте и примените:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Шаг 4.** Проверьте с постороннего сервера — часть запросов должна получить 429:

```bash
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code} " -X POST https://bot.example.com/api/auth/email/send-otp; done
```

Срабатывания видны в логе ошибок:

```bash
sudo grep "limiting requests" /var/log/nginx/error.log | tail
```

::: warning Nginx за CDN
Если перед Nginx стоит Cloudflare или другой CDN, `$binary_remote_addr` — это адрес CDN, и лимит применится ко всем клиентам сразу. Подключите модуль `realip` (`set_real_ip_from <сети CDN>; real_ip_header CF-Connecting-IP;`), иначе первый же всплеск заблокирует весь трафик.
:::

## Вариант 2: Лимиты в Caddy

В Caddy нет встроенного rate limiting — нужен плагин [`caddy-ratelimit`](https://github.com/mholt/caddy-ratelimit) и собственная сборка. Это единственная существенная сложность варианта.

**Шаг 1.** Соберите Caddy с плагином. Для Docker — свой `Dockerfile`:

```dockerfile
FROM caddy:2-builder AS builder
RUN xcaddy build --with github.com/mholt/caddy-ratelimit

FROM caddy:2
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

Для системной установки (`xcaddy` из репозитория Caddy):

```bash
xcaddy build --with github.com/mholt/caddy-ratelimit
sudo mv caddy /usr/bin/caddy
sudo systemctl restart caddy
```

Проверьте, что плагин на месте:

```bash
caddy list-modules | grep rate_limit
```

**Шаг 2.** Директива не входит в стандартный порядок обработки, поэтому её место задаётся глобально. В начало `Caddyfile`:

```txt
{
    order rate_limit before basic_auth
}
```

**Шаг 3.** В блок сайта, к конфигу из [настройки реверс-прокси](/ru/private/installation/#настройка-реверс-прокси):

```txt
bot.example.com {
    # ... header, encode и правила кеширования из основного конфига ...

    @auth path /api/auth/*
    rate_limit @auth {
        zone auth {
            key    {client_ip}
            events 10
            window 1m
        }
    }

    @api path /api/*
    rate_limit @api {
        zone api {
            key    {client_ip}
            events 600
            window 1m
        }
    }

    reverse_proxy 127.0.0.1:9912
}
```

Сверх лимита плагин отдаёт 429 с заголовком `Retry-After`.

::: info Почему `{client_ip}`, а не `{remote_host}`
`{remote_host}` — адрес TCP-соединения, то есть CDN или вышестоящего прокси, если они есть. `{client_ip}` разворачивает `X-Forwarded-For`, но **только для доверенных источников**. Если перед Caddy стоит CDN, объявите его сети, иначе значения из заголовка подделываются кем угодно и лимит обходится одной строкой:

```txt
{
    servers {
        trusted_proxies static 173.245.48.0/20 103.21.244.0/22
    }
}
```
:::

**Шаг 4.** Примените и проверьте:

```bash
caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

```bash
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code} " -X POST https://bot.example.com/api/auth/email/send-otp; done
```

::: warning Состояние в памяти
Счётчики живут в памяти процесса и обнуляются при перезапуске Caddy. Если публичных edge-серверов несколько, каждый считает свой лимит независимо — фактический порог умножается на их число. Для общего счётчика у плагина есть режим `distributed` с общим storage.
:::

## Вариант 3: CrowdSec (баны в файрволе)

Самый глубокий вариант. CrowdSec читает access-лог, по сценариям находит злоупотребляющие IP, а *bouncer* на хосте блокирует их в файрволе — трафик отбрасывается до того, как дойдёт до реверс-прокси и бота.

В отличие от вариантов 1 и 2, здесь есть память о нарушителе, готовые детекты сканеров и CVE и общий блоклист сообщества.

### Откуда читать лог

CrowdSec не привязан к логу бота. Источником может быть лог бота, Nginx или Caddy — движок, сценарии и bouncer во всех случаях одни и те же, отличается только acquisition и набор парсеров.

| | Лог бота | Лог Nginx | Лог Caddy |
|---|---|---|---|
| Парсер | наш, из этой инструкции | `crowdsecurity/nginx` из хаба | `crowdsecurity/caddy` из хаба |
| Требует версию бота с `client_ip` | да | нет | нет |
| Работает, если прокси на другом хосте | нет | да | да |
| Видит запросы, отбитые самим прокси | нет | да | да |
| Видит эндпоинт и статус от приложения | да, всегда точные | да | да |
| Подготовка | ничего | `realip` за CDN | JSON-формат лога |

**Что выбрать.** Если бот и прокси на одном хосте и версия свежая — берите лог бота: парсер уже написан, поля приходят прямо от приложения. Если прокси стоит отдельно, обслуживает несколько сервисов или вы хотите видеть в том числе запросы, отбитые лимитами из вариантов 1 и 2, — берите лог прокси. Наши сценарии используют только стандартные поля `http_access-log`, поэтому работают на любом из трёх источников.

Ставить оба источника сразу можно, но смысла мало: одни и те же запросы будут посчитаны дважды, и пороги придётся поднимать.

::: warning Лог бота: требуется версия с полем `client_ip`
Поле `client_ip` в access-логе появилось в релизе с интеграцией CrowdSec. На более старых версиях в логе есть только `remote` с адресом прокси, и бан по нему заблокирует сам прокси. Это ограничение касается **только** источника «лог бота» — на логах Nginx и Caddy версия бота роли не играет.
:::

::: warning Лог прокси за CDN
Nginx и Caddy пишут в лог адрес TCP-соединения. Если перед ними стоит Cloudflare, в логе будут адреса CDN, и первый же бан отрежет весь трафик. Для Nginx настройте `realip` (`set_real_ip_from`/`real_ip_header`), для Caddy — `trusted_proxies`. Проверьте лог глазами перед включением bouncer'а.
:::

### Как это устроено

| Компонент | Где | Роль |
|---|---|---|
| Access-лог | stdout контейнера `rwp_shop` **или** файл лога Nginx/Caddy | строка на каждый HTTP-запрос |
| Acquisition | контейнер `crowdsec` | читает выбранный источник — Docker socket или файл |
| Парсер | контейнер `crowdsec` | раскладывает строку в поля CrowdSec (`source_ip`, `http_status` и т.д.): наш для лога бота, коллекция из хаба для прокси |
| Сценарии | контейнер `crowdsec` | правила детекта, наши плюс коллекции из хаба |
| Whitelist | контейнер `crowdsec` | никогда не банить свои хосты |
| Исключения для флуда | контейнер `crowdsec` | CGNAT-диапазоны, к которым не применяются флуд-сценарии |
| Firewall bouncer | **хост** | применяет баны в nftables |

При чтении лога бота адрес клиента бот определяет сам: заголовки `X-Forwarded-For`/`X-Real-IP` учитываются только если TCP-соединение пришло из `TRUSTED_PROXIES` (по умолчанию loopback и Docker-сети). Сырой адрес соединения тоже пишется в поле `remote`, но банить по нему нельзя.

### Предварительные условия

**Если читаете лог бота:**

- `ACCESS_LOG_ENABLED=true` (значение по умолчанию) и пустой `ACCESS_LOG_PATH`, чтобы лог шёл в stdout контейнера. Если вы настроили [запись логов в файл](/ru/private/access-logs), в acquisition ниже замените источник `docker` на `file` с путём к файлу.
- Реверс-прокси передаёт адрес клиента. Nginx-конфиг из [установки](/ru/private/installation/#настройка-реверс-прокси) уже содержит `proxy_set_header X-Real-IP` и `X-Forwarded-For`; Caddy добавляет `X-Forwarded-For` сам.
- Если прокси стоит не на loopback и не в Docker-сети этого же хоста, задайте `TRUSTED_PROXIES` с его адресом или CIDR. Иначе все запросы будут приписаны прокси и ничего полезного забанено не будет.
- Контейнер бота называется `rwp_shop` (как в стандартном `compose.yaml`).

**Если читаете лог Nginx:**

- Лог в стандартном формате `combined` (по умолчанию). Кастомный `log_format` потребует правки парсера из хаба.
- Каталог с логами примонтирован в контейнер CrowdSec: `- /var/log/nginx:/var/log/nginx:ro`.

**Если читаете лог Caddy:**

- Caddy пишет лог **в формате JSON** — коллекция из хаба рассчитана на него. В блок сайта:

  ```txt
  log {
      output file /var/log/caddy/bot.example.com.log
      format json
  }
  ```

- Каталог с логами примонтирован в контейнер CrowdSec: `- /var/log/caddy:/var/log/caddy:ro`.

### Шаг 1: Файлы конфигурации

Создайте каталог `crowdsec` рядом с `compose.yaml` и положите в него файлы ниже.

:::: details `crowdsec/acquis.yaml` — выберите источник
Один файл на выбранный источник. Несколько источников можно описать в одном файле, разделив блоки через `---`.

::: code-group

```yaml [Лог бота]
# The bot writes its JSON access log to container stdout (ACCESS_LOG_ENABLED=true,
# ACCESS_LOG_PATH empty), so the engine reads it through the Docker socket.
source: docker
container_name:
  - rwp_shop
labels:
  type: rwp-shop
```

```yaml [Лог Nginx]
# Parsed by the crowdsecurity/nginx collection from the hub.
# Mount /var/log/nginx into the container read-only.
filenames:
  - /var/log/nginx/access.log
  - /var/log/nginx/error.log
labels:
  type: nginx
```

```yaml [Лог Caddy]
# Parsed by the crowdsecurity/caddy collection from the hub.
# Caddy must log in JSON format. Mount /var/log/caddy read-only.
filenames:
  - /var/log/caddy/*.log
labels:
  type: caddy
```

:::
::::

::: info Парсер и коллекция под источник
Файл `crowdsec/parsers/rwp-shop-access.yaml` ниже нужен **только для лога бота**. Для Nginx и Caddy вместо него добавьте коллекцию из хаба в переменную `COLLECTIONS` сервиса (см. шаг 2): `crowdsecurity/nginx` или `crowdsecurity/caddy`. Сценарии `rwp-shop/*` работают одинаково во всех трёх случаях.
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

### Шаг 2: Сервис в compose.yaml

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
      # Для лога Nginx или Caddy добавьте сюда crowdsecurity/nginx или crowdsecurity/caddy
      COLLECTIONS: "crowdsecurity/base-http-scenarios crowdsecurity/http-cve"
      BOUNCER_KEY_firewall: ${CROWDSEC_FIREWALL_BOUNCER_KEY:?set CROWDSEC_FIREWALL_BOUNCER_KEY in .env}
      ENROLL_KEY: ${CROWDSEC_ENROLL_KEY:-}
      ENROLL_INSTANCE_NAME: rwp-shop
    ports:
      - "127.0.0.1:8085:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # Только при чтении лога прокси — раскомментируйте нужную строку:
      # - /var/log/nginx:/var/log/nginx:ro
      # - /var/log/caddy:/var/log/caddy:ro
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

### Шаг 3: Bouncer на хосте

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

### Шаг 4: Проверка

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

### Сценарии

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

Если легитимный трафик задевает порог, поднимите `capacity` или `leakspeed` в файле сценария и перезапустите контейнер. Сначала посмотрите `cscli alerts list`, чтобы понять, какой именно сценарий срабатывает.

### Эксплуатация

- Бан по умолчанию на 4 часа. Снять: `cscli decisions delete --ip <адрес>`.
- Мониторинг и офисные адреса добавляйте в `rwp-shop-whitelist.yaml`, после правок `docker compose restart crowdsec`.
- Алерты видны в консоли app.crowdsec.net при enroll или через `cscli alerts list`.
- Состояние движка живёт в volume `crowdsec-config` и `crowdsec-data`. Файлы из каталога `crowdsec/` перекрывают копии внутри.

::: tip Проверка конфигов без хоста
`cscli explain --file <лог> --type rwp-shop -v` показывает, какие парсеры и сценарии достигает каждая строка. Числа из JSON приходят как float, поэтому парсер приводит `status` через `int()`; сохраняйте это при добавлении полей.
:::

## Комбинирование

Варианты складываются, и на боевом сервере разумная комбинация — **1 или 2 плюс 3**:

- Лимит в прокси (вариант 1 или 2) отбивает всплеск мгновенно, ещё до того, как запрос дойдёт до бота.
- CrowdSec (вариант 3) видит эти же отказы в логе и через сценарий `rwp-shop/rate-limited-flood` переводит повторяющегося нарушителя в бан на уровне файрвола, чтобы сервер вообще перестал тратить на него ресурсы.

Порядок внедрения: сначала лимиты в прокси (быстро и безопасно), затем, если атаки повторяются, CrowdSec. Ставить оба варианта прокси-лимитов одновременно смысла нет — у вас либо Nginx, либо Caddy.

::: tip Начните с наблюдения
Прежде чем включать любые баны, посмотрите реальный профиль трафика: `docker compose logs bot | grep '"msg":"request"'`. Пороги, подобранные вслепую, чаще отрезают своих же клиентов, чем атакующих — особенно на мобильных операторах (см. предупреждение про CGNAT выше).
:::
