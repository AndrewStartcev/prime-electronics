import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoApi } from "@/shared/api/seoApi";
import { StaticPageRenderer } from "@/widgets/StaticPageBuilder/StaticPageRenderer";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ path?: string }>;

function normalizePath(path?: string) {
  if (!path) return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : "/";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const path = normalizePath(params.path);
  const page = await seoApi.getBuilderPage(path).catch(() => null);
  if (!page || !page.isActive) return {};
  return {
    title: page.seoTitle || page.title || page.name || undefined,
    description: page.seoDescription || undefined,
  };
}

export default async function ManagedStaticPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const path = normalizePath(params.path);
  const page = await seoApi.getBuilderPage(path).catch(() => null);
  if (!page || !page.isActive || !page.blocks?.length) notFound();
  return <StaticPageRenderer page={page} />;
}
