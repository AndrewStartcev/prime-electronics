"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/entities/product";
import { useProducts } from "@/shared/hooks";
import type {
  ProductFilters,
  ProductsListResponse,
  SeoCollection,
} from "@/shared/api";
import { useCatalogFiltersStore } from "@/shared/stores/useCatalogFiltersStore";
import { Pagination } from "@/shared/ui/Pagination";
import { CatalogFilters } from "@/widgets/CatalogFilters";

const PAGE_SIZE = 24;
const NEW_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const NOW_TIMESTAMP = Date.now();

const sortOptions = [
  { label: "Популярные", value: "popularity" as const },
  { label: "Сначала недорогие", value: "price_asc" as const },
  { label: "Сначала дорогие", value: "price_desc" as const },
  { label: "Сначала новые", value: "newest" as const },
  { label: "По рейтингу", value: "rating" as const },
];

type CollectionCatalogClientProps = {
  collection: SeoCollection;
  initialProducts: ProductsListResponse;
};

const normalizeName = (value: string) =>
  value.toLowerCase().replace(/ё/g, "е").trim();

export function CollectionCatalogClient({
  collection,
  initialProducts,
}: CollectionCatalogClientProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductFilters["sortBy"]>(
    collection.sortBy || "popularity",
  );
  const {
    inStock,
    minPrice,
    maxPrice,
    brandIds,
    attributes,
    resetFilters,
  } = useCatalogFiltersStore();

  const baseBrandIds = collection.brandIds || [];
  const lockedAttributeNames = useMemo(
    () => Object.keys(collection.attributes || {}),
    [collection.attributes],
  );
  const lockedAttributeKeys = useMemo(
    () => new Set(lockedAttributeNames.map(normalizeName)),
    [lockedAttributeNames],
  );

  useEffect(() => {
    resetFilters();
    setPage(1);
    setSortBy(collection.sortBy || "popularity");
  }, [collection.id, collection.sortBy, resetFilters]);

  const effectiveBrandIds = useMemo(() => {
    if (baseBrandIds.length === 0) return brandIds.length ? brandIds : undefined;
    if (brandIds.length === 0) return baseBrandIds;

    const selected = brandIds.filter((id) => baseBrandIds.includes(id));
    return selected.length ? selected : baseBrandIds;
  }, [baseBrandIds, brandIds]);

  const effectiveAttributes = useMemo(() => {
    const result: Record<string, string[]> = {
      ...(collection.attributes || {}),
    };

    Object.entries(attributes).forEach(([name, values]) => {
      if (!lockedAttributeKeys.has(normalizeName(name))) result[name] = values;
    });

    return result;
  }, [attributes, collection.attributes, lockedAttributeKeys]);

  const collectionMinPrice =
    collection.minPrice !== null && collection.minPrice !== undefined
      ? Number(collection.minPrice)
      : undefined;
  const collectionMaxPrice =
    collection.maxPrice !== null && collection.maxPrice !== undefined
      ? Number(collection.maxPrice)
      : undefined;
  const effectiveMinPrice =
    collectionMinPrice === undefined
      ? minPrice
      : Math.max(collectionMinPrice, minPrice ?? collectionMinPrice);
  const effectiveMaxPrice =
    collectionMaxPrice === undefined
      ? maxPrice
      : Math.min(collectionMaxPrice, maxPrice ?? collectionMaxPrice);

  const filters: ProductFilters = {
    page,
    limit: PAGE_SIZE,
    categoryId: collection.categoryId || undefined,
    brandIds: effectiveBrandIds,
    minPrice: effectiveMinPrice,
    maxPrice: effectiveMaxPrice,
    inStock: collection.inStock || inStock || undefined,
    isOnSale: collection.isOnSale || undefined,
    sortBy,
    attributes:
      Object.keys(effectiveAttributes).length > 0
        ? JSON.stringify(effectiveAttributes)
        : undefined,
  };

  const hasUserFilters = Boolean(
    inStock ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      brandIds.length > 0 ||
      Object.keys(attributes).length > 0,
  );
  const canUseInitialProducts =
    page === 1 &&
    !hasUserFilters &&
    sortBy === (collection.sortBy || "popularity");
  const { data: products, isLoading } = useProducts(
    filters,
    canUseInitialProducts ? initialProducts : undefined,
  );

  const handleFiltersChange = useCallback(() => setPage(1), []);
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-[24px] lg:flex-row lg:items-start lg:gap-[60px] xl:gap-[100px]">
      <div className="hidden w-[325px] shrink-0 lg:sticky lg:top-[120px] lg:block lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-[8px]">
        <CatalogFilters
          categoryId={collection.categoryId || undefined}
          allowedBrandIds={baseBrandIds}
          hiddenAttributes={lockedAttributeNames}
          minPriceLimit={collectionMinPrice}
          maxPriceLimit={collectionMaxPrice}
          hideInStock={collection.inStock}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-[24px] flex items-center justify-between gap-[12px] md:mb-[32px] lg:justify-end lg:mb-[44px]">
          <CatalogFilters
            categoryId={collection.categoryId || undefined}
            allowedBrandIds={baseBrandIds}
            hiddenAttributes={lockedAttributeNames}
            minPriceLimit={collectionMinPrice}
            maxPriceLimit={collectionMaxPrice}
            hideInStock={collection.inStock}
            variant="mobile"
            onFiltersChange={handleFiltersChange}
          />
          <label className="relative flex min-h-[40px] items-center gap-2 rounded-[10px] border border-[rgba(19,19,20,0.16)] px-[12px] md:min-h-[44px] md:px-[14px]">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#131314]" aria-hidden="true" />
            <select
              aria-label="Сортировка товаров"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as ProductFilters["sortBy"]);
                setPage(1);
              }}
              className="max-w-[190px] bg-transparent text-[13px] text-[#131314] outline-none md:text-[14px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-[11px] gap-y-[18px] md:gap-[20px] lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[0.72] animate-pulse rounded-[12px] bg-[#f5f5f7]" />
            ))}
          </div>
        ) : products?.data.length ? (
          <div className="grid grid-cols-2 gap-x-[11px] gap-y-[18px] md:gap-[20px] lg:grid-cols-3">
            {products.data.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                title={product.name}
                description={product.description?.trim() || undefined}
                price={Number(product.price)}
                images={
                  product.images?.length
                    ? product.images.map((image) => image.url)
                    : ["/images/placeholder-product.png"]
                }
                inStock={product.totalStock > 0}
                isNew={
                  new Date(product.createdAt).getTime() >
                  NOW_TIMESTAMP - NEW_PRODUCT_WINDOW_MS
                }
                isSale={product.isOnSale}
                isFavorite={false}
                imagePriority={index < 3}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-[18px] text-[#131314]">Товары не найдены</p>
            <p className="mt-2 text-[15px] text-[rgba(19,19,20,0.6)]">
              Попробуйте изменить дополнительные фильтры
            </p>
          </div>
        )}

        {products && products.meta.totalPages > 1 && (
          <div className="mt-[40px] flex justify-center md:mt-[60px]">
            <Pagination
              currentPage={page}
              totalPages={products.meta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
