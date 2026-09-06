"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { CatalogFilters } from "@/widgets/CatalogFilters";
import { PriceRangeSheet } from "@/widgets/PriceRangeSheet";
import { ProductCard } from "@/entities/product";
import { Pagination } from "@/shared/ui/Pagination";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { useCatalogFiltersStore } from "@/shared/stores/useCatalogFiltersStore";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useGuestFavoritesStore } from "@/shared/stores";
import { useProducts, useCategoryBySlug, useBrands } from "@/shared/hooks";
import type {
  BrandResponse,
  CategoryChild,
  CategoryResponse,
  ProductFilters,
  ProductsListResponse,
  SeoTagTile,
} from "@/shared/api";
import {
  filterValidBrands,
  shouldKeepBrandContextForCategorySlug,
  shouldShowBrandChildCategory,
} from "@/shared/lib/catalogRouting";

const sortOptions = [
  { id: "popular", label: "Популярные", value: "popularity" as const },
  { id: "price-asc", label: "Сначала недорогие", value: "price_asc" as const },
  { id: "price-desc", label: "Сначала дорогие", value: "price_desc" as const },
  { id: "new", label: "Сначала новые", value: "newest" as const },
  { id: "rating", label: "По рейтингу", value: "rating" as const },
];

const NEW_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const NOW_TIMESTAMP = Date.now();
const CATALOG_PAGE_SIZE = 24;
const EMPTY_CATEGORY_REDIRECTS: Record<string, string> = {
  "planshety-apple-ipad": "planshety-1",
  "noutbuki-apple": "noutbuki",
  "chasy-apple-watch": "chasy-1",
  "naushniki-apple-airpods-i-beats": "naushniki",
  "kompyutery-apple": "kompyutery",
  "aksessuary-apple": "aksessuary-1",
};

const EXCLUDED_SUBCATEGORY_SLUGS_BY_CATEGORY_SLUG: Record<
  string,
  Set<string>
> = {
  naushniki: new Set([
    "magssory",
    "chehly-dlya-airpods",
    "uniq-1",
    "vygodnye-predlozheniya-1",
  ]),
};

interface CatalogClientProps {
  categorySlug: string;
  brandContextSlug?: string;
  initialH1?: string;
  initialCategory?: CategoryResponse;
  initialBreadcrumbCategories?: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  initialProducts?: ProductsListResponse;
  tagTiles?: SeoTagTile[];
}

function normalizeCatalogKey(value?: string | null): string {
  return (value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]/gi, "");
}

function findBrandByCatalogKey(
  brands: BrandResponse[],
  ...values: Array<string | null | undefined>
): BrandResponse | null {
  const candidateKeys = values.map(normalizeCatalogKey).filter(Boolean);

  if (candidateKeys.length === 0) return null;

  return (
    brands.find((brand) => {
      const brandKeys = [
        normalizeCatalogKey(brand.slug),
        normalizeCatalogKey(brand.name),
      ].filter(Boolean);

      return brandKeys.some((key) => candidateKeys.includes(key));
    }) || null
  );
}

const getCategoryChildren = (
  category: { children?: CategoryChild[] } | null | undefined,
): CategoryChild[] =>
  Array.isArray(category?.children)
    ? (category.children.filter(Boolean) as CategoryChild[])
    : [];

// Loading skeleton for product card
const ProductCardSkeleton = () => (
  <div className="flex flex-col w-full p-[8px] md:p-[10px] lg:p-[14px] rounded-[12px] md:rounded-[16px] lg:rounded-[20px] animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-[12px] mb-[10px] md:mb-[14px] lg:mb-[18px]" />
    <div className="h-[40px] md:h-[50px] bg-gray-200 rounded mb-[8px]" />
    <div className="flex justify-between items-center">
      <div className="h-[24px] w-[80px] bg-gray-200 rounded" />
      <div className="h-[20px] w-[60px] bg-gray-200 rounded" />
    </div>
  </div>
);

