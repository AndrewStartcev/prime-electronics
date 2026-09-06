"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PhoneVariantConstructor,
  ProductVariantGroupEditor,
  type ProductVariantGroupValue,
  ProductAttributesEditor,
  SearchableSelect,
  SeoFields,
  Select,
  Textarea,
} from "@/shared/ui";
import {
  useCategories,
  useCreateProduct,
  useCategoryTree,
  useActiveBrands,
} from "@/shared/hooks";
import { uploadApi } from "@/shared/api";
import {
  buildVariantAttributes,
  categoryOptionToSelectOption,
  createEmptyPhoneVariantOptions,
  flattenCategoryTree,
  getProductVariantSummary,
  mergeCategoryOptionsWithList,
  PhoneVariantOptions,
  ProductAttributeInput,
} from "@/shared/lib";
import {
  PRODUCT_SEO_VARIABLES,
  resolveSeoFieldsPreview,
} from "@/shared/lib/seoVariables";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;

  const responseMessage = (
    error as { response?: { data?: { message?: unknown } } }
  ).response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.map((item) => String(item)).join(", ");
  }

  if (responseMessage !== undefined && responseMessage !== null) {
    return String(responseMessage);
  }

  const message = (error as { message?: unknown }).message;
  return message ? String(message) : fallback;
}

