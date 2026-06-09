---
title: Ядро XanMod
titleImage: https://xanmod.org/index_files/xmk.png
icon: microchip
---

[XanMod](https://xanmod.org) — оптимизированная сборка ядра Linux для Debian/Ubuntu. На серверах-нодах его ставят ради встроенного **TCP BBRv3** (Google) и обработки `tcp_collapse` от Cloudflare — это заметно поднимает пропускную способность и снижает задержки на прокси-трафике под нагрузкой.

::: tip Зачем это нужно
Стоковое ядро Debian/Ubuntu использует CUBIC. BBRv3 даёт более высокую и стабильную скорость на каналах с потерями пакетов и большим RTT — типичная ситуация для зарубежных нод.
:::

## Что даёт ядро

- **BBRv3** — встроен (`tcp_bbr`), включается без сборки модулей
- Обработка `tcp_collapse` от Cloudflare для высокой пропускной способности
- Оптимизации планировщика, поддержка `sched_ext` (SCX)
- Свежие версии ядра (LTS и MAIN) с регулярными обновлениями

## Установка

**Шаг 1: Определите уровень psABI процессора**

```bash
wget -qO - https://dl.xanmod.org/check_x86-64_psabi.sh | awk -f -
```

Скрипт выведет `x86-64-v2`, `v3` или `v4`. Бери максимальный поддерживаемый уровень — пакеты `x64v3`/`x64v4` собраны с оптимизациями под современные CPU.

**Шаг 2: Добавьте GPG-ключ**

```bash
wget -qO - https://dl.xanmod.org/archive.key \
  | sudo gpg --dearmor -o /usr/share/keyrings/xanmod-archive-keyring.gpg
```

**Шаг 3: Добавьте репозиторий**

```bash
echo "deb [signed-by=/usr/share/keyrings/xanmod-archive-keyring.gpg] http://deb.xanmod.org $(lsb_release -sc) main" \
  | sudo tee /etc/apt/sources.list.d/xanmod-release.list
```

**Шаг 4: Установите LTS-ядро**

Подставь уровень psABI из шага 1 (например `3`):

```bash
sudo apt update
sudo apt install linux-xanmod-lts-x64v3
```

::: tip Варианты ядра
- `linux-xanmod-lts-x64vN` — LTS, рекомендуется для серверов (стабильность)
- `linux-xanmod-x64vN` — MAIN, свежая ветка
- `linux-xanmod-rt-x64vN` — RT (PREEMPT_RT), для спецзадач

Для серверов-нод используйте **LTS**.
:::

**Шаг 5: Перезагрузите сервер**

```bash
sudo reboot
```

## Проверка

После перезагрузки убедитесь, что ядро XanMod запущено:

```bash
uname -r
# пример: 6.18.x-x64v3-xanmod1
```

Проверьте, что BBRv3 доступен и включите его (см. ниже про sysctl):

```bash
modinfo tcp_bbr | head -3
```

## Включение BBR (sysctl)

Установка ядра **не включает** BBR автоматически — нужно задать congestion control через `sysctl`. В `remna-ansible` это делает роль `sysctl`. Вручную:

```bash
cat <<'EOF' | sudo tee /etc/sysctl.d/99-bbr.conf
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
EOF

sudo sysctl --system
```

Проверка:

```bash
sysctl net.ipv4.tcp_congestion_control
# net.ipv4.tcp_congestion_control = bbr

sysctl net.ipv4.tcp_available_congestion_control
# должно содержать bbr
```

::: warning BBRv3 vs BBR
В XanMod ядре `tcp_bbr` — это уже **BBRv3**. Отдельного значения `bbr3` для sysctl нет: указываем `bbr`, версию определяет ядро.
:::

## Откат

Если нужно вернуться на стоковое ядро:

```bash
# Посмотреть установленные ядра
dpkg --list | grep linux-image

# Удалить XanMod-пакет
sudo apt remove 'linux-xanmod-lts-x64v*'
sudo update-grub
sudo reboot
```

После перезагрузки выберите штатное ядро Debian/Ubuntu в GRUB.