export const CatalogClient = ({
  categorySlug,
  brandContextSlug,
  initialH1,
  initialCategory,
  initialBreadcrumbCategories,
  initialProducts,
  tagTiles = [],
}: CatalogClientProps) => {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isMobileSortClosing, setIsMobileSortClosing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const {
    initialize: initializeGuestFavorites,
    initialized: guestFavoritesInitialized,
  } = useGuestFavoritesStore();

  // Get filters from store
  const { inStock, minPrice, maxPrice, brandIds, attributes, resetFilters } =
    useCatalogFiltersStore();

  // Fetch category data
  const { data: category, isLoading: categoryLoading } =
    useCategoryBySlug(categorySlug, initialCategory);
  const { data: brandsList } = useBrands(1, 100);
  const activeBrands = useMemo(
    () => filterValidBrands(brandsList?.data),
    [brandsList?.data],
  );

  const explicitBrandContext = useMemo(
    () => findBrandByCatalogKey(activeBrands, brandContextSlug),
    [activeBrands, brandContextSlug],
  );

  const categoryBrand = useMemo(() => {
    if (!category || category.parentId) return null;

    return findBrandByCatalogKey(activeBrands, category.slug, category.title);
  }, [activeBrands, category]);

  const parentBrand = useMemo(() => {
    if (!category?.parent) return null;

    return findBrandByCatalogKey(
      activeBrands,
      category.parent.slug,
      category.parent.title,
    );
  }, [activeBrands, category]);

  const forcedBrandId = explicitBrandContext?.id || categoryBrand?.id || null;
  const catalogBrandScopeSlug =
    brandContextSlug || category?.parent?.slug || category?.slug;

  const effectiveBrandIds = forcedBrandId
    ? [forcedBrandId]
    : brandIds.length > 0
      ? brandIds
      : undefined;

  const hasUserFilters = Boolean(
    inStock ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    brandIds.length > 0 ||
    Object.keys(attributes).length > 0,
  );

  // Initialize guest favorites
  useEffect(() => {
    if (!isAuthenticated && !guestFavoritesInitialized) {
      initializeGuestFavorites();
    }
  }, [isAuthenticated, guestFavoritesInitialized, initializeGuestFavorites]);

  // Build filters
  const filters: ProductFilters = {
    page: currentPage,
    limit: CATALOG_PAGE_SIZE,
    categoryId: category?.id,
    sortBy: selectedSort.value,
    inStock: inStock || undefined,
    minPrice: minPrice,
    maxPrice: maxPrice,
    brandIds: effectiveBrandIds,
    brandSlug: catalogBrandScopeSlug,
    attributes:
      Object.keys(attributes).length > 0
        ? JSON.stringify(attributes)
        : undefined,
  };

  const canUseInitialProducts = Boolean(
    initialProducts &&
      currentPage === 1 &&
      selectedSort.value === "popularity" &&
      !inStock &&
      minPrice === undefined &&
      maxPrice === undefined &&
      brandIds.length === 0 &&
      Object.keys(attributes).length === 0 &&
      !explicitBrandContext &&
      category?.id === initialCategory?.id,
  );

  // Fetch products (only when category is loaded)
  const { data: productsData, isLoading: productsLoading } = useProducts(
    category?.id ? filters : { page: 1, limit: 1, categoryId: undefined },
    canUseInitialProducts ? initialProducts : undefined,
  );

  const fallbackCategorySlug = useMemo(() => {
    if (!category?.slug) return null;
    return EMPTY_CATEGORY_REDIRECTS[category.slug] || null;
  }, [category?.slug]);
  const scopedBrandSlug =
    explicitBrandContext?.slug || categoryBrand?.slug || parentBrand?.slug;
  const fallbackCategoryHref = useMemo(() => {
    if (!fallbackCategorySlug) return null;

    const brandQuery =
      scopedBrandSlug && shouldKeepBrandContextForCategorySlug(fallbackCategorySlug)
      ? `?brand=${encodeURIComponent(scopedBrandSlug)}`
      : "";

    return `/catalog/${fallbackCategorySlug}${brandQuery}`;
  }, [fallbackCategorySlug, scopedBrandSlug]);

  useEffect(() => {
    if (categoryLoading || productsLoading || hasUserFilters) return;
    if (!category || !productsData) return;
    if (productsData.meta.total > 0) return;
    if (!fallbackCategorySlug || fallbackCategorySlug === category.slug) return;
    if (!fallbackCategoryHref) return;

    router.replace(fallbackCategoryHref);
  }, [
    category,
    categoryLoading,
    fallbackCategoryHref,
    fallbackCategorySlug,
    hasUserFilters,
    productsData,
    productsLoading,
    router,
  ]);

  // Reset filters when category changes
  useEffect(() => {
    resetFilters();
    const timer = window.setTimeout(() => {
      setCurrentPage(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [brandContextSlug, categorySlug, resetFilters]);

  // Handle filter change - reset page
  const handleFiltersChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (option: (typeof sortOptions)[0]) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mobile sort bottom sheet handlers
  const handleMobileSortOpen = () => {
    setIsMobileSortOpen(true);
  };

  const handleMobileSortClose = () => {
    setIsMobileSortClosing(true);
    setTimeout(() => {
      setIsMobileSortOpen(false);
      setIsMobileSortClosing(false);
    }, 300);
  };

  const handleMobileSortSelect = (option: (typeof sortOptions)[0]) => {
    setSelectedSort(option);
    setCurrentPage(1);
    handleMobileSortClose();
  };

  // Transform backend product to frontend format
  const transformProduct = (
    product: NonNullable<typeof productsData>["data"][0],
  ) => ({
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description?.trim() || undefined,
    price: parseFloat(product.price),
    images:
      product.images.length > 0
        ? product.images.map((img) => img.url)
        : ["/images/placeholder-product.png"],
    inStock: product.totalStock > 0,
    isNew:
      new Date(product.createdAt) >
      new Date(NOW_TIMESTAMP - NEW_PRODUCT_WINDOW_MS),
    isSale: product.isOnSale,
    isFavorite: false,
    attributes: product.attributes?.map((a) => ({
      name: a.name,
      value: a.value,
      showInCard: a.showInCard,
    })),
  });

  const categoryChildren = useMemo(() => {
    const children = getCategoryChildren(category);
    const excludedSlugs = category?.slug
      ? EXCLUDED_SUBCATEGORY_SLUGS_BY_CATEGORY_SLUG[category.slug]
      : undefined;

    return children.filter(
      (child) =>
        shouldShowBrandChildCategory(category?.slug, child.slug) &&
        !excludedSlugs?.has(child.slug),
    );
  }, [category]);

  const subcategories = useMemo(
    () =>
      categoryChildren.map((child) => ({
        id: child.id,
        label: child.title,
        slug: child.slug,
      })),
    [categoryChildren],
  );

  const getSubcategoryHref = useCallback(
    (slug: string) => {
      const redirectedSlug = EMPTY_CATEGORY_REDIRECTS[slug];
      const resolvedSlug = redirectedSlug || slug;
      const brandQuery =
        redirectedSlug &&
        scopedBrandSlug &&
        shouldKeepBrandContextForCategorySlug(resolvedSlug)
          ? `?brand=${encodeURIComponent(scopedBrandSlug)}`
          : "";

      return `/catalog/${resolvedSlug}${brandQuery}`;
    },
    [scopedBrandSlug],
  );

  const linkedSubcategories = useMemo(
    () =>
      subcategories.map((sub) => ({
        ...sub,
        href: getSubcategoryHref(sub.slug),
      })),
    [getSubcategoryHref, subcategories],
  );

  const currentCategoryHref = useMemo(() => {
    const brandQuery = explicitBrandContext
      ? `?brand=${encodeURIComponent(explicitBrandContext.slug)}`
      : "";

    return `/catalog/${categorySlug}${brandQuery}`;
  }, [categorySlug, explicitBrandContext]);

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [
      { label: "Главная", href: "/" },
      { label: "Каталог", href: "/categories" },
    ];

    if (explicitBrandContext) {
      items.push({
        label: explicitBrandContext.name,
        href: `/catalog/${explicitBrandContext.slug}`,
      });
      items.push({ label: category?.title || "Загрузка..." });
      return items;
    }

    const categoryPath = initialBreadcrumbCategories?.length
      ? initialBreadcrumbCategories
      : [
          ...(category?.parent ? [category.parent] : []),
          ...(category
            ? [{ id: category.id, title: category.title, slug: category.slug }]
            : []),
        ];

    categoryPath.forEach((breadcrumb, index) => {
      const isCurrent = index === categoryPath.length - 1;
      items.push({
        label: breadcrumb.title,
        href: isCurrent ? undefined : `/catalog/${breadcrumb.slug}`,
      });
    });

    if (categoryPath.length === 0) {
      items.push({ label: "Загрузка..." });
    }

    return items;
  }, [category, explicitBrandContext, initialBreadcrumbCategories]);

  const isLoading = categoryLoading || productsLoading;
  const pageTitle = initialH1 || category?.seoH1 || category?.title;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-[10px] md:gap-[12px] lg:gap-[16px] xl:gap-[20px] mb-[10px] md:mb-[20px] lg:mb-[40px] xl:mb-[60px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-[4px] md:gap-[8px] lg:gap-[14px] xl:gap-[20px]">
          {categoryLoading ? (
            <div className="h-[36px] md:h-[46px] w-[200px] bg-gray-200 rounded animate-pulse" />
          ) : (
            <>
              <h1 className="font-medium text-[26px] md:text-[28px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
                {pageTitle}
              </h1>
              <span className="border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[60px] px-[10px] py-[4px] md:px-[12px] md:py-[5px] lg:px-[14px] lg:py-[6px] font-normal text-[14px] md:text-[15px] lg:text-[17px] xl:text-[18px] leading-[1.3] text-[#131314]">
                {productsData?.meta.total ?? category?._count?.products ?? 0}
              </span>
            </>
          )}
        </div>
      </div>

      {tagTiles.length > 0 && (
        <nav
          aria-label="Подборки в категории"
          className="mb-[24px] flex flex-wrap gap-[8px] md:mb-[32px] md:gap-[10px] lg:mb-[40px]"
        >
          {tagTiles.map((tile) => {
            const href = tile.collection?.isActive
              ? `/collections/${tile.collection.slug}`
              : tile.url;
            if (!href) return null;

            const className =
              "inline-flex min-h-[38px] items-center rounded-[8px] border border-[rgba(19,19,20,0.16)] bg-white px-[14px] py-[8px] text-[14px] leading-[1.2] text-[#131314] transition-colors hover:border-[#ef6f2e] hover:text-[#ef6f2e] md:min-h-[42px] md:px-[16px] md:text-[15px]";

            return /^https?:\/\//i.test(href) ? (
              <a key={tile.id} href={href} className={className}>
                {tile.title}
              </a>
            ) : (
              <Link key={tile.id} href={href} className={className}>
                {tile.title}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start gap-[30px] lg:gap-[60px] xl:gap-[100px]">
        <div className="hidden lg:block w-[325px] shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-[8px]">
          <CatalogFilters
            categoryId={category?.id}
            subcategories={linkedSubcategories}
            allowedBrandIds={forcedBrandId ? [forcedBrandId] : undefined}
            brandSlug={catalogBrandScopeSlug}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        <div className="flex-1">
          {/* Sort - Desktop Dropdown */}
          <div className="hidden lg:flex justify-end mb-[60px]">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-[10px] border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] px-[24px] py-[14px] hover:bg-[rgba(19,19,20,0.02)] transition-colors ${
                  isDropdownOpen ? "bg-[rgba(19,19,20,0.02)]" : ""
                }`}
              >
                <span className="font-medium text-[18px] leading-[1.1] text-[#131314]">
                  {selectedSort.label}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="#131314"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-[8px] bg-white border border-[rgba(19,19,20,0.1)] rounded-[14px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.1)] overflow-hidden z-50 min-w-full animate-in fade-in slide-in-from-top-2 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortSelect(option)}
                      className={`w-full px-[24px] py-[14px] text-left font-normal text-[18px] leading-[1.1] transition-colors hover:bg-[rgba(19,19,20,0.04)] whitespace-nowrap ${
                        selectedSort.id === option.id
                          ? "text-[#ef6f2e] bg-[rgba(239,111,46,0.05)]"
                          : "text-[#131314]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Subcategory Chips */}
          {subcategories.length > 0 && (
            <div className="lg:hidden -mx-[16px] md:-mx-[24px] mb-[16px] md:mb-[20px]">
              <div className="flex gap-[8px] overflow-x-auto px-[16px] md:px-[24px] scrollbar-hide">
                <Link
                  href={currentCategoryHref}
                  className="shrink-0 px-[14px] py-[8px] rounded-[10px] bg-[#131314] text-white text-[13px] md:text-[14px] font-medium leading-[1.3] transition-colors"
                >
                  Все
                </Link>
                {linkedSubcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    className="shrink-0 px-[14px] py-[8px] rounded-[10px] bg-[#f5f5f7] text-[#131314] text-[13px] md:text-[14px] font-medium leading-[1.3] hover:bg-[#e5e5e7] transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Toolbar: Sort + Filters + Price */}
          <div className="lg:hidden -mx-[16px] md:-mx-[24px] mb-[20px] md:mb-[28px] overflow-x-auto px-[16px] md:px-[24px] scrollbar-hide">
            <div className="flex items-center gap-[8px] min-w-max">
              {/* Filters Button */}
              <CatalogFilters
                categoryId={category?.id}
                subcategories={linkedSubcategories}
                allowedBrandIds={forcedBrandId ? [forcedBrandId] : undefined}
                brandSlug={catalogBrandScopeSlug}
                variant="mobile"
                onFiltersChange={handleFiltersChange}
              />

            {/* Sort Button */}
            <button
              onClick={handleMobileSortOpen}
              aria-label="Открыть сортировку"
              className="shrink-0 flex h-[40px] items-center gap-[6px] border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] px-[12px] hover:bg-[rgba(19,19,20,0.02)] transition-colors md:h-[44px] md:px-[14px]"
            >
              <ArrowUpDown
                size={16}
                strokeWidth={1.8}
                className="shrink-0 text-[#131314]"
              />
              <span className="font-normal text-[13px] md:text-[14px] leading-[1.3] text-[#131314] whitespace-nowrap">
                Сортировка
              </span>
            </button>

            {/* Price Range Button */}
            <PriceRangeSheet />
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-[11px] gap-y-[14px] md:gap-[20px] lg:gap-[20px] mb-[40px] md:mb-[60px] lg:mb-[80px]">
              {Array.from({ length: CATALOG_PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsData?.data && productsData.data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-[11px] gap-y-[14px] md:gap-[20px] lg:gap-[20px] mb-[40px] md:mb-[60px] lg:mb-[80px]">
              {productsData.data.map((product, index) => (
                <ProductCard
                  key={product.id}
                  {...transformProduct(product)}
                  imagePriority={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#131314] text-lg">Товары не найдены</p>
              <p className="text-gray-500 mt-2">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.meta.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={productsData.meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sort Bottom Sheet */}
      {isMobileSortOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-[300] lg:hidden ${
              isMobileSortClosing ? "animate-fadeOut" : "animate-fadeIn"
            }`}
            onClick={handleMobileSortClose}
          />
          <div
            className={`fixed inset-x-0 bottom-0 bg-white z-[310] rounded-t-[20px] shadow-[0_-4px_24px_rgba(0,0,0,0.15)] lg:hidden ${
              isMobileSortClosing
                ? "animate-slideOutBottom"
                : "animate-slideInBottom"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[16px] py-[22px] border-b border-[rgba(19,19,20,0.1)]">
              <h3 className="font-medium text-[20px] leading-[1.3] text-[#131314]">
                Сортировка
              </h3>
              <button
                onClick={handleMobileSortClose}
                className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-60 transition-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="#131314"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Sort Options */}
            <div className="px-[16px] py-[18px] space-y-[14px]">
              {sortOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-[10px] cursor-pointer group"
                  onClick={() => handleMobileSortSelect(option)}
                >
                  <div className="relative w-[24px] h-[24px] flex-shrink-0">
                    <div
                      className={`w-full h-full rounded-full border-[1.5px] transition-all ${
                        selectedSort.id === option.id
                          ? "border-[#ef6f2e]"
                          : "border-[rgba(19,19,20,0.2)] group-hover:border-[rgba(19,19,20,0.4)]"
                      }`}
                    />
                    {selectedSort.id === option.id && (
                      <div className="absolute inset-[4.8px] bg-[#ef6f2e] rounded-full animate-zoomIn" />
                    )}
                  </div>
                  <span className="font-normal text-[16px] leading-[1.3] text-[#131314] whitespace-nowrap">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
