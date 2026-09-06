"use client";

import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  FilterAccordion,
  FilterCheckbox,
  PriceRange,
} from "@/entities/catalog";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useCatalogFiltersStore } from "@/shared/stores/useCatalogFiltersStore";
import { useProductFilters } from "@/shared/hooks";

interface CatalogFiltersProps {
  categoryId?: string;
  subcategories?: { id: string; label: string; slug: string; href?: string }[];
  allowedBrandIds?: string[];
  brandSlug?: string;
  hiddenAttributes?: string[];
  minPriceLimit?: number;
  maxPriceLimit?: number;
  hideInStock?: boolean;
  variant?: "desktop" | "mobile";
  onFiltersChange?: () => void;
}

const ATTRIBUTE_PRIORITY = [
  ["объем памяти", "объём памяти", "обьем памяти", "память", "storage"],
  ["цвет", "color"],
  ["esim", "e-sim", "e sim", "есим"],
  ["sim", "сим", "количество sim"],
  ["модификация"],
];

function normalizeAttributeName(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

function getAttributePriority(name: string): number {
  const normalized = normalizeAttributeName(name);
  const index = ATTRIBUTE_PRIORITY.findIndex((group) =>
    group.some((term) => normalized.includes(term)),
  );

  return index === -1 ? ATTRIBUTE_PRIORITY.length : index;
}

const FiltersContent = ({
  categoryId,
  subcategories,
  allowedBrandIds,
  brandSlug,
  hiddenAttributes,
  minPriceLimit,
  maxPriceLimit,
  hideInStock,
  onFiltersChange,
}: {
  categoryId?: string;
  subcategories?: { id: string; label: string; slug: string; href?: string }[];
  allowedBrandIds?: string[];
  brandSlug?: string;
  hiddenAttributes?: string[];
  minPriceLimit?: number;
  maxPriceLimit?: number;
  hideInStock?: boolean;
  onFiltersChange?: () => void;
}) => {
  const { data: filtersData } = useProductFilters(
    categoryId,
    allowedBrandIds,
    brandSlug,
  );

  const {
    inStock,
    setInStock,
    minPrice,
    maxPrice,
    setPriceRange,
    brandIds,
    toggleBrand,
    attributes,
    toggleAttribute,
    resetFilters,
    hasActiveFilters,
  } = useCatalogFiltersStore();

  const handleInStockChange = (checked: boolean) => {
    setInStock(checked);
    onFiltersChange?.();
  };

  const handleBrandToggle = (brandId: string) => {
    toggleBrand(brandId);
    onFiltersChange?.();
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange(min, max);
    onFiltersChange?.();
  };

  const handleAttributeToggle = (name: string, value: string) => {
    toggleAttribute(name, value);
    onFiltersChange?.();
  };

  const handleReset = () => {
    resetFilters();
    onFiltersChange?.();
  };

  const availableBrands = useMemo(() => {
    const brands = filtersData?.brands || [];
    if (!allowedBrandIds?.length) return brands;
    const allowed = new Set(allowedBrandIds);
    return brands.filter((brand) => allowed.has(brand.id));
  }, [allowedBrandIds, filtersData?.brands]);
  const hiddenAttributeNames = useMemo(
    () => new Set((hiddenAttributes || []).map(normalizeAttributeName)),
    [hiddenAttributes],
  );
  const sourcePriceMin = filtersData?.priceRange?.min || 0;
  const sourcePriceMax = filtersData?.priceRange?.max || 500000;
  const priceMin = Math.max(sourcePriceMin, minPriceLimit ?? sourcePriceMin);
  const priceMax = Math.max(
    priceMin + 1,
    Math.min(sourcePriceMax, maxPriceLimit ?? sourcePriceMax),
  );
  const attributeGroups = useMemo(
    () =>
      Object.entries(filtersData?.attributes || {})
        .map(([name, values]) => ({
          name,
          values: Array.from(
            new Set(values.map((value) => value.trim()).filter(Boolean)),
          ),
        }))
        .filter(
          (group) =>
            group.values.length > 1 &&
            !hiddenAttributeNames.has(normalizeAttributeName(group.name)),
        )
        .sort((a, b) => {
          const priorityDelta =
            getAttributePriority(a.name) - getAttributePriority(b.name);
          if (priorityDelta !== 0) return priorityDelta;
          return a.name.localeCompare(b.name, "ru");
        }),
    [filtersData?.attributes, hiddenAttributeNames],
  );

  return (
    <>
      {/* In Stock Toggle */}
      {!hideInStock && (
        <div className="flex items-center gap-[16px] md:gap-[20px] mb-[30px] md:mb-[40px]">
          <FilterCheckbox
            label="В наличии"
            checked={inStock}
            onChange={handleInStockChange}
          />
        </div>
      )}

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <FilterAccordion title="Подкатегории" defaultOpen>
          {subcategories.map((sub) => (
            <a
              key={sub.id}
              href={sub.href || `/catalog/${sub.slug}`}
              className="block py-[8px] text-[16px] text-[#131314] hover:text-[#ef6f2e] transition-colors"
            >
              {sub.label}
            </a>
          ))}
        </FilterAccordion>
      )}

      {/* Price Range */}
      <FilterAccordion title="Стоимость" defaultOpen>
        <PriceRange
          min={priceMin}
          max={priceMax}
          currentMin={minPrice ?? priceMin}
          currentMax={maxPrice ?? priceMax}
          onChange={handlePriceChange}
        />
      </FilterAccordion>

      {/* Brands */}
      {availableBrands.length > 1 && (
        <FilterAccordion title="Бренд" defaultOpen>
          {availableBrands.map((brand) => (
            <FilterCheckbox
              key={brand.id}
              label={brand.name}
              checked={brandIds.includes(brand.id)}
              onChange={() => handleBrandToggle(brand.id)}
            />
          ))}
        </FilterAccordion>
      )}

      {/* Dynamic Attributes */}
      {attributeGroups.map(({ name: attrName, values }) => (
        <FilterAccordion
          key={attrName}
          title={attrName}
          defaultOpen={getAttributePriority(attrName) < 4}
        >
          {values.map((value) => (
            <FilterCheckbox
              key={value}
              label={value}
              checked={attributes[attrName]?.includes(value) || false}
              onChange={() => handleAttributeToggle(attrName, value)}
            />
          ))}
        </FilterAccordion>
      ))}

      {/* Reset Filters */}
      {hasActiveFilters() && (
        <button
          onClick={handleReset}
          className="mt-[30px] md:mt-[40px] font-normal text-[16px] md:text-[18px] leading-[1.1] text-[#131314] border-b border-[#131314] hover:text-[#ef6f2e] hover:border-[#ef6f2e] transition-colors"
        >
          Сбросить фильтры
        </button>
      )}
    </>
  );
};

