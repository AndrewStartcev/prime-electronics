import { apiClient } from "./client";

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city?: string;
  workingHours?: string;
  workingSchedule?: Record<string, string>;
  phone?: string;
  coords?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStock {
  id: string;
  productId: string;
  pointId: string;
  sku?: string;
  stockCount?: number;
  quantity?: number;
  product?: {
    id: string;
    name?: string;
    title?: string;
    images?: string[];
  };
  pickupPoint?: PickupPoint;
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

export interface CreatePickupPointDto {
  name: string;
  address: string;
  coords: string; // "lat,lng" format
  workingSchedule: Record<string, { from: string; to: string }>; // {"Пн": {"from": "09:00", "to": "18:00"}, ...}
  url?: string;
  isActive?: boolean;
}

export interface UpdatePickupPointDto extends Partial<CreatePickupPointDto> {}

export interface CreateProductStockDto {
  productId: string;
  pointId: string;
  sku: string;
  stockCount?: number;
}

export interface UpdateProductStockDto {
  sku?: string;
  stockCount?: number;
}

export const pickupPointsApi = {
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<PickupPoint>> => {
    const response = await apiClient.get("/pickup-points", { params });
    return response.data;
  },

  getById: async (id: string): Promise<PickupPoint> => {
    const response = await apiClient.get(`/pickup-points/${id}`);
    return response.data;
  },

  create: async (data: CreatePickupPointDto): Promise<PickupPoint> => {
    const response = await apiClient.post("/pickup-points", data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePickupPointDto,
  ): Promise<PickupPoint> => {
    const response = await apiClient.patch(`/pickup-points/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pickup-points/${id}`);
  },

  // Stock management
  createStock: async (data: CreateProductStockDto): Promise<ProductStock> => {
    const response = await apiClient.post("/pickup-points/stock", data);
    return response.data;
  },

  updateStock: async (
    productId: string,
    pointId: string,
    data: UpdateProductStockDto,
  ): Promise<ProductStock> => {
    const response = await apiClient.patch(
      `/pickup-points/stock/${productId}/${pointId}`,
      data,
    );
    return response.data;
  },

  deleteStock: async (productId: string, pointId: string): Promise<void> => {
    await apiClient.delete(`/pickup-points/stock/${productId}/${pointId}`);
  },

  getStockByPickupPoint: async (
    pickupPointId: string,
  ): Promise<ProductStock[]> => {
    const response = await apiClient.get(
      `/pickup-points/${pickupPointId}/stock`,
    );
    return response.data;
  },

  getStockByProduct: async (productId: string): Promise<ProductStock[]> => {
    const response = await apiClient.get(
      `/pickup-points/stock/product/${productId}`,
    );
    return response.data;
  },
};
