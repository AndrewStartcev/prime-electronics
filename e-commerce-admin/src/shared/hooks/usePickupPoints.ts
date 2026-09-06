import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pickupPointsApi,
  PaginationParams,
  CreatePickupPointDto,
  UpdatePickupPointDto,
  CreateProductStockDto,
  UpdateProductStockDto,
} from "../api";

export const pickupPointKeys = {
  all: ["pickupPoints"] as const,
  lists: () => [...pickupPointKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...pickupPointKeys.lists(), params] as const,
  details: () => [...pickupPointKeys.all, "detail"] as const,
  detail: (id: string) => [...pickupPointKeys.details(), id] as const,
  stock: (pickupPointId: string) =>
    [...pickupPointKeys.all, "stock", pickupPointId] as const,
  productStock: (productId: string) =>
    [...pickupPointKeys.all, "productStock", productId] as const,
};

export function usePickupPoints(params?: PaginationParams) {
  return useQuery({
    queryKey: pickupPointKeys.list(params || {}),
    queryFn: () => pickupPointsApi.getAll(params),
  });
}

export function usePickupPoint(id: string) {
  return useQuery({
    queryKey: pickupPointKeys.detail(id),
    queryFn: () => pickupPointsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePickupPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePickupPointDto) => pickupPointsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.lists() });
    },
  });
}

export function useUpdatePickupPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePickupPointDto }) =>
      pickupPointsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.detail(id) });
    },
  });
}

export function useDeletePickupPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pickupPointsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointKeys.lists() });
    },
  });
}

// Stock hooks
export function usePickupPointStock(pickupPointId: string) {
  return useQuery({
    queryKey: pickupPointKeys.stock(pickupPointId),
    queryFn: () => pickupPointsApi.getStockByPickupPoint(pickupPointId),
    enabled: !!pickupPointId,
  });
}

export function useProductStock(productId: string) {
  return useQuery({
    queryKey: pickupPointKeys.productStock(productId),
    queryFn: () => pickupPointsApi.getStockByProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductStockDto) =>
      pickupPointsApi.createStock(data),
    onSuccess: (_, { pointId, productId }) => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.stock(pointId),
      });
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.productStock(productId),
      });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      pointId,
      data,
    }: {
      productId: string;
      pointId: string;
      data: UpdateProductStockDto;
    }) => pickupPointsApi.updateStock(productId, pointId, data),
    onSuccess: (_, { productId, pointId }) => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.productStock(productId),
      });
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.stock(pointId),
      });
    },
  });
}

export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      pointId,
    }: {
      productId: string;
      pointId: string;
    }) => pickupPointsApi.deleteStock(productId, pointId),
    onSuccess: (_, { productId, pointId }) => {
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.productStock(productId),
      });
      queryClient.invalidateQueries({
        queryKey: pickupPointKeys.stock(pointId),
      });
    },
  });
}
