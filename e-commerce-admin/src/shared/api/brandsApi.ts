import { apiClient } from "./client";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

export interface CreateBrandDto {
  name: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {}

export const brandsApi = {
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Brand>> => {
    const response = await apiClient.get("/brands", { params });
    return response.data;
  },

  getActive: async (): Promise<Brand[]> => {
    const response = await apiClient.get("/brands/active");
    return response.data;
  },

  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  },

  create: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await apiClient.post("/brands", data);
    return response.data;
  },

  update: async (id: string, data: UpdateBrandDto): Promise<Brand> => {
    const response = await apiClient.patch(`/brands/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },

  getDeleted: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Brand>> => {
    const response = await apiClient.get("/brands/deleted/list", { params });
    return response.data;
  },

  restore: async (id: string): Promise<Brand> => {
    const response = await apiClient.post(`/brands/${id}/restore`);
    return response.data;
  },
};
