import type { ProductResponse } from "@/shared/api/productApi";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prime-electronics.ru";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.prime-electronics.ru/api";
const PAGE_SIZE = 200;
// Yandex.Market allows no more than 18 digits. Safe JavaScript integers fit
// comfortably inside that limit and keep generated identifiers exact.
const MAX_YANDEX_ID = Number.MAX_SAFE_INTEGER;

type ApiListResponse<T> = {
  data?: T[];
  meta?: {
    totalPages?: number;
  };
};

type FeedCategory = {
  id: string;
  parentId?: string | null;
  title: string;
  slug?: string | null;
  isActive?: boolean | null;
};

type YandexFeedCategory = {
  sourceId: string;
  id: string;
  parentId?: string;
  title: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

function escapeXml(value?: string | number | null): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value?: string | null): string {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePrice(value?: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(
          value.replace(/\u00a0/g, "").replace(/\s+/g, "").replace(",", "."),
        );

  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed.toFixed(2).replace(/\.00$/, "");
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const separator = path.includes("?") ? "&" : "?";
  const firstPage = await fetchJson<ApiListResponse<T>>(
    `${path}${separator}page=1&limit=${PAGE_SIZE}`,
  );
  const items = [...(firstPage?.data ?? [])];
  const totalPages = firstPage?.meta?.totalPages ?? 1;

  if (totalPages <= 1) return items;

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchJson<ApiListResponse<T>>(
        `${path}${separator}page=${index + 2}&limit=${PAGE_SIZE}`,
      ),
    ),
  );

  restPages.forEach((page) => {
    items.push(...(page?.data ?? []));
  });

  return items;
}

function getPrimaryCategoryId(product: ProductResponse): string | null {
  const category =
    product.categories?.find((item) => item.isPrimary) ||
    product.categories?.[0];

  return category?.categoryId || category?.category?.id || null;
}

function getNumericId(sourceId: string): number {
  const uuidHex = sourceId.replace(/-/g, "");
  if (/^[0-9a-f]{13,}$/i.test(uuidHex)) {
    const fromUuid = Number.parseInt(uuidHex.slice(0, 13), 16);
    if (Number.isSafeInteger(fromUuid) && fromUuid > 0) return fromUuid;
  }

  let hash = 2_166_136_261;
  for (const character of sourceId) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0) || 1;
}

export function buildYandexIdMap(sourceIds: string[]): Map<string, string> {
  const ids = Array.from(new Set(sourceIds.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
  const yandexIdBySourceId = new Map<string, string>();
  const usedIds = new Set<number>();

  ids.forEach((sourceId) => {
    let numericId = getNumericId(sourceId);
    while (usedIds.has(numericId)) {
      numericId += 1;
    }

    if (numericId > MAX_YANDEX_ID) {
      throw new Error("Yandex ID is outside the allowed range");
    }

    usedIds.add(numericId);
    yandexIdBySourceId.set(sourceId, String(numericId));
  });

  return yandexIdBySourceId;
}

export function buildFeedCategories(
  categories: FeedCategory[],
): YandexFeedCategory[] {
  const activeCategories = categories
    .filter(
      (category) =>
        Boolean(category.id) &&
        Boolean(category.title?.trim()) &&
        category.isActive !== false,
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const yandexIdBySourceId = buildYandexIdMap(
    activeCategories.map((category) => category.id),
  );

  const categoryById = new Map(
    activeCategories.map((category) => [category.id, category]),
  );
  const orderedCategories: FeedCategory[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const appendCategory = (categoryId: string) => {
    if (visited.has(categoryId) || visiting.has(categoryId)) return;

    const category = categoryById.get(categoryId);
    if (!category) return;

    visiting.add(categoryId);
    if (category.parentId && categoryById.has(category.parentId)) {
      appendCategory(category.parentId);
    }
    visiting.delete(categoryId);
    visited.add(categoryId);
    orderedCategories.push(category);
  };

  activeCategories.forEach((category) => appendCategory(category.id));

  return orderedCategories.map((category) => ({
    sourceId: category.id,
    id: yandexIdBySourceId.get(category.id)!,
    parentId: category.parentId
      ? yandexIdBySourceId.get(category.parentId)
      : undefined,
    title: category.title.trim(),
  }));
}

export function renderCategories(categories: YandexFeedCategory[]): string {
  return categories
    .map((category) => {
      const parent = category.parentId
        ? ` parentId="${escapeXml(category.parentId)}"`
        : "";
      return `<category id="${escapeXml(category.id)}"${parent}>${escapeXml(
        category.title,
      )}</category>`;
    })
    .join("\n");
}

export function renderOffer(
  product: ProductResponse,
  yandexCategoryIds: ReadonlyMap<string, string>,
  yandexOfferIds: ReadonlyMap<string, string>,
): string | null {
  const price = normalizePrice(product.price);
  const sourceCategoryId = getPrimaryCategoryId(product);
  const categoryId = sourceCategoryId
    ? yandexCategoryIds.get(sourceCategoryId)
    : undefined;
  const offerId = yandexOfferIds.get(product.id);
  if (!price || !categoryId || !offerId || !product.slug || !product.name) {
    return null;
  }

  const oldPrice = normalizePrice(product.oldPrice);
  const picture = product.images?.[0]?.url;
  const description =
    stripHtml(product.description) ||
    `${product.name} в интернет-бутике Prime Electronics`;
  const params = (product.attributes || [])
    .slice(0, 20)
    .map(
      (attribute) =>
        `<param name="${escapeXml(attribute.name)}">${escapeXml(
          attribute.value,
        )}</param>`,
    )
    .join("\n");

  return `<offer id="${escapeXml(offerId)}" available="${
    product.totalStock > 0
  }">
<name>${escapeXml(product.name)}</name>
${product.brand?.name ? `<vendor>${escapeXml(product.brand.name)}</vendor>` : ""}
<url>${escapeXml(absoluteUrl(`/product/${product.slug.toLowerCase()}`))}</url>
<price>${escapeXml(price)}</price>
${oldPrice ? `<oldprice>${escapeXml(oldPrice)}</oldprice>` : ""}
<currencyId>RUR</currencyId>
<categoryId>${escapeXml(categoryId)}</categoryId>
${picture ? `<picture>${escapeXml(absoluteUrl(picture))}</picture>` : ""}
<description>${escapeXml(description)}</description>
${params}
</offer>`;
}

export async function GET() {
  const [categories, products] = await Promise.all([
    fetchAllPages<FeedCategory>("/categories"),
    fetchAllPages<ProductResponse>("/products"),
  ]);
  const feedCategories = buildFeedCategories(categories);
  const yandexCategoryIds = new Map(
    feedCategories.map((category) => [category.sourceId, category.id]),
  );
  const yandexOfferIds = buildYandexIdMap(products.map((product) => product.id));

  const offers = products
    .filter((product) => product.isActive !== false)
    .map((product) =>
      renderOffer(product, yandexCategoryIds, yandexOfferIds),
    )
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${new Date().toISOString()}">
<shop>
<name>Prime Electronics</name>
<company>Prime Electronics</company>
<url>${escapeXml(SITE_URL)}</url>
<currencies>
<currency id="RUR" rate="1"/>
</currencies>
<categories>
${renderCategories(feedCategories)}
</categories>
<delivery-options>
<option cost="590" days="0-1"/>
</delivery-options>
<pickup-options>
<option cost="0" days="0-1"/>
</pickup-options>
<offers>
${offers}
</offers>
</shop>
</yml_catalog>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
