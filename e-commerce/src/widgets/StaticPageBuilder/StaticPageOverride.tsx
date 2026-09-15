"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { seoApi, type StaticBuilderPage } from "@/shared/api/seoApi";
import { StaticPageRenderer } from "./StaticPageRenderer";

const BUILDER_PATHS = new Set([
  "/about",
  "/delivery",
  "/warranty",
  "/contacts",
  "/promotions",
  "/trade-in",
]);

export function StaticPageOverride({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [page, setPage] = useState<StaticBuilderPage | null>(null);
  const [resolvedPath, setResolvedPath] = useState("");

  useEffect(() => {
    let cancelled = false;
    setPage(null);
    setResolvedPath("");

    if (!BUILDER_PATHS.has(pathname)) {
      setResolvedPath(pathname);
      return () => {
        cancelled = true;
      };
    }

    seoApi
      .getBuilderPage(pathname)
      .then((result) => {
        if (!cancelled) setPage(result || null);
      })
      .catch(() => {
        if (!cancelled) setPage(null);
      })
      .finally(() => {
        if (!cancelled) setResolvedPath(pathname);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (resolvedPath === pathname && page?.isActive === false) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[1200px] px-4 py-16 md:px-10">
        <h1 className="text-3xl font-medium text-[#131314]">Страница недоступна</h1>
      </main>
    );
  }

  if (resolvedPath === pathname && page?.blocks?.length) {
    return <StaticPageRenderer page={page} />;
  }

  return <>{children}</>;
}
