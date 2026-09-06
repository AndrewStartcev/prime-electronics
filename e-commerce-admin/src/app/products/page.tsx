"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TableSkeleton,
  ErrorMessage,
  TablePagination,
  TableSearch,
  SearchableSelect,
} from "@/shared/ui";
import {
  useCategories,
  useProducts,
  useDeleteProduct,
  useUpdateProduct,
  useProductFilters,
  useCategoryTree,
  useAdminAccess,
  useCreateStock,
  usePickupPoints,
  usePickupPointStock,
  useUpdateStock,
} from "@/shared/hooks";
import { productKeys } from "@/shared/hooks/useProducts";
import { categoryKeys } from "@/shared/hooks/useCategories";
import {
  dashboardApi,
  productsApi,
  type CatalogCleanupSuggestion,
  type Product,
} from "@/shared/api";
import {
  categoryOptionToSelectOption,
  flattenCategoryTree,
  mergeCategoryOptionsWithList,
} from "@/shared/lib";
import type { ProductsImportUndoStatus } from "@/shared/types/dashboard";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLSX_EXTENSIONS = ".xlsx";
const XLSX_MIME_TYPES = [XLSX_CONTENT_TYPE, "application/vnd.ms-excel"];
type ProductSortBy =
  "popularity" | "price_asc" | "price_desc" | "newest" | "rating";
type BulkPriceAction =
  | "set"
  | "increase_amount"
  | "decrease_amount"
  | "increase_percent"
  | "decrease_percent";
type ProductVisibilityFilter = "all" | "active" | "hidden";
type ProductExportActivity = "all" | "active" | "inactive";
const DEFAULT_PRODUCTS_PAGE_LIMIT = 25;
const SHOW_ALL_PRODUCTS_BATCH_LIMIT = 200;
const isCatalogCleanupVisible =
  process.env.NEXT_PUBLIC_ENABLE_CATALOG_CLEANUP === "true";

const SORT_OPTIONS: Array<{ value: ProductSortBy; label: string }> = [
  { value: "popularity", label: "По популярности" },
  { value: "newest", label: "Сначала новые" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "rating", label: "По рейтингу" },
];

const VISIBILITY_FILTER_OPTIONS: Array<{
  value: ProductVisibilityFilter;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Все товары",
    description: "Активные и скрытые",
  },
  {
    value: "active",
    label: "Активные",
    description: "Показываются на сайте",
  },
  {
    value: "hidden",
    label: "Скрытые",
    description: "Не видны в выдаче",
  },
];

const BULK_PRICE_ACTION_OPTIONS: Array<{
  value: BulkPriceAction;
  label: string;
}> = [
  { value: "set", label: "Установить цену" },
  { value: "increase_amount", label: "Прибавить сумму (₽)" },
  { value: "decrease_amount", label: "Убавить сумму (₽)" },
  { value: "increase_percent", label: "Прибавить процент (%)" },
  { value: "decrease_percent", label: "Убавить процент (%)" },
];

function extractFileName(contentDisposition?: string): string | null {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  return plainMatch?.[1] || null;
}

function parsePriceValue(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value).replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value: string | number | null | undefined): string {
  const parsed = parsePriceValue(value);
  if (parsed === null) return "-";

  return `${parsed.toLocaleString("ru-RU")} ₽`;
}

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

function getIsOnSaleForPrice(product: Product, nextPrice: number): boolean {
  const parsedOldPrice = parsePriceValue(product.oldPrice);
  if (parsedOldPrice === null) {
    return product.isOnSale;
  }

  return nextPrice < parsedOldPrice;
}

function buildStockSku(product: Product, pointId: string): string {
  const source = (product.slug || product.id).toUpperCase();
  const normalized =
    source.replace(/[^A-Z0-9_-]/g, "").slice(0, 16) || "PRODUCT";
  const suffix =
    pointId
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase() || "POINT";

  return `${normalized}-${suffix}`;
}

