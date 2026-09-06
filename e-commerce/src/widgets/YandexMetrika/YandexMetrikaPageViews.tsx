"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { YANDEX_METRIKA_ID } from "./analytics";

type YandexMetrika = (
  counterId: number,
  method: "hit",
  url: string,
) => void;

declare global {
  interface Window {
    ym?: YandexMetrika;
  }
}

export function YandexMetrikaPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousLocationRef = useRef<string | null>(null);
  const search = searchParams.toString();
  const currentLocation = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    if (previousLocationRef.current === currentLocation) return;

    const isInitialPageView = previousLocationRef.current === null;
    previousLocationRef.current = currentLocation;

    // The inline counter already records the first server-rendered page.
    if (!isInitialPageView) {
      window.ym?.(YANDEX_METRIKA_ID, "hit", window.location.href);
    }
  }, [currentLocation]);

  return null;
}
