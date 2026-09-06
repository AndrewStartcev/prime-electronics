import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, OrderFilter, UpdateOrderStatusDto } from "../api";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filter: OrderFilter) => [...orderKeys.lists(), filter] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

export function useOrders(filter?: OrderFilter) {
  return useQuery({
    queryKey: orderKeys.list(filter || {}),
    queryFn: () => ordersApi.getAll(filter),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => ordersApi.getStats(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusDto }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}
