"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const isModifiedClick = (event: MouseEvent) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

export const BasketNavigationFallback = () => {
  const pathname = usePathname();
  const isBasketPage = pathname?.startsWith("/basket");
  const isProductPage = pathname?.startsWith("/product/");
  const needsNativeNavigationFallback = isBasketPage || isProductPage;

  useEffect(() => {
    if (!needsNativeNavigationFallback) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) {
        return;
      }
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const targetPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (targetPath === currentPath) return;

      event.preventDefault();
      window.location.assign(targetPath);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [needsNativeNavigationFallback]);

  return null;
};
