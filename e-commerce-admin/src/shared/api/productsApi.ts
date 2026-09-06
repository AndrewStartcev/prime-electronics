import { apiClient } from "./client";

export interface Product {
  id: string;
  categoryId?: string;
  brandId?: string;
  variantGroupId?: string | null;
  variantColor?: string | null;
  variantMemory?: string | null;
  variantSim?: string | null;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  oldPrice?: string | number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
  isOnSale: boolean;
  isPopular: boolean;
  viewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    title?: string;
    name?: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  variantGroup?: ProductVariantGroupWithProducts | null;
  categories?: Array<{
    categoryId: string;
    isPrimary: boolean;
    category: {
      id: string;
      title?: string;
      name?: string;
      slug: string;
    };
  }>;
  images?: Array<{
    id: string;
    productId: string;
    url: string;
    alt: string;
    sortOrder: number;
    createdAt: string;
  }>;
  rating: number;
  reviewCount: number;
  totalStock: number;
  // Legacy fields for backwards compatibility
  title?: string;
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  attributes?: Array<{
    id?: string;
    name: string;
    value: string;
  }>;
  relatedProducts?: Array<{
    id: string;
    sortOrder: number;
    targetProduct: {
      id: string;
      name: string;
      slug: string;
      price: string | number;
      totalStock?: number;
      images?: Array<{
        id: string;
        url: string;
      }>;
    };
  }>;
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    products: number;
  };
}

export interface ProductVariantGroupProduct {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  oldPrice?: string | number | null;
  isActive: boolean;
  variantColor?: string | null;
  variantMemory?: string | null;
  variantSim?: string | null;
  totalStock?: number;
  attributes?: Array<{
    id?: string;
    name: string;
    value: string;
  }>;
  images?: Array<{
    id: string;
    url: string;
    alt?: string | null;
    sortOrder?: number;
  }>;
}

export interface ProductVariantGroupWithProducts {
  id: string;
  name: string;
  products: ProductVariantGroupProduct[];
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandIds?: string[];
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: "popularity" | "price_asc" | "price_desc" | "newest" | "rating";
  includeInactive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoH1?: string;
  variantGroupId?: string | null;
  variantColor?: string | null;
  variantMemory?: string | null;
  variantSim?: string | null;
  relatedProductIds?: string[];
  images?: Array<{ url: string; alt?: string; sortOrder?: number }>;
  categoryIds: string[];
  brandId?: string;
  attributes?: Array<{ name: string; value: string }>;
  isActive?: boolean;
  isOnSale?: boolean;
  isPopular?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface BulkUpdateProductCategoriesDto {
  productIds: string[];
  categoryId: string;
}

export interface BulkUpdateProductCategoriesResult {
  updated: number;
  categoryId: string;
}

export interface CatalogCleanupSuggestion {
  productId: string;
  productName: string;
  productSlug: string;
  currentCategoryId: string;
  currentCategoryTitle: string;
  currentCategoryPath: string[];
  targetCategoryId: string;
  targetCategoryTitle: string;
  targetCategoryPath: string[];
  reason: string;
}

export interface CatalogCleanupSuggestionsResponse {
  scanned: number;
  suggestions: CatalogCleanupSuggestion[];
}

export interface ApplyCatalogCleanupDto {
  dryRun?: boolean;
  limit?: number;
  excludedProductIds?: string[];
}

export interface AppliedCatalogCleanupSuggestion
  extends CatalogCleanupSuggestion {
  skipped: boolean;
  skipReason: string | null;
}

export interface ApplyCatalogCleanupResponse {
  dryRun: boolean;
  scanned: number;
  suggested: number;
  applicable: number;
  excluded: number;
  applied: number;
  suggestions: AppliedCatalogCleanupSuggestion[];
  appliedItems: AppliedCatalogCleanupSuggestion[];
}

export const productsApi = {
  getAll: async (
    filter?: ProductFilter
  ): Promise<PaginatedResponse<Product>> => {
    const params: Record<string, unknown> = { ...(filter || {}) };

    if (filter?.brandIds?.length) {
      params.brandIds = filter.brandIds.join(",");
    } else if (filter?.brandId) {
      params.brandIds = filter.brandId;
    }

    delete params.brandId;

    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  getVariantGroups: async (params?: {
    search?: string;
    limit?: number;
  }): Promise<ProductVariantGroup[]> => {
    const response = await apiClient.get("/products/variant-groups", { params });
    return response.data;
  },

  getVariantGroup: async (
    id: string,
  ): Promise<ProductVariantGroupWithProducts> => {
    const response = await apiClient.get(`/products/variant-groups/${id}`);
    return response.data;
  },

  createVariantGroup: async (data: {
    name: string;
  }): Promise<ProductVariantGroup> => {
    const response = await apiClient.post("/products/variant-groups", data);
    return response.data;
  },

  updateVariantGroup: async (
    id: string,
    data: { name: string },
  ): Promise<ProductVariantGroup> => {
    const response = await apiClient.patch(`/products/variant-groups/${id}`, data);
    return response.data;
  },

  deleteVariantGroup: async (
    id: string,
  ): Promise<{ id: string; unlinkedProducts: number }> => {
    const response = await apiClient.delete(`/products/variant-groups/${id}`);
    return response.data;
  },

  bulkUpdateCategories: async (
    data: BulkUpdateProductCategoriesDto
  ): Promise<BulkUpdateProductCategoriesResult> => {
    const response = await apiClient.patch("/products/bulk/categories", data);
    return response.data;
  },

  getCatalogCleanupSuggestions: async (
    limit = 200,
  ): Promise<CatalogCleanupSuggestionsResponse> => {
    const response = await apiClient.get("/products/catalog-cleanup/suggestions", {
      params: { limit },
    });
    return response.data;
  },

  applyCatalogCleanup: async (
    data: ApplyCatalogCleanupDto = {},
  ): Promise<ApplyCatalogCleanupResponse> => {
    const response = await apiClient.post(
      "/products/catalog-cleanup/apply",
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getDeleted: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get("/products/deleted/list", { params });
    return response.data;
  },

  restore: async (id: string): Promise<Product> => {
    const response = await apiClient.post(`/products/${id}/restore`);
    return response.data;
  },

  getFilters: async (categoryId?: string) => {
    const response = await apiClient.get("/products/filters", {
      params: { categoryId },
    });
    return response.data;
  },
};