export const CatalogFilters = ({
  categoryId,
  subcategories,
  allowedBrandIds,
  brandSlug,
  hiddenAttributes,
  minPriceLimit,
  maxPriceLimit,
  hideInStock,
  variant = "desktop",
  onFiltersChange,
}: CatalogFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { openFilters, closeFilters, isFiltersOpen } = useModalStore();

  // Sync with global modal state
  useEffect(() => {
    if (isFiltersOpen && !isOpen && !isClosing && variant === "mobile") {
      const timer = window.setTimeout(() => setIsOpen(true), 0);

      return () => window.clearTimeout(timer);
    }
  }, [isFiltersOpen, isOpen, isClosing, variant]);

  const handleClose = () => {
    setIsClosing(true);
    closeFilters();
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Mobile variant - button + drawer
  if (variant === "mobile") {
    return (
      <>
        {/* Mobile Filter Button - Icon only on very small screens, with text on larger */}
        <button
          onClick={() => {
            setIsOpen(true);
            openFilters();
          }}
          aria-label="Открыть фильтры"
          className="lg:hidden shrink-0 flex h-[40px] min-w-[40px] items-center justify-center gap-[8px] border-[0.5px] border-[rgba(19,19,20,0.16)] rounded-[10px] px-[10px] hover:bg-[rgba(19,19,20,0.02)] transition-colors md:h-[44px] md:min-w-0 md:px-[14px]"
        >
          <SlidersHorizontal
            size={20}
            strokeWidth={1.8}
            className="shrink-0 text-[#131314]"
          />
          <span className="hidden md:inline font-normal text-[16px] leading-[1.3] text-[#131314]">
            Фильтры
          </span>
        </button>

        {/* Mobile Drawer */}
        {isOpen && (
          <>
            {/* Backdrop with fade animation */}
            <div
              className={`fixed inset-0 bg-black/50 z-[300] lg:hidden ${
                isClosing ? "animate-fadeOut" : "animate-fadeIn"
              }`}
              onClick={handleClose}
            />

            {/* Drawer with slide-in animation */}
            <div
              className={`fixed inset-y-0 left-0 w-full max-w-[375px] bg-white z-[310] lg:hidden overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.15)] ${
                isClosing ? "animate-slideOutLeft" : "animate-slideInLeft"
              }`}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white flex items-center justify-between px-[16px] py-[22px] border-b border-[rgba(19,19,20,0.1)]">
                <h2 className="font-medium text-[20px] leading-[1.3] text-[#131314]">
                  Фильтры
                </h2>
                <button
                  onClick={handleClose}
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

              {/* Content */}
              <div className="px-[16px] py-[24px]">
                <FiltersContent
                  categoryId={categoryId}
                  subcategories={subcategories}
                  allowedBrandIds={allowedBrandIds}
                  brandSlug={brandSlug}
                  hiddenAttributes={hiddenAttributes}
                  minPriceLimit={minPriceLimit}
                  maxPriceLimit={maxPriceLimit}
                  hideInStock={hideInStock}
                  onFiltersChange={onFiltersChange}
                />
              </div>

              {/* Apply Button - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white px-[16px] py-[17px] border-t border-[rgba(19,19,20,0.1)]">
                <button
                  onClick={handleClose}
                  className="w-full bg-[#ef6f2e] text-white font-medium text-[16px] leading-[1.1] py-[15px] rounded-[10px] hover:bg-[#d65e23] transition-all active:scale-[0.98]"
                >
                  Применить фильтры
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop variant - sidebar
  return (
    <div className="w-[280px] lg:w-[325px] flex-shrink-0">
      <FiltersContent
        categoryId={categoryId}
        subcategories={subcategories}
        allowedBrandIds={allowedBrandIds}
        brandSlug={brandSlug}
        hiddenAttributes={hiddenAttributes}
        minPriceLimit={minPriceLimit}
        maxPriceLimit={maxPriceLimit}
        hideInStock={hideInStock}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
};
