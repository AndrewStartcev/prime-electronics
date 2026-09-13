import type { Blog } from "@/shared/api";
import type {
  ProductDetailResponse,
  ProductResponse,
} from "@/shared/api/productApi";
import { CONTACT_PHONE_SCHEMA } from "./contactInfo";
import { absoluteSiteUrl, SITE_URL } from "./seoMetadata";

type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export type BreadcrumbSchemaItem = {
  name: string;
  url: string;
};

const PRICE_VALID_UNTIL = "2027-12-31";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function compact<T>(values: Array<T | null | undefined | false>): T[] {
  return values.filter(Boolean) as T[];
}

function cleanText(value?: string | null): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || undefined;
}

function absoluteUrl(value?: string | null): string | undefined {
  const cleanValue = cleanText(value);
  if (!cleanValue) return undefined;
  if (/^https?:\/\//i.test(cleanValue)) return cleanValue;
  return absoluteSiteUrl(cleanValue);
}

function decimalString(value?: string | number | null): string | undefined {
  if (value === null || value === undefined) return undefined;

  const normalized =
    typeof value === "number"
      ? value
      : Number.parseFloat(
          value.replace(/\u00a0/g, "").replace(/\s+/g, "").replace(",", "."),
        );

  if (!Number.isFinite(normalized)) return undefined;
  return normalized.toFixed(2).replace(/\.00$/, "");
}

function getAttributeValue(
  product: ProductDetailResponse,
  names: string[],
): string | undefined {
  const normalizedNames = names.map((name) => name.toLowerCase());
  const attribute = product.attributes?.find((item) => {
    const normalizedName = item.name.toLowerCase().replace(/ё/g, "е");
    return normalizedNames.some((name) => normalizedName.includes(name));
  });

  return cleanText(attribute?.value);
}

function getProductImages(
  product: Pick<ProductResponse, "images">,
): string[] {
  return compact(product.images?.map((image) => absoluteUrl(image.url)));
}

export function JsonLd({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function buildHomeStructuredData(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Prime Electronics",
        url: SITE_URL,
        logo: absoluteSiteUrl("/prime_black.svg"),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: CONTACT_PHONE_SCHEMA,
          contactType: "sales",
          areaServed: "RU",
          availableLanguage: "Russian",
        },
        sameAs: [
          "https://vk.ru/club238735026",
          "https://www.instagram.com/prime_electronics.msk",
          "https://t.me/PrimeElectronics_ru",
        ],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Prime Electronics",
        publisher: {
          "@id": ORGANIZATION_ID,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function buildStoreStructuredData(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/contacts/#store`,
    name: "Prime Electronics",
    image: absoluteSiteUrl("/images/social-contacts-qr.png"),
    url: SITE_URL,
    telephone: CONTACT_PHONE_SCHEMA,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "улица Барклая, 6Ак1",
      addressLocality: "Москва",
      postalCode: "121087",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "55.741234",
      longitude: "37.501234",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "21:00",
    },
    sameAs: [
      "https://vk.ru/club238735026",
      "https://www.instagram.com/prime_electronics.msk",
      "https://t.me/PrimeElectronics_ru",
    ],
  };
}

export function buildBreadcrumbStructuredData(
  items: BreadcrumbSchemaItem[],
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductStructuredData(
  product: ProductDetailResponse,
): JsonLdValue {
  const ratingValue = Number(product.rating);
  const reviewCount = Number(product.reviewCount);
  const images = getProductImages(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.length > 0 ? images : [absoluteSiteUrl("/images/placeholder-product.png")],
    description:
      cleanText(product.description) ||
      `${product.name} в интернет-бутике Prime Electronics`,
    sku: getAttributeValue(product, ["sku", "артикул", "код товара"]) || product.slug,
    mpn: getAttributeValue(product, ["mpn", "модель"]),
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteSiteUrl(`/product/${product.slug.toLowerCase()}`),
      priceCurrency: "RUB",
      price: decimalString(product.price),
      priceValidUntil: PRICE_VALID_UNTIL,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Prime Electronics",
      },
    },
    aggregateRating:
      ratingValue > 0 && reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: decimalString(ratingValue),
            reviewCount,
          }
        : undefined,
  };
}

export function buildItemListStructuredData({
  name,
  url,
  products,
}: {
  name: string;
  url: string;
  products: ProductResponse[];
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteSiteUrl(`/product/${product.slug.toLowerCase()}`),
      name: product.name,
    })),
  };
}

export function buildArticleStructuredData(post: Blog): JsonLdValue {
  const description =
    cleanText(post.excerpt) ||
    cleanText(post.text)?.slice(0, 220) ||
    `${post.title} в блоге Prime Electronics`;
  const image = absoluteUrl(post.imageUrl) || absoluteSiteUrl("/images/blog.png");
  const authorName = cleanText(post.authorProfile?.name) || cleanText(post.author) || "Prime Electronics";

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    image,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    url: absoluteSiteUrl(`/blog/${post.slug.toLowerCase()}`),
    author: {
      "@type": "Person",
      name: authorName,
      image: absoluteUrl(post.authorProfile?.avatarUrl),
      description: cleanText(post.authorProfile?.bio),
    },
    publisher: {
      "@type": "Organization",
      name: "Prime Electronics",
      logo: {
        "@type": "ImageObject",
        url: absoluteSiteUrl("/prime_black.svg"),
      },
    },
    description,
  };
}
