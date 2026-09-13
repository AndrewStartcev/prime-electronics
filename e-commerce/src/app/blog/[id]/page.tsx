import type { Metadata } from "next";
import BlogPostPageClient from "./BlogPostPageClient";
import { blogApi, type Blog } from "@/shared/api";
import {
  findSeoTemplate,
  getSeoTemplates,
  metadataFromSeo,
  resolveSeo,
  type ResolvedSeo,
} from "@/shared/lib/seoMetadata";
import { JsonLd, buildArticleStructuredData } from "@/shared/lib/structuredData";

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

function getBlogMeta(post: Blog | null): Record<string, unknown> {
  return post?.meta && typeof post.meta === "object" && !Array.isArray(post.meta)
    ? (post.meta as Record<string, unknown>)
    : {};
}

async function getBlogPost(slug: string): Promise<Blog | null> {
  try {
    return await blogApi.getBlogBySlug(slug);
  } catch (error) {
    console.error(`Failed to load blog post ${slug} for SEO:`, error);
    return null;
  }
}

async function resolveBlogPostSeo(post: Blog): Promise<ResolvedSeo> {
  const templates = await getSeoTemplates();
  const meta = getBlogMeta(post);

  return resolveSeo({
    manualTitle: String(meta.seoTitle || meta.title || ""),
    manualDescription: String(meta.seoDescription || meta.description || ""),
    manualH1: String(meta.seoH1 || meta.h1 || ""),
    template: findSeoTemplate(templates, "BLOG"),
    fallbackTitle: post.title,
    defaultDescription: post.excerpt || undefined,
    variables: {
      name: post.title,
    },
  });
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  const seo = post ? await resolveBlogPostSeo(post) : null;
  const authorName = post?.authorProfile?.name || post?.author;

  return metadataFromSeo({
    title: seo?.title || "Prime Electronics",
    description: seo?.description || "Интернет-бутик премиальной электроники",
  }, {
    canonicalPath: `/blog/${id.toLowerCase()}`,
    image: post?.imageUrl,
    openGraphType: "article",
    publishedTime: post?.publishedAt || post?.createdAt,
    modifiedTime: post?.updatedAt,
    authors: authorName ? [authorName] : undefined,
    section: "Блог",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPost(id);
  const seo = post ? await resolveBlogPostSeo(post) : null;

  return (
    <>
      {post && <JsonLd data={buildArticleStructuredData(post)} />}
      <BlogPostPageClient initialH1={seo?.h1} />
    </>
  );
}
