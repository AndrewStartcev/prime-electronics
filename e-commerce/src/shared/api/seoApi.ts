import { apiClient } from "./apiClient";
import type { ProductFilters } from "./productApi";

export type SeoPageType = "HOME" | "CATEGORY" | "PRODUCT" | "STATIC" | "BLOG";

export interface SeoTemplate {
  id?: string | null;
  type: SeoPageType;
  titleTemplate?: string | null;
  descriptionTemplate?: string | null;
  h1Template?: string | null;
}

export interface StaticPageSeo {
  id?: string | null;
  path: string;
  name?: string | null;
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
}

export type SeoCollectionSortBy =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "rating";

export interface SeoCollection {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  brandIds: string[];
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  inStock: boolean;
  isOnSale: boolean;
  attributes?: Record<string, string[]> | null;
  sortBy?: SeoCollectionSortBy | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
  sortOrder: number;
  category?: { id: string; title: string; slug: string } | null;
}

export interface SeoTagTile {
  id: string;
  title: string;
  image?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
  url?: string | null;
  isActive: boolean;
  sortOrder: number;
  category?: { id: string; title: string; slug: string } | null;
  collection?: { id: string; name: string; slug: string; isActive: boolean } | null;
}

export function getSeoCollectionProductFilters(
  collection: SeoCollection,
): ProductFilters {
  return {
    categoryId: collection.categoryId || undefined,
    brandIds: collection.brandIds?.length ? collection.brandIds : undefined,
    minPrice:
      collection.minPrice !== null && collection.minPrice !== undefined
        ? Number(collection.minPrice)
        : undefined,
    maxPrice:
      collection.maxPrice !== null && collection.maxPrice !== undefined
        ? Number(collection.maxPrice)
        : undefined,
    inStock: collection.inStock || undefined,
    isOnSale: collection.isOnSale || undefined,
    sortBy: collection.sortBy || "popularity",
    attributes:
      collection.attributes && Object.keys(collection.attributes).length > 0
        ? JSON.stringify(collection.attributes)
        : undefined,
  };
}

export const seoApi = {
  getTemplates: async (): Promise<SeoTemplate[]> => {
    const response = await apiClient.get<SeoTemplate[]>("/seo/templates");
    return response.data;
  },

  getStaticPage: async (path: string): Promise<StaticPageSeo> => {
    const response = await apiClient.get<StaticPageSeo>("/seo/static-page", {
      params: { path },
    });
    return response.data;
  },

  getCollectionBySlug: async (slug: string): Promise<SeoCollection> => {
    const response = await apiClient.get<SeoCollection>(
      `/seo/collections/${encodeURIComponent(slug)}`,
    );
    return response.data;
  },

  getCollections: async (): Promise<SeoCollection[]> => {
    const response = await apiClient.get<SeoCollection[]>("/seo/collections");
    return response.data;
  },

  getTagTiles: async (categoryId?: string): Promise<SeoTagTile[]> => {
    const response = await apiClient.get<SeoTagTile[]>("/seo/tag-tiles", {
      params: categoryId ? { categoryId } : undefined,
    });
    return response.data;
  },
};
