import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://prime-electronics.ru";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.prime-electronics.ru/api";
const DEFAULT_PAGE_SIZE = 100;
const PRODUCT_PAGE_SIZE = 200;

type ApiListResponse<T> = {
  data?: T[];
  meta?: {
    totalPages?: number;
    page?: number;
  };
};

type ProductSeoItem = {
  slug?: string | null;
  updatedAt?: string | null;
};

type CategorySeoItem = {
  slug?: string | null;
  updatedAt?: string | null;
  isActive?: boolean | null;
  _count?: {
    products?: number;
    children?: number;
  } | null;
};

type BlogSeoItem = {
  slug?: string | null;
  updatedAt?: string | null;
};

type SeoCollectionItem = {
  slug?: string | null;
  updatedAt?: string | null;
  isActive?: boolean | null;
};

function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function safeDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function isIndexableCategory(category: CategorySeoItem): boolean {
  const slug = category.slug?.trim().toLowerCase();
  if (!slug) return false;
  if (category.isActive === false) return false;
  if (slug === "uniq" || slug.startsWith("uniq-")) return false;

  const productsCount = category._count?.products;
  const childrenCount = category._count?.children;
  if (
    typeof productsCount === "number" &&
    typeof childrenCount === "number" &&
    productsCount + childrenCount === 0
  ) {
    return false;
  }

  return true;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getProducts(): Promise<ProductSeoItem[]> {
  const firstPage = await fetchJson<ApiListResponse<ProductSeoItem>>(
    `/products?page=1&limit=${PRODUCT_PAGE_SIZE}`,
  );

  const products = [...(firstPage?.data ?? [])];
  const totalPages = firstPage?.meta?.totalPages ?? 1;

  if (totalPages <= 1) return products;

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchJson<ApiListResponse<ProductSeoItem>>(
        `/products?page=${index + 2}&limit=${PRODUCT_PAGE_SIZE}`,
      ),
    ),
  );

  restPages.forEach((page) => {
    products.push(...(page?.data ?? []));
  });

  return products;
}

async function getCategories(): Promise<CategorySeoItem[]> {
  const firstPage = await fetchJson<ApiListResponse<CategorySeoItem>>(
    `/categories?page=1&limit=${DEFAULT_PAGE_SIZE}`,
  );
  const categories = [...(firstPage?.data ?? [])];
  const totalPages = firstPage?.meta?.totalPages ?? 1;

  if (totalPages <= 1) return categories;

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchJson<ApiListResponse<CategorySeoItem>>(
        `/categories?page=${index + 2}&limit=${DEFAULT_PAGE_SIZE}`,
      ),
    ),
  );

  restPages.forEach((page) => {
    categories.push(...(page?.data ?? []));
  });

  return categories;
}

async function getBlogs(): Promise<BlogSeoItem[]> {
  const blogs = await fetchJson<ApiListResponse<BlogSeoItem>>(
    `/blog?page=1&limit=${DEFAULT_PAGE_SIZE}`,
  );
  return blogs?.data ?? [];
}

async function getSeoCollections(): Promise<SeoCollectionItem[]> {
  return (await fetchJson<SeoCollectionItem[]>("/seo/collections")) || [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/categories"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/promotions"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/trade-in"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/delivery"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/warranty"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contacts"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.6 },
  ];

  const [categories, products, blogs, collections] = await Promise.all([
    getCategories(),
    getProducts(),
    getBlogs(),
    getSeoCollections(),
  ]);

  const categoryPages = categories
    .filter(isIndexableCategory)
    .map((category) => ({
      url: absoluteUrl(`/catalog/${category.slug}`),
      lastModified: safeDate(category.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  const productPages = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: absoluteUrl(`/product/${product.slug!.toLowerCase()}`),
      lastModified: safeDate(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const blogPages = blogs
    .filter((blog) => blog.slug)
    .map((blog) => ({
      url: absoluteUrl(`/blog/${blog.slug}`),
      lastModified: safeDate(blog.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const collectionPages = collections
    .filter((collection) => collection.slug && collection.isActive !== false)
    .map((collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`),
      lastModified: safeDate(collection.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...blogPages,
    ...collectionPages,
  ];
}
