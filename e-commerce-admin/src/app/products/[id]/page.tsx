"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  ErrorMessage,
  PhoneVariantConstructor,
} from "@/shared/ui";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdminAccess,
  useProductStock,
  usePickupPoints,
  useCreateStock,
  useUpdateStock,
} from "@/shared/hooks";
import {
  buildVariantAttributes,
  createEmptyPhoneVariantOptions,
  getProductVariantOptionLabel,
  getProductVariantSummary,
  PhoneVariantOptions,
  ProductAttributeInput,
  splitVariantAndOtherAttributes,
  toProductAttributesArray,
} from "@/shared/lib";

const statusLabels = {
  active: "Активен",
  draft: "Черновик",
  archived: "В архиве",
};

const statusVariants = {
  active: "success" as const,
  draft: "warning" as const,
  archived: "default" as const,
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const { data: productStockData, isLoading: isStockLoading } = useProductStock(id);
  const { data: pickupPointsData, isLoading: isPickupPointsLoading } = usePickupPoints({
    page: 1,
    limit: 200,
  });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();
  const { isManager, canDeleteProducts } = useAdminAccess();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [savingPointId, setSavingPointId] = useState<string | null>(null);
  const [phoneVariants, setPhoneVariants] = useState<PhoneVariantOptions>(
    createEmptyPhoneVariantOptions(),
  );
  const [otherAttributes, setOtherAttributes] = useState<
    ProductAttributeInput[]
  >([]);
  const [savedVariantSnapshot, setSavedVariantSnapshot] = useState("");
  const [isSavingVariants, setIsSavingVariants] = useState(false);

  const pickupPoints = useMemo(
    () => (pickupPointsData?.data || []).filter((point) => point.isActive),
    [pickupPointsData],
  );

  const stockByPointId = useMemo(() => {
    const map = new Map<string, { stockCount: number; sku: string }>();
    for (const stock of productStockData || []) {
      map.set(stock.pointId, {
        stockCount: stock.stockCount ?? stock.quantity ?? 0,
        sku: stock.sku || "",
      });
    }
    return map;
  }, [productStockData]);

  useEffect(() => {
    if (pickupPoints.length === 0) return;

    setStockDrafts((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const point of pickupPoints) {
        if (next[point.id] !== undefined) continue;
        const existingStock = stockByPointId.get(point.id);
        next[point.id] = String(existingStock?.stockCount ?? 0);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [pickupPoints, stockByPointId]);

  useEffect(() => {
    if (!product) return;
    const parsed = splitVariantAndOtherAttributes(product.attributes);
    setPhoneVariants(parsed.variantOptions);
    setOtherAttributes(parsed.otherAttributes);
    setSavedVariantSnapshot(JSON.stringify(parsed.variantOptions));
  }, [product]);

  const handleStockDraftChange = (pointId: string, value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    setStockDrafts((prev) => ({
      ...prev,
      [pointId]: sanitized,
    }));
  };

  const buildSku = (pointId: string) => {
    const source = (product?.slug || product?.id || id).toUpperCase();
    const normalized = source.replace(/[^A-Z0-9_-]/g, "").slice(0, 16) || "PRODUCT";
    const suffix = pointId.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase() || "POINT";
    return `${normalized}-${suffix}`;
  };

  const handleSaveStock = async (pointId: string) => {
    if (isManager) {
      toast.error("У менеджера нет прав на редактирование остатков");
      return;
    }

    const draftValue = stockDrafts[pointId];
    const parsed = Number(draftValue);

    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Укажите корректный остаток");
      return;
    }

    try {
      setSavingPointId(pointId);
      const existing = stockByPointId.get(pointId);

      if (existing) {
        await updateStock.mutateAsync({
          productId: id,
          pointId,
          data: { stockCount: parsed },
        });
      } else {
        await createStock.mutateAsync({
          productId: id,
          pointId,
          sku: buildSku(pointId),
          stockCount: parsed,
        });
      }

      toast.success("Остаток сохранен");
    } catch (saveError) {
      console.error("Failed to save stock:", saveError);
      toast.error("Не удалось сохранить остаток");
    } finally {
      setSavingPointId(null);
    }
  };

  const handleSaveVariantPrices = async () => {
    if (!product || isSavingVariants) return;

    if (isManager) {
      toast.error("У менеджера нет прав на редактирование конфигураций");
      return;
    }

    try {
      setIsSavingVariants(true);
      const variantAttributes = buildVariantAttributes(phoneVariants);
      const mergedAttributes = [...otherAttributes, ...variantAttributes];

      await updateProduct.mutateAsync({
        id,
        data: {
          attributes: mergedAttributes,
        },
      });

      setSavedVariantSnapshot(JSON.stringify(phoneVariants));
      toast.success("Цены по конфигурациям сохранены");
    } catch (saveError) {
      console.error("Failed to save variant configurations:", saveError);
      toast.error("Не удалось сохранить цены по конфигурациям");
    } finally {
      setIsSavingVariants(false);
    }
  };

  const handleDuplicate = async () => {
    if (!product || isDuplicating) return;
    setIsDuplicating(true);
    try {
      const categoryIds = product.categories?.map((category) => category.categoryId) ||
        (product.categoryId ? [product.categoryId] : []);
      const attributes = toProductAttributesArray(product.attributes);
      const newProduct = await createProduct.mutateAsync({
        name: `${product.name || product.title} (копия)`,
        description: product.description || "",
        price: typeof product.price === "string" ? Number(product.price) : product.price,
        categoryIds,
        brandId: product.brandId || undefined,
        attributes: attributes.length > 0 ? attributes : undefined,
        images: product.images?.map((img, index) => ({
          url: typeof img === "string" ? img : img.url,
          alt: product.name || product.title || "",
          sortOrder: index,
        })) || [],
        isActive: false,
        isOnSale: product.isOnSale || false,
        isPopular: product.isPopular || false,
      });
      router.push(`/products/${newProduct.id}/edit`);
    } catch (error) {
      console.error("Error duplicating product:", error);
      alert("Не удалось дублировать товар");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleArchive = async () => {
    if (!product || isArchiving) return;
    setIsArchiving(true);
    try {
      await updateProduct.mutateAsync({
        id,
        data: { isActive: false },
      });
      router.push("/products");
    } catch (error) {
      console.error("Error archiving product:", error);
      alert("Не удалось перенести товар в архив");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDeleteProducts) {
      alert("У менеджера нет прав на удаление товаров");
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      router.push("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Не удалось удалить товар");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Изображения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Цена</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <ErrorMessage
          title="Не удалось загрузить товар"
          message="Запрошенный товар не существует или произошла ошибка при загрузке."
        />
      </div>
    );
  }
  const productName = product.name || product.title || "Товар";
  const productPrice =
    typeof product.price === "string" ? Number(product.price) : product.price;
  const productOldPrice = product.oldPrice
    ? typeof product.oldPrice === "string"
      ? Number(product.oldPrice)
      : product.oldPrice
    : null;
  const linkedProductOptions =
    product.variantGroup?.products?.map((groupProduct) => {
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
    }) || [];
  const currentVariantSnapshot = JSON.stringify(phoneVariants);
  const hasVariantChanges =
    Boolean(savedVariantSnapshot) && currentVariantSnapshot !== savedVariantSnapshot;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 hover:bg-secondary-gray rounded-lg transition-colors"
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
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-primary-black">
                {productName}
              </h1>
            </div>
            <p className="text-text-secondary-black mt-1">ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {isDuplicating ? "Дублирование..." : "Дублировать"}
          </Button>
          <Link href={`/products/${product.id}/edit`}>
            <Button variant="primary">
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Редактировать
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-secondary-gray rounded-xl overflow-hidden"
                    >
                      <img
                        src={typeof image === "string" ? image : image.url}
                        alt={`${productName} - фото ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square bg-secondary-gray rounded-xl flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-black leading-relaxed">
                {product.description || "Описание отсутствует"}
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary-gray/50 rounded-xl">
                  <span className="text-xs text-text-secondary-black">
                    Просмотры
                  </span>
                  <p className="text-lg font-semibold text-primary-black mt-1">
                    {product.viewCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-secondary-gray/50 rounded-xl">
                  <span className="text-xs text-text-secondary-black">
                    Продано
                  </span>
                  <p className="text-lg font-semibold text-primary-black mt-1">
                    {product.soldCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-secondary-gray/50 rounded-xl">
                  <span className="text-xs text-text-secondary-black">
                    Рейтинг
                  </span>
                  <p className="text-lg font-semibold text-primary-black mt-1">
                    {product.rating || 0} ⭐
                  </p>
                </div>
                <div className="p-3 bg-secondary-gray/50 rounded-xl">
                  <span className="text-xs text-text-secondary-black">
                    Отзывы
                  </span>
                  <p className="text-lg font-semibold text-primary-black mt-1">
                    {product.reviewCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle>Цена</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-primary-black">
                    ₽ {productPrice.toLocaleString()}
                  </span>
                  {productOldPrice && (
                    <span className="text-lg text-text-secondary-black line-through">
                      ₽ {productOldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {productOldPrice && productPrice && (
                  <Badge variant="danger">
                    -
                    {Math.round(
                      ((productOldPrice - productPrice) / productOldPrice) * 100
                    )}
                    %
                  </Badge>
                )}
                {product.isOnSale && <Badge variant="warning">На скидке</Badge>}
                {product.isPopular && <Badge variant="success">Популярный</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card id="configurations">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Конфигурации</CardTitle>
                  <p className="mt-1 text-xs text-text-secondary-black">
                    Быстрое редактирование цен и вариантов
                  </p>
                </div>
                <Badge variant={hasVariantChanges ? "warning" : "success"}>
                  {hasVariantChanges ? "Есть изменения" : "Сохранено"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhoneVariantConstructor
                value={phoneVariants}
                onChange={setPhoneVariants}
                basePrice={productPrice}
                baseOldPrice={productOldPrice}
                linkedProductOptions={linkedProductOptions}
                compact
              />
              <Button
                type="button"
                variant="primary"
                className="w-full justify-center"
                onClick={handleSaveVariantPrices}
                disabled={isSavingVariants || !hasVariantChanges}
              >
                {isSavingVariants
                  ? "Сохранение..."
                  : hasVariantChanges
                    ? "Сохранить конфигурации"
                    : "Изменений нет"}
              </Button>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Категория и бренд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-text-secondary-black">
                    Категория
                  </span>
                  <p className="text-sm text-primary-black font-medium">
                    {product.category?.title || product.category?.name || "-"}
                  </p>
                </div>
                {product.brand && (
                  <div>
                    <span className="text-xs text-text-secondary-black">
                      Бренд
                    </span>
                    <p className="text-sm text-primary-black font-medium">
                      {product.brand.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Остатки</CardTitle>
                <span className="text-lg font-semibold text-primary-black">
                  {product.totalStock || 0} шт.
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isStockLoading || isPickupPointsLoading ? (
                <p className="text-sm text-text-secondary-black">
                  Загрузка остатков...
                </p>
              ) : pickupPoints.length === 0 ? (
                <p className="text-sm text-text-secondary-black">
                  Нет активных точек самовывоза
                </p>
              ) : (
                <div className="space-y-3">
                  {pickupPoints.map((point) => {
                    const currentStock = stockByPointId.get(point.id)?.stockCount ?? 0;
                    const value = stockDrafts[point.id] ?? String(currentStock);
                    const isSaving = savingPointId === point.id;

                    return (
                      <div
                        key={point.id}
                        className="rounded-xl border border-gray-200 p-3 space-y-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-primary-black">
                            {point.name}
                          </p>
                          <p className="text-xs text-text-secondary-black">
                            {point.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={value}
                            onChange={(e) =>
                              handleStockDraftChange(point.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSaveStock(point.id);
                              }
                            }}
                            disabled={isManager || isSaving}
                            className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange disabled:opacity-60"
                          />
                          <span className="text-sm text-text-secondary-black">
                            шт.
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleSaveStock(point.id)}
                            disabled={isManager || isSaving}
                          >
                            {isSaving ? "Сохранение..." : "Сохранить"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Создан</span>
                  <span className="text-primary-black">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("ru-RU")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary-black">Обновлен</span>
                  <span className="text-primary-black">
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString("ru-RU")
                      : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleArchive} disabled={isArchiving}>
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                  {isArchiving ? "Архивирование..." : "В архив"}
                </Button>
                {canDeleteProducts && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleteProduct.isPending}
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {deleteProduct.isPending ? "Удаление..." : "Удалить товар"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
