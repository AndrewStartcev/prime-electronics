import { apiClient } from "./client";

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersToday: number;
  revenueToday: number;
  newUsersToday: number;
  pendingOrders: number;
}

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  images: string[];
  totalSold: number;
  revenue: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export const statsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/admin/stats/dashboard");
    return response.data;
  },

  getRevenueByPeriod: async (
    startDate: string,
    endDate: string
  ): Promise<RevenueByPeriod[]> => {
    const response = await apiClient.get("/admin/stats/revenue", {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTopProducts: async (limit?: number): Promise<TopProduct[]> => {
    const response = await apiClient.get("/admin/stats/top-products", {
      params: { limit },
    });
    return response.data;
  },

  getOrdersByStatus: async (): Promise<OrdersByStatus[]> => {
    const response = await apiClient.get("/admin/stats/orders-by-status");
    return response.data;
  },
};
