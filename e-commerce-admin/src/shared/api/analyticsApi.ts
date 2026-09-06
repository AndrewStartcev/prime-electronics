import { apiClient } from "./client";
import type {
  RevenueTrendResponse,
  OrderStatusResponse,
  PaymentMethodsResponse,
  DeliveryMethodsResponse,
  TopProduct,
  TopCategory,
  OrderHeatmapResponse,
  PeriodAnalytics,
  AnalyticsOverview,
} from "../types/analytics";

export const analyticsApi = {
  async getRevenueTrend(days: number = 30): Promise<RevenueTrendResponse> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/revenue-trend",
      {
        params: { days },
      },
    );
    return response.data;
  },

  async getOrderStatus(): Promise<OrderStatusResponse> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/order-status",
    );
    return response.data;
  },

  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/payment-methods",
    );
    return response.data;
  },

  async getDeliveryMethods(): Promise<DeliveryMethodsResponse> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/delivery-methods",
    );
    return response.data;
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/top-products",
      {
        params: { limit },
      },
    );
    return response.data;
  },

  async getTopCategories(limit: number = 10): Promise<TopCategory[]> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/top-categories",
      {
        params: { limit },
      },
    );
    return response.data;
  },

  async getOrderHeatmap(): Promise<OrderHeatmapResponse> {
    const response = await apiClient.get(
      "/admin/dashboard/analytics/order-heatmap",
    );
    return response.data;
  },

  async getPeriodComparison(
    period: "day" | "week" | "month" = "month",
  ): Promise<PeriodAnalytics> {
    const response = await apiClient.get("/admin/dashboard/analytics/period", {
      params: { period },
    });
    return response.data;
  },

  async getOverview(): Promise<AnalyticsOverview> {
    const response = await apiClient.get("/admin/dashboard/analytics/overview");
    return response.data;
  },
};
