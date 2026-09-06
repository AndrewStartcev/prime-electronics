"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSlider } from "@/shared/hooks";
import { BrandCard, brandsData } from "@/entities/brand";
import { useBrands, useCategoryTree } from "@/shared/hooks";
import {
  filterValidBrands,
  resolveBrandCategoryNode,
} from "@/shared/lib/catalogRouting";

const BRAND_IMAGE_MAP: Record<string, string | undefined> = {
  apple: "/images/brands/apple-brand-2026.png",
  samsung: "/images/brands/samsung-category.png",
  xiaomi: "/images/brands/xiaomi.svg",
  dyson: "/images/brands/dyson-brand-2026.png",
  garmin: "/images/brands/garmin.png",
  marshall: "/images/brands/marshall.png",
  jbl: "/images/brands/jbl.png",
  pixel: "/images/brands/pixel.png",
  oneplus: "/images/brands/oneplus-category.png",
  rayban: "/images/brands/rayban.png",
  yandeks: "/images/brands/yandeks-category.png",
  dji: "/images/brands/dji.png",
  insta360: "/images/brands/insta360.png",
  honor: "/images/brands/honor.png",
  nintendo: "/images/brands/nintendo.png",
  sony: "/images/brands/sony-category.jpg",
  whoop: "/images/brands/whoop.png",
  beats: "/images/brands/beats.png",
};

const BRAND_DISPLAY_NAME_MAP: Record<string, string> = {
  yandeks: "Яндекс Алиса",
};

const BRAND_KEYWORDS: Record<string, string[]> = {
  apple: ["apple", "iphone", "ipad", "mac", "airpods", "beats"],
  samsung: ["samsung", "galaxy"],
  xiaomi: ["xiaomi", "redmi", "poco"],
  dyson: ["dyson"],
  garmin: ["garmin"],
  marshall: ["marshall"],
  jbl: ["jbl"],
  pixel: ["pixel"],
  oneplus: ["oneplus", "one plus"],
  rayban: ["rayban", "ray ban"],
  yandeks: ["яндекс", "yandex"],
  dji: ["dji"],
  insta360: ["insta360"],
  honor: ["honor"],
  nintendo: ["nintendo"],
  sony: ["sony", "playstation"],
  whoop: ["whoop"],
  beats: ["beats"],
};

const normalizeText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");

const sanitizeCategoriesForBrand = (
  brandSlug: string,
  categories: string[],
): string[] => {
  const ownKeywords = BRAND_KEYWORDS[brandSlug] || [];
  const foreignKeywords = Object.entries(BRAND_KEYWORDS)
    .filter(([slug]) => slug !== brandSlug)
    .flatMap(([, keywords]) => keywords);

  const seen = new Set<string>();
  const result: string[] = [];

  categories.forEach((category) => {
    const cleaned = category.trim();
    if (!cleaned) return;

    const normalized = normalizeText(cleaned);
    const hasOwnKeyword =
      ownKeywords.length > 0 &&
      ownKeywords.some((keyword) => normalized.includes(keyword));
    const hasForeignKeyword = foreignKeywords.some((keyword) =>
      normalized.includes(keyword),
    );

    if (hasForeignKeyword && !hasOwnKeyword) return;

    const dedupeKey = normalized.replace(/\s+/g, " ");
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    result.push(cleaned);
  });

  return result;
};

const BRAND_ORDER = [
  "apple",
  "samsung",
  "dyson",
  "garmin",
  "marshall",
  "jbl",
  "pixel",
  "oneplus",
  "rayban",
  "yandeks",
  "dji",
  "insta360",
  "honor",
  "nintendo",
  "sony",
  "whoop",
  "beats",
  "xiaomi",
];

interface BrandSliderProps {
  limit?: number;
  showAllHref?: string;
  showAllLabel?: string;
}

export const BrandSlider = ({
  limit,
  showAllHref,
  showAllLabel = "Показать все",
}: BrandSliderProps) => {
  const isLimited = typeof limit === "number" && limit > 0;
  const { sliderRef, isDragging, handlers } = useSlider({ infinite: !isLimited });
  const { data: brandsResponse } = useBrands(1, 100);
  const { data: categoryTree } = useCategoryTree();

  const mappedBrands = useMemo(() => {
    const validBrands = filterValidBrands(brandsResponse?.data);
    const bySlug = new Map(validBrands.map((brand) => [brand.slug, brand]));

    return BRAND_ORDER.flatMap((slug) => {
      const brand = bySlug.get(slug);
      if (!brand) return [];

      const categoryNode = resolveBrandCategoryNode(categoryTree, brand);
      if (!categoryNode) return [];

      const rawCategories = (categoryNode.children || [])
        .map((child) => child.title)
        .filter(Boolean);
      const categories = sanitizeCategoriesForBrand(slug, rawCategories).slice(
        0,
        7,
      );

      return [
        {
          brand: slug,
          title: BRAND_DISPLAY_NAME_MAP[slug] || brand.name,
          categories,
          imageUrl: BRAND_IMAGE_MAP[slug],
          accentColor: "#ef6f2e",
          link: `/catalog/${categoryNode.slug}`,
        },
      ];
    });
  }, [brandsResponse?.data, categoryTree]);

  // Triple the items for infinite loop: [copy] [original] [copy]
  const brands = mappedBrands.length > 0 ? mappedBrands : brandsData;
  const visibleBrands = isLimited ? brands.slice(0, limit) : brands;
  const items = isLimited
    ? visibleBrands
    : [...visibleBrands, ...visibleBrands, ...visibleBrands];

  return (
    <section className="w-full">
      <div className="max-w-[1920px] mx-auto">
        <div
          ref={sliderRef}
          className={`flex gap-[14px] md:gap-[20px] pt-[16px] md:pt-[20px] pb-[28px] md:pb-[40px] overflow-x-auto scrollbar-hide select-none pl-[16px] md:pl-[24px] lg:pl-[40px] xl:pl-[60px] 2xl:pl-[120px] 3xl:pl-[180px] ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollBehavior: isDragging ? "auto" : "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          {...handlers}
        >
          {items.map((brand, index) => (
            <BrandCard key={`${brand.brand}-${index}`} {...brand} />
          ))}
          {/* Spacer for right padding effect */}
          <div className="shrink-0 w-[16px] md:w-[24px] lg:w-[40px] xl:w-[60px] 2xl:w-[120px] 3xl:w-[180px]" />
        </div>
        {showAllHref && (
          <div className="px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[180px] mt-[-10px] md:mt-[-16px] mb-[28px] md:mb-[40px]">
            <Link
              href={showAllHref}
              className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#131314]/15 bg-white px-[24px] text-[15px] font-medium text-[#131314] transition-colors hover:border-primary-orange hover:text-primary-orange"
            >
              {showAllLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
