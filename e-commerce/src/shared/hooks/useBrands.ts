import { useQuery } from "@tanstack/react-query";
import {
  brandApi,
  type BrandsListResponse,
  type BrandResponse,
} from "@/shared/api";

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (page: number, limit: number) =>
    [...brandKeys.lists(), { page, limit }] as const,
  active: () => [...brandKeys.all, "active"] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

type UseBrandsOptions = {
  enabled?: boolean;
  initialData?: BrandsListResponse;
};

export function useBrands(
  page = 1,
  limit = 50,
  options: UseBrandsOptions = {},
) {
  return useQuery<BrandsListResponse>({
    queryKey: brandKeys.list(page, limit),
    queryFn: () => brandApi.getAll(page, limit),
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes - brands change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useActiveBrands() {
  return useQuery<BrandResponse[]>({
    queryKey: brandKeys.active(),
    queryFn: () => brandApi.getActive(),
    staleTime: 15 * 60 * 1000, // 15 minutes - active brands change rarely
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useBrandById(id: string) {
  return useQuery<BrandResponse>({
    queryKey: brandKeys.detail(id),
    queryFn: () => brandApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
