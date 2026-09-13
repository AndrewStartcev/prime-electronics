# PRIME Electronics — журнал реализации клиентских задач

Этот файл фиксирует изменения, которые сделаны в техническом репозитории `AndrewStartcev/prime-electronics`, чтобы их можно было сопоставить с параллельно меняющимся production Git клиента.

> Дата реализации блока: **13.09.2026**  
> Рабочая ветка: `task/pe-07-08-09-blog-content`  
> Статус: **реализовано в коде, требуется локальная проверка перед переносом в production**.

---

## PE-07 — дата публикации и отложенная публикация

### Что сделано

- у статьи появилась отдельная дата `publishedAt`; `createdAt` остаётся технической датой создания записи;
- существующим статьям при миграции `publishedAt` заполняется их текущим `createdAt`, поэтому видимые даты старых материалов не теряются;
- публичный API отдаёт только статьи, у которых одновременно `isActive = true` и `publishedAt <= текущее время`;
- статьи сортируются по `publishedAt DESC`;
- будущая дата не требует cron-задачи: статья автоматически начинает попадать в публичные запросы после наступления времени;
- Redis-кеш списка блога больше не может пережить ближайшую запланированную публикацию: TTL ограничивается временем до неё (максимум 1 час);
- в админке можно выбрать прошлую, текущую или будущую дату и время;
- в списке админки различаются статусы `Черновик`, `Запланирована`, `Опубликована`;
- storefront показывает `publishedAt`, а не `createdAt`.

### Файлы PE-07

- `ecommerce-backend/prisma/schema.prisma`
- `ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`
- `ecommerce-backend/src/blog/dto/create-blog.dto.ts`
- `ecommerce-backend/src/blog/services/blog.service.ts`
- `ecommerce-backend/src/blog/services/cache.service.ts`
- `e-commerce-admin/src/shared/hooks/useBlogs.ts`
- `e-commerce-admin/src/app/blog/new/page.tsx`
- `e-commerce-admin/src/app/blog/[id]/page.tsx`
- `e-commerce-admin/src/app/blog/page.tsx`
- `e-commerce/src/shared/api/blogApi.ts`
- `e-commerce/src/app/blog/[id]/BlogPostPageClient.tsx`

### Проверить перед production

1. Старая опубликованная статья после миграции остаётся доступной и получает прежнюю дату создания как дату публикации.
2. Черновик не открывается на storefront.
3. Активная статья с датой на 5–10 минут вперёд не доступна до указанного времени и появляется после него без ручного переключения.
4. Ручная установка прошлой даты меняет отображаемую дату статьи и порядок в блоге.
5. Проверить timezone production-сервера и значение, которое отправляет `datetime-local` из админки.

---

## PE-08 — отдельные авторы статей

### Что сделано

- добавлена отдельная сущность `BlogAuthor`;
- поля автора: `name`, `avatarUrl`, `bio`, `isActive`, даты создания/изменения;
- в `Blog` добавлена связь `authorId`;
- старое строковое поле `Blog.author` **не удалено** и остаётся fallback для обратной совместимости;
- миграция создаёт профили из всех уникальных старых значений `Blog.author` и связывает существующие статьи с созданными профилями;
- при переименовании автора legacy-поле связанных статей синхронизируется;
- удаление автора не удаляет статьи: `authorId` становится `NULL`, а старое имя остаётся в `author`;
- добавлен CRUD API `/blog-authors` под `AdminGuard`;
- в админке появился раздел `/blog/authors` с созданием, редактированием, аватаром, bio и включением/выключением автора;
- на форме статьи автор выбирается из списка профилей;
- storefront использует реальный аватар, имя и bio автора, а при отсутствии профиля сохраняет старый fallback.

### Файлы PE-08

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

### Проверить перед production

1. После миграции количество статей не изменилось.
2. Для существующей `Редакция Prime` создан профиль и старые статьи связаны с ним.
3. Создание нового автора, загрузка аватара и bio работают из админки.
4. Выбор автора в статье сохраняется.
5. В шапке статьи и в нижней карточке автора выводятся одинаковые профильные данные.
6. Удаление автора не удаляет статью и оставляет legacy-имя.

---

## PE-09 — товарные блоки в статьях

### Что сделано

- товары не копируются в HTML и не сохраняются snapshot-данными;
- добавлена модель `BlogProductBlock` для блока статьи;
- добавлена модель `BlogProductBlockItem` для связи блока с реальными `Product`;
- добавлен enum `BlogProductPlacement`: `AFTER_ARTICLE` и резерв `INLINE`;
- текущий UI реализует согласованный безопасный вариант `AFTER_ARTICLE`;
- можно создать несколько товарных блоков, задать заголовок, искать товары каталога, добавлять/удалять их и менять порядок;
- backend хранит только связи и порядок;
- публичная статья получает актуальные данные товара из каталога: название, slug, цену, изображения, атрибуты и остатки;
- неактивные/удалённые товары в публичном блоке не выводятся;
- storefront выводит блок после HTML-контента через существующий `ProductCard`;
- HTML-редактор PE-06 не изменялся и не зависит от товарных блоков;
- `INLINE` оставлен в модели для следующего этапа, но TipTap-node/шорткоды сейчас намеренно не добавлялись.

### Файлы PE-09

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

### Проверить перед production

1. Поиск товара в форме статьи работает по реальному каталогу.
2. Один товар нельзя добавить дважды в один блок.
3. Порядок выбранных товаров сохраняется после повторного открытия статьи.
4. Цена/картинка/наличие меняются на странице статьи вместе с данными самого товара, без повторного сохранения статьи.
5. Неактивный или удалённый товар пропадает из публичного блока.
6. Удаление статьи каскадно удаляет только её блоки/связи и не затрагивает товары.

---

## Миграция БД

Файл:

`ecommerce-backend/prisma/migrations/20260913170000_blog_scheduling_authors_product_blocks/migration.sql`

Миграция **additive**:

- не удаляет существующие поля `Blog`;
- не удаляет статьи;
- не удаляет строковый `author`;
- добавляет `publishedAt`, `authorId` и новые таблицы;
- выполняет backfill даты публикации и авторов.

### Важно при переносе в production Git

Production-репозиторий меняется параллельно, поэтому миграцию нельзя просто копировать вслепую, если после базовой версии клиента уже появились новые Prisma migration. Перед переносом:

1. сравнить актуальный production `schema.prisma` с этим изменением;
2. проверить список production migrations после `20260722160000_add_main_category_controls`;
3. если имя/timestamp миграции конфликтует — создать новую миграцию с тем же SQL-смыслом поверх актуальной production-схемы;
4. сначала сделать backup production DB;
5. только затем применять migration штатным production-процессом;
6. после применения выполнить `prisma generate` при обычном deployment-процессе backend.

## Коммиты рабочего блока

- `1da4fd9259ac93e524086cd70273f279425b1c3a` — `feat(backend): add blog scheduling authors and product blocks`
- `b541d7b1b80ffad396fe676d2b0ba1e2601484cd` — `feat(admin): manage blog publication authors and product blocks`
- `76dca9297aeee3b8725df1b298752602616725fb` — `feat(site): render scheduled blog metadata authors and products`

## Откат

До проверки production изменения не должны смешиваться с другими клиентскими задачами. Код можно откатить тремя указанными коммитами. БД после применения миграции автоматически назад не откатывать: новые таблицы/колонки не мешают старому коду, а их удаление потенциально уничтожит уже созданных авторов и связи товарных блоков. Если потребуется полный DB rollback — сначала экспортировать новые данные и подготовить отдельный согласованный down-script.
