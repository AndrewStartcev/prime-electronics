"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SearchableSelect,
  SeoFields,
  Textarea,
} from "@/shared/ui";
import {
  useCategories,
  useCreateCategory,
  useCategoryTree,
} from "@/shared/hooks";
import { uploadApi } from "@/shared/api";
import {
  categoryOptionToSelectOption,
  flattenCategoryTree,
  mergeCategoryOptionsWithList,
} from "@/shared/lib";
import { CATEGORY_SEO_VARIABLES } from "@/shared/lib/seoVariables";

export default function NewCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();
  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useCategoryTree();
  const { data: categoriesData, isLoading: categoriesListLoading } =
    useCategories({ page: 1, limit: 5000 });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    isActive: true,
    isMain: false,
    mainSortOrder: 0,
    parentId: "",
    image: "",
    sortOrder: 0,
    seoTitle: "",
    seoDescription: "",
    seoH1: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[а-яё]/g, (ch) => {
        const map: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
          ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
          н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
          ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
          ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
        };
        return map[ch] || ch;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
    if (value.trim()) setErrors((prev) => ({ ...prev, title: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Введите название категории";
    if (!formData.slug.trim()) newErrors.slug = "Введите slug";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await createCategory.mutateAsync({
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim(),
        image: formData.image.trim() || undefined,
        parentId: formData.parentId || undefined,
        isActive: formData.isActive,
        isMain: formData.isMain,
        mainSortOrder: formData.mainSortOrder,
        sortOrder: formData.sortOrder,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
        seoH1: formData.seoH1.trim(),
      });
      router.push("/categories");
    } catch (error: any) {
      console.error("Error creating category:", error);
      setSubmitError(
        error?.response?.data?.message || "Не удалось создать категорию"
      );
    }
  };

  const parentCategoryOptions = useMemo(
    () =>
      mergeCategoryOptionsWithList(
        flattenCategoryTree(categoryTree),
        categoriesData?.data || [],
      ).map(categoryOptionToSelectOption),
    [categoriesData?.data, categoryTree],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Page Header */}
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
              Новая категория
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              Заполните информацию о категории
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
          <Button
            type="submit"
            variant="primary"
            className="flex-1 sm:flex-none justify-center"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? "Создание..." : "Создать категорию"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
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
                  error={errors.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
                <Input
                  label="Slug (URL)"
                  placeholder="nazvanie-kategorii"
                  helperText="Используется в URL адресе"
                  required
                  value={formData.slug}
                  error={errors.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, slug: "" }));
                  }}
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
                  onChange={(seoFields) =>
                    setFormData({ ...formData, ...seoFields })
                  }
              />
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                      {uploading ? "Загрузка..." : "Нажмите для загрузки изображения"}
                    </span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Sort Order */}
          <Card>
            <CardHeader>
              <CardTitle>Сортировка</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Порядок отображения"
                type="number"
                placeholder="0"
                value={String(formData.sortOrder)}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })
                }
                helperText="Чем меньше число, тем выше категория"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
