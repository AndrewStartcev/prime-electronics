"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SeoFields,
  Textarea,
} from "@/shared/ui";
import type { SeoFieldsValue } from "@/shared/ui";
import type {
  SeoCollection,
  SeoCollectionSortBy,
  SeoTagTile,
  UpsertSeoCollectionDto,
  UpsertSeoTagTileDto,
} from "@/shared/api";
import {
  useActiveBrands,
  useCategoryTree,
  useCreateSeoCollection,
  useCreateSeoTagTile,
  useDeleteSeoCollection,
  useDeleteSeoTagTile,
  useRobots,
  useSeoCollections,
  useSeoTagTiles,
  useUpdateRobots,
  useUpdateSeoCollection,
  useUpdateSeoTagTile,
} from "@/shared/hooks";
import { flattenCategoryTree } from "@/shared/lib";

type AttributeRow = { name: string; value: string };

type CollectionFormState = {
  name: string;
  slug: string;
  categoryId: string;
  brandIds: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  isOnSale: boolean;
  sortBy: SeoCollectionSortBy | "";
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoH1: string;
  isActive: boolean;
  sortOrder: string;
  attributes: AttributeRow[];
};

type TagTileFormState = {
  title: string;
  image: string;
  categoryId: string;
  collectionId: string;
  url: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyCollectionForm = (): CollectionFormState => ({
  name: "",
  slug: "",
  categoryId: "",
  brandIds: [],
  minPrice: "",
  maxPrice: "",
  inStock: false,
  isOnSale: false,
  sortBy: "popularity",
  description: "",
  seoTitle: "",
  seoDescription: "",
  seoH1: "",
  isActive: true,
  sortOrder: "0",
  attributes: [],
});

const emptyTagTileForm = (): TagTileFormState => ({
  title: "",
  image: "",
  categoryId: "",
  collectionId: "",
  url: "",
  isActive: true,
  sortOrder: "0",
});

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9а-я-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function attributesToRows(
  attributes?: Record<string, string[]> | null,
): AttributeRow[] {
  return Object.entries(attributes || {}).flatMap(([name, values]) =>
    values.map((value) => ({ name, value })),
  );
}

function rowsToAttributes(rows: AttributeRow[]): Record<string, string[]> {
  return rows.reduce<Record<string, string[]>>((result, row) => {
    const name = row.name.trim();
    const value = row.value.trim();
    if (!name || !value) return result;

    const values = result[name] || [];
    if (!values.includes(value)) values.push(value);
    result[name] = values;
    return result;
  }, {});
}

function collectionToForm(collection: SeoCollection): CollectionFormState {
  return {
    name: collection.name,
    slug: collection.slug,
    categoryId: collection.categoryId || "",
    brandIds: collection.brandIds || [],
    minPrice: collection.minPrice?.toString() || "",
    maxPrice: collection.maxPrice?.toString() || "",
    inStock: collection.inStock,
    isOnSale: collection.isOnSale,
    sortBy: collection.sortBy || "popularity",
    description: collection.description || "",
    seoTitle: collection.seoTitle || "",
    seoDescription: collection.seoDescription || "",
    seoH1: collection.seoH1 || "",
    isActive: collection.isActive,
    sortOrder: String(collection.sortOrder || 0),
    attributes: attributesToRows(collection.attributes),
  };
}

function tagTileToForm(tile: SeoTagTile): TagTileFormState {
  return {
    title: tile.title,
    image: tile.image || "",
    categoryId: tile.categoryId || "",
    collectionId: tile.collectionId || "",
    url: tile.url || "",
    isActive: tile.isActive,
    sortOrder: String(tile.sortOrder || 0),
  };
}

function toNullableNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function AttributeFiltersEditor({
  value,
  onChange,
}: {
  value: AttributeRow[];
  onChange: (value: AttributeRow[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-primary-black">
          Характеристики для фильтра
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...value, { name: "", value: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          Добавить
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-sm text-text-secondary-black">
          Например: Цвет — Черный, Память — 256 ГБ.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((row, index) => (
            <div key={`${index}-${row.name}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                aria-label="Название характеристики"
                placeholder="Характеристика"
                value={row.name}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...row, name: event.target.value };
                  onChange(next);
                }}
              />
              <Input
                aria-label="Значение характеристики"
                placeholder="Значение"
                value={row.value}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = { ...row, value: event.target.value };
                  onChange(next);
                }}
              />
              <button
                type="button"
                aria-label="Удалить характеристику"
                title="Удалить характеристику"
                onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-text-secondary-black transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RobotsEditor() {
  const { data, isLoading } = useRobots();
  const updateRobots = useUpdateRobots();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (data?.content !== undefined) setContent(data.content);
  }, [data?.content]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateRobots.mutateAsync(content);
      toast.success("robots.txt сохранен");
    } catch {
      toast.error("Не удалось сохранить robots.txt");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>robots.txt</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Правила для поисковых роботов"
            rows={12}
            value={content}
            disabled={isLoading}
            onChange={(event) => setContent(event.target.value)}
            helperText="Изменения публикуются по адресу /robots.txt сразу после сохранения."
            className="font-mono text-sm"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || updateRobots.isPending}>
              {updateRobots.isPending ? "Сохранение..." : "Сохранить robots.txt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CollectionsEditor() {
  const { data: collections = [] } = useSeoCollections();
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: brands = [] } = useActiveBrands();
  const createCollection = useCreateSeoCollection();
  const updateCollection = useUpdateSeoCollection();
  const deleteCollection = useDeleteSeoCollection();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionFormState>(emptyCollectionForm);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categoryTree),
    [categoryTree],
  );
  const isSaving = createCollection.isPending || updateCollection.isPending;

  const reset = () => {
    setEditingId(null);
    setForm(emptyCollectionForm());
  };

  const startEditing = (collection: SeoCollection) => {
    setEditingId(collection.id);
    setForm(collectionToForm(collection));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Заполните название и URL подборки");
      return;
    }

    const payload: UpsertSeoCollectionDto = {
      name: form.name.trim(),
      slug: makeSlug(form.slug),
      categoryId: form.categoryId || null,
      brandIds: form.brandIds,
      minPrice: toNullableNumber(form.minPrice),
      maxPrice: toNullableNumber(form.maxPrice),
      inStock: form.inStock,
      isOnSale: form.isOnSale,
      attributes: rowsToAttributes(form.attributes),
      sortBy: form.sortBy || null,
      description: form.description.trim() || null,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      seoH1: form.seoH1.trim() || null,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await updateCollection.mutateAsync({ id: editingId, data: payload });
        toast.success("SEO-подборка обновлена");
      } else {
        await createCollection.mutateAsync(payload);
        toast.success("SEO-подборка создана");
      }
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Не удалось сохранить подборку");
    }
  };

  const handleDelete = async (collection: SeoCollection) => {
    if (!window.confirm(`Удалить подборку «${collection.name}»?`)) return;
    try {
      await deleteCollection.mutateAsync(collection.id);
      if (editingId === collection.id) reset();
      toast.success("Подборка удалена");
    } catch {
      toast.error("Не удалось удалить подборку");
    }
  };

  const seoFields: SeoFieldsValue = {
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    seoH1: form.seoH1,
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary-black">SEO-подборки</h2>
          <p className="mt-1 text-sm text-text-secondary-black">
            Предварительно настроенные фильтры с отдельным SEO-URL.
          </p>
        </div>
        <a
          href="https://prime-electronics.ru/collections"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary-orange hover:text-primary-black"
        >
          Открыть подборки
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Редактировать подборку" : "Новая подборка"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Название"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                    slug: previous.slug || makeSlug(event.target.value),
                  }))
                }
              />
              <Input
                label="URL"
                value={form.slug}
                helperText="Будет доступен как /collections/{url}"
                onChange={(event) => setForm({ ...form, slug: makeSlug(event.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-primary-black">
                Категория
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
                >
                  <option value="">Все категории</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Цена от"
                inputMode="decimal"
                value={form.minPrice}
                onChange={(event) => setForm({ ...form, minPrice: event.target.value })}
              />
              <Input
                label="Цена до"
                inputMode="decimal"
                value={form.maxPrice}
                onChange={(event) => setForm({ ...form, maxPrice: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-black">Бренды</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand) => {
                  const checked = form.brandIds.includes(brand.id);
                  return (
                    <label key={brand.id} className="flex items-center gap-2 text-sm text-primary-black">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm({
                            ...form,
                            brandIds: checked
                              ? form.brandIds.filter((id) => id !== brand.id)
                              : [...form.brandIds, brand.id],
                          })
                        }
                        className="h-4 w-4 accent-primary-orange"
                      />
                      <span className="truncate">{brand.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 self-end text-sm text-primary-black">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(event) => setForm({ ...form, inStock: event.target.checked })}
                  className="h-4 w-4 accent-primary-orange"
                />
                Только в наличии
              </label>
              <label className="flex items-center gap-2 self-end text-sm text-primary-black">
                <input
                  type="checkbox"
                  checked={form.isOnSale}
                  onChange={(event) => setForm({ ...form, isOnSale: event.target.checked })}
                  className="h-4 w-4 accent-primary-orange"
                />
                Только со скидкой
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-primary-black">
                Сортировка
                <select
                  value={form.sortBy}
                  onChange={(event) =>
                    setForm({ ...form, sortBy: event.target.value as SeoCollectionSortBy })
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
                >
                  <option value="popularity">По популярности</option>
                  <option value="price_asc">Сначала недорогие</option>
                  <option value="price_desc">Сначала дорогие</option>
                  <option value="newest">Сначала новые</option>
                  <option value="rating">По рейтингу</option>
                </select>
              </label>
            </div>

            <AttributeFiltersEditor
              value={form.attributes}
              onChange={(attributes) => setForm({ ...form, attributes })}
            />

            <Textarea
              label="Описание под товарами (HTML)"
              helperText="Можно вставить HTML-код. На странице подборки текст выводится после товарной сетки и пагинации."
              placeholder="<h2>О подборке</h2><p>Текст описания...</p>"
              rows={8}
              className="min-h-40 font-mono !resize-y"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <SeoFields
              value={seoFields}
              onChange={(fields) => setForm({ ...form, ...fields })}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Порядок"
                type="number"
                value={form.sortOrder}
                onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
              />
              <label className="flex items-center gap-2 self-end pb-3 text-sm text-primary-black">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 accent-primary-orange"
                />
                Подборка активна
              </label>
              <div className="flex items-end justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={reset}>
                    Отмена
                  </Button>
                )}
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Сохранение..." : editingId ? "Сохранить" : "Создать подборку"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {collections.length === 0 ? (
          <p className="p-4 text-sm text-text-secondary-black">Подборок пока нет.</p>
        ) : (
          collections.map((collection) => (
            <div key={collection.id} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate font-medium text-primary-black">{collection.name}</p>
                <p className="mt-0.5 text-sm text-text-secondary-black">
                  /collections/{collection.slug} · {collection.isActive ? "активна" : "черновик"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`https://prime-electronics.ru/collections/${collection.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray hover:text-primary-black"
                  aria-label={`Открыть подборку ${collection.name}`}
                  title="Открыть"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => startEditing(collection)}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray hover:text-primary-black"
                  aria-label={`Редактировать подборку ${collection.name}`}
                  title="Редактировать"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(collection)}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Удалить подборку ${collection.name}`}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TagTilesEditor() {
  const { data: tiles = [] } = useSeoTagTiles();
  const { data: collections = [] } = useSeoCollections();
  const { data: categoryTree = [] } = useCategoryTree();
  const createTile = useCreateSeoTagTile();
  const updateTile = useUpdateSeoTagTile();
  const deleteTile = useDeleteSeoTagTile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TagTileFormState>(emptyTagTileForm);
  const isSaving = createTile.isPending || updateTile.isPending;
  const categoryOptions = useMemo(
    () => flattenCategoryTree(categoryTree),
    [categoryTree],
  );

  const reset = () => {
    setEditingId(null);
    setForm(emptyTagTileForm());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.categoryId || (!form.collectionId && !form.url.trim())) {
      toast.error("Укажите название, категорию размещения и ссылку либо SEO-подборку");
      return;
    }

    const payload: UpsertSeoTagTileDto = {
      title: form.title.trim(),
      image: form.image.trim() || null,
      categoryId: form.categoryId,
      collectionId: form.collectionId || null,
      url: form.url.trim() || null,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await updateTile.mutateAsync({ id: editingId, data: payload });
        toast.success("Плитка обновлена");
      } else {
        await createTile.mutateAsync(payload);
        toast.success("Плитка создана");
      }
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Не удалось сохранить плитку");
    }
  };

  const handleDelete = async (tile: SeoTagTile) => {
    if (!window.confirm(`Удалить плитку «${tile.title}»?`)) return;
    try {
      await deleteTile.mutateAsync(tile.id);
      if (editingId === tile.id) reset();
      toast.success("Плитка удалена");
    } catch {
      toast.error("Не удалось удалить плитку");
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary-black">Плитки тегов</h2>
        <p className="mt-1 text-sm text-text-secondary-black">
          Теги выводятся облаком в выбранной категории или подкатегории и ведут на SEO-подборку либо нужный URL.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Редактировать плитку" : "Новая плитка"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Название"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <Input
                label="Изображение (URL, необязательно)"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-primary-black">
                SEO-подборка
                <select
                  value={form.collectionId}
                  onChange={(event) => {
                    const collectionId = event.target.value;
                    const collection = collections.find((item) => item.id === collectionId);
                    setForm({
                      ...form,
                      collectionId,
                      categoryId: collection?.categoryId || form.categoryId,
                    });
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
                >
                  <option value="">Не выбрана</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-primary-black">
                Где показывать тег
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
                >
                  <option value="">Выберите категорию</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Или свой URL"
                placeholder="/catalog/apple или https://..."
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Порядок"
                type="number"
                value={form.sortOrder}
                onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
              />
              <label className="flex items-center gap-2 self-end pb-3 text-sm text-primary-black">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  className="h-4 w-4 accent-primary-orange"
                />
                Плитка активна
              </label>
              <div className="flex items-end justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={reset}>
                    Отмена
                  </Button>
                )}
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Сохранение..." : editingId ? "Сохранить" : "Создать плитку"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tiles.length === 0 ? (
          <p className="text-sm text-text-secondary-black">Плиток пока нет.</p>
        ) : (
          tiles.map((tile) => (
            <div key={tile.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-primary-black">{tile.title}</p>
                <p className="mt-0.5 truncate text-sm text-text-secondary-black">
                  {tile.collection ? `/collections/${tile.collection.slug}` : tile.url || "Ссылка не выбрана"}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary-black">
                  {tile.category ? `Показывается: ${tile.category.title}` : "Категория размещения не выбрана"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(tile.id);
                    setForm(tagTileToForm(tile));
                  }}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray hover:text-primary-black"
                  aria-label={`Редактировать плитку ${tile.title}`}
                  title="Редактировать"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tile)}
                  className="rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Удалить плитку ${tile.title}`}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function SeoManagement() {
  return (
    <div className="space-y-8">
      <RobotsEditor />
      <CollectionsEditor />
      <TagTilesEditor />
    </div>
  );
}
