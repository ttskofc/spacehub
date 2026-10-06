# SpaceHub — Сервис бронирования ресурсов организации

Cистема учета и бронирования общих ресурсов (переговорные, рабочие места, техника).

## Архитектура
- **client/**: Frontend на Vue 3 (Vite, Pinia, Vue Router)
- **server/**: Python FastAPI — API-гейтвей к веб-серверу 1С
- **1c-core/**: Конфигурация 1С (в репозитории пока нет)

Путь запроса: `client → vite-proxy /api → server:8000 → 1С:8080/spacehub/hs/api/v1`

## Запуск

Веб-сервер 1С должен быть поднят (по умолчанию `http://localhost:8080/spacehub/hs/api/v1`).

### Быстрый старт

```powershell
# из корня репозитория
.\start.ps1            # поднимет гейтвей и клиент, откроет браузер
.\stop.ps1             # остановить всё
```

`start.ps1` сам: создаст `.venv` и поставит зависимости, если их нет, проверит 1С,
поднимет гейтвей на `:8000` и Vite на `:5173` с `--strictPort`, дождётся
готовности обоих и откроет `http://localhost:5173/`.

| Что | Адрес | Лог |
| --- | --- | --- |
| Каталог | http://localhost:5173/ | `client/logs/client-5173.log` |
| Гейтвей | http://localhost:8000/health | `server/logs/gateway-8000.log` |
| 1С | http://localhost:8080/spacehub/hs/api/v1 | — |

Полезные ключи: `-NoBrowser` (не открывать браузер), `-GatewayPort 8010 -ClientPort 5180`
(другой порт, если 8000/5173 заняты). Повторный `start.ps1` ничего не ломает: если
сервисы уже подняты и отвечают, он их не перезапускает.

Если PowerShell запрещает запуск скриптов:
`powershell -ExecutionPolicy Bypass -File .\start.ps1`.

### Вручную

```powershell
# 1. Гейтвей
cd server
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
copy .env.example .env          # адрес 1С, таймауты, CORS, рабочий день
.\run.ps1                       # или .venv\Scripts\python -m uvicorn main:app --reload --port 8000

# 2. Frontend
cd client
npm install
copy .env.example .env          # путь API и адрес прокси
.\run.ps1                       # или npm run dev -- --port 5173 --strictPort
```

Проверка связки: `http://localhost:8000/health` → `{"status":"ok","onec":"available"}`.

### Если что-то не запускается

- `порт N занят, но это не наш ...` → `.\stop.ps1 -Ports N` или запуск с другим портом.
- `гейтвей поднялся, но 1С недоступна` → поднять веб-сервер 1С и обновить страницу;
  причина также пишется в `server/logs/gateway-*.log`.
- В окне сервиса всё ещё видны ошибки запуска, в логе их нет → смотреть окно
  `SpaceHub Gateway` / `SpaceHub Client`.

## API-контракт гейтвея

| Метод | Путь | Назначение |
| --- | --- | --- |
| GET | `/health` | Статус гейтвея и доступности 1С |
| GET | `/api/resources` | Каталог ресурсов в формате карточки |
| GET | `/api/slots?resource_id=&date=` | Занятые интервалы ресурса |
| POST | `/api/bookings` | Создание брони (тело проксируется в 1С как есть) |

`GET /api/resources` возвращает поля `ResourceCard`: `id`, `title`, `category`, `location`,
`capacity`, `area`, `imageUrl`, `description`, `features[{icon,label}]`, `timelineStart`,
`timelineEnd`, `bookings[]`, `instantBooking`.

Фото: 1С отдаёт основное фото в `preview_image` — ссылка на внешний хостинг, гейтвей
отдаёт её как есть в `imageUrl`, карточка рисует её в медиаблоке. Галерея 1С не используется.

Чего 1С пока не отдаёт и как это закрыто:
- код ресурса → `code: ""` (в списке не выводится);
- занятость → `GET /api/slots`, при сбое карточка остаётся со свободным днём;
- границы рабочего дня → `WORK_DAY_START` / `WORK_DAY_END` в `server/.env`;
- агрегаты для шапки → в `client/src/stores/catalog.js` (`MOCK_STATS`).

## Страницы
- `/` — каталог ресурсов (живые данные из 1С)
- `/bookings`, `/calendar` — заглушки
- `/gallery` — галерея UI-кита
