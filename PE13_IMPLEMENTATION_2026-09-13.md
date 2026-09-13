# PE-13 — ИИ-описания товаров / MVP v1

**Дата реализации:** 13.09.2026  
**Ветка:** `main`  
**Статус:** реализовано в коде, требуется локальная функциональная проверка перед переносом в production Git клиента.

## Согласованный объём

Вместо первоначального большого ТЗ реализован компактный рабочий модуль:

1. В админке задаются GEN API key и модель.
2. Можно запустить массовую генерацию для всех не удалённых товаров.
3. Генерация не меняет `Product.description` автоматически — сначала создаётся AI-черновик.
4. В админке можно посмотреть старый текст и AI-вариант, перегенерировать и применить отдельный вариант.
5. Есть массовая кнопка «Применить все готовые».
6. В редактировании каждого товара есть отдельный AI-блок: «Сгенерировать описание» → preview → «Применить описание».
7. Тексты генерируются через GEN API OpenAI-compatible endpoint `https://proxy.gen-api.ru/v1/chat/completions`.

## Правила генерации

В модель передаются только существующие данные товара:

- название;
- бренд;
- категории;
- характеристики;
- текущее описание.

Промпт запрещает придумывать отсутствующие характеристики, комплектацию, гарантии, совместимость и иные факты.

Целевой формат:

- русский язык;
- 2 смысловых абзаца;
- ориентир 500–1000 символов;
- без Markdown и служебных фраз;
- естественное использование названия товара.

Если первая генерация не проходит базовую проверку длины/формата, backend делает одну автоматическую попытку коррекции. Если после неё результат всё ещё выходит за рамки, он сохраняется со статусом `NEEDS_REVIEW`, а не публикуется автоматически.

## Безопасность GEN API key

- API key вводится через admin UI;
- браузер после сохранения не получает полный ключ обратно;
- key хранится в БД зашифрованным AES-256-GCM;
- ключ шифрования берётся из `AI_SETTINGS_SECRET`, а если переменная не задана — из существующего server-side `JWT_ACCESS_SECRET`;
- запросы к GEN API выполняются только backend-сервисом;
- GEN API key не попадает во frontend bundle.

Для production желательно отдельно задать `AI_SETTINGS_SECRET`.

## Массовая обработка

Для 1600+ товаров используется существующий Redis/Bull stack проекта:

- очередь `ai-descriptions`;
- обработка с concurrency = 2;
- каждый товар — отдельная job;
- retry job: 2 попытки;
- прогресс хранится в БД;
- admin UI опрашивает прогресс каждые 3 секунды;
- один HTTP request не держится открытым на время всей массовой генерации.

Текущие описания товаров во время генерации не меняются.

## Таблицы БД

Миграция:

`ecommerce-backend/prisma/migrations/20260913203000_ai_product_descriptions/migration.sql`

Добавлены служебные таблицы:

- `AiDescriptionSettings` — GEN API settings;
- `AiDescriptionBatch` — состояние массового запуска;
- `AiDescriptionDraft` — AI-черновик конкретного товара.

Миграция additive: существующая таблица `Product` и поле `description` не изменяются.

## Backend

Новый модуль:

- `ecommerce-backend/src/ai-descriptions/ai-descriptions.module.ts`
- `ecommerce-backend/src/ai-descriptions/ai-descriptions.controller.ts`
- `ecommerce-backend/src/ai-descriptions/ai-descriptions.service.ts`
- `ecommerce-backend/src/ai-descriptions/ai-descriptions.processor.ts`

Подключение модуля:

- `ecommerce-backend/src/app.module.ts`

### API

- `GET /api/ai-descriptions/settings`
- `PUT /api/ai-descriptions/settings`
- `POST /api/ai-descriptions/products/:productId/generate`
- `GET /api/ai-descriptions/products/:productId/draft`
- `POST /api/ai-descriptions/products/:productId/apply`
- `GET /api/ai-descriptions/drafts`
- `POST /api/ai-descriptions/batches`
- `GET /api/ai-descriptions/batches/latest`
- `GET /api/ai-descriptions/batches/:id`
- `POST /api/ai-descriptions/apply-all`

Все endpoints защищены существующим `AdminGuard`.

## Admin

API client:

- `e-commerce-admin/src/shared/api/aiDescriptionsApi.ts`
- `e-commerce-admin/src/shared/api/index.ts`

Массовый экран:

- `e-commerce-admin/src/app/ai-descriptions/page.tsx`

Экран позволяет:

- сохранить GEN API key;
- изменить model id;
- запустить массовую генерацию;
- видеть total / processed / success / failed;
- сравнивать текущее описание и AI-вариант;
- перегенерировать отдельный товар;
- применить отдельный текст;
- применить все готовые тексты.

Интеграция в карточку товара без правки существующей логики `page.tsx`:

- `e-commerce-admin/src/app/products/[id]/edit/layout.tsx`
- `e-commerce-admin/src/app/products/[id]/edit/AiProductDescriptionPanel.tsx`

Nested layout добавляет AI-панель над существующей формой редактирования товара. Существующий submit/update товара не рефакторился.

## Что сознательно НЕ реализовано в MVP

- редактор промпта в админке;
- temperature/top-p настройки;
- несколько профилей промптов;
- автоматическая генерация при создании нового товара;
- планировщик;
- длинная история всех генераций;
- публикация AI-текста без подтверждения;
- отдельные AI-роли и permissions;
- автоматическое массовое применение сразу после генерации.

Это оставлено для Phase 2 после основных задач проекта.

## Что проверить локально

1. `git pull` → `dev.cmd` применяет новую migration к `prime_local`.
2. Открыть `/ai-descriptions`.
3. Сохранить тестовый GEN API key и model id.
4. Открыть редактирование одного товара.
5. Нажать «Сгенерировать описание».
6. Проверить, что текущее описание товара не изменилось до «Применить».
7. Проверить preview и фактическую замену после «Применить описание».
8. Проверить «Сгенерировать заново».
9. Запустить массовую генерацию сначала на локальной копии БД и проверить прогресс.
10. До production массового запуска визуально проверить выборку минимум из 20–30 текстов.
11. Только после проверки использовать «Применить все готовые».

## Production

Перед переносом:

- сравнить актуальные migrations в production Git;
- при необходимости переименовать timestamp migration поверх актуального дерева;
- сделать backup production DB;
- задать `AI_SETTINGS_SECRET` на сервере;
- убедиться, что production Redis доступен Bull worker;
- не переносить тестовый GEN API key из локальной БД;
- GEN API key клиент вводит заново в production admin.

## Документация GEN API

При реализации использован официальный OpenAI-compatible формат GEN API. Base URL: `https://proxy.gen-api.ru/v1`, текстовые запросы отправляются через `/chat/completions` с Bearer API key и `model` из идентификатора модели GEN API.
