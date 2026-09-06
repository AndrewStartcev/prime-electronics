import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSeoCollectionProductFilters,
  productApi,
  seoApi,
} from "@/shared/api";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { HtmlContent } from "@/shared/ui";
import { htmlToPlainText } from "@/shared/lib/html";
import {
  absoluteSiteUrl,
  metadataFromSeo,
} from "@/shared/lib/seoMetadata";
import { getCategoryBreadcrumbs } from "@/shared/lib/categoryBreadcrumbs";
import {
  JsonLd,
  buildBreadcrumbStructuredData,
} from "@/shared/lib/structuredData";
import { CollectionCatalogClient } from "./CollectionCatalogClient";

const PAGE_SIZE = 24;

export const dynamic = "force-dynamic";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

async function getCollection(slug: string) {
  try {
    return await seoApi.getCollectionBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};

  const title = collection.seoTitle || collection.name;
  const description =
    collection.seoDescription ||
    htmlToPlainText(collection.description || "") ||
    "Подборка товаров Prime Electronics";

  return metadataFromSeo(
    { title, description },
    { canonicalPath: `/collections/${collection.slug}` },
  );
}

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const [products, categoryBreadcrumbs] = await Promise.all([
    productApi.getAll({
      ...getSeoCollectionProductFilters(collection),
      page: 1,
      limit: PAGE_SIZE,
    }),
    collection.category
      ? getCategoryBreadcrumbs(collection.category.id, collection.category)
      : Promise.resolve([]),
  ]);
  const h1 = collection.seoH1 || collection.name;
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/categories" },
    ...categoryBreadcrumbs.map((category) => ({
      label: category.title,
      href: `/catalog/${category.slug}`,
    })),
    { label: h1 },
  ];

  return (
    <main className="min-h-screen bg-white py-[24px] md:py-[40px] lg:py-[56px]">
      <div className="mx-auto max-w-[1920px] px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        <JsonLd
          data={buildBreadcrumbStructuredData([
            { name: "Главная", url: absoluteSiteUrl("/") },
            { name: "Каталог", url: absoluteSiteUrl("/categories") },
            ...categoryBreadcrumbs.map((category) => ({
              name: category.title,
              url: absoluteSiteUrl(`/catalog/${category.slug}`),
            })),
            {
              name: h1,
              url: absoluteSiteUrl(`/collections/${collection.slug}`),
            },
          ])}
        />
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px]"
        />
        <div className="mb-[28px] md:mb-[36px]">
          <h1 className="text-[28px] font-medium leading-[1.15] text-[#131314] md:text-[40px] lg:text-[48px]">
            {h1}
          </h1>
        </div>

        <CollectionCatalogClient collection={collection} initialProducts={products} />
        {collection.description?.trim() && (
          <section
            className="mt-[48px] border-t border-[rgba(19,19,20,0.1)] pt-[32px] md:mt-[64px] md:pt-[40px]"
            aria-label="Описание подборки"
          >
            <HtmlContent
              html={collection.description}
              className="max-w-[1100px]"
            />
          </section>
        )}
      </div>
    </main>
  );
}
