"use client";

import Link from "next/link";
import { BlogCard } from "@/shared/ui/BlogCard";
import { useBlogs } from "@/shared/hooks";

export const BlogSection = () => {
  const { data, isLoading, error } = useBlogs({ page: 1, limit: 3 });

  console.log("BlogSection data:", data);
  console.log("BlogSection error:", error);

  const posts =
    data?.data.slice(0, 3).map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "Читать далее...",
      imageUrl: post.imageUrl || "/images/placeholder.jpg",
      link: `/blog/${post.id}`,
      date: new Date(post.createdAt).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      readTime: post.readTime || "5 мин",
      tags: post.tags || [],
    })) || [];

  if (isLoading) {
    return (
      <section className="w-full py-[30px] md:py-[40px] lg:py-[50px] xl:py-[60px] bg-white">
        <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
          <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mb-[24px]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-[400px] rounded-[20px]"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return null;
  }

  return (
    <section className="w-full py-[30px] md:py-[40px] lg:py-[50px] xl:py-[60px] bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px]">
        {/* Section Header */}
        <Link
          href="/blog"
          className="flex items-center gap-[8px] md:gap-[10px] mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[51px] group w-fit"
        >
          <h2 className="font-medium text-[24px] md:text-[32px] lg:text-[28px] xl:text-[36px] 2xl:text-[46px] leading-[1.1] text-[#131314]">
            Блог
          </h2>
        </Link>
        <div className="hidden lg:flex gap-[16px] xl:gap-[20px] min-[1440px]:gap-[22px]">
          <div className="w-[49.4%] min-[1920px]:w-[830px] min-[1440px]:w-[500px] min-[1280px]:w-[400px] shrink-0">
            {posts[0] && <BlogCard {...posts[0]} variant="large" />}
          </div>
          <div className="flex-1 flex flex-row gap-[16px] xl:gap-[20px] min-[1440px]:gap-[22px]">
            <div className="flex-1 bg-white rounded-[20px] xl:rounded-[30px]  ">
              {posts[1] && <BlogCard {...posts[1]} variant="small" />}
            </div>
            <div className="flex-1">
              {posts[2] && <BlogCard {...posts[2]} variant="small" />}
            </div>
          </div>
        </div>

        {/* Tablet Layout (md) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-[16px]">
          {posts[0] && <BlogCard {...posts[0]} variant="small" />}
          {posts[1] && <BlogCard {...posts[1]} variant="small" />}
          {posts[2] && <BlogCard {...posts[2]} variant="small" />}
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-col gap-[16px]">
          {posts[0] && <BlogCard {...posts[0]} variant="small" />}
          {posts[1] && <BlogCard {...posts[1]} variant="small" />}
          {posts[2] && <BlogCard {...posts[2]} variant="small" />}
        </div>
      </div>
    </section>
  );
};