export default function NewProductPage() {
  const router = useRouter();
  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useCategoryTree();
  const { data: categoriesData, isLoading: categoriesListLoading } =
    useCategories({ page: 1, limit: 5000 });
  const isCategoryOptionsLoading = categoriesLoading || categoriesListLoading;
  const { data: brands, isLoading: brandsLoading } = useActiveBrands();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    brandId: "",
    isActive: true,
    inStock: true,
    isNew: false,
    isSale: false,
    isPopular: false,
    seoTitle: "",
    seoDescription: "",
    seoH1: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [phoneVariants, setPhoneVariants] = useState<PhoneVariantOptions>(
    createEmptyPhoneVariantOptions(),
  );
  const [variantGroup, setVariantGroup] = useState<ProductVariantGroupValue>({
    variantGroupId: "",
    variantColor: "",
    variantMemory: "",
    variantSim: "",
  });
  const [otherAttributes, setOtherAttributes] = useState<
    ProductAttributeInput[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

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
          price: formData.price,
        },
      ),
    [
      formData.price,
      formData.seoDescription,
      formData.seoH1,
      formData.seoTitle,
      formData.title,
    ],
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadApi.uploadImage(file, { withWatermark: true })
      );
      const results = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...results.map((r) => r.url)]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Введите название товара";
    if (!formData.price) newErrors.price = "Укажите цену";
    if (!formData.categoryId) newErrors.categoryId = "Выберите категорию";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const variantAttributes = buildVariantAttributes(phoneVariants);
      const mergedAttributes = [...otherAttributes, ...variantAttributes];
      const variantSummary = getProductVariantSummary({
        name: formData.title,
        variantColor: variantGroup.variantColor,
        variantMemory: variantGroup.variantMemory,
        variantSim: variantGroup.variantSim,
        price: formData.price,
        attributes: mergedAttributes,
      });
      const shouldUseDerivedVariantFields = Boolean(variantGroup.variantGroupId);

      await createProduct.mutateAsync({
        name: formData.title,
        description: formData.description,
        price: Number(formData.price),
        categoryIds: formData.categoryId ? [formData.categoryId] : [],
        brandId: formData.brandId || undefined,
        variantGroupId: variantGroup.variantGroupId || null,
        variantColor: shouldUseDerivedVariantFields
          ? variantSummary.color || null
          : variantGroup.variantColor.trim() || null,
        variantMemory: shouldUseDerivedVariantFields
          ? variantSummary.memory || null
          : variantGroup.variantMemory.trim() || null,
        variantSim: shouldUseDerivedVariantFields
          ? variantSummary.sim || null
          : variantGroup.variantSim.trim() || null,
        images: images.map((url, index) => ({
          url,
          alt: formData.title,
          sortOrder: index,
        })),
        attributes: mergedAttributes.length > 0 ? mergedAttributes : undefined,
        isActive: formData.isActive,
        isOnSale: formData.isSale,
        isPopular: formData.isPopular,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
        seoH1: formData.seoH1.trim(),
      });
      router.push("/products");
    } catch (error: unknown) {
      console.error("Error creating product:", error);
      setSubmitError(
        getErrorMessage(error, "Не удалось создать товар. Попробуйте ещё раз.")
      );
    }
  };

  const categoryOptions = useMemo(
    () =>
      mergeCategoryOptionsWithList(
        flattenCategoryTree(categoryTree),
        categoriesData?.data || [],
      ).map(categoryOptionToSelectOption),
    [categoriesData?.data, categoryTree],
  );

  const brandOptions =
    brands?.map((brand) => ({
      value: brand.id,
      label: brand.name,
    })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/products"
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
              Новый товар
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              Заполните информацию о товаре
            </p>
          </div>
        </div>
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {submitError}
          </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/products" className="flex-1 sm:flex-none">
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
            disabled={createProduct.isPending}
          >
            {createProduct.isPending ? "Создание..." : "Создать товар"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Название товара"
                  placeholder="Введите название товара"
                  required
                  value={formData.title}
                  error={errors.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />
                <Textarea
                  label="Описание"
                  placeholder="Введите описание товара"
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Категория"
                    required
                    options={categoryOptions}
                    value={formData.categoryId}
                    error={errors.categoryId}
                    onChange={(value) => {
                      setFormData({ ...formData, categoryId: value });
                      if (value) setErrors((prev) => ({ ...prev, categoryId: "" }));
                    }}
                    disabled={isCategoryOptionsLoading}
                    placeholder="Найти категорию"
                    emptyLabel="Категория не найдена"
                    showImages
                  />
                  <Select
                    label="Бренд"
                    options={brandOptions}
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                    disabled={brandsLoading}
                  />
                </div>
                {isCategoryOptionsLoading && (
                  <p className="text-sm text-gray-500">Загрузка категорий...</p>
                )}
                {brandsLoading && (
                  <p className="text-sm text-gray-500">Загрузка брендов...</p>
                )}
                {!isCategoryOptionsLoading && categoryOptions.length === 0 && (
                  <p className="text-sm text-red-500">Категории не найдены</p>
                )}
                {!brandsLoading && brandOptions.length === 0 && (
                  <p className="text-sm text-yellow-600">
                    Бренды не найдены (опционально)
                  </p>
                )}
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
                variables={PRODUCT_SEO_VARIABLES}
                preview={seoPreview}
                onChange={(seoFields) =>
                  setFormData({ ...formData, ...seoFields })
                }
              />
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductAttributesEditor
                value={otherAttributes}
                onChange={setOtherAttributes}
              />
            </CardContent>
          </Card>

          {/* Phone Variant Constructor */}
          <Card id="configurations">
            <CardHeader>
              <CardTitle>Варианты телефона</CardTitle>
            </CardHeader>
            <CardContent>
              <PhoneVariantConstructor
                value={phoneVariants}
                onChange={setPhoneVariants}
                basePrice={formData.price}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Мультиобъявление</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductVariantGroupEditor
                value={variantGroup}
                onChange={setVariantGroup}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                  ))}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <div className="px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-accent-yellow transition-colors">
                      {uploading ? (
                        <span className="text-sm text-text-secondary-black">
                          Загрузка...
                        </span>
                      ) : (
                        <span className="text-sm text-text-secondary-black">
                          Нажмите для загрузки изображений
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Цена</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Цена (₽)"
                type="number"
                placeholder="0.00"
                required
                value={formData.price}
                error={errors.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (e.target.value) setErrors((prev) => ({ ...prev, price: "" }));
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">
                    Активен (отображается на сайте)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) =>
                      setFormData({ ...formData, inStock: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">В наличии</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) =>
                      setFormData({ ...formData, isNew: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">
                    Новинка (метка NEW)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSale}
                    onChange={(e) =>
                      setFormData({ ...formData, isSale: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">
                    На распродаже (метка SALE)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-accent-yellow focus:ring-accent-yellow"
                  />
                  <span className="text-sm text-primary-black">
                    Популярный товар (приоритет в блоке «Популярные»)
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
