"use client";

import { Breadcrumb } from "@/shared/ui";
import { BlogCard } from "@/shared/ui/BlogCard";
import { useBlogs } from "@/shared/hooks";
import { useState } from "react";

export default function BlogPageClient({ initialH1 }: { initialH1?: string }) {
  const [page] = useState(1);
  const { data, isLoading, error } = useBlogs({ page, limit: 100 });

  const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Блог" }];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        {/* Breadcrumb */}
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        {/* Page Title */}
        <h1 className="font-medium text-[32px] md:text-[40px] lg:text-[46px] xl:text-[56px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[60px]">
          {initialH1 || "Блог"}
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] xl:gap-[24px] min-[1440px]:gap-[26px]">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-[400px] rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Ошибка при загрузке статей блога
            </p>
          </div>
        )}

        {/* Blog Grid */}
        {data && data.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px] xl:gap-[24px] min-[1440px]:gap-[26px]">
            {data.data
              .filter((post) => post.isActive)
              .map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  imageUrl={post.imageUrl || ""}
                  link={`/blog/${post.slug}`}
                  variant="small"
                />
              ))}
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Статьи пока не добавлены</p>
          </div>
        )}
      </div>
    </main>
  );
}
