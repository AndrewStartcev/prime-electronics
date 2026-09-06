"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CategoryCard } from "@/entities/category";
import type { CategoryTreeItem } from "@/shared/api";
import { useMainCategories } from "@/shared/hooks";
import {
  isBrandCategoryNode,
  shouldKeepBrandContextForCategorySlug,
  shouldShowBrandChildCategory,
} from "@/shared/lib/catalogRouting";
import {
  resolveCategoryCardImage,
  shouldEnableCategoryTreeQuery,
} from "./categoryGridData";

const SUBCATEGORY_SLUG_OVERRIDES: Record<string, Record<string, string>> = {
  apple: {
    "planshety-apple-ipad": "planshety-1",
    "noutbuki-apple": "noutbuki",
    "chasy-apple-watch": "chasy-1",
    "naushniki-apple-airpods-i-beats": "naushniki",
    "kompyutery-apple": "kompyutery",
    "aksessuary-apple": "aksessuary-1",
  },
};

// Loading skeleton for category card
const CategoryCardSkeleton = () => (
  <div className="relative rounded-[20px] md:rounded-[30px] p-[18px] md:p-[30px] lg:p-[50px] aspect-[4/3] md:aspect-auto md:h-[352px] lg:h-[450px] xl:h-[500px] flex flex-col bg-[#f5f5f7] animate-pulse">
    <div className="h-[24px] md:h-[36px] w-[60%] bg-gray-200 rounded mb-[8px] md:mb-[20px]" />
    <div className="hidden md:flex flex-wrap gap-[10px]">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-[40px] w-[100px] bg-gray-200 rounded-[60px]"
        />
      ))}
    </div>
    <div className="mt-auto flex justify-between items-end">
      <div className="hidden md:block h-[50px] w-[180px] bg-gray-200 rounded" />
      <div className="w-[34px] h-[34px] md:w-[40px] md:h-[40px] rounded-full bg-gray-200" />
    </div>
  </div>
);

const getChildren = (
  category: Partial<CategoryTreeItem> | null | undefined,
): CategoryTreeItem[] =>
  Array.isArray(category?.children)
    ? (category.children.filter(Boolean) as CategoryTreeItem[])
    : [];

const getSubcategoryTitles = (category: CategoryTreeItem): string[] =>
  getChildren(category)
    .filter((child) => shouldShowBrandChildCategory(category.slug, child.slug))
    .map((child) => child.title?.trim())
    .filter(Boolean)
    .filter(
      (title, index, all) => all.findIndex((item) => item === title) === index,
    ) as string[];

const getSubcategoryLinks = (
  category: CategoryTreeItem,
): Record<string, string> =>
  getChildren(category).reduce<Record<string, string>>((acc, child) => {
    if (!shouldShowBrandChildCategory(category.slug, child.slug)) return acc;

    const title = child.title?.trim();
    const childSlug = child.slug?.trim();

    if (!title || !childSlug || acc[title]) return acc;

    const overriddenSlug = SUBCATEGORY_SLUG_OVERRIDES[category.slug]?.[childSlug];
    const resolvedSlug = overriddenSlug || childSlug;
    const brandContext =
      overriddenSlug && shouldKeepBrandContextForCategorySlug(resolvedSlug)
      ? `?brand=${encodeURIComponent(category.slug)}`
      : "";

    acc[title] = `/catalog/${resolvedSlug}${brandContext}`;
    return acc;
  }, {});

const transformCategory = (
  category: CategoryTreeItem,
  totalProductsCount: number,
  type: "brand" | "category",
) => ({
  id: category.id,
  name: category.slug === "yandeks" ? "Яндекс Алиса" : category.title,
  slug: category.slug,
  type,
  subcategories: getSubcategoryTitles(category),
  subcategoryLinks: getSubcategoryLinks(category),
  description: `${totalProductsCount} товаров в категории`,
  imageUrl: resolveCategoryCardImage(category),
});

const getCategoryTotalProductsCount = (category: CategoryTreeItem): number =>
  (category._count?.products ?? 0) +
  getChildren(category).reduce(
    (total, child) => total + getCategoryTotalProductsCount(child),
    0,
  );

interface CategoriesGridProps {
  limit?: number;
  showAllHref?: string;
  showAllLabel?: string;
  displayMode?: "grid" | "carousel";
  cardPresentation?: "default" | "carousel";
  initialCategories?: CategoryTreeItem[];
}

const getVisibleSkeletonCount = (limit?: number) =>
  typeof limit === "number" && limit > 0 ? limit : 6;

const carouselItemClass =
  "w-[calc(100vw-64px)] max-w-[390px] shrink-0 snap-start sm:w-[420px] md:w-auto md:max-w-none md:basis-[calc(100%-16px)] lg:basis-[calc((100%-20px)/2)]";

