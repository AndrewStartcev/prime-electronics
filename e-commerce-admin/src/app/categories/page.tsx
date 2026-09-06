"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EyeOff, GripVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi, type Category } from "@/shared/api";
import {
  Button,
  Card,
  CardContent,
  GridSkeleton,
  ErrorMessage,
  Input,
  TablePagination,
  TableSearch,
} from "@/shared/ui";
import {
  useAdminAccess,
  useCategories,
  useDeleteCategory,
  useReorderMainCategories,
  useUpdateCategory,
} from "@/shared/hooks";

type CategoryStatusFilter = "all" | "active" | "inactive";

const CATEGORY_STATUS_FILTER_OPTIONS: Array<{
  value: CategoryStatusFilter;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Все категории",
    description: "Активные и выключенные",
  },
  {
    value: "active",
    label: "Включенные",
    description: "Показываются на сайте",
  },
  {
    value: "inactive",
    label: "Выключенные",
    description: "Скрыты с сайта",
  },
];

function normalizeMainCategoryOrder(categories: Category[]) {
  return categories.map((category, index) => ({
    ...category,
    mainSortOrder: index + 1,
  }));
}

function moveCategory(
  categories: Category[],
  sourceId: string,
  targetId: string
) {
  const sourceIndex = categories.findIndex((category) => category.id === sourceId);
  const targetIndex = categories.findIndex((category) => category.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return categories;
  }

  const nextCategories = [...categories];
  const [movedCategory] = nextCategories.splice(sourceIndex, 1);
  nextCategories.splice(targetIndex, 0, movedCategory);

  return normalizeMainCategoryOrder(nextCategories);
}

function sortCategoriesByOrder(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    return a.title.localeCompare(b.title, "ru");
  });
}

function sortMainCategoriesByOrder(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const orderDiff = (a.mainSortOrder ?? 0) - (b.mainSortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    return a.title.localeCompare(b.title, "ru");
  });
}

