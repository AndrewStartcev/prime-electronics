"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CategoryTreeItem } from "@/shared/api";
import { useBrands, useCategoryTree } from "@/shared/hooks";
import {
  filterValidBrands,
  FOOTER_SUBCATEGORY_CANDIDATES,
  pickBestCategoryOption,
  resolveBrandCategoryNode,
  resolveCategoryTargets,
} from "@/shared/lib/catalogRouting";
import { FooterAccordion } from "./ui/FooterAccordion";
import { FooterContacts } from "./ui/FooterContacts";
import { FooterBottom } from "./ui/FooterBottom";
import { customerLinks } from "./model/footerLinks";

const dedupeLinks = (links: Array<{ label: string; href: string }>) => {
  const byHref = new Map<string, { label: string; href: string }>();

  links.forEach((link) => {
    if (!byHref.has(link.href)) {
      byHref.set(link.href, link);
    }
  });

  return Array.from(byHref.values());
};

const FOOTER_FALLBACK_LOAD_DELAY_MS = 8000;

const getChildren = (
  category: Partial<CategoryTreeItem> | null | undefined,
): CategoryTreeItem[] =>
  Array.isArray(category?.children)
    ? (category.children.filter(Boolean) as CategoryTreeItem[])
    : [];

const getCategoryTotalProductsCount = (category: CategoryTreeItem): number =>
  (category._count?.products ?? 0) +
  getChildren(category).reduce(
    (total, child) => total + getCategoryTotalProductsCount(child),
    0,
  );

const collectCategoryTotals = (
  category: CategoryTreeItem,
  totals: Map<string, number>,
) => {
  totals.set(category.id, getCategoryTotalProductsCount(category));
  getChildren(category).forEach((child) => collectCategoryTotals(child, totals));
};

export const Footer = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [shouldLoadFooterData, setShouldLoadFooterData] = useState(false);

  useEffect(() => {
    if (shouldLoadFooterData) return;

    const loadFooterData = () => setShouldLoadFooterData(true);
    let timeoutId: number | undefined;
    let observer: IntersectionObserver | undefined;

    if ("IntersectionObserver" in window && footerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadFooterData();
          }
        },
        { rootMargin: "0px" },
      );
      observer.observe(footerRef.current);
    } else {
      timeoutId = window.setTimeout(
        loadFooterData,
        FOOTER_FALLBACK_LOAD_DELAY_MS,
      );
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      observer?.disconnect();
    };
  }, [shouldLoadFooterData]);

  const { data: categoryTree } = useCategoryTree({
    enabled: shouldLoadFooterData,
  });
  const { data: brandsData } = useBrands(1, 100, {
    enabled: shouldLoadFooterData,
  });

  const subcategoryTargets = useMemo(
    () => resolveCategoryTargets(categoryTree, FOOTER_SUBCATEGORY_CANDIDATES),
    [categoryTree],
  );

  const totalsByCategoryId = useMemo(() => {
    const totals = new Map<string, number>();

    categoryTree?.forEach((category) => collectCategoryTotals(category, totals));

    return totals;
  }, [categoryTree]);

  const subcategoryLinks = useMemo(
    () =>
      dedupeLinks(
        subcategoryTargets
          .map((target) => {
            const category = pickBestCategoryOption(target, totalsByCategoryId);
            if (!category) return null;

            return {
              label: target.label,
              href: `/catalog/${category.slug}`,
            };
          })
          .filter(Boolean) as Array<{ label: string; href: string }>,
      ),
    [subcategoryTargets, totalsByCategoryId],
  );

  const brandLinks = useMemo(() => {
    const links = filterValidBrands(brandsData?.data)
      .map((brand) => {
        const category = resolveBrandCategoryNode(categoryTree, brand);
        if (!category) return null;

        return {
          label: brand.name,
          href: `/catalog/${category.slug}`,
        };
      })
      .filter(Boolean) as Array<{ label: string; href: string }>;

    return dedupeLinks(links).slice(0, 8);
  }, [brandsData?.data, categoryTree]);

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[#131314] pt-[40px] pb-[70px] md:py-[60px] lg:py-[80px] xl:py-[100px]"
    >
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        <div className="flex flex-col">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-[30px] md:gap-[60px] lg:gap-[100px] mb-[30px] md:mb-[60px] lg:mb-[124px]">
            <FooterContacts />
            <div className="hidden lg:flex gap-[60px] xl:gap-[100px] 2xl:gap-[128px]">
              {subcategoryLinks.length > 0 && (
                <FooterAccordion title="Категории" links={subcategoryLinks} />
              )}
              {brandLinks.length > 0 && (
                <FooterAccordion title="Бренды" links={brandLinks} />
              )}
              <FooterAccordion title="Покупателям" links={customerLinks} />
            </div>
          </div>
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
};
