"use client";

import { Breadcrumb } from "@/shared/ui";
import { BlogCard } from "@/shared/ui/BlogCard";
import { ShareButtons } from "@/shared/ui/ShareButtons";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import type { BlogProductBlock } from "@/shared/api/blogApi";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBlog, useBlogs } from "@/shared/hooks";

function ProductBlockSection({ block }: { block: BlogProductBlock }) {
  if (block.items.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="font-medium text-[24px] md:text-[32px] text-[#131314] mb-6">
        {block.title || "Рекомендуем"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {block.items.map(({ product }) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            title={product.name}
            description={product.description || undefined}
            price={Number(product.price)}
            images={(product.images || []).map((image) => image.url)}
            inStock={(product.productStock || []).some((stock) => stock.stockCount > 0)}
            isSale={Boolean(product.isOnSale)}
            attributes={(product.attributes || []).map((attribute) => ({ name: attribute.name, value: attribute.value }))}
            showAttributes={false}
          />
        ))}
      </div>
    </section>
  );
}

function ArticleContent({ html, blocks }: { html: string; blocks: BlogProductBlock[] }) {
  const nodes: React.ReactNode[] = [];
  const shortcodePattern = /(?:<p[^>]*>\s*)?\[\[product-block:(\d+)\]\](?:\s*<\/p>)?/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = shortcodePattern.exec(html)) !== null) {
    const before = html.slice(cursor, match.index);
    if (before) {
      nodes.push(
        <div
          key={`html-${key++}`}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: before }}
        />,
      );
    }

    const slot = Number(match[1]);
    const block = blocks.find((item) => item.sortOrder + 1 === slot);
    if (block) {
      nodes.push(<ProductBlockSection key={`block-${block.id}`} block={block} />);
    }
    cursor = shortcodePattern.lastIndex;
  }

  const after = html.slice(cursor);
  if (after) {
    nodes.push(
      <div
        key={`html-${key++}`}
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: after }}
      />,
    );
  }

  return <div className="blog-content mb-12">{nodes}</div>;
}

export default function BlogPostPageClient({ initialH1 }: { initialH1?: string }) {
  const params = useParams();
  const slug = params.id as string;
  const { data: post, isLoading, error } = useBlog(slug);
  const { data: blogsData } = useBlogs({ page: 1, limit: 10 });

  if (isLoading) return <main className="w-full bg-white"><div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] xl:px-[60px] 2xl:px-[120px] py-12">Загрузка...</div></main>;
  if (error || !post) return <main className="w-full bg-white"><div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] xl:px-[60px] 2xl:px-[120px] py-12 text-center"><p className="text-red-500 mb-4">Статья не найдена или ещё не опубликована</p><Link href="/blog" className="text-primary-orange">Вернуться к блогу</Link></div></main>;

  const author = post.authorProfile;
  const authorName = author?.name || post.author || "Редакция Prime";
  const authorInitial = authorName.slice(0, 1).toUpperCase();
  const relatedPosts = blogsData?.data.filter((item) => item.slug !== slug).slice(0, 2) || [];
  const publishedAt = post.publishedAt || post.createdAt;
  const productBlocks = post.productBlocks || [];
  const inlineSlots = new Set(
    Array.from(post.text.matchAll(/\[\[product-block:(\d+)\]\]/gi)).map((match) => Number(match[1])),
  );
  const trailingProductBlocks = productBlocks.filter(
    (block) => !inlineSlots.has(block.sortOrder + 1),
  );

  return (
    <main className="w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-[16px] md:px-[40px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[24px] md:py-[32px] lg:py-[40px] xl:py-[60px]">
        <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Блог", href: "/blog" }, { label: post.title.slice(0, 40) + "..." }]} className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]" />

        <article>
          <header className="mb-[24px] md:mb-[32px] lg:mb-[40px]">
            <div className="flex flex-wrap gap-2 mb-4">{post.tags?.map((tag) => <span key={tag} className="px-3 py-1.5 bg-[#f5f5f7] rounded-full text-sm">{tag}</span>)}</div>
            <h1 className="font-medium text-[24px] md:text-[32px] lg:text-[40px] xl:text-[48px] leading-[1.2] text-[#131314] mb-5">{initialH1 || post.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-[14px] text-[rgba(19,19,20,0.6)]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ef6f2e] overflow-hidden flex items-center justify-center shrink-0">{author?.avatarUrl ? <img src={author.avatarUrl} alt={authorName} className="w-full h-full object-cover" /> : <span className="text-white font-medium">{authorInitial}</span>}</div>
                <span className="font-medium text-[#131314]">{authorName}</span>
              </div>
              <span>{new Date(publishedAt).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Moscow" })}</span>
              <span>{post.readTime || "5 мин"} чтения</span>
            </div>
          </header>

          {post.imageUrl && <div className="relative w-full h-[220px] md:h-[360px] lg:h-[500px] rounded-[20px] overflow-hidden mb-10"><Image src={post.imageUrl} alt={post.title} fill className="object-cover" priority sizes="90vw" /></div>}

          <ArticleContent html={post.text} blocks={productBlocks} />

          {trailingProductBlocks.map((block) => (
            <ProductBlockSection key={block.id} block={block} />
          ))}

          <div className="border-t border-b border-[rgba(19,19,20,0.1)] py-6 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4"><span className="font-medium">Поделиться статьей:</span><ShareButtons url={typeof window !== "undefined" ? window.location.href : ""} title={post.title} /></div>

          <div className="bg-[#f5f5f7] rounded-[20px] p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-5">
            <div className="w-20 h-20 rounded-full bg-[#ef6f2e] overflow-hidden flex items-center justify-center shrink-0">{author?.avatarUrl ? <img src={author.avatarUrl} alt={authorName} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-medium">{authorInitial}</span>}</div>
            <div><h4 className="font-medium text-xl mb-2">{authorName}</h4><p className="text-[rgba(19,19,20,0.6)] leading-relaxed">{author?.bio || "Команда редакторов Prime Electronics делится новостями из мира технологий, обзорами гаджетов и полезными советами."}</p></div>
          </div>
        </article>

        {relatedPosts.length > 0 && <section className="mt-16"><h2 className="font-medium text-[28px] md:text-[36px] mb-8">Похожие статьи</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-5">{relatedPosts.map((item) => <BlogCard key={item.id} id={item.id} title={item.title} excerpt={item.excerpt || ""} imageUrl={item.imageUrl || ""} link={`/blog/${item.slug}`} variant="small" />)}</div></section>}
      </div>
    </main>
  );
}
