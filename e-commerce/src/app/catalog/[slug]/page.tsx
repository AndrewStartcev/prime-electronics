import { CatalogClient } from "./CatalogClient";
import { HtmlContent } from "@/shared/ui";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import {
  categoryApi,
  getSeoCollectionProductFilters,
  productApi,
  seoApi,
  type CategoryResponse,
  type ProductsListResponse,
  type SeoTagTile,
} from "@/shared/api";
import { shouldKeepBrandContextForCategorySlug } from "@/shared/lib/catalogRouting";
import { replaceSeoTemplateVariables } from "@/shared/lib/seo";
import {
  absoluteSiteUrl,
  findSeoTemplate,
  getSeoTemplates,
  metadataFromSeo,
  resolveSeo,
  type ResolvedSeo,
} from "@/shared/lib/seoMetadata";
import {
  JsonLd,
  buildBreadcrumbStructuredData,
  buildItemListStructuredData,
} from "@/shared/lib/structuredData";
import { getCategoryBreadcrumbs } from "@/shared/lib/categoryBreadcrumbs";

interface CatalogPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    brand?: string | string[];
    from?: string | string[];
  }>;
}

const getSearchParamValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const CANONICAL_CATEGORY_REDIRECTS: Record<string, string> = {
  telefony: "smartfony-apple-iphone",
  "naushniki-apple-airpods-i-beats": "naushniki",
};
const CATALOG_PAGE_SIZE = 24;

const isNotFoundError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 404;

const getCategory = cache(
  async (slug: string): Promise<CategoryResponse | null> => {
    try {
      return await categoryApi.getBySlug(slug);
    } catch (error) {
      if (isNotFoundError(error)) return null;
      console.error(`Failed to load catalog category ${slug}:`, error);
      throw error;
    }
  },
);

const getCatalogSeo = cache(
  async (slug: string): Promise<ResolvedSeo | null> => {
    const category = await getCategory(slug);
    if (!category) return null;

    try {
      const [templates, products] = await Promise.all([
        getSeoTemplates(),
        productApi.getAll({
          categoryId: category.id,
          page: 1,
          limit: 1,
          sortBy: "price_asc",
        }),
      ]);

      const minPrice = products.data[0]?.price;
      const productCount = products.meta.total || category._count?.products || 0;

      return resolveSeo({
        manualTitle: category.seoTitle,
        manualDescription: category.seoDescription,
        manualH1: category.seoH1,
        template: findSeoTemplate(templates, "CATEGORY"),
        fallbackTitle: category.title,
        variables: {
          name: category.title,
          productCount,
          minPrice,
        },
      });
    } catch (error) {
      console.error(`Failed to resolve catalog SEO for ${category.slug}:`, error);
      return null;
    }
  },
);

const getCatalogProducts = cache(
  async (
    categoryId: string,
    brandSlug?: string,
  ): Promise<ProductsListResponse | null> => {
    try {
      return await productApi.getAll({
        categoryId,
        brandSlug,
        page: 1,
        limit: CATALOG_PAGE_SIZE,
        sortBy: "popularity",
      });
    } catch (error) {
      console.error(`Failed to load catalog products for ${categoryId}:`, error);
      return null;
    }
  },
);

const resolveTagTile = async (tile: SeoTagTile): Promise<SeoTagTile> => {
  if (!tile.collection?.isActive) return tile;

  try {
    const collection = await seoApi.getCollectionBySlug(tile.collection.slug);
    const products = await productApi.getAll({
      ...getSeoCollectionProductFilters(collection),
      page: 1,
      limit: 1,
      sortBy: "price_asc",
    });

    return {
      ...tile,
      title: replaceSeoTemplateVariables(tile.title, {
        name: collection.name,
        productCount: products.meta.total,
        minPrice: products.data[0]?.price,
      }),
    };
  } catch (error) {
    console.error(`Failed to resolve SEO tag tile ${tile.id}:`, error);
    return tile;
  }
};

