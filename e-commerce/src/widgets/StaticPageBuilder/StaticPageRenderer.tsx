"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Battery,
  CheckCircle2,
  Eye,
  Laptop,
  Search,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";
import { Breadcrumb } from "@/shared/ui";
import { PromotionCard, promotionsData } from "@/entities/promotion";
import { productApi, type ProductResponse } from "@/shared/api/productApi";
import type { StaticBuilderPage, StaticPageBlock } from "@/shared/api/seoApi";
import { ContactForm } from "@/app/contacts/ContactForm";

const sectionTitle =
  "mb-[24px] text-[26px] font-medium leading-[1.1] text-[#131314] md:mb-[30px] md:text-[30px] lg:mb-[36px] lg:text-[36px] xl:mb-[42px] xl:text-[42px]";
const bodyText =
  "text-[15px] leading-[1.6] text-[rgba(19,19,20,0.64)] md:text-[16px] lg:text-[17px]";

const warrantyIcons: Record<string, any> = {
  wrench: Wrench,
  laptop: Laptop,
  search: Search,
  battery: Battery,
  zap: Zap,
  check: CheckCircle2,
  eye: Eye,
  shield: Shield,
};

function ProductGridBlock({ block }: { block: StaticPageBlock }) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const data = block.data || {};

  useEffect(() => {
    productApi
      .getAll({
        limit: Math.min(24, Number(data.limit) || 8),
        sortBy: "popularity",
      })
      .then((response) => setProducts(response.data))
      .catch(() => setProducts([]));
  }, [data.limit]);

  return (
    <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
      {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="rounded-[20px] border border-[#ececec] bg-white p-4 transition hover:shadow-md"
          >
            <div className="relative mb-4 aspect-square overflow-hidden rounded-[16px] bg-[#f5f5f7]">
              {product.images?.[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className="object-contain p-3"
                />
              ) : null}
            </div>
            <div className="line-clamp-2 min-h-10 text-sm font-medium text-[#131314] md:text-base">
              {product.name}
            </div>
            <div className="mt-2 text-base font-semibold text-[#131314]">
              {Number(product.price).toLocaleString("ru-RU")} ₽
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PageIntro({ data, variant }: { data: any; variant?: string }) {
  if (variant === "privacy") {
    return (
      <section className="mx-auto mb-[60px] max-w-[1100px] md:mb-[80px] lg:mb-[100px]">
        <div className="mb-[24px] flex items-center gap-[20px] md:mb-[30px] md:gap-[30px]">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#ef6f2e]" />
          <div className="h-[8px] w-[8px] rounded-full bg-[#ef6f2e] md:h-[10px] md:w-[10px]" />
        </div>
        <h1 className="mb-[16px] text-[32px] font-medium leading-[1.1] text-[#131314] md:mb-[20px] md:text-[38px] lg:text-[44px] xl:text-[50px] 2xl:text-[56px]">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="text-[16px] font-normal leading-[1.5] text-[rgba(19,19,20,0.5)] md:text-[18px] lg:text-[20px]">
            {data.subtitle}
          </p>
        )}
      </section>
    );
  }

  if (variant === "cookies") {
    return (
      <section className="mb-[32px] max-w-[980px] lg:mb-[44px]">
        <h1 className="mb-[16px] text-[32px] font-medium leading-[1.1] text-[#131314] md:text-[40px] lg:text-[46px] xl:text-[56px]">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="text-[16px] leading-[1.55] text-[rgba(19,19,20,0.62)] md:text-[18px]">
            {data.subtitle}
          </p>
        )}
      </section>
    );
  }

  if (variant === "warranty") {
    return (
      <section className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
        <h1 className="mb-[16px] max-w-[800px] text-[28px] font-semibold leading-[1.1] text-[#131314] md:mb-[20px] md:text-[40px] lg:mb-[24px] lg:text-[48px] xl:mb-[30px] xl:text-[56px]">
          {data.title}
        </h1>
        {data.subtitle && (
          <p className="max-w-[720px] text-[15px] font-normal leading-[1.6] text-[rgba(19,19,20,0.55)] md:text-[17px] lg:text-[18px]">
            {data.subtitle}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px]">
      <h1 className="mb-[16px] text-[32px] font-medium leading-[1.1] text-[#131314] md:mb-[20px] md:text-[40px] lg:mb-[24px] lg:text-[46px] xl:mb-[30px] xl:text-[56px]">
        {data.title}
      </h1>
      {data.subtitle && (
        <p className="max-w-[900px] text-[16px] font-normal leading-[1.5] text-[rgba(19,19,20,0.6)] md:text-[17px] lg:text-[18px]">
          {data.subtitle}
        </p>
      )}
    </section>
  );
}

function ImageTextBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const variant = data.variant;

  if (variant === "aboutLead") {
    return (
      <section className="mb-[40px] flex flex-col items-start gap-[30px] md:mb-[50px] md:gap-[40px] lg:mb-[60px] lg:gap-[48px] xl:mb-[80px] xl:grid xl:grid-cols-2 xl:items-center xl:gap-[80px]">
        <div className="flex flex-col gap-[20px] md:gap-[24px] lg:gap-[30px]">
          <h2 className="bg-gradient-to-r from-[#131314] to-[#ef6f2e] bg-clip-text text-[24px] font-medium leading-[1.1] text-transparent md:text-[28px] lg:text-[34px] xl:text-[40px]">
            {data.title}
          </h2>
          <div
            className="flex flex-col gap-[16px] text-[16px] font-normal leading-[1.5] text-[rgba(19,19,20,0.6)] md:gap-[18px] md:text-[17px] lg:gap-[20px] lg:text-[18px]"
            dangerouslySetInnerHTML={{ __html: data.html || "" }}
          />
        </div>
        <div className="mx-auto w-full max-w-[980px] xl:mx-0 xl:max-w-none">
          {data.image && (
            <Image
              src={data.image}
              alt={data.imageAlt || data.title || ""}
              width={3892}
              height={1940}
              className="hidden h-auto w-full rounded-[20px] xl:block"
            />
          )}
          {(data.mobileImage || data.image) && (
            <Image
              src={data.mobileImage || data.image}
              alt={data.imageAlt || data.title || ""}
              width={1372}
              height={920}
              className="h-auto w-full rounded-[20px] xl:hidden"
            />
          )}
        </div>
      </section>
    );
  }

  if (variant === "promotionFeature") {
    const imageRight = data.imageSide !== "left";
    const fullCard = Boolean(data.fullCard);
    return (
      <section
        id={data.anchor || undefined}
        className={`mb-[40px] flex flex-col items-center gap-[30px] md:mb-[50px] md:gap-[40px] lg:mb-[60px] lg:gap-[50px] xl:mb-[70px] xl:gap-[60px] ${
          imageRight ? "lg:flex-row" : "lg:flex-row-reverse"
        }`}
      >
        <div className="flex flex-1 flex-col gap-[20px] md:gap-[24px] lg:gap-[28px]">
          <h2 className="text-[26px] font-medium leading-[1.1] text-[#131314] md:text-[30px] lg:text-[36px] xl:text-[42px]">
            {data.title}
          </h2>
          <div
            className="text-[16px] font-normal leading-[1.5] text-[rgba(19,19,20,0.6)] md:text-[17px] lg:text-[18px]"
            dangerouslySetInnerHTML={{ __html: data.html || "" }}
          />
          <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[14px] lg:gap-[16px]">
            {(data.items || []).map((item: any, index: number) => (
              <div key={index} className="flex items-start gap-[12px]">
                <div className="mt-[2px] h-[20px] w-[20px] flex-shrink-0 md:h-[22px] md:w-[22px] lg:h-[24px] lg:w-[24px]">
                  <Image
                    src={item.icon || "/icons/check.svg"}
                    alt="Check"
                    width={24}
                    height={24}
                    className="h-full w-full"
                  />
                </div>
                <p className="text-[15px] font-normal leading-[1.4] text-[#131314] md:text-[16px] lg:text-[17px]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex-1">
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-[20px] md:rounded-[24px] lg:rounded-[30px] ${
              fullCard
                ? "mx-auto aspect-[3/4] max-w-[560px] bg-[#050505]"
                : "aspect-[4/3] bg-[#f5f5f7] lg:aspect-[3/2]"
            }`}
          >
            {!fullCard && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,111,46,0.12),transparent_46%)]" />
            )}
            {data.image && (
              <Image
                src={data.image}
                alt={data.imageAlt || data.title || ""}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`relative ${
                  fullCard
                    ? "object-fill"
                    : "object-contain p-[26px] md:p-[34px] lg:p-[42px]"
                } ${data.objectBottom ? "object-bottom" : "object-center"}`}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "tradeInBanner") {
    return (
      <section className="mb-[50px] rounded-[20px] bg-gradient-to-r from-[#131314] to-[#ef6f2e] p-[30px] md:mb-[60px] md:rounded-[24px] md:p-[40px] lg:mb-[70px] lg:rounded-[30px] lg:p-[50px] xl:mb-[80px] xl:p-[60px]">
        <div className="flex flex-col items-center gap-[30px] lg:flex-row lg:gap-[50px] xl:gap-[60px]">
          <div className="flex-1 text-white">
            <h2 className="mb-[16px] text-[26px] font-medium leading-[1.1] md:mb-[20px] md:text-[30px] lg:mb-[24px] lg:text-[36px] xl:text-[42px]">
              {data.title}
            </h2>
            <div
              className="mb-[24px] text-[16px] font-normal leading-[1.5] text-[rgba(255,255,255,0.8)] md:mb-[28px] md:text-[17px] lg:mb-[32px] lg:text-[18px]"
              dangerouslySetInnerHTML={{ __html: data.html || "" }}
            />
            {data.buttonText && data.buttonHref && (
              <a
                href={data.buttonHref}
                className="inline-block rounded-[60px] bg-white px-[32px] py-[14px] text-[16px] font-medium text-[#131314] transition-opacity hover:opacity-90 md:px-[40px] md:py-[16px] md:text-[17px] lg:px-[48px] lg:py-[18px] lg:text-[18px]"
              >
                {data.buttonText}
              </a>
            )}
          </div>
          <div className="w-full lg:w-[400px] xl:w-[500px]">
            <div className="overflow-hidden rounded-[20px]">
              {data.image && (
                <Image
                  src={data.image}
                  alt={data.imageAlt || data.title || ""}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const imageLeft = data.imageSide === "left";
  return (
    <section className="mb-[50px] grid items-center gap-8 md:mb-[60px] lg:mb-[70px] lg:grid-cols-2 lg:gap-12 xl:mb-[80px]">
      <div className={imageLeft ? "lg:order-2" : ""}>
        {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
        <div
          className={`${bodyText} prose max-w-none`}
          dangerouslySetInnerHTML={{ __html: data.html || "" }}
        />
      </div>
      <div
        className={`relative min-h-[300px] overflow-hidden rounded-[28px] bg-[#f5f5f7] ${
          imageLeft ? "lg:order-1" : ""
        }`}
      >
        {data.image && (
          <Image
            src={data.image}
            alt={data.imageAlt || data.title || ""}
            fill
            className="object-contain p-5"
          />
        )}
      </div>
    </section>
  );
}

function CardsBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const variant = data.variant;
  const items = data.items || [];

  if (variant === "deliveryOptions") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={sectionTitle}>{data.title}</h2>
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 md:gap-[20px] lg:gap-[24px] xl:gap-[30px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex flex-col gap-[16px] rounded-[20px] bg-[#f5f5f7] p-[20px] md:gap-[18px] md:p-[24px] lg:gap-[20px] lg:p-[28px] xl:p-[32px]">
              <div className="h-[28px] w-[28px] md:h-[32px] md:w-[32px] lg:h-[36px] lg:w-[36px]">
                <Image src={item.icon || "/icons/check.svg"} alt={item.title || ""} width={36} height={36} className="h-full w-full" />
              </div>
              <h3 className="text-[18px] font-medium leading-[1.2] text-[#131314] md:text-[19px] lg:text-[20px] xl:text-[22px]">{item.title}</h3>
              <p className="text-[15px] font-normal leading-[1.4] text-[rgba(19,19,20,0.6)] md:text-[16px]">{item.text}</p>
              <div className="flex flex-col gap-[8px] border-t border-[rgba(19,19,20,0.1)] pt-[8px]">
                <div className="flex items-center justify-between"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Стоимость:</span><span className="text-[15px] font-medium text-[#131314] md:text-[16px]">{item.price}</span></div>
                <div className="flex items-center justify-between"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Срок:</span><span className="text-[15px] font-medium text-[#131314] md:text-[16px]">{item.time}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "iconFeatures") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={`${sectionTitle} ${data.centerTitle ? "text-center" : ""}`}>{data.title}</h2>
        {data.subtitle && <p className="mx-auto mb-[28px] max-w-[480px] text-center text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)] md:mb-[36px] md:text-[16px] lg:mb-[48px]">{data.subtitle}</p>}
        <div className={`grid grid-cols-1 gap-[16px] md:grid-cols-2 md:gap-[20px] lg:gap-[24px] xl:gap-[30px] ${Number(data.columns) === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {items.map((item: any, index: number) => (
            <div key={index} className="flex flex-col gap-[16px] rounded-[20px] bg-[#f5f5f7] p-[20px] md:gap-[18px] md:p-[24px] lg:gap-[20px] lg:p-[28px] xl:p-[32px]">
              {item.icon && <div className="h-[28px] w-[28px] md:h-[32px] md:w-[32px] lg:h-[36px] lg:w-[36px]"><Image src={item.icon} alt={item.title || ""} width={36} height={36} className="h-full w-full" /></div>}
              <h3 className="text-[18px] font-medium leading-[1.2] text-[#131314] md:text-[19px] lg:text-[20px] xl:text-[22px]">{item.title}</h3>
              <p className="text-[15px] font-normal leading-[1.4] text-[rgba(19,19,20,0.6)] md:text-[16px] xl:text-[17px]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "warrantyIcons") {
    return (
      <section className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
        <h2 className="mb-[12px] text-center text-[24px] font-semibold leading-[1.15] text-[#131314] md:mb-[16px] md:text-[30px] lg:text-[36px] xl:text-[42px]">{data.title}</h2>
        {data.subtitle && <p className="mx-auto mb-[28px] max-w-[480px] text-center text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)] md:mb-[36px] md:text-[16px] lg:mb-[48px]">{data.subtitle}</p>}
        <div className={`grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:gap-[16px] lg:gap-[20px] ${data.benefits ? "lg:grid-cols-3 xl:gap-[24px]" : ""}`}>
          {items.map((item: any, index: number) => {
            const Icon = warrantyIcons[item.icon] || Shield;
            return (
              <div key={index} className="group flex flex-col gap-[14px] rounded-[20px] border border-transparent bg-[#f8f8fa] p-[20px] transition-all duration-200 hover:border-[#e8e8ea] hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:gap-[16px] md:rounded-[24px] md:p-[24px] lg:p-[28px]">
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-[#ef6f2e]/10 md:h-[48px] md:w-[48px]">
                  <Icon className="h-[20px] w-[20px] text-[#ef6f2e] md:h-[22px] md:w-[22px]" />
                </div>
                <div className="flex flex-col gap-[6px] md:gap-[8px]">
                  <h3 className="text-[16px] font-semibold leading-[1.25] text-[#131314] md:text-[18px] lg:text-[19px]">{item.title}</h3>
                  <p className="text-[13px] font-normal leading-[1.5] text-[rgba(19,19,20,0.5)] md:text-[14px] lg:text-[15px]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (variant === "contactMethods") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={sectionTitle}>{data.title}</h2>
        <div className="grid grid-cols-1 gap-[16px] min-[420px]:grid-cols-2 md:gap-[20px] lg:grid-cols-3 lg:gap-[24px] xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item: any, index: number) => (
            <a key={index} href={item.href} className="flex min-w-0 flex-col gap-[16px] rounded-[20px] bg-[#f5f5f7] p-[24px] transition-colors hover:bg-[#ebebed] md:p-[28px] lg:p-[32px]">
              <div className="text-[36px] md:text-[40px] lg:text-[44px]">{item.icon}</div>
              <h3 className="min-w-0 text-[18px] font-medium leading-[1.2] text-[#131314] md:text-[19px] lg:text-[20px]">{item.title}</h3>
              <p className="min-w-0 max-w-full text-[15px] font-normal leading-[1.4] text-[#ef6f2e] [overflow-wrap:anywhere] md:text-[16px]">{item.text}</p>
            </a>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "storeInfo") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={sectionTitle}>{data.title}</h2>
        <div className="grid grid-cols-1 gap-[16px] md:gap-[20px] lg:gap-[24px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="grid grid-cols-1 gap-[18px] rounded-[20px] bg-[#f5f5f7] p-[24px] md:p-[28px] lg:grid-cols-3 lg:gap-[28px] lg:p-[32px]">
              <div className="flex flex-col justify-between gap-[12px]"><h3 className="text-[22px] font-medium leading-[1.2] text-[#131314] md:text-[24px] lg:text-[26px]">{item.title}</h3><span className="text-[14px] leading-[1.4] text-[rgba(19,19,20,0.5)]">{item.kind}</span></div>
              <div className="flex flex-col gap-[12px] md:gap-[14px]"><div className="flex flex-col gap-[4px]"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Адрес:</span><span className="text-[15px] text-[#131314] md:text-[16px]">{item.address}</span></div>{item.metro && <div className="flex flex-col gap-[4px]"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Метро:</span><span className="text-[15px] text-[#131314] md:text-[16px]">{item.metro}</span></div>}</div>
              <div className="flex flex-col gap-[12px] md:gap-[14px]"><div className="flex flex-col gap-[4px]"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Телефон:</span><a href={item.phoneHref} className="text-[15px] text-[#ef6f2e] transition-opacity hover:opacity-80 md:text-[16px]">{item.phone}</a></div><div className="flex flex-col gap-[4px]"><span className="text-[14px] text-[rgba(19,19,20,0.6)] md:text-[15px]">Режим работы:</span><span className="block max-w-full truncate text-[15px] text-[#131314] md:text-[16px]" title={item.workHours}>{item.workHours}</span></div></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "brandLogos") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={`${sectionTitle} text-center`}>{data.title}</h2>
        <div className="flex flex-wrap justify-center gap-[16px] md:gap-[20px] lg:gap-[24px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex aspect-square w-full max-w-[220px] items-center justify-center rounded-[20px] border border-[#f0f0f0] bg-white p-[24px] shadow-[0_10px_30px_rgba(19,19,20,0.06)] md:p-[28px] lg:p-[32px]">
              <div className="flex flex-col items-center gap-[8px] text-center">
                <Image src={item.image} alt={item.title} width={220} height={140} className="h-[86px] w-full max-w-[150px] object-contain md:h-[96px] lg:h-[106px]" />
                <p className="text-[16px] font-medium text-[#131314] md:text-[17px] lg:text-[18px]">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "faq") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={`${sectionTitle} text-center`}>{data.title}</h2>
        <div className="mx-auto flex max-w-[1000px] flex-col gap-[16px] md:gap-[20px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-[20px] bg-[#f5f5f7] p-[20px] md:p-[24px] lg:p-[28px] xl:p-[32px]">
              <h3 className="mb-[12px] text-[18px] font-medium leading-[1.2] text-[#131314] md:mb-[14px] md:text-[19px] lg:mb-[16px] lg:text-[20px]">{item.title}</h3>
              <p className="text-[15px] font-normal leading-[1.4] text-[rgba(19,19,20,0.6)] md:text-[16px] lg:text-[17px]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "requisites") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={sectionTitle}>{data.title}</h2>
        <div className="rounded-[20px] bg-[#f5f5f7] p-[24px] md:rounded-[24px] md:p-[32px] lg:p-[40px]">
          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-3 md:gap-[20px]">
            {items.map((item: any, index: number) => (
              <div key={index} className="flex flex-col gap-[8px]"><span className="text-[15px] font-medium text-[rgba(19,19,20,0.6)] md:text-[16px]">{item.title}</span><span className="text-[16px] text-[#131314] md:text-[17px] lg:text-[18px]">{item.text}</span></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "paymentMethods") {
    return (
      <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
        <h2 className={sectionTitle}>{data.title}</h2>
        <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 md:gap-[20px] lg:gap-[24px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="rounded-[20px] bg-[#f5f5f7] p-[24px] md:p-[28px] lg:p-[32px]"><h3 className="mb-[12px] text-[18px] font-medium leading-[1.2] text-[#131314] md:mb-[14px] md:text-[19px] lg:mb-[16px] lg:text-[20px]">{item.title}</h3><p className="mb-[16px] text-[15px] leading-[1.4] text-[rgba(19,19,20,0.6)] md:text-[16px]">{item.text}</p><div className="text-[24px]">{item.icon}</div></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
      {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
      <div className={`grid gap-4 ${Number(data.columns) === 2 ? "md:grid-cols-2" : Number(data.columns) === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((item: any, itemIndex: number) => {
          const content = <><h3 className="text-lg font-medium text-[#131314]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[rgba(19,19,20,0.62)]">{item.text}</p></>;
          return item.href ? <Link key={itemIndex} href={item.href} className="rounded-[20px] bg-[#f5f5f7] p-6 transition hover:shadow-sm">{content}</Link> : <div key={itemIndex} className="rounded-[20px] bg-[#f5f5f7] p-6">{content}</div>;
        })}
      </div>
    </section>
  );
}

function StepsBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const items = data.items || [];

  if (data.variant === "warranty") {
    return (
      <section className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
        <h2 className="mb-[12px] text-center text-[24px] font-semibold leading-[1.15] text-[#131314] md:mb-[16px] md:text-[30px] lg:text-[36px] xl:text-[42px]">{data.title}</h2>
        {data.subtitle && <p className="mx-auto mb-[28px] max-w-[480px] text-center text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)] md:mb-[36px] md:text-[16px] lg:mb-[48px]">{data.subtitle}</p>}
        <div className="hidden gap-[16px] md:grid md:grid-cols-2 md:gap-[20px] lg:grid-cols-4 lg:gap-[24px]">
          {items.map((item: any, index: number) => (
            <div key={index} className="relative flex flex-col gap-[16px] rounded-[24px] border border-transparent bg-[#f8f8fa] p-[28px] transition-all duration-200 hover:border-[#e8e8ea] hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] lg:p-[32px]">
              <div className="text-[52px] font-extrabold leading-[1] text-[#ef6f2e]/15 lg:text-[60px]">{item.number || String(index + 1).padStart(2, "0")}</div>
              <h3 className="-mt-[8px] text-[17px] font-semibold leading-[1.25] text-[#131314] lg:text-[19px] xl:text-[20px]">{item.title}</h3>
              <p className="text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)] lg:text-[15px]">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:hidden">
          {items.map((item: any, index: number) => (
            <div key={index} className="flex gap-[16px]"><div className="flex flex-col items-center"><div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-[#ef6f2e] text-[14px] font-bold text-white">{item.number || String(index + 1).padStart(2, "0")}</div>{index < items.length - 1 && <div className="my-[4px] w-[2px] flex-1 bg-[#ef6f2e]/15" />}</div><div className={`pb-[28px] ${index === items.length - 1 ? "pb-0" : ""}`}><h3 className="mb-[6px] mt-[9px] text-[16px] font-semibold leading-[1.25] text-[#131314]">{item.title}</h3><p className="text-[14px] leading-[1.5] text-[rgba(19,19,20,0.5)]">{item.text}</p></div></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
      {data.title && <h2 className={`${sectionTitle} ${data.centerTitle !== false ? "text-center" : ""}`}>{data.title}</h2>}
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[24px] lg:grid-cols-4 lg:gap-[28px] xl:gap-[32px]">
        {items.map((item: any, index: number) => (
          <div key={index} className="flex flex-col gap-[16px] rounded-[20px] bg-[#f5f5f7] p-[24px] md:gap-[18px] md:p-[28px] lg:gap-[20px] lg:p-[32px]">
            <div className="text-[40px] font-bold leading-[1] text-[#ef6f2e] md:text-[46px] lg:text-[52px]">{item.number || String(index + 1).padStart(2, "0")}</div>
            <h3 className="text-[18px] font-medium leading-[1.2] text-[#131314] md:text-[19px] lg:text-[20px] xl:text-[22px]">{item.title}</h3>
            <p className="text-[15px] leading-[1.4] text-[rgba(19,19,20,0.6)] md:text-[16px]">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RichTextBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const variant = data.variant;

  if (variant === "warrantyTerms") {
    return (
      <section className="mb-[50px] md:mb-[64px] lg:mb-[80px] xl:mb-[100px]">
        <div className="rounded-[24px] border border-[#f0f0f0] bg-[#fafafa] p-[24px] md:rounded-[28px] md:p-[32px] lg:p-[40px] xl:p-[48px]">
          <div className="mb-[20px] flex items-center gap-[12px] md:mb-[24px] lg:mb-[28px]"><div className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#ef6f2e]/10 md:h-[40px] md:w-[40px]"><Shield className="h-[18px] w-[18px] text-[#ef6f2e] md:h-[20px] md:w-[20px]" /></div><h3 className="text-[18px] font-semibold leading-[1.2] text-[#131314] md:text-[22px] lg:text-[24px]">{data.title}</h3></div>
          <div className="flex flex-col gap-[22px] md:gap-[26px] [&_h4]:mb-[10px] [&_h4]:text-[16px] [&_h4]:font-semibold [&_h4]:leading-[1.3] [&_h4]:text-[#131314] md:[&_h4]:text-[18px] lg:[&_h4]:text-[20px] [&_p]:text-[14px] [&_p]:leading-[1.6] [&_p]:text-[rgba(19,19,20,0.58)] md:[&_p]:text-[15px] lg:[&_p]:text-[16px] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[12px] md:[&_ul]:gap-[14px] lg:[&_ul]:gap-[16px] [&_li]:text-[14px] [&_li]:leading-[1.5] [&_li]:text-[rgba(19,19,20,0.55)] md:[&_li]:text-[15px] lg:[&_li]:text-[16px] [&_strong]:font-semibold [&_strong]:text-[#131314]" dangerouslySetInnerHTML={{ __html: data.html || "" }} />
        </div>
      </section>
    );
  }

  if (variant === "legalFilled" || variant === "legalOutlined" || variant === "legalContact") {
    const contact = variant === "legalContact";
    return (
      <section className={`mb-[40px] rounded-[16px] p-[24px] md:mb-[50px] md:rounded-[20px] md:p-[32px] lg:mb-[60px] lg:rounded-[24px] lg:p-[40px] ${contact ? "bg-gradient-to-br from-[#ef6f2e] to-[#d65e23]" : variant === "legalFilled" ? "bg-[#f5f5f7]" : "border border-[rgba(19,19,20,0.1)]"}`}>
        <div className="mb-[20px] flex items-start gap-[16px] md:mb-[24px] md:gap-[20px]">
          <div className={`flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full md:h-[48px] md:w-[48px] ${contact ? "bg-white" : variant === "legalFilled" ? "bg-[#ef6f2e]" : "border-2 border-[#ef6f2e] bg-white"}`}><span className={`text-[20px] font-medium md:text-[24px] ${contact || variant === "legalOutlined" ? "text-[#ef6f2e]" : "text-white"}`}>{data.number}</span></div>
          <h2 className={`pt-[6px] text-[22px] font-medium leading-[1.2] md:pt-[8px] md:text-[26px] lg:text-[30px] ${contact ? "text-white" : "text-[#131314]"}`}>{data.title}</h2>
        </div>
        <div className={`${contact ? "text-white/90 [&_a]:text-white" : "text-[rgba(19,19,20,0.7)]"} text-[16px] leading-[1.7] md:text-[17px] lg:text-[18px] [&_p+p]:mt-[12px] [&_ul]:mt-[14px] [&_ul]:space-y-[10px] [&_strong]:font-medium ${contact ? "[&_strong]:text-white" : "[&_strong]:text-[#131314]"} [&_a]:font-medium [&_a]:underline`} dangerouslySetInnerHTML={{ __html: data.html || "" }} />
      </section>
    );
  }

  if (variant === "cookieSection") {
    return (
      <section className="mb-[14px] rounded-[14px] bg-[#f5f5f7] p-[20px] md:mb-[18px] md:p-[26px]">
        <div className="mb-[12px] flex items-center gap-[12px]"><span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[#ef6f2e] text-[14px] font-medium text-white">{data.number}</span><h2 className="text-[20px] font-medium leading-[1.2] text-[#131314] md:text-[24px]">{data.title}</h2></div>
        <div className="text-[15px] leading-[1.6] text-[rgba(19,19,20,0.64)] md:text-[16px]" dangerouslySetInnerHTML={{ __html: data.html || "" }} />
      </section>
    );
  }

  return (
    <section className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
      {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
      <div className={`${bodyText} prose max-w-none`} dangerouslySetInnerHTML={{ __html: data.html || "" }} />
    </section>
  );
}

function CtaBlock({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const dark = data.variant === "warrantyDark";
  return (
    <section id={data.anchorId || undefined} className={`relative overflow-hidden rounded-[20px] p-[30px] text-center md:rounded-[24px] md:p-[40px] lg:rounded-[30px] lg:p-[50px] xl:p-[60px] ${dark ? "bg-[#131314]" : "bg-gradient-to-r from-[#131314] to-[#ef6f2e]"}`}>
      {dark && <><div className="pointer-events-none absolute right-[-60px] top-[-60px] h-[200px] w-[200px] rounded-full bg-[#ef6f2e]/20 blur-[80px] md:h-[300px] md:w-[300px]" /><div className="pointer-events-none absolute bottom-[-40px] left-[-40px] h-[160px] w-[160px] rounded-full bg-[#ef6f2e]/10 blur-[60px] md:h-[250px] md:w-[250px]" /></>}
      <div className="relative z-10">
        {data.title && <h2 className={`mb-[16px] text-[24px] font-medium leading-[1.2] text-white md:mb-[20px] md:text-[28px] lg:mb-[24px] lg:text-[34px] xl:text-[40px] ${dark ? "font-semibold" : ""}`}>{data.title}</h2>}
        {data.text && <p className="mx-auto mb-[24px] max-w-[800px] text-[16px] leading-[1.4] text-[rgba(255,255,255,0.8)] md:mb-[28px] md:text-[17px] lg:mb-[32px] lg:text-[18px]">{data.text}</p>}
        {(data.buttonText || data.button2Text) && <div className="flex flex-col items-center justify-center gap-[12px] sm:flex-row md:gap-[16px]">{data.buttonText && data.buttonHref && <Link href={data.buttonHref} className={`inline-block w-full rounded-[60px] bg-white px-[32px] py-[14px] text-center text-[16px] font-medium text-[#131314] transition-opacity hover:opacity-90 sm:w-auto md:px-[40px] md:py-[16px] md:text-[17px] lg:px-[48px] lg:py-[18px] lg:text-[18px] ${dark ? "rounded-[14px] bg-[#ef6f2e] text-white hover:bg-[#d95f22]" : ""}`}>{data.buttonText}</Link>}{data.button2Text && data.button2Href && <Link href={data.button2Href} className={`inline-block w-full rounded-[60px] border-2 border-white bg-transparent px-[32px] py-[12px] text-center text-[16px] font-medium text-white transition-all hover:bg-white hover:text-[#131314] sm:w-auto md:px-[40px] md:py-[14px] md:text-[17px] lg:px-[48px] lg:py-[16px] lg:text-[18px] ${dark ? "rounded-[14px] border border-white/15 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white" : ""}`}>{data.button2Text}</Link>}</div>}
      </div>
    </section>
  );
}

function renderBlock(block: StaticPageBlock, index: number) {
  const data = block.data || {};

  switch (block.type) {
    case "hero":
      return <PageIntro key={index} data={data} variant={data.variant} />;
    case "richText":
      return <RichTextBlock key={index} block={block} />;
    case "imageText":
      return <ImageTextBlock key={index} block={block} />;
    case "cards":
      return <CardsBlock key={index} block={block} />;
    case "stats":
      return (
        <section key={index} className="mb-[40px] md:mb-[50px] lg:mb-[60px] xl:mb-[80px]">
          {data.title && <h2 className={`${sectionTitle} text-center`}>{data.title}</h2>}
          <div className="grid grid-cols-2 gap-[16px] md:gap-[20px] lg:gap-[24px] xl:grid-cols-4 xl:gap-[30px]">
            {(data.items || []).map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="flex flex-col items-center justify-center gap-[8px] rounded-[20px] bg-[#f5f5f7] p-[20px] text-center md:gap-[10px] md:p-[24px] lg:gap-[12px] lg:p-[30px] xl:p-[36px]">
                <div className="whitespace-nowrap text-[28px] font-semibold leading-[1] text-[#ef6f2e] tabular-nums md:text-[34px] xl:text-[40px] 2xl:text-[46px]">{item.value}</div>
                <div className="text-[14px] leading-[1.3] text-[rgba(19,19,20,0.6)] md:text-[15px] lg:text-[16px]">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      );
    case "steps":
      return <StepsBlock key={index} block={block} />;
    case "table":
      return (
        <section key={index} className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">
          {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
          <div className="overflow-hidden rounded-[20px] bg-[#f5f5f7]"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[rgba(19,19,20,0.1)]">{(data.columns || []).map((column: string, i: number) => <th key={i} className="p-[16px] text-left text-[16px] font-medium text-[#131314] md:p-[20px] md:text-[17px] lg:p-[24px] lg:text-[18px]">{column}</th>)}</tr></thead><tbody>{(data.rows || []).map((row: string[], i: number) => <tr key={i} className={i !== data.rows.length - 1 ? "border-b border-[rgba(19,19,20,0.05)]" : ""}>{row.map((cell, j) => <td key={j} className="p-[16px] text-[15px] font-normal text-[#131314] md:p-[20px] md:text-[16px] lg:p-[24px]">{cell}</td>)}</tr>)}</tbody></table></div></div>
        </section>
      );
    case "info":
      return <section key={index} className={`mb-[50px] rounded-[22px] p-6 md:mb-[60px] md:p-8 lg:mb-[70px] xl:mb-[80px] ${data.tone === "orange" ? "bg-[#fff1e9]" : "bg-[#f5f5f7]"}`}>{data.title && <h2 className="mb-3 text-xl font-medium text-[#131314]">{data.title}</h2>}<div className={bodyText} dangerouslySetInnerHTML={{ __html: data.html || "" }} /></section>;
    case "cta":
      return <CtaBlock key={index} block={block} />;
    case "map":
      return (
        <section key={index} className="mb-[24px] md:mb-[30px] lg:mb-[36px]">
          {data.title && <h2 className={sectionTitle}>{data.title}</h2>}
          <div className="h-[300px] overflow-hidden rounded-[20px] md:h-[400px] md:rounded-[24px] lg:h-[500px] lg:rounded-[30px]">
            <iframe title={data.iframeTitle || data.title || "Карта"} src={data.src || `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(data.query || "PRIME Electronics Москва")}`} width="100%" height="100%" frameBorder="0" style={{ border: 0 }} allowFullScreen loading="lazy" />
          </div>
        </section>
      );
    case "contactForm":
      return <section key={index} className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">{data.title && <h2 className={`${sectionTitle} text-center`}>{data.title}</h2>}<div className="mx-auto max-w-[800px]"><ContactForm /></div></section>;
    case "promotionGrid":
      return <section key={index} className="mb-[50px] md:mb-[60px] lg:mb-[70px] xl:mb-[80px]">{data.title && <h2 className={sectionTitle}>{data.title}</h2>}<div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 md:gap-[20px] lg:grid-cols-3 xl:gap-[24px]">{promotionsData.slice(0, Math.min(12, Number(data.limit) || 6)).map((promotion) => <PromotionCard key={promotion.id} {...promotion} />)}</div></section>;
    case "productGrid":
      return <ProductGridBlock key={index} block={block} />;
    default:
      return null;
  }
}

export function StaticPageRenderer({ page }: { page: StaticBuilderPage }) {
  const label = page.name || page.title || page.path;
  const isPrivacy = page.path === "/privacy";
  const isCookies = page.path === "/cookies";

  return (
    <main className={`w-full bg-white ${isPrivacy ? "min-h-screen" : ""}`}>
      <div className={isPrivacy ? "mx-auto max-w-[1920px] px-[16px] py-[60px] md:px-[24px] md:py-[100px] lg:px-[40px] lg:py-[140px] xl:px-[60px] xl:py-[180px] 2xl:px-[120px] 2xl:py-[200px]" : "mx-auto max-w-[1920px] px-[16px] py-[24px] md:px-[40px] md:py-[32px] lg:px-[40px] lg:py-[40px] xl:px-[60px] xl:py-[60px] 2xl:px-[120px]"}>
        {!isPrivacy && (
          <Breadcrumb
            items={[{ label: "Главная", href: "/" }, { label: isCookies ? "Политика cookie" : label }]}
            className="mb-[24px] md:mb-[32px] lg:mb-[40px] xl:mb-[50px]"
          />
        )}
        <div className={isPrivacy ? "mx-auto max-w-[1100px]" : isCookies ? "max-w-[980px]" : ""}>
          {page.blocks.map(renderBlock)}
        </div>
      </div>
    </main>
  );
}
