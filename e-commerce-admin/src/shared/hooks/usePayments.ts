import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentsApi,
  Payment,
  PaymentFilters,
  PaymentStats,
  UpdatePaymentStatusDto,
} from "../api/paymentsApi";
import { toast } from "sonner";

// Query keys
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (filters?: PaymentFilters) =>
    [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  byOrder: (orderId: number) => [...paymentKeys.all, "order", orderId] as const,
  stats: () => [...paymentKeys.all, "stats"] as const,
};

// Hook to get all payments with filters
export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => paymentsApi.getAll(filters),
  });
}

// Hook to get payment by ID
export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
  });
}

// Hook to get payment by order ID
export function usePaymentByOrder(orderId: number) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentsApi.getByOrderId(orderId),
    enabled: !!orderId,
  });
}

// Hook to get payment statistics
export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: () => paymentsApi.getStats(),
  });
}

// Hook to update payment status (for marking CASH payments as completed)
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: number;
      data: UpdatePaymentStatusDto;
    }) => paymentsApi.updateStatus(orderId, data),
    onSuccess: (updatedPayment) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Update specific payment cache
      queryClient.setQueryData(
        paymentKeys.byOrder(updatedPayment.orderId),
        updatedPayment,
      );

      toast.success("Статус оплаты успешно обновлен");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Ошибка при обновлении статуса оплаты";
      toast.error(message);
    },
  });
}
