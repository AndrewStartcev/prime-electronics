import { apiClient } from "./apiClient";

export interface CategoryChild {
  id: string;
  title: string;
  slug: string;
  image: string | null;
}

export interface CategoryResponse {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  image: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
  sortOrder: number;
  isMain: boolean;
  mainSortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent: { id: string; title: string; slug: string } | null;
  children: CategoryChild[];
  productCount?: number;
  _count: { products: number; children?: number };
}

export interface CategoriesListResponse {
  data: CategoryResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryTreeItem extends CategoryResponse {
  children: CategoryTreeItem[];
}

export const categoryApi = {
  /**
   * Get all categories with pagination
   */
  getAll: async (page = 1, limit = 50): Promise<CategoriesListResponse> => {
    const response = await apiClient.get<CategoriesListResponse>(
      `/categories?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get category tree (hierarchical structure)
   */
  getTree: async (): Promise<CategoryTreeItem[]> => {
    const response = await apiClient.get<CategoryTreeItem[]>(
      "/categories/tree"
    );
    return response.data;
  },

  /**
   * Get categories selected for the main category grid
   */
  getMain: async (): Promise<CategoryTreeItem[]> => {
    const response = await apiClient.get<CategoryTreeItem[]>(
      "/categories/main"
    );
    return response.data;
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(
      `/categories/slug/${slug}`
    );
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },
};
