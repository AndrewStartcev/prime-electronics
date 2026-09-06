import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, brandsApi, categoriesApi, couponsApi } from "../api";

const deletedKeys = {
  products: ["deleted", "products"] as const,
  brands: ["deleted", "brands"] as const,
  categories: ["deleted", "categories"] as const,
  coupons: ["deleted", "coupons"] as const,
};

// Products
export function useDeletedProducts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...deletedKeys.products, params],
    queryFn: () => productsApi.getDeleted(params),
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedKeys.products });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Brands
export function useDeletedBrands(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...deletedKeys.brands, params],
    queryFn: () => brandsApi.getDeleted(params),
  });
}

export function useRestoreBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedKeys.brands });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

// Categories
export function useDeletedCategories(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...deletedKeys.categories, params],
    queryFn: () => categoriesApi.getDeleted(params),
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedKeys.categories });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Coupons
export function useDeletedCoupons(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...deletedKeys.coupons, params],
    queryFn: () => couponsApi.getDeleted(params),
  });
}

export function useRestoreCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deletedKeys.coupons });
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}
