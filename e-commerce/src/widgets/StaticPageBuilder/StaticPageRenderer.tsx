"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/shared/ui";
import { PromotionCard, promotionsData } from "@/entities/promotion";
import { productApi, type ProductResponse } from "@/shared/api/productApi";
import type { StaticBuilderPage, StaticPageBlock } from "@/shared/api/seoApi";

const sectionTitle = "mb-6 text-[26px] font-medium leading-tight text-[#131314] md:text-[32px] lg:text-[38px]";
const bodyText = "text-[16px] leading-[1.6] text-[rgba(19,19,20,0.68)] md:text-[17px]";

function ProductGridBlock({ block }: { block: StaticPageBlock }) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const data = block.data || {};
  useEffect(() => {
    productApi
      .getAll({ limit: Math.min(24, Number(data.limit) || 8), sortBy: "popularity" })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]));
  }, [data.limit]);

  return (
    <section>
      {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="rounded-[20px] border border-[#ececec] bg-white p-4 transition hover:shadow-md">
            <div className="relative mb-4 aspect-square overflow-hidden rounded-[16px] bg-[#f5f5f7]">
              {product.images?.[0]?.url ? <Image src={product.images[0].url} alt={product.name} fill className="object-contain p-3" /> : null}
            </div>
            <div className="line-clamp-2 min-h-10 text-sm font-medium text-[#131314] md:text-base">{product.name}</div>
            <div className="mt-2 text-base font-semibold text-[#131314]">{Number(product.price).toLocaleString("ru-RU")} ₽</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContactFormBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const [sent, setSent] = useState(false);
  return (
    <section className="rounded-[24px] bg-[#f5f5f7] p-6 md:p-8 lg:p-10">
      {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
      {data.subtitle && <p className={`${bodyText} mb-6`}>{data.subtitle}</p>}
      {sent ? (
        <div className="rounded-2xl bg-white p-6 text-[#131314]">Спасибо! Сообщение подготовлено. Наш менеджер свяжется с вами.</div>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <input required placeholder="Имя" className="rounded-2xl border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#ef6f2e]" />
          <input required placeholder="Телефон" className="rounded-2xl border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#ef6f2e]" />
          <input type="email" placeholder="Email" className="rounded-2xl border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#ef6f2e] md:col-span-2" />
          <textarea required placeholder="Сообщение" rows={5} className="rounded-2xl border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#ef6f2e] md:col-span-2" />
          <button type="submit" className="rounded-full bg-[#ef6f2e] px-7 py-3 font-medium text-white md:w-fit">Отправить</button>
        </form>
      )}
    </section>
  );
}

function renderBlock(block: StaticPageBlock, index: number) {
  const data = block.data || {};
  switch (block.type) {
    case "hero":
      return (
        <section key={index} className="py-4 md:py-8">
          <h1 className="max-w-[1100px] text-[36px] font-medium leading-[1.05] text-[#131314] md:text-[48px] lg:text-[60px]">{data.title}</h1>
          {data.subtitle && <p className="mt-5 max-w-[900px] text-[17px] leading-[1.55] text-[rgba(19,19,20,0.62)] md:text-[19px]">{data.subtitle}</p>}
        </section>
      );
    case "richText":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className={`${bodyText} prose max-w-none`} dangerouslySetInnerHTML={{ __html: data.html || "" }} /></section>;
    case "imageText": {
      const imageLeft = data.imageSide === "left";
      return (
        <section key={index} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className={imageLeft ? "lg:order-2" : ""}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className={`${bodyText} prose max-w-none`} dangerouslySetInnerHTML={{ __html: data.html || "" }} /></div>
          <div className={`relative min-h-[300px] overflow-hidden rounded-[28px] bg-[#f5f5f7] ${imageLeft ? "lg:order-1" : ""}`}>{data.image && <Image src={data.image} alt={data.imageAlt || data.title || ""} fill className="object-contain p-5" />}</div>
        </section>
      );
    }
    case "cards":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className={`grid gap-4 ${Number(data.columns) === 2 ? "md:grid-cols-2" : Number(data.columns) === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>{(data.items || []).map((item: any, itemIndex: number) => { const content = <><h3 className="text-lg font-medium text-[#131314]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[rgba(19,19,20,0.62)]">{item.text}</p></>; return item.href ? <Link key={itemIndex} href={item.href} className="rounded-[20px] bg-[#f5f5f7] p-6 transition hover:shadow-sm">{content}</Link> : <div key={itemIndex} className="rounded-[20px] bg-[#f5f5f7] p-6">{content}</div>; })}</div></section>;
    case "stats":
      return <section key={index}>{data.title && <h2 className={`${sectionTitle} text-center`}>{data.title}</h2>}<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{(data.items || []).map((item: any, itemIndex: number) => <div key={itemIndex} className="rounded-[22px] bg-[#131314] p-6 text-center text-white"><div className="text-[30px] font-semibold md:text-[38px]">{item.value}</div><div className="mt-1 text-sm text-white/65">{item.label}</div></div>)}</div></section>;
    case "steps":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{(data.items || []).map((item: any, itemIndex: number) => <div key={itemIndex} className="rounded-[20px] border border-[#e6e6e6] p-6"><div className="mb-4 text-sm font-semibold text-[#ef6f2e]">{String(itemIndex + 1).padStart(2, "0")}</div><h3 className="font-medium text-[#131314]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[rgba(19,19,20,0.62)]">{item.text}</p></div>)}</div></section>;
    case "table":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className="overflow-x-auto rounded-[20px] border border-[#e5e5e5]"><table className="w-full border-collapse text-left"><thead className="bg-[#f5f5f7]"><tr>{(data.columns || []).map((column: string, i: number) => <th key={i} className="px-5 py-4 text-sm font-medium">{column}</th>)}</tr></thead><tbody>{(data.rows || []).map((row: string[], i: number) => <tr key={i} className="border-t border-[#ececec]">{row.map((cell, j) => <td key={j} className="px-5 py-4 text-sm text-[rgba(19,19,20,0.72)]">{cell}</td>)}</tr>)}</tbody></table></div></section>;
    case "info":
      return <section key={index} className={`rounded-[22px] p-6 md:p-8 ${data.tone === "orange" ? "bg-[#fff1e9]" : "bg-[#f5f5f7]"}`}>{data.title && <h2 className="mb-3 text-xl font-medium text-[#131314]">{data.title}</h2>}<div className={bodyText} dangerouslySetInnerHTML={{ __html: data.html || "" }} /></section>;
    case "cta":
      return <section key={index} className="rounded-[28px] bg-gradient-to-r from-[#ef6f2e] to-[#131314] p-8 text-center text-white md:p-12"><h2 className="text-[28px] font-medium md:text-[36px]">{data.title}</h2>{data.text && <p className="mx-auto mt-3 max-w-[760px] text-white/75">{data.text}</p>}{data.buttonText && data.buttonHref && <Link href={data.buttonHref} className="mt-6 inline-block rounded-full bg-white px-7 py-3 font-medium text-[#131314]">{data.buttonText}</Link>}</section>;
    case "map":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<iframe title={data.title || "Карта"} src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(data.query || "PRIME Electronics Москва")}`} className="h-[420px] w-full rounded-[24px] border-0" loading="lazy" /></section>;
    case "contactForm":
      return <ContactFormBlock key={index} block={block} />;
    case "promotionGrid":
      return <section key={index}>{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{promotionsData.slice(0, Math.min(12, Number(data.limit) || 6)).map((promotion) => <PromotionCard key={promotion.id} {...promotion} />)}</div></section>;
    case "productGrid":
      return <ProductGridBlock key={index} block={block} />;
    default:
      return null;
  }
}

export function StaticPageRenderer({ page }: { page: StaticBuilderPage }) {
  const label = page.name || page.title || page.path;
  return (
    <main className="w-full bg-white">
      <div className="mx-auto max-w-[1920px] px-[16px] py-[24px] md:px-[40px] md:py-[32px] lg:px-[40px] lg:py-[40px] xl:px-[60px] xl:py-[60px] 2xl:px-[120px]">
        <Breadcrumb items={[{ label: "Главная", href: "/" }, { label }]} className="mb-6 md:mb-8" />
        <div className="flex flex-col gap-12 md:gap-16 lg:gap-20">
          {page.blocks.map(renderBlock)}
        </div>
      </div>
    </main>
  );
}
