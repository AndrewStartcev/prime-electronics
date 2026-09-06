import ProductPageClient from "./ProductPageClient";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { productApi, type ProductDetailResponse } from "@/shared/api";
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
  buildProductStructuredData,
} from "@/shared/lib/structuredData";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getProductByIdentifier(
  id: string,
): Promise<ProductDetailResponse | null> {
  try {
    if (!UUID_PATTERN.test(id)) {
      return await productApi.getBySlug(id);
    }

    try {
      return await productApi.getById(id);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 404) {
        return await productApi.getBySlug(id);
      }
      throw error;
    }
  } catch (error) {
    console.error(`Failed to load product ${id} for SEO:`, error);
    return null;
  }
}

async function resolveProductSeo(
  product: ProductDetailResponse,
): Promise<{ seo: ResolvedSeo; titleTemplate: string | null }> {
  const templates = await getSeoTemplates();
  const price = Number(product.price);
  const template = findSeoTemplate(templates, "PRODUCT");

  return {
    seo: resolveSeo({
      manualTitle: product.seoTitle,
      manualDescription: product.seoDescription,
      manualH1: product.seoH1,
      template,
      fallbackTitle: product.name,
      variables: {
        name: product.name,
        price: Number.isFinite(price) ? price : product.price,
      },
    }),
    titleTemplate: template?.titleTemplate || null,
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdentifier(id);
  if (!product) notFound();

  const { seo } = await resolveProductSeo(product);

  return metadataFromSeo({
    title: seo.title || "Prime Electronics",
    description: seo.description || "Интернет-бутик премиальной электроники",
  }, {
    canonicalPath: `/product/${product.slug.toLowerCase()}`,
    image: product.images[0]?.url,
    openGraphType: false,
  });
}

function ProductOpenGraphMeta({ price }: { price: string | number }) {
  const numericPrice = Number(price);
  const priceAmount = Number.isFinite(numericPrice)
    ? String(numericPrice)
    : String(price);

  return (
    <>
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={priceAmount} />
      <meta property="product:price:currency" content="RUB" />
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductByIdentifier(id);
  if (!product) notFound();

  const canonicalSlug = product.slug.toLowerCase();
  if (id !== canonicalSlug) {
    permanentRedirect(`/product/${canonicalSlug}`);
  }

  const { seo, titleTemplate } = await resolveProductSeo(product);
  const productUrl = absoluteSiteUrl(`/product/${canonicalSlug}`);
  const primaryCategory =
    product.categories.find((category) => category.isPrimary)?.category ||
    product.categories[0]?.category;
  const breadcrumbItems = [
    { name: "Главная", url: absoluteSiteUrl("/") },
    { name: "Каталог", url: absoluteSiteUrl("/categories") },
    ...(primaryCategory
      ? [
          {
            name: primaryCategory.title,
            url: absoluteSiteUrl(`/catalog/${primaryCategory.slug}`),
          },
        ]
      : []),
    { name: product.name, url: productUrl },
  ];

  return (
    <>
      <ProductOpenGraphMeta price={product.price} />
      <JsonLd data={buildProductStructuredData(product)} />
      <JsonLd data={buildBreadcrumbStructuredData(breadcrumbItems)} />
      <ProductPageClient
        id={canonicalSlug}
        initialProduct={product}
        initialSeoH1={seo.h1}
        productTitleTemplate={titleTemplate}
      />
    </>
  );
}
