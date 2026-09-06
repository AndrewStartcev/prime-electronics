import { apiClient } from "./client";

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  filterAttributes?: string[];
  parentId?: string;
  isActive: boolean;
  sortOrder?: number;
  isMain: boolean;
  mainSortOrder?: number;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

export interface CreateCategoryDto {
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoH1?: string;
  filterAttributes?: string[];
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  isMain?: boolean;
  mainSortOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface ReorderCategoriesDto {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}

export interface ReorderMainCategoriesDto {
  items: Array<{
    id: string;
    mainSortOrder: number;
  }>;
}

export const categoriesApi = {
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get("/categories", { params });
    return response.data;
  },

  getTree: async (): Promise<CategoryTree[]> => {
    const response = await apiClient.get("/categories/tree");
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  reorder: async (data: ReorderCategoriesDto): Promise<{ updated: number }> => {
    const response = await apiClient.patch("/categories/reorder", data);
    return response.data;
  },

  reorderMain: async (
    data: ReorderMainCategoriesDto
  ): Promise<{ updated: number }> => {
    const response = await apiClient.patch("/categories/reorder-main", data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  getDeleted: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get("/categories/deleted/list", { params });
    return response.data;
  },

  restore: async (id: string): Promise<Category> => {
    const response = await apiClient.post(`/categories/${id}/restore`);
    return response.data;
  },
};
