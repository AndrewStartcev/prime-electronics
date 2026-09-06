"use client";

import { Breadcrumb } from "@/shared/ui";
import Image from "next/image";
import Link from "next/link";
import { useBlogs, useBlog } from "@/shared/hooks";
import { BlogCard } from "@/shared/ui/BlogCard";
import { ShareButtons } from "@/shared/ui/ShareButtons";
import { useParams } from "next/navigation";

export default function BlogPostPageClient({
  initialH1,
}: {
  initialH1?: string;
}) {
  const params = useParams();
  const slug = params.id as string;

  const { data: post, isLoading, error } = useBlog(slug);
  const { data: blogsData } = useBlogs({ page: 1, limit: 10 });

  const relatedPosts =
    blogsData?.data
      .filter((p) => p.slug !== slug && p.isActive)
      .slice(0, 2)
      .map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt || "",
        imageUrl: p.imageUrl || "",
        link: `/blog/${p.slug}`,
        date: new Date(p.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        readTime: p.readTime || "5 мин",
        tags: p.tags || [],
      })) || [];

  if (isLoading) {
    return (
      <main className="w-full bg-white">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="w-full bg-white">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">
              Статья не найдена или произошла ошибка
            </p>
            <Link href="/blog" className="text-primary-orange hover:underline">
              Вернуться к блогу
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Блог", href: "/blog" },
    { label: post.title.slice(0, 40) + "..." },
  ];

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        <Breadcrumb
          items={breadcrumbItems}
          className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
        />

        <article>
          {/* Header */}
          <header className="mb-[24px] md:mb-[32px] lg:mb-[40px]">
            {/* Tags */}
            <div className="flex flex-wrap gap-[8px] md:gap-[10px] mb-[16px] md:mb-[20px]">
              {post.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-[12px] md:px-[16px] py-[6px] md:py-[8px] bg-[#f5f5f7] rounded-full text-[12px] md:text-[14px] font-medium text-[#131314]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-medium text-[24px] md:text-[32px] lg:text-[40px] xl:text-[48px] leading-[1.2] text-[#131314] mb-[16px] md:mb-[20px] lg:mb-[24px]">
              {initialH1 || post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-[16px] md:gap-[24px] text-[13px] md:text-[14px] lg:text-[16px] text-[rgba(19,19,20,0.6)]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full bg-[#ef6f2e] flex items-center justify-center">
                  <span className="text-white font-medium text-[14px] md:text-[16px]">
                    P
                  </span>
                </div>
                <span className="font-medium text-[#131314]">
                  {post.author || "Редакция Prime"}
                </span>
              </div>
              <div className="flex items-center gap-[6px]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="md:w-[18px] md:h-[18px]"
                >
                  <path
                    d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-[6px]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="md:w-[18px] md:h-[18px]"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 6V12L16 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{post.readTime || "5 мин"} чтения</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] 2xl:h-[600px] min-[1920px]:h-[700px] rounded-[16px] md:rounded-[20px] lg:rounded-[24px] xl:rounded-[30px] overflow-hidden mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1920px) 90vw, 1800px"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-[40px] md:mb-[60px] lg:mb-[80px]">
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.text }}
            />
          </div>

          {/* Share */}
          <div className="border-t border-b border-[rgba(19,19,20,0.1)] py-[20px] md:py-[24px] lg:py-[30px] mb-[40px] md:mb-[60px] lg:mb-[80px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[16px]">
              <span className="font-medium text-[14px] md:text-[16px] text-[#131314]">
                Поделиться статьей:
              </span>
              <ShareButtons
                url={`${typeof window !== "undefined" ? window.location.href : ""}`}
                title={post.title}
              />
            </div>
          </div>

          {/* Author Card */}
          <div className="bg-[#f5f5f7] rounded-[16px] md:rounded-[20px] p-[20px] md:p-[24px] lg:p-[30px] mb-[40px] md:mb-[60px] lg:mb-[80px]">
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-[20px]">
              <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-full bg-[#ef6f2e] flex items-center justify-center shrink-0">
                <span className="text-white font-medium text-[24px] md:text-[32px]">
                  P
                </span>
              </div>
              <div>
                <h4 className="font-medium text-[16px] md:text-[18px] lg:text-[20px] text-[#131314] mb-[8px]">
                  {post.author || "Редакция Prime"}
                </h4>
                <p className="font-normal text-[13px] md:text-[14px] lg:text-[16px] leading-[1.5] text-[rgba(19,19,20,0.6)]">
                  Команда редакторов Prime Electronics делится последними
                  новостями из мира технологий, обзорами гаджетов и полезными
                  советами.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-[40px] md:mt-[60px] lg:mt-[80px]">
            <h2 className="font-medium text-[24px] md:text-[32px] lg:text-[40px] leading-[1.1] text-[#131314] mb-[24px] md:mb-[32px] lg:mb-[40px]">
              Похожие статьи
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] md:gap-[20px] lg:gap-[24px]">
              {relatedPosts.map((post) => (
                <BlogCard key={post.id} {...post} variant="small" />
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="mt-[40px] md:mt-[60px] flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-[10px] px-[24px] md:px-[32px] py-[12px] md:py-[14px] bg-[#131314] text-white rounded-full font-medium text-[14px] md:text-[16px] hover:bg-[#ef6f2e] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="rotate-180"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Вернуться к блогу
          </Link>
        </div>
      </div>
    </main>
  );
}
