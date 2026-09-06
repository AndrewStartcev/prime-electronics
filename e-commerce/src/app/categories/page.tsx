import type { Metadata } from "next";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { CategoriesGrid } from "@/widgets/CategoriesGrid";
import { generateStaticPageMetadata } from "@/shared/lib/seoMetadata";
import { categoryApi, type CategoryTreeItem } from "@/shared/api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/categories", "Категории товаров");
}

async function getInitialCategories(): Promise<CategoryTreeItem[] | undefined> {
  try {
    return await categoryApi.getMain();
  } catch (error) {
    console.error("Failed to load initial categories:", error);
    return undefined;
  }
}

export default async function CategoriesPage() {
  const initialCategories = await getInitialCategories();

  return (
    <main className="min-h-screen bg-white">
      {/* Page Content */}
      <section className="w-full pt-[16px] md:pt-[30px] lg:pt-[50px] xl:pt-[60px] pb-[60px] md:pb-[80px] lg:pb-[100px] xl:pb-[120px]">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col gap-[10px] md:gap-[14px] lg:gap-[20px] xl:gap-[24px] mb-[10px] md:mb-[30px] lg:mb-[45px] xl:mb-[60px]">
            <Breadcrumb
              items={[
                { label: "Главная", href: "/" },
                { label: "Категории товаров" },
              ]}
            />
            <h1 className="font-medium text-[26px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
              Категории товаров
            </h1>
          </div>
          <CategoriesGrid
            cardPresentation="carousel"
            initialCategories={initialCategories}
          />
        </div>
      </section>
    </main>
  );
}
