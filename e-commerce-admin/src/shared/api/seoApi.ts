import { apiClient } from "./client";

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
  _count?: { tagTiles: number };
}

export interface UpsertSeoCollectionDto {
  name: string;
  slug: string;
  categoryId?: string | null;
  brandIds?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
  isOnSale?: boolean;
  attributes?: Record<string, string[]>;
  sortBy?: SeoCollectionSortBy | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive?: boolean;
  sortOrder?: number;
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

export interface UpsertSeoTagTileDto {
  title: string;
  image?: string | null;
  categoryId?: string | null;
  collectionId?: string | null;
  url?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateSeoTemplateDto = Pick<
  SeoTemplate,
  "titleTemplate" | "descriptionTemplate" | "h1Template"
>;

export type UpdateStaticPageSeoDto = Pick<
  StaticPageSeo,
  "path" | "name" | "title" | "seoTitle" | "seoDescription" | "seoH1" | "isActive"
>;

export const seoApi = {
  getRobots: async (): Promise<{ content: string }> => {
    const response = await apiClient.get("/seo/robots");
    return response.data;
  },

  updateRobots: async (content: string): Promise<{ content: string }> => {
    const response = await apiClient.patch("/seo/robots", { content });
    return response.data;
  },
  getTemplates: async (): Promise<SeoTemplate[]> => {
    const response = await apiClient.get("/seo/templates");
    return response.data;
  },

  updateTemplate: async (
    type: SeoPageType,
    data: UpdateSeoTemplateDto,
  ): Promise<SeoTemplate> => {
    const response = await apiClient.patch(`/seo/templates/${type}`, data);
    return response.data;
  },

  getStaticPages: async (): Promise<StaticPageSeo[]> => {
    const response = await apiClient.get("/seo/static-pages");
    return response.data;
  },

  updateStaticPage: async (
    data: UpdateStaticPageSeoDto,
  ): Promise<StaticPageSeo> => {
    const response = await apiClient.patch("/seo/static-pages", data);
    return response.data;
  },

  getCollections: async (): Promise<SeoCollection[]> => {
    const response = await apiClient.get("/seo/admin/collections");
    return response.data;
  },

  createCollection: async (
    data: UpsertSeoCollectionDto,
  ): Promise<SeoCollection> => {
    const response = await apiClient.post("/seo/admin/collections", data);
    return response.data;
  },

  updateCollection: async (
    id: string,
    data: UpsertSeoCollectionDto,
  ): Promise<SeoCollection> => {
    const response = await apiClient.patch(`/seo/admin/collections/${id}`, data);
    return response.data;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await apiClient.delete(`/seo/admin/collections/${id}`);
  },

  getTagTiles: async (): Promise<SeoTagTile[]> => {
    const response = await apiClient.get("/seo/admin/tag-tiles");
    return response.data;
  },

  createTagTile: async (data: UpsertSeoTagTileDto): Promise<SeoTagTile> => {
    const response = await apiClient.post("/seo/admin/tag-tiles", data);
    return response.data;
  },

  updateTagTile: async (
    id: string,
    data: UpsertSeoTagTileDto,
  ): Promise<SeoTagTile> => {
    const response = await apiClient.patch(`/seo/admin/tag-tiles/${id}`, data);
    return response.data;
  },

  deleteTagTile: async (id: string): Promise<void> => {
    await apiClient.delete(`/seo/admin/tag-tiles/${id}`);
  },
};
