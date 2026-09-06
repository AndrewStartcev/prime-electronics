import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  brandsApi,
  PaginationParams,
  CreateBrandDto,
  UpdateBrandDto,
} from "../api";

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...brandKeys.lists(), params] as const,
  active: () => [...brandKeys.all, "active"] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

export function useBrands(params?: PaginationParams) {
  return useQuery({
    queryKey: brandKeys.list(params || {}),
    queryFn: () => brandsApi.getAll(params),
  });
}

export function useActiveBrands() {
  return useQuery({
    queryKey: brandKeys.active(),
    queryFn: () => brandsApi.getActive(),
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => brandsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.active() });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      brandsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.active() });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.active() });
    },
  });
}
