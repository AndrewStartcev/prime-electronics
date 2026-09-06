import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoriesApi,
  PaginationParams,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../api";
import type { ReorderCategoriesDto } from "../api/categoriesApi";
import type { ReorderMainCategoriesDto } from "../api/categoriesApi";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...categoryKeys.lists(), params] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: categoryKeys.list(params || {}),
    queryFn: () => categoriesApi.getAll(params),
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoriesApi.getTree(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderCategoriesDto["items"]) =>
      categoriesApi.reorder({ items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
    },
  });
}

export function useReorderMainCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderMainCategoriesDto["items"]) =>
      categoriesApi.reorderMain({ items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
    },
  });
}
