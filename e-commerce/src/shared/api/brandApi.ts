import { apiClient } from "./apiClient";

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface BrandsListResponse {
  data: BrandResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const brandApi = {
  /**
   * Get all brands with pagination
   */
  getAll: async (page = 1, limit = 50): Promise<BrandsListResponse> => {
    const response = await apiClient.get<BrandsListResponse>(
      `/brands?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get active brands (for filters)
   */
  getActive: async (): Promise<BrandResponse[]> => {
    const response = await apiClient.get<BrandResponse[]>("/brands/active");
    return response.data;
  },

  /**
   * Get brand by ID
   */
  getById: async (id: string): Promise<BrandResponse> => {
    const response = await apiClient.get<BrandResponse>(`/brands/${id}`);
    return response.data;
  },
};
