# PRIME Electronics — журнал реализации клиентских задач

Назначение: зафиксировать изменения технического репозитория `AndrewStartcev/prime-electronics` для последующего сопоставления с параллельно меняющимся production Git клиента.

- **Дата:** 13.09.2026
- **Ветка:** `main`
- **Статус:** реализовано в `main`, требуется локальная функциональная проверка перед переносом в production Git клиента.

## PE-07 — дата публикации и отложенная публикация

Сделано:
- добавлено `Blog.publishedAt`; `createdAt` остаётся технической датой;
- migration backfill: для старых статей `publishedAt = createdAt`;
- public API: только `isActive = true` и `publishedAt <= now()`;
- сортировка публичного блога по `publishedAt DESC`;
- будущая дата работает без cron: статья становится доступной автоматически по условию API;
- TTL Redis-списка ограничивается временем до ближайшей запланированной публикации, поэтому часовой кеш не задерживает выход статьи;
- create/edit в админке получили `datetime-local`;
- список админки показывает `Черновик / Запланирована / Опубликована`;
- storefront, Open Graph и Article JSON-LD используют `publishedAt`.

Файлы:
- `ecommerce-backend/prisma/schema.prisma`
- `ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`
- `ecommerce-backend/src/blog/dto/create-blog.dto.ts`
- `ecommerce-backend/src/blog/services/blog.service.ts`
- `ecommerce-backend/src/blog/services/cache.service.ts`
- `e-commerce-admin/src/shared/hooks/useBlogs.ts`
- `e-commerce-admin/src/app/blog/_components/BlogPublishingFields.tsx`
- `e-commerce-admin/src/app/blog/new/page.tsx`
- `e-commerce-admin/src/app/blog/[id]/page.tsx`
- `e-commerce-admin/src/app/blog/page.tsx`
- `e-commerce/src/shared/api/blogApi.ts`
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx`
- `e-commerce/src/app/blog/[id]/page.tsx`
- `e-commerce/src/shared/lib/structuredData.tsx`

Проверить:
1. старые статьи сохранили прежние даты;
2. черновик недоступен публично;
3. статья с датой +5–10 минут появляется сама;
4. прошлая дата влияет на дату и порядок;
5. timezone production;
6. `article:published_time` и JSON-LD `datePublished`.

## PE-08 — авторы статей

Сделано:
- новая сущность `BlogAuthor`: `name`, `avatarUrl`, `bio`, `isActive`, timestamps;
- `Blog.authorId` + relation;
- legacy `Blog.author` сохранён для обратной совместимости;
- migration создаёт авторов из уникальных старых `Blog.author` и связывает существующие статьи;
- переименование профиля синхронизирует legacy `author`;
- удаление профиля не удаляет статью (`authorId -> NULL`), старое имя остаётся;
- CRUD `/blog-authors` под `AdminGuard`;
- изменения автора инвалидируют blog Redis cache;
- страница админки `/blog/authors`;
- выбор автора в create/edit статьи;
- storefront: реальный avatar/name/bio с fallback старой логики;
- профиль автора используется в metadata и Article JSON-LD.

Файлы:
- `ecommerce-backend/prisma/schema.prisma`
- `ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`
- `ecommerce-backend/src/blog/dto/blog-author.dto.ts`
- `ecommerce-backend/src/blog/dto/create-blog.dto.ts`
- `ecommerce-backend/src/blog/dto/index.ts`
- `ecommerce-backend/src/blog/services/blog-author.service.ts`
- `ecommerce-backend/src/blog/services/blog.service.ts`
- `ecommerce-backend/src/blog/services/index.ts`
- `ecommerce-backend/src/blog/blog-author.controller.ts`
- `ecommerce-backend/src/blog/blog.module.ts`
- `e-commerce-admin/src/shared/hooks/useBlogs.ts`
- `e-commerce-admin/src/app/blog/authors/page.tsx`
- `e-commerce-admin/src/app/blog/_components/BlogPublishingFields.tsx`
- `e-commerce-admin/src/app/blog/new/page.tsx`
- `e-commerce-admin/src/app/blog/[id]/page.tsx`
- `e-commerce-admin/src/app/blog/page.tsx`
- `e-commerce/src/shared/api/blogApi.ts`
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx`
- `e-commerce/src/app/blog/[id]/page.tsx`
- `e-commerce/src/shared/lib/structuredData.tsx`

Проверено пользователем 13.09.2026:
- создание/выбор автора работает;
- аватар выводится;
- информация об авторе выводится.

