import { apiClient } from "./apiClient";

export interface PickupPoint {
  id: string;
  title: string;
  address: string;
  city: string;
  coords: {
    lat: number;
    lng: number;
  };
  phone: string | null;
  workingHours: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupPointsResponse {
  data: PickupPoint[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const pickupPointApi = {
  // Get all pickup points
  getAll: async (page = 1, limit = 100): Promise<PickupPointsResponse> => {
    const response = await apiClient.get<PickupPointsResponse>(
      `/pickup-points?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  // Get pickup point by ID
  getById: async (id: string): Promise<PickupPoint> => {
    const response = await apiClient.get<PickupPoint>(`/pickup-points/${id}`);
    return response.data;
  },
};
