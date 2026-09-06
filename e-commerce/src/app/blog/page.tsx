import type { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/blog", "Блог", "BLOG");
}

export default async function BlogPage() {
  const seo = await resolveStaticPageSeo("/blog", "Блог", "BLOG");

  return <BlogPageClient initialH1={seo.h1} />;
}
