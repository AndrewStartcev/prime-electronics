import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoApi } from "@/shared/api/seoApi";
import { StaticPageRenderer } from "@/widgets/StaticPageBuilder/StaticPageRenderer";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string[] }>;

function toPath(slug: string[]) {
  return `/${slug.map((part) => encodeURIComponent(part)).join("/")}`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const path = toPath(slug);
  const page = await seoApi.getBuilderPage(path).catch(() => null);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title || page.name || undefined,
    description: page.seoDescription || undefined,
  };
}

export default async function DynamicStaticPage({ params }: { params: Params }) {
  const { slug } = await params;
  const path = toPath(slug);
  const page = await seoApi.getBuilderPage(path).catch(() => null);
  if (!page || !page.isActive || !page.blocks?.length) notFound();
  return <StaticPageRenderer page={page} />;
}
