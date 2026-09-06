import {
  Hero,
  ProductGrid,
  PromotionsSection,
  AboutSection,
  BlogSection,
} from "@/widgets";
import type { Metadata } from "next";
import { CategoriesGrid } from "@/widgets/CategoriesGrid";
import { generateStaticPageMetadata } from "@/shared/lib/seoMetadata";
import { categoryApi, productApi, type CategoryTreeItem } from "@/shared/api";
import type { Product } from "@/entities/product";
import { JsonLd, buildHomeStructuredData } from "@/shared/lib/structuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/", "Prime Electronics", "HOME");
}

async function getHomeInitialData(): Promise<{
  categories?: CategoryTreeItem[];
  products?: Product[];
}> {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    categoryApi.getMain(),
    productApi.getAll({
      sortBy: "popularity",
      limit: 6,
      page: 1,
    }),
  ]);

  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : undefined;
  const products =
    productsResult.status === "fulfilled"
      ? productsResult.value.data.map((product) => ({
          id: product.id,
          slug: product.slug,
          title: product.name,
          description: product.description?.trim() || undefined,
          price: parseFloat(product.price),
          images:
            product.images && product.images.length > 0
              ? product.images.map((image) => image.url)
              : ["/images/iphone17.png"],
          inStock: product.totalStock > 0,
          isNew:
            new Date(product.createdAt) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isSale: product.isOnSale,
          isFavorite: false,
          attributes: product.attributes?.map((attribute) => ({
            name: attribute.name,
            value: attribute.value,
            showInCard: attribute.showInCard,
          })),
        }))
      : undefined;

  return { categories, products };
}

export default async function Home() {
  const { categories, products } = await getHomeInitialData();

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={buildHomeStructuredData()} />
      <Hero />
      <section className="w-full py-[24px] md:py-[34px] lg:py-[44px]">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
          <div className="mb-[16px] md:mb-[24px] flex items-end justify-between gap-[16px]">
            <h2 className="font-medium text-[26px] md:text-[34px] lg:text-[40px] leading-[1.1] text-[#131314]">
              Категории товаров
            </h2>
          </div>
          <CategoriesGrid
            limit={4}
            displayMode="carousel"
            showAllHref="/categories"
            showAllLabel="Показать все"
            initialCategories={categories}
          />
        </div>
      </section>
      <ProductGrid
        title="Популярные товары"
        showAllLink="/catalog"
        products={products}
      />
      <PromotionsSection />
      <AboutSection />
      <BlogSection />
    </div>
  );
}
