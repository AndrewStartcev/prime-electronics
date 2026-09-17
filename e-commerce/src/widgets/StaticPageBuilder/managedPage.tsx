import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoApi } from "@/shared/api/seoApi";
import { StaticPageRenderer } from "./StaticPageRenderer";

async function getManagedPage(path: string) {
  return seoApi.getBuilderPage(path).catch(() => null);
}

export async function buildManagedPageMetadata(
  path: string,
  fallbackTitle: string,
): Promise<Metadata> {
  const page = await getManagedPage(path);
  if (!page || !page.isActive) return {};

  return {
    title: page.seoTitle || page.title || page.name || fallbackTitle,
    description: page.seoDescription || undefined,
  };
}

export async function renderManagedPage(path: string) {
  const page = await getManagedPage(path);

  if (!page || !page.isActive || !page.blocks?.length) {
    notFound();
  }

  return <StaticPageRenderer page={page} />;
}