export const CategoriesGrid = ({
  limit,
  showAllHref,
  showAllLabel = "Показать все",
  displayMode = "grid",
  cardPresentation,
  initialCategories,
}: CategoriesGridProps = {}) => {
  const { data: loadedCategories, isLoading: queryLoading, error } =
    useMainCategories({
      enabled: shouldEnableCategoryTreeQuery(initialCategories),
      initialData: initialCategories,
    });
  const categories = loadedCategories ?? initialCategories;
  const isLoading = queryLoading && !categories;
  const skeletonCount = getVisibleSkeletonCount(limit);
  const skeletonItems = Array.from(
    { length: skeletonCount },
    (_, index) => index + 1,
  );
  const leftSkeletons = skeletonItems.filter((_, index) => index % 2 === 0);
  const rightSkeletons = skeletonItems.filter((_, index) => index % 2 === 1);
  const gridCardPresentation = cardPresentation ?? "default";
  const gridMobileImageSize =
    gridCardPresentation === "carousel" ? "large" : "default";

  const rootCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );

  const totalsByCategoryId = useMemo(() => {
    const totals = new Map<string, number>();

    rootCategories.forEach((category) => {
      totals.set(
        category.id,
        category.productCount ?? getCategoryTotalProductsCount(category),
      );
    });

    return totals;
  }, [rootCategories]);

  const visibleCategories = useMemo(
    () =>
      rootCategories.filter(
        (category) => (totalsByCategoryId.get(category.id) ?? 0) > 0,
      ),
    [rootCategories, totalsByCategoryId],
  );

  const sortedVisibleCategories = useMemo(
    () =>
      [...visibleCategories].sort((a, b) => {
        if (a.mainSortOrder !== b.mainSortOrder) {
          return a.mainSortOrder - b.mainSortOrder;
        }

        return a.title.localeCompare(b.title, "ru");
      }),
    [visibleCategories],
  );

  if (isLoading) {
    if (displayMode === "carousel") {
      return (
        <div className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto pb-[12px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-[16px] lg:gap-[20px]">
          {skeletonItems.slice(0, 4).map((i) => (
            <div
              key={i}
              className={carouselItemClass}
            >
              <CategoryCardSkeleton />
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        {/* Single column skeleton until cards have enough room for a two-column layout */}
        <div className="lg:hidden flex flex-col gap-[12px] md:gap-[16px]">
          {skeletonItems.slice(0, 4).map((i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>

        {/* Two columns skeleton */}
        <div className="hidden lg:grid grid-cols-2 gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
          <div className="flex flex-col gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
            {leftSkeletons.map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
          <div className="flex flex-col gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
            {rightSkeletons.map((i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error || !categories) {
    return (
      <div className="text-center py-10">
        <p className="text-[#131314] text-lg">Не удалось загрузить категории</p>
        <p className="text-gray-500 mt-2">Попробуйте обновить страницу</p>
      </div>
    );
  }

  if (sortedVisibleCategories.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[#131314] text-lg">Категории с товарами не найдены</p>
      </div>
    );
  }

  const transformedCategories = sortedVisibleCategories.map((category) =>
    transformCategory(
      category,
      totalsByCategoryId.get(category.id) ?? 0,
      isBrandCategoryNode(category) ? "brand" : "category",
    ),
  );

  const displayedCategories =
    typeof limit === "number" && limit > 0
      ? transformedCategories.slice(0, limit)
      : transformedCategories;

  if (displayMode === "carousel") {
    return (
      <>
        <div className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto pb-[12px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-[16px] lg:gap-[20px]">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
              className={carouselItemClass}
            >
              <CategoryCard
                {...category}
                variant="white"
                mobileImageSize="large"
                presentation="carousel"
              />
            </div>
          ))}
        </div>
        {showAllHref &&
          transformedCategories.length > displayedCategories.length && (
            <div className="mt-[10px] md:mt-[16px] flex justify-center">
              <Link
                href={showAllHref}
                prefetch={false}
                className="inline-flex h-[46px] items-center justify-center rounded-full border border-[#131314]/15 bg-white px-[26px] text-[15px] font-medium text-[#131314] shadow-[0px_4px_20px_0px_rgba(19,19,20,0.06)] transition-colors hover:border-primary-orange hover:text-primary-orange"
              >
                {showAllLabel}
              </Link>
            </div>
          )}
      </>
    );
  }

  // Split categories into left and right columns
  const leftColumn = displayedCategories.filter((_, i) => i % 2 === 0);
  const rightColumn = displayedCategories.filter((_, i) => i % 2 === 1);

  return (
    <>
      {/* Single column until cards have enough room for a two-column layout */}
      <div className="lg:hidden flex flex-col gap-[12px] md:gap-[16px]">
        {displayedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            {...category}
            variant="white"
            mobileImageSize={gridMobileImageSize}
            presentation={gridCardPresentation}
          />
        ))}
      </div>

      {/* Two columns */}
      <div className="hidden lg:grid grid-cols-2 gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
        {/* Left Column */}
        <div className="flex flex-col gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
          {leftColumn.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              variant="white"
              mobileImageSize={gridMobileImageSize}
              presentation={gridCardPresentation}
            />
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[20px] xl:gap-[16px] 2xl:gap-[20px]">
          {rightColumn.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              variant="white"
              mobileImageSize={gridMobileImageSize}
              presentation={gridCardPresentation}
            />
          ))}
        </div>
      </div>
      {showAllHref && transformedCategories.length > displayedCategories.length && (
        <div className="mt-[18px] md:mt-[28px] flex justify-center">
          <Link
            href={showAllHref}
            prefetch={false}
            className="inline-flex h-[46px] items-center justify-center rounded-full border border-[#131314]/15 bg-white px-[26px] text-[15px] font-medium text-[#131314] shadow-[0px_4px_20px_0px_rgba(19,19,20,0.06)] transition-colors hover:border-primary-orange hover:text-primary-orange"
          >
            {showAllLabel}
          </Link>
        </div>
      )}
    </>
  );
};