const getCategoryTagTiles = cache(
  async (categoryId: string): Promise<SeoTagTile[]> => {
    try {
      const tiles = await seoApi.getTagTiles(categoryId);
      return await Promise.all(tiles.map(resolveTagTile));
    } catch (error) {
      console.error(`Failed to load SEO tags for category ${categoryId}:`, error);
      return [];
    }
  },
);

export async function generateMetadata({
  params,
}: CatalogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = CANONICAL_CATEGORY_REDIRECTS[slug] || slug;
  const [category, seo] = await Promise.all([
    getCategory(canonicalSlug),
    getCatalogSeo(canonicalSlug),
  ]);
  if (!category) notFound();

  return metadataFromSeo({
    title: seo?.title || "Prime Electronics",
    description: seo?.description || "Интернет-бутик премиальной электроники",
  }, {
    canonicalPath: `/catalog/${canonicalSlug}`,
    image: category.image,
  });
}

export default async function CatalogPage({
  params,
  searchParams,
}: CatalogPageProps) {
  const { slug } = await params;
  const canonicalSlug = CANONICAL_CATEGORY_REDIRECTS[slug];
  if (canonicalSlug) {
    permanentRedirect(`/catalog/${canonicalSlug}`);
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const hasBrandContext = Boolean(
    getSearchParamValue(resolvedSearchParams.brand) ||
    getSearchParamValue(resolvedSearchParams.from),
  );

  if (hasBrandContext && !shouldKeepBrandContextForCategorySlug(slug)) {
    permanentRedirect(`/catalog/${slug}`);
  }

  const brandContextSlug =
    getSearchParamValue(resolvedSearchParams.brand) ||
    getSearchParamValue(resolvedSearchParams.from);
  const seoPromise = getCatalogSeo(slug);
  const category = await getCategory(slug);
  if (!category) notFound();
  const catalogBrandScopeSlug =
    brandContextSlug || category.parent?.slug || category.slug;

  const [seo, catalogProducts, tagTiles, categoryBreadcrumbs] = await Promise.all([
    seoPromise,
    getCatalogProducts(category.id, catalogBrandScopeSlug),
    getCategoryTagTiles(category.id),
    getCategoryBreadcrumbs(category.id, {
      id: category.id,
      title: category.title,
      slug: category.slug,
    }),
  ]);
  const shouldSeedCatalogProducts = !brandContextSlug;
  const categoryUrl = absoluteSiteUrl(`/catalog/${slug}`);

  return (
    <main className="min-h-screen bg-white">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Главная", url: absoluteSiteUrl("/") },
          { name: "Каталог", url: absoluteSiteUrl("/categories") },
          ...categoryBreadcrumbs.map((breadcrumb) => ({
            name: breadcrumb.title,
            url: absoluteSiteUrl(`/catalog/${breadcrumb.slug}`),
          })),
        ])}
      />
      <JsonLd
        data={buildItemListStructuredData({
          name: seo?.h1 || category.title,
          url: categoryUrl,
          products: catalogProducts?.data || [],
        })}
      />
      <section className="w-full pt-[16px] md:pt-[30px] lg:pt-[50px] xl:pt-[60px] pb-[60px] md:pb-[80px] lg:pb-[100px] xl:pb-[120px]">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
          {/* Header will be rendered by CatalogClient after fetching category */}
          <CatalogClient
            categorySlug={slug}
            brandContextSlug={brandContextSlug}
            initialH1={seo?.h1}
            initialCategory={category}
            initialBreadcrumbCategories={categoryBreadcrumbs}
            tagTiles={tagTiles}
            initialProducts={
              shouldSeedCatalogProducts ? catalogProducts || undefined : undefined
            }
          />
          {category.description?.trim() && (
            <section
              className="mt-[48px] border-t border-[rgba(19,19,20,0.1)] pt-[32px] md:mt-[64px] md:pt-[40px]"
              aria-label="Описание категории"
            >
              <HtmlContent
                html={category.description}
                className="max-w-[1100px]"
              />
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
