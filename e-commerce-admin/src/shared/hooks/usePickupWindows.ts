import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface PickupWindow {
  id: string;
  pointId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reserved: number;
  createdAt: string;
  updatedAt: string;
  pickupPoint: {
    id: string;
    name: string;
    address: string;
  };
}

export interface AvailableWindow {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reserved: number;
  available: number;
  isFull: boolean;
}

export interface PickupWindowsResponse {
  data: PickupWindow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePickupWindowDto {
  pointId: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface UpdatePickupWindowDto {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  reserved?: number;
}

export function usePickupWindows(params?: {
  pointId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PickupWindowsResponse>({
    queryKey: ["pickup-windows", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.pointId) searchParams.append("pointId", params.pointId);
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);
      if (params?.page) searchParams.append("page", String(params.page));
      if (params?.limit) searchParams.append("limit", String(params.limit));

      const { data } = await apiClient.get<PickupWindowsResponse>(
        `/pickup-windows?${searchParams}`
      );
      return data;
    },
  });
}

export function usePickupWindow(id: string) {
  return useQuery<PickupWindow>({
    queryKey: ["pickup-windows", id],
    queryFn: async () => {
      const { data } = await apiClient.get<PickupWindow>(
        `/pickup-windows/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useAvailableWindows(
  pointId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery<AvailableWindow[]>({
    queryKey: ["pickup-windows", "available", pointId, startDate, endDate],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.append("startDate", startDate);
      if (endDate) searchParams.append("endDate", endDate);

      const { data } = await apiClient.get<AvailableWindow[]>(
        `/pickup-windows/available/${pointId}?${searchParams}`
      );
      return data;
    },
    enabled: !!pointId,
  });
}

export function useCreatePickupWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePickupWindowDto) => {
      const { data } = await apiClient.post("/pickup-windows", dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickup-windows"] });
    },
  });
}

export function useUpdatePickupWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdatePickupWindowDto;
    }) => {
      const { data } = await apiClient.patch(`/pickup-windows/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickup-windows"] });
    },
  });
}

export function useDeletePickupWindow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/pickup-windows/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pickup-windows"] });
    },
  });
}