function getNextPriceByAction(
  currentPrice: number,
  action: BulkPriceAction,
  value: number,
): number {
  switch (action) {
    case "set":
      return value;
    case "increase_amount":
      return currentPrice + value;
    case "decrease_amount":
      return currentPrice - value;
    case "increase_percent":
      return currentPrice * (1 + value / 100);
    case "decrease_percent":
      return currentPrice * (1 - value / 100);
    default:
      return currentPrice;
  }
}

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<ProductVisibilityFilter>("all");
  const [exportActivity, setExportActivity] =
    useState<ProductExportActivity>("all");
  const [sortBy, setSortBy] = useState<ProductSortBy>("popularity");
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isUndoingImport, setIsUndoingImport] = useState(false);
  const [importUndoStatus, setImportUndoStatus] =
    useState<ProductsImportUndoStatus | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const refreshImportUndoStatus = useCallback(async () => {
    try {
      setImportUndoStatus(await dashboardApi.getProductsImportUndoStatus());
    } catch (error) {
      console.error("Failed to load XLSX import undo status:", error);
    }
  }, []);

  useEffect(() => {
    void refreshImportUndoStatus();
  }, [refreshImportUndoStatus]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data: categoryTree = [] } = useCategoryTree();
  const { data: categoriesData } = useCategories({ page: 1, limit: 5000 });
  const { data: productFiltersData } = useProductFilters(
    selectedCategoryId || undefined,
  );

  const categoryOptions = useMemo(
    () =>
      mergeCategoryOptionsWithList(
        flattenCategoryTree(categoryTree),
        categoriesData?.data || [],
      ),
    [categoriesData?.data, categoryTree],
  );
  const categorySelectOptions = useMemo(
    () => categoryOptions.map(categoryOptionToSelectOption),
    [categoryOptions],
  );

  const brandOptions = useMemo(
    () =>
      (productFiltersData?.brands || []).sort(
        (a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name, "ru"),
      ),
    [productFiltersData],
  );

  useEffect(() => {
    if (
      selectedBrandId &&
      !brandOptions.some(
        (brand: { id: string }) => brand.id === selectedBrandId,
      )
    ) {
      setSelectedBrandId("");
      setPage(1);
    }
  }, [brandOptions, selectedBrandId]);

  const baseProductFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      categoryId: selectedCategoryId || undefined,
      brandIds: selectedBrandId ? [selectedBrandId] : undefined,
      isActive:
        visibilityFilter === "all" ? undefined : visibilityFilter === "active",
      sortBy,
      includeInactive: true,
    }),
    [
      debouncedSearch,
      selectedBrandId,
      selectedCategoryId,
      sortBy,
      visibilityFilter,
    ],
  );

  const paginatedProductsQuery = useProducts(
    {
      ...baseProductFilters,
      page,
      limit: DEFAULT_PRODUCTS_PAGE_LIMIT,
    },
    {
      enabled: !showAllProducts,
    },
  );

  const showAllProductsQuery = useInfiniteQuery({
    queryKey: [...productKeys.lists(), "show-all", baseProductFilters],
    queryFn: ({ pageParam }) =>
      productsApi.getAll({
        ...baseProductFilters,
        page: pageParam as number,
        limit: SHOW_ALL_PRODUCTS_BATCH_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: showAllProducts,
    staleTime: 60 * 1000,
  });

  const fetchAllProductsNextPage = showAllProductsQuery.fetchNextPage;
  const hasAllProductsNextPage = showAllProductsQuery.hasNextPage;
  const isAllProductsFetchingNextPage = showAllProductsQuery.isFetchingNextPage;

  useEffect(() => {
    if (!showAllProducts) return;
    if (hasAllProductsNextPage && !isAllProductsFetchingNextPage) {
      void fetchAllProductsNextPage();
    }
  }, [
    fetchAllProductsNextPage,
    hasAllProductsNextPage,
    isAllProductsFetchingNextPage,
    showAllProducts,
  ]);

  const allProductsPages = useMemo(
    () => showAllProductsQuery.data?.pages || [],
    [showAllProductsQuery.data],
  );
  const allProducts = useMemo(
    () => allProductsPages.flatMap((pageData) => pageData.data),
    [allProductsPages],
  );
  const allProductsMeta = allProductsPages[0]?.meta;

  const data = useMemo(
    () =>
      showAllProducts
        ? {
            data: allProducts,
            meta: allProductsMeta
              ? {
                  ...allProductsMeta,
                  page: 1,
                  limit: allProducts.length,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                }
              : undefined,
          }
        : paginatedProductsQuery.data,
    [
      allProducts,
      allProductsMeta,
      paginatedProductsQuery.data,
      showAllProducts,
    ],
  );

  const isLoading = showAllProducts
    ? showAllProductsQuery.isLoading ||
      (showAllProductsQuery.isFetching && allProducts.length === 0)
    : paginatedProductsQuery.isLoading;

  const error = showAllProducts
    ? showAllProductsQuery.error
    : paginatedProductsQuery.error;

  const showAllLoadingMessage =
    showAllProducts &&
    (showAllProductsQuery.isFetchingNextPage ||
      showAllProductsQuery.hasNextPage);
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();
  const { data: pickupPointsData } = usePickupPoints({ page: 1, limit: 200 });
  const { isManager, canDeleteProducts } = useAdminAccess();
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savingActiveId, setSavingActiveId] = useState<string | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState("");
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkPriceAction, setBulkPriceAction] =
    useState<BulkPriceAction>("set");
  const [bulkPriceValue, setBulkPriceValue] = useState("");
  const [isApplyingBulkPrice, setIsApplyingBulkPrice] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [isApplyingBulkCategory, setIsApplyingBulkCategory] = useState(false);
  const [cleanupSuggestions, setCleanupSuggestions] = useState<
    CatalogCleanupSuggestion[]
  >([]);
  const [cleanupScanned, setCleanupScanned] = useState(0);
  const [excludedCleanupProductIds, setExcludedCleanupProductIds] = useState<
    Set<string>
  >(new Set());
  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [isApplyingCleanup, setIsApplyingCleanup] = useState(false);
  const products = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;
  const activePickupPoints = useMemo(
    () => (pickupPointsData?.data || []).filter((point) => point.isActive),
    [pickupPointsData],
  );
  const primaryPickupPoint = activePickupPoints[0];
  const primaryPointId = primaryPickupPoint?.id || "";
  const { data: primaryPointStock = [], refetch: refetchPrimaryPointStock } =
    usePickupPointStock(primaryPointId);
  const stockByProductId = useMemo(() => {
    const map = new Map<string, { stockCount: number; sku: string }>();

    for (const stock of primaryPointStock) {
      map.set(stock.productId, {
        stockCount: stock.stockCount ?? stock.quantity ?? 0,
        sku: stock.sku || "",
      });
    }

    return map;
  }, [primaryPointStock]);

  const getDisplayStock = (product: Product) => {
    if (!primaryPointId) return product.totalStock ?? 0;
    return stockByProductId.get(product.id)?.stockCount ?? 0;
  };

  const selectedProductIdSet = useMemo(
    () => new Set(selectedProductIds),
    [selectedProductIds],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIdSet.has(product.id)),
    [products, selectedProductIdSet],
  );

  const allVisibleProductIds = useMemo(
    () => products.map((product) => product.id),
    [products],
  );

  const allVisibleProductIdSet = useMemo(
    () => new Set(allVisibleProductIds),
    [allVisibleProductIds],
  );

  useEffect(() => {
    setSelectedProductIds((previous) =>
      previous.filter((id) => allVisibleProductIdSet.has(id)),
    );
  }, [allVisibleProductIdSet]);

  const isAllVisibleSelected =
    products.length > 0 && selectedProducts.length === products.length;
  const hasSelectedProducts = selectedProducts.length > 0;
  const activeCleanupSuggestions = useMemo(
    () =>
      cleanupSuggestions.filter(
        (suggestion) => !excludedCleanupProductIds.has(suggestion.productId),
      ),
    [cleanupSuggestions, excludedCleanupProductIds],
  );
  const excludedCleanupCount =
    cleanupSuggestions.length - activeCleanupSuggestions.length;
  const usesPercentBulkAction =
    bulkPriceAction === "increase_percent" ||
    bulkPriceAction === "decrease_percent";

  const handleDelete = async (id: string) => {
    if (!canDeleteProducts) {
      toast.error("У менеджера нет прав на удаление товаров");
      return;
    }

    if (confirm("Вы уверены, что хотите удалить этот товар?")) {
      deleteProduct.mutate(id);
    }
  };

  const startEditingPrice = (
    event: React.MouseEvent,
    productId: string,
    currentPrice: string | number,
  ) => {
    event.stopPropagation();
    if (savingPriceId === productId) return;

    const parsedPrice = parsePriceValue(currentPrice);
    setEditingPriceId(productId);
    setEditingPriceValue(parsedPrice === null ? "" : String(parsedPrice));
  };

  const cancelEditingPrice = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const savePrice = async (product: Product) => {
    const parsedPrice = parsePriceValue(editingPriceValue);

    if (parsedPrice === null || parsedPrice < 0) {
      toast.error("Укажите корректную цену");
      return;
    }

    try {
      setSavingPriceId(product.id);
      await updateProduct.mutateAsync({
        id: product.id,
        data: {
          price: parsedPrice,
          isOnSale: getIsOnSaleForPrice(product, parsedPrice),
        },
      });
      toast.success("Цена обновлена");
      setEditingPriceId(null);
      setEditingPriceValue("");
    } catch (error) {
      console.error("Failed to update product price:", error);
      toast.error(getErrorMessage(error, "Не удалось обновить цену"));
    } finally {
      setSavingPriceId(null);
    }
  };

  const toggleProductActive = async (
    event: React.ChangeEvent<HTMLInputElement>,
    product: Product,
  ) => {
    event.stopPropagation();

    if (savingActiveId === product.id) return;

    const nextIsActive = event.target.checked;

    try {
      setSavingActiveId(product.id);
      await updateProduct.mutateAsync({
        id: product.id,
        data: { isActive: nextIsActive },
      });
      toast.success(
        nextIsActive
          ? "Товар снова показывается в выдаче"
          : "Товар скрыт из выдачи",
      );
    } catch (error) {
      console.error("Failed to update product visibility:", error);
      toast.error(getErrorMessage(error, "Не удалось обновить видимость"));
    } finally {
      setSavingActiveId(null);
    }
  };

  const startEditingStock = (event: React.MouseEvent, product: Product) => {
    event.stopPropagation();

    if (isManager) {
      toast.error("У менеджера нет прав на редактирование остатков");
      return;
    }

    if (!primaryPickupPoint) {
      toast.error("Нет активной точки для учета остатков");
      return;
    }

    if (savingStockId === product.id) return;

    setEditingStockId(product.id);
    setEditingStockValue(String(getDisplayStock(product)));
  };

  const cancelEditingStock = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setEditingStockId(null);
    setEditingStockValue("");
  };

  const saveStock = async (product: Product) => {
    if (isManager) {
      toast.error("У менеджера нет прав на редактирование остатков");
      return;
    }

    if (!primaryPickupPoint) {
      toast.error("Нет активной точки для учета остатков");
      return;
    }

    const parsedStock = Number(editingStockValue);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      toast.error("Укажите корректный остаток");
      return;
    }

    try {
      setSavingStockId(product.id);
      const existingStock = stockByProductId.get(product.id);

      if (existingStock) {
        await updateStock.mutateAsync({
          productId: product.id,
          pointId: primaryPickupPoint.id,
          data: { stockCount: parsedStock },
        });
      } else {
        await createStock.mutateAsync({
          productId: product.id,
          pointId: primaryPickupPoint.id,
          sku: buildStockSku(product, primaryPickupPoint.id),
          stockCount: parsedStock,
        });
      }

      await Promise.all([
        refetchPrimaryPointStock(),
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
      ]);
      toast.success("Остаток обновлен");
      setEditingStockId(null);
      setEditingStockValue("");
    } catch (error) {
      console.error("Failed to update product stock:", error);
      toast.error(getErrorMessage(error, "Не удалось обновить остаток"));
    } finally {
      setSavingStockId(null);
    }
  };

  const toggleProductSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    productId: string,
  ) => {
    event.stopPropagation();
    setSelectedProductIds((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  };

  const toggleSelectAllVisibleProducts = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedProductIds(allVisibleProductIds);
      return;
    }

    setSelectedProductIds([]);
  };

  const clearSelectedProducts = () => {
    setSelectedProductIds([]);
  };

  const applyBulkPriceChange = async () => {
    if (!hasSelectedProducts) {
      toast.error("Выберите товары для изменения цены");
      return;
    }

    const parsedBulkValue = parsePriceValue(bulkPriceValue);
    if (
      parsedBulkValue === null ||
      parsedBulkValue < 0 ||
      (bulkPriceAction !== "set" && parsedBulkValue === 0)
    ) {
      toast.error("Укажите корректное значение для массового изменения");
      return;
    }

    try {
      setIsApplyingBulkPrice(true);
      let updated = 0;
      let failed = 0;
      let skipped = 0;

      for (const product of selectedProducts) {
        const currentPrice = parsePriceValue(product.price);
        if (currentPrice === null) {
          skipped += 1;
          continue;
        }

        const rawNextPrice = getNextPriceByAction(
          currentPrice,
          bulkPriceAction,
          parsedBulkValue,
        );
        const nextPrice = Math.max(0, Math.round(rawNextPrice));

        if (!Number.isFinite(nextPrice)) {
          skipped += 1;
          continue;
        }

        if (nextPrice === currentPrice) {
          skipped += 1;
          continue;
        }

        try {
          await productsApi.update(product.id, {
            price: nextPrice,
            isOnSale: getIsOnSaleForPrice(product, nextPrice),
          });
          updated += 1;
        } catch (error) {
          failed += 1;
          console.error("Failed to bulk update product price:", {
            productId: product.id,
            error,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });

      if (updated > 0) {
        toast.success(`Цены обновлены: ${updated} товаров`);
      }
      if (skipped > 0) {
        toast.message(`Без изменений: ${skipped} товаров`);
      }
      if (failed > 0) {
        toast.error(`Не удалось обновить: ${failed} товаров`);
      }

      if (updated > 0) {
        clearSelectedProducts();
      }
    } catch (error) {
      console.error("Failed to apply bulk price update:", error);
      toast.error(
        getErrorMessage(error, "Не удалось применить массовое изменение"),
      );
    } finally {
      setIsApplyingBulkPrice(false);
    }
  };

  const applyBulkCategoryChange = async () => {
    if (!hasSelectedProducts) {
      toast.error("Выберите товары для изменения категории");
      return;
    }

    const targetCategory = categorySelectOptions.find(
      (option) => option.value === bulkCategoryId,
    );
    if (!targetCategory) {
      toast.error("Выберите категорию, в которую нужно переместить товары");
      return;
    }

    const confirmed = window.confirm(
      `Переместить ${selectedProducts.length} товаров в категорию «${targetCategory.label}»? Прежние привязки категорий у выбранных товаров будут заменены.`,
    );
    if (!confirmed) return;

    try {
      setIsApplyingBulkCategory(true);
      const result = await productsApi.bulkUpdateCategories({
        categoryId: targetCategory.value,
        productIds: selectedProducts.map((product) => product.id),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() }),
      ]);

      setBulkCategoryId("");
      clearSelectedProducts();
      toast.success(`Категория изменена у ${result.updated} товаров`);
    } catch (error) {
      console.error("Failed to apply bulk category update:", error);
      toast.error(getErrorMessage(error, "Не удалось изменить категорию"));
    } finally {
      setIsApplyingBulkCategory(false);
    }
  };

  const loadCatalogCleanupSuggestions = async () => {
    try {
      setIsLoadingCleanup(true);
      const result = await productsApi.getCatalogCleanupSuggestions(200);
      setCleanupSuggestions(result.suggestions);
      setExcludedCleanupProductIds(new Set());
      setCleanupScanned(result.scanned);

      if (result.suggestions.length === 0) {
        toast.success("Подозрительных категорий не нашли");
      } else {
        toast.success(`Найдено к исправлению: ${result.suggestions.length}`);
      }
    } catch (error) {
      console.error("Failed to load catalog cleanup suggestions:", error);
      toast.error(getErrorMessage(error, "Не удалось проверить категории"));
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const applyCatalogCleanupSuggestions = async () => {
    if (activeCleanupSuggestions.length === 0) {
      toast.error("Сначала найдите товары с ошибками в категориях");
      return;
    }

    const confirmed = window.confirm(
      `Применить исправления для ${activeCleanupSuggestions.length} товаров? Исключенные строки останутся без изменений.`,
    );

    if (!confirmed) return;

    const groupedByCategory = activeCleanupSuggestions.reduce(
      (acc, suggestion) => {
        const current = acc.get(suggestion.targetCategoryId) || [];
        current.push(suggestion.productId);
        acc.set(suggestion.targetCategoryId, current);
        return acc;
      },
      new Map<string, string[]>(),
    );

    try {
      setIsApplyingCleanup(true);
      let updated = 0;

      for (const [categoryId, productIds] of groupedByCategory.entries()) {
        const result = await productsApi.bulkUpdateCategories({
          categoryId,
          productIds,
        });
        updated += result.updated;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() }),
      ]);

      setCleanupSuggestions([]);
      setExcludedCleanupProductIds(new Set());
      setCleanupScanned(0);
      clearSelectedProducts();
      toast.success(`Категории исправлены: перенесено ${updated} товаров`);
    } catch (error) {
      console.error("Failed to apply catalog cleanup suggestions:", error);
      toast.error(getErrorMessage(error, "Не удалось применить исправления"));
    } finally {
      setIsApplyingCleanup(false);
    }
  };

  const toggleCleanupSuggestion = (productId: string) => {
    setExcludedCleanupProductIds((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleExportXlsx = async () => {
    try {
      setIsExporting(true);
      const response = await dashboardApi.exportProductsXlsx(
        exportActivity,
        selectedCategoryId || undefined,
        selectedBrandId || undefined,
      );

      const fileName =
        extractFileName(response.headers["content-disposition"]) ||
        `products-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || XLSX_CONTENT_TYPE,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      const exportScope = [
        categoryOptions.find((category) => category.id === selectedCategoryId)
          ?.title,
        brandOptions.find(
          (brand: { id: string }) => brand.id === selectedBrandId,
        )?.name,
      ]
        .filter(Boolean)
        .join(", ");
      toast.success(`XLSX выгружен${exportScope ? `: ${exportScope}` : ""}`);
    } catch (error) {
      console.error("Failed to export products xlsx:", error);
      toast.error("Не удалось скачать XLSX. Попробуйте снова.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportXlsx = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const hasValidMime = XLSX_MIME_TYPES.includes(file.type);
    const hasValidExt = /\.xlsx$/i.test(file.name);

    if (!hasValidMime && !hasValidExt) {
      toast.error("Поддерживаются только XLSX-файлы");
      return;
    }

    try {
      setIsImporting(true);
      const result = await dashboardApi.importProductsXlsx(file);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() }),
        refreshImportUndoStatus(),
      ]);

      const baseMessage = `Импорт завершён: создано ${result.created}, обновлено ${result.updated}, пропущено ${result.skipped}. Категории: изменено ${result.categoriesChanged}, сохранено ${result.categoriesPreserved}`;
      if (result.errors.length > 0) {
        const firstError = result.errors[0];
        toast.warning(
          `${baseMessage}. Ошибки: ${result.errors.length}. Первая: строка ${firstError.row} — ${firstError.reason}`,
        );
      } else {
        toast.success(baseMessage);
      }
    } catch (error) {
      console.error("Failed to import products xlsx:", error);
      toast.error(getErrorMessage(error, "Не удалось импортировать XLSX"));
    } finally {
      setIsImporting(false);
    }
  };

  const handleUndoLatestImport = async () => {
    if (!importUndoStatus?.undoAvailable || !importUndoStatus.batch) return;

    const { batch } = importUndoStatus;
    const confirmed = window.confirm(
      `Отменить выгрузку «${batch.fileName}»? Будут удалены ${batch.createdCount} новых и восстановлены ${batch.updatedCount} обновлённых товаров.`,
    );
    if (!confirmed) return;

    try {
      setIsUndoingImport(true);
      const result = await dashboardApi.undoLatestProductsXlsxImport();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.tree() }),
        refreshImportUndoStatus(),
      ]);
      const baseMessage = `Выгрузка отменена: восстановлено ${result.restored}, удалено ${result.removed} товаров`;
      toast[result.skipped > 0 ? "warning" : "success"](
        result.skipped > 0
          ? `${baseMessage}. Не затронуто ${result.skipped}: они были изменены или уже используются после выгрузки`
          : baseMessage,
      );
    } catch (error) {
      console.error("Failed to undo XLSX import:", error);
      toast.error(getErrorMessage(error, "Не удалось отменить выгрузку"));
    } finally {
      setIsUndoingImport(false);
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
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Все товары</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} columns={18} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Товары
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить товары"
          message="Произошла ошибка при загрузке списка товаров. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategoryId("");
    setSelectedBrandId("");
    setVisibilityFilter("all");
    setSortBy("popularity");
    setShowAllProducts(false);
    clearSelectedProducts();
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(selectedCategoryId) ||
    Boolean(selectedBrandId) ||
    visibilityFilter !== "all" ||
    sortBy !== "popularity";

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Товары
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление каталогом товаров
            {meta && ` (${meta.total} товаров)`}
          </p>
        </div>
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept={XLSX_EXTENSIONS}
            className="hidden"
            onChange={handleImportXlsx}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto justify-center"
            onClick={() => importInputRef.current?.click()}
            isLoading={isImporting}
          >
            {!isImporting && (
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
                  d="M12 21V9m0 0l-4 4m4-4l4 4M5 3h14"
                />
              </svg>
            )}
            Импорт XLSX
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto justify-center"
            onClick={handleUndoLatestImport}
            isLoading={isUndoingImport}
            disabled={!importUndoStatus?.undoAvailable}
            title={
              importUndoStatus?.undoAvailable
                ? "Отменить последнюю выгрузку. Изменённые после неё товары останутся без изменений"
                : "Нет выгрузки, которую можно безопасно отменить"
            }
          >
            {!isUndoingImport && <RotateCcw className="mr-2 h-5 w-5" />}
            Отменить выгрузку
          </Button>
          <select
            value={exportActivity}
            onChange={(event) =>
              setExportActivity(event.target.value as ProductExportActivity)
            }
            className="h-[46px] w-full rounded-xl border border-primary-black bg-white px-3 text-sm text-primary-black sm:w-[180px]"
            aria-label="Фильтр выгрузки XLSX"
          >
            <option value="all">Выгрузить все</option>
            <option value="active">Только активные</option>
            <option value="inactive">Только неактивные</option>
          </select>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto justify-center"
            onClick={handleExportXlsx}
            isLoading={isExporting}
            title={
              selectedCategoryId || selectedBrandId
                ? "Выгрузить товары по выбранным категории и бренду"
                : "Выгрузить все товары"
            }
          >
            {!isExporting && (
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
                  d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14"
                />
              </svg>
            )}
            Экспорт XLSX
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto justify-center"
            onClick={() => router.push("/products/new")}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить товар
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary-black">
          Статус товара
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {VISIBILITY_FILTER_OPTIONS.map((option) => {
            const isSelected = visibilityFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setVisibilityFilter(option.value);
                  clearSelectedProducts();
                  setPage(1);
                }}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary-orange bg-primary-orange/10 text-primary-black"
                    : "border-gray-200 bg-white text-primary-black hover:bg-secondary-gray/60"
                }`}
                aria-pressed={isSelected}
              >
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-text-secondary-black">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Filters + Sort */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_1fr_auto_auto] gap-3 items-center">
        <TableSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            clearSelectedProducts();
            setPage(1);
          }}
          placeholder="Поиск по названию, описанию, SKU..."
        />

        <SearchableSelect
          value={selectedCategoryId}
          onChange={(value) => {
            setSelectedCategoryId(value);
            clearSelectedProducts();
            setPage(1);
          }}
          options={categorySelectOptions}
          placeholder="Все категории"
          emptyValueLabel="Все категории"
          emptyOptionLabel="Все категории"
          emptyOptionDescription="Показать товары из всех категорий"
          emptyLabel="Категория не найдена"
          showImages
        />

        <select
          value={selectedBrandId}
          onChange={(e) => {
            setSelectedBrandId(e.target.value);
            clearSelectedProducts();
            setPage(1);
          }}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
        >
          <option value="">Все бренды (Apple, Samsung...)</option>
          {brandOptions.map((brand: { id: string; name: string }) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as ProductSortBy);
            clearSelectedProducts();
            setPage(1);
          }}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-primary-black focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant={showAllProducts ? "primary" : "outline"}
          onClick={() => {
            setShowAllProducts((prev) => !prev);
            clearSelectedProducts();
            setPage(1);
          }}
          className="w-full xl:w-auto justify-center"
        >
          {showAllProducts ? "Вернуть пагинацию" : "Показать все товары"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="w-full xl:w-auto justify-center"
        >
          Сбросить
        </Button>
      </div>

      {showAllProducts && (
        <div className="text-sm text-text-secondary-black">
          {showAllLoadingMessage
            ? `Загрузка всех товаров: ${products.length} из ${allProductsMeta?.total || "..."}`
            : `Показаны все товары: ${products.length}`}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-primary-black">
            Массовое изменение цен
          </h2>
          <p className="text-xs text-text-secondary-black">
            Выбрано товаров: {selectedProducts.length}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(220px,1fr)_minmax(160px,220px)_auto_auto]">
          <select
            value={bulkPriceAction}
            onChange={(event) =>
              setBulkPriceAction(event.target.value as BulkPriceAction)
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
          >
            {BULK_PRICE_ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            value={bulkPriceValue}
            onChange={(event) => setBulkPriceValue(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-primary-black focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
            placeholder={
              usesPercentBulkAction ? "Например, 5" : "Например, 1000"
            }
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => void applyBulkPriceChange()}
            disabled={!hasSelectedProducts}
            isLoading={isApplyingBulkPrice}
            className="w-full lg:w-auto justify-center"
          >
            Применить к выбранным
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={clearSelectedProducts}
            disabled={!hasSelectedProducts || isApplyingBulkPrice}
            className="w-full lg:w-auto justify-center"
          >
            Снять выделение
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-primary-black">
            Массовое изменение категории
          </h2>
          <p className="text-xs text-text-secondary-black">
            Выбрано товаров: {selectedProducts.length}
          </p>
        </div>

        <p className="mt-1 text-xs text-text-secondary-black">
          У выбранных товаров прежние категории будут заменены на выбранную.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto]">
          <SearchableSelect
            label="Новая категория"
            value={bulkCategoryId}
            onChange={setBulkCategoryId}
            options={categorySelectOptions}
            placeholder="Выберите категорию"
            emptyLabel="Категория не найдена"
            showImages
            disabled={isApplyingBulkCategory}
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => void applyBulkCategoryChange()}
            disabled={!hasSelectedProducts || !bulkCategoryId}
            isLoading={isApplyingBulkCategory}
            className="w-full self-end lg:w-auto justify-center"
          >
            Переместить выбранные
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={clearSelectedProducts}
            disabled={!hasSelectedProducts || isApplyingBulkCategory}
            className="w-full self-end lg:w-auto justify-center"
          >
            Снять выделение
          </Button>
        </div>
      </div>

      {isCatalogCleanupVisible && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-primary-black">
              Проверка категорий
            </h2>
            <p className="mt-1 max-w-3xl text-xs text-text-secondary-black">
              Авто-правила ищут чехлы, стекла, кабели, зарядки, клавиатуры,
              Apple Watch и AirPods, которые лежат не в своей категории.
            </p>
            {cleanupScanned > 0 && (
              <p className="mt-2 text-xs text-text-secondary-black">
                Просканировано товаров: {cleanupScanned}. Найдено:{" "}
                {cleanupSuggestions.length}. К применению:{" "}
                {activeCleanupSuggestions.length}.
                {excludedCleanupCount > 0 &&
                  ` Исключено: ${excludedCleanupCount}.`}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadCatalogCleanupSuggestions()}
              isLoading={isLoadingCleanup}
              disabled={isApplyingCleanup}
              className="w-full sm:w-auto justify-center bg-white"
            >
              Найти ошибки
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void applyCatalogCleanupSuggestions()}
              isLoading={isApplyingCleanup}
              disabled={
                activeCleanupSuggestions.length === 0 || isLoadingCleanup
              }
              className="w-full sm:w-auto justify-center"
            >
              Применить исправления
            </Button>
          </div>
        </div>

        {cleanupSuggestions.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-orange-200 bg-white">
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-orange-100">
                    <th className="w-[110px] px-3 py-2 text-left font-semibold text-primary-black">
                      Применять
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-primary-black">
                      Товар
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-primary-black">
                      Сейчас
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-primary-black">
                      Перенести в
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-primary-black">
                      Почему
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cleanupSuggestions.map((suggestion) => (
                    <tr
                      key={suggestion.productId}
                      className="border-b border-orange-50 last:border-b-0"
                    >
                      <td className="px-3 py-2 align-top">
                        <label className="inline-flex items-center gap-2 text-xs text-text-secondary-black">
                          <input
                            type="checkbox"
                            checked={
                              !excludedCleanupProductIds.has(
                                suggestion.productId,
                              )
                            }
                            onChange={() =>
                              toggleCleanupSuggestion(suggestion.productId)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                          />
                          Да
                        </label>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Link
                          href={`/products/${suggestion.productId}`}
                          className="font-medium text-primary-black hover:text-primary-orange"
                        >
                          {suggestion.productName}
                        </Link>
                      </td>
                      <td className="px-3 py-2 align-top text-text-secondary-black">
                        {suggestion.currentCategoryPath.join(" > ") ||
                          suggestion.currentCategoryTitle}
                      </td>
                      <td className="px-3 py-2 align-top text-primary-black">
                        {suggestion.targetCategoryPath.join(" > ") ||
                          suggestion.targetCategoryTitle}
                      </td>
                      <td className="px-3 py-2 align-top text-text-secondary-black">
                        {suggestion.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-orange-100 px-3 py-2 text-xs text-text-secondary-black">
              Показаны все найденные строки: {cleanupSuggestions.length}.
              {excludedCleanupCount > 0 &&
                ` Исключенные строки не будут изменены: ${excludedCleanupCount}.`}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все товары</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={toggleSelectAllVisibleProducts}
                      onClick={(event) => event.stopPropagation()}
                      aria-label="Выбрать все товары на странице"
                      className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Название
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Описание
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Цена
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Старая цена
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Категория
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Бренд
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Изображение
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Активен
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    На скидке
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Просмотры
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Продано
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Рейтинг
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Отзывы
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    В наличии
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Создан
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Обновлен
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={18}
                      className="py-8 px-4 text-center text-text-secondary-black"
                    >
                      Ничего не найдено. Попробуйте изменить фильтры или поиск.
                    </td>
                  </tr>
                )}

                {products.map((product) => {
                  const primaryCategory = product.categories?.find(
                    (entry) => entry.isPrimary,
                  )?.category;
                  const fallbackCategory = product.categories?.[0]?.category;
                  const categoryLabel =
                    product.category?.title ||
                    product.category?.name ||
                    primaryCategory?.title ||
                    primaryCategory?.name ||
                    fallbackCategory?.title ||
                    fallbackCategory?.name ||
                    "-";
                  const displayStock = getDisplayStock(product);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors cursor-pointer"
                      onClick={() =>
                        window.open(
                          `/products/${product.id}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <td
                        className="py-3 px-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIdSet.has(product.id)}
                          onChange={(event) =>
                            toggleProductSelection(event, product.id)
                          }
                          aria-label={`Выбрать товар ${product.name || product.title || product.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-black font-medium">
                        {product.name || product.title}
                      </td>
                      <td
                        className="py-3 px-4 text-xs max-w-xs truncate"
                        title={product.description}
                      >
                        {product.description}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-black">
                        {editingPriceId === product.id ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min={0}
                              value={editingPriceValue}
                              onChange={(e) =>
                                setEditingPriceValue(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void savePrice(product);
                                }

                                if (e.key === "Escape") {
                                  cancelEditingPrice();
                                }
                              }}
                              className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                              autoFocus
                              disabled={savingPriceId === product.id}
                            />
                            <button
                              type="button"
                              onClick={() => void savePrice(product)}
                              disabled={savingPriceId === product.id}
                              className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
                            >
                              {savingPriceId === product.id ? "..." : "OK"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingPrice}
                              disabled={savingPriceId === product.id}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) =>
                              startEditingPrice(e, product.id, product.price)
                            }
                            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-secondary-gray/80 transition-colors"
                            title="Изменить цену"
                          >
                            <span>{formatPrice(product.price)}</span>
                            <svg
                              className="h-3.5 w-3.5 text-text-secondary-black"
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
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary-black">
                        {formatPrice(product.oldPrice)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary-black">
                        {categoryLabel}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary-black">
                        {product.brand?.name || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {product.images?.[0] ? (
                          <img
                            src={
                              typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0].url
                            }
                            alt={product.name || product.title || ""}
                            className="w-10 h-10 rounded-lg object-cover cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalImg(
                                product.images && product.images.length > 0
                                  ? typeof product.images[0] === "string"
                                    ? product.images[0]
                                    : typeof product.images[0]?.url === "string"
                                      ? product.images[0].url
                                      : null
                                  : null,
                              );
                            }}
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <label
                          className="inline-flex items-center gap-2 cursor-pointer"
                          title={
                            product.isActive
                              ? "Скрыть товар из выдачи"
                              : "Вернуть товар в выдачу"
                          }
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={product.isActive}
                            disabled={savingActiveId === product.id}
                            onChange={(event) =>
                              void toggleProductActive(event, product)
                            }
                            aria-label={`${
                              product.isActive ? "Скрыть" : "Показать"
                            } товар ${product.name || product.title || product.id}`}
                            className="sr-only"
                          />
                          <span
                            className={`relative h-5 w-9 rounded-full transition-colors ${
                              product.isActive ? "bg-green-500" : "bg-gray-300"
                            } ${
                              savingActiveId === product.id ? "opacity-60" : ""
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                product.isActive
                                  ? "translate-x-4"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </span>
                          <span
                            className={`whitespace-nowrap text-xs font-medium ${
                              product.isActive
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {savingActiveId === product.id
                              ? "..."
                              : product.isActive
                                ? "В выдаче"
                                : "Скрыт"}
                          </span>
                        </label>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                            product.isOnSale
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.isOnSale ? "Да" : "Нет"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.viewCount ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.soldCount ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.rating ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.reviewCount ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {editingStockId === product.id ? (
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={editingStockValue}
                              onChange={(e) =>
                                setEditingStockValue(
                                  e.target.value.replace(/[^\d]/g, ""),
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void saveStock(product);
                                }

                                if (e.key === "Escape") {
                                  cancelEditingStock();
                                }
                              }}
                              className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                              autoFocus
                              disabled={savingStockId === product.id}
                            />
                            <button
                              type="button"
                              onClick={() => void saveStock(product)}
                              disabled={savingStockId === product.id}
                              className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
                            >
                              {savingStockId === product.id ? "..." : "OK"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingStock}
                              disabled={savingStockId === product.id}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => startEditingStock(e, product)}
                            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-secondary-gray/80 transition-colors"
                            title={
                              primaryPickupPoint
                                ? `Изменить остаток: ${primaryPickupPoint.name}`
                                : "Нет активной точки для учета остатков"
                            }
                          >
                            <span>{displayStock}</span>
                            <span className="text-xs text-text-secondary-black">
                              шт.
                            </span>
                            <svg
                              className="h-3.5 w-3.5 text-text-secondary-black"
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
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleString("ru-RU")
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleString("ru-RU")
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="p-2 hover:bg-secondary-gray rounded-lg transition-colors">
                              <svg
                                className="w-4 h-4 text-primary-black"
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
                            </button>
                          </Link>
                          <Link
                            href={`/products/${product.id}#configurations`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button
                              type="button"
                              className="rounded-lg border border-primary-orange/30 px-2 py-1 text-xs font-medium text-primary-orange hover:bg-primary-orange/10 transition-colors"
                              title="Открыть конфигурации товара"
                            >
                              Конфиги
                            </button>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) =>
                              startEditingPrice(e, product.id, product.price)
                            }
                            disabled={savingPriceId === product.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-orange/30 px-2.5 py-1.5 text-xs font-semibold text-primary-orange transition-colors hover:bg-primary-orange hover:text-white disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-primary-orange"
                            title="Быстро изменить цену"
                            aria-label="Быстро изменить цену"
                          >
                            <span className="text-sm leading-none">₽</span>
                            <span>Цена</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => startEditingStock(e, product)}
                            disabled={savingStockId === product.id}
                            className="p-2 hover:bg-primary-orange/10 rounded-lg transition-colors disabled:opacity-60"
                            title="Быстро изменить остаток"
                          >
                            <svg
                              className="w-4 h-4 text-primary-orange"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </button>
                          {canDeleteProducts && (
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && !showAllProducts && (
            <TablePagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              total={meta.total}
              label="товаров"
            />
          )}
        </CardContent>
      </Card>
      {/* Модалка для фото */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setModalImg(null)}
        >
          <img
            src={modalImg}
            alt="Фото товара"
            className="max-w-full max-h-[90vh] rounded-lg shadow-lg border-4 border-white"
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={(e) => {
              e.stopPropagation();
              setModalImg(null);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
