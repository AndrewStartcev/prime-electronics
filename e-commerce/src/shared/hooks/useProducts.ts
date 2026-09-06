import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  productApi,
  type ProductsListResponse,
  type ProductDetailResponse,
  type ProductFilters,
  type FiltersResponse,
} from "@/shared/api";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  filters: (categoryId?: string, brandIds?: string[], brandSlug?: string) =>
    [...productKeys.all, "filters", categoryId, brandIds, brandSlug] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  detailBySlug: (slug: string) =>
    [...productKeys.details(), "slug", slug] as const,
};

export function useProducts(
  filters: ProductFilters = {},
  initialData?: ProductsListResponse,
) {
  return useQuery<ProductsListResponse>({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getAll(filters),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProductsInfinite(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list({
      ...filters,
      infinite: true,
    } as ProductFilters),
    queryFn: ({ pageParam = 1 }) =>
      productApi.getAll({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasNext) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProductFilters(
  categoryId?: string,
  brandIds?: string[],
  brandSlug?: string,
) {
  return useQuery<FiltersResponse>({
    queryKey: productKeys.filters(categoryId, brandIds, brandSlug),
    queryFn: () => productApi.getFilters(categoryId, brandIds, brandSlug),
    staleTime: 10 * 60 * 1000, // 10 minutes - filters change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery<ProductDetailResponse>({
    queryKey: productKeys.detailBySlug(slug),
    queryFn: () => productApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useProductById(
  id: string,
  initialData?: ProductDetailResponse,
) {
  return useQuery<ProductDetailResponse>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      if (!UUID_PATTERN.test(id)) {
        return productApi.getBySlug(id);
      }

      try {
        return await productApi.getById(id);
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status === 404) {
          return productApi.getBySlug(id);
        }
        throw error;
      }
    },
    enabled: !!id,
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
