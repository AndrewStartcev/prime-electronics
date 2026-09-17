import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoApi } from "@/shared/api/seoApi";
import { StaticPageRenderer } from "@/widgets/StaticPageBuilder/StaticPageRenderer";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/about";

async function getPage() {
  return seoApi.getBuilderPage(PAGE_PATH).catch(() => null);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage();
  if (!page || !page.isActive) return {};

  return {
    title: page.seoTitle || page.title || page.name || "О компании",
    description: page.seoDescription || undefined,
  };
}

export default async function AboutPage() {
  const page = await getPage();

  if (!page || !page.isActive || !page.blocks?.length) {
    notFound();
  }

  return <StaticPageRenderer page={page} />;
}
