import { useQuery } from "@tanstack/react-query";
import {
  categoryApi,
  type CategoriesListResponse,
  type CategoryResponse,
  type CategoryTreeItem,
} from "@/shared/api";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (page: number, limit: number) =>
    [...categoryKeys.lists(), { page, limit }] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  main: () => [...categoryKeys.all, "main"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

export function useCategories(page = 1, limit = 50) {
  return useQuery<CategoriesListResponse>({
    queryKey: categoryKeys.list(page, limit),
    queryFn: () => categoryApi.getAll(page, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

type UseCategoryTreeOptions = {
  enabled?: boolean;
  initialData?: CategoryTreeItem[];
};

export function useCategoryTree(options: UseCategoryTreeOptions = {}) {
  const hasInitialData = Array.isArray(options.initialData);

  return useQuery<CategoryTreeItem[]>({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryApi.getTree(),
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    initialDataUpdatedAt: hasInitialData ? 0 : undefined,
    staleTime: hasInitialData ? 0 : 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: hasInitialData ? "always" : false,
  });
}

export function useMainCategories(options: UseCategoryTreeOptions = {}) {
  const hasInitialData = Array.isArray(options.initialData);

  return useQuery<CategoryTreeItem[]>({
    queryKey: categoryKeys.main(),
    queryFn: () => categoryApi.getMain(),
    enabled: options.enabled ?? true,
    initialData: options.initialData,
    initialDataUpdatedAt: hasInitialData ? 0 : undefined,
    staleTime: hasInitialData ? 0 : 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: hasInitialData ? "always" : false,
  });
}

export function useCategoryBySlug(slug: string, initialData?: CategoryResponse) {
  return useQuery<CategoryResponse>({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => categoryApi.getBySlug(slug),
    enabled: !!slug,
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
