import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  ProductFilter,
  CreateProductDto,
  UpdateProductDto,
} from "../api";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filter: ProductFilter) => [...productKeys.lists(), filter] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  filters: (categoryId?: string) =>
    [...productKeys.all, "filters", categoryId] as const,
  variantGroups: (search?: string) =>
    [...productKeys.all, "variant-groups", search || ""] as const,
  variantGroup: (id?: string) =>
    [...productKeys.all, "variant-group", id || ""] as const,
};

interface UseProductsOptions {
  enabled?: boolean;
}

export function useProducts(filter?: ProductFilter, options?: UseProductsOptions) {
  return useQuery({
    queryKey: productKeys.list(filter || {}),
    queryFn: () => productsApi.getAll(filter),
    enabled: options?.enabled ?? true,
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

export function useProductFilters(categoryId?: string) {
  return useQuery({
    queryKey: productKeys.filters(categoryId),
    queryFn: () => productsApi.getFilters(categoryId),
  });
}

export function useProductVariantGroups(search?: string) {
  return useQuery({
    queryKey: productKeys.variantGroups(search),
    queryFn: () => productsApi.getVariantGroups({ search, limit: 50 }),
  });
}

export function useProductVariantGroup(
  id?: string,
  options?: UseProductsOptions,
) {
  return useQuery({
    queryKey: productKeys.variantGroup(id),
    queryFn: () => productsApi.getVariantGroup(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useCreateProductVariantGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => productsApi.createVariantGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProductVariantGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string };
    }) => productsApi.updateVariantGroup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.variantGroup(id) });
    },
  });
}

export function useDeleteProductVariantGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteVariantGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
