import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../api";

export const statsKeys = {
  all: ["stats"] as const,
  dashboard: () => [...statsKeys.all, "dashboard"] as const,
  revenue: (startDate: string, endDate: string) =>
    [...statsKeys.all, "revenue", startDate, endDate] as const,
  topProducts: (limit?: number) =>
    [...statsKeys.all, "topProducts", limit] as const,
  ordersByStatus: () => [...statsKeys.all, "ordersByStatus"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: () => statsApi.getDashboard(),
  });
}

export function useRevenueByPeriod(startDate: string, endDate: string) {
  return useQuery({
    queryKey: statsKeys.revenue(startDate, endDate),
    queryFn: () => statsApi.getRevenueByPeriod(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useTopProducts(limit?: number) {
  return useQuery({
    queryKey: statsKeys.topProducts(limit),
    queryFn: () => statsApi.getTopProducts(limit),
  });
}

export function useOrdersByStatus() {
  return useQuery({
    queryKey: statsKeys.ordersByStatus(),
    queryFn: () => statsApi.getOrdersByStatus(),
  });
}