function extractCategorySlug(value: string) {
  const rawValue = value.trim();
  if (!rawValue) return "";

  let path = rawValue;

  if (/^https?:\/\//i.test(rawValue)) {
    try {
      path = new URL(rawValue).pathname;
    } catch {
      path = rawValue;
    }
  }

  const cleanPath = path.split(/[?#]/)[0].replace(/\/+$/g, "");
  const catalogMatch = cleanPath.match(/(?:^|\/)catalog\/([^/]+)$/);
  const slug = catalogMatch?.[1] || cleanPath.replace(/^\/+/g, "");

  return decodeURIComponent(slug.trim());
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;

  return typeof message === "string" && message ? message : fallback;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryStatusFilter, setCategoryStatusFilter] =
    useState<CategoryStatusFilter>("all");
  const { data, isLoading, error } = useCategories({
    page: 1,
    limit: 1000,
    includeInactive: true,
  });
  const deleteCategory = useDeleteCategory();
  const reorderMainCategories = useReorderMainCategories();
  const updateCategory = useUpdateCategory();
  const { canDeleteCategories } = useAdminAccess();
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [draggedMainCategoryId, setDraggedMainCategoryId] = useState<
    string | null
  >(null);
  const [dragOverMainCategoryId, setDragOverMainCategoryId] = useState<
    string | null
  >(null);
  const [categoryLookup, setCategoryLookup] = useState("");
  const [categoryLookupError, setCategoryLookupError] = useState("");
  const [isCategoryLookupLoading, setIsCategoryLookupLoading] = useState(false);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setOrderedCategories(data?.data ?? []);
  }, [data?.data]);

  const categoryStatusCounts = orderedCategories.reduce(
    (acc, category) => {
      acc.all += 1;
      if (category.isActive) acc.active += 1;
      else acc.inactive += 1;

      return acc;
    },
    { all: 0, active: 0, inactive: 0 } satisfies Record<
      CategoryStatusFilter,
      number
    >
  );

  const matchesCategoryFilters = (category: Category) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch = normalizedSearch
      ? category.title.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesStatus =
      categoryStatusFilter === "all" ||
      (categoryStatusFilter === "active"
        ? category.isActive
        : !category.isActive);

    return matchesSearch && matchesStatus;
  };

  const filteredCategories = orderedCategories.filter(matchesCategoryFilters);
  const mainCategories = sortMainCategoriesByOrder(
    orderedCategories
      .filter((category) => category.isMain)
      .filter(matchesCategoryFilters)
  );
  const secondaryCategories = sortCategoriesByOrder(
    filteredCategories.filter((category) => !category.isMain)
  );

  const totalFiltered = secondaryCategories.length;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  const paginatedCategories = secondaryCategories.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: CategoryStatusFilter) => {
    setCategoryStatusFilter(value);
    setPage(1);
  };

  const [deleteError, setDeleteError] = useState("");

  const handleCategoryLookupSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const slug = extractCategorySlug(categoryLookup);
    if (!slug) {
      setCategoryLookupError("Введите URL или slug категории");
      return;
    }

    setCategoryLookupError("");
    setIsCategoryLookupLoading(true);

    try {
      const category = await categoriesApi.getBySlug(slug);
      router.push(`/categories/${category.id}`);
    } catch {
      setCategoryLookupError(`Категория /${slug} не найдена`);
    } finally {
      setIsCategoryLookupLoading(false);
    }
  };

  const handleMainDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    categoryId: string
  ) => {
    if (reorderMainCategories.isPending) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryId);
    setDraggedMainCategoryId(categoryId);
  };

  const handleMainDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) => {
    if (!draggedMainCategoryId || draggedMainCategoryId === categoryId) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverMainCategoryId(categoryId);
  };

  const handleMainDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    event.preventDefault();

    const sourceId =
      draggedMainCategoryId || event.dataTransfer.getData("text/plain");
    setDraggedMainCategoryId(null);
    setDragOverMainCategoryId(null);

    if (!sourceId || sourceId === targetId || reorderMainCategories.isPending) {
      return;
    }

    const previousCategories = orderedCategories;
    const nextMainCategories = moveCategory(mainCategories, sourceId, targetId);

    if (nextMainCategories === mainCategories) return;

    const mainOrderById = new Map(
      nextMainCategories.map((category) => [
        category.id,
        category.mainSortOrder ?? 0,
      ])
    );
    const nextCategories = previousCategories.map((category) =>
      mainOrderById.has(category.id)
        ? { ...category, mainSortOrder: mainOrderById.get(category.id) }
        : category
    );

    setOrderedCategories(nextCategories);

    try {
      await reorderMainCategories.mutateAsync(
        nextMainCategories.map((category, index) => ({
          id: category.id,
          mainSortOrder: index + 1,
        }))
      );
      toast.success("Порядок главных категорий сохранен");
    } catch (error: unknown) {
      setOrderedCategories(previousCategories);
      toast.error(
        getApiErrorMessage(
          error,
          "Не удалось сохранить порядок главных категорий"
        )
      );
    }
  };

  const handleMainStatusChange = async (category: Category, isMain: boolean) => {
    const previousCategories = orderedCategories;
    setOrderedCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? { ...item, isMain, mainSortOrder: isMain ? item.mainSortOrder : 0 }
          : item
      )
    );

    try {
      await updateCategory.mutateAsync({
        id: category.id,
        data: { isMain },
      });
      toast.success(
        isMain
          ? "Категория добавлена в главные"
          : "Категория убрана из главных"
      );
    } catch (error: unknown) {
      setOrderedCategories(previousCategories);
      toast.error(
        getApiErrorMessage(error, "Не удалось изменить главную категорию")
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDeleteCategories) {
      setDeleteError("У менеджера нет прав на удаление категорий");
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить эту категорию?")) return;
    setDeleteError("");
    try {
      await deleteCategory.mutateAsync(id);
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error, "Не удалось удалить категорию");
      setDeleteError(
        msg.includes("associated products")
          ? "Невозможно удалить категорию — в ней есть товары. Сначала переместите или удалите товары."
          : msg.includes("child")
          ? "Невозможно удалить категорию — у неё есть подкатегории."
          : msg
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <GridSkeleton items={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Категории
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить категории"
          message="Произошла ошибка при загрузке списка категорий. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Категории
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление категориями товаров
            {data && ` (${mainCategories.length} главных, ${totalFiltered} остальных)`}
          </p>
        </div>
        <Link href="/categories/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить категорию
          </Button>
        </Link>
      </div>

      {/* Search */}
      <TableSearch
        value={search}
        onChange={handleSearchChange}
        placeholder="Поиск категорий..."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary-black">
          Статус категории
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CATEGORY_STATUS_FILTER_OPTIONS.map((option) => {
            const isSelected = categoryStatusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusFilterChange(option.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary-orange bg-primary-orange/10 text-primary-black"
                    : "border-gray-200 bg-white text-primary-black hover:bg-secondary-gray/60"
                }`}
                aria-pressed={isSelected}
              >
                <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                  {option.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isSelected
                        ? "bg-primary-orange text-white"
                        : "bg-secondary-gray text-text-secondary-black"
                    }`}
                  >
                    {categoryStatusCounts[option.value]}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-text-secondary-black">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="pt-0">
          <form
            onSubmit={handleCategoryLookupSubmit}
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <Input
                label="Открыть категорию по URL или slug"
                value={categoryLookup}
                onChange={(event) => {
                  setCategoryLookup(event.target.value);
                  if (categoryLookupError) setCategoryLookupError("");
                }}
                error={categoryLookupError}
                placeholder="https://prime-electronics.ru/catalog/honor-1"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              isLoading={isCategoryLookupLoading}
              className="w-full lg:w-auto"
            >
              Открыть
            </Button>
          </form>
        </CardContent>
      </Card>

      {mainCategories.length > 0 && (
        <Card>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-primary-black">
                  Главные категории
                </h2>
                <p className="text-sm text-text-secondary-black mt-1">
                  Перетаскивайте главные категории здесь, даже если в общем
                  списке они находятся на разных страницах.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-secondary-gray px-3 py-1 text-sm text-text-secondary-black">
                {mainCategories.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {mainCategories.map((category) => (
                <div
                  key={category.id}
                  onDragOver={(event) =>
                    handleMainDragOver(event, category.id)
                  }
                  onDragLeave={() => setDragOverMainCategoryId(null)}
                  onDrop={(event) => handleMainDrop(event, category.id)}
                  className={`flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-3 transition-all ${
                    draggedMainCategoryId === category.id ? "opacity-60" : ""
                  } ${
                    dragOverMainCategoryId === category.id
                      ? "ring-2 ring-primary-orange ring-offset-2"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    draggable={!reorderMainCategories.isPending}
                    onDragStart={(event) =>
                      handleMainDragStart(event, category.id)
                    }
                    onDragEnd={() => {
                      setDraggedMainCategoryId(null);
                      setDragOverMainCategoryId(null);
                    }}
                    className="shrink-0 rounded-lg p-2 text-text-secondary-black hover:bg-secondary-gray hover:text-primary-black cursor-grab active:cursor-grabbing transition-colors"
                    aria-label={`Изменить приоритет главной категории ${category.title}`}
                    title="Перетащите, чтобы изменить приоритет"
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>

                  <div className="w-10 h-10 bg-secondary-gray rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-5 h-5 text-primary-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-primary-black">
                      {category.title}
                    </p>
                    <p className="truncate text-xs text-text-secondary-black">
                      /{category.slug}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-text-secondary-black">
                    #{category.mainSortOrder || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMainStatusChange(category, false)}
                    disabled={updateCategory.isPending}
                    className="shrink-0 rounded-lg p-2 text-text-secondary-black transition-colors hover:bg-secondary-gray hover:text-primary-black disabled:opacity-50"
                    aria-label={`Убрать ${category.title} из главных категорий`}
                    title="Убрать из главных категорий"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/categories/${category.id}`}
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm">
                      Ред.
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Error */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-red-400 hover:text-red-600 ml-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {reorderMainCategories.isPending && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-primary-orange text-sm">
          Сохраняем порядок категорий...
        </div>
      )}

      {/* Categories Grid */}
      {paginatedCategories.length === 0 && (
        <div className="text-center py-12 text-text-secondary-black">
          {search ? `Категории по запросу «${search}» не найдены` : "Нет категорий"}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {paginatedCategories.map((category) => (
          <Card key={category.id}>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-secondary-gray rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-primary-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium shrink-0 ${
                    category.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {category.isActive ? "Активна" : "Неактивна"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary-black">
                {category.title}
              </h3>
              <p className="text-sm text-text-secondary-black mt-1">
                /{category.slug}
              </p>
              <p className="text-sm text-text-secondary-black mt-2">
                {category._count?.products || 0} товаров
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Link href={`/categories/${category.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    Редактировать
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => handleMainStatusChange(category, true)}
                  disabled={updateCategory.isPending}
                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label={`Добавить ${category.title} в главные категории`}
                  title="Добавить в главные категории"
                >
                  <Star className="h-4 w-4 text-primary-orange" />
                </button>
                {canDeleteCategories && (
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Удалить категорию ${category.title}`}
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={totalFiltered}
        label="категорий"
      />
    </div>
  );
}
