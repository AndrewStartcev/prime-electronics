"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SearchableSelect,
  SeoFields,
  TableSkeleton,
  Textarea,
  ErrorMessage,
} from "@/shared/ui";
import {
  useCategories,
  useCategory,
  useCategoryTree,
  useDeleteCategory,
  useAdminAccess,
  useReorderCategories,
  useUpdateCategory,
  useProducts,
} from "@/shared/hooks";
import { uploadApi, type Category } from "@/shared/api";
import { useMemo, useState, useEffect } from "react";
import {
  categoryOptionToSelectOption,
  collectCategoryDescendantIdsFromList,
  collectCategoryDescendantIds,
  flattenCategoryTree,
  mergeCategoryOptionsWithList,
} from "@/shared/lib";
import {
  CATEGORY_SEO_VARIABLES,
  resolveSeoFieldsPreview,
} from "@/shared/lib/seoVariables";

const CATALOG_FILTER_OPTIONS = [
  "Объём памяти",
  "Оперативная память",
  "Цвет",
  "SIM-карта",
  "Диагональ экрана",
  "Модификация",
];

function sortCategoriesForDisplay(categories: Category[]) {
  return [...categories].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    return a.title.localeCompare(b.title, "ru");
  });
}

function normalizeCategoryOrder(categories: Category[]) {
  return categories.map((category, index) => ({
    ...category,
    sortOrder: index + 1,
  }));
}