## PE-09 — товарные блоки в статьях

Сделано:
- товары не сохраняются snapshot-HTML;
- `BlogProductBlock` + `BlogProductBlockItem` связаны с реальными `Product`;
- enum `BlogProductPlacement`: `AFTER_ARTICLE`, резерв `INLINE`;
- несколько блоков, заголовок, поиск каталога, добавление/удаление/сортировка товаров;
- backend хранит только связи и порядок;
- public API возвращает актуальные данные продукта;
- неактивные/удалённые товары публично не выводятся;
- storefront использует существующий `ProductCard`;
- PE-06 HTML editor не изменялся;
- базовый вывод после статьи проверен пользователем и работает.

Файлы:
- `ecommerce-backend/prisma/schema.prisma`
- `ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`
- `ecommerce-backend/src/blog/dto/create-blog.dto.ts`
- `ecommerce-backend/src/blog/services/blog.service.ts`
- `e-commerce-admin/src/shared/hooks/useBlogs.ts`
- `e-commerce-admin/src/app/blog/_components/BlogPublishingFields.tsx`
- `e-commerce-admin/src/app/blog/new/page.tsx`
- `e-commerce-admin/src/app/blog/[id]/page.tsx`
- `e-commerce-admin/src/app/blog/page.tsx`
- `e-commerce/src/shared/api/blogApi.ts`
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx`

## Доработка по локальной проверке 13.09.2026 — PE-07 / PE-09

### PE-07 — зафиксирован часовой пояс публикации

Проблема:
- `datetime-local` ранее интерпретировался браузером в часовом поясе компьютера пользователя;
- из-за этого на машине с часовым поясом UTC+8 выбранное время сохранялось не как московское и отложенная публикация срабатывала в другой момент;
- в интерфейсе не было указано, по какому часовому поясу задаётся время.

Исправлено:
- административный интерфейс теперь явно использует **МСК (UTC+3)**;
- новое значение `datetime-local` формируется в московском времени;
- при сохранении введённое московское время переводится в UTC ISO (`+03:00 -> UTC`) и именно это значение хранится в PostgreSQL;
- при редактировании UTC из API переводится обратно в московское `datetime-local`;
- backend продолжает сравнивать UTC `publishedAt <= now()` — дополнительный server timezone не требуется;
- дата на storefront форматируется с `timeZone: "Europe/Moscow"`.

Новые/изменённые файлы:
- `e-commerce-admin/src/shared/lib/blogDateTime.ts` — функции `nowForMoscowInput`, `isoToMoscowInput`, `moscowInputToIso`, подпись `МСК (UTC+3)`;
- `e-commerce-admin/src/app/blog/new/page.tsx` — сохранение московского времени в UTC;
- `e-commerce-admin/src/app/blog/[id]/page.tsx` — обратное преобразование UTC ↔ МСК;
- `e-commerce-admin/src/app/blog/_components/BlogPublishingFields.tsx` — явная подпись часового пояса;
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx` — вывод даты в `Europe/Moscow`.

Проверить после `git pull`:
1. создать активную статью на +3–5 минут по **МСК**;
2. до указанного времени `/blog/:slug` должен отдавать «ещё не опубликована»;
3. после указанной минуты статья должна открыться сама без повторного сохранения;
4. в списке блога статья должна появиться без ожидания часового Redis TTL.

### PE-09 — шорткоды товарных блоков

Добавлено:
- каждому товарному блоку админка показывает стабильный шорткод вида `[[product-block:1]]`;
- рядом есть кнопка «Копировать»;
- шорткод можно вставить отдельной строкой в визуальный редактор или HTML source PE-06;
- номер шорткода привязан к `sortOrder` блока, а не к его текущей позиции массива;
- удаление соседнего блока больше не перенумеровывает уже созданные shortcode slots;
- storefront разбирает shortcode внутри `post.text` и рендерит соответствующий `ProductCard`-блок прямо в этом месте;
- поддержан вариант, когда визуальный редактор оборачивает shortcode в `<p>...</p>`;
- если блок выведен shortcode-ом внутри статьи, второй раз после статьи он не выводится;
- блоки без shortcode продолжают работать по прежней схеме — после статьи.

