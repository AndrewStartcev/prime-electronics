import type { Metadata } from "next";
import {
  seoApi,
  type SeoPageType,
  type SeoTemplate,
  type StaticPageSeo,
} from "@/shared/api";
import { resolveSeoText, type SeoVariables } from "./seo";

export const DEFAULT_SEO_TITLE = "Prime Electronics";
export const DEFAULT_SEO_DESCRIPTION =
  "Интернет-бутик премиальной электроники";
export const SITE_URL = "https://prime-electronics.ru";
export const DEFAULT_OG_IMAGE = "/images/prime_banner.png";

export interface ResolvedSeo {
  title: string;
  description: string;
  h1: string;
}

export function absoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function metadataFromSeo(
  seo: Pick<ResolvedSeo, "title" | "description">,
  options: {
    canonicalPath?: string;
    image?: string | null;
    openGraphType?: "website" | "article" | false;
    publishedTime?: string | null;
    modifiedTime?: string | null;
    authors?: string[];
    section?: string | null;
  } = {},
): Metadata {
  const canonical = options.canonicalPath
    ? absoluteSiteUrl(options.canonicalPath)
    : undefined;
  const image = absoluteSiteUrl(options.image || DEFAULT_OG_IMAGE);
  const title = seo.title || DEFAULT_SEO_TITLE;
  const description = seo.description || DEFAULT_SEO_DESCRIPTION;
  const commonOpenGraph = {
    title,
    description,
    url: canonical,
    siteName: "Prime Electronics",
    locale: "ru_RU",
    images: [{ url: image }],
  };
  const openGraph: Metadata["openGraph"] =
    options.openGraphType === "article"
      ? {
          type: "article" as const,
          ...commonOpenGraph,
          publishedTime: options.publishedTime || undefined,
          modifiedTime: options.modifiedTime || undefined,
          authors: options.authors,
          section: options.section || undefined,
        }
      : options.openGraphType === false
        ? commonOpenGraph
        : {
            type: "website" as const,
            ...commonOpenGraph,
          };

  return {
    title,
    description,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export async function getSeoTemplates(): Promise<SeoTemplate[]> {
  try {
    return await seoApi.getTemplates();
  } catch (error) {
    console.error("Failed to load SEO templates:", error);
    return [];
  }
}

export function findSeoTemplate(
  templates: SeoTemplate[],
  type: SeoPageType,
): SeoTemplate | null {
  return templates.find((template) => template.type === type) || null;
}

export function resolveSeo({
  manualTitle,
  manualDescription,
  manualH1,
  template,
  fallbackTitle,
  defaultTitle = DEFAULT_SEO_TITLE,
  defaultDescription = DEFAULT_SEO_DESCRIPTION,
  variables,
}: {
  manualTitle?: string | null;
  manualDescription?: string | null;
  manualH1?: string | null;
  template?: SeoTemplate | null;
  fallbackTitle?: string | null;
  defaultTitle?: string;
  defaultDescription?: string;
  variables?: SeoVariables;
}): ResolvedSeo {
  return {
    title: resolveSeoText({
      manual: manualTitle,
      template: template?.titleTemplate,
      fallbackTitle,
      defaultValue: defaultTitle,
      variables,
    }),
    description: resolveSeoText({
      manual: manualDescription,
      template: template?.descriptionTemplate,
      fallbackTitle,
      defaultValue: defaultDescription,
      variables,
    }),
    h1: resolveSeoText({
      manual: manualH1,
      template: template?.h1Template,
      fallbackTitle,
      defaultValue: fallbackTitle || defaultTitle,
      variables,
    }),
  };
}

export async function resolveStaticPageSeo(
  path: string,
  fallbackTitle: string,
  type: SeoPageType = path === "/" ? "HOME" : "STATIC",
): Promise<ResolvedSeo> {
  let page: StaticPageSeo | null = null;
  const templates = await getSeoTemplates();

  try {
    page = await seoApi.getStaticPage(path);
  } catch (error) {
    console.error(`Failed to load static SEO for ${path}:`, error);
  }

  const pageTitle = page?.title || page?.name || fallbackTitle;

  return resolveSeo({
    manualTitle: page?.seoTitle,
    manualDescription: page?.seoDescription,
    manualH1: page?.seoH1,
    template: findSeoTemplate(templates, type),
    fallbackTitle: pageTitle,
    variables: {
      name: pageTitle,
    },
  });
}

export async function generateStaticPageMetadata(
  path: string,
  fallbackTitle: string,
  type?: SeoPageType,
): Promise<Metadata> {
  return metadataFromSeo(await resolveStaticPageSeo(path, fallbackTitle, type), {
    canonicalPath: path,
  });
}
