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
        if (!cancelled) setPage(result?.blocks?.length ? result : null);
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

  if (resolvedPath === pathname && page) {
    return <StaticPageRenderer page={page} />;
  }

  return <>{children}</>;
}