function moveCategory(
  categories: Category[],
  sourceId: string,
  targetId: string,
) {
  const sourceIndex = categories.findIndex(
    (category) => category.id === sourceId,
  );
  const targetIndex = categories.findIndex(
    (category) => category.id === targetId,
  );

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return categories;
  }

  const nextCategories = [...categories];
  const [movedCategory] = nextCategories.splice(sourceIndex, 1);
  nextCategories.splice(targetIndex, 0, movedCategory);

  return normalizeCategoryOrder(nextCategories);
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: category, isLoading, error } = useCategory(id);
  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useCategoryTree();
  const { data: categoriesData, isLoading: categoriesListLoading } =
    useCategories({ page: 1, limit: 5000 });
  const { data: categoryProducts } = useProducts(
    {
      categoryId: id,
      page: 1,
      limit: 1,
      sortBy: "price_asc",
    },
    { enabled: Boolean(id) },
  );
  const updateCategory = useUpdateCategory();
  const reorderCategories = useReorderCategories();
  const deleteCategory = useDeleteCategory();
  const { canDeleteCategories } = useAdminAccess();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    isActive: true,
    isMain: false,
    mainSortOrder: 0,
    parentId: "",
    image: "",
    seoTitle: "",
    seoDescription: "",
    seoH1: "",
    filterAttributes: [] as string[],
  });
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [orderedChildren, setOrderedChildren] = useState<Category[]>([]);
  const [draggedChildId, setDraggedChildId] = useState<string | null>(null);
  const [dragOverChildId, setDragOverChildId] = useState<string | null>(null);

  // Update form data when category loads
  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title || "",
        slug: category.slug || "",
        description: category.description || "",
        isActive: category.isActive !== false,
        isMain: category.isMain === true,
        mainSortOrder: category.mainSortOrder || 0,
        parentId: category.parentId || "",
        image: category.image || "",
        seoTitle: category.seoTitle || "",
        seoDescription: category.seoDescription || "",
        seoH1: category.seoH1 || "",
        filterAttributes: category.filterAttributes || [],
      });
      setOrderedChildren(sortCategoriesForDisplay(category.children || []));
    }
  }, [category]);

  const parentCategoryOptions = useMemo(() => {
    const excludedIds = collectCategoryDescendantIds(categoryTree, id);
    collectCategoryDescendantIdsFromList(
      categoriesData?.data || [],
      id,
    ).forEach((categoryId) => excludedIds.add(categoryId));
    excludedIds.add(id);

    return mergeCategoryOptionsWithList(
      flattenCategoryTree(categoryTree, { excludeIds: excludedIds }),
      categoriesData?.data || [],
      { excludeIds: excludedIds },
    ).map(categoryOptionToSelectOption);
  }, [categoriesData?.data, categoryTree, id]);

  const seoPreview = useMemo(
    () =>
      resolveSeoFieldsPreview(
        {
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          seoH1: formData.seoH1,
        },
        {
          name: formData.title,
          productCount:
            categoryProducts?.meta.total ?? category?._count?.products ?? 0,
          minPrice: categoryProducts?.data[0]?.price,
        },
      ),
    [
      category?._count?.products,
      categoryProducts?.data,
      categoryProducts?.meta.total,
      formData.seoDescription,
      formData.seoH1,
      formData.seoTitle,
      formData.title,
    ],
  );

  const handleChildDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    childId: string,
  ) => {
    if (reorderCategories.isPending) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", childId);
    setDraggedChildId(childId);
  };

  const handleChildDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    childId: string,
  ) => {
    if (!draggedChildId || draggedChildId === childId) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverChildId(childId);
  };

  const handleChildDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ) => {
    event.preventDefault();

    const sourceId = draggedChildId || event.dataTransfer.getData("text/plain");
    setDraggedChildId(null);
    setDragOverChildId(null);

    if (!sourceId || sourceId === targetId || reorderCategories.isPending) {
      return;
    }

    const previousChildren = orderedChildren;
    const nextChildren = moveCategory(previousChildren, sourceId, targetId);

    if (nextChildren === previousChildren) return;

    setOrderedChildren(nextChildren);

    try {
      await reorderCategories.mutateAsync(
        nextChildren.map((child, index) => ({
          id: child.id,
          sortOrder: index + 1,
        })),
      );
      toast.success("Порядок подкатегорий сохранен");
    } catch (error: any) {
      setOrderedChildren(previousChildren);
      toast.error(
        error?.response?.data?.message ||
          "Не удалось сохранить порядок подкатегорий",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.title.trim()) {
      setSubmitError("Введите название категории");
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id,
        data: {
          ...formData,
          description: formData.description.trim(),
          slug: formData.slug.trim() || undefined,
          parentId: formData.parentId || undefined,
          image: formData.image || undefined,
          seoTitle: formData.seoTitle.trim(),
          seoDescription: formData.seoDescription.trim(),
          seoH1: formData.seoH1.trim(),
        },
      });
      router.push("/categories");
    } catch (error: any) {
      console.error("Error updating category:", error);
      setSubmitError(
        error?.response?.data?.message || "Не удалось сохранить изменения",
      );
    }
  };

  const getDeleteErrorMessage = (error: any) =>
    error?.response?.data?.message || "Не удалось удалить категорию";

  const handleDeleteCurrentCategory = async () => {
    if (!canDeleteCategories) {
      toast.error("У менеджера нет прав на удаление категорий");
      return;
    }

    const categoryTitle = category?.title || "эту категорию";
    if (!window.confirm(`Удалить категорию «${categoryTitle}»?`)) return;

    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Категория удалена");
      router.push("/categories");
    } catch (error: any) {
      toast.error(getDeleteErrorMessage(error));
    }
  };

  const handleDeleteChildCategory = async (child: Category) => {
    if (!canDeleteCategories) {
      toast.error("У менеджера нет прав на удаление категорий");
      return;
    }

    if (!window.confirm(`Удалить подкатегорию «${child.title}»?`)) return;

    try {
      await deleteCategory.mutateAsync(child.id);
      setOrderedChildren((children) =>
        children.filter((item) => item.id !== child.id),
      );
      toast.success("Подкатегория удалена");
    } catch (error: any) {
      toast.error(getDeleteErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </div>
        <Card>
          <CardContent>
            <TableSkeleton rows={8} columns={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Категория не найдена
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить категорию"
          message="Категория не найдена или произошла ошибка при загрузке данных."
        />
        <Link href="/categories">
          <Button variant="outline">Вернуться к категориям</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Link
              href="/categories"
              className="p-2 hover:bg-secondary-gray rounded-lg transition-colors mt-0.5"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
                Редактировать категорию
              </h1>
              <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
                {category.title}
              </p>
            </div>
          </div>
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {submitError}
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/categories" className="flex-1 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto justify-center"
              >
                Отмена
              </Button>
            </Link>
            {canDeleteCategories && (
              <Button
                type="button"
                variant="danger"
                className="flex-1 sm:flex-none justify-center"
                disabled={deleteCategory.isPending}
                onClick={handleDeleteCurrentCategory}
              >
                {deleteCategory.isPending ? "Удаление..." : "Удалить"}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="flex-1 sm:flex-none justify-center"
              disabled={updateCategory.isPending}
            >
              {updateCategory.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Название категории"
                    placeholder="Введите название категории"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <Input
                    label="Slug (URL)"
                    placeholder="nazvanie-kategorii"
                    helperText="Используется в URL адресе"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <Textarea
                    label="Описание под товарами (HTML)"
                    helperText="Можно вставить HTML-код. На странице категории текст выводится после товарной сетки и пагинации."
                    placeholder="<h2>О категории</h2><p>Текст описания...</p>"
                    rows={8}
                    className="min-h-40 font-mono !resize-y"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <SeoFields
                  value={{
                    seoTitle: formData.seoTitle,
                    seoDescription: formData.seoDescription,
                    seoH1: formData.seoH1,
                  }}
                  variables={CATEGORY_SEO_VARIABLES}
                  preview={seoPreview}
                  onChange={(seoFields) =>
                    setFormData({ ...formData, ...seoFields })
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Фильтры каталога</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary-black">
                    Выберите характеристики для фильтра на странице этой категории.
                    Без выбора будут показаны все доступные характеристики.
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CATALOG_FILTER_OPTIONS.map((attribute) => {
                      const isSelected = formData.filterAttributes.includes(attribute);

                      return (
                        <label
                          key={attribute}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-primary-black transition-colors hover:bg-secondary-gray/60"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setFormData((current) => ({
                                ...current,
                                filterAttributes: isSelected
                                  ? current.filterAttributes.filter(
                                      (item) => item !== attribute,
                                    )
                                  : [...current.filterAttributes, attribute],
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                          />
                          {attribute}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Подкатегории</CardTitle>
              </CardHeader>
              <CardContent>
                {orderedChildren.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-text-secondary-black">
                    У этой категории пока нет подкатегорий
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderedChildren.map((child, index) => (
                      <div
                        key={child.id}
                        onDragOver={(event) =>
                          handleChildDragOver(event, child.id)
                        }
                        onDragLeave={() => setDragOverChildId(null)}
                        onDrop={(event) => handleChildDrop(event, child.id)}
                        className={`flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 transition-all ${
                          draggedChildId === child.id ? "opacity-60" : ""
                        } ${
                          dragOverChildId === child.id
                            ? "ring-2 ring-primary-orange ring-offset-2"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          draggable={!reorderCategories.isPending}
                          onDragStart={(event) =>
                            handleChildDragStart(event, child.id)
                          }
                          onDragEnd={() => {
                            setDraggedChildId(null);
                            setDragOverChildId(null);
                          }}
                          className="shrink-0 rounded-lg p-2 text-text-secondary-black hover:bg-secondary-gray hover:text-primary-black cursor-grab active:cursor-grabbing transition-colors"
                          aria-label={`Изменить приоритет подкатегории ${child.title}`}
                          title="Перетащите, чтобы изменить приоритет"
                        >
                          <GripVertical className="h-5 w-5" />
                        </button>

                        <span className="w-10 shrink-0 text-sm font-semibold text-text-secondary-black">
                          #{index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-primary-black">
                            {child.title}
                          </p>
                          <p className="truncate text-xs text-text-secondary-black">
                            /{child.slug}
                          </p>
                        </div>

                        <Link href={`/categories/${child.id}`}>
                          <Button type="button" variant="outline" size="sm">
                            Открыть
                          </Button>
                        </Link>
                        {canDeleteCategories && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={deleteCategory.isPending}
                            onClick={() => handleDeleteChildCategory(child)}
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Статус</CardTitle>
              </CardHeader>
              <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                  />
                  <span className="text-sm text-primary-black">
                    Категория активна
                </span>
              </label>
              <label className="mt-4 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMain}
                  onChange={(e) =>
                    setFormData({ ...formData, isMain: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                />
                <span className="text-sm text-primary-black">
                  Показывать в главных категориях
                </span>
              </label>
              {formData.isMain && (
                <div className="mt-4">
                  <Input
                    label="Порядок в главных"
                    type="number"
                    min="0"
                    helperText="0 — автоматически поставить в конец списка"
                    value={String(formData.mainSortOrder)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mainSortOrder: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
            </Card>

            {/* Parent Category */}
            <Card>
              <CardHeader>
                <CardTitle>Родительская категория</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1.5">
                  <SearchableSelect
                    placeholder="Найти родительскую категорию"
                    emptyLabel="Категория не найдена"
                    emptyValueLabel="Без родительской категории"
                    emptyOptionLabel="Без родительской категории"
                    emptyOptionDescription="Категория будет показана в корне каталога"
                    showImages
                    options={parentCategoryOptions}
                    value={formData.parentId}
                    onChange={(value) =>
                      setFormData({ ...formData, parentId: value })
                    }
                    disabled={categoriesLoading || categoriesListLoading}
                  />
                  <p className="text-xs text-text-secondary-black">
                    Оставьте поле пустым, чтобы категория была корневой
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Изображение</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.image && (
                    <div className="relative">
                      <img
                        src={formData.image}
                        alt={formData.title}
                        className="w-full aspect-video object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const res = await uploadApi.uploadImage(file);
                          setFormData((prev) => ({ ...prev, image: res.url }));
                        } catch (err) {
                          console.error("Upload failed:", err);
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                    <div className="px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-primary-orange transition-colors">
                      <span className="text-sm text-text-secondary-black">
                        {uploading
                          ? "Загрузка..."
                          : "Нажмите для загрузки изображения"}
                      </span>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
