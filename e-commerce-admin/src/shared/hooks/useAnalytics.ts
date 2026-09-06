import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analyticsApi";

export const analyticsKeys = {
  all: ["analytics"] as const,
  revenueTrend: (days: number) =>
    [...analyticsKeys.all, "revenue-trend", days] as const,
  orderStatus: () => [...analyticsKeys.all, "order-status"] as const,
  paymentMethods: () => [...analyticsKeys.all, "payment-methods"] as const,
  deliveryMethods: () => [...analyticsKeys.all, "delivery-methods"] as const,
  topProducts: (limit: number) =>
    [...analyticsKeys.all, "top-products", limit] as const,
  topCategories: (limit: number) =>
    [...analyticsKeys.all, "top-categories", limit] as const,
  orderHeatmap: () => [...analyticsKeys.all, "order-heatmap"] as const,
  periodComparison: (period: string) =>
    [...analyticsKeys.all, "period", period] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
};

export function useRevenueTrend(days: number = 30) {
  return useQuery({
    queryKey: analyticsKeys.revenueTrend(days),
    queryFn: () => analyticsApi.getRevenueTrend(days),
  });
}

export function useOrderStatus() {
  return useQuery({
    queryKey: analyticsKeys.orderStatus(),
    queryFn: () => analyticsApi.getOrderStatus(),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: analyticsKeys.paymentMethods(),
    queryFn: () => analyticsApi.getPaymentMethods(),
  });
}

export function useDeliveryMethods() {
  return useQuery({
    queryKey: analyticsKeys.deliveryMethods(),
    queryFn: () => analyticsApi.getDeliveryMethods(),
  });
}

export function useAnalyticsTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: analyticsKeys.topProducts(limit),
    queryFn: () => analyticsApi.getTopProducts(limit),
  });
}

export function useAnalyticsTopCategories(limit: number = 10) {
  return useQuery({
    queryKey: analyticsKeys.topCategories(limit),
    queryFn: () => analyticsApi.getTopCategories(limit),
  });
}

export function useOrderHeatmap() {
  return useQuery({
    queryKey: analyticsKeys.orderHeatmap(),
    queryFn: () => analyticsApi.getOrderHeatmap(),
  });
}

export function usePeriodComparison(
  period: "day" | "week" | "month" = "month",
) {
  return useQuery({
    queryKey: analyticsKeys.periodComparison(period),
    queryFn: () => analyticsApi.getPeriodComparison(period),
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => analyticsApi.getOverview(),
  });
}
