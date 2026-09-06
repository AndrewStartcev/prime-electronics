import { apiClient } from "./apiClient";

const TECHNICAL_ATTRIBUTE_NAMES = new Set([
  "id оффера",
  "группа оффера",
  "категория источника",
  "путь источника",
  "source id",
  "source slug",
  "offer id",
  "offer group",
]);

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

const normalizeAttributeName = (name: string): string | null => {
  const cleanName = name.replace(/\s+/g, " ").trim();
  if (!cleanName) return null;

  const withoutPrefix = cleanName.replace(/^параметр\s*:\s*/i, "").trim();
  const withoutCardPrefix = withoutPrefix
    .replace(/^в\s*плитку\s*:\s*/i, "")
    .trim();
  const finalName = withoutCardPrefix || withoutPrefix || cleanName;
  if (!finalName) return null;

  if (TECHNICAL_ATTRIBUTE_NAMES.has(normalizeText(finalName))) {
    return null;
  }

  return finalName;
};

const isCardAttributeName = (name: string): boolean =>
  /^в\s*плитку\s*:/i.test(
    name.replace(/\s+/g, " ").replace(/^параметр\s*:\s*/i, "").trim(),
  );

const sanitizeAttributes = (
  attributes?: ProductAttribute[],
): ProductAttribute[] => {
  if (!attributes || attributes.length === 0) return [];

  const unique = new Map<string, ProductAttribute>();
  attributes.forEach((attribute) => {
    const normalizedName = normalizeAttributeName(attribute.name);
    const value = attribute.value?.trim();
    if (!normalizedName || !value) return;

    const key = `${normalizeText(normalizedName)}::${normalizeText(value)}`;
    const showInCard = isCardAttributeName(attribute.name);
    const existing = unique.get(key);
    if (!existing || (!existing.showInCard && showInCard)) {
      unique.set(key, {
        ...attribute,
        name: normalizedName,
        value,
        showInCard,
      });
    }
  });

  return Array.from(unique.values());
};

const sanitizeFiltersAttributes = (
  attributes: Record<string, string[]>,
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  Object.entries(attributes || {}).forEach(([name, values]) => {
    const normalizedName = normalizeAttributeName(name);
    if (!normalizedName) return;

    const existing = result[normalizedName] ?? [];
    const valueSet = new Set(existing.map((value) => normalizeText(value)));

    values.forEach((value) => {
      const cleanValue = value?.trim();
      if (!cleanValue) return;

      const key = normalizeText(cleanValue);
      if (valueSet.has(key)) return;

      valueSet.add(key);
      existing.push(cleanValue);
    });

    result[normalizedName] = existing;
  });

  return result;
};

const sanitizeProduct = <T extends ProductResponse>(product: T): T => ({
  ...product,
  attributes: sanitizeAttributes(product.attributes),
});

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  showInCard?: boolean;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  category: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface ProductResponse {
  id: string;
  brandId: string | null;
  variantGroupId?: string | null;
  variantColor?: string | null;
  variantMemory?: string | null;
  variantSim?: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string; // Decimal comes as string
  oldPrice: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
  isOnSale: boolean;
  viewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
  brand: { id: string; name: string; slug: string } | null;
  variantGroup?: ProductVariantGroupResponse | null;
  images: ProductImage[];
  attributes?: ProductAttribute[];
  rating: number;
  reviewCount: number;
  totalStock: number;
}

export interface ProductVariantGroupProductResponse {
  id: string;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  isActive: boolean;
  variantColor: string | null;
  variantMemory: string | null;
  variantSim: string | null;
  totalStock: number;
  images: ProductImage[];
  attributes?: ProductAttribute[];
}

export interface ProductVariantGroupResponse {
  id: string;
  name: string;
  products: ProductVariantGroupProductResponse[];
}

export interface ProductDetailResponse extends ProductResponse {
  attributes: ProductAttribute[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    guestName: string | null;
    user: { id: string; name: string } | null;
  }[];
  productStock: {
    stockCount: number;
    pickupPoint: {
      id: string;
      address: string;
      coords: string;
      workingSchedule: Record<string, { from: string; to: string }>;
      url: string | null;
    };
  }[];
  relatedProducts?: Array<{
    id: string;
    sortOrder: number;
    targetProduct: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      price: string;
      oldPrice: string | null;
      isActive: boolean;
      isOnSale: boolean;
      createdAt: string;
      totalStock: number;
      images: ProductImage[];
    };
  }>;
}

export interface ProductsListResponse {
  data: ProductResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandIds?: string[];
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popularity" | "rating";
  search?: string;
  attributes?: string; // JSON string: {"color": "red", "size": "M"}
}

export interface FiltersResponse {
  brands: { id: string; name: string; slug: string }[];
  priceRange: { min: number; max: number };
  attributes: Record<string, string[]>;
}

export const productApi = {
  /**
   * Get all products with filters
   */
  getAll: async (
    filters: ProductFilters = {},
  ): Promise<ProductsListResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.brandIds && filters.brandIds.length > 0) {
      params.append("brandIds", filters.brandIds.join(","));
    }
    if (filters.brandSlug) params.append("brandSlug", filters.brandSlug);
    if (filters.minPrice !== undefined)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.isOnSale) params.append("onSale", "true");
    if (filters.inStock) params.append("inStock", "true");
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.search) params.append("search", filters.search);
    if (filters.attributes) params.append("attributes", filters.attributes);

    const response = await apiClient.get<ProductsListResponse>(
      `/products?${params.toString()}`,
    );
    return {
      ...response.data,
      data: response.data.data.map((product) => sanitizeProduct(product)),
    };
  },

  /**
   * Get available filters for products
   */
  getFilters: async (
    categoryId?: string,
    brandIds?: string[],
    brandSlug?: string,
  ): Promise<FiltersResponse> => {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (brandIds?.length) params.set("brandIds", brandIds.join(","));
    if (brandSlug) params.set("brandSlug", brandSlug);
    const query = params.toString();
    const response = await apiClient.get<FiltersResponse>(
      `/products/filters${query ? `?${query}` : ""}`,
    );
    return {
      ...response.data,
      attributes: sanitizeFiltersAttributes(response.data.attributes),
    };
  },

  /**
   * Get product by slug
   */
  getBySlug: async (slug: string): Promise<ProductDetailResponse> => {
    const response = await apiClient.get<ProductDetailResponse>(
      `/products/slug/${slug}`,
    );
    return sanitizeProduct(response.data);
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<ProductDetailResponse> => {
    const response = await apiClient.get<ProductDetailResponse>(
      `/products/${id}`,
    );
    return sanitizeProduct(response.data);
  },
};
