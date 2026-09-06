"use client";

import { useMemo, useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PhoneVariantConstructor,
  ProductVariantGroupEditor,
  RelatedProductsEditor,
  type ProductVariantGroupValue,
  type RelatedProductSelection,
  Input,
  SearchableSelect,
  SeoFields,
  Select,
  Textarea,
  Skeleton,
  ErrorMessage,
  ProductAttributesEditor,
} from "@/shared/ui";
import {
  useCategories,
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategoryTree,
  useActiveBrands,
  useAdminAccess,
} from "@/shared/hooks";
import { uploadApi } from "@/shared/api";
import {
  buildVariantAttributes,
  categoryOptionToSelectOption,
  createEmptyPhoneVariantOptions,
  flattenCategoryTree,
  getProductVariantOptionLabel,
  getProductVariantSummary,
  mergeCategoryOptionsWithList,
  PhoneVariantOptions,
  ProductAttributeInput,
  splitVariantAndOtherAttributes,
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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const { data: categoryTree = [], isLoading: categoriesLoading } =
    useCategoryTree();
  const { data: categoriesData, isLoading: categoriesListLoading } =
    useCategories({ page: 1, limit: 5000 });
  const isCategoryOptionsLoading = categoriesLoading || categoriesListLoading;
  const { data: brands, isLoading: brandsLoading } = useActiveBrands();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { canDeleteProducts } = useAdminAccess();

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
  const [relatedProducts, setRelatedProducts] = useState<
    RelatedProductSelection[]
  >([]);
  const [areAttributesOpen, setAreAttributesOpen] = useState(false);
  const [hadVariantAttributes, setHadVariantAttributes] = useState(false);
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

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.name || product.title || "",
        description: product.description || "",
        price: String(product.price || ""),
        categoryId:
          product.categories?.find((c) => c.isPrimary)?.categoryId ||
          product.categories?.[0]?.categoryId ||
          product.categoryId ||
          "",
        brandId: product.brandId || "",
        isActive: product.isActive ?? true,
        inStock: product.inStock ?? true,
        isNew: product.isNew ?? false,
        isSale: product.isOnSale || product.isSale || false,
        isPopular: product.isPopular ?? false,
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        seoH1: product.seoH1 || "",
      });
      if (product.images && product.images.length > 0) {
        setImages(
          product.images.map((img) => (typeof img === "string" ? img : img.url))
        );
      }

      const parsed = splitVariantAndOtherAttributes(product.attributes);
      setPhoneVariants(parsed.variantOptions);
      setOtherAttributes(parsed.otherAttributes);
      setHadVariantAttributes(parsed.hadVariantAttributes);
      setVariantGroup({
        variantGroupId: product.variantGroupId || product.variantGroup?.id || "",
        variantColor: product.variantColor || "",
        variantMemory: product.variantMemory || "",
        variantSim: product.variantSim || "",
      });
      setRelatedProducts(
        (product.relatedProducts || []).map((relation) => ({
          id: relation.targetProduct.id,
          name: relation.targetProduct.name,
          slug: relation.targetProduct.slug,
          price: relation.targetProduct.price,
          image: relation.targetProduct.images?.[0]?.url,
          totalStock: relation.targetProduct.totalStock,
        })),
      );
    }
  }, [product]);

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
      const shouldSendAttributes =
        mergedAttributes.length > 0 || hadVariantAttributes;
      const variantSummary = getProductVariantSummary({
        name: formData.title,
        variantColor: variantGroup.variantColor,
        variantMemory: variantGroup.variantMemory,
        variantSim: variantGroup.variantSim,
        price: formData.price,
        attributes: mergedAttributes,
      });
      const shouldUseDerivedVariantFields = Boolean(variantGroup.variantGroupId);
      const previousPrimaryCategoryId =
        product?.categories?.find((category) => category.isPrimary)?.categoryId ||
        product?.categories?.[0]?.categoryId;
      const retainedCategoryIds = (product?.categories || [])
        .map((category) => category.categoryId)
        .filter(
          (categoryId) =>
            Boolean(categoryId) && categoryId !== previousPrimaryCategoryId,
        );
      const categoryIds = Array.from(
        new Set([formData.categoryId, ...retainedCategoryIds].filter(Boolean)),
      );

      await updateProduct.mutateAsync({
        id,
        data: {
          name: formData.title,
          description: formData.description,
          price: Number(formData.price),
          categoryIds,
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
          attributes: shouldSendAttributes ? mergedAttributes : undefined,
          isActive: formData.isActive,
          isOnSale: formData.isSale,
          isPopular: formData.isPopular,
          seoTitle: formData.seoTitle.trim(),
          seoDescription: formData.seoDescription.trim(),
          seoH1: formData.seoH1.trim(),
          relatedProductIds: relatedProducts.map((product) => product.id),
        },
      });
      router.push(`/products/${id}`);
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      setSubmitError(
        getErrorMessage(error, "Не удалось сохранить изменения. Попробуйте ещё раз.")
      );
    }
  };

  const handleDelete = async () => {
    if (!canDeleteProducts) {
      setSubmitError("У менеджера нет прав на удаление товаров.");
      return;
    }

    if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
      await deleteProduct.mutateAsync(id);
      router.push("/products");
    } catch (error: unknown) {
      console.error("Error deleting product:", error);
      setSubmitError(
        getErrorMessage(error, "Не удалось удалить товар. Попробуйте ещё раз.")
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
  const linkedProductOptions = useMemo(
    () =>
      (product?.variantGroup?.products || []).map((groupProduct) => {
        const variantSummary = getProductVariantSummary(groupProduct);
        const optionLabel = getProductVariantOptionLabel(variantSummary);
        const stockLabel =
          groupProduct.totalStock !== undefined
            ? `Остаток: ${groupProduct.totalStock}`
            : "";
        const description = [optionLabel, stockLabel]
          .filter(Boolean)
          .join(" · ");

        return {
          value: groupProduct.id,
          label: groupProduct.name,
          description: description || "Параметры не указаны",
          image: groupProduct.images?.[0]?.url,
          variantSummary,
          price: groupProduct.price,
          oldPrice: groupProduct.oldPrice,
          keywords: [
            groupProduct.name,
            groupProduct.slug,
            optionLabel,
          ]
            .filter(Boolean)
            .join(" "),
        };
      }),
    [product?.variantGroup?.products],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <ErrorMessage
          title="Товар не найден"
          message="Запрошенный товар не существует или был удален."
          onRetry={() => router.push("/products")}
        />
      </div>
    );
  }

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
              Редактировать товар
            </h1>
            <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
              {formData.title || "Товар"}
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
          {canDeleteProducts && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="flex-1 sm:flex-none justify-center text-red-600 hover:bg-red-50"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Удаление..." : "Удалить"}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1 sm:flex-none justify-center"
            disabled={updateProduct.isPending}
          >
            {updateProduct.isPending ? "Сохранение..." : "Сохранить"}
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
                {categoriesLoading && (
                  <p className="text-sm text-gray-500">Загрузка категорий...</p>
                )}
                {brandsLoading && (
                  <p className="text-sm text-gray-500">Загрузка брендов...</p>
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
              <button
                type="button"
                onClick={() => setAreAttributesOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={areAttributesOpen}
              >
                <CardTitle>Характеристики</CardTitle>
                <ChevronDown
                  className={`h-5 w-5 text-text-secondary-black transition-transform ${
                    areAttributesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </CardHeader>
            {areAttributesOpen && (
              <CardContent>
                <ProductAttributesEditor
                  value={otherAttributes}
                  onChange={setOtherAttributes}
                />
              </CardContent>
            )}
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
                linkedProductOptions={linkedProductOptions}
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
                currentGroup={product.variantGroup}
                currentProductId={product.id}
                onChange={setVariantGroup}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дополнительные товары</CardTitle>
            </CardHeader>
            <CardContent>
              <RelatedProductsEditor
                currentProductId={product.id}
                value={relatedProducts}
                onChange={setRelatedProducts}
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