Изменённые файлы:
- `e-commerce-admin/src/app/blog/_components/BlogPublishingFields.tsx`;
- `e-commerce-admin/src/app/blog/new/page.tsx`;
- `e-commerce-admin/src/app/blog/[id]/page.tsx`;
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx`.

Пример использования:

```text
<p>Текст до подборки.</p>
[[product-block:1]]
<p>Текст после подборки.</p>
```

## Локальная проверка PE-07 / PE-08 / PE-09 — инфраструктурные исправления 13.09.2026

Во время первой локальной проверки выявлены две проблемы окружения разработки, не production-логики:

1. `Cannot POST /api/blog-authors` — локальный backend мог продолжать работать со старым кодом и старым Prisma Client после `git pull`; обычный `dev.cmd` ранее не выполнял новые migration/`prisma generate`.
2. upload изображений возвращал HTTP 400, потому что локальный `dev.ps1` намеренно очищает production Cloudinary credentials, а `UploadService` до этого поддерживал только Cloudinary.

Исправлено:
- `dev.ps1` теперь на каждом запуске после готовности локального PostgreSQL выполняет `npm run prisma:generate` и `prisma migrate deploy` **только с локальным `DATABASE_URL`**;
- `dev.ps1` перезапускает локальный backend на порту `16001`, чтобы после `git pull` гарантированно загрузились новые Nest controllers и Prisma Client;
- production DB этим процессом не затрагивается;
- `UploadService` в `development` при отсутствии Cloudinary credentials сохраняет изображения в `ecommerce-backend/public/images/uploads/` и возвращает URL локального backend;
- в production при наличии Cloudinary credentials остаётся прежняя Cloudinary-логика.

Файлы:
- `dev.ps1`
- `ecommerce-backend/src/upload/upload.service.ts`

## Миграция БД

`ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`

Миграция additive: статьи и старые поля не удаляются; legacy `author` остаётся; добавляются `publishedAt`, `authorId`, авторы и товарные блоки; выполняется backfill.

### При переносе в production

Production Git меняется параллельно. Поэтому перед применением:
1. сравнить актуальный production `schema.prisma`;
2. проверить новые production migrations после `20260722160000_add_main_category_controls`;
3. при конфликте timestamp/name создать новую миграцию с тем же SQL-смыслом поверх актуальной схемы;
4. сделать backup DB;
5. применить штатным production deployment;
6. выполнить `prisma generate`.

Не применять этот migration-файл к production вслепую.

## Коммиты 13.09.2026

Основная реализация:
- `1da4fd9259ac93e524086cd70273f279425b1c3a` — backend;
- `b541d7b1b80ffad396fe676d2b0ba1e2601484cd` — admin;
- `76dca9297aeee3b8725df1b298752602616725fb` — storefront.

Code-review и локальные fixes:
- `17131d8620fc7f14f217c52778f15765570ee7cc` — cache invalidation после изменений автора;
- `4dcac0c39d33309deddc08d8effc62656398a3b3` — BlogCard props compatibility;
- `b74ccb3ba7eb866556bdf77fdd8e289f688f4118` — publishedAt/author в Article JSON-LD;
- `301d6f3885526a97888a97d9ee8e2a055a576d96` — publishedAt/author в blog metadata;
- `f2866b45c19488bb2587d670bd45ce25f4bd69c9` — local image upload fallback;
- `4422e9ed9d3ed0e7fe4794309c9c7bb50c4e6dcc` — local Prisma sync/backend restart;
- `57c2eae242b73454bb8cb68b4514afb692b06765` — Prisma generation after backend stop;
- `46b5ef5ffd8f5c99de2675ec70a7083a778868d5` — Moscow publication time helpers;
- `4ab6f08d7ff41aa2c7a08b369b1d1644e04d3c84` — create page Moscow time conversion;
- `81d70102653bbc8016f33e8c0d4088dd47228dc7` — edit page Moscow time conversion;
- `7601b80574961ffdda35f2518e99b7a1594d00bb` — shortcode UI and Moscow time label;
- `d0a00a4b093df60a1d13d76bea107ddcb225797a` — preserve shortcode slots on create;
- `b37296b170b51304f8f8212ff308efaa4c197941` — preserve shortcode slots on edit;
- `58cf9d38248ddfa456f88d2e58575de082f8e30e` — render product block shortcodes on storefront.

## Откат

Base до блока: `4acec2117f15fe079341f1c665f338c5ede9a895`.
Код можно сопоставлять/откатывать по отдельным коммитам выше. DB migration автоматически вниз не откатывать: после использования новые таблицы могут содержать созданных авторов и связи. Для полного DB rollback сначала экспортировать новые данные и подготовить отдельный down-script.
