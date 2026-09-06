import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  couponsApi,
  PaginationParams,
  CreateCouponDto,
  UpdateCouponDto,
} from "../api";

export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...couponKeys.lists(), params] as const,
  active: () => [...couponKeys.all, "active"] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
};

export function useCoupons(params?: PaginationParams) {
  return useQuery({
    queryKey: couponKeys.list(params || {}),
    queryFn: () => couponsApi.getAll(params),
  });
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: couponKeys.active(),
    queryFn: () => couponsApi.getActive(),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponDto) => couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.active() });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) =>
      couponsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.active() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(id) });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.active() });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (code: string) => couponsApi.validate(code),
  });
}
