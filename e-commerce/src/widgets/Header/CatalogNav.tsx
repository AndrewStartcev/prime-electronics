"use client";

import Link from "next/link";

interface CatalogNavProps {
  isDark?: boolean;
}

type HeaderNavItem = {
  label: string;
  href: string;
};

const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: "Apple", href: "/catalog/apple" },
  { label: "Samsung", href: "/catalog/samsung" },
  { label: "Ноутбуки", href: "/catalog/noutbuki" },
  { label: "Часы", href: "/catalog/chasy" },
  { label: "Наушники", href: "/catalog/naushniki" },
  { label: "PlayStation", href: "/catalog/pristavki-1" },
  { label: "Аксессуары", href: "/catalog/aksessuary-1" },
];

export const CatalogNav = ({ isDark = false }: CatalogNavProps) => {
  return (
    <nav className="flex items-center justify-between w-full gap-[8px] md:gap-[10px] lg:gap-[14px] xl:gap-[18px] 2xl:gap-[28px]">
      {HEADER_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          data-nav="catalog"
          className={`font-normal text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[18px] leading-[1.1] ${
            isDark ? "text-black" : "text-white"
          } hover:text-[#ef6f2e] transition-colors whitespace-nowrap`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
